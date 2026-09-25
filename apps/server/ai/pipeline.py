"""One-command pipeline: build the dataset, fine-tune, and sanity-check.

    python3 ai/pipeline.py                 # dataset (4000) → train (3 epochs) → smoke test
    python3 ai/pipeline.py --count 8000 --epochs 5
    python3 ai/pipeline.py --skip-dataset  # reuse data/*.jsonl

The dataset step shells out to the TypeScript rules engine (`pnpm dataset`)
so the model learns exactly the DSL the server can expand. Everything else is
Python: 🤗 Transformers fine-tuning on CPU, then a quick generation check
with the saved model.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def run(cmd: list[str], **env: str) -> None:
    print("$", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, cwd=ROOT, env={**os.environ, **env})


def smoke_test(model_dir: str) -> None:
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer  # noqa: WPS433

    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_dir).eval()
    prompts = [
        "Write a welcome email for Bluebird Coffee, a cafe. Keep it friendly.",
        "Create a sale email for Northwind (online store). Offer 30% off. Urgent tone.",
        "Monthly newsletter for Lumen Labs, a SaaS startup.",
    ]
    for prompt in prompts:
        inputs = tokenizer("Generate an email template.\nRequest: " + prompt, return_tensors="pt")
        output = model.generate(**inputs, max_new_tokens=512, num_beams=2)
        dsl = tokenizer.decode(output[0], skip_special_tokens=True)
        rows = [line for line in dsl.splitlines() if line.startswith("row")]
        print(f"\n--- {prompt}\n{dsl[:600]}\n({len(rows)} rows)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=4000)
    parser.add_argument("--epochs", type=float, default=3)
    parser.add_argument("--model", default="google/flan-t5-small")
    parser.add_argument("--out", default="models/template-t5")
    parser.add_argument("--skip-dataset", action="store_true")
    parser.add_argument("--skip-train", action="store_true")
    args = parser.parse_args()

    if not args.skip_dataset:
        run(["pnpm", "dataset"], COUNT=str(args.count))
    if not args.skip_train:
        run([
            sys.executable, "ai/train.py",
            "--model", args.model,
            "--epochs", str(args.epochs),
            "--out", args.out,
        ])
    smoke_test(args.out)
    print(f"\nDone. Serve with: MODEL_DIR={args.out} uvicorn ai.serve:app --port 8000")


if __name__ == "__main__":
    main()
