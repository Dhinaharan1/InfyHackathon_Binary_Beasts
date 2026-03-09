import base64
import io
import asyncio
from urllib.parse import quote

import httpx
from config import HF_API_TOKEN, TOGETHER_API_KEY

TOGETHER_API_URL = "https://api.together.xyz/v1/images/generations"
HF_ROUTER_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
HF_SPACE_NAME = "multimodalart/FLUX.1-merged"

# Session-level failure flags — once a provider fails, skip it for all remaining agents
_hf_space_failed = False
_pollinations_failed = False
_together_failed = False
_hf_router_failed = False

ETHNICITY_MAP = {
    "indian": "Indian South Asian",
    "american": "American",
    "british": "British European",
}

AGE_KEYWORDS = {
    "director": "45",
    "principal": "55",
    "ceo": "50",
    "chief": "50",
    "head": "48",
    "manager": "38",
    "lead": "38",
    "senior": "42",
    "junior": "26",
}


def _build_prompt(agent) -> str:
    ethnicity = ETHNICITY_MAP.get(agent.accent, "professional")
    gender = "woman" if agent.gender == "female" else "man"
    hair = (
        "neat professional hair, wearing formal women's business blazer"
        if agent.gender == "female"
        else "short neat hair, wearing formal business suit and tie"
    )

    age = "35"
    role_lower = agent.role.lower()
    for keyword, age_val in AGE_KEYWORDS.items():
        if keyword in role_lower:
            age = age_val
            break

    return (
        f"professional corporate headshot portrait of a {ethnicity} {gender}, {age} years old, "
        f"{agent.role}, {hair}, "
        f"neutral confident expression, closed mouth, subtle professional smile, "
        f"sharp realistic face, natural skin texture, clear focused eyes, "
        f"soft studio lighting, plain neutral background, "
        f"semi-realistic professional illustration, high detail, "
        f"NOT cartoon, NOT anime, NOT 3D render, NOT Pixar, NOT fantasy"
    )


def _webp_to_png_b64(filepath: str) -> str | None:
    try:
        from PIL import Image
        img = Image.open(filepath)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"
    except Exception as e:
        print(f"Image conversion failed: {e}")
        return None


async def _generate_via_hf_space(prompt: str, seed: int) -> str | None:
    global _hf_space_failed
    if _hf_space_failed or not HF_API_TOKEN:
        return None
    try:
        from gradio_client import Client
        loop = asyncio.get_event_loop()
        client = Client(HF_SPACE_NAME, token=HF_API_TOKEN, verbose=False)
        result = await loop.run_in_executor(
            None,
            lambda: client.predict(
                prompt=prompt,
                seed=seed,
                randomize_seed=False,
                width=512,
                height=512,
                num_inference_steps=4,
                api_name="/infer",
            ),
        )
        filepath = result[0] if isinstance(result, tuple) else str(result)
        data_uri = _webp_to_png_b64(filepath)
        if data_uri:
            print(f"HF Space FLUX avatar generated (seed={seed})")
            return data_uri
    except Exception as e:
        print(f"HF Space failed (disabling for session): {type(e).__name__}: {e}")
        _hf_space_failed = True
    return None


async def _generate_via_pollinations(prompt: str, seed: int) -> str | None:
    global _pollinations_failed
    if _pollinations_failed:
        return None
    encoded = quote(prompt, safe="")
    url = f"https://image.pollinations.ai/prompt/{encoded}?width=512&height=512&seed={seed}&nologo=true&model=flux"
    try:
        async with httpx.AsyncClient(timeout=40.0, follow_redirects=True) as client:
            response = await client.get(url)
            ct = response.headers.get("content-type", "")
            if response.status_code == 200 and ct.startswith("image") and len(response.content) > 5000:
                mime = ct.split(";")[0].strip()
                b64 = base64.b64encode(response.content).decode("utf-8")
                print(f"Pollinations avatar generated (seed={seed})")
                return f"data:{mime};base64,{b64}"
            # Any non-200 (429 rate limit, 5xx, etc.) — disable for session
            print(f"Pollinations status {response.status_code} — disabling for session")
            _pollinations_failed = True
    except Exception as e:
        print(f"Pollinations failed (disabling for session): {e}")
        _pollinations_failed = True
    return None


