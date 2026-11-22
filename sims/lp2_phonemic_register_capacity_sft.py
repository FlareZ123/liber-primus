#!/usr/bin/env python3
"""SFT: phonemic GP29-register rival against original LP2 state-independent capacities.

Requires cmudict==1.1.3 (CMU Pronouncing Dictionary; first pronunciation).
Run in repository root: python sims/lp2_phonemic_register_capacity_sft.py
This is a falsification/control experiment, not an LP2 plaintext decoder.
"""
from __future__ import annotations

import collections
import json
import re
from pathlib import Path

import cmudict

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
TRANSCRIPT = (ROOT / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf8")
LP1_SOURCE = (ROOT / "resources/liber-primus/lp1-plaintext-reference.txt").read_text(encoding="utf8")

# Exact documented 39 CMU/ARPAbet phoneme inventory; ten deliberate mergers
# construct the most generous single-rune 29-class phonemic counterfactual.
# They are NOT a Cicada-authenticated translation table. Homophonic and
# 39-to-29 pronunciation ambiguities remain explicit and unrecoverable.
MERGE = {
    "V": "F", "Z": "S", "ZH": "SH", "DH": "TH",
    "AO": "AA", "ER": "EH", "EY": "EH", "IH": "IY",
    "UH": "UW", "AH": "AE",
}
pronunciations = cmudict.dict()
phone_inventory = sorted({
    re.sub(r"[012]", "", phone)
    for variants in pronunciations.values()
    for variant in variants[:1]
    for phone in variant
})
assert len(phone_inventory) == 39
classes = sorted({MERGE.get(phone, phone) for phone in phone_inventory})
assert len(classes) == 29
to_gp = {token: i for i, token in enumerate(classes)}
from_gp = {i: token for token, i in to_gp.items()}
assert len(to_gp) == len(from_gp) == 29

sections = {}
for match in re.finditer(r"(?ms)^### (\d+)\s*\n(.*?)(?=^### |\Z)", LP1_SOURCE):
    sections[int(match.group(1))] = match.group(2)
selected_pages = [1, 3, 6, 10, 14, 57]
assert all(n in sections for n in selected_pages)
selected_words = []
for n in selected_pages:
    for line in sections[n].splitlines():
        if not line.strip() or line.lstrip().startswith("["):
            continue
        selected_words.extend(re.findall(r"[A-Z]+", line.upper()))
assert len(selected_words) >= 400, "source control must be substantial"
spoken = []
raw_spoken = []
missing = collections.Counter()
for spelling in selected_words:
    variants = pronunciations.get(spelling.lower())
    if variants is None:
        missing[spelling] += 1
        continue
    base_phones = tuple(re.sub(r"[012]", "", p) for p in variants[0])
    raw_spoken.append(base_phones)
    spoken.append(tuple(MERGE.get(phone, phone) for phone in base_phones))
assert len(spoken) >= 380
assert len(spoken) == len(raw_spoken)
raw_within = sum(a == b for w in raw_spoken for a, b in zip(w, w[1:]))
raw_within_edges = sum(len(w) - 1 for w in raw_spoken)
raw_across = sum(a[-1] == b[0] for a, b in zip(raw_spoken, raw_spoken[1:]))
raw_equal_rate = (raw_within + raw_across) / (raw_within_edges + len(raw_spoken) - 1)

flat = [token for w in spoken for token in w]
recovered = [from_gp[to_gp[p]] for p in flat]
assert recovered == flat, "exact reversible 29-class projection positive"
within = sum(a == b for w in spoken for a, b in zip(w, w[1:]))
within_edges = sum(len(w) - 1 for w in spoken)
across = sum(a[-1] == b[0] for a, b in zip(spoken, spoken[1:]))
frequency = collections.Counter(flat)
total = len(flat)
top5 = frequency.most_common(5)
sample_ioc = sum(k * (k - 1) for k in frequency.values()) / (total * (total - 1))
sample_len1or2 = sum(len(w) <= 2 for w in spoken)
sample_mean = total / len(spoken)
phoneme_word_counts = collections.Counter(spoken)
sample_long_repeated = sum(
    n - 1 for w, n in phoneme_word_counts.items() if len(w) >= 4 and n > 1
)

original_pages = [
    page for page in CORPUS["pages"]
    if page["page"] <= 55 and page["indices"]
]
assert len(original_pages) == 55
assert sum(len(page["indices"]) for page in original_pages) == 12956
transition = [[0] * 29 for _ in range(29)]
doublets = 0
for page in original_pages:
    a = page["indices"]
    for previous, current in zip(a, a[1:]):
        transition[previous][current] += 1
        doublets += previous == current
nsteps = sum(map(sum, transition))
assert nsteps == 12901 and doublets == 86
# For EVERY hidden per-previous-cipher-rune substitution/permutation f_prev,
# count(P_i=u) <= sum_prev max_curr count(prev,curr), independently of u and f.
# Sum of top k cells in each row is the universal upper bound for any chosen
# k output phoneme/rune symbols. No ciphertext tuning or English score involved.
cap_one = sum(max(row) for row in transition)
cap_five = sum(sum(sorted(row, reverse=True)[:5]) for row in transition)
assert (cap_one, cap_five) == (714, 3135)
original_freq = collections.Counter(
    token for page in original_pages for token in page["indices"]
)
source_ioc = sum(v * (v - 1) for v in original_freq.values()) / (12956 * 12955)

rune_lookup = {rune: i for i, rune in enumerate(CORPUS["runes"])}
word_records = []
current_word = []
page_number = 0
for char in TRANSCRIPT:
    if char == "%":
        page_number += 1
        continue
    if page_number >= 55:
        break
    if char in rune_lookup:
        current_word.append(rune_lookup[char])
    elif char in "-.$&§":
        if current_word:
            word_records.append(tuple(current_word))
            current_word = []
if current_word:
    word_records.append(tuple(current_word))
assert len(word_records) == 2896
assert sum(len(w) for w in word_records) == 12956
word_counts = collections.Counter(word_records)
assert sum(n - 1 for w, n in word_counts.items() if len(w) >= 4) == 0
original_len1or2 = sum(len(w) <= 2 for w in word_records)
assert original_len1or2 == 531

report = {
    "scope": "Source LP1 sections 1,3,6,10,14 and solved LP2 p57; original unknown LP2 p0-55",
    "declared_counterfactual": "CMU ARPAbet 39 phones collapsed into a bijective 29-class GP29 representation",
    "historical_selector": "The actual 29-rune chart is source-authentic; the CMU class merges and rune ordering are exploratory, not Cicada-authenticated",
    "control": {
        "source_words_in_excerpts": len(selected_words),
        "pronounceable_words": len(spoken),
        "oov": dict(sorted(missing.items())),
        "runic_phoneme_class_positive": len(recovered),
        "all_29_classes_reversible_positive": recovered == flat,
        "mean_phones_per_word": sample_mean,
        "words_len1or2": sample_len1or2,
        "fraction_words_len1or2": sample_len1or2 / len(spoken),
        "within_word_same_class": within,
        "within_word_pairs": within_edges,
        "between_word_same_class": across,
        "between_word_pairs": len(spoken) - 1,
        "all_same_class_rate": (within + across) / (within_edges + len(spoken) - 1),
        "raw_39phone_equal_within_words": raw_within,
        "raw_39phone_equal_between_words": raw_across,
        "raw_39phone_pairs": raw_within_edges + len(raw_spoken) - 1,
        "raw_39phone_equal_rate": raw_equal_rate,
        "unigram_ioc": sample_ioc,
        "largest_one_symbol_count": top5[0],
        "top_five_symbols": top5,
        "top_one_frequency": top5[0][1] / total,
        "top_five_frequency": sum(k for _, k in top5) / total,
        "repeated_long_words_excess": sample_long_repeated,
    },
    "original_lp2": {
        "runes": 12956,
        "words": len(word_records),
        "mean_runes_per_word": 12956 / len(word_records),
        "words_len1or2": original_len1or2,
        "fraction_words_len1or2": original_len1or2 / len(word_records),
        "within_page_pairs": nsteps,
        "equal_pairs": doublets,
        "equal_fraction": doublets / nsteps,
        "unigram_ioc": source_ioc,
        "repeat_long_word_excess": 0,
        "row_permutation_any_one_symbol_capacity": cap_one,
        "row_permutation_any_one_symbol_max_fraction": cap_one / nsteps,
        "row_permutation_any_five_symbols_capacity": cap_five,
        "row_permutation_any_five_symbols_max_fraction": cap_five / nsteps,
    },
    "decision": (
        "Phonetic source can generate low repeats, but this concrete native-English "
        "control has a sharply different word-length and marginal distribution. "
        "Every fixed 29-way per-previous-cipher row-permutation is independently "
        "bounded by the original 714/3135 counts; the source control's top-one "
        "and top-five fractions violate those limits. A time-varying cipher or "
        "different independently chosen representation remains open; no source "
        "authenticates this class merge, and no unknown plaintext is recovered."
    ),
}
assert top5[0][1] / total > cap_one / nsteps
assert sum(k for _, k in top5) / total > cap_five / nsteps
print(json.dumps(report, indent=2, ensure_ascii=False))
