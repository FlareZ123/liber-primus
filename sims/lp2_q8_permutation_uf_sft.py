"""Exact QF_UFBV formulation of the zero-free plaintext-feedback permutation CSP.

Reuse Agent45's canonical loader, dictionary, control plant and CLI. Both
functional constraints are required: f maps delayed plaintext to residual;
g maps residual back to delayed plaintext. No global inverse is necessary
because the resulting partial bijection extends to a permutation of GP29.
"""
import json
import re
import time
import lp2_plaintext_autokey_q8_keyless_pair_bv as base


def solve(ws, ds, q, timeout, mode, known=None, model='pair'):
    assert known is None and mode == 'default'
    ct = base.flatten(ws)
    n = len(ct)
    p = [f'p{i}' for i in range(n)]
    bv = base.bv
    f = [
        f'(set-option :timeout {timeout})',
        '(set-option :produce-models true)',
        '(set-logic QF_UFBV)',
        '(declare-fun f ((_ BitVec 5)) (_ BitVec 5))',
        '(declare-fun g ((_ BitVec 5)) (_ BitVec 5))',
    ] + [f'(declare-const {x} (_ BitVec 5))' for x in p]

    def add(x):
        f.append(f'(assert {x})')

    off = 0
    domains = []
    for w in ws:
        cand = ds[len(w)]
        domains.append(len(cand))
        s = base.concat(p[off:off + len(w)])
        add('(or ' + ' '.join(
            f'(= {s} {bv(base.packed(v), 5 * len(w))})' for v in cand
        ) + ')')
        off += len(w)
    for i in range(q, n):
        c, a, v = bv(ct[i]), p[i], f's{i}'
        f.append(f'(define-fun {v} () (_ BitVec 5) '
                 f'(ite (bvule {a} {c}) (bvsub {c} {a}) '
                 f'(bvsub (bvadd {c} {bv(29)}) {a})))')
        add(f'(= (f {p[i-q]}) {v})')
        add(f'(= (g {v}) {p[i-q]})')
    script = '\n'.join(f)
    z = base.NativeZ3()
    start = time.monotonic()
    try:
        status = z.eval(script + '\n(check-sat)').strip()
        out = dict(status=status, seconds=round(time.monotonic()-start, 3),
                   runes=n, words=len(ws), dictionary_candidates=sum(domains),
                   smt_chars=len(script))
        if status == 'unknown':
            out['reason'] = z.eval('(get-info :reason-unknown)').strip()
        if status == 'sat':
            vals = z.eval('(get-value (' + ' '.join(p) + '))')
            parsed = {name: int(value, 2) for name, value in
                      re.findall(r'\((p\d+) #b([01]+)\)', vals)}
            assert len(parsed) == n
            pt = [parsed[x] for x in p]
            partial = {}
            for i in range(q, n):
                x, v = pt[i-q], (ct[i]-pt[i]) % 29
                assert x not in partial or partial[x] == v
                partial[x] = v
            assert len(set(partial.values())) == len(partial)
            free = iter(sorted(set(range(29))-set(partial.values())))
            mp = [partial[i] if i in partial else next(free)
                  for i in range(29)]
            primer = [(c-x) % 29 for c, x in zip(ct[:q], pt[:q])]
            assert sorted(mp) == list(range(29))
            assert base.encrypt(pt, primer, mp, q) == ct
            off = 0
            words = []
            for w in ws:
                v = tuple(pt[off:off+len(w)])
                assert v in ds[len(w)]
                words.append(''.join(base.ALPHA[x] for x in v))
                off += len(w)
            out.update(pt=' '.join(words), primer=primer, map=mp, replay=True)
        return out
    finally:
        z.close()


if __name__ == '__main__':
    base.solve = solve
    base.main()
