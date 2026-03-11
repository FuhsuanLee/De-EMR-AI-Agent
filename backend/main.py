from fastapi import FastAPI, Body, Path
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from database import SqliteManager
from utils import LLMClient, RAGManager
from agent import Agent
from fastapi.responses import JSONResponse
from fastapi.exceptions import StarletteHTTPException
from fastapi import Request

import uuid
from database.tables import TN_Messages, TN_Session

cfg = get_settings()

db_storage_path = cfg["database"]["storage_path"]
db_name = cfg["database"]["db_name"]
db_manager = SqliteManager(db_name=db_name, storage_path=db_storage_path)

llm_client = LLMClient(
    api_key=cfg["openai"]["api_key"],
    model=cfg["openai"]["model"]
)
rag = RAGManager(storage_dir=cfg["rag"]["storage_dir"])

agent = Agent(llm_client=llm_client, rag=rag)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://agent.meta-ai.com.tw"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 405:
        return JSONResponse(
            status_code=404,
            content={"detail": "Not found"},
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/create_session/")
async def create_session(
    title: str = Body(..., embed=True)
):
    session_data = {
        "title": title
    }
    session_record = db_manager.insert(TN_Session, session_data)

    return {"result": session_record}

@app.get("/get_sessions/")
async def get_sessions():
    sessions = db_manager.select(
        TN_Session,
    )
    return {"result": sessions}

@app.delete("/delete_session/{session_id}/")
async def delete_session(
    session_id: str = Path(..., description="The session ID"),
):
    db_manager.delete(TN_Session, conditions={"id": uuid.UUID(session_id)})
    return {"result": True}

@app.post("/add_message/")
async def add_message(
    session_id: str = Body(..., embed=True),
    content: str = Body(..., embed=True)
):
    messages = db_manager.select(
        TN_Messages,
        conditions={"session_id": session_id},
    )
    current_turn_ordinal = len(messages) + 1
    user_message = {
        "session_id": session_id,
        "turn_ordinal": current_turn_ordinal,
        "role": "user",
        "content": content
    }
    user_record = db_manager.insert(TN_Messages, user_message)
    result = await agent.run(content)
    assistant_message = {
        "session_id": session_id,
        "turn_ordinal": current_turn_ordinal+1,
        "role": "assistant",
        "content": result
    }
    assistant_record = db_manager.insert(TN_Messages, assistant_message)
    return {"result": assistant_record}

@app.get("/get_messages/{session_id}/")
async def get_messages(
    session_id: str = Path(..., description="The session ID"),
):
    messages = db_manager.select(
        TN_Messages,
        conditions={"session_id": session_id},
    )
    for message in messages:
        del message["id"]
    return {"result": messages}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
