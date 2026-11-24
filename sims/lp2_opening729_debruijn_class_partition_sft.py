"""Exact static GP29 -> ternary B(3,6) solver using monochromatic runs.

Run from a repository checkout: python sims/lp2_opening729_debruijn_class_partition_sft.py
Uses only the Python standard library; no SAT solver or time limit.
"""
from collections import defaultdict
from hashlib import sha256
from pathlib import Path
import json
from time import perf_counter

N, R, SPLIT = 729, 29, 15
FULL = (1 << R) - 1
ROOT = Path(__file__).resolve().parents[1]


def fkm():
    a, out = [0] * 19, []

    def visit(t, p):
        if t > 6:
            if 6 % p == 0:
                out.extend(a[1:p + 1])
            return
        a[t] = a[t - p]
        visit(t + 1, p)
        for v in range(a[t - p] + 1, 3):
            a[t] = v
            visit(t + 1, t)

    visit(1, 1)
    return out


def unique6(tape):
    return len({tuple(tape[(i + j) % N] for j in range(6)) for i in range(N)})


def half(glyphs):
    positions, weights, buckets = [0], [0], defaultdict(list)
    buckets[0].append(0)
    for m in range(1, 1 << len(glyphs)):
        bit = m & -m
        p = m ^ bit
        glyph = glyphs[bit.bit_length() - 1]
        positions.append(positions[p] | glyph)
        weights.append(weights[p] + glyph.bit_count())
        buckets[weights[m]].append(m)
    return positions, weights, buckets


def solve(tape):
    assert len(tape) == N and set(tape) == set(range(R))
    glyphs = [0] * R
    for i, r in enumerate(tape):
        glyphs[r] |= 1 << i
    left, weights, _ = half(glyphs[:SPLIT])
    right, _, buckets = half(glyphs[SPLIT:])
    counts = [0] * 6
    classes = []
    for a, lp in enumerate(left):
        for b in buckets.get(243 - weights[a], ()):
            counts[0] += 1
            run = lp | right[b]
            for d, target in enumerate((81, 27, 9, 3, 1), 1):
                # Shift the cyclic start-position bitset back one position.
                run &= (run >> 1) | ((run & 1) << (N - 1))
                if run.bit_count() != target:
                    break
                counts[d] += 1
            else:
                classes.append(a | (b << SPLIT))
    pool = set(classes)
    pairs, partitions, solutions = 0, 0, []
    for a in classes:
        if not a & 1:  # Name the class of rune 0 as trit zero.
            continue
        for b in classes:
            if a & b:
                continue
            pairs += 1
            c = FULL ^ a ^ b
            if b >= c or c not in pool:  # Remove the 1/2 label swap.
                continue
            partitions += 1
            mapping = [0 if (a >> r) & 1 else 1 if (b >> r) & 1 else 2 for r in range(R)]
            if unique6([mapping[r] for r in tape]) == N:
                solutions.append(mapping)
    return dict(monochromatic_class_counts=counts, disjoint_ordered_pairs=pairs,
                candidate_partitions=partitions, exact_bruijn_mappings=solutions)


def main():
    start = perf_counter()
    data = json.loads((ROOT / 'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    pages = [p['indices'] for p in data['pages'][:3]]
    assert list(map(len, pages)) == [262, 266, 201]
    original = [r for page in pages for r in page]
    digest = sha256(bytes(original)).hexdigest()
    assert digest == '7878349fef98939f6c816d657547e7e80f1b875d83b28e239c328e67b26159c7'
    trits = fkm()
    assert unique6(trits) == N
    counts, planted = [0] * 3, []
    for v in trits:
        cap = (R - 1 - v) // 3 + 1
        planted.append(v + 3 * (counts[v] % cap))
        counts[v] += 1
    positive = solve(planted)
    truth = [r % 3 for r in range(R)]
    swapped = [0 if x == 0 else 3 - x for x in truth]
    assert truth in positive['exact_bruijn_mappings'] or swapped in positive['exact_bruijn_mappings']
    result = solve(original)
    assert result['monochromatic_class_counts'] == [668792, 31912, 3689, 730, 248, 146]
    assert result['disjoint_ordered_pairs'] == 41
    assert result['candidate_partitions'] == 0
    assert not result['exact_bruijn_mappings']
    print(json.dumps(dict(original_sha256=digest, positive=positive, original=result,
                          seconds=round(perf_counter() - start, 3)), indent=2))


if __name__ == '__main__':
    main()
