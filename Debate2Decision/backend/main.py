import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import DebateRequest
from orchestrator import generate_debate_setup
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

        setup = await generate_debate_setup(request.topic, request.language)
        engine = DebateEngine(setup)

        async for event in engine.run_debate():
            await websocket.send_text(json.dumps(event))

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
