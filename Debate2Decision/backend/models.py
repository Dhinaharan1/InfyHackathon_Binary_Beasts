from pydantic import BaseModel


class AgentPersona(BaseModel):
    name: str
    role: str
    industry: str
    stance: str  # "for", "against", "neutral"
    expertise: str
    personality: str
    avatar_color: str
    avatar_emoji: str
    gender: str  # "male", "female"
    accent: str  # "indian", "american", "british"
    emotional_style: str  # how they express emotions
    avatar_image: str | None = None  # base64 AI-generated portrait


class DebateMessage(BaseModel):
    agent: AgentPersona
    content: str
    round_name: str
    round_number: int
    video_url: str | None = None


class DebateSetup(BaseModel):
    topic: str
    industry: str
    agents: list[AgentPersona]
    total_rounds: int
    language: str = "english"


class DebateRequest(BaseModel):
    topic: str
    language: str = "english"
    demo: bool = False
    transcript: str | None = None
    num_agents: int = 3
    num_rounds: int = 4
    persona_constraints: str = ""
