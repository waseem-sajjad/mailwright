# AI template generation

Two engines produce the compact template DSL (see `../src/dsl.ts`):

1. **Rules engine** (TypeScript, always available). Keyword analysis picks
   the email type, industry, tone, company and brand colour, then a blueprint
   composes rows from copy banks. It is the fallback and the dataset source.
2. **Fine-tuned model** (Python, optional). `google/flan-t5-small` fine-tuned
   on prompt → DSL pairs, served by FastAPI on CPU. The Node server calls it
   when `AI_URL` is set and healthy.

The DSL is deliberately short (150-300 tokens) so a small model can learn it
and a normal VPS can run inference in a few seconds.

## 1. Build the dataset

```bash
cd apps/server
pnpm dataset                 # data/train.jsonl + data/eval.jsonl (4000 examples)
COUNT=10000 pnpm dataset     # bigger
```

Generations that users rated 👍 in the web UI are appended automatically, so
the model improves as people use it. Retrain after collecting feedback.

## 2. Fine-tune

### On your PC with an NVIDIA GPU (recommended: RTX 4060 8 GB, 32 GB RAM)

Works from WSL2 (Ubuntu) exactly like native Linux. Requirements:

- The **Windows** NVIDIA driver (Game Ready or Studio). Do **not** install a
  Linux driver inside WSL; the GPU is exposed through `/dev/dxg`.
- `nvidia-smi` inside WSL should list the RTX 4060. If it does not, update the
  Windows driver and run `wsl --shutdown` from PowerShell.
- `sudo apt install python3-venv python3-pip` once.
- WSL caps RAM at half of the machine by default. For comfortable training
  put this in `C:\Users\<you>\.wslconfig`, then `wsl --shutdown`:

  ```ini
  [wsl2]
  memory=24GB
  processors=8
  ```

```bash
cd apps/server
python3 -m venv .venv && source .venv/bin/activate
pip install -r ai/requirements-gpu.txt                # CUDA 12.4 wheels (~3 GB download)
python3 ai/pipeline.py --count 8000 --epochs 4        # dataset → train → smoke test
```

The Windows browser reaches WSL ports directly, so `pnpm dev` (3000 / 8787)
and `uvicorn` (8000) all work at `http://localhost:…` from Windows.

`train.py` detects CUDA and switches to `google/flan-t5-base` (250M params)
with bf16 and batch 16; 8k examples × 4 epochs takes about 10 minutes on a
4060. For a stronger model try `--model google/flan-t5-large --batch 4
--grad-accum 4` (fits in 8 GB with bf16).

### On a CPU-only VPS

```bash
cd apps/server
bash ai/setup.sh                        # venv + CPU torch + transformers
source .venv/bin/activate
python3 ai/pipeline.py                  # flan-t5-small, ~30 min on 4 vCPU
```

Either way the model is saved to `models/template-t5`. The directory is
portable: train on the GPU box, then copy it to the VPS
(`rsync -a models/ user@vps:/srv/email-template-builder/apps/server/models/`)
and serve it there on CPU. flan-t5-base answers in 2-5 s on 2 vCPU.

## 3. Serve the model

```bash
MODEL_DIR=models/template-t5 uvicorn ai.serve:app --host 127.0.0.1 --port 8000
```

Then run the Node server with `AI_URL=http://127.0.0.1:8000`. `GET /api/health`
reports `engine: "model"` when the service is reachable.

## VPS deployment (Ubuntu, 2 vCPU / 4 GB)

```bash
# build once
pnpm install && pnpm build                 # web → apps/web/dist, server → apps/server/dist

# /etc/systemd/system/email-model.service
[Service]
WorkingDirectory=/srv/email-template-builder/apps/server
Environment=MODEL_DIR=models/template-t5 TORCH_THREADS=2
ExecStart=/srv/email-template-builder/apps/server/.venv/bin/uvicorn ai.serve:app --host 127.0.0.1 --port 8000
Restart=always

# /etc/systemd/system/email-server.service
[Service]
WorkingDirectory=/srv/email-template-builder/apps/server
Environment=PORT=8787 AI_URL=http://127.0.0.1:8000 DATA_DIR=/srv/email-data
ExecStart=/usr/bin/node --no-warnings=ExperimentalWarning dist/index.mjs
Restart=always
```

The Node server serves the built web app itself when `apps/web/dist` exists,
so a reverse proxy only needs to forward port 80/443 to 8787. SQLite lives in
`DATA_DIR/app.db`, screenshots in `DATA_DIR/screenshots`.

## Files

- `setup.sh` – creates the virtualenv and installs CPU wheels.
- `pipeline.py` – dataset → fine-tune → smoke test in one command.
- `train.py` – Seq2Seq fine-tuning with 🤗 Transformers.
- `serve.py` – FastAPI inference service (`/health`, `/generate`).
- `requirements.txt` – CPU wheels for torch (VPS).
- `requirements-gpu.txt` – CUDA 12.4 wheels for a local NVIDIA GPU.
