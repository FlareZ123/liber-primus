"""Development C9 adapter; consumes only the checker's explicit C,K,sign arguments."""
import atexit
import json
from pathlib import Path
import subprocess
import skipdecode as sk

WORKER = Path(__file__).with_name("lp2_vnull_lexical_worker.cjs")
_worker = None

def _stop():
    global _worker
    if _worker is not None:
        _worker.stdin.close()
        _worker.wait()
        _worker = None

atexit.register(_stop)

def decode(C, K, sign=-1):
    global _worker
    if _worker is None:
        _worker = subprocess.Popen(["node", str(WORKER)], stdin=subprocess.PIPE,
                                   stdout=subprocess.PIPE, text=True, encoding="utf-8")
    _worker.stdin.write(json.dumps({"C": list(C), "K": list(K), "sign": sign}) + "\n")
    _worker.stdin.flush()
    line = _worker.stdout.readline()
    if not line:
        raise RuntimeError("lexical decoder worker exited")
    candidate = json.loads(line)
    # Choose a model from observable candidate likelihoods. No expected plaintext
    # length, plant label, true key, test seed, or checker state enters this choice.
    reference = sk.beam_decode(list(C), list(K), sign=sign, o=0, beam_w=400, max_skip=3)
    if candidate is None or candidate["ll"] <= -4 or len(candidate["P"]) >= len(C):
        return reference
    translit = sk.idx_to_trans(candidate["P"])
    score = sk.Q.score_norm(translit)
    if score >= reference["score"]:
        return {"plain_idx": candidate["P"], "translit": translit, "score": score}
    return reference
