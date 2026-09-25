"""Fine-tune a seq2seq model to turn an email request into template DSL.

    python ai/train.py                       # uses data/train.jsonl + data/eval.jsonl
    python ai/train.py --epochs 5 --model google/flan-t5-base

Device is picked automatically:
  * NVIDIA GPU (e.g. RTX 4060 8 GB): bf16, batch 16, flan-t5-base by default.
    4k examples × 3 epochs takes a few minutes. flan-t5-large also fits in
    8 GB with --batch 4 --grad-accum 4.
  * CPU (VPS): fp32, batch 8, flan-t5-small by default. 20-40 minutes.

The saved model directory is portable: train on the GPU box, copy
models/template-t5 to the VPS and serve it there on CPU.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from datasets import Dataset
from transformers import (
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
    DataCollatorForSeq2Seq,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
)

PREFIX = "Generate an email template.\nRequest: "
# Refinement rows from the dataset script already carry their own prefix
# ("Edit an email template.\nCurrent: ... Instruction: ..."), matching what
# serve.py sends at inference time, so only generation rows get PREFIX.
REFINE_PREFIX = "Edit an email template."


def with_prefix(prompt: str) -> str:
    return prompt if prompt.startswith(REFINE_PREFIX) else PREFIX + prompt
# Refinement examples carry the current DSL in the input, so allow ~640 tokens.
MAX_INPUT = 640
MAX_OUTPUT = 512


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def pick_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def main() -> None:
    device = pick_device()
    gpu = device == "cuda"
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="google/flan-t5-base" if gpu else "google/flan-t5-small")
    parser.add_argument("--data", default="data")
    parser.add_argument("--out", default="models/template-t5")
    parser.add_argument("--epochs", type=float, default=3)
    parser.add_argument("--batch", type=int, default=16 if gpu else 8)
    parser.add_argument("--grad-accum", type=int, default=1)
    parser.add_argument("--lr", type=float, default=3e-4 if gpu else 5e-4)
    parser.add_argument("--no-bf16", action="store_true", help="disable bf16 on GPU")
    args = parser.parse_args()

    bf16 = gpu and not args.no_bf16 and torch.cuda.is_bf16_supported()
    if gpu:
        name = torch.cuda.get_device_name(0)
        vram = torch.cuda.get_device_properties(0).total_memory / 2**30
        print(f"device=cuda ({name}, {vram:.1f} GB) bf16={bf16}")
    else:
        print(f"device={device}")

    data_dir = Path(args.data)
    train = load_jsonl(data_dir / "train.jsonl")
    evaluation = load_jsonl(data_dir / "eval.jsonl")
    print(f"train={len(train)} eval={len(evaluation)} model={args.model}")

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForSeq2SeqLM.from_pretrained(args.model)

    def encode(batch):
        inputs = tokenizer(
            [with_prefix(p) for p in batch["prompt"]],
            max_length=MAX_INPUT,
            truncation=True,
        )
        labels = tokenizer(
            text_target=batch["dsl"],
            max_length=MAX_OUTPUT,
            truncation=True,
        )
        inputs["labels"] = labels["input_ids"]
        return inputs

    train_ds = Dataset.from_list(train).map(encode, batched=True, remove_columns=["prompt", "dsl"])
    eval_ds = Dataset.from_list(evaluation).map(encode, batched=True, remove_columns=["prompt", "dsl"])

    training_args = Seq2SeqTrainingArguments(
        output_dir=args.out,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch,
        per_device_eval_batch_size=args.batch,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr,
        weight_decay=0.01,
        warmup_ratio=0.05,
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=2,
        logging_steps=25,
        predict_with_generate=False,
        report_to=[],
        use_cpu=device == "cpu",
        bf16=bf16,
        # T5 overflows in fp16; bf16 (Ampere/Ada GPUs) is the safe half precision.
        fp16=False,
        dataloader_num_workers=2 if gpu else 0,
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        data_collator=DataCollatorForSeq2Seq(tokenizer, model=model),
    )
    trainer.train()
    trainer.save_model(args.out)
    tokenizer.save_pretrained(args.out)
    print(f"saved fine-tuned model to {args.out}")


if __name__ == "__main__":
    main()
