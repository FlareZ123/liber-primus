"""Exact two-page GP-English word inversion with a sparse exception channel.

The overlapping word intervals form a forest. Each vertex represents one
dictionary word and an edge represents a shared rune interval. Tree
message-passing minimizes the count of positions violating
(C_a-C_b)/scale = P_a-P_b mod 29, over *all* dictionary word combinations.

The min-plus Hamming transform uses all subsets of agreeing positions.
For any pair of words the subset of their matching positions achieves
the exact Hamming distance; no beam or approximate nearest-neighbor
search enters the result. At most six positions overlap per edge of
LP2 pages 28 and 42.

Requirements: Python 3.12; numpy, textblob==0.19.0, cmudict==1.1.3.
Run from the repository:
python sims/relative_key_word_tree.py --pair 28 42 --scales 1 4 7 22
python sims/relative_key_word_tree.py --pair 28 42 --all-scales
"""
import argparse
import json
import itertools
from collections import defaultdict

import numpy as np
from relative_key_hard_lexicon import load_lexicon, load_pages

MOD = 29


def segments(page, count):
    """Return page-local delimited words, including two censored fragments."""
    ends = page['end'][:count]
    out = []
    start = 0
    for i, finished in enumerate(ends):
        if finished:
            out.append((start, i + 1, 'initial' if start == 0 else 'full'))
            start = i + 1
    if start < count:
        out.append((start, count, 'initial' if start == 0 else 'trailing'))
    return out


def domain(part, by_length):
    """Return all possible rune strings for one physical word interval."""
    start, end, kind = part
    length = end - start
    if kind == 'initial':
        if length <= 3:
            return np.array(list(itertools.product(range(MOD), repeat=length)),
                            dtype=np.uint8)
        return np.array(sorted({w[-length:] for words in by_length.values()
                                for w in words if len(w) >= length}), dtype=np.uint8)
    if kind == 'trailing':
        return np.array(sorted({w[:length] for words in by_length.values()
                                for w in words if len(w) >= length}), dtype=np.uint8)
    options = by_length[length]
    if not options:
        raise ValueError(f'No dictionary word of GP rune length {length}')
    return np.array(options, dtype=np.uint8)


def hamming_message(source, scores, requested):
    """Exact min_plus Hamming transform; return minima and argmin witnesses.

    source shape (n_source,width), requested shape (n_target,width).
    Every mask specifies rune positions that agree. A pair with k agreements
    attains exact mismatch cost width-k on the mask of *all* its agreements.
    Checking all masks is therefore an exact search over every word pair.
    """
    ns, width = source.shape
    nt = len(requested)
    minimum = np.full(nt, np.inf)
    witness = np.full(nt, -1, dtype=np.int32)
    powers = np.array([MOD**i for i in range(width)], dtype=np.int64)
    for mask in range(1 << width):
        positions = np.array([i for i in range(width) if mask >> i & 1],
                             dtype=np.intp)
        if len(positions):
            skey = source[:, positions].astype(np.int64) @ powers[:len(positions)]
            tkey = requested[:, positions].astype(np.int64) @ powers[:len(positions)]
        else:
            skey = np.zeros(ns, dtype=np.int64)
            tkey = np.zeros(nt, dtype=np.int64)
        order = np.lexsort((scores, skey))
        sorted_keys = skey[order]
        first = np.r_[True, sorted_keys[1:] != sorted_keys[:-1]]
        unique_keys = sorted_keys[first]
        unique_indices = order[first]
        lookup = np.searchsorted(unique_keys, tkey)
        valid = lookup < len(unique_keys)
        valid[valid] &= unique_keys[lookup[valid]] == tkey[valid]
        target_indices = np.flatnonzero(valid)
        if not len(target_indices):
            continue
        source_indices = unique_indices[lookup[target_indices]]
        values = scores[source_indices] + width - len(positions)
        improve = values < minimum[target_indices]
        minimum[target_indices[improve]] = values[improve]
        witness[target_indices[improve]] = source_indices[improve]
    assert np.all(witness >= 0)
    return minimum, witness


