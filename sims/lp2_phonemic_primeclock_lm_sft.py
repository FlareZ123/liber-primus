#!/usr/bin/env python3
"""Held-out CMU 39->29 phone-class LM test of the p56 prime-minus-one clock.

Uses the frozen ten merges and lexicographic 29-class numbering from
lp2_phonemic_register_capacity_sft.py. No word boundaries, F hold, or
post-hoc phone mergers are used in the candidate ciphertext.
"""
from __future__ import annotations

import collections
import contextlib
import importlib.util
import io
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIOR = ROOT / "sims/lp2_phonemic_register_capacity_sft.py"
spec = importlib.util.spec_from_file_location("frozen_phoneme_register", PRIOR)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(mod)

assert len(mod.classes) == 29
assert len(mod.to_gp) == 29
assert mod.MERGE == {
    "V": "F", "Z": "S", "ZH": "SH", "DH": "TH",
    "AO": "AA", "ER": "EH", "EY": "EH", "IH": "IY",
    "UH": "UW", "AH": "AE",
}

def words_to_ids(text: str) -> list[int]:
    result = []
    for spelling in re.findall(r"[A-Z]+", text.upper()):
        variants = mod.pronunciations.get(spelling.lower())
        if not variants:
            continue
        phones = [re.sub(r"[012]", "", phone) for phone in variants[0]]
        result.extend(mod.to_gp[mod.MERGE.get(phone, phone)] for phone in phones)
    return result

def lp1_page_ids(page_number: int) -> list[int]:
    assert page_number in mod.sections
    lines = []
    for line in mod.sections[page_number].splitlines():
        if not line.strip() or line.lstrip().startswith("["):
            continue
        lines.append(line)
    return words_to_ids("\n".join(lines))

def source_body(text: str) -> str:
    start = text.find("BEGIN SOURCE TEXT")
    end = text.find("END SOURCE TEXT")
    assert start >= 0 and end > start
    return text[start + len("BEGIN SOURCE TEXT"):end]

def gutenberg_body(text: str) -> str:
    start = text.find("*** START OF THIS PROJECT GUTENBERG EBOOK")
    end = text.find("*** END OF THIS PROJECT GUTENBERG EBOOK")
    assert start >= 0 and end > start
    return text[start:end]

def split_at_word_boundary(text: str, fraction: float) -> tuple[str, str]:
    index = int(len(text) * fraction)
    boundary = text.find(" ", index)
    if boundary < 0:
        boundary = index
    return text[:boundary], text[boundary + 1:]

# Frozen donor split: LP1 1/3/6, Blake's Song of Liberty training portion,
# and the first 75% of Gibran/Shakespeare train the model. LP1 10/14/57,
# the first half of Blake's distinct earlier book text, and the final 25% of
# Gibran/Shakespeare are held out.
lp1_train = [lp1_page_ids(n) for n in (1, 3, 6)]
native_holdout = lp1_page_ids(10) + lp1_page_ids(14) + lp1_page_ids(57)
blake_train_text = source_body(
    (ROOT / "resources/control/blake_song_of_liberty_train.txt").read_text(encoding="utf8")
)
blake_full = gutenberg_body(
    (ROOT / "resources/external/cicada2012-blake-marriage-gutenberg45315.txt").read_text(encoding="utf8")
)
blake_hold = words_to_ids(blake_full[:int(len(blake_full) * 0.50)])
gibran = gutenberg_body(
    (ROOT / "resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8-sig")
)
shakespeare = (ROOT / "resources/control/shakespeare_first300k.txt").read_text(encoding="utf8")
gibran_train_text, gibran_hold_text = split_at_word_boundary(gibran, 0.75)
shakespeare_train_text, shakespeare_hold_text = split_at_word_boundary(shakespeare, 0.75)
gibran_train = words_to_ids(gibran_train_text)
gibran_hold = words_to_ids(gibran_hold_text)
shakespeare_train = words_to_ids(shakespeare_train_text)
shakespeare_hold = words_to_ids(shakespeare_hold_text)
blake_train = words_to_ids(blake_train_text)

train_sequences = [s for s in lp1_train + [blake_train, gibran_train, shakespeare_train] if len(s) >= 4]
assert len(train_sequences) >= 6
assert sum(map(len, train_sequences)) >= 20000, "training tape is too small"

