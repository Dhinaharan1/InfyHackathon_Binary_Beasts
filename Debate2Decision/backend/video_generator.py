import asyncio
import base64
import httpx
from config import D_ID_API_KEY

D_ID_API_URL = "https://api.d-id.com"

# Session-level flag: once we get a 402, stop trying for the rest of this run
_credits_exhausted = False

VOICE_MAP = {
    ("female", "american"): "en-US-JennyNeural",
    ("male", "american"): "en-US-GuyNeural",
    ("female", "british"): "en-GB-SoniaNeural",
    ("male", "british"): "en-GB-RyanNeural",
    ("female", "indian"): "en-IN-NeerjaNeural",
    ("male", "indian"): "en-IN-PrabhatNeural",
}


def _get_headers(content_type: str = "application/json") -> dict:
    return {
        "Authorization": f"Basic {D_ID_API_KEY}",
        "Content-Type": content_type,
        "Accept": "application/json",
    }


async def _upload_image_to_did(data_uri: str) -> str | None:
    try:
        header, b64_data = data_uri.split(",", 1)
        mime = header.split(":")[1].split(";")[0]
        ext = "png" if "png" in mime else "jpg"
        image_bytes = base64.b64decode(b64_data)

        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                f"{D_ID_API_URL}/images",
                headers={
                    "Authorization": f"Basic {D_ID_API_KEY}",
                    "Accept": "application/json",
                },
                files={"image": (f"avatar.{ext}", image_bytes, mime)},
            )
            if r.status_code in (200, 201):
                url = r.json().get("url")
                print(f"D-ID image uploaded: {url[:80]}...")
                return url
            if r.status_code == 402:
                _mark_exhausted()
            print(f"D-ID image upload failed: {r.status_code} {r.text[:150]}")
    except Exception as e:
        print(f"D-ID image upload error: {type(e).__name__}: {e}")
    return None


def _mark_exhausted():
    global _credits_exhausted
    if not _credits_exhausted:
        _credits_exhausted = True
        print("D-ID credits exhausted -- disabling video generation for this session")


async def generate_talk_video(
    source_image: str,
    text: str,
    gender: str = "female",
    accent: str = "american",
) -> str | None:
    global _credits_exhausted

    if not D_ID_API_KEY or _credits_exhausted:
        return None

    if source_image.startswith("data:"):
        image_url = await _upload_image_to_did(source_image)
        if not image_url:
            return None
    else:
        image_url = source_image

    voice_id = VOICE_MAP.get((gender, accent), "en-US-JennyNeural")

    payload = {
        "source_url": image_url,
        "script": {
            "type": "text",
            "input": text[:500],
            "provider": {
                "type": "microsoft",
                "voice_id": voice_id,
            },
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                f"{D_ID_API_URL}/talks",
                headers=_get_headers(),
                json=payload,
            )
            if r.status_code == 402:
                _mark_exhausted()
                return None
            if r.status_code != 201:
                print(f"D-ID create talk failed: {r.status_code} {r.text[:150]}")
                return None

            talk_id = r.json()["id"]
            print(f"D-ID talk created: {talk_id}")

            for i in range(30):
                await asyncio.sleep(3)
                r2 = await client.get(
                    f"{D_ID_API_URL}/talks/{talk_id}",
                    headers=_get_headers(),
                )
                data = r2.json()
                status = data.get("status")
                print(f"  D-ID poll [{i*3}s]: {status}")

                if status == "done":
                    video_url = data.get("result_url")
                    print(f"D-ID video ready: {video_url[:80]}...")
                    return video_url
                elif status in ("error", "rejected"):
                    print(f"D-ID talk failed: {data}")
                    return None

            print("D-ID talk timed out after 90s")
    except Exception as e:
        print(f"D-ID error: {type(e).__name__}: {e}")

    return None


def is_video_enabled() -> bool:
    return bool(D_ID_API_KEY) and not _credits_exhausted
