"""FastAPI service that answers `POST /generate` with template DSL.

    uvicorn ai.serve:app --host 127.0.0.1 --port 8000

Set MODEL_DIR to the fine-tuned directory (default models/template-t5). The
Node server points at this service with AI_URL=http://127.0.0.1:8000 and
falls back to its rules engine whenever this service is down.
"""
from __future__ import annotations

import os
from pathlib import Path

import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

try:
    from .codec import decode_text, encode_text
except ImportError:  # run from inside ai/
    from codec import decode_text, encode_text

PREFIX = "Generate an email template.\nRequest: "
REFINE_PREFIX = "Edit an email template.\nCurrent:\n{dsl}\nInstruction: {instruction}"
MAX_INPUT = 640
MODEL_DIR = os.environ.get("MODEL_DIR", "models/template-t5")
MAX_NEW_TOKENS = int(os.environ.get("MAX_NEW_TOKENS", "512"))

torch.set_num_threads(int(os.environ.get("TORCH_THREADS", str(max(1, os.cpu_count() or 1)))))
DEVICE = os.environ.get("DEVICE") or ("cuda" if torch.cuda.is_available() else "cpu")

app = FastAPI(title="Email template model")
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_DIR).to(DEVICE).eval()
print(f"model {MODEL_DIR} loaded on {DEVICE}")


class GenerateRequest(BaseModel):
    prompt: str
    options: dict | None = None
    mode: str = "generate"
    current: str | None = None
    instruction: str | None = None


def build_prompt(req: GenerateRequest) -> str:
    if req.mode == "refine" and req.current and req.instruction:
        return REFINE_PREFIX.format(dsl=req.current.strip(), instruction=req.instruction.strip())
    text = req.prompt.strip()
    options = req.options or {}
    hints = []
    if options.get("type") and options["type"] != "auto":
        hints.append(f"Type: {options['type']}.")
    if options.get("tone") and options["tone"] != "auto":
        hints.append(f"Tone: {options['tone']}.")
    if options.get("company"):
        hints.append(f"Company: {options['company']}.")
    if options.get("brand"):
        hints.append(f"Brand colour {options['brand']}.")
    return PREFIX + " ".join([text, *hints])


@app.get("/health")
def health() -> dict:
    return {"ok": True, "model": Path(MODEL_DIR).name, "device": DEVICE}


@app.post("/generate")
def generate(req: GenerateRequest) -> dict:
    text = encode_text(build_prompt(req))
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=MAX_INPUT).to(DEVICE)
    with torch.inference_mode():
        output = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            num_beams=2,
            no_repeat_ngram_size=0,
            early_stopping=True,
        )
    dsl = decode_text(tokenizer.decode(output[0], skip_special_tokens=True))
    return {"dsl": dsl}