controls = [
    ("native LP1/LP2 solved pages 10+14+57", native_holdout, 137, 1),
    ("Blake Marriage first half", blake_hold, 701, -1),
    ("Gibran held-out final quarter", gibran_hold, 1901, 1),
    ("Shakespeare held-out final quarter", shakespeare_hold, 3301, -1),
]
controls = [(name, seq[:308], origin, sign) for name, seq, origin, sign in controls]
assert all(len(seq) == 308 for _, seq, _, _ in controls), [
    (name, len(seq)) for name, seq, _, _ in controls
]

class InterpolatedPhoneLM:
    """Frozen interpolated 1/2/3/4-gram model, no word-boundary token."""
    weights = (0.10, 0.20, 0.30, 0.40)
    alpha = 0.05

    def __init__(self, sequences: list[list[int]]):
        self.counts = {n: collections.defaultdict(collections.Counter) for n in range(1, 5)}
        self.totals = {n: collections.Counter() for n in range(1, 5)}
        for sequence in sequences:
            for i, token in enumerate(sequence):
                for n in range(1, 5):
                    context = tuple(sequence[max(0, i - n + 1):i])
                    self.counts[n][context][token] += 1
                    self.totals[n][context] += 1

    def score(self, sequence: list[int], prefix: list[int] | None = None) -> float:
        history = list(prefix or [])
        total_score = 0.0
        for token in sequence:
            probability = 0.0
            for n, weight in enumerate(self.weights, 1):
                context = tuple(history[-(n - 1):]) if n > 1 else ()
                count = self.counts[n].get(context, {}).get(token, 0)
                total = self.totals[n].get(context, 0)
                probability += weight * (
                    (count + self.alpha) / (total + self.alpha * 29)
                )
            total_score += math.log(probability)
            history.append(token)
        return total_score

lm = InterpolatedPhoneLM(train_sequences)

def prime_minus_one(count: int) -> list[int]:
    values = []
    candidate = 2
    while len(values) < count:
        prime = True
        divisor = 2
        while divisor * divisor <= candidate:
            if candidate % divisor == 0:
                prime = False
                break
            divisor += 1
        if prime:
            values.append((candidate - 1) % 29)
        candidate += 1
    return values

KEY = prime_minus_one(3302 + 308)

def encrypt(plain: list[int], origin: int, sign: int) -> list[int]:
    return [(value + sign * KEY[origin + i]) % 29 for i, value in enumerate(plain)]

def decrypt(cipher: list[int], origin: int, sign: int) -> list[int]:
    # Ordinary consumption at every phone-class symbol; no literal-F bypass.
    return [(value - sign * KEY[origin + i]) % 29 for i, value in enumerate(cipher)]

def search_prefix(cipher_prefix: list[int]) -> list[tuple[float, int, int]]:
    ranked = []
    for origin in range(3302):
        for sign in (-1, 1):
            candidate = decrypt(cipher_prefix, origin, sign)
            ranked.append((lm.score(candidate), origin, sign))
    ranked.sort(key=lambda item: (-item[0], item[1], item[2]))
    return ranked

calibration_results = []
top1_count = 0
for name, plain, planted_origin, planted_sign in controls:
    cipher = encrypt(plain, planted_origin, planted_sign)
    ranked = search_prefix(cipher[:232])
    true_score = next(score for score, origin, sign in ranked
                      if origin == planted_origin and sign == planted_sign)
    true_rank = 1 + sum(score > true_score + 1e-12 for score, _, _ in ranked)
    top_score, top_origin, top_sign = ranked[0]
    top_plain = decrypt(cipher, top_origin, top_sign)
    suffix_exact = top_plain[232:] == plain[232:]
    suffix_score = lm.score(top_plain[232:], prefix=top_plain[:232])
    true_suffix_score = lm.score(plain[232:], prefix=plain[:232])
    top1_count += (true_rank == 1)
    calibration_results.append({
        "control": name,
        "phone_classes": len(plain),
        "planted_origin": planted_origin,
        "planted_sign": planted_sign,
        "true_prefix_rank": true_rank,
        "top_candidate": {"origin": top_origin, "sign": top_sign, "score": top_score},
        "true_candidate_score": true_score,
        "top_candidate_recovers_76_class_suffix": suffix_exact,
        "top_candidate_suffix_logprob": suffix_score,
        "true_suffix_logprob": true_suffix_score,
    })

