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
{persona_constraints}

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


SENSITIVITY_PROMPT = """Analyze this debate topic for sensitivity. Rate how sensitive the topic is for a public debate setting.

Topic: "{topic}"

Classify the sensitivity level as:
- "low" - Normal professional/technology/general topics with no sensitive elements (e.g. remote work, AI in education, 4-day work week, microservices vs monolith)
- "medium" - Topics that touch on mildly sensitive areas but are commonly debated in public (e.g. cryptocurrency regulation, social media impact on youth, gun control, immigration policy)
- "high" - Topics involving deeply sensitive areas like religion, race, gender identity, sexuality, graphic violence, drugs, or extremely polarizing cultural/political issues

Return ONLY valid JSON (no markdown, no code fences):
{{
  "level": "low" or "medium" or "high",
  "categories": ["list of detected topic categories, e.g. technology, political, religious, racial, gender, violence, economics, education, health, social"],
  "warning": "A brief, neutral 1-2 sentence description of the topic's sensitivity context. For low sensitivity, describe why it is safe. For medium/high, explain what makes it sensitive.",
  "suggestion": "An optional rephrased version of the topic that is less sensitive. Empty string if not needed or if already low."
}}
"""


async def check_topic_sensitivity(topic: str) -> dict:
    try:
        prompt = SENSITIVITY_PROMPT.format(topic=topic)
        text = await call_groq(
            prompt,
            system="You are a content moderation expert. Be balanced and accurate in your ratings. Respond with valid JSON only.",
            max_retries=2,
        )
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0].strip()
        result = json.loads(text)
        result.setdefault("level", "low")
        result.setdefault("categories", [])
        result.setdefault("warning", "")
        result.setdefault("suggestion", "")
        return result
    except Exception as e:
        print(f"Sensitivity check failed: {e}")
        return {"level": "low", "categories": [], "warning": "", "suggestion": ""}


ANALYSIS_PROMPT = """Analyze this debate argument briefly.

Speaker: {agent_name} ({agent_role}), stance: {agent_stance}
Topic: "{topic}"
Argument: "{content}"

Return ONLY valid JSON (no markdown, no code fences):
{{
  "fact_check": {{
    "claims": [
      {{"claim": "specific claim", "verdict": "accurate" or "misleading" or "unverifiable" or "partially_true", "explanation": "1 sentence"}}
    ],
    "overall_accuracy": "high" or "medium" or "low"
  }},
  "sentiment": {{
    "persuasiveness": 0-100,
    "emotional_impact": 0-100,
    "factual_strength": 0-100,
    "overall": 0-100
  }}
}}
"""


async def analyze_message(content: str, agent_name: str, agent_role: str, agent_stance: str, topic: str) -> dict | None:
    try:
        prompt = ANALYSIS_PROMPT.format(
            agent_name=agent_name,
            agent_role=agent_role,
            agent_stance=agent_stance,
            topic=topic,
            content=content[:500],
        )
        text = await call_groq(prompt, system="You are an expert debate analyst and fact-checker. Respond with valid JSON only.", max_retries=2)
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        print(f"Analysis failed for {agent_name}: {e}")
        return None


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


async def generate_debate_setup(topic: str, language: str = "english", num_agents: int = MAX_AGENTS, num_rounds: int = 4, persona_constraints: str = "") -> DebateSetup:
    lang_cfg = LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG["english"])
    clamped_agents = max(2, min(5, num_agents))

    constraints_text = ""
    if persona_constraints.strip():
        constraints_text = f"\nADDITIONAL USER REQUIREMENTS for personas (you MUST follow these):\n- {persona_constraints.strip()}"

    prompt = SETUP_PROMPT.format(
        topic=topic,
        max_agents=clamped_agents,
        accent_options=lang_cfg["accent_options"],
        accent_note=lang_cfg["accent_note"],
        persona_constraints=constraints_text,
    )

    text = await call_groq(prompt, system=f"You are an expert debate organizer. Always respond with valid JSON only. {lang_cfg['instruction']}")

    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0].strip()

    data = json.loads(text)

    agents = []
    for i, agent_data in enumerate(data["agents"][:clamped_agents]):
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
        total_rounds=max(2, min(4, num_rounds)),
        language=language,
    )
