"""A search-free necessary condition for fixed homophonic LP2 decryption.

Run on Python 3.10+; the inputs are pinned to immutable Git commits and
validated by Git blob SHA-1. No generated files or third-party packages.
"""
from __future__ import annotations

from collections import Counter
import hashlib
import json
import math
import random
import re
from urllib.request import urlopen

RUNE_ORDER = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
SOURCES = {
    "LP2": (
        "https://raw.githubusercontent.com/krisyotam/cicada3301/"
        "1ccf9583b7064ffd6feb52a49442311048295b41/liber-primus/runes-text.txt",
        "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7",
    ),
    "LP1_TRANSLATION": (
        "https://raw.githubusercontent.com/Wulfic/Cicada3301-Liber_Primus/"
        "f038274969449660fff5450b229bb96b510ec079/"
        "data/canonical/liber_primus_translation.txt",
        "4a49f51284ecd3235d4e07023f1d0dc9f0d60fdc",
    ),
    "LP1_RUNE_REFERENCE": (
        "https://raw.githubusercontent.com/Wulfic/Cicada3301-Liber_Primus/"
        "4f326e5585f8948b873bbc790f2a9083c5bdd6a2/"
        "data/canonical/liber_primus_master.txt",
        "ba553b1d43bc491a1bab66ebd02534249263ae90",
    ),
}


def download_pinned(key: str) -> str:
    url, expected_blob = SOURCES[key]
    with urlopen(url, timeout=30) as response:
        data = response.read()
    actual_blob = hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()
    if actual_blob != expected_blob:
        raise ValueError(f"Input {key} drifted: {actual_blob} != {expected_blob}")
    return data.decode("utf-8")


def parse_ciphertext(text: str) -> list[list[int]]:
    order = {symbol: index for index, symbol in enumerate(RUNE_ORDER)}
    pages = text.split("%")
    if len(pages) != 57:
        raise ValueError(f"Expected 57 rune-containing LP2 pages, got {len(pages)}")
    cipher = [[order[c] for c in page if c in order] for page in pages[:55]]
    if sum(map(len, cipher)) != 12956:
        raise ValueError("Unexpected rune count for LP2 pages 0–55")
    return cipher


def parse_reference(text: str) -> list[list[int]]:
    lines = []
    for line in text.splitlines():
        if re.match(r"^\d+(?:\.\d+){3}\t", line):
            letters = re.sub("[^A-Z]", "", line.split("\t", 1)[1].upper())
            lines.append([ord(ch) - ord("A") for ch in letters])
    if sum(map(len, lines)) != 3101:
        raise ValueError("Unexpected length of the LP1 translation reference")
    return lines




def parse_rune_reference(text: str) -> list[list[int]]:
    """Previously readable pages of the 75-section scan-aligned rune master."""
    order = {symbol: index for index, symbol in enumerate(RUNE_ORDER)}
    scans = text.split("%")
    selected_indices = (3, 8, 9, 10, 11, 14, 72)
    result = [[order[c] for c in scans[i] if c in order] for i in selected_indices]
    if sum(map(len, result)) != 1169:
        raise ValueError("Unexpected solved runic reference count")
    return result

def information(pages: list[list[int]], alphabet_size: int) -> tuple[float, int, int]:
    """Plug-in mutual information in bits, computed from within-page pairs."""
    joint = Counter()
    left = Counter()
    right = Counter()
    equal = 0
    pairs = 0
    for page in pages:
        for a, b in zip(page, page[1:]):
            joint[a, b] += 1
            left[a] += 1
            right[b] += 1
            pairs += 1
            equal += a == b
    if any(a >= alphabet_size or b >= alphabet_size for a, b in joint):
        raise ValueError("Symbol outside claimed alphabet")
    mutual_information = math.fsum(
        (freq / pairs) * math.log2(freq * pairs / (left[a] * right[b]))
        for (a, b), freq in joint.items()
    )
    return mutual_information, pairs, equal




def phase_information(pages: list[list[int]], alphabet_size: int, period: int) -> float:
    """I(C_i; C_{i+1} | i mod period), weighted by phase, reset on each page."""
    all_pairs = sum(max(len(page) - 1, 0) for page in pages)
    weighted_bits = 0.0
    for phase in range(period):
        joint = Counter()
        left = Counter()
        right = Counter()
        pairs = 0
        for page in pages:
            for i in range(phase, len(page) - 1, period):
                a, b = page[i], page[i + 1]
                joint[a, b] += 1
                left[a] += 1
                right[b] += 1
                pairs += 1
        if not pairs:
            continue
        if any(a >= alphabet_size or b >= alphabet_size for a, b in joint):
            raise ValueError("Symbol outside claimed alphabet")
        mutual_information = math.fsum(
            (freq / pairs) * math.log2(freq * pairs / (left[a] * right[b]))
            for (a, b), freq in joint.items()
        )
        weighted_bits += mutual_information * pairs / all_pairs
    return weighted_bits

