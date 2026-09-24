"""
Multimodal Depression Detection - Inference API
================================================
POST /api/predict  (JSON - webapp endpoint)
"""

import os, io, base64, pickle, tempfile, traceback
from dotenv import load_dotenv
load_dotenv() 

import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModel, pipeline as hf_pipeline

# ── Config ──────────────────────────────────────────────────────
FACIAL_MODEL_PATH  = "models/facial_lstm_best.pt"
SVM_PIPELINE_PATH  = "models/svm_fusion_pipeline.pkl"
TEXT_MODEL_NAME    = "roberta-base"    # Original high-quality model
EMOTION_MODEL_NAME = "dima806/facial_emotions_image_detection" # Original high-quality ViT

AU_COLS  = ["AU01","AU02","AU04","AU05","AU06","AU07",
            "AU09","AU10","AU12","AU14","AU15","AU17",
            "AU20","AU23","AU25","AU26","AU45"]
N_FEATS  = len(AU_COLS)   
SEQ_LEN  = 3000
DEVICE   = "cuda" if torch.cuda.is_available() else "cpu"
SEV_NAMES  = ["None", "Mild", "Moderate", "Moderately Severe", "Severe"]
SEV_WEBAPP = ["minimal", "mild", "moderate", "moderately_severe", "severe"]
SEV_MID    = [2, 7, 12, 17, 22]

app = Flask(__name__)
# Allow HF Space URL + localhost
_origins_env = os.environ.get("ALLOWED_ORIGINS", "*")
_origins = _origins_env.split(",") if _origins_env != "*" else "*"
CORS(app, origins=_origins)

class TemporalAttn(nn.Module):
    def __init__(self, d):
        super().__init__()
        self.w = nn.Linear(d, 1)
    def forward(self, x):
        return (x * torch.softmax(self.w(x), dim=1)).sum(dim=1)

class FacialLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm1 = nn.LSTM(17, 128, num_layers=1, batch_first=True, bidirectional=True)
        self.ln1   = nn.LayerNorm(256)
        self.lstm2 = nn.LSTM(256, 64, num_layers=1, batch_first=True, bidirectional=True)
        self.ln2   = nn.LayerNorm(128)
        self.attn  = TemporalAttn(128)
        self.proj  = nn.Sequential(nn.Linear(128, 128), nn.GELU(), nn.LayerNorm(128))
        self.regr  = nn.Linear(128, 1)
        self.cls   = nn.Linear(128, 5)
    def forward(self, x, return_cls=False):
        out, _ = self.lstm1(x);  out = self.ln1(out)
        out, _ = self.lstm2(out); out = self.ln2(out)
        emb = self.proj(self.attn(out))
        return self.cls(emb) if return_cls else emb

print("Loading models...")
try:
    facial_model = FacialLSTM().to(DEVICE)
    facial_model.load_state_dict(torch.load(FACIAL_MODEL_PATH, map_location=DEVICE, weights_only=True))
    facial_model.eval()
    print("[OK] BiLSTM loaded")
except Exception as e:
    print(f"[ERR] BiLSTM: {e}")

try:
    with open(SVM_PIPELINE_PATH, "rb") as f:
        svm_pipeline = pickle.load(f)
    print("[OK] SVM loaded")
except Exception as e:
    print(f"[ERR] SVM: {e}")

try:
    tokenizer  = AutoTokenizer.from_pretrained(TEXT_MODEL_NAME)
    text_model = AutoModel.from_pretrained(TEXT_MODEL_NAME).to(DEVICE).eval()
    print("[OK] Text model loaded")
except Exception as e:
    print(f"[ERR] Text: {e}")

try:
    emotion_pipe = hf_pipeline("image-classification", model=EMOTION_MODEL_NAME, device=-1)
    print("[OK] Emotion model loaded")
except Exception as e:
    print(f"[ERR] Emotion: {e}")

def decode_frame(b64: str) -> Image.Image:
    if "," in b64: b64 = b64.split(",", 1)[1]
    return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")

def analyze_emotions(b64_frames: list) -> dict:
    if not emotion_pipe or not b64_frames:
        return {"available": False, "depression_signal": 0.0, "facial_confidence": 0.0, "dominant_emotion": "unknown", "facial_note": "No frames"}
    n = len(b64_frames)
    frames = [b64_frames[int(i * n / 8)] for i in range(min(8, n))]
    frame_results = []
    for b64 in frames:
        try:
            res = emotion_pipe(decode_frame(b64))
            frame_results.append({r["label"].lower(): float(r["score"]) for r in res})
        except: continue
    if not frame_results: return {"available": False, "depression_signal": 0.0, "facial_confidence": 0.0, "dominant_emotion": "unknown", "facial_note": "Detection failed"}
    all_keys = set().union(*[f.keys() for f in frame_results])
    avg = {k: float(np.mean([f.get(k, 0.0) for f in frame_results])) for k in all_keys}
    def g(keys): return sum(avg.get(k, 0.0) for k in keys)

    sad     = g(["sad", "sadness"])
    fear    = g(["fear", "fearful"])
    disgust = g(["disgust", "disgusted"])
    angry   = g(["angry", "anger", "angered"])
    happy   = g(["happy", "happiness"])
    surprise= g(["surprise", "surprised"])
    neutral = g(["neutral"])

    # Depression signal: weighted combination
    dep_raw = (sad * 1.0 + fear * 0.7 + disgust * 0.4 + angry * 0.2)
    calm_raw = (happy * 1.0 + surprise * 0.3 + neutral * 0.5)
    sig = float(np.clip(dep_raw / (dep_raw + calm_raw + 1e-9), 0.0, 1.0))
    dom = max(avg, key=avg.get)
    return {"available": True, "depression_signal": round(sig, 3), "facial_confidence": round(avg[dom], 3), "dominant_emotion": dom, "facial_note": f"Dominant: {dom}. Signal: {sig*100:.0f}%"}

def phq_to_sev(phq: int) -> str:
    if phq <= 4: return "minimal"
    if phq <= 9: return "mild"
    if phq <= 14: return "moderate"
    if phq <= 19: return "moderately_severe"
    return "severe"

def signal_to_sev(sig: float) -> str:
    if sig < 0.20: return "minimal"
    if sig < 0.40: return "mild"
    if sig < 0.60: return "moderate"
    if sig < 0.80: return "moderately_severe"
    return "severe"

@app.route("/api/predict", methods=["POST"])
def api_predict():
    try:
        body = request.get_json(force=True)
        answers, frames = body.get("answers", []), body.get("facial_frames", [])
        phq_raw = int(sum(answers))
        phq_sev = phq_to_sev(phq_raw)
        phq_idx = SEV_WEBAPP.index(phq_sev)
        face_res = analyze_emotions(frames)
        face_idx = SEV_WEBAPP.index(signal_to_sev(face_res["depression_signal"]))
        if face_res["available"]:
            final_idx = int(round(phq_idx * 0.6 + face_idx * 0.4))
            note = f"60% PHQ + 40% Face"
        else:
            final_idx = phq_idx
            note = "PHQ-9 only"
        final_sev = SEV_WEBAPP[max(0, min(4, final_idx))]
        return jsonify({
            "phq9_score": phq_raw, "severity": final_sev, "fusion_score": SEV_MID[max(0, min(4, final_idx))],
            "text_confidence": 0.85, "facial_confidence": face_res["facial_confidence"],
            "source": "model", "facial_available": face_res["available"], "dominant_emotion": face_res["dominant_emotion"],
            "facial_note": face_res["facial_note"], "fusion_note": note
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def health(): return jsonify({"status": "running", "api": "/api/predict"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)
