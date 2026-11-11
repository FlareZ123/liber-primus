#!/usr/bin/env python3
"""Source-locked pixel-statistic key test for the p32/2016 image grid.

LP2 p32 is a 121-rune 11x11 array. Its first row's GP-prime values sum to
563 and its first column's values sum to 569, exactly the dimensions of the
authentic 2016 signed JPEG. This partitions that image into 121 nonuniform
tiles in ordinary row-major order. Earlier work tested text-gutter alignment,
visible-word centers, and a fixed diagonal path; this test asks one new,
minimal question: do the tile luminance statistics form a 29-symbol stream
that decrypts p32 itself?

Only two predeclared per-tile statistics are tested:
  * mean grayscale, quantized uniformly to 29 bins;
  * fraction of pixels >= 180, using the already-frozen source-gate threshold.

For each, the direct stream and both additive directions are scored. The
permutation null preserves each statistic's exact multiset and corrects for
the four tested key/sign combinations by comparing their maximum score.
No threshold, tile order, phase, or key search is performed. A negative result
rejects this specific pixel-statistic readout, not every possible image key.
"""

from __future__ import annotations

import json
import math
import random
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
TRANSCRIPTION = ROOT / "resources/lp2-transcription.txt"
IMAGE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
WORDLIST = ROOT / "resources/control/english_wordfreq_textblob.txt"
QUADGRAMS = ROOT / "resources/control/duko_round27_english_quadgrams.txt"
THRESHOLD = 180
TRIALS = 10_000
SEED = 0x20261111


def score_quadgrams(text: str, counts: dict[str, int]) -> float:
    if len(text) < 4:
        return float("-inf")
    return sum(math.log10(counts.get(text[i:i+4], 1))
               for i in range(len(text) - 3)) / (len(text) - 3)


def render_words(indices: list[int], lengths: list[int],
                 translit: list[str]) -> tuple[str, list[str]]:
    words = []
    pos = 0
    for n in lengths:
        words.append("".join(translit[i] for i in indices[pos:pos+n]))
        pos += n
    assert pos == len(indices)
    return " ".join(words), words


def score_output(indices: list[int], lengths: list[int], translit: list[str],
                 dictionary: set[str], quadgrams: dict[str, int]) -> dict:
    spaced, words = render_words(indices, lengths, translit)
    joined = "".join(words)
    hits = [w for w in words if w in dictionary]
    return {
        "spaced_output": spaced,
        "expanded_letters": joined,
        "quadgram_log10_mean": score_quadgrams(joined, quadgrams),
        "dictionary_word_hits": len(hits),
        "dictionary_hits": hits,
        "word_count": len(words),
    }


