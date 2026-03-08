import json
import asyncio
import httpx
from config import GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL, MAX_AGENTS
from models import AgentPersona, DebateSetup

AVATAR_COLORS = ["#6366F1", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"]

AVATAR_EMOJIS = ["brain", "fire", "leaf", "lightning", "star"]

SETUP_PROMPT = """You are an expert debate organizer creating a warm, engaging, human-feeling debate. Given a topic, create diverse personas who discuss like real, thoughtful people.

Debate Topic: "{topic}"

Your tasks:
1. Identify the most relevant industry/domain
2. Generate exactly {max_agents} diverse personas with DIFFERENT backgrounds, genders, accents, and emotional styles
3. Mix of male and female. Mix of Indian, American, and British backgrounds with names matching their origin.
4. Each persona should feel like a REAL, warm person - approachable, genuine, with natural speaking habits

IMPORTANT for diversity:
- {accent_note}
- Mix genders across the group
- Each person has a unique but FRIENDLY emotional style (e.g., warm storyteller, thoughtful analyst, passionate advocate, calm diplomat)
- Everyone should be respectful and constructive even when they disagree

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{{
  "industry": "identified industry name",
  "agents": [
    {{
      "name": "A realistic full name matching their cultural background",
      "role": "Their job title/role",
      "expertise": "Their area of expertise",
      "stance": "for" or "against" or "neutral",
      "personality": "How they discuss - be specific about their warmth, humor style, how they connect with people",
      "gender": "male" or "female",
      "accent": {accent_options},
      "emotional_style": "How they express themselves (e.g., uses warm humor and stories, gets genuinely excited sharing ideas, stays calm and builds bridges, speaks from the heart with real examples)"
    }}
  ]
}}
"""


async def call_groq(prompt: str, system: str = "You are a helpful assistant.", max_retries: int = 5) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(max_retries):
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1024,
                },
            )
            if response.status_code == 429:
                retry_after = float(response.headers.get("retry-after", 2))
                if retry_after > 30:
                    raise Exception(
                        f"Groq API rate limit exceeded. Please wait {int(retry_after)} seconds before trying again, "
                        f"or get a new API key at https://console.groq.com"
                    )
                wait_time = min(max(retry_after, 2 ** attempt), 30)
                print(f"Rate limited, retrying in {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        raise Exception("Groq API rate limit exceeded after all retries. Please wait a moment and try again.")


LANGUAGE_CONFIG = {
    "english": {
        "instruction": "All debate responses must be in English.",
        "accent_note": "Mix of Indian, American, and British backgrounds with names matching their origin.",
        "accent_options": '"indian" or "american" or "british"',
    },
    "hindi": {
        "instruction": "All debate responses must be in Hindi (Devanagari script). Use natural spoken Hindi, not overly formal. Mix in common Hinglish words where natural.",
        "accent_note": "All agents should be Indian with Hindi names. Mix of backgrounds from different Indian regions.",
        "accent_options": '"indian"',
    },
    "tamil": {
        "instruction": "All debate responses must be in Tamil (Tamil script). Use natural spoken Tamil, not overly formal literary Tamil.",
        "accent_note": "All agents should be Tamil with Tamil names from different regions of Tamil Nadu.",
        "accent_options": '"indian"',
    },
}


TRANSCRIPT_PROMPT = """You are an expert debate organizer. You are given a chat transcript or conversation from a team discussion, forum, or meeting. Your job is to:

1. Analyze the transcript and identify the core debate topic being discussed
2. Identify the key positions/stances people are taking
3. Generate exactly {max_agents} diverse debate personas who will formally debate this topic

The personas should represent the key viewpoints from the transcript but as professional debate participants.

Chat Transcript:
---
{transcript}
---

IMPORTANT for diversity:
- {accent_note}
- Mix genders across the group
- Each person has a unique but FRIENDLY emotional style

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{{
  "topic": "The core debate topic extracted from the transcript (as a clear question)",
  "industry": "The relevant industry/domain",
  "agents": [
    {{
      "name": "A realistic full name matching their cultural background",
      "role": "Their job title/role",
      "expertise": "Their area of expertise",
      "stance": "for" or "against" or "neutral",
      "personality": "How they discuss - be specific about their warmth, humor style, how they connect with people",
      "gender": "male" or "female",
      "accent": {accent_options},
      "emotional_style": "How they express themselves"
    }}
  ]
}}
"""


async def generate_debate_from_transcript(transcript: str, language: str = "english") -> DebateSetup:
    lang_cfg = LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG["english"])
    prompt = TRANSCRIPT_PROMPT.format(
        transcript=transcript,
        max_agents=MAX_AGENTS,
        accent_options=lang_cfg["accent_options"],
        accent_note=lang_cfg["accent_note"],
    )

    text = await call_groq(prompt, system=f"You are an expert debate organizer. Always respond with valid JSON only. {lang_cfg['instruction']}")

    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0].strip()

    data = json.loads(text)

    agents = []
    for i, agent_data in enumerate(data["agents"][:MAX_AGENTS]):
        agents.append(AgentPersona(
            name=agent_data["name"],
            role=agent_data["role"],
            industry=data["industry"],
            stance=agent_data["stance"],
            expertise=agent_data["expertise"],
            personality=agent_data["personality"],
            avatar_color=AVATAR_COLORS[i % len(AVATAR_COLORS)],
            avatar_emoji=AVATAR_EMOJIS[i % len(AVATAR_EMOJIS)],
            gender=agent_data.get("gender", "male"),
            accent=agent_data.get("accent", "american"),
            emotional_style=agent_data.get("emotional_style", "balanced and measured"),
        ))

    return DebateSetup(
        topic=data.get("topic", "Extracted debate topic"),
        industry=data["industry"],
        agents=agents,
        total_rounds=4,
        language=language,
    )


async def generate_debate_setup(topic: str, language: str = "english") -> DebateSetup:
    lang_cfg = LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG["english"])
    prompt = SETUP_PROMPT.format(
        topic=topic,
        max_agents=MAX_AGENTS,
        accent_options=lang_cfg["accent_options"],
        accent_note=lang_cfg["accent_note"],
    )

    text = await call_groq(prompt, system=f"You are an expert debate organizer. Always respond with valid JSON only. {lang_cfg['instruction']}")

    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0].strip()

    data = json.loads(text)

    agents = []
    for i, agent_data in enumerate(data["agents"][:MAX_AGENTS]):
        agents.append(AgentPersona(
            name=agent_data["name"],
            role=agent_data["role"],
            industry=data["industry"],
            stance=agent_data["stance"],
            expertise=agent_data["expertise"],
            personality=agent_data["personality"],
            avatar_color=AVATAR_COLORS[i % len(AVATAR_COLORS)],
            avatar_emoji=AVATAR_EMOJIS[i % len(AVATAR_EMOJIS)],
            gender=agent_data.get("gender", "male"),
            accent=agent_data.get("accent", "american"),
            emotional_style=agent_data.get("emotional_style", "balanced and measured"),
        ))

    return DebateSetup(
        topic=topic,
        industry=data["industry"],
        agents=agents,
        total_rounds=4,
        language=language,
    )
