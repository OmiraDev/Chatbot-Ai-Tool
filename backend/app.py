import uvicorn
from main import app # ඔයාගේ main.py එකේ තියෙන FastAPI app එක import කිරීම

if __name__ == "__main__":
    # Hugging Face Spaces වැඩ කරන්නේ port 7860 එකේ නිසා ඒක අනිවාර්යයි
    uvicorn.run(app, host="0.0.0.0", port=7860)