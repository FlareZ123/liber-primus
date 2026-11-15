"""Original LP2 p27/p55 source-anchored two-time-pad exact dictionary gate.

Windows/Python 3.12+, cmudict==1.1.3. Read-only single-file runnable test:
python sims/lp2_p27_p55_affine_twotimepad_sft.py

The unique physical p55 -> p56 six-plus-one rune seam points back to
p27 local28..34. Align the final six p55 runes with p27 local28..33 and
walk backwards 76 GP29 positions cyclically through the visible p27..32
chapter. Test whether both passages are genuine native GP-English words
encrypted with one unknown additive pad. Permit separate, completely
unknown invertible affine maps for the two plaintext streams.

The model and dictionary-word-preservation premise are conditional.
No pad, phase, intercept, or plaintext is fitted to pass the gate.
"""

import importlib.metadata
import itertools
import json
import random
from collections import defaultdict
from pathlib import Path

import cmudict

assert importlib.metadata.version("cmudict") == "1.1.3"
ROOT = Path(__file__).resolve().parents[1]
corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
raw = (ROOT / "resources/lp2-transcription.txt").read_text(encoding="utf-8")
rune = {s: i for i, s in enumerate(corpus["runes"])}
token = {s: i for i, s in enumerate(corpus["translit"])}
greedy = sorted(token, key=len, reverse=True)
MOD = 29


def words_in_source(text):
    result, current = [], []
    for c in text:
        if c in rune:
            current.append(rune[c])
        elif c in "/\\\r\n\t %":
            continue
        elif current:
            result.append(bytes(current))
            current = []
    if current:
        result.append(bytes(current))
    return result


def native_word(word):
    s = word.upper().replace("QU", "CW").replace("V", "U")
    s = s.replace("K", "C").replace("Z", "S").replace("Q", "C")
    result = []
    i = 0
    while i < len(s):
        if s.startswith("ING", i):
            result.append(token["NG"])
            i += 3
        elif s.startswith("IO", i):
            # Source-calibrated: IO is the IA rune (LP1 and LP2 p57).
            result.append(token["IA"])
            i += 2
        else:
            item = next((v for v in greedy if s.startswith(v, i)), None)
            if item is None:
                return None
            result.append(token[item])
            i += len(item)
    return bytes(result)


def starts(lengths):
    return list(itertools.accumulate([0, *lengths]))[:-1]


chapter_words = words_in_source(raw.split("$")[5])
chapter = b"".join(chapter_words)
page55_words = words_in_source(raw.split("%")[54])  # p50 is runeless/omitted.
page55 = b"".join(page55_words)
assert len(chapter) == 1433
assert chapter == bytes(v for page in corpus["pages"][27:33] for v in page["indices"])
assert len(page55) == 76
assert page55 == bytes(corpus["pages"][55]["indices"])
assert page55[70:] == chapter[28:34]
assert [corpus["translit"][v] for v in page55[70:]] == ["D", "J", "U", "B", "E", "I"]
other = chapter[1391:] + chapter[:34]
assert len(other) == 76 and other[70:] == page55[70:]

a_lengths = [len(w) for w in page55_words]
assert a_lengths == [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]
a_starts = starts(a_lengths)
chapter_starts = starts([len(w) for w in chapter_words])
fragments = []
for start, word in zip(chapter_starts, chapter_words):
    if start + len(word) > 1391 and start < 1433:
        fragments.append(word[max(0, 1391 - start):min(len(word), 1433 - start)])
for start, word in zip(chapter_starts, chapter_words):
    if start >= 34:
        break
    fragments.append(word[:min(len(word), 34 - start)])
assert b"".join(fragments) == other
assert len(chapter_words[chapter_starts.index(1388)]) == 9
b_lengths = [len(w) for w in fragments]
assert b_lengths == [6, 4, 8, 2, 3, 2, 8, 5, 4, 3, 12, 4, 7, 2, 3, 3]
b_starts = starts(b_lengths)
delta = bytes((a - b) % MOD for a, b in zip(page55, other))
assert delta[-6:] == bytes(6)

