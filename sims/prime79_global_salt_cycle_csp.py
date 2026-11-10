#!/usr/bin/env python3
"""Exact global-offset 79/78 no-repeat transport exclusion on the canonical LP2.

A common unknown additive integer salt K modulo 28**79 shifts every <=378-bit
unsigned packet, followed by a globally fixed arbitrary 29-rune cyclic order.
Every leading digit must lie in *some* 10-consecutive-digit arc of radix 28.
All 28 arcs and all secret rune orders are considered without a guessed key.

No dependencies. Run from repository root:
 python3 sims/prime79_global_salt_cycle_csp.py --phase35
 python3 sims/prime79_global_salt_cycle_csp.py --full
"""
import argparse
import json
import random
from pathlib import Path

MASK = (1 << 29) - 1
RADIX = 28 ** 78
MAX = (1 << 378) - 1
assert MAX // RADIX == 8
assert (1 << 378) < 29 ** 78 < (1 << 379)


def graph(cipher, phase, reverse):
    edges, leaders = set(), set()
    clean = 0
    for start in range(phase, len(cipher) - 78, 79):
        if start == 0 or any(cipher[i] == cipher[i - 1]
                             for i in range(start, start + 79)):
            continue
        clean += 1
        i = start + 78 if reverse else start
        a, b = cipher[i - 1], cipher[i]
        edges.add((a, b))
        leaders.add(b)
    return sorted(edges), clean, len(leaders)


def solve(edges, window, limit=1000000):
    """Exhaustive exact CSP; False proves UNSAT, None is an unfinished limit."""
    steps = [(window + i) % 28 + 1 for i in range(10)]
    forward = [sum(1 << ((p + s) % 29) for s in steps) for p in range(29)]
    backward = [sum(1 << ((p - s) % 29) for s in steps) for p in range(29)]
    incidence = [[] for _ in range(29)]
    for a, b in edges:
        assert a != b
        incidence[a].append((a, b))
        incidence[b].append((a, b))
    degree = list(map(len, incidence))
    visited = 0

    def propagate(dom):
        todo = list(range(29))
        queued = set(todo)
        while todo:
            v = todo.pop()
            queued.discard(v)
            if not dom[v]:
                return False
            for a, b in incidence[v]:
                for src, dst, table in ((a, b, forward), (b, a, backward)):
                    x, allowed = dom[src], 0
                    while x:
                        bit = x & -x
                        x -= bit
                        allowed |= table[bit.bit_length() - 1]
                    new = dom[dst] & allowed
                    if new != dom[dst]:
                        if not new:
                            return False
                        dom[dst] = new
                        if dst not in queued:
                            todo.append(dst)
                            queued.add(dst)
            if dom[v].bit_count() == 1:
                bit = dom[v]
                for u in range(29):
                    if u == v or not (dom[u] & bit):
                        continue
                    dom[u] &= ~bit
                    if not dom[u]:
                        return False
                    if u not in queued:
                        todo.append(u)
                        queued.add(u)
        return True

    def dfs(dom):
        nonlocal visited
        visited += 1
        if visited > limit:
            return None
        if not propagate(dom):
            return False
        choice = [u for u in range(29) if dom[u].bit_count() > 1]
        if not choice:
            return dom
        v = min(choice, key=lambda u: (dom[u].bit_count(), -degree[u]))
        bits = dom[v]
        while bits:
            bit = bits & -bits
            bits -= bit
            nxt = dom.copy()
            nxt[v] = bit
            out = dfs(nxt)
            if out is None:
                return None
            if out:
                return out
        return False

    initial = [MASK] * 29
    initial[0] = 1  # gauge: rotate the hidden 29-cycle without changing digits
    found = dfs(initial)
    return ('UNSAT' if found is False else 'UNKNOWN' if found is None else 'SAT',
            visited)


