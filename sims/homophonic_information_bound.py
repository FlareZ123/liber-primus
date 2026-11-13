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
from pathlib import Path

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
    selected_indices = (4, 9, 10, 11, 12, 15, 73)
    result = [[order[c] for c in scans[i] if c in order] for i in selected_indices]
    if sum(map(len, result)) != 1096:
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





ROOT = Path(__file__).resolve().parents[1]
LOCAL_SOURCES = {
    "LP2_CORPUS": (
        "resources/liber-primus/lp2-corpus.json",
        "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
    ),
    "LATIN_VULGATE_GP_WORDS": (
        "resources/control/latin-vulgate-gp-wholewords.txt",
        "fd15f9c814291e551c4b8b93337b4245a095ea85",
    ),
}


def read_local_pinned(key: str) -> bytes:
    relative_path, expected_blob = LOCAL_SOURCES[key]
    data = (ROOT / relative_path).read_bytes()
    actual_blob = hashlib.sha1(f"blob {len(data)}\\0".encode() + data).hexdigest()
    if actual_blob != expected_blob:
        raise ValueError(f"Local input {key} drifted: {actual_blob} != {expected_blob}")
    return data


def latin_register_controls(ciphertext: list[list[int]], original_mi: float) -> dict:
    """Compare LP2 adjacency with matched Latin-letter and Latin-GP-token windows."""
    corpus = json.loads(read_local_pinned("LP2_CORPUS"))
    words_text = read_local_pinned("LATIN_VULGATE_GP_WORDS").decode("utf-8")
    gp_alphabet = "0123456789ABCDEFGHIJKLMNOPQRS"
    words = [
        line.strip() for line in words_text.splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    gp_tokens: list[int] = []
    raw_letters: list[int] = []
    for word in words:
        for char in word:
            index = gp_alphabet.find(char)
            if index < 0:
                raise ValueError(f"Unexpected Latin GP token {char!r}")
            gp_tokens.append(index)
            raw_letters.extend(ord(letter) - ord("A") for letter in corpus["translit"][index])

    if (len(words), len(gp_tokens), len(raw_letters), len(set(raw_letters))) != (
        39835, 204802, 208680, 20
    ):
        raise ValueError("Latin Vulgate control dimensions/register changed")
    if len(set(gp_tokens)) != 29:
        raise ValueError("Latin Vulgate GP control does not use all 29 tokens")

    page_lengths = [len(page) for page in ciphertext]
    target_length = sum(page_lengths)
    if target_length != 12956:
        raise ValueError("LP2 page-length control changed")
    pair_count = sum(max(length - 1, 0) for length in page_lengths)

    def windows(sequence: list[int], alphabet_size: int) -> list[dict]:
        max_start = len(sequence) - target_length
        starts = [max_start * i // 19 for i in range(20)]
        result = []
        for start in starts:
            pages = []
            offset = start
            for length in page_lengths:
                pages.append(sequence[offset:offset + length])
                offset += length
            bits, pairs, _ = information(pages, alphabet_size)
            if pairs != pair_count:
                raise ValueError("Matched Latin window has different pair count")
            result.append({"start": start, "mutual_information_bits": bits, "pairs": pairs})
        return result

    raw_windows = windows(raw_letters, 26)
    gp_windows = windows(gp_tokens, 29)

    def summary(items: list[dict]) -> dict:
        values = sorted(item["mutual_information_bits"] for item in items)
        return {
            "min_bits": values[0],
            "median_bits": (values[9] + values[10]) / 2,
            "max_bits": values[-1],
            "all_windows_exceed_LP2": values[0] > original_mi,
        }

    raw_summary = summary(raw_windows)
    gp_summary = summary(gp_windows)
    if not raw_summary["all_windows_exceed_LP2"] or not gp_summary["all_windows_exceed_LP2"]:
        raise ValueError("Latin control does not satisfy the fixed-map MI bound")

    return {
        "source_blob_sha1": {key: value[1] for key, value in LOCAL_SOURCES.items()},
        "words": len(words),
        "raw_latin_letters": len(raw_letters),
        "raw_latin_used_symbols": len(set(raw_letters)),
        "gp_tokens": len(gp_tokens),
        "gp_token_alphabet_size": len(set(gp_tokens)),
        "window_count": 20,
        "window_length": target_length,
        "page_lengths": page_lengths,
        "within_page_pairs_per_window": pair_count,
        "LP2_mutual_information_bits": original_mi,
        "raw_latin": {**raw_summary, "windows": raw_windows},
        "GP_token_Latin": {**gp_summary, "windows": gp_windows},
        "interpretation": (
            "By data processing, a fixed deterministic one-rune-to-one-symbol map "
            "cannot increase adjacent MI. These controls exclude fixed maps to the "
            "sampled normalized Latin-letter and Latin-GP-token registers, including "
            "29-to-23 homophonic maps; they do not exclude all Latin or stateful/"
            "variable-length transformations."
        ),
    }


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
    latin_controls = latin_register_controls(ciphertext, observed)
    result["source_blob_sha1"].update(latin_controls.pop("source_blob_sha1"))
    result["Latin_register_controls"] = latin_controls
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
