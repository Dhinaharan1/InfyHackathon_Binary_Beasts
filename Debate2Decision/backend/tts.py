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
    "telugu": {
        ("female", "indian"): "te-IN-ShrutiNeural",
        ("male", "indian"): "te-IN-MohanNeural",
    },
    "kannada": {
        ("female", "indian"): "kn-IN-SapnaNeural",
        ("male", "indian"): "kn-IN-GaganNeural",
    },
    "malayalam": {
        ("female", "indian"): "ml-IN-SobhanaNeural",
        ("male", "indian"): "ml-IN-MidhunNeural",
    },
    "bengali": {
        ("female", "indian"): "bn-IN-TanishaaNeural",
        ("male", "indian"): "bn-IN-BashkarNeural",
    },
    "marathi": {
        ("female", "indian"): "mr-IN-AarohiNeural",
        ("male", "indian"): "mr-IN-ManoharNeural",
    },
    "gujarati": {
        ("female", "indian"): "gu-IN-DhwaniNeural",
        ("male", "indian"): "gu-IN-NiranjanNeural",
    },
    "spanish": {
        ("female", "american"): "es-MX-DaliaNeural",
        ("male", "american"): "es-MX-JorgeNeural",
        ("female", "indian"): "es-ES-ElviraNeural",
        ("male", "indian"): "es-ES-AlvaroNeural",
    },
    "french": {
        ("female", "american"): "fr-FR-DeniseNeural",
        ("male", "american"): "fr-FR-HenriNeural",
        ("female", "indian"): "fr-FR-DeniseNeural",
        ("male", "indian"): "fr-FR-HenriNeural",
    },
    "german": {
        ("female", "american"): "de-DE-KatjaNeural",
        ("male", "american"): "de-DE-ConradNeural",
        ("female", "indian"): "de-DE-KatjaNeural",
        ("male", "indian"): "de-DE-ConradNeural",
    },
    "japanese": {
        ("female", "american"): "ja-JP-NanamiNeural",
        ("male", "american"): "ja-JP-KeitaNeural",
        ("female", "indian"): "ja-JP-NanamiNeural",
        ("male", "indian"): "ja-JP-KeitaNeural",
    },
    "chinese": {
        ("female", "american"): "zh-CN-XiaoxiaoNeural",
        ("male", "american"): "zh-CN-YunxiNeural",
        ("female", "indian"): "zh-CN-XiaoxiaoNeural",
        ("male", "indian"): "zh-CN-YunxiNeural",
    },
    "arabic": {
        ("female", "american"): "ar-SA-ZariyahNeural",
        ("male", "american"): "ar-SA-HamedNeural",
        ("female", "indian"): "ar-SA-ZariyahNeural",
        ("male", "indian"): "ar-SA-HamedNeural",
    },
    "portuguese": {
        ("female", "american"): "pt-BR-FranciscaNeural",
        ("male", "american"): "pt-BR-AntonioNeural",
        ("female", "indian"): "pt-BR-FranciscaNeural",
        ("male", "indian"): "pt-BR-AntonioNeural",
    },
    "korean": {
        ("female", "american"): "ko-KR-SunHiNeural",
        ("male", "american"): "ko-KR-InJoonNeural",
        ("female", "indian"): "ko-KR-SunHiNeural",
        ("male", "indian"): "ko-KR-InJoonNeural",
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
