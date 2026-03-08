import base64
import io
import asyncio
from urllib.parse import quote
from functools import lru_cache

import httpx
from config import HF_API_TOKEN, TOGETHER_API_KEY

TOGETHER_API_URL = "https://api.together.xyz/v1/images/generations"
HF_ROUTER_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
HF_SPACE_NAME = "multimodalart/FLUX.1-merged"

ETHNICITY_MAP = {
    "indian": "Indian South Asian",
    "american": "American Caucasian",
    "british": "British European",
}

AGE_KEYWORDS = {
    "director": "45 years old",
    "principal": "55 years old senior",
    "ceo": "50 years old",
    "chief": "50 years old",
    "head": "48 years old",
    "manager": "35 years old",
    "lead": "38 years old",
    "senior": "42 years old",
}


def _build_prompt(agent) -> str:
    ethnicity = ETHNICITY_MAP.get(agent.accent, "professional")
    gender = "woman" if agent.gender == "female" else "man"

    age = "38 years old"
    role_lower = agent.role.lower()
    for keyword, age_desc in AGE_KEYWORDS.items():
        if keyword in role_lower:
            age = age_desc
            break

    return (
        f"3D Pixar Disney style character portrait bust shot of a professional {ethnicity} {gender}, "
        f"age {age}, {agent.role}, calm confident expression, closed mouth, subtle gentle smile, modern business attire, "
        f"soft diffused studio lighting, clean soft gradient background, "
        f"highly detailed 3D render, smooth skin, warm friendly eyes, "
        f"professional headshot composition, vibrant colors"
    )


def _webp_to_png_b64(filepath: str) -> str | None:
    """Convert a webp/png file to a base64 PNG data URI."""
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
    """Free FLUX.1-merged via HF Spaces Gradio API. Uses HF token for higher quota."""
    try:
        from gradio_client import Client
        loop = asyncio.get_event_loop()
        # Authenticate with HF token for higher ZeroGPU quota
        client = Client(
            HF_SPACE_NAME,
            token=HF_API_TOKEN if HF_API_TOKEN else None,
            verbose=False,
        )
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
        print(f"HF Space failed: {type(e).__name__}: {e}")
    return None


async def _generate_via_together(prompt: str) -> str | None:
    """Together.ai FLUX.1-schnell-Free."""
    if not TOGETHER_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                TOGETHER_API_URL,
                headers={
                    "Authorization": f"Bearer {TOGETHER_API_KEY}",
                    "Content-Type": "application/json",
                },
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
            print(f"Together.ai status {response.status_code}: {response.text[:150]}")
    except Exception as e:
        print(f"Together.ai failed: {e}")
    return None


async def _generate_via_hf_router(prompt: str) -> str | None:
    """HF Inference API via router (FLUX.1-schnell)."""
    if not HF_API_TOKEN:
        return None
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
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
            print(f"HF Router status {response.status_code}: {response.text[:150]}")
    except Exception as e:
        print(f"HF Router failed: {e}")
    return None


async def _generate_via_dicebear(agent) -> str | None:
    """DiceBear illustrated avatar as last resort."""
    try:
        seed = quote(agent.name, safe="")
        bg_color = agent.avatar_color.lstrip("#")
        url = (
            f"https://api.dicebear.com/9.x/adventurer/png"
            f"?seed={seed}&size=512&backgroundColor={bg_color}"
        )
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code == 200 and len(response.content) > 500:
                b64 = base64.b64encode(response.content).decode("utf-8")
                print(f"DiceBear adventurer fallback for {agent.name}")
                return f"data:image/png;base64,{b64}"
    except Exception as e:
        print(f"DiceBear failed: {e}")
    return None


async def generate_avatar(agent) -> str | None:
    prompt = _build_prompt(agent)
    seed = abs(hash(agent.name)) % 10000

    # Tier 1: Free HF Space (FLUX.1-merged, no API key needed)
    result = await _generate_via_hf_space(prompt, seed)
    if result:
        return result

    # Tier 2: Together.ai (requires API key with credits)
    result = await _generate_via_together(prompt)
    if result:
        return result

    # Tier 3: HF Router (requires token with inference permission)
    result = await _generate_via_hf_router(prompt)
    if result:
        return result

    # Tier 4: DiceBear illustrated avatar
    return await _generate_via_dicebear(agent)


async def generate_all_avatars(agents: list) -> list[str | None]:
    # Sequential to avoid HF Space rate limits (ZeroGPU quota)
    results = []
    for agent in agents:
        result = await generate_avatar(agent)
        results.append(result)
    success = sum(1 for r in results if r)
    print(f"Avatar generation: {success}/{len(agents)} succeeded")
    return results