def invert(a, b, words, scale=4, shift=0):
    """Exact global minimum edits, plus a witness plaintext word for each vertex."""
    count = min(len(a['xs']), len(b['xs']))
    parts_a = segments(a, count)
    parts_b = segments(b, count)
    parts = parts_a + parts_b
    b_begin = len(parts_a)
    by_length = defaultdict(list)
    for word in words:
        by_length[len(word)].append(word)
    possibilities = [domain(p, by_length) for p in parts]
    a_data = np.asarray(a['xs'][:count], dtype=np.int16)
    b_data = np.array([b['xs'][(t + shift) % len(b['xs'])]
                       for t in range(count)], dtype=np.int16)
    inv_scale = pow(scale, -1, MOD)
    delta = (inv_scale * (a_data - b_data)) % MOD

    adjacency = [[] for _ in parts]
    edges = []
    for u, (x, y, _) in enumerate(parts_a):
        for j, (left, right, _) in enumerate(parts_b):
            lo, hi = max(x, left), min(y, right)
            if hi <= lo:
                continue
            v = b_begin + j
            edge_id = len(edges)
            edges.append((u, v, lo, hi))
            adjacency[u].append((v, edge_id))
            adjacency[v].append((u, edge_id))

    # Every connected component is a tree because the two sets of
    # nonoverlapping word intervals each partition the same linear stream.
    visited, selections, messages = set(), {}, {}
    for root in range(len(parts)):
        if root in visited:
            continue
        stack = [root]
        parents = {root: None}
        order = []
        visited.add(root)
        while stack:
            vertex = stack.pop()
            order.append(vertex)
            for child, edge_id in adjacency[vertex]:
                if parents[vertex] is not None and child == parents[vertex][0]:
                    continue
                if child in visited:
                    raise AssertionError('Word overlap is unexpectedly cyclic')
                parents[child] = (vertex, edge_id)
                visited.add(child)
                stack.append(child)

        for vertex in reversed(order):
            if parents[vertex] is None:
                continue
            parent, edge_id = parents[vertex]
            u, v, lo, hi = edges[edge_id]
            start_source, start_target = parts[vertex][0], parts[parent][0]
            source = possibilities[vertex][:, lo-start_source:hi-start_source]
            target = possibilities[parent][:, lo-start_target:hi-start_target]
            if vertex == u:
                required = (target.astype(np.int16) + delta[lo:hi]) % MOD
            else:
                required = (target.astype(np.int16) - delta[lo:hi]) % MOD
            weight = np.zeros(len(possibilities[vertex]), dtype=np.float64)
            for child, _ in adjacency[vertex]:
                if child != parent:
                    weight += messages[(child, vertex)][0]
            messages[(vertex, parent)] = hamming_message(source, weight, required)

        root_cost = np.zeros(len(possibilities[root]), dtype=np.float64)
        for child, _ in adjacency[root]:
            root_cost += messages[(child, root)][0]
        selections[root] = int(np.argmin(root_cost))
        for vertex in order:
            for child, _ in adjacency[vertex]:
                if parents[vertex] is not None and child == parents[vertex][0]:
                    continue
                selections[child] = int(messages[(child, vertex)][1]
                                        [selections[vertex]])

    plaintext_a = np.zeros(count, dtype=np.int16)
    plaintext_b = np.zeros(count, dtype=np.int16)
    words_a, words_b = [], []
    for i, (begin, end, _) in enumerate(parts):
        row = possibilities[i][selections[i]]
        (plaintext_a if i < b_begin else plaintext_b)[begin:end] = row
        (words_a if i < b_begin else words_b).append(''.join(
            '0123456789abcdefghijklmnopqrs'[c] for c in row))
    violated = np.flatnonzero((plaintext_a - plaintext_b - delta) % MOD != 0)
    return {'page_pair': [a['page'], b['page']], 'scale': scale, 'shift': shift,
            'runes': count, 'minimum_exceptions': len(violated),
            'exception_offsets': violated.tolist(),
            'component_count': len(parts) - len(edges),
            'word_overlap_edges': len(edges),
            'witness_page_a': words_a, 'witness_page_b': words_b,
            'interpretation': 'Minimum edits are lexical feasibility only, not recovered true plaintext'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pair', type=int, nargs=2, default=[28,42])
    parser.add_argument('--scales', type=int, nargs='+', default=[1,4,7,22])
    parser.add_argument('--all-scales', action='store_true')
    parser.add_argument('--shifts', type=int, nargs='+', default=[0])
    args = parser.parse_args()
    words, _ = load_lexicon()
    pages = {page['page']:page for page in load_pages()}
    a, b = [pages[p] for p in args.pair]
    scales = range(1, MOD) if args.all_scales else args.scales
    results = []
    for scale in scales:
        for shift in args.shifts:
            result = invert(a, b, words, scale, shift)
            results.append({k:v for k,v in result.items()
                            if k not in ('witness_page_a','witness_page_b')})
            print(json.dumps(results[-1]), flush=True)
    print('SUMMARY ' + json.dumps({
        'lexicon_gp_words':len(words), 'samples':len(results),
        'lowest_exception_count':min(x['minimum_exceptions'] for x in results),
        'results':results}), flush=True)


if __name__ == '__main__':
    main()