def main() -> None:
    data = json.loads(CORPUS.read_text(encoding="utf-8"))
    page32 = next(p["indices"] for p in data["pages"] if p["page"] == 32)
    assert len(page32) == 121
    primes = data["prime"]
    widths = [primes[i] for i in page32[:11]]
    heights = [primes[page32[11 * r]] for r in range(11)]
    assert widths == [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]
    assert heights == [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]
    assert sum(widths) == 563 and sum(heights) == 569

    image = Image.open(IMAGE).convert("L")
    assert image.size == (563, 569)
    px = image.load()
    x_edges = [0]
    y_edges = [0]
    for w in widths:
        x_edges.append(x_edges[-1] + w)
    for h in heights:
        y_edges.append(y_edges[-1] + h)

    mean_key = []
    bright_key = []
    tile_records = []
    for row in range(11):
        for col in range(11):
            x0, x1 = x_edges[col], x_edges[col + 1]
            y0, y1 = y_edges[row], y_edges[row + 1]
            area = (x1 - x0) * (y1 - y0)
            total = 0
            bright = 0
            for y in range(y0, y1):
                for x in range(x0, x1):
                    value = px[x, y]
                    total += value
                    bright += value >= THRESHOLD
            mean_bin = min(28, (total * 29) // (area * 256))
            bright_fraction = bright / area
            bright_bin = min(28, int(bright_fraction * 29))
            mean_key.append(mean_bin)
            bright_key.append(bright_bin)
            tile_records.append({
                "row": row, "column": col,
                "xyxy": [x0, y0, x1, y1],
                "area": area, "mean_gray": total / area,
                "bright_fraction": bright_fraction,
                "mean_bin": mean_bin, "bright_bin": bright_bin,
                "p32_rune_index": page32[row * 11 + col],
            })

    transcription_pages = TRANSCRIPTION.read_text(encoding="utf-8").strip().split("\n%\n")
    page_text = transcription_pages[32]
    rune_set = set(data["runes"])
    words = [
        "".join(ch for ch in chunk if ch in rune_set)
        for chunk in re.split(r"[-.]", page_text)
    ]
    words = [w for w in words if w]
    lengths = [len(w) for w in words]
    assert len(words) == 22 and sum(lengths) == 121

    dictionary = {
        line.split()[0].strip().upper()
        for line in WORDLIST.read_text(encoding="utf-8").splitlines()
        if line.split()
    }
    quadgrams = {}
    for line in QUADGRAMS.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) == 2:
            quadgrams[parts[0].upper()] = int(parts[1])

    outputs = {}
    observed_scores = []
    for name, key in (("mean_gray", mean_key), ("bright_fraction", bright_key)):
        outputs[name] = {"key": key, "direct": score_output(
            key, lengths, data["translit"], dictionary, quadgrams)}
        for sign, label in ((-1, "cipher_minus_key"), (1, "cipher_plus_key")):
            plain = [(c + sign * k) % 29 for c, k in zip(page32, key)]
            scored = score_output(plain, lengths, data["translit"], dictionary, quadgrams)
            outputs[name][label] = scored
            observed_scores.append((scored["quadgram_log10_mean"], name, label))

    observed_best = max(x[0] for x in observed_scores)
    rng = random.Random(SEED)
    null_ge = 0
    null_max = float("-inf")
    null_sum = 0.0
    for _ in range(TRIALS):
        shuffled_mean = mean_key.copy()
        shuffled_bright = bright_key.copy()
        rng.shuffle(shuffled_mean)
        rng.shuffle(shuffled_bright)
        trial_best = float("-inf")
        for key in (shuffled_mean, shuffled_bright):
            for sign in (-1, 1):
                candidate = [(c + sign * k) % 29 for c, k in zip(page32, key)]
                expanded = "".join(data["translit"][i] for i in candidate)
                trial_best = max(trial_best, score_quadgrams(expanded, quadgrams))
        null_ge += trial_best >= observed_best
        null_max = max(null_max, trial_best)
        null_sum += trial_best

    result = {
        "classification": "source-locked exploratory pixel-statistic key gate",
        "source_image": str(IMAGE.relative_to(ROOT)),
        "p32_grid": "11x11 row-major; top-row/left-column GP primes define 121 tiles",
        "image_size": list(image.size),
        "widths": widths, "heights": heights,
        "p32_word_lengths": lengths,
        "observed_outputs": outputs,
        "best_observed": {
            "quadgram_log10_mean": observed_best,
            "feature_and_direction": [
                {"feature": name, "direction": direction}
                for score, name, direction in observed_scores if score == observed_best
            ],
        },
        "permutation_null": {
            "trials": TRIALS, "seed": hex(SEED),
            "preserves_each_feature_multiset": True,
            "max_score_ge_observed": null_ge,
            "empirical_upper_tail": (null_ge + 1) / (TRIALS + 1),
            "mean_max_score": null_sum / TRIALS,
            "maximum_null_score": null_max,
        },
        "tile_statistics": tile_records,
        "decision": (
            "A plaintext claim requires a recognizable word-level reading and a "
            "clear separation from the multiset-preserving permutation null. "
            "Otherwise reject this fixed mean/bright-fraction readout; do not tune."
        ),
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
