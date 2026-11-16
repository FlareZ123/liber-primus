"""Source-constrained table-free book-key beam with native plaintext-F bypass.

At every GP29 plaintext F (index 0), ciphertext F is emitted without reading
a key symbol, as independently verified for solved LP2 p56. The optional
anti-doublet skip on non-F symbols follows the external phase23 q=.81
hypothesis; that extension is NOT historically authenticated for LP2.
All source ciphertexts and book texts are loaded by the calling program.
"""
import numpy as np
from numba import njit


@njit(cache=True)
def _lse(a):
    m = a.max()
    return m + np.log(np.exp(a - m).sum())


@njit(cache=True)
def beam_decode_f(c, key, start, mt, beam=64, ln_skip=-3.58,
                  per_ptr=8, spread=8):
    """Beam-integrate an unknown 29-way shift table and 0..2 skips.

    Ciphertext F may either be encrypted non-F with its group shift or be
    literal plaintext-F bypass. A bypass consumes no source-key rune, and
    the unknown-table group posterior receives no fictitious observation.
    Return score against uniform ciphertext and per-glyph key pointers (-1
    at a bypass).
    """
    n, q = len(c), 29
    g = np.zeros((beam, q, q))
    lg = np.zeros((beam, q))
    scores = np.zeros(beam)
    pointers = np.zeros(beam, dtype=np.int64)
    for u in range(spread):
        pointers[u] = start + u
    width = spread
    capacity = 4 * beam
    cs = np.empty(capacity)
    cj = np.empty(capacity, np.int64)
    cw = np.empty(capacity, np.int64)
    cg = np.empty(capacity, np.int64)
    cl = np.empty(capacity)
    bypass = np.empty(capacity, np.bool_)
    g2, lg2 = np.empty_like(g), np.empty_like(lg)
    scores2, pointers2 = np.empty_like(scores), np.empty_like(pointers)
    parent = np.zeros((n, beam), np.int64)
    used = np.zeros((n, beam), np.int64)
    upd = np.empty(q)
    log_q = np.log(29.0)

    for i in range(n):
        x = c[i]
        m = 0
        for w in range(width):
            for skip in range(3):
                k = pointers[w] + skip
                if k >= len(key):
                    continue
                group = key[k]
                for v in range(q):
                    # p=(c-v) mod29 cannot be F on a non-bypass branch.
                    upd[v] = -1e12 if v == x else g[w, group, v] + mt[x, v]
                new = _lse(upd) - log_q
                cs[m] = scores[w] + new - lg[w, group] + skip * ln_skip
                cj[m], cw[m], cg[m], cl[m] = k + 1, w, group, new
                bypass[m] = False
                m += 1
            if x == 0:
                cs[m] = scores[w] + mt[0, 0]
                cj[m], cw[m], cg[m], cl[m] = pointers[w], w, 0, 0.0
                bypass[m] = True
                m += 1

        order = np.argsort(-cs[:m])
        size = 0
        for idx in order:
            same = 0
            for u in range(size):
                if pointers2[u] == cj[idx]:
                    same += 1
            if same >= per_ptr:
                continue
            w, group = cw[idx], cg[idx]
            g2[size] = g[w]
            lg2[size] = lg[w]
            if not bypass[idx]:
                for v in range(q):
                    g2[size, group, v] += -1e12 if v == x else mt[x, v]
                lg2[size, group] = cl[idx]
            scores2[size] = cs[idx]
            pointers2[size] = cj[idx]
            parent[i, size] = w
            used[i, size] = -1 if bypass[idx] else cj[idx] - 1
            size += 1
            if size >= beam:
                break
        if size == 0:
            return -1e18, np.full(n, -2, np.int64)
        g[:size], lg[:size] = g2[:size], lg2[:size]
        scores[:size], pointers[:size] = scores2[:size], pointers2[:size]
        width = size

    path = np.zeros(n, np.int64)
    w = 0
    for i in range(n - 1, -1, -1):
        path[i] = used[i, w]
        w = parent[i, w]
    return scores[0], path


def encrypt_skip_ptr_f(plaintext, mapped_key, rng, q=0.81):
    """Generate an exact source-matched F bypass + optional doublet skip plant."""
    c = np.empty(len(plaintext), dtype=np.int64)
    used = np.empty(len(plaintext), dtype=np.int64)
    j = 0
    prev = -1
    for i, symbol in enumerate(plaintext):
        if symbol == 0:
            c[i], used[i], prev = 0, -1, 0
            continue
        value = (symbol + mapped_key[j]) % 29
        while value == prev and rng.random() < q:
            j += 1
            value = (symbol + mapped_key[j]) % 29
        c[i], used[i], prev, j = value, j, value, j + 1
    return c, used