lexicon = defaultdict(dict)
for entry in cmudict.words():
    if entry.isalpha():
        candidate = native_word(entry)
        if candidate:
            lexicon[len(candidate)].setdefault(candidate, entry.upper())
assert sum(map(len, lexicon.values())) == 115662
assert len(lexicon[13]) == 1133 and len(lexicon[8]) == 17175
suffix6 = set(w[-6:] for w in lexicon[9])
assert len(suffix6) == 9280


def domains():
    a = [list(lexicon[n]) for n in a_lengths]
    # P55 begins mid-word from p54; its first one-rune fragment has no
    # independent word constraint. Grant all 29 symbols conservatively.
    a[0] = [bytes((v,)) for v in range(MOD)]
    b = [list(lexicon[n]) for n in b_lengths]
    b[0] = list(suffix6)  # Six observed suffix runes of a nine-rune word.
    return a, b


edges = sorted((
    (i, j, max(sa, sb), min(sa + na, sb + nb))
    for i, (sa, na) in enumerate(zip(a_starts, a_lengths))
    for j, (sb, nb) in enumerate(zip(b_starts, b_lengths))
    if max(sa, sb) < min(sa + na, sb + nb)
), key=lambda e: e[2] - e[3])
assert len(edges) == 28 and edges[0] == (7, 6, 25, 33)
assert (11, 10, 48, 55) in edges


def arc_consistency(observed, alpha, beta, intercept):
    """A necessary exact two-message dictionary condition, no pad guessing."""
    a_domains, b_domains = domains()
    inv_beta = pow(beta, -1, MOD)
    for iteration in range(12):
        before = sum(map(len, a_domains)) + sum(map(len, b_domains))
        for i, j, lo, hi in edges:
            ac, bc = a_domains[i], b_domains[j]
            ai, bi, length = lo - a_starts[i], lo - b_starts[j], hi - lo
            b_keys = {w[bi:bi + length] for w in bc}
            supported, next_a = set(), []
            for w in ac:
                required = bytes(
                    inv_beta * (alpha * value + intercept - observed[lo + k]) % MOD
                    for k, value in enumerate(w[ai:ai + length])
                )
                if required in b_keys:
                    next_a.append(w)
                    supported.add(required)
            next_b = [w for w in bc if w[bi:bi + length] in supported]
            a_domains[i], b_domains[j] = next_a, next_b
            if not next_a or not next_b:
                return {"feasible": False, "pass": iteration,
                        "first_conflict": [i, j, lo, hi],
                        "remaining": [len(next_a), len(next_b)]}
        after = sum(map(len, a_domains)) + sum(map(len, b_domains))
        if after == before:
            return {"feasible": True, "passes": iteration + 1,
                    "survivors": [sum(map(len, a_domains)), sum(map(len, b_domains))]}
    raise AssertionError("Arc consistency failed to reach fixed point")


def all_affine_witnesses():
    """Exhaustive 28x28 scales, algebraically eliminating all 29 intercepts.

    The first-position equation determines the only possible intercept.
    The other seven equations are necessary and sufficient for the overlap.
    """
    i, j, lo, hi = edges[0]
    assert (i, j, lo, hi) == (7, 6, 25, 33)
    a_words, b_words = list(lexicon[a_lengths[i]]), list(lexicon[b_lengths[j]])
    a8 = [w[lo - a_starts[i]:hi - a_starts[i]] for w in a_words]
    b8 = [w[lo - b_starts[j]:hi - b_starts[j]] for w in b_words]
    a7 = [bytes((x - w[0]) % MOD for x in w[1:]) for w in a8]
    b7 = [bytes((x - w[0]) % MOD for x in w[1:]) for w in b8]
    d = delta[lo:hi]
    dd = bytes((x - d[0]) % MOD for x in d[1:])
    witnesses = []
    for beta in range(1, MOD):
        table = {bytes(beta * x % MOD for x in v): j for j, v in enumerate(b7)}
        for alpha in range(1, MOD):
            for i, a in enumerate(a7):
                required = bytes((alpha * v - off) % MOD for v, off in zip(a, dd))
                j = table.get(required)
                if j is None:
                    continue
                offset = (d[0] - alpha * a8[i][0] + beta * b8[j][0]) % MOD
                witnesses.append({
                    "alpha": alpha, "beta": beta, "intercept": offset,
                    "p55_native_word": lexicon[a_lengths[7]][a_words[i]],
                    "p27_native_word": lexicon[b_lengths[6]][b_words[j]],
                })
    return sorted(witnesses, key=lambda w:
                  (w["alpha"], w["beta"], w["p55_native_word"]))


