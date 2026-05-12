import os
from google import genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# .env ගොනුව කියවීම
load_dotenv()

# API Key එක ලබාගෙන හිස්තැන් අයින් කිරීම
raw_key = os.getenv("GEMINI_API_KEY")
if not raw_key:
    print("❌ වැරදීමක්: .env ගොනුවේ GEMINI_API_KEY එක නැහැ!")
    API_KEY = "NO_KEY"
else:
    API_KEY = raw_key.strip()
    print("✅ API Key එක සාර්ථකව කියවා ගත්තා.")

# අලුත්ම Gemini Client එක
client = genai.Client(api_key=API_KEY)

app = FastAPI()

# SECURITY: CORS සීමා කිරීම (localhost සහ 127.0.0.1 දෙකටම අවසර දීම)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if API_KEY == "NO_KEY":
        raise HTTPException(status_code=500, detail="API Key එක හදලා නැහැ මචං!")
        
    try:
        def generate_chunks():
            # Streaming පණගැන්වීම
            responses = client.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=request.message,
                config={"system_instruction": "You are 'Machan AI', a witty Sri Lankan friend. Speak in Singlish/Sinhala."}
            )
            for chunk in responses:
                if chunk.text:
                    yield chunk.text

        # StreamingResponse එකක් ලෙස Frontend එකට එවීම
        return StreamingResponse(generate_chunks(), media_type="text/plain")

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Gemini එකෙන් පොඩි අවුලක් ආවා!")

if __name__ == "__main__":
    import uvicorn
    # Connection Reset ප්‍රශ්නය නැති වෙන්න host එක 0.0.0.0 දීම වඩාත් සුදුසුයි
    uvicorn.run(app, host="0.0.0.0", port=8000)