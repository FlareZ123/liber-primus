"""Frozen semantic rank gate for Director #2656. Unknown LP2 never scored."""
import json
import subprocess
from pathlib import Path
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

ROOT = Path(__file__).resolve().parents[1]
MODEL = "distilbert/distilgpt2"
REV = "f241065e938b44ac52db2c5de82c8bd2fafc76d0"
torch.set_num_threads(2)
tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REV)
model = AutoModelForCausalLM.from_pretrained(MODEL, revision=REV, use_safetensors=True).eval()
raw = subprocess.check_output(["node", str(ROOT / "sims/lp2_semantic_running_key_controls_sft.cjs")], cwd=ROOT)
controls = json.loads(raw)["controls"]
assert len(controls) == 6

@torch.inference_mode()
def ll(text):
    ids = tokenizer(text, add_special_tokens=False).input_ids
    ids = torch.tensor([[tokenizer.bos_token_id] + ids], dtype=torch.long)
    assert ids.shape[1] <= model.config.n_positions
    logits = model(ids, use_cache=False).logits[:, :-1, :]
    return float(torch.log_softmax(logits, dim=-1).gather(-1, ids[:, 1:, None]).sum())

def score(pair, n):
    a = ll(pair["render"]["P"])
    b = ll(pair["render"]["K"])
    return {"P": a, "K": b, "jointPerRune": (a+b)/n}

for c in controls:
    for k in ("truth", "wrong4", "wrong6", "uniform"):
        c[k]["semantic"] = score(c[k], c["n"])
    c["outranksBoth"] = c["truth"]["semantic"]["jointPerRune"] > max(c[k]["semantic"]["jointPerRune"] for k in ("wrong4", "wrong6"))
    print(c["name"], {k: c[k]["semantic"] for k in ("truth", "wrong4", "wrong6", "uniform")}, flush=True)
floor = min(c["truth"]["semantic"]["jointPerRune"] for c in controls)
ranked = sum(c["outranksBoth"] for c in controls)
false_positive = sum(c["uniform"]["semantic"]["jointPerRune"] >= floor for c in controls)
result = {"model": MODEL, "revision": REV, "ranked": ranked, "uniformFalsePositives": false_positive, "gatePass": ranked >= 5 and false_positive == 0, "controls": controls}
out = ROOT / "im-results/lp2-semantic-running-key-distilgpt2.json"
out.write_text(json.dumps(result, indent=2), encoding="utf-8")
print(json.dumps({k:v for k,v in result.items() if k != "controls"}), flush=True)
