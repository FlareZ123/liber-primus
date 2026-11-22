"""Original-source GP29 51-rune transposition word-bag integer feasibility.

Agent27, 2026-11-22. Source-locked gate:
  Physical p53 (source JPEG70.jpg) has red 51-rune span128..178 and
  thirteen-dot terminal marker; printed 12 red word lengths are
  [5,4,4,11,2,3,2,6,5,5,2,2].
A pure rune transposition (even unknown column permutation) preserves the
complete multiset of all 51 GP29 ordinals. Every plaintext written in native
GP English with these printed word lengths must be a sum of 12 complete
dictionary-word GP rune histograms with exactly that multiset.

Solve the entire finite 29-rune count/word-length system as an exact ILP.
A feasible result certifies only a WORD BAG, not an authored readable phrase
or a meaningful transposition. Infeasible rules out all original wordspace-
preserving permutations within THIS finite lexicon. A time limit is inconclusive.

Run on Windows Python3.11 with numpy, scipy; all sources are repo-local.
"""
from __future__ import annotations

import json
import math
from collections import Counter
from pathlib import Path
import re
import time

import numpy as np
from scipy.optimize import Bounds, LinearConstraint, milp
from scipy.sparse import csc_array

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
INK = json.loads((ROOT / "resources/liber-primus/lp2-ink-annotations.json").read_text(encoding="utf-8"))
PAGE = next(x for x in DATA["pages"] if x["page"] == 53)
MARK = next(x for x in INK["pages"] if x["page"] == 53)
RUNES = DATA["runes"]
ALPHABET = DATA["translit"]
RED = PAGE["indices"][128:]
SIZES = [5, 4, 4, 11, 2, 3, 2, 6, 5, 5, 2, 2]
assert len(PAGE["indices"]) == 179 and len(RED) == 51
assert [(x["start"], x["length"]) for x in MARK["red_spans"]] == [(128, 51)]
assert MARK["large_punctuation"] == [[179, 13, "red"]]
assert sum(SIZES) == 51
TRANSCRIPTION = (ROOT / "resources/lp2-transcription.txt").read_text(encoding="utf-8")
SOURCE_CHUNKS = re.split(r"(?m)^%\s*$", TRANSCRIPTION.replace("\r\n", "\n"))
assert len(SOURCE_CHUNKS) == 57
PAGE_ORIGINAL = SOURCE_CHUNKS[52].replace("/\n", "").replace("\n", "")
WORD_TOKENS = re.findall(f"[{''.join(RUNES)}]+", PAGE_ORIGINAL)
assert [RUNES.index(x) for word in WORD_TOKENS for x in word] == PAGE["indices"]
RUNE_START = 0
SOURCE_LENGTHS = []
for word in WORD_TOKENS:
    if RUNE_START >= 128:
        SOURCE_LENGTHS.append(len(word))
    RUNE_START += len(word)
assert SOURCE_LENGTHS == SIZES, (SOURCE_LENGTHS, SIZES)
SOURCE_HIST = np.bincount(RED, minlength=29).astype(np.int64)
SOURCE_PAIRS = int(sum(int(z) * (int(z) - 1) for z in SOURCE_HIST))
assert SOURCE_PAIRS == 76

TOKENS = [("ING", 21), ("IO", 27)]
TOKENS.extend((name, i) for i, name in enumerate(ALPHABET))
TOKENS.sort(key=lambda x: -len(x[0]))


def encode(word: str) -> tuple[int, ...]:
    """Native GP lexicon mapping used by other source-tested SFTs."""
    s = word.upper().replace("QU", "CW").replace("V", "U")
    s = s.replace("K", "C").replace("Q", "C").replace("Z", "S")
    out: list[int] = []
    index = 0
    while index < len(s):
        for token, value in TOKENS:
            if s.startswith(token, index):
                out.append(value)
                index += len(token)
                break
        else:
            return ()
    return tuple(out)


