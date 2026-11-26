"""Exact integer histogram feasibility, with independently checked witnesses.
Usage: node sims/lp2_phase_histogram_envelope_sft.cjs > data.json
       python sims/lp2_phase_histogram_feasibility.py data.json
Requires numpy and scipy (tested locally with scipy 1.17.0).
No ciphertext order or language scoring enters the optimization.
"""
import json
import sys
from collections import Counter
from pathlib import Path
import numpy as np
from scipy.optimize import milp, Bounds, LinearConstraint
from scipy.sparse import coo_matrix


def solve(rows, low, high, mode):
    q, a = rows.shape
    entries, rr, cc, vv, lo, hi = [], [], [], [], [], []

    def row(items, lower, upper):
        k = len(lo)
        lo.append(lower)
        hi.append(upper)
        for j, v in items:
            if v:
                rr.append(k)
                cc.append(j)
                vv.append(v)

    if mode == 'arbitrary':
        lookup = {}
        for j, hist in enumerate(rows):
            for p in range(a):
                for v in sorted(set(hist)):
                    if v <= high[p]:
                        lookup[j, p, int(v)] = len(entries)
                        entries.append((j, p, int(v)))
        for j, hist in enumerate(rows):
            for p in range(a):
                row(((idx, 1) for (jj, pp, v), idx in lookup.items()
                     if jj == j and pp == p), 1, 1)
            for v, n in Counter(hist).items():
                row(((idx, 1) for (jj, p, value), idx in lookup.items()
                     if jj == j and value == v), n, n)
        for p in range(a):
            row(((idx, v) for (j, pp, v), idx in lookup.items()
                 if pp == p), low[p], high[p])
    else:
        assert mode == 'rotation'
        for j, hist in enumerate(rows):
            for s in range(a):
                v = hist[(np.arange(a) + s) % a]
                if np.all(v <= high):
                    entries.append((j, s, v))
        for j in range(q):
            e = [(k, 1) for k, (jj, s, v) in enumerate(entries) if jj == j]
            if not e:
                return {'status': 'exact-empty-row', 'row': j}
            row(e, 1, 1)
        for p in range(a):
            row(((k, v[p]) for k, (j, s, v) in enumerate(entries)),
                low[p], high[p])
    A = coo_matrix((vv, (rr, cc)), shape=(len(lo), len(entries))).tocsc()
    res = milp(np.zeros(len(entries)), integrality=np.ones(len(entries)),
               bounds=Bounds(0, 1), constraints=LinearConstraint(A, lo, hi),
               options={'time_limit': 8})
    result = {'status': int(res.status), 'message': res.message,
              'variables': len(entries)}
    if res.x is not None:
        assert np.max(np.abs(res.x - np.rint(res.x))) < 1e-5
        x = np.rint(res.x).astype(int)
        y = A @ x
        assert np.all(y >= lo) and np.all(y <= hi)
        key = np.full((q, a), -1, dtype=int)
        if mode == 'arbitrary':
            for j, hist in enumerate(rows):
                bins = {v: iter(np.flatnonzero(hist == v)) for v in set(hist)}
                for k, (jj, p, v) in enumerate(entries):
                    if jj == j and x[k]:
                        key[j, p] = next(bins[v])
        else:
            for k, (j, s, v) in enumerate(entries):
                if x[k]:
                    key[j] = (np.arange(a) + s) % a
        for j in range(q):
            assert sorted(key[j]) == list(range(a))
        out = np.sum(np.take_along_axis(rows, key, axis=1), axis=0)
        assert np.all(out >= low) and np.all(out <= high)
        result.update({'key': key.tolist(), 'decodedHistogram': out.tolist()})
    return result


def validate_witness(cipher, result, low, high):
    key = np.array(result['key'])
    phase = np.arange(len(cipher)) % len(key)
    decoded = np.argsort(key, axis=1)[phase, cipher]
    counts = np.bincount(decoded, minlength=29)
    assert np.all(counts >= low) and np.all(counts <= high)
    assert np.array_equal(key[phase, decoded], cipher)
    return decoded


def main():
    data = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
    rows = np.array(data['rows'])
    cipher = np.array(data['terminalCipher'])
    hs = np.array([x['h'] for x in data['targets']])
    cases = [(x['name'], h, h) for x, h in zip(data['targets'], hs)]
    cases += [('coordinatewise-five-control-band', hs.min(axis=0), hs.max(axis=0))]
    cases += [(x['name'], np.array(x['h']), np.array(x['h']))
              for x in data['native']]
    cap = np.cumsum(np.sort(rows, axis=1)[:, ::-1], axis=1).sum(axis=0)
    results = {}
    for name, low, high in cases:
        gap = np.cumsum(np.sort(low)[::-1]) - cap
        if gap.max() > 0:
            results[name] = {'status': 'majorization-excluded', 'gap': int(gap.max())}
            continue
        for mode in ['rotation', 'arbitrary']:
            r = solve(rows, low, high, mode)
            if 'key' in r:
                validate_witness(cipher, r, low, high)
            results[name + '-' + mode] = r

    rng = np.random.default_rng(3301)
    plain = np.array(data['plantPlain'])
    h = np.bincount(plain, minlength=29)
    for q in [8, 13]:
        for mode in ['rotation', 'arbitrary']:
            order = rng.permutation(len(plain))
            shuffled = plain[order]
            plant_key = np.array([
                (np.arange(29) + rng.integers(29)) % 29 if mode == 'rotation'
                else rng.permutation(29) for _ in range(q)
            ])
            phase = np.arange(len(plain)) % q
            c = plant_key[phase, shuffled]
            rh = np.array([np.bincount(c[j::q], minlength=29) for j in range(q)])
            r = solve(rh, h, h, mode)
            assert 'key' in r, r
            validate_witness(c, r, h, h)
            results[f'plant-{q}-{mode}'] = {
                'result': r, 'sameKey': bool(np.array_equal(r['key'], plant_key)),
                'plantKey': plant_key.tolist(), 'cipher': c.tolist()
            }
    print(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
