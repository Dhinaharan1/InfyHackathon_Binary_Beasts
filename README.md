# InfyHackathon_Binary_Beasts

## Debate 2 Decision AI

An AI-powered multi-agent debate platform where AI-generated personas with realistic avatars engage in structured debates on any topic, complete with voice synthesis, lip-sync animations, and a final verdict.

### Prerequisites

- Python 3.10+
- Node.js 18+

### API Keys Required

| Service | Purpose | Free Tier | Get Your Key |
|---------|---------|-----------|-------------|
| **Groq** (Required) | LLM for debate generation | Free with generous limits | [console.groq.com/keys](https://console.groq.com/keys) |
| **Hugging Face** (Recommended) | AI-generated Pixar-style illustrated avatars (FLUX.1 via free HF Spaces) | Free with generous ZeroGPU quota | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| **Together.ai** (Optional) | Faster AI avatar generation (FLUX.1-schnell) | Free credits on signup | [api.together.ai/settings/api-keys](https://api.together.ai/settings/api-keys) |
| **D-ID** (Optional) | AI talking head videos -- avatars speak like news anchors | Free trial: ~5 min video | [studio.d-id.com/account](https://studio.d-id.com/account) |

#### Avatar Generation -- AI Illustrated Characters (Pixar/Disney Style)

The system generates **3D Pixar/Disney-style illustrated character portraits** using AI -- no copyright issues, professional quality, and perfect for animated debates.

**Fallback chain:**
1. **HF Space FLUX.1** -- Free AI-generated illustrated portraits via Hugging Face Spaces (uses your HF token for higher quota)
2. **Together.ai FLUX** -- Faster alternative (requires API key with credits)
3. **HF Router FLUX** -- Direct HF inference (token needs "Inference Providers" permission)
4. **DiceBear** -- Illustrated cartoon avatars (automatic fallback, no key needed)

> **Note:** With just a free HF token, you get beautiful AI-generated Pixar-style character avatars with canvas lip-sync animation. Add a D-ID key to upgrade to full AI-generated talking head videos (news anchor style).

### Backend Setup

```bash
cd Debate2Decision/backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys (see table above)

# Run the backend server (runs on http://localhost:8000)
python main.py
```

### Frontend Setup

```bash
cd Debate2Decision/frontend

# Install dependencies
npm install

# Run the development server (runs on http://localhost:3000)
npm run dev
```

### Production Build (Frontend)

```bash
cd Debate2Decision/frontend
npm run build
npm run start
```
