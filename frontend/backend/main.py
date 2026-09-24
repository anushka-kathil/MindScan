from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random

# Import your model logic (hooks for later)
# from text_model import predict_text
# from face_model import process_frames
# from fusion import combine_results

app = FastAPI(title="MindScan AI Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScreeningData(BaseModel):
    answers: List[str]
    facial_frames: List[str]  # Base64 strings

@app.get("/")
async def root():
    return {"status": "online", "message": "MindScan API is running"}

@app.post("/api/predict")
async def predict(data: ScreeningData):
    try:
        # 1. Process text answers with RoBERTa
        # text_score = predict_text(data.answers)
        text_score = random.randint(0, 27) 
        
        # 2. Process facial frames
        # face_score = process_frames(data.facial_frames)
        face_score = random.randint(0, 27)

        # 3. Fusion Logic
        # final_score = combine_results(text_score, face_score)
        final_score = int((text_score + face_score) / 2)

        # Map to severity
        severity = "minimal"
        if final_score >= 20: severity = "severe"
        elif final_score >= 15: severity = "moderately_severe"
        elif final_score >= 10: severity = "moderate"
        elif final_score >= 5: severity = "mild"

        return {
            "phq9_score": final_score,
            "text_confidence": round(random.uniform(0.7, 0.95), 2),
            "facial_confidence": round(random.uniform(0.65, 0.9), 2),
            "severity": severity,
            "fusion_score": final_score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