def nonrepeat_null(lengths: list[int], equal_probability: float, rng: random.Random) -> list[list[int]]:
    """Independent uniform 29-way choices except a matched immediate-repeat rate."""
    output = []
    for n in lengths:
        page = [rng.randrange(29)]
        for _ in range(n - 1):
            prior = page[-1]
            if rng.random() < equal_probability:
                page.append(prior)
            else:
                candidate = rng.randrange(28)
                page.append(candidate + (candidate >= prior))
        output.append(page)
    return output


def percentile(sorted_values: list[float], percentile_fraction: float) -> float:
    return sorted_values[round((len(sorted_values) - 1) * percentile_fraction)]


def run() -> dict:
    ciphertext = parse_ciphertext(download_pinned("LP2"))
    translation = parse_reference(download_pinned("LP1_TRANSLATION"))
    observed, pair_count, doubles = information(ciphertext, 29)
    reference, ref_pairs, ref_doubles = information(translation, 26)
    cipher_counts = Counter(symbol for page in ciphertext for symbol in page)
    reference_counts = Counter(symbol for line in translation for symbol in line)
    min_rune_fraction = min(cipher_counts.values()) / sum(cipher_counts.values())
    infrequent_reference_letters = [
        chr(symbol + 65) for symbol in sorted(reference_counts)
        if reference_counts[symbol] / sum(reference_counts.values()) < min_rune_fraction
    ]
    periods = [1, 2, 3, 4, 5, 8]
    trials = 600
    rng = random.Random(3301)
    sample = sorted(
        information(nonrepeat_null([len(p) for p in ciphertext], doubles / pair_count, rng), 29)[0]
        for _ in range(trials)
    )
    null_greater = sum(value >= observed for value in sample)
    permuted = []
    for _ in range(trials):
        shuffled = [line.copy() for line in translation]
        for line in shuffled:
            rng.shuffle(line)
        permuted.append(information(shuffled, 26)[0])
    permuted.sort()
    result = {
        "source_blob_sha1": {key: value[1] for key, value in SOURCES.items()},
        "LP2": {"pages_with_runes": len(ciphertext), "runes": sum(map(len, ciphertext)),
                "pairs": pair_count, "adjacent_equals": doubles,
                "adjacent_equals_fraction": doubles / pair_count,
                "mutual_information_bits": observed},
        "fixed_map_unigram_floor": {
            "min_rune_fraction": min_rune_fraction,
            "min_rune_count": min(cipher_counts.values()),
            "max_rune_count": max(cipher_counts.values()),
            "LP1_English_letters_below_that_floor": infrequent_reference_letters,
            "LP1_English_letters_below_that_floor_count": len(infrequent_reference_letters),
        },
        "phase_conditioned_MI_bits": {
            "period_definition": "page-local zero-based rune/letter position modulo period",
            "LP2": {str(period): phase_information(ciphertext, 29, period) for period in periods},
            "LP1_solved_English": {
                str(period): phase_information(translation, 26, period) for period in periods
            },
        },
        "LP2_matched_no_repeat_null": {"trials": trials, "seed": 3301,
                "median_MI_bits": percentile(sample, .5),
                "95pct_interval_bits": [percentile(sample, .025), percentile(sample, .975)],
                "p_ge_observed": (null_greater + 1) / (trials + 1)},
        "LP1_solved_English": {"lines": len(translation), "letters": sum(map(len, translation)),
                "pairs": ref_pairs, "adjacent_equals": ref_doubles,
                "mutual_information_bits": reference,
                "shuffled_null_95pct_interval_bits": [percentile(permuted, .025), percentile(permuted, .975)],
                "p_random_ge_observed": (sum(value >= reference for value in permuted) + 1) / (trials + 1)},
    }
    # The deterministic map case requires no optimization: for any f,
    # I(f(C_i); f(C_{i+1})) <= I(C_i; C_{i+1}) by data processing.
    # This is an empirical-distribution identity. Phase-conditional DPI holds
    # for maps f_{i % period}, with fixed page-local phase. A fixed map's used
    # output symbols each have mass >= the smallest rune's empirical frequency.
    # No bound here controls context-dependent ciphers, stream ciphers,
    # variable-length codes, or unrelated plaintext registers.
    return result


if __name__ == "__main__":
    print(json.dumps(run(), indent=2, ensure_ascii=False))
