import json
import asyncio
from typing import AsyncGenerator
from orchestrator import call_groq
from tts import generate_speech
from models import AgentPersona, DebateSetup, DebateMessage

ROUND_NAMES = [
    "Opening Statements",
    "Cross-Examination",
    "Rebuttals",
    "Closing Statements",
]

AGENT_PROMPT = """You are {name}, a real person - a {role} in the {industry} industry.
Your background: {accent} speaker, {gender}.
Your expertise: {expertise}
Your stance on the topic: {stance}
Your personality: {personality}
How you express yourself: {emotional_style}

The debate topic is: "{topic}"

Current round: {round_name}
{context}

{round_instruction}

{language_instruction}

HOW TO SOUND LIKE A REAL HUMAN:
- Speak naturally like you're in a real conversation, not giving a TED talk
- Show genuine emotion - excitement, concern, surprise, warmth, disagreement
- Use natural filler phrases appropriate to the language
- React to what others said warmly but firmly
- Mix short and long sentences. Pause sometimes with "..." for emphasis.
- Show you're listening - acknowledge a good point before countering it
- Keep it FRIENDLY and RESPECTFUL even when you strongly disagree. No insults, no harsh words.
- Be 3-5 sentences. Sound like you're having a real conversation.
- Do NOT prefix your response with your name or role. Just speak directly.
- NEVER use abusive, vulgar, or harsh language. Keep it clean and professional but warm.
- NEVER use local slang, regional colloquialisms, or non-standard words from other languages (e.g., avoid "na", "yaar", "ji", "arre", "accha", or any Hindi/regional language words when speaking English). Use only standard, universally understood language.
"""

LANGUAGE_INSTRUCTIONS = {
    "english": """LANGUAGE: Respond ONLY in standard English.
- Use contractions (don't, can't, I'm, that's, we've)
- STRICTLY AVOID any non-English words, local slang, or regional colloquialisms (no "na", "yaar", "ji", "arre", "accha", or any Hindi/regional words)
- Use only proper, universally understood English regardless of the speaker's accent or background
- If accent is "indian": use expressions like "here is the thing", "essentially", "let me explain"
- If accent is "british": use expressions like "right", "I reckon", "fair enough but", "quite frankly"
- If accent is "american": use expressions like "here's the deal", "you know what", "I gotta say", "honestly"
""",
    "hindi": """LANGUAGE: Respond ONLY in Hindi using Devanagari script.
- Use natural spoken Hindi, like how people actually talk (not formal textbook Hindi)
- Mix in common Hinglish where natural (e.g., "point", "actually", "basically")
- Use expressions like "देखिए", "सुनिए", "बात यह है कि", "मेरा मानना है", "अरे यार"
- Use "आप" for respectful address, switch between formal and casual naturally
- Keep it conversational - the way educated Indians speak Hindi in meetings
""",
    "tamil": """LANGUAGE: Respond ONLY in Tamil using Tamil script.
- Use natural spoken Tamil, like how people actually talk (not formal literary Tamil)
- Mix in common Tanglish where natural (e.g., "point", "actually", "basically")
- Use expressions like "பாருங்க", "கேளுங்க", "என்ன நான் சொல்ல வர்றேன்னா", "நிஜமாவே"
- Keep it conversational - the way educated Tamilians speak in discussions
""",
}

ROUND_INSTRUCTIONS = {
    "Opening Statements": "Share why this topic matters to you personally. Be genuine about your perspective. Use a real-world example or a personal experience to connect with the audience. Set your tone - warm, passionate, thoughtful.",
    "Cross-Examination": "Respectfully challenge someone's point that you disagree with. Acknowledge what they got right first, then explain where you think they went wrong. Use a concrete example or data point. Be firm but never rude.",
    "Rebuttals": "Someone challenged your view - respond with conviction but grace. Share a personal story or real-world example that proves your point. Show that you genuinely care about getting this right, not just winning.",
    "Closing Statements": "Wrap up with your strongest, most heartfelt argument. Bring it back to why this matters for real people. End with something memorable - a thought-provoking question, a hopeful vision, or a call to action.",
}

VERDICT_PROMPT = """You are a warm, thoughtful debate judge. You just watched an engaging debate on: "{topic}"

The debaters and their stances were:
{agent_stances}

Here is the full debate transcript:
{transcript}

Provide a verdict in this exact JSON format (no markdown, no code fences):
{{
  "winner": "Name of the most compelling debater",
  "winner_role": "Their role",
  "winner_stance": "for" or "against" or "neutral" (the winner's stance on the topic),
  "conclusion": "A clear 2-3 sentence conclusion about the debate topic itself based on who won. For example, if the topic is 'Should AI replace teachers?' and the winner argued AGAINST it, say something like: 'Based on the strength of the arguments presented, the debate concludes that AI should NOT replace teachers. [Winner name] made a compelling case that...' Be specific about WHAT the winner's position means for the topic.",
  "reasoning": "2-3 sentences about why this person won - who connected best with the audience? Who made the most compelling case?",
  "scores": [
    {{"name": "Agent name", "role": "Role", "score": 85, "strength": "What made them stand out?"}}
  ]
}}

Score 0-100 based on: authenticity, emotional connection, strength of arguments, and how well they listened to others.
"""