def run():
    direct = arc_consistency(delta, 1, 1, 0)
    assert direct == {"feasible": False, "pass": 0,
                      "first_conflict": [7, 6, 25, 33], "remaining": [0, 0]}
    witnesses = all_affine_witnesses()
    assert len(witnesses) == 4
    assert [(w["alpha"], w["beta"], w["intercept"]) for w in witnesses] == [
        (1, 4, 15), (1, 4, 15), (14, 1, 18), (15, 28, 27)]
    cases = sorted({(w["alpha"], w["beta"], w["intercept"]) for w in witnesses})
    exclusions = [dict(parameters=[a, b, off],
                       **arc_consistency(delta, a, b, off))
                  for a, b, off in cases]
    assert all(not r["feasible"] and
               r["first_conflict"] == [11, 10, 48, 55] for r in exclusions)

    # Native word-preserving two-time-pad positive with completely unknown pad.
    rng = random.Random(0x33012755)
    a_domain, b_domain = domains()
    a_plain = b"".join(rng.choice(pool) for pool in a_domain)
    b_plain = b"".join(rng.choice(pool) for pool in b_domain)
    alpha, beta, intercept = 17, 6, 10
    pad = bytes(rng.randrange(MOD) for _ in range(76))
    a_cipher = bytes((alpha * v + intercept + pad[k]) % MOD
                     for k, v in enumerate(a_plain))
    b_cipher = bytes((beta * v + pad[k]) % MOD for k, v in enumerate(b_plain))
    assert a_plain == bytes(pow(alpha, -1, MOD) *
                            (v - intercept - pad[k]) % MOD
                            for k, v in enumerate(a_cipher))
    assert b_plain == bytes(pow(beta, -1, MOD) * (v - pad[k]) % MOD
                            for k, v in enumerate(b_cipher))
    planted_delta = bytes((v - b_cipher[k]) % MOD for k, v in enumerate(a_cipher))
    plant = arc_consistency(planted_delta, alpha, beta, intercept)
    assert plant["feasible"]
    return {
        "source": "original GP29 p55 and cyclic p27..32, shared DJU-BEI six-rune bookend",
        "source_window_runes": 76,
        "p55_words": len(page55_words),
        "p27_fragments": len(fragments),
        "word_overlaps": len(edges),
        "dictionary": "cmudict==1.1.3, source-native ING and IO; 115662 unique GP29 encodings",
        "hypothesis": "shared 76-rune unknown pad, separately unknown invertible affine GP29 maps",
        "direct_shared_pad": direct,
        "affine_parameters_exhaustive": "28*28 scales, all 29 relative intercepts",
        "first_eight_rune_overlap_witnesses": witnesses,
        "remaining_affine_parameter_sets": cases,
        "all_rejected_by_second_seven_rune_overlap": exclusions,
        "native_shared_pad_76_rune_plant": plant,
        "plaintext_recovered": False,
        "decision": "The source-anchored same-pad affine family has no paired CMUdict-word plaintext with original printed boundaries. Other architectures and missing authentic keys remain open."
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
