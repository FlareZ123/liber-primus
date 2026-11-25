"""Actual ciphertext-only semantic coordinate-beam recovery; Director #2656 stage two."""
import argparse
import json
import subprocess
from pathlib import Path

import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer

ROOT = Path(__file__).resolve().parents[1]
MODEL = "distilbert/distilgpt2"
REV = "f241065e938b44ac52db2c5de82c8bd2fafc76d0"
torch.set_num_threads(4)

class Server:
    def __init__(self):
        self.p = subprocess.Popen(
            ["node", str(ROOT / "sims/lp2_semantic_running_key_recovery_server.cjs")],
            cwd=ROOT, stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding="utf-8")
    def ask(self, **q):
        self.p.stdin.write(json.dumps(q) + "\n")
        self.p.stdin.flush()
        line = self.p.stdout.readline()
        if not line:
            raise RuntimeError("proposal server exited")
        response = json.loads(line)
        if "error" in response:
            raise RuntimeError(response["error"])
        return response["result"]
    def close(self):
        self.p.stdin.close()
        self.p.wait()

class Semantic:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL, revision=REV)
        self.model = AutoModelForCausalLM.from_pretrained(MODEL, revision=REV, use_safetensors=True).eval()
        self.cache = {}
    @torch.inference_mode()
    def fill(self, texts):
        missing = list(dict.fromkeys(x for x in texts if x not in self.cache))
        for i in range(0, len(missing), 8):
            batch = missing[i:i+8]
            seqs = [[self.tokenizer.bos_token_id] + self.tokenizer(x, add_special_tokens=False).input_ids for x in batch]
            size = max(map(len, seqs))
            assert size <= self.model.config.n_positions
            ids = torch.full((len(batch), size), self.tokenizer.eos_token_id, dtype=torch.long)
            mask = torch.zeros_like(ids)
            for j, seq in enumerate(seqs):
                ids[j,:len(seq)] = torch.tensor(seq)
                mask[j,:len(seq)] = 1
            logits = self.model(ids, attention_mask=mask, use_cache=False).logits[:, :-1, :]
            loss = F.cross_entropy(logits.reshape(-1, logits.shape[-1]), ids[:,1:].reshape(-1), reduction="none").reshape(len(batch), -1)
            scores = -(loss * mask[:,1:]).sum(dim=1)
            self.cache.update(zip(batch, scores.tolist()))
    def scores(self, pairs, n):
        self.fill([p["render"][k] for p in pairs for k in ("P","K")])
        return [(self.cache[p["render"]["P"]]+self.cache[p["render"]["K"]])/n for p in pairs]

def starts(n, width, stride, reverse):
    width = min(n, width)
    a = sorted(set(list(range(0, n-width+1, stride)) + [n-width]))
    return [(lo, lo+width) for lo in (a[::-1] if reverse else a)]

def solve(server, sem, C, L):
    # This function has no access to the planted truth or uniform pad.
    best = server.ask(op="baseline", C=C, L=L)
    baseline = best
    value = sem.scores([best], len(C))[0]
    initial = value
    accepted = 0
    history = []
    for width, stride, reverse in ((18,9,False),(24,12,True),(12,6,False)):
        for lo,hi in starts(len(C), width, stride, reverse):
            candidates = server.ask(op="proposal", C=C, L=L, pair=best, lo=lo, hi=hi)
            scores = sem.scores(candidates, len(C))
            if scores:
                idx = max(range(len(scores)), key=scores.__getitem__)
                if scores[idx] > value + 1e-6:
                    best, value = candidates[idx], scores[idx]
                    accepted += 1
                    history.append([lo,hi,value])
        print(f"  pass {width}/{stride} reverse={reverse} score={value:.6f} accepted={accepted}", flush=True)
    assert all((p+k)%29 == c for p,k,c in zip(best["P"],best["K"],C))
    return {"baseline":baseline,"final":best,"baselineScore":initial,"finalScore":value,"accepted":accepted,"history":history}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--index",type=int,required=True,choices=range(6))
    args = parser.parse_args()
    server = Server()
    try:
        control = server.ask(op="control",idx=args.index)
        sem = Semantic()
        print(control["name"], "positive", flush=True)
        positive = solve(server, sem, control["C"], control["L"])
        print(control["name"], "uniform negative", flush=True)
        negative = solve(server, sem, control["uniformC"], control["L"])
        truth = control["truth"]
        n = control["n"]
        match = lambda pair: sum(p==q for p,q in zip(pair["P"],truth["P"]))
        summary = {"name":control["name"],"n":n,"baselineCorrect":match(positive["baseline"]),"finalCorrect":match(positive["final"]),
                   "exactPair":positive["final"]["P"]==truth["P"] and positive["final"]["K"]==truth["K"],
                   "exactKBoundaries":positive["final"]["space"]==truth["space"],
                   "truthScore":sem.scores([truth],n)[0],"baselineScore":positive["baselineScore"],"finalScore":positive["finalScore"],
                   "uniformScore":negative["finalScore"],"uniformCorrect":match(negative["final"]),
                   "accepted":positive["accepted"],"uniformAccepted":negative["accepted"]}
        out = {"model":MODEL,"revision":REV,"summary":summary,"control":control,"positive":positive,"uniform":negative}
        path = ROOT / f"im-results/lp2-semantic-running-key-recovery-{args.index}.json"
        path.write_text(json.dumps(out,indent=2),encoding="utf-8")
        print(json.dumps(summary),flush=True)
    finally:
        server.close()
if __name__ == "__main__":
    main()
