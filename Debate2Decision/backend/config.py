import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MAX_AGENTS = 3
DEBATE_ROUNDS = 4
MIN_AGENTS = 2
MAX_AGENTS_LIMIT = 5
MIN_ROUNDS = 2
MAX_ROUNDS = 4
