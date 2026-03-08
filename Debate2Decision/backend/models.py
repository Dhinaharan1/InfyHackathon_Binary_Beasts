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
    num_agents: int = 3  # 2-5
    num_rounds: int = 4  # 2-4
    persona_constraints: str = ""  # e.g. "include someone from healthcare"
