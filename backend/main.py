import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# .env ගොනුවක් පසුව භාවිතා කිරීමට සූදානම් කරමු
load_dotenv()

# Gemini API Key එක මෙහි ඇතුළත් කරන්න
# (පසුව මෙය වඩාත් ආරක්ෂිතව .env ගොනුවකට දාමු)
GEMINI_API_KEY = "ඔබේ_GEMINI_API_KEY_එක_මෙහි_Paste_කරන්න"

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

# React frontend එකට backend එක සමඟ කතා කිරීමට අවසර දීම (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "Backend is running!"}

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        # AI එකෙන් පිළිතුර ලබා ගැනීම
        response = model.generate_content(request.message)
        return {"reply": response.text}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Server එක start කිරීම
    uvicorn.run(app, host="0.0.0.0", port=8000)