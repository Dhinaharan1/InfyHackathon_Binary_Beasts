# Debate 2 Decision AI - Functional and Technical Document

**Project Name:** Debate 2 Decision AI  
**Team:** Binary Beasts  
**Version:** 0.1.0  
**Date:** March 2026  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Functional Specification](#2-functional-specification)
   - 2.1 [Product Overview](#21-product-overview)
   - 2.2 [User Personas](#22-user-personas)
   - 2.3 [Functional Requirements](#23-functional-requirements)
   - 2.4 [Feature Descriptions](#24-feature-descriptions)
   - 2.5 [User Flows](#25-user-flows)
   - 2.6 [Non-Functional Requirements](#26-non-functional-requirements)
3. [Technical Specification](#3-technical-specification)
   - 3.1 [System Architecture](#31-system-architecture)
   - 3.2 [Technology Stack](#32-technology-stack)
   - 3.3 [Backend Architecture](#33-backend-architecture)
   - 3.4 [Frontend Architecture](#34-frontend-architecture)
   - 3.5 [Data Models](#35-data-models)
   - 3.6 [API Specification](#36-api-specification)
   - 3.7 [WebSocket Protocol](#37-websocket-protocol)
   - 3.8 [AI/ML Integration](#38-aiml-integration)
   - 3.9 [Third-Party Service Integration](#39-third-party-service-integration)
   - 3.10 [Configuration and Environment](#310-configuration-and-environment)
   - 3.11 [Deployment](#311-deployment)
4. [Appendix](#4-appendix)

---

## 1. Executive Summary

**Debate 2 Decision AI** is an AI-powered multi-agent debate platform where AI-generated personas with realistic avatars engage in structured debates on any user-provided topic. The system leverages large language models (LLMs) to generate diverse debate personas, produce human-like arguments across multiple structured rounds, and deliver a final verdict. Each persona is equipped with AI-generated Pixar/Disney-style illustrated avatar portraits, neural text-to-speech (TTS) voice synthesis, optional AI talking-head video generation, real-time sentiment analysis, fact-checking, and multi-language support spanning 17+ languages.

The platform enables users to:
- Submit any debate topic or paste a chat/conversation transcript for AI-driven debate.
- Configure the number of debating agents (2-5), rounds (2-8), language, and persona constraints.
- Watch a real-time animated debate with AI-generated avatars, voice, and lip-sync.
- Interject during the debate with questions or comments that agents will address.
- View real-time sentiment analysis and fact-checking of arguments.
- Cast a vote for their preferred debater before the AI verdict is revealed.
- Receive a comprehensive verdict with scores and reasoning.

---

## 2. Functional Specification

### 2.1 Product Overview

Debate 2 Decision AI transforms any topic or conversation into a structured, multi-agent AI debate. It serves as a decision-support tool that presents multiple perspectives on any issue, helping users explore all facets of complex questions before making informed decisions.

**Problem Statement:** Decision-making on complex topics often suffers from confirmation bias, limited perspectives, and lack of structured analysis. Users need a way to see all sides of an argument presented fairly and evaluated objectively.

**Solution:** An AI-powered debate platform that automatically generates diverse expert personas who argue for, against, and neutral positions on any topic, with real-time analysis and a final verdict.

### 2.2 User Personas

| Persona | Description | Use Case |
|---------|-------------|----------|
| **Decision Maker** | Business leader evaluating strategic options | Uses the platform to see pros/cons of business decisions (e.g., "Should we adopt microservices?") |
| **Student / Learner** | Person exploring a complex topic | Submits academic/social topics to understand multiple perspectives |
| **Team Facilitator** | Manager resolving team disagreements | Pastes a Slack/Teams conversation transcript and lets AI formalize the debate |
| **Policy Analyst** | Researcher exploring policy implications | Tests policy proposals across different stakeholder viewpoints |

### 2.3 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Users can enter a free-text debate topic | Must Have |
| FR-02 | Users can paste a chat transcript for automatic topic extraction | Must Have |
| FR-03 | System generates 2-5 diverse AI personas with names, roles, stances, and personalities | Must Have |
| FR-04 | System conducts structured multi-round debates (2-8 rounds) | Must Have |
| FR-05 | AI-generated Pixar/Disney-style avatar portraits for each persona | Must Have |
| FR-06 | Neural text-to-speech (TTS) voice synthesis with accent-appropriate voices | Must Have |
| FR-07 | Real-time lip-sync animation synchronized with audio playback | Must Have |
| FR-08 | User interjection capability between rounds (30-second window) | Must Have |
| FR-09 | Final verdict with winner, reasoning, and per-agent scores | Must Have |
| FR-10 | Multi-language debate support (17+ languages) | Must Have |
| FR-11 | Topic sensitivity check before debate starts | Should Have |
| FR-12 | Real-time sentiment analysis (persuasiveness, emotional impact, factual strength) | Should Have |
| FR-13 | Fact-checking overlay for claims made during debate | Should Have |
| FR-14 | User vote before verdict reveal | Should Have |
| FR-15 | Vote comparison (user vote vs. AI verdict) | Should Have |
| FR-16 | AI talking-head video generation via D-ID (optional) | Nice to Have |
| FR-17 | Demo mode without API keys | Nice to Have |
| FR-18 | Configurable persona constraints (e.g., "include a Gen-Z perspective") | Nice to Have |
| FR-19 | Configurable number of agents and rounds | Nice to Have |

### 2.4 Feature Descriptions

#### 2.4.1 Topic Input

Users can initiate a debate in two ways:
- **Direct Topic Entry:** Type or select a debate topic from popular suggestions. Example topics are provided per language.
- **Transcript Analysis:** Paste a chat/conversation transcript (e.g., Slack, Teams, forum discussion). The AI automatically extracts the core debate topic and key positions.

Before proceeding, the system performs a **topic sensitivity check** using the LLM. Topics are classified as low, medium, or high sensitivity. For medium/high sensitivity topics, users see a warning with category tags, an explanation, and an optional rephrased suggestion.

#### 2.4.2 Debate Configuration (Advanced Settings)

Users can customize:
- **Number of Agents:** 2 to 5 debaters (default: 3).
- **Number of Rounds:** 2 to 8 rounds (default: 4).
- **Debate Language:** 17+ languages including English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, Spanish, French, German, Japanese, Chinese, Korean, Arabic, Portuguese, plus custom language input.
- **Persona Constraints:** Free-text instructions to guide persona generation (e.g., "include someone from healthcare", "add a Gen-Z perspective").

#### 2.4.3 AI Persona Generation

The system generates diverse debate personas with:
- Culturally appropriate names matching accent/origin.
- Professional role and area of expertise.
- Debate stance: for, against, or neutral.
- Personality traits and emotional style.
- Gender diversity (mix of male and female).
- Accent diversity (Indian, American, British for English; region-appropriate for other languages).
- Unique avatar colors and identifiers.

#### 2.4.4 Structured Debate Rounds

The debate follows structured rounds, dynamically selected based on the configured number:

| Round | Name | Purpose |
|-------|------|---------|
| 1 | Opening Statements | Share personal connection to topic, set tone |
| 2 | Cross-Examination | Challenge opposing arguments respectfully |
| 3 | Rebuttals | Respond to challenges with evidence |
| 4 | Deep Dive | Technical analysis with data and case studies |
| 5 | Free Discussion | Open engagement with any raised points |
| 6 | Devil's Advocate | Challenge strongest opposing arguments |
| 7 | Audience Q&A | Address anticipated audience questions |
| 8 | Closing Statements | Final compelling arguments and call to action |

Agents respond in sequence per round. Each agent's argument is context-aware, referencing previous arguments and any user interjections.

#### 2.4.5 Avatar Generation

AI-generated Pixar/Disney-style 3D character portraits with a multi-tier fallback chain:

1. **Tier 1 - HF Space FLUX.1:** Free AI-generated portraits via Hugging Face Spaces (FLUX.1-merged model). Uses HF token for higher ZeroGPU quota.
2. **Tier 2 - Together.ai FLUX:** Faster alternative using FLUX.1-schnell-Free (requires API key with credits).
3. **Tier 3 - HF Router FLUX:** Direct HF inference API using FLUX.1-schnell (requires token with Inference Providers permission).
4. **Tier 4 - DiceBear:** Illustrated cartoon avatars as automatic fallback (no key needed).

Avatar prompts include ethnicity, gender, age (derived from role seniority), professional attire, and Pixar/Disney art style parameters.

#### 2.4.6 Voice Synthesis (TTS)

Neural text-to-speech using Microsoft Edge TTS with:
- Gender-appropriate voices (male/female).
- Accent-appropriate voices (Indian, American, British English; native voices for non-English languages).
- Per-agent voice differentiation (varied rate and pitch offsets).
- Support for 17+ languages with native neural voices.
- Base64-encoded MP3 audio streamed via WebSocket.

#### 2.4.7 AI Talking-Head Video (Optional)

When a D-ID API key is configured:
- Avatar images are uploaded to D-ID.
- Talking-head videos are generated with lip-synced speech.
- Videos are polled until ready (up to 90 seconds).
- Automatic credit exhaustion detection disables video for the session on 402 errors.

#### 2.4.8 User Interjection

Between rounds, users have a 30-second window to submit a question or comment. Agents in the next round will directly address the interjection in their arguments.

#### 2.4.9 Sentiment Analysis and Fact-Checking

Each agent's argument is analyzed in real-time for:
- **Sentiment Scores:** Persuasiveness (0-100), Emotional Impact (0-100), Factual Strength (0-100), Overall (0-100).
- **Fact-Checking:** Key factual claims are identified and rated as true, mostly_true, unverified, misleading, or false, with confidence scores and explanations.

Results are displayed via a floating sentiment chart and a fact-check overlay panel.

#### 2.4.10 User Vote and Verdict

After all debate audio finishes:
1. **User Vote:** Users vote for their preferred debater (or skip).
2. **AI Verdict:** The AI judge delivers a verdict including the winner, conclusion, reasoning, and per-agent scores.
3. **Vote Comparison:** If the user voted, their choice is compared with the AI's winner.

#### 2.4.11 Demo Mode

A built-in demo mode with pre-generated debate data allows users to experience the platform without any API keys. Available for both topic-based and transcript-based debates.

### 2.5 User Flows

#### 2.5.1 Primary Flow - Topic-Based Debate

```
1. User opens application
2. User selects debate language (optional)
3. User types or selects a debate topic
4. User configures advanced settings (optional: agents, rounds, constraints)
5. User clicks "Start Debate"
6. System performs topic sensitivity check
   6a. If sensitive: Show warning with options (Proceed / Use Suggestion / Change Topic)
   6b. If safe: Proceed automatically
7. System connects via WebSocket
8. System generates AI personas (status: "Analyzing topic...")
9. System generates AI avatar portraits (status: "Generating AI portraits...")
10. Debate begins - agents speak in rounds
    10a. Between rounds: User may interject (30s window)
11. After all rounds: AI judge deliberates
12. Audio/video playback completes
13. User votes for preferred debater (optional)
14. AI verdict is revealed with scores
15. Vote comparison shown (if user voted)
16. User can start a new debate
```

#### 2.5.2 Secondary Flow - Transcript-Based Debate

```
1. User switches to "Chat Transcript" tab
2. User pastes a conversation transcript or selects a sample
3. User configures settings (optional)
4. User clicks "Analyze & Debate"
5. System extracts debate topic from transcript
6. Flow continues from step 7 of Primary Flow
```

### 2.6 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Persona generation latency | < 10 seconds |
| NFR-02 | Per-turn response generation | < 5 seconds |
| NFR-03 | Avatar generation per agent | < 30 seconds |
| NFR-04 | TTS audio generation per turn | < 3 seconds |
| NFR-05 | WebSocket connection reliability | Graceful reconnection on failure |
| NFR-06 | Browser compatibility | Modern browsers (Chrome, Firefox, Safari, Edge) |
| NFR-07 | Responsive design | Desktop and tablet optimized |
| NFR-08 | Concurrent debate sessions | Multiple simultaneous WebSocket connections |
| NFR-09 | API rate limiting resilience | Exponential backoff with up to 5 retries for Groq API |

---

## 3. Technical Specification

### 3.1 System Architecture

```
+------------------------------------------------------------------+
|                        CLIENT (Browser)                          |
|                                                                  |
|   Next.js 14 App (React 18 + TypeScript + Tailwind CSS)         |
|   +----------------------------------------------------------+  |
|   | TopicInput | DebateStage | VerdictCard | SentimentChart  |  |
|   | UserVote | VoteComparison | FactCheckOverlay             |  |
|   | AnimatedAvatar | InterjectionInput | SpeechSynthesis      |  |
|   +----------------------------------------------------------+  |
|   | useDebateWebSocket (Custom Hook - WebSocket Client)       |  |
|   +----------------------------------------------------------+  |
|                          |                                       |
+--------------------------|---------------------------------------+
                           | WebSocket (ws://localhost:8000/ws/debate)
                           | HTTP REST (http://localhost:8000/api/*)
                           |
+--------------------------|---------------------------------------+
|                     BACKEND SERVER                               |
|                    FastAPI + Uvicorn                              |
|                                                                  |
|   +----------------------------------------------------------+  |
|   |  main.py (FastAPI App)                                    |  |
|   |  - GET /health                                            |  |
|   |  - POST /api/check-topic                                  |  |
|   |  - WS /ws/debate                                          |  |
|   +----------------------------------------------------------+  |
|   |  orchestrator.py          |  debate_engine.py             |  |
|   |  - LLM prompt management  |  - Round management           |  |
|   |  - Persona generation     |  - Agent turn execution       |  |
|   |  - Topic sensitivity      |  - Context building           |  |
|   |  - Message analysis       |  - Verdict generation         |  |
|   |  - Language config        |  - Interjection handling      |  |
|   +----------------------------------------------------------+  |
|   |  avatar_generator.py | tts.py | video_generator.py        |  |
|   |  - Multi-tier avatar  | - Edge TTS | - D-ID video         |  |
|   |  - FLUX.1 / DiceBear  | - Voice map | - Image upload      |  |
|   +----------------------------------------------------------+  |
|                          |                                       |
+--------------------------|---------------------------------------+
                           |
          +----------------+------------------+
          |                |                  |
+---------v--+  +---------v---+  +-----------v-----------+
| Groq API   |  | HF Spaces / |  | D-ID API (Optional)  |
| (LLM)      |  | Together.ai |  | (Talking Head Video)  |
| Llama 3.3  |  | (Avatars)   |  |                       |
+------------+  +-------------+  +-----------------------+
```

### 3.2 Technology Stack

#### Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Python | 3.10+ | Server-side logic |
| Web Framework | FastAPI | Latest | REST API + WebSocket server |
| ASGI Server | Uvicorn | Latest | HTTP/WebSocket server |
| HTTP Client | httpx | Latest | Async HTTP requests to external APIs |
| Data Validation | Pydantic | v2 | Request/response model validation |
| TTS Engine | edge-tts | Latest | Microsoft Neural TTS synthesis |
| Image Processing | Pillow | Latest | Avatar image format conversion |
| AI Image Client | gradio_client | Latest | HF Space FLUX.1 avatar generation |
| Environment | python-dotenv | Latest | .env file configuration loading |
| WebSocket | websockets | Latest | WebSocket protocol support |

#### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Next.js | 14.2+ | React meta-framework with App Router |
| UI Library | React | 18.3+ | Component-based UI |
| Language | TypeScript | 5.0+ | Type-safe JavaScript |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS framework |
| Animations | Framer Motion | 11.0+ | Declarative animations |
| CSS Processing | PostCSS + Autoprefixer | Latest | CSS transformations |

#### External Services

| Service | Model/Product | Purpose |
|---------|--------------|---------|
| Groq | Llama 3.3 70B Versatile | LLM for debate generation, analysis, verdicts |
| Hugging Face Spaces | FLUX.1-merged | Free AI avatar portrait generation |
| Together.ai | FLUX.1-schnell-Free | Fast AI avatar generation (fallback) |
| HF Inference API | FLUX.1-schnell | Direct inference avatar generation (fallback) |
| DiceBear | Adventurer style | Illustrated cartoon avatars (final fallback) |
| Microsoft Edge TTS | Neural voices | Text-to-speech in 17+ languages |
| D-ID | Talks API | AI talking-head video generation (optional) |

### 3.3 Backend Architecture

#### 3.3.1 Module Structure

```
backend/
  main.py              # FastAPI application, routes, WebSocket handler
  config.py            # Environment configuration, constants
  models.py            # Pydantic data models
  orchestrator.py      # LLM interaction, prompt management, language config
  debate_engine.py     # Debate round management, agent turns, verdict
  avatar_generator.py  # Multi-tier avatar generation pipeline
  tts.py               # Text-to-speech synthesis with Edge TTS
  video_generator.py   # D-ID talking-head video generation
  demo_data.py         # Pre-built demo debate data
  requirements.txt     # Python dependencies
  .env.example         # Environment variable template
```

#### 3.3.2 Main Application (main.py)

The FastAPI application exposes:
- **GET /health** - Health check endpoint returning `{"status": "ok"}`.
- **POST /api/check-topic** - Topic sensitivity analysis (accepts `{"topic": "..."}`, returns sensitivity level, categories, warning, and suggestion).
- **WS /ws/debate** - Primary WebSocket endpoint for real-time debate sessions.

CORS is configured to allow all origins for development.

The WebSocket handler:
1. Accepts connection and receives a `DebateRequest` JSON payload.
2. Routes to demo mode or live debate based on request flags.
3. For live debates: generates setup (personas), generates avatars, then runs the debate engine streaming events.
4. Handles user interjections during `round_pause` events (30s timeout).

#### 3.3.3 Orchestrator (orchestrator.py)

Manages all LLM interactions via the Groq API:

- **`call_groq(prompt, system, max_retries)`** - Core async function for LLM calls with exponential backoff retry on 429 rate limits.
- **`generate_debate_setup(topic, language, num_agents, num_rounds, persona_constraints)`** - Generates diverse AI personas for a given topic.
- **`generate_debate_from_transcript(transcript, language, ...)`** - Extracts debate topic and generates personas from a conversation transcript.
- **`check_topic_sensitivity(topic)`** - Classifies topic sensitivity (low/medium/high).
- **`analyze_message(agent_name, agent_role, ...)`** - Analyzes individual debate arguments for sentiment and fact-checks.
- **`get_language_config(language)`** - Returns language-specific prompt instructions, accent notes, and accent options.

**Language Support:** 17 pre-configured languages with custom instructions and accent mappings, plus fallback for any custom language.

#### 3.3.4 Debate Engine (debate_engine.py)

The `DebateEngine` class manages the entire debate lifecycle:

- **Round Management:** Dynamically selects round names based on the configured count (2-8 rounds). Ensures Opening Statements always come first and Closing Statements always come last.
- **Context Building:** For each agent turn, builds context including previous round messages, current round messages from other agents, and any user interjections from the preceding pause.
- **Agent Turn Execution:** Generates agent argument via LLM, then concurrently generates TTS audio and sentiment analysis.
- **Interjection Handling:** Stores user interjections with round association; agents are instructed to address them.
- **Verdict Generation:** After all rounds, generates a comprehensive verdict with winner, conclusion, reasoning, and per-agent scores.
- **Event Streaming:** Yields structured events via async generator for WebSocket transmission.

#### 3.3.5 Avatar Generator (avatar_generator.py)

Multi-tier avatar generation with automatic fallback:

1. Builds detailed prompts specifying ethnicity, gender, age, role, and Pixar/Disney art style.
2. Attempts generation through four tiers sequentially until one succeeds.
3. Generates avatars sequentially (not parallel) to respect HF Space ZeroGPU rate limits.
4. Returns base64 PNG data URIs.

#### 3.3.6 TTS Engine (tts.py)

- Uses Microsoft Edge TTS (free, no API key required).
- Maintains a comprehensive voice mapping for 17+ languages with gender and accent combinations.
- Applies per-agent voice style variations (rate and pitch offsets) for differentiation.
- Returns base64-encoded MP3 audio data.

#### 3.3.7 Video Generator (video_generator.py)

- Uploads avatar images to D-ID.
- Creates "talks" with text script and Microsoft TTS voice.
- Polls for completion (up to 90 seconds, 3-second intervals).
- Session-level credit exhaustion detection: once a 402 response is received, video generation is disabled for the remainder of the session.

### 3.4 Frontend Architecture

#### 3.4.1 Component Structure

```
frontend/
  app/
    layout.tsx         # Root layout with metadata and global styles
    page.tsx           # Main page - state machine for debate flow
    globals.css        # Global styles, glass-card effects, animations
  components/
    TopicInput.tsx     # Topic/transcript input with language, settings, sensitivity
    DebateStage.tsx    # Main debate UI - avatars, speech bubbles, controls
    AnimatedAvatar.tsx # Canvas-based lip-sync animated avatar component
    AgentAvatar.tsx    # Static avatar display component
    SpeechSynthesis.tsx# Audio playback manager (Web Audio API)
    TypingText.tsx     # Synchronized typewriter text animation
    SentimentChart.tsx # Real-time sentiment analysis visualization
    FactCheckOverlay.tsx # Fact-check panel with verdicts
    InterjectionInput.tsx # User interjection modal with countdown timer
    UserVote.tsx       # Pre-verdict user voting interface
    VerdictCard.tsx    # Final verdict display card
    VoteComparison.tsx # User vote vs AI verdict comparison
  hooks/
    useDebateWebSocket.ts # WebSocket connection and state management hook
```

#### 3.4.2 State Management

The application uses a custom React hook (`useDebateWebSocket`) for all debate state:

**States:**
- `idle` - Initial state, showing topic input.
- `connecting` - WebSocket connection in progress.
- `generating` - AI is generating personas/avatars.
- `debating` - Active debate rounds.
- `verdict` - Verdict received from server.
- `finished` - Debate complete.
- `error` - Error state with retry option.

**State Data:**
- `setup` - Debate configuration and agent personas.
- `messages` - Array of all debate messages with audio/video data.
- `analyses` - Array of sentiment analysis results.
- `verdict` - Final verdict object.
- `pauseData` - Interjection window data (next round name, timeout).

#### 3.4.3 Key UI Components

**TopicInput:** Full-screen input interface with tab switching (topic vs. transcript), language selector grid, advanced settings panel (agents/rounds/constraints), example topics per language, sample transcripts, demo mode button, and sensitivity warning modal.

**DebateStage:** Main debate visualization supporting two modes:
- **Static Avatar Mode:** Canvas-animated avatars with lip-sync, spotlight layout highlighting the active speaker.
- **Video Mode:** D-ID talking-head video player with side panel showing all agents.

Includes voice on/off toggle, pause/resume controls, stop button with confirmation, round progress bar, thinking indicator, interjection modal overlay.

**AnimatedAvatar:** HTML Canvas-based avatar with real-time lip-sync animation driven by audio amplitude. Supports states: idle, speaking, listening, thinking. Features breathing animation, head bobbing, and mouth movement synchronized with audio.

**SpeechSynthesis:** Web Audio API wrapper for decoding and playing base64 MP3 audio. Provides amplitude data for lip-sync, and supports pause/resume/stop controls.

**SentimentChart:** Floating chart showing per-agent sentiment scores across rounds.

**FactCheckOverlay:** Toggleable panel listing all fact-checked claims with verdicts (true/mostly_true/unverified/misleading/false) and confidence scores.

### 3.5 Data Models

#### 3.5.1 Backend Models (Pydantic)

**AgentPersona:**
```python
class AgentPersona(BaseModel):
    name: str              # Full name matching cultural background
    role: str              # Job title/role
    industry: str          # Relevant industry
    stance: str            # "for", "against", "neutral"
    expertise: str         # Area of expertise
    personality: str       # Discussion style and traits
    avatar_color: str      # Hex color (e.g., "#6366F1")
    avatar_emoji: str      # Emoji identifier
    gender: str            # "male", "female"
    accent: str            # "indian", "american", "british"
    emotional_style: str   # How they express emotions
    avatar_image: str | None  # Base64 AI-generated portrait
```

**DebateMessage:**
```python
class DebateMessage(BaseModel):
    agent: AgentPersona
    content: str           # The argument text
    round_name: str        # e.g., "Opening Statements"
    round_number: int      # 0-based round index
    video_url: str | None  # D-ID video URL (optional)
```

**DebateSetup:**
```python
class DebateSetup(BaseModel):
    topic: str
    industry: str
    agents: list[AgentPersona]
    total_rounds: int
    language: str = "english"
```

**DebateRequest:**
```python
class DebateRequest(BaseModel):
    topic: str
    language: str = "english"
    demo: bool = False
    transcript: str | None = None
    num_agents: int = 3
    num_rounds: int = 4
    persona_constraints: str = ""
```

#### 3.5.2 Frontend Types (TypeScript)

```typescript
interface AgentPersona {
  name: string; role: string; industry: string; stance: string;
  expertise: string; personality: string; avatar_color: string;
  avatar_emoji: string; gender: string; accent: string;
  emotional_style: string; avatar_image?: string | null;
}

interface DebateMessage {
  agent: AgentPersona; content: string; round_name: string;
  round_number: number; audio?: string; video_url?: string | null;
}

interface DebateSetup {
  topic: string; industry: string; agents: AgentPersona[];
  total_rounds: number;
}

interface AnalysisResult {
  agent_name: string; round_number: number; round_name: string;
  sentiment: { persuasiveness: number; emotional_impact: number;
    factual_strength: number; overall: number; };
  fact_check?: FactCheck[];
}

interface Verdict {
  winner: string; winner_role: string; winner_stance: string;
  conclusion: string; reasoning: string;
  scores: { name: string; role: string; score: number; strength: string }[];
}
```

### 3.6 API Specification

#### 3.6.1 REST Endpoints

**GET /health**
- Response: `{"status": "ok"}`

**POST /api/check-topic**
- Request Body: `{"topic": "string"}`
- Response:
```json
{
  "level": "low | medium | high",
  "categories": ["technology", "political", ...],
  "warning": "Brief sensitivity description",
  "suggestion": "Optional rephrased topic or empty string"
}
```

### 3.7 WebSocket Protocol

#### Connection: `ws://localhost:8000/ws/debate`

#### Client-to-Server Messages

**Debate Request (sent on connection):**
```json
{
  "topic": "Should AI replace teachers?",
  "language": "english",
  "demo": false,
  "transcript": null,
  "num_agents": 3,
  "num_rounds": 4,
  "persona_constraints": ""
}
```

**Interjection (sent during round_pause):**
```json
{
  "type": "interjection",
  "text": "What about the cost implications?"
}
```

**Skip Interjection:**
```json
{
  "type": "skip"
}
```

#### Server-to-Client Events

| Event Type | Description | Data Fields |
|------------|-------------|-------------|
| `status` | Progress status message | `message: string` |
| `setup` | Debate configuration with personas | Full `DebateSetup` object |
| `round_start` | New round begins | `round_number, round_name` |
| `agent_thinking` | Agent is preparing argument | `agent_name` |
| `agent_message` | Agent's argument with audio | Full `DebateMessage` + `audio` (base64) + `video_url` |
| `analysis` | Sentiment analysis result | `agent_name, round_number, round_name, sentiment, fact_check` |
| `round_end` | Round completed | `round_number, round_name` |
| `round_pause` | Interjection window open | `after_round, next_round, timeout_seconds` |
| `interjection_received` | User interjection acknowledged | `text` |
| `verdict` | Final debate verdict | Full verdict object |
| `debate_end` | Debate session complete | `{}` |
| `error` | Error occurred | `message: string` |

### 3.8 AI/ML Integration

#### 3.8.1 LLM (Groq - Llama 3.3 70B Versatile)

All LLM interactions go through the Groq API with the `llama-3.3-70b-versatile` model:

- **Temperature:** 0.7 (balanced creativity/consistency)
- **Max Tokens:** 1024
- **Rate Limiting:** Exponential backoff with up to 5 retries, capped at 30-second wait
- **Response Format:** All prompts instruct the model to return valid JSON only

**Prompt Types:**
1. **Setup Prompt:** Generates diverse debate personas from a topic.
2. **Transcript Prompt:** Extracts topic and generates personas from conversation.
3. **Sensitivity Prompt:** Classifies topic sensitivity level.
4. **Agent Prompt:** Generates individual debate arguments (per turn, per agent, per round).
5. **Analysis Prompt:** Produces sentiment scores and fact-checks for arguments.
6. **Verdict Prompt:** Generates final debate verdict with winner and scores.

#### 3.8.2 Image Generation (FLUX.1)

- Model: FLUX.1-merged / FLUX.1-schnell
- Resolution: 512x512
- Inference Steps: 4
- Prompt Engineering: Detailed character descriptions including ethnicity, gender, age, professional attire, Pixar/Disney 3D style, studio lighting

#### 3.8.3 Text-to-Speech (Edge TTS)

- Engine: Microsoft Edge Neural TTS (free, cloud-based)
- Voice Count: 34+ voices across 17 languages
- Output: MP3 audio encoded as base64

### 3.9 Third-Party Service Integration

| Service | Authentication | Endpoint | Rate Limits |
|---------|---------------|----------|-------------|
| Groq API | Bearer token | `https://api.groq.com/openai/v1/chat/completions` | Free tier with generous limits; 429 with retry-after header |
| HF Spaces | Optional token (for quota) | Gradio Client to `multimodalart/FLUX.1-merged` | ZeroGPU quota (higher with token) |
| Together.ai | Bearer token | `https://api.together.xyz/v1/images/generations` | Free credits on signup |
| HF Inference | Bearer token | `https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell` | Token-based quota |
| DiceBear | None | `https://api.dicebear.com/9.x/adventurer/png` | Public API, no limits |
| D-ID | Basic auth | `https://api.d-id.com` | Free trial ~5 min video / 20 credits |
| Edge TTS | None | Microsoft cloud | No explicit limits |

### 3.10 Configuration and Environment

#### Environment Variables (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for LLM access |
| `HF_API_TOKEN` | Recommended | Hugging Face token for AI avatar generation |
| `TOGETHER_API_KEY` | Optional | Together.ai key for faster avatar generation |
| `D_ID_API_KEY` | Optional | D-ID key for talking-head video generation |

#### Application Constants (config.py)

| Constant | Value | Description |
|----------|-------|-------------|
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | LLM model identifier |
| `MAX_AGENTS` | 3 | Default number of agents |
| `MIN_AGENTS` | 2 | Minimum agents allowed |
| `MAX_AGENTS_LIMIT` | 5 | Maximum agents allowed |
| `DEBATE_ROUNDS` | 4 | Default number of rounds |
| `MIN_ROUNDS` | 2 | Minimum rounds allowed |
| `MAX_ROUNDS` | 8 | Maximum rounds allowed |

### 3.11 Deployment

#### Prerequisites

- Python 3.10+
- Node.js 18+
- Active internet connection (for external API access)

#### Backend Setup

```bash
cd Debate2Decision/backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with API keys
python main.py  # Runs on http://localhost:8000
```

#### Frontend Setup

```bash
cd Debate2Decision/frontend
npm install
npm run dev    # Development: http://localhost:3000
# OR
npm run build && npm run start  # Production
```

#### Port Configuration

| Service | Port | Protocol |
|---------|------|----------|
| Backend API | 8000 | HTTP + WebSocket |
| Frontend | 3000 | HTTP |

---

## 4. Appendix

### 4.1 Supported Languages

| Language | Code | Script | TTS Voices | Native Name |
|----------|------|--------|------------|-------------|
| English | english | Latin | 6 voices (M/F x IN/US/GB) | English |
| Hindi | hindi | Devanagari | 2 voices (M/F) | हिन्दी |
| Tamil | tamil | Tamil | 2 voices (M/F) | தமிழ் |
| Telugu | telugu | Telugu | 2 voices (M/F) | తెలుగు |
| Kannada | kannada | Kannada | 2 voices (M/F) | ಕನ್ನಡ |
| Malayalam | malayalam | Malayalam | 2 voices (M/F) | N/A |
| Bengali | bengali | Bengali | 2 voices (M/F) | বাংলা |
| Marathi | marathi | Devanagari | 2 voices (M/F) | मराठी |
| Gujarati | gujarati | Gujarati | 2 voices (M/F) | N/A |
| Spanish | spanish | Latin | 2 voices (M/F) | Español |
| French | french | Latin | 2 voices (M/F) | Français |
| German | german | Latin | 2 voices (M/F) | Deutsch |
| Japanese | japanese | Kanji/Kana | 2 voices (M/F) | 日本語 |
| Chinese | chinese | Simplified Chinese | 2 voices (M/F) | 中文 |
| Korean | korean | Hangul | 2 voices (M/F) | 한국어 |
| Arabic | arabic | Arabic | 2 voices (M/F) | العربية |
| Portuguese | portuguese | Latin | 2 voices (M/F) | Português |

### 4.2 WebSocket Event Sequence Diagram

```
Client                          Server
  |                               |
  |--- Connect WebSocket -------->|
  |--- DebateRequest JSON ------->|
  |                               |
  |<------ status (analyzing) ----|
  |<------ status (portraits) ----|
  |<------ setup (personas) ------|
  |                               |
  |  [For each round:]            |
  |<------ round_start -----------|
  |  [For each agent:]            |
  |<------ agent_thinking --------|
  |<------ agent_message + audio -|
  |<------ analysis --------------|
  |<------ round_end -------------|
  |<------ round_pause -----------|
  |--- interjection (optional) -->|
  |<------ interjection_received -|
  |                               |
  |<------ status (deliberating) -|
  |<------ verdict ---------------|
  |<------ debate_end ------------|
  |                               |
```

### 4.3 Avatar Generation Fallback Chain

```
Request Avatar
    |
    v
[Tier 1] HF Space FLUX.1 (Free)
    |-- Success --> Return base64 PNG
    |-- Fail ----v
[Tier 2] Together.ai FLUX (API Key)
    |-- Success --> Return base64 PNG
    |-- Fail ----v
[Tier 3] HF Router FLUX (HF Token)
    |-- Success --> Return base64 PNG
    |-- Fail ----v
[Tier 4] DiceBear Adventurer (No key)
    |-- Success --> Return base64 PNG
    |-- Fail ----> Return None (no avatar)
```

### 4.4 Debate Round Selection Logic

| Configured Rounds | Selected Rounds |
|-------------------|-----------------|
| 2 | Opening Statements, Closing Statements |
| 3 | Opening Statements, Cross-Examination, Closing Statements |
| 4 | Opening Statements, Cross-Examination, Rebuttals, Deep Dive |
| 5+ | Opening Statements + middle rounds + Closing Statements |

---

*Document generated for the Debate 2 Decision AI project by Binary Beasts.*
