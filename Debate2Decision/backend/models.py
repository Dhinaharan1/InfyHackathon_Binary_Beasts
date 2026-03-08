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


class DebateMessage(BaseModel):
    agent: AgentPersona
    content: str
    round_name: str
    round_number: int


class DebateSetup(BaseModel):
    topic: str
    industry: str
    agents: list[AgentPersona]
    total_rounds: int
    language: str = "english"


class DebateRequest(BaseModel):
    topic: str
    language: str = "english"  # "english", "hindi", "tamil"