async def _generate_via_together(prompt: str) -> str | None:
    global _together_failed
    if _together_failed or not TOGETHER_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(
                TOGETHER_API_URL,
                headers={"Authorization": f"Bearer {TOGETHER_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "black-forest-labs/FLUX.1-schnell-Free",
                    "prompt": prompt,
                    "width": 512,
                    "height": 512,
                    "steps": 4,
                    "n": 1,
                    "response_format": "b64_json",
                },
            )
            if response.status_code == 200:
                data = response.json()
                b64 = data["data"][0]["b64_json"]
                print("Together.ai FLUX avatar generated")
                return f"data:image/png;base64,{b64}"
            print(f"Together.ai status {response.status_code} — disabling for session")
            _together_failed = True
    except Exception as e:
        print(f"Together.ai failed (disabling for session): {e}")
        _together_failed = True
    return None


async def _generate_via_hf_router(prompt: str) -> str | None:
    global _hf_router_failed
    if _hf_router_failed or not HF_API_TOKEN:
        return None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                HF_ROUTER_URL,
                headers={"Authorization": f"Bearer {HF_API_TOKEN}"},
                json={"inputs": prompt},
            )
            ct = response.headers.get("content-type", "")
            if response.status_code == 200 and ct.startswith("image"):
                mime = "image/png" if "png" in ct else "image/jpeg"
                b64 = base64.b64encode(response.content).decode("utf-8")
                print("HF Router FLUX avatar generated")
                return f"data:{mime};base64,{b64}"
            print(f"HF Router status {response.status_code} — disabling for session")
            _hf_router_failed = True
    except Exception as e:
        print(f"HF Router failed (disabling for session): {e}")
        _hf_router_failed = True
    return None


async def _generate_via_dicebear(agent) -> str | None:
    """DiceBear 'notionists' — clean professional illustrated portrait, always works."""
    try:
        seed_str = quote(agent.name, safe="")
        bg_color = agent.avatar_color.lstrip("#")
        url = (
            f"https://api.dicebear.com/9.x/notionists/png"
            f"?seed={seed_str}&size=512&backgroundColor={bg_color}"
        )
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code == 200 and len(response.content) > 500:
                b64 = base64.b64encode(response.content).decode("utf-8")
                print(f"DiceBear notionists for {agent.name}")
                return f"data:image/png;base64,{b64}"
    except Exception as e:
        print(f"DiceBear failed: {e}")
    return None


async def generate_avatar(agent) -> str | None:
    prompt = _build_prompt(agent)
    seed = abs(hash(agent.name)) % 100000

    result = await _generate_via_hf_space(prompt, seed)
    if result:
        return result

    result = await _generate_via_pollinations(prompt, seed)
    if result:
        return result

    result = await _generate_via_together(prompt)
    if result:
        return result

    result = await _generate_via_hf_router(prompt)
    if result:
        return result

    return await _generate_via_dicebear(agent)


def _reset_session_flags():
    """Reset failure flags at the start of each debate session."""
    global _hf_space_failed, _pollinations_failed, _together_failed, _hf_router_failed
    _hf_space_failed = False
    _pollinations_failed = False
    _together_failed = False
    _hf_router_failed = False


async def generate_all_avatars(agents: list) -> list[str | None]:
    _reset_session_flags()
    results = []
    for i, agent in enumerate(agents):
        if i > 0:
            await asyncio.sleep(2)  # small stagger only; providers are skipped instantly once failed
        result = await generate_avatar(agent)
        results.append(result)
    success = sum(1 for r in results if r)
    print(f"Avatar generation: {success}/{len(agents)} succeeded")
    return results