calibration_pass = (
    top1_count >= 3 and
    all(item["true_prefix_rank"] <= 5 for item in calibration_results)
)
output = {
    "frozen_register": {
        "merge": mod.MERGE,
        "class_order": mod.classes,
        "pronunciation": "CMUdict 1.1.3, first pronunciation, stress digits stripped",
        "word_boundaries": "none; continuous phone-class tape",
        "literal_F_hold": False,
        "clock": "prime-minus-one modulo 29, origins 0..3301, both signs, ordinary consumption",
    },
    "training": {
        "sources": ["LP1 pages 1,3,6", "Blake Song of Liberty training portion",
                    "Gibran first 75%", "Shakespeare first 75%"],
        "sequences": len(train_sequences),
        "phone_classes": sum(map(len, train_sequences)),
        "model": "interpolated 1/2/3/4-gram; weights 0.10/0.20/0.30/0.40; add-alpha 0.05",
    },
    "heldout_controls": calibration_results,
    "calibration": {
        "criterion": "true key rank 1 on at least 3/4 controls and rank <=5 on all four",
        "top1_recoveries": top1_count,
        "pass": calibration_pass,
    },
}

if not calibration_pass:
    output["decision"] = (
        "CALIBRATION FAIL: the frozen phone-class LM does not recover the planted "
        "prime-clock origin reliably on independent native/literary controls. "
        "Do not score the unknown p54-p55 ciphertext with this model."
    )
else:
    corpus = mod.CORPUS
    pages = {page["page"]: page["indices"] for page in corpus["pages"]}
    original = pages[54] + pages[55]
    assert len(pages[54]) == 232 and len(pages[55]) == 76 and len(original) == 308
    ranked = search_prefix(original[:232])
    best_score, best_origin, best_sign = ranked[0]
    best_plain = decrypt(original, best_origin, best_sign)
    output["original_p54_p55"] = {
        "cipher_length": len(original),
        "fit_prefix_length": 232,
        "heldout_p55_length": 76,
        "top20_prefix_candidates": [
            {"rank": i + 1, "origin": q, "sign": sign, "score": score}
            for i, (score, q, sign) in enumerate(ranked[:20])
        ],
        "best_full_tape_logprob": lm.score(best_plain),
        "best_p55_continuation_logprob": lm.score(best_plain[232:], prefix=best_plain[:232]),
        "best_class_labels": [mod.classes[x] for x in best_plain],
        "independent_source_selector": "none established; an LM rank alone does not select a historical key origin",
    }

    frequencies = {}
    for line in (ROOT / "resources/control/english_wordfreq_textblob.txt").read_text(encoding="utf8").splitlines():
        if not line or line.startswith(";"):
            continue
        parts = line.split()
        if len(parts) == 2 and parts[1].isdigit():
            frequencies[parts[0].lower()] = int(parts[1])
    lexicon = collections.defaultdict(list)
    for spelling, variants in mod.pronunciations.items():
        if not re.fullmatch(r"[a-z]+", spelling) or spelling not in frequencies:
            continue
        phones = [re.sub(r"[012]", "", phone) for phone in variants[0]]
        classes = tuple(mod.to_gp[mod.MERGE.get(phone, phone)] for phone in phones)
        if 1 <= len(classes) <= 20:
            lexicon[classes].append((spelling, frequencies[spelling]))
    n = len(best_plain)
    dp = [[] for _ in range(n + 1)]
    dp[0] = [(0.0, ())]
    for start in range(n):
        if not dp[start]:
            continue
        for width in range(1, min(20, n - start) + 1):
            candidates = lexicon.get(tuple(best_plain[start:start + width]), ())
            for spelling, frequency in candidates:
                weight = math.log1p(frequency) - 2.0
                for score, words in dp[start]:
                    dp[start + width].append((score + weight, words + (spelling,)))
        for stop in range(start + 1, min(n, start + 20) + 1):
            if len(dp[stop]) > 20:
                dp[stop] = sorted(dp[stop], key=lambda item: item[0], reverse=True)[:20]
    output["original_p54_p55"]["top_lexicon_segmentations"] = [
        {"score": score, "words": list(words)}
        for score, words in sorted(dp[n], key=lambda item: item[0], reverse=True)[:10]
    ]

out_path = ROOT / "im-results/lp2-phonemic-primeclock-lm-sft.json"
out_path.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
print(json.dumps(output, indent=2, ensure_ascii=False))
