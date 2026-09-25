"""Text codec shared by train.py, serve.py and pipeline.py.

T5's SentencePiece vocabulary has no newline, "{" or "}" tokens; they are
dropped silently, which flattens the DSL into one line and turns
"{{first_name}}" into "first_name". Everything crossing the model boundary is
encoded with sentinels the tokenizer can see. Mirrored in src/prompts.ts.
"""
from __future__ import annotations

import re

NEWLINE = " @@ "


def encode_text(text: str) -> str:
    return text.replace("{{", "[[").replace("}}", "]]").replace("\r\n", "\n").replace("\n", NEWLINE)


def decode_text(text: str) -> str:
    text = re.sub(r"\s*@@\s*", "\n", text)
    text = re.sub(r"\[\[\s*", "{{", text)
    text = re.sub(r"\s*\]\]", "}}", text)
    return text.strip()
