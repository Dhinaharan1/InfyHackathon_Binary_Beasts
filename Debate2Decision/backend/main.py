import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import DebateRequest
from fastapi import Body
from orchestrator import generate_debate_setup, generate_debate_from_transcript, check_topic_sensitivity, analyze_message
from debate_engine import DebateEngine, ROUND_NAMES
from demo_data import (
    DEMO_SETUP, DEMO_MESSAGES, DEMO_VERDICT,
    DEMO_TRANSCRIPT_SETUP, DEMO_TRANSCRIPT_MESSAGES, DEMO_TRANSCRIPT_VERDICT,
)
from tts import generate_speech
from avatar_generator import generate_all_avatars
from video_generator import generate_talk_video, is_video_enabled

app = FastAPI(title="Debate 2 Decision AI")

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
async def check_topic(body: dict = Body(...)):
    topic = body.get("topic", "")
    if not topic.strip():
        return {"level": "low", "categories": [], "warning": "", "suggestion": ""}
    return await check_topic_sensitivity(topic.strip())


@app.websocket("/ws/debate")
async def debate_websocket(websocket: WebSocket):
    await websocket.accept()

    try:
        data = await websocket.receive_text()
        request = DebateRequest(**json.loads(data))

        if request.demo and request.transcript:
            await _run_demo_debate(websocket, DEMO_TRANSCRIPT_SETUP, DEMO_TRANSCRIPT_MESSAGES, DEMO_TRANSCRIPT_VERDICT)
        elif request.demo:
            await _run_demo_debate(websocket, DEMO_SETUP, DEMO_MESSAGES, DEMO_VERDICT)
        else:
            if request.transcript:
                await websocket.send_text(json.dumps({
                    "type": "status",
                    "data": {"message": "Analyzing chat transcript and extracting debate topic..."},
                }))
                setup = await generate_debate_from_transcript(request.transcript, request.language)
            else:
                await websocket.send_text(json.dumps({
                    "type": "status",
                    "data": {"message": "Analyzing topic and generating debate personas..."},
                }))
                setup = await generate_debate_setup(request.topic, request.language)

            await websocket.send_text(json.dumps({
                "type": "status",
                "data": {"message": "Generating AI portraits for debate personas..."},
            }))

            avatars = await generate_all_avatars(setup.agents)
            for i, avatar in enumerate(avatars):
                if avatar:
                    setup.agents[i].avatar_image = avatar

            engine = DebateEngine(setup)

            async for event in engine.run_debate():
                await websocket.send_text(json.dumps(event))

                if event["type"] == "round_pause":
                    try:
                        user_msg = await asyncio.wait_for(
                            websocket.receive_text(), timeout=30
                        )
                        user_data = json.loads(user_msg)
                        if user_data.get("type") == "interjection" and user_data.get("text", "").strip():
                            engine.add_interjection(
                                user_data["text"].strip(),
                                event["data"]["after_round"],
                            )
                            await websocket.send_text(json.dumps({
                                "type": "interjection_received",
                                "data": {"text": user_data["text"].strip()},
                            }))
                    except asyncio.TimeoutError:
                        pass
                    except Exception:
                        pass

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "data": {"message": str(e)},
        }))
        await websocket.close()


async def _run_demo_debate(websocket: WebSocket, demo_setup=None, demo_messages=None, demo_verdict=None):
    demo_setup = demo_setup or DEMO_SETUP
    demo_messages = demo_messages or DEMO_MESSAGES
    demo_verdict = demo_verdict or DEMO_VERDICT

    await websocket.send_text(json.dumps({
        "type": "status",
        "data": {"message": "Generating AI portraits for debate personas..."},
    }))

    avatars = await generate_all_avatars(demo_setup.agents)
    setup_data = demo_setup.model_dump()
    for i, avatar in enumerate(avatars):
        if avatar:
            setup_data["agents"][i]["avatar_image"] = avatar

    await websocket.send_text(json.dumps({
        "type": "status",
        "data": {"message": "Loading demo debate..."},
    }))
    await asyncio.sleep(1)

    await websocket.send_text(json.dumps({
        "type": "setup",
        "data": setup_data,
    }))

    use_video = is_video_enabled()

    for round_num in range(len(ROUND_NAMES)):
        await websocket.send_text(json.dumps({
            "type": "round_start",
            "data": {"round_number": round_num, "round_name": ROUND_NAMES[round_num]},
        }))

        round_msgs = [m for m in demo_messages if m.round_number == round_num]
        for msg in round_msgs:
            await websocket.send_text(json.dumps({
                "type": "agent_thinking",
                "data": {"agent_name": msg.agent.name},
            }))

            agent_index = next(
                (i for i, a in enumerate(demo_setup.agents) if a.name == msg.agent.name), 0
            )

            video_url = None
            audio_base64 = None

            if use_video:
                avatar_img = setup_data["agents"][agent_index].get("avatar_image")
                if avatar_img:
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "data": {"message": f"Generating video for {msg.agent.name}..."},
                    }))
                    video_url = await generate_talk_video(
                        avatar_img, msg.content, msg.agent.gender, msg.agent.accent
                    )

            if not video_url:
                audio_base64 = await generate_speech(
                    msg.content, msg.agent.gender, msg.agent.accent, agent_index, demo_setup.language
                )

            msg_data = {**msg.model_dump(), "audio": audio_base64, "video_url": video_url}
            await websocket.send_text(json.dumps({
                "type": "agent_message",
                "data": msg_data,
            }))

            analysis = await analyze_message(
                msg.agent.name, msg.agent.role, msg.agent.stance,
                demo_setup.topic, ROUND_NAMES[round_num], msg.content,
            )
            if analysis:
                await websocket.send_text(json.dumps({
                    "type": "analysis",
                    "data": {
                        "agent_name": msg.agent.name,
                        "round_number": round_num,
                        "round_name": ROUND_NAMES[round_num],
                        **analysis,
                    },
                }))

            await asyncio.sleep(0.5)

        await websocket.send_text(json.dumps({
            "type": "round_end",
            "data": {"round_number": round_num, "round_name": ROUND_NAMES[round_num]},
        }))

    await websocket.send_text(json.dumps({
        "type": "status",
        "data": {"message": "Judges are deliberating..."},
    }))
    await asyncio.sleep(2)

    await websocket.send_text(json.dumps({
        "type": "verdict",
        "data": demo_verdict,
    }))

    await websocket.send_text(json.dumps({
        "type": "debate_end",
        "data": {},
    }))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