def lexicon() -> dict[tuple[int, ...], tuple[str, int]]:
    """Completely source-pinned dictionaries and authenticated GP words."""
    d: dict[tuple[int, ...], tuple[str, int]] = {}
    wanted = set(SIZES)
    freq_file = ROOT / "resources/control/english_wordfreq_textblob.txt"
    for line in freq_file.read_text(encoding="utf-8").splitlines():
        m = re.fullmatch(r"([a-z]+) (\d+)", line)
        if m is None:
            continue
        word = m[1]
        rune_word = encode(word)
        if len(rune_word) not in wanted:
            continue
        count = int(m[2])
        old = d.get(rune_word)
        if old is None or count > old[1]:
            d[rune_word] = word, count
    for source_path in [
        "resources/control/shakespeare_first300k.txt",
        "resources/control/gibran_prophet_58585.txt",
    ]:
        text = (ROOT / source_path).read_text(encoding="utf-8")
        for match in re.finditer(r"[a-zA-Z]+", text):
            word = match.group(0).lower()
            encoded = encode(word)
            if len(encoded) in wanted and encoded not in d:
                d[encoded] = (word, 1)
    witness = (ROOT / "resources/transcriptions/lp1_wulfic_canonical.txt").read_text(encoding="utf-8")
    first = witness.index("ᚦᛖ-ᛚᚩᛋᛋ")
    last = witness.index("\n$\n%\n", first)
    original_solved = witness[first:last].replace("/\n%\n", "").replace("/\n", "").replace("\n", "")
    original_words = re.findall(f"[{''.join(RUNES)}]+", original_solved)
    assert len(original_words) == 181
    for word in original_words:
        encoded = tuple(RUNES.index(x) for x in word)
        if len(encoded) in wanted:
            d.setdefault(encoded, ("LP1-native-" + word, 2))
    return d


def sliding_pairs(arr: list[int], width: int = 51) -> tuple[int, int, int]:
    """Count all literal consecutive GP windows no reweighting."""
    if len(arr) < width:
        return 0, 0, 0
    hist = [0] * 29
    pair = 0
    for v in arr[:width]:
        pair += 2 * hist[v]
        hist[v] += 1
    smaller = 0
    same = 0
    least = pair
    for start in range(len(arr) - width + 1):
        least = min(least, pair)
        smaller += int(pair < SOURCE_PAIRS)
        same += int(pair == SOURCE_PAIRS)
        if start + width == len(arr):
            continue
        removed, added = arr[start], arr[start + width]
        hist[removed] -= 1
        pair -= 2 * hist[removed]
        pair += 2 * hist[added]
        hist[added] += 1
    return smaller, same, least


def native_plain_controls() -> dict[str, dict[str, int]]:
    out = {}
    for path in [
        "resources/control/shakespeare_first300k.txt",
        "resources/control/gibran_prophet_58585.txt",
    ]:
        text = (ROOT / path).read_text(encoding="utf-8")
        arr = [n for w in re.findall(r"[a-zA-Z]+", text)
               for n in encode(w)]
        less, equal, low = sliding_pairs(arr)
        out[Path(path).name] = {
            "runes": len(arr), "windows51": len(arr) - 50,
            "below_original": less, "equal_original": equal,
            "minimum_pair_collision": low,
        }
    return out


