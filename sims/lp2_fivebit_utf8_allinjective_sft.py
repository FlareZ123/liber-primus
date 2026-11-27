"""Necessary UTF-8 byte-header gate for all stationary injective 5-bit alphabets.

Run from repository root: python sims/lp2_fivebit_utf8_allinjective_sft.py
Requires z3-solver. No plaintext, lexicon, or key score is used.
"""
import json
import random
from pathlib import Path

import z3


def constraints(tape, phase):
    bits = [
        f"((_ extract {4-j} {4-j}) v{u})"
        for u in tape for j in range(5)
    ]
    headers = [
        f"(concat {bits[i]} {bits[i+1]})"
        for i in range(phase, len(bits)-1, 8)
    ]
    pairs = sorted(set(zip(headers, headers[1:])))
    q = [f"(declare-const v{i} (_ BitVec 5))" for i in range(29)]
    q.append("(assert (distinct " + " ".join(f"v{i}" for i in range(29)) + "))")
    for a, b in pairs:
        # Every multibyte UTF-8 lead must be followed by a continuation.
        q.append(f"(assert (=> (= {a} #b11) (= {b} #b10)))")
        # An ASCII byte cannot be followed by a continuation.
        q.append(f"(assert (=> (or (= {a} #b00) (= {a} #b01)) (not (= {b} #b10))))")
    return "\n".join(q), len(pairs)


def run(tape, phase):
    script, count = constraints(tape, phase)
    solver = z3.SolverFor("QF_BV")
    solver.set(timeout=60000)
    solver.from_string(script)
    return {"phase": phase, "status": str(solver.check()), "header_pairs": count}


def controls():
    rng = random.Random(3301)
    out = []
    for phase in range(8):
        for trial in range(10000):
            msg = ("Cicada 3301: " + "".join(rng.choices(
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.!?", k=35
            )) + " é").encode("utf-8")
            stream = "0"*phase + "".join(f"{b:08b}" for b in msg)
            stream += "0"*(-len(stream)%5)
            chunks = [int(stream[i:i+5], 2) for i in range(0, len(stream), 5)]
            if len(set(chunks)) == 29:
                break
        else:
            raise RuntimeError("could not build control")
        labels = sorted(set(chunks))
        rng.shuffle(labels)
        mapping = {v:i for i,v in enumerate(labels)}
        y = [mapping[v] for v in chunks]
        replay = "".join(f"{labels[u]:05b}" for u in y)
        assert replay == stream
        assert bytes(int(replay[i:i+8],2) for i in range(
            phase, phase+8*len(msg),8)) == msg
        result = run(y, phase)
        assert result["status"] == "sat", result
        out.append(dict(result, n=len(y), trial=trial))
    return out


def main():
    root = Path(__file__).resolve().parents[1]
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
    tape = [u for p in corpus["pages"] if 23 <= p["page"] <= 26 for u in p["indices"]][16:]
    assert len(tape) == 1005 and len(set(tape)) == 29
    results = [run(tape, phase) for phase in range(8)]
    print(json.dumps({"n":len(tape), "original":results, "positive_controls":controls()}, indent=2))
    assert all(r["status"] == "unsat" for r in results), results


if __name__ == "__main__":
    main()