def evaluate(cipher, phase, reverse):
    edges, clean, leaders = graph(cipher, phase, reverse)
    states = [solve(edges, i) for i in range(28)]
    return dict(phase=phase, reversed=reverse, clean=clean, edges=len(edges),
                leaders=leaders,
                unsat=sum(x[0] == 'UNSAT' for x in states),
                sat=sum(x[0] == 'SAT' for x in states),
                unknown=sum(x[0] == 'UNKNOWN' for x in states),
                max_nodes=max(x[1] for x in states))


def positive(method='cyclic', reverse=False):
    """Hidden-key, source-sized planted numeric packets; invert exactly."""
    rng = random.Random(0x23330179 + 3 * (method == 'sorted') + 11 * reverse)
    order = list(range(29))
    rng.shuffle(order)
    pos = {s: i for i, s in enumerate(order)}

    def emit(prev, digit):
        p = pos[prev]
        return order[(p + digit + 1) % 29] if method == 'cyclic' else (
            order[digit + (digit >= p)])

    def invert(prev, cur):
        return ((pos[cur] - pos[prev] - 1) % 29
                if method == 'cyclic' else
                pos[cur] - (pos[cur] > pos[prev]))

    salt = 11 * RADIX + RADIX // 3
    prev = order[0]
    cipher, payloads = [], []
    for _ in range(35):
        prev = emit(prev, rng.randrange(28))
        cipher.append(prev)
    for block in range(163):
        value = rng.getrandbits(378)
        payloads.append(value)
        coded = (value + salt) % (28 ** 79)
        digits = [0] * 79
        for i in range(78, -1, -1):
            coded, d = divmod(coded, 28)
            digits[i] = d
        assert coded == 0
        if reverse:
            digits.reverse()
        for digit in digits:
            prev = emit(prev, digit)
            cipher.append(prev)
    while len(cipher) < 12956:
        prev = emit(prev, rng.randrange(28))
        cipher.append(prev)
    for block, wanted in enumerate(payloads):
        start = 35 + block * 79
        digits = [invert(cipher[i - 1], cipher[i])
                  for i in range(start, start + 79)]
        if reverse:
            digits.reverse()
        value = 0
        for digit in digits:
            value = 28 * value + digit
        assert (value - salt) % (28 ** 79) == wanted
    assert len(cipher) == 12956
    edges, clean, leaders = graph(cipher, 35, reverse)
    assert clean == 163
    if method == 'cyclic':
        assert any(solve(edges, i)[0] == 'SAT' for i in range(28))
    else:
        assert leaders <= 12
    return dict(method=method, reversed=reverse, recovered=163,
                exact_reencipher=163, runes=len(cipher))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--full', action='store_true')
    parser.add_argument('--phase35', action='store_true')
    a = parser.parse_args()
    source = Path(__file__).resolve().parents[1] / 'resources/liber-primus/lp2-corpus.json'
    corpus = json.loads(source.read_text('utf8'))
    cipher = [s for page in corpus['pages'] if page['page'] <= 55
              for s in page['indices']]
    assert len(cipher) == 12956
    controls = [positive(method, reverse) for method in ('cyclic', 'sorted')
                for reverse in (False, True)]
    phases = range(79) if a.full else (35,)
    outcomes = [evaluate(cipher, phase, reverse)
                for reverse in (False, True) for phase in phases]
    print(json.dumps(dict(model='globally salted <=378-bit 79/78 transport',
                          original_runes=12956, original_cases=len(outcomes),
                          windows=len(outcomes) * 28,
                          excluded=sum(x['unsat'] for x in outcomes),
                          survivors=[x for x in outcomes if x['sat'] or x['unknown']],
                          min_clean=min(x['clean'] for x in outcomes),
                          min_leaders=min(x['leaders'] for x in outcomes),
                          max_nodes=max(x['max_nodes'] for x in outcomes),
                          positives=controls), indent=2))


if __name__ == '__main__':
    main()
