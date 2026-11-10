#!/usr/bin/env python3
"""Original-source GIMP field inverse at every strictly registered LP2 glyph.

The 2014 source JPEGs and published LP2 runic-line transcription provide all
positions. The historical GIMP 2.8 Dissolve field uses seed 314159265, derived
from the original terminal illustration, and its row-wise GLib MT draws.
Model families and source-coordinate rules are predeclared; no original rune
is used to choose a shift, key, or cipher parameter.

Compare direct GP29 additive and reversible GP28 predecessor-exclusion forms.
Original outputs remain hypothetical; a synthetic exact roundtrip validates
only the implementation. No OCR, image writes, or ciphertext fitting.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
G = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
INDEX = {x: i for i, x in enumerate(G)}
TR = ["F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I",
      "J", "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG",
      "OE", "D", "A", "AE", "Y", "IA", "EA"]
TOKEN = sorted(((token, i) for i, token in enumerate(TR)),
               key=lambda x: -len(x[0]))
IMAGE_DIR = ROOT / "resources" / "liber-primus"
TRANSCRIPT = ROOT / "resources" / "lp2-transcription.txt"


def source_gp(text: str) -> np.ndarray:
    value = text.upper().replace("QU", "CW").replace("V", "U")
    value = value.replace("K", "C").replace("Z", "S").replace("ING", "NG")
    out = []
    for word in re.findall("[A-Z]+", value):
        i = 0
        while i < len(word):
            for token, idx in TOKEN:
                if word.startswith(token, i):
                    out.append(idx)
                    i += len(token)
                    break
            else:
                i += 1
    return np.asarray(out, dtype=np.int16)


def source_lines() -> list[tuple[int, list[str]]]:
    records = TRANSCRIPT.read_text(encoding="utf-8").split("%")[:55]
    assert len(records) == 55
    return [
        (ordinal + (ordinal >= 50),
         [part.strip() for part in record.split("/")
          if any(char in INDEX for char in part)])
        for ordinal, record in enumerate(records)
    ]


def image_position_registration(page: int, lines: list[str]):
    path = IMAGE_DIR / f"{page + 17:02d}.jpg"
    with Image.open(path) as image:
        gray = np.asarray(image.convert("L"))
    assert gray.shape == (3600, 2400)
    projection = (gray[:, 790:1770] < 160).sum(axis=1)
    peaks, _ = find_peaks(gaussian_filter1d(projection.astype(float), sigma=7),
                          prominence=125, distance=137)
    centers = [int(y) for y in peaks if 450 < y < 3150]
    if len(centers) != len(lines):
        return None, f"line_count:{len(centers)}_expected_{len(lines)}"

    records = []
    for line_number, (text, y) in enumerate(zip(lines, centers)):
        expected = [INDEX[char] for char in text if char in INDEX]
        black = gray[y - 60:y + 65, 530:1880] < 110
        columns = np.flatnonzero(black.sum(axis=0) >= 2)
        if not columns.size:
            return None, f"line_{line_number}:zero_ink"
        runs = np.split(columns, np.flatnonzero(np.diff(columns) > 1) + 1)
        glyphs = []
        for run in runs:
            if not run.size:
                continue
            left, right = int(run[0]), int(run[-1]) + 1
            ink = black[:, left:right]
            occupied = np.flatnonzero(ink.sum(axis=1) > 0)
            if (int(ink.sum()) >= 100 and len(occupied) > 70
                    and 595 <= left + 530 <= 1800):
                # Both y choices are geometric and independent of ciphertext.
                glyphs.append((left + 530,
                               y - 60 + (int(occupied[0]) +
                                         int(occupied[-1])) // 2,
                               y))
        if len(glyphs) != len(expected):
            return None, f"line_{line_number}:glyphs_{len(glyphs)}_expected_{len(expected)}"
        records.extend((symbol, *coord) for symbol, coord in zip(expected, glyphs))
    return records, None


def historic_gimp_field() -> np.ndarray:
    # Historical GLib GIMP 2.8 frame: each of the 4096 rows is separately
    # seeded from MT19937(seed=314159265), with a modulo-255 pixel draw.
    root = np.random.RandomState(314159265)
    seeds = root.randint(0, 2**32, size=4096, dtype=np.uint32)
    assert seeds[:3].tolist() == [3721122731, 618219707, 807213306]
    field = np.empty((4096, 1850), dtype=np.uint8)
    for y, seed in enumerate(seeds):
        generator = np.random.RandomState(int(seed))
        values = generator.randint(0, 2**32, size=1850, dtype=np.uint32)
        assert not np.any(values == 0xFFFFFFFF)
        field[y, :] = values % 255
    for y, x, expected in [(706, 601, 196), (913, 601, 232),
                            (1810, 600, 138), (2772, 605, 235)]:
        assert int(field[y, x]) == expected
    return field


def decrypt(cipher: np.ndarray, key: np.ndarray, sign: int, family: str):
    if family == "direct29":
        return (cipher - sign * key) % 29
    plain = np.empty_like(cipher)
    plain[0] = (cipher[0] - sign * (int(key[0]) % 29)) % 29
    for j in range(1, len(cipher)):
        if cipher[j] == cipher[j - 1]:
            plain[j] = 28
        else:
            rank = (int(cipher[j]) - int(cipher[j - 1]) - 1) % 29
            plain[j] = (rank - sign * (int(key[j]) % 28)) % 28
    return plain


def encrypt(plain: np.ndarray, key: np.ndarray, sign: int, family: str):
    if family == "direct29":
        return (plain + sign * key) % 29
    cipher = np.empty_like(plain)
    cipher[0] = (int(plain[0]) + sign * (int(key[0]) % 29)) % 29
    for j in range(1, len(plain)):
        if plain[j] == 28:
            cipher[j] = cipher[j - 1]
        else:
            cipher[j] = (int(cipher[j - 1]) + 1 +
                         (int(plain[j]) + sign * (int(key[j]) % 28)) % 28) % 29
    return cipher


def stats(seq: np.ndarray, log_prior: np.ndarray):
    n = len(seq)
    count = np.bincount(seq, minlength=29).astype(np.float64)
    return {
        "n": n,
        "ioc": float(np.dot(count, count - 1) / (n * (n - 1))),
        "mean_logGP": float(log_prior[seq].mean()),
        "gp_E_frequency": float(count[18] / n),
        "preview_translit": "".join(TR[int(x)] for x in seq[:45]),
    }


def main():
    corpus = json.loads((IMAGE_DIR / "lp2-corpus.json").read_text(encoding="utf-8"))
    by_page = {x["page"]: x["indices"] for x in corpus["pages"]}
    admitted, omitted = {}, {}
    for page, lines in source_lines():
        samples, problem = image_position_registration(page, lines)
        if problem:
            omitted[page] = problem
            continue
        text_runes = [INDEX[c] for line in lines for c in line if c in INDEX]
        if text_runes != by_page[page]:
            omitted[page] = "original_transcript_does_not_equal_canonical_corpus"
            continue
        admitted[page] = np.asarray(samples, dtype=np.int16)

    assert admitted and sum(len(p) for p in admitted.values()) >= 6000
    field = historic_gimp_field()
    shakespeare = source_gp(
        (ROOT / "resources/control/shakespeare_first300k.txt").read_text(
            encoding="utf-8"))
    gibran = source_gp(
        (ROOT / "resources/control/gibran_prophet_58585.txt").read_text(
            encoding="utf-8"))
    assert len(shakespeare) > 100000 and len(gibran) > 30000
    counts = np.bincount(shakespeare, minlength=29).astype(float) + 1
    prior = np.log(counts / counts.sum())
    results = []
    plant_total = 0
    for family in ("direct29", "predecessor28"):
        for anchor in ("ink_center_y", "printed_peak_y"):
            for projection in ("modulo", "scaled"):
                for sign in (-1, 1):
                    decoded, plants, all_ages = [[], []], [], []
                    for page, rows in admitted.items():
                        cipher = rows[:, 0]
                        xs = rows[:, 1]
                        ys = rows[:, 2] if anchor == "ink_center_y" else rows[:, 3]
                        values = field[ys, xs].astype(np.int16)
                        width = 29 if family == "direct29" else 28
                        key = (values % width if projection == "modulo"
                               else width * values // 255)
                        original = decrypt(cipher, key, sign, family)
                        assert np.array_equal(
                            encrypt(original, key, sign, family), cipher)
                        decoded[int(page >= 28)].append(original)

                        # Unknown-source plant keyed to exactly the same
                        # immutable original-JPEG coordinates, no original fit.
                        section = int(page >= 28)
                        index = len(plants)
                        source_start = (1500 if section == 0 else 17000) + index * 300
                        known = gibran[source_start:source_start + len(cipher)]
                        assert len(known) == len(cipher)
                        synthetic = encrypt(known, key, sign, family)
                        recovered = decrypt(synthetic, key, sign, family)
                        assert np.array_equal(recovered, known)
                        assert np.array_equal(
                            encrypt(recovered, key, sign, family), synthetic)
                        plant_total += len(known)
                    early, late = [stats(np.concatenate(group), prior)
                                   for group in decoded]
                    results.append({
                        "family": family, "anchor": anchor,
                        "projection": projection, "sign": sign,
                        "early": early, "heldout_late": late,
                        "synthetic_plant_exact_recovery": True,
                    })
    results.sort(key=lambda x: x["early"]["mean_logGP"], reverse=True)
    return {
        "status": "Original source-fixed hypotheses, not authenticated decryptions",
        "source_GIMP_seed": 314159265,
        "source_field": "GLib GIMP 2.8 row-seeded MT19937 uint32 modulo255",
        "source_JPEG_coordinates": "printed glyph first dark column and ink-midpoint or line peak",
        "excluded": omitted,
        "accepted_original_physical_pages": sorted(admitted),
        "accepted_original_runes": sum(len(p) for p in admitted.values()),
        "model_count": len(results),
        "positive_plant_total_exact_runes_across_variants": plant_total,
        "gp_source_Gibran": stats(gibran[:12000], prior),
        "reference_unigram_logGP": float(np.sum(
            (counts / counts.sum()) * prior)),
        "uniform_unigram_logGP": float(prior.mean()),
        "sorted_by_discovery_half_training_score": results,
        "qualification": "Image coordinates are cipher-output dependent and supplied as fixed side-state; the synthetic plant does not re-typeset its output. Original plaintext is not authenticated by a synthetic roundtrip.",
    }


if __name__ == "__main__":
    print(json.dumps(main(), ensure_ascii=False, indent=2))
