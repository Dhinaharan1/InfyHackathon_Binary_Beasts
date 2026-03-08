import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY", "")
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
D_ID_API_KEY = os.getenv("D_ID_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MAX_AGENTS = 3
DEBATE_ROUNDS = 4
