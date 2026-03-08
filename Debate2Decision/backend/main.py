import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import DebateRequest
from orchestrator import generate_debate_setup, check_topic_sensitivity
from debate_engine import DebateEngine

app = FastAPI(title="Multi-Agent Debate AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/check-topic")
async def check_topic(body: dict):
    topic = body.get("topic", "").strip()
    if not topic:
        return {"level": "safe", "categories": [], "warning": "", "suggestion": ""}
    return await check_topic_sensitivity(topic)


@app.websocket("/ws/debate")
async def debate_websocket(websocket: WebSocket):
    await websocket.accept()

    try:
        data = await websocket.receive_text()
        request = DebateRequest(**json.loads(data))

        await websocket.send_text(json.dumps({
            "type": "status",
            "data": {"message": "Analyzing topic and generating debate personas..."},
        }))

        setup = await generate_debate_setup(request.topic, request.language, request.num_agents, request.num_rounds, request.persona_constraints)
        engine = DebateEngine(setup, num_rounds=request.num_rounds)

        async for event in engine.run_debate():
            await websocket.send_text(json.dumps(event))

            if event["type"] == "round_pause":
                try:
                    raw = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                    client_msg = json.loads(raw)
                    if client_msg.get("type") == "interjection" and client_msg.get("content", "").strip():
                        engine.add_interjection(client_msg["content"].strip())
                        await websocket.send_text(json.dumps({
                            "type": "interjection_received",
                            "data": {"content": client_msg["content"].strip()},
                        }))
                except (asyncio.TimeoutError, json.JSONDecodeError):
                    pass

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "data": {"message": str(e)},
        }))
        await websocket.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
