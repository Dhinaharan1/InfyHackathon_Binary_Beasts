import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY") or ""
GROQ_MODEL = "llama-3.3-70b-versatile"
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY") or ""
HF_API_TOKEN = os.getenv("HF_API_TOKEN") or None  # None when not set or empty
D_ID_API_KEY = os.getenv("D_ID_API_KEY") or ""
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MAX_AGENTS = 3
DEBATE_ROUNDS = 4
MIN_AGENTS = 2
MAX_AGENTS_LIMIT = 5
MIN_ROUNDS = 2
MAX_ROUNDS = 8
