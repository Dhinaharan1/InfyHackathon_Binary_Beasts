import io
import base64
import edge_tts

VOICE_MAP = {
    "english": {
        ("female", "indian"): "en-IN-NeerjaNeural",
        ("male", "indian"): "en-IN-PrabhatNeural",
        ("female", "american"): "en-US-JennyNeural",
        ("male", "american"): "en-US-GuyNeural",
        ("female", "british"): "en-GB-SoniaNeural",
        ("male", "british"): "en-GB-RyanNeural",
    },
    "hindi": {
        ("female", "indian"): "hi-IN-SwaraNeural",
        ("male", "indian"): "hi-IN-MadhurNeural",
        ("female", "american"): "hi-IN-SwaraNeural",
        ("male", "american"): "hi-IN-MadhurNeural",
        ("female", "british"): "hi-IN-SwaraNeural",
        ("male", "british"): "hi-IN-MadhurNeural",
    },
    "tamil": {
        ("female", "indian"): "ta-IN-PallaviNeural",
        ("male", "indian"): "ta-IN-ValluvarNeural",
        ("female", "american"): "ta-IN-PallaviNeural",
        ("male", "american"): "ta-IN-ValluvarNeural",
        ("female", "british"): "ta-IN-PallaviNeural",
        ("male", "british"): "ta-IN-ValluvarNeural",
    },
    "spanish": {
        ("female", "indian"): "es-MX-DaliaNeural",
        ("male", "indian"): "es-MX-JorgeNeural",
        ("female", "american"): "es-MX-DaliaNeural",
        ("male", "american"): "es-MX-JorgeNeural",
        ("female", "british"): "es-ES-ElviraNeural",
        ("male", "british"): "es-ES-AlvaroNeural",
    },
    "french": {
        ("female", "indian"): "fr-FR-DeniseNeural",
        ("male", "indian"): "fr-FR-HenriNeural",
        ("female", "american"): "fr-FR-DeniseNeural",
        ("male", "american"): "fr-FR-HenriNeural",
        ("female", "british"): "fr-FR-DeniseNeural",
        ("male", "british"): "fr-FR-HenriNeural",
    },
    "german": {
        ("female", "indian"): "de-DE-KatjaNeural",
        ("male", "indian"): "de-DE-ConradNeural",
        ("female", "american"): "de-DE-KatjaNeural",
        ("male", "american"): "de-DE-ConradNeural",
        ("female", "british"): "de-DE-KatjaNeural",
        ("male", "british"): "de-DE-ConradNeural",
    },
    "japanese": {
        ("female", "indian"): "ja-JP-NanamiNeural",
        ("male", "indian"): "ja-JP-KeitaNeural",
        ("female", "american"): "ja-JP-NanamiNeural",
        ("male", "american"): "ja-JP-KeitaNeural",
        ("female", "british"): "ja-JP-NanamiNeural",
        ("male", "british"): "ja-JP-KeitaNeural",
    },
    "korean": {
        ("female", "indian"): "ko-KR-SunHiNeural",
        ("male", "indian"): "ko-KR-InJoonNeural",
        ("female", "american"): "ko-KR-SunHiNeural",
        ("male", "american"): "ko-KR-InJoonNeural",
        ("female", "british"): "ko-KR-SunHiNeural",
        ("male", "british"): "ko-KR-InJoonNeural",
    },
    "chinese": {
        ("female", "indian"): "zh-CN-XiaoxiaoNeural",
        ("male", "indian"): "zh-CN-YunxiNeural",
        ("female", "american"): "zh-CN-XiaoxiaoNeural",
        ("male", "american"): "zh-CN-YunxiNeural",
        ("female", "british"): "zh-CN-XiaoxiaoNeural",
        ("male", "british"): "zh-CN-YunxiNeural",
    },
    "portuguese": {
        ("female", "indian"): "pt-BR-FranciscaNeural",
        ("male", "indian"): "pt-BR-AntonioNeural",
        ("female", "american"): "pt-BR-FranciscaNeural",
        ("male", "american"): "pt-BR-AntonioNeural",
        ("female", "british"): "pt-BR-FranciscaNeural",
        ("male", "british"): "pt-BR-AntonioNeural",
    },
    "arabic": {
        ("female", "indian"): "ar-SA-ZariyahNeural",
        ("male", "indian"): "ar-SA-HamedNeural",
        ("female", "american"): "ar-SA-ZariyahNeural",
        ("male", "american"): "ar-SA-HamedNeural",
        ("female", "british"): "ar-SA-ZariyahNeural",
        ("male", "british"): "ar-SA-HamedNeural",
    },
    "russian": {
        ("female", "indian"): "ru-RU-SvetlanaNeural",
        ("male", "indian"): "ru-RU-DmitryNeural",
        ("female", "american"): "ru-RU-SvetlanaNeural",
        ("male", "american"): "ru-RU-DmitryNeural",
        ("female", "british"): "ru-RU-SvetlanaNeural",
        ("male", "british"): "ru-RU-DmitryNeural",
    },
}

VOICE_STYLES = {
    0: {"rate": "+0%", "pitch": "+0Hz"},
    1: {"rate": "+5%", "pitch": "-2Hz"},
    2: {"rate": "-3%", "pitch": "+3Hz"},
    3: {"rate": "+8%", "pitch": "-1Hz"},
    4: {"rate": "-5%", "pitch": "+5Hz"},
}


async def generate_speech(
    text: str, gender: str, accent: str, agent_index: int, language: str = "english"
) -> str:
    lang_voices = VOICE_MAP.get(language, VOICE_MAP["english"])
    voice = lang_voices.get((gender, accent))
    if not voice:
        voice = lang_voices.get((gender, "indian"))
    if not voice:
        voice = list(lang_voices.values())[agent_index % len(lang_voices)]

    style = VOICE_STYLES.get(agent_index % len(VOICE_STYLES), VOICE_STYLES[0])

    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=style["rate"],
        pitch=style["pitch"],
    )

    audio_buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    audio_bytes = audio_buffer.getvalue()
    return base64.b64encode(audio_bytes).decode("utf-8")