class DebateEngine:
    def __init__(self, setup: DebateSetup):
        self.setup = setup
        self.transcript: list[dict] = []

    def _build_context(self, round_num: int) -> str:
        if not self.transcript:
            return "This is the start of the debate. No previous arguments have been made."

        current_round_msgs = [m for m in self.transcript if m["round_number"] == round_num]
        prev_round_msgs = [m for m in self.transcript if m["round_number"] == round_num - 1] if round_num > 0 else []

        context_parts = []
        if prev_round_msgs:
            context_parts.append(f"Previous round ({ROUND_NAMES[round_num - 1]}):")
            for m in prev_round_msgs:
                context_parts.append(f"  {m['agent_name']} ({m['agent_role']}): {m['content']}")

        if current_round_msgs:
            context_parts.append(f"\nAlready spoken this round:")
            for m in current_round_msgs:
                context_parts.append(f"  {m['agent_name']} ({m['agent_role']}): {m['content']}")

        return "\n".join(context_parts) if context_parts else "No arguments made yet."

    async def run_agent_turn(self, agent: AgentPersona, round_num: int) -> tuple[str, str]:
        round_name = ROUND_NAMES[round_num]
        context = self._build_context(round_num)

        language = self.setup.language
        lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["english"])

        prompt = AGENT_PROMPT.format(
            name=agent.name,
            role=agent.role,
            industry=agent.industry,
            expertise=agent.expertise,
            stance=agent.stance,
            personality=agent.personality,
            emotional_style=agent.emotional_style,
            accent=agent.accent,
            gender=agent.gender,
            topic=self.setup.topic,
            round_name=round_name,
            context=context,
            round_instruction=ROUND_INSTRUCTIONS[round_name],
            language_instruction=lang_instruction,
        )

        lang_label = {"english": "English", "hindi": "Hindi", "tamil": "Tamil"}.get(language, "English")
        system = (
            f"You are {agent.name}, a real {agent.gender} person. "
            f"You're a {agent.role} who {agent.emotional_style}. "
            f"You MUST respond ONLY in {lang_label}. "
            f"Speak naturally like a real person - show genuine emotions, "
            f"be warm and respectful even in disagreement. 3-5 sentences. Never prefix with your name. "
            f"Never use abusive or harsh language. "
            f"NEVER use local slang or non-standard words from other languages (no 'na', 'yaar', 'ji', 'arre', 'accha', etc. when speaking English). Use only standard, universally understood language."
        )
        content = await call_groq(prompt, system=system)

        self.transcript.append({
            "agent_name": agent.name,
            "agent_role": agent.role,
            "content": content,
            "round_number": round_num,
            "round_name": round_name,
        })

        agent_index = next(
            (i for i, a in enumerate(self.setup.agents) if a.name == agent.name), 0
        )
        audio_base64 = await generate_speech(
            content, agent.gender, agent.accent, agent_index, self.setup.language
        )

        return content, audio_base64

    async def generate_verdict(self) -> dict:
        transcript_text = ""
        for msg in self.transcript:
            transcript_text += f"\n[{msg['round_name']}] {msg['agent_name']} ({msg['agent_role']}): {msg['content']}\n"

        agent_stances = "\n".join(
            f"- {a.name} ({a.role}): stance = {a.stance}" for a in self.setup.agents
        )

        prompt = VERDICT_PROMPT.format(
            topic=self.setup.topic,
            transcript=transcript_text,
            agent_stances=agent_stances,
        )

        lang_label = {"english": "English", "hindi": "Hindi", "tamil": "Tamil"}.get(self.setup.language, "English")
        text = await call_groq(
            prompt,
            system=f"You are a warm, thoughtful debate judge. Respond with valid JSON only. The 'conclusion' and 'reasoning' fields must be in {lang_label}. The 'winner', 'winner_role', 'name', 'role', 'strength' fields must also be in {lang_label}. Only the JSON keys must remain in English."
        )

        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0].strip()

        return json.loads(text)

    async def run_debate(self) -> AsyncGenerator[dict, None]:
        yield {
            "type": "setup",
            "data": self.setup.model_dump(),
        }

        for round_num in range(len(ROUND_NAMES)):
            yield {
                "type": "round_start",
                "data": {
                    "round_number": round_num,
                    "round_name": ROUND_NAMES[round_num],
                },
            }

            for agent in self.setup.agents:
                yield {
                    "type": "agent_thinking",
                    "data": {"agent_name": agent.name},
                }

                content, audio_base64 = await self.run_agent_turn(agent, round_num)
                yield {
                    "type": "agent_message",
                    "data": {
                        **DebateMessage(
                            agent=agent,
                            content=content,
                            round_name=ROUND_NAMES[round_num],
                            round_number=round_num,
                        ).model_dump(),
                        "audio": audio_base64,
                    },
                }

                await asyncio.sleep(2.5)

            yield {
                "type": "round_end",
                "data": {
                    "round_number": round_num,
                    "round_name": ROUND_NAMES[round_num],
                },
            }

        yield {
            "type": "status",
            "data": {"message": "Judges are deliberating..."},
        }

        verdict = await self.generate_verdict()
        yield {
            "type": "verdict",
            "data": verdict,
        }

        yield {"type": "debate_end", "data": {}}
