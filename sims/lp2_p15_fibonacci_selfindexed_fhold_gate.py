"""Exact p15 Fibonacci self-indexed key with latent F holds.

Usage: python sims/lp2_p15_fibonacci_selfindexed_fhold_gate.py
Requires z3-solver (or a system libz3 shared library).
"""
import ctypes
from ctypes.util import find_library
import json
from pathlib import Path
import re
import time

F = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]
ANCHORS = {a: j for j, a in enumerate(F)}
N = F[-1] + 1

def bv(n, w=5):
    return f"(_ bv{n} {w})"

def build(cipher, sign, phase, timeout=20000, known_key=None):
    """Exact QF_BV encoding; h is the number of non-consuming F runes mod 16."""
    s = ["(set-option :produce-models true)", f"(set-option :timeout {timeout})", "(set-logic QF_BV)"]
    def add(x):
        s.append(f"(assert {x})")
    for j in range(16):
        s.append(f"(declare-fun k{j} () (_ BitVec 5))")
        add(f"(bvult k{j} {bv(29)})")
        if known_key is not None:
            add(f"(= k{j} {bv(known_key[j])})")
    z = 0
    s.append("(declare-fun h0 () (_ BitVec 4))")
    add(f"(= h0 {bv(0,4)})")
    for i, v in enumerate(cipher):
        if v == 0:
            s.append(f"(declare-fun h{z+1} () (_ BitVec 4))")
            hold = f"(= h{z+1} (bvadd h{z} {bv(1,4)}))"
            consume = f"(= h{z+1} h{z})"
            add(f"(or {hold} {consume})")
            if i in ANCHORS:
                add(f"(=> {hold} (= k{ANCHORS[i]} {bv(0)}))")
        else:
            consume = None
        for h in range(16):
            t = (i - h + phase) % 16
            cond = f"(= h{z} {bv(h,4)})"
            if consume:
                cond = f"(and {cond} {consume})"
            add(f"(=> {cond} (not (= k{t} {bv((sign*v)%29)})))")
            if i in ANCHORS:
                k = f"k{ANCHORS[i]}"
                x, y = f"((_ zero_extend 1) {k})", f"((_ zero_extend 1) k{t})"
                expr = f"(bvadd {x} {y})" if sign == 1 else f"(bvsub (bvadd {x} {bv(29,6)}) {y})"
                add(f"(=> {cond} (and (not (= {k} {bv(0)})) (or (= {expr} {bv(v,6)}) (= {expr} {bv(v+29,6)}))))")
        if v == 0:
            z += 1
    return "\n".join(s), z

def solve(smt, z, witness=False):
    """Use either z3-solver or the system Z3 C API with the same SMT-LIB."""
    try:
        import z3
    except ImportError:
        z3 = None
    if z3 is not None:
        solver = z3.SolverFor("QF_BV")
        solver.from_string(smt)
        status = str(solver.check())
        if status == "sat" and witness:
            model = solver.model()
            return status, [model.eval(z3.BitVec(f"k{i}", 5), model_completion=True).as_long() for i in range(16)], [model.eval(z3.BitVec(f"h{i}", 4), model_completion=True).as_long() for i in range(z+1)]
        return status, None, None
    lib = ctypes.CDLL(find_library("z3") or "libz3.so.4")
    def bind(name, args, result):
        fn = getattr(lib, name)
        fn.argtypes, fn.restype = args, result
        return fn
    P, S = ctypes.c_void_p, ctypes.c_char_p
    cfg = bind("Z3_mk_config", [], P)()
    ctx = bind("Z3_mk_context", [P], P)(cfg)
    bind("Z3_del_config", [P], None)(cfg)
    evaluate = bind("Z3_eval_smtlib2_string", [P,S], S)
    try:
        status = evaluate(ctx, (smt+"\n(check-sat)").encode()).decode().strip()
        if status == "sat" and witness:
            names = [f"k{i}" for i in range(16)] + [f"h{i}" for i in range(z+1)]
            result = evaluate(ctx, ("(get-value ("+" ".join(names)+"))").encode()).decode()
            vals = {a: int(b, 2) for a, b in re.findall(r"\(([kh]\d+) #b([01]+)\)", result)}
            # Z3 prints 4-bit h values in hexadecimal.
            vals.update({a: int(b, 16) for a, b in re.findall(r"\(([kh]\d+) #x([0-9a-fA-F]+)\)", result)})
            return status, [vals[f"k{i}"] for i in range(16)], [vals[f"h{i}"] for i in range(z+1)]
        return status, None, None
    finally:
        bind("Z3_del_context", [P], None)(ctx)

def encrypt(plain, key, sign, phase):
    out = []
    for p in plain:
        if p == 0:
            out.append(0)
        else:
            out.append((p + sign*key[phase]) % 29)
            phase = (phase + 1) % 16
    return out

def decode(cipher, key, h, sign, phase):
    out, z = [], 0
    assert h[0] == 0
    for c in cipher:
        hold = False
        if c == 0:
            delta = (h[z+1]-h[z]) % 16
            assert delta in (0,1)
            hold = delta == 1
            z += 1
        if hold:
            out.append(0)
        else:
            p = (c-sign*key[phase]) % 29
            assert p != 0
            out.append(p)
            phase = (phase+1) % 16
    assert z+1 == len(h)
    return out

def main():
    corpus = json.loads((Path(__file__).resolve().parents[1] / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    body = [v for page in corpus["pages"][15:23] for v in page["indices"]][20:]
    assert len(body) == 1883 and body[:4] == [10,1,10,1]
    original = []
    for phase in range(16):
        for sign in (1,-1):
            smt, z = build(body[:N], sign, phase)
            status, _, _ = solve(smt, z)
            original.append(dict(phase=phase, sign=sign, status=status))
    p57 = corpus["pages"][57]["indices"]
    controls = []
    for sign, phase, shift in [(1,0,0),(-1,0,0),(1,7,4),(-1,12,19)]:
        p = [p57[(i+shift)%len(p57)] for i in range(N)]
        k = [p[i] for i in F]
        c = encrypt(p,k,sign,phase)
        smt, z = build(c,sign,phase)
        status, recovered, h = solve(smt,z,True)
        assert status == "sat"
        witness = decode(c,recovered,h,sign,phase)
        assert [witness[i] for i in F] == recovered and encrypt(witness,recovered,sign,phase)==c
        smt, z = build(c,sign,phase,known_key=k)
        planted, _, _ = solve(smt,z)
        assert planted == "sat"
        controls.append(dict(sign=sign,phase=phase,shift=shift,zeros=z,planted_key=k,free_status=status,known_key_status=planted,free_key_exact=recovered==k))
    print(json.dumps(dict(prefix=N,zeros=body[:N].count(0),original=original,controls=controls),indent=2))
    assert all(x["status"]=="unsat" for x in original)

if __name__ == "__main__":
    main()