def solve(rhs: np.ndarray, words: list[tuple[str, tuple[int, ...], int]],
          max_seconds: float) -> dict:
    # For each word type, integer x_w is its multiplicity: a repeated
    # ordinary word can appear multiple times in the same plaintext.
    # Grouped original printed word lengths are exact cardinality equalities.
    lengths = sorted(set(SIZES))
    group = Counter(SIZES)
    rows, cols, data = [], [], []
    for j, (_, encoded, _) in enumerate(words):
        c = Counter(encoded)
        for i, v in c.items():
            rows.append(i)
            cols.append(j)
            data.append(float(v))
        rows.append(29 + lengths.index(len(encoded)))
        cols.append(j)
        data.append(1.0)
    model = csc_array((np.array(data, dtype=np.float64),
                       (np.array(rows), np.array(cols))),
                      shape=(29 + len(lengths), len(words)))
    eq = np.array(list(rhs) + [group[n] for n in lengths], dtype=np.float64)
    variable_count = len(words)
    bounds = Bounds(np.zeros(variable_count),
                    np.array([group[len(w[1])] for w in words], dtype=np.float64))
    objective = np.zeros(variable_count)
    t0 = time.monotonic()
    res = milp(c=objective, integrality=np.ones(variable_count),
               bounds=bounds, constraints=LinearConstraint(model, eq, eq),
               options={"time_limit": float(max_seconds),
                        "presolve": True, "disp": False})
    elapsed = time.monotonic() - t0
    summary = {"status": int(res.status), "message": str(res.message),
               "elapsed_seconds": round(elapsed, 3),
               "candidate_types": variable_count,
               "source_wordlength_class_counts": dict(group)}
    if res.x is not None:
        chosen = np.rint(res.x).astype(np.int64)
        residual = model @ chosen - eq
        summary["exact_integral_source_certificate"] = bool(
            np.allclose(residual, 0, atol=1e-8))
        summary["total_selected_words"] = int(chosen.sum())
        summary["selected"] = [
            {"source_word": words[j][0], "original_printed_rune_length": len(words[j][1]),
             "multiplicity": int(chosen[j]),
             "encoded_gp": list(words[j][1])}
            for j in np.flatnonzero(chosen)
        ]
        assert summary["exact_integral_source_certificate"]
    return summary


D = lexicon()
eligible = []
for encoded, (word, weight) in D.items():
    counts = np.bincount(encoded, minlength=29)
    if np.any(counts > SOURCE_HIST):
        continue
    eligible.append((word, encoded, weight))
assert len(eligible) > 1000
# Positive certificate: derive a different, actual-native-GP matching-word-tape
# synthetic plaintext and its rune multiset from this SAME source lexicon.
groups = Counter(SIZES)
selected = []
for n in sorted(groups):
    source_words = [w for w in eligible if len(w[1]) == n]
    source_words.sort(key=lambda x: x[2], reverse=True)
    assert len(source_words) >= groups[n]
    selected.extend(source_words[:groups[n]])
planted_gp = [i for _, w, _ in selected for i in w]
assert len(planted_gp) == 51
plant_rhs = np.bincount(planted_gp, minlength=29)
planted_result = solve(plant_rhs, eligible, 25.0)
assert planted_result["status"] == 0
assert planted_result["exact_integral_source_certificate"]

original_result = solve(SOURCE_HIST, eligible, 95.0)
out = {
    "source": {"original_page": 53, "red_start": 128, "red_runes": 51,
               "thirteen_dots": 13, "word_lengths": SIZES,
               "rune_histogram": SOURCE_HIST.tolist(),
               "ordered_equal_letter_pairs": SOURCE_PAIRS,
               "ioc": SOURCE_PAIRS / (51 * 50)},
    "english_window_controls": native_plain_controls(),
    "lexicon": {"all_native_gp_types_in_source": len(D),
                "original_histogram_eligible_types": len(eligible)},
    "positive_same_form": planted_result,
    "original_feasibility": original_result,
    "decision": (
        "EXACT infeasibility within the pinned native-GP word-inventory"
        if original_result["status"] == 2
        else "AT LEAST one finite-dictionary 12-word rune-bag EXISTS; "
             "this is no ordered phrase or author plaintext"
        if original_result["status"] == 0
        else "UNDECIDED time/error; no infeasibility claim"
    ),
}
print("summary", json.dumps(out, sort_keys=True, separators=(",", ":")), flush=True)
