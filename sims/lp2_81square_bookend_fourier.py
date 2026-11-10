#!/usr/bin/env python3
"""Two geometric blocks implied by the authentic six-rune LP2 word-pair echo.

The first copy of DJU BEI ends at global position 6561=3**8=81**2;
the second copy ends at 12956, leaving 6395=80**2-5 runes.
The alignment is an exploratory source observation, not a cipher key.

Test all unknown separable additive row/column keys by the EXACT Fourier
singular-value invariant, on the 81x81 first block and the prospective
80x80 second block with five unspecified trailing symbols. Both literal GP29
and hypothetical zero-step-EA GP28 predecessor ranks are tested. Any unknown
row+column pads are eliminated algebraically, not fitted to source ciphertext.

Genuine independent Shakespeare/Gibran GP plaintext-window controls and
hidden-source-key plants are tested. Histogram-preserving original shuffles
measure source-inventory-conditional spatial exceptionalism. No original
plaintext is claimed unless new independently fixed key evidence appears.

Python 3.11+, NumPy, original checked-in LP2 corpus and source prose.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

os.environ["OPENBLAS_NUM_THREADS"] = "1"
import numpy as np
from lp2_rowcol_fourier_inverse import gp_word

ROOT = Path(__file__).resolve().parents[1]
N1 = 81 ** 2
N2 = 80 ** 2 - 5
N = N1 + N2
SEED = 0x81C3301
RUNES_PER_AUTHOR = 200
SHUFFLES = 250


def gp(text: str) -> np.ndarray:
    output = []
    for word in re.findall(r"[A-Z]+", text.upper()):
        output.extend(gp_word(word))
    return np.asarray(output, dtype=np.int16)


def original() -> tuple[np.ndarray, set[int]]:
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json")
                        .read_text(encoding="utf-8"))
    stream = []
    starts: set[int] = set()
    sizes = []
    for page in corpus["pages"]:
        if page["page"] > 55:
            continue
        if page["indices"]:
            starts.add(len(stream))
        stream.extend(page["indices"])
        if page["page"] in (0, 1, 2):
            sizes.append(len(page["indices"]))
    ciphertext = np.asarray(stream, dtype=np.int16)
    assert len(ciphertext) == N == 12956
    assert sizes == [262, 266, 201]
    assert sum(sizes) == 729 == 3**6 == 9 * 81
    assert N1 == 6561 == 3**8 == 81**2
    assert N2 == 6395 == 80**2 - 5
    assert ciphertext[N1-6:N1].tolist() == [23, 11, 1, 17, 18, 10]
    assert np.array_equal(ciphertext[N1-6:N1], ciphertext[-6:])
    return ciphertext, starts


def block_ranks(full: np.ndarray, page_starts: set[int],
                start: int, count: int, width: int,
                predecessor28: bool) -> tuple[np.ndarray, np.ndarray]:
    """Unknown positions and EA/IV marker outputs are zero-masked."""
    total = width * width
    runes = np.zeros(total, dtype=np.int16)
    mask = np.zeros(total, dtype=bool)
    assert count <= total
    for local in range(count):
        idx = start + local
        if not predecessor28:
            runes[local] = full[idx]
            mask[local] = True
        elif idx == start or idx in page_starts or full[idx] == full[idx-1]:
            continue  # source-stated IV or hypothetical repeat/EA zero-step
        else:
            runes[local] = (int(full[idx]) - int(full[idx-1]) - 1) % 29
            mask[local] = True
    return runes.reshape(width, width), mask.reshape(width, width)


def source_selected_harmonic(native: np.ndarray, modulus: int) -> tuple[int, list[float]]:
    frequency = np.bincount(native, minlength=modulus).astype(float)
    frequency /= frequency.sum()
    roots = np.exp(2j * np.pi * np.arange(modulus) / modulus)
    amplitudes = [float(abs(np.dot(frequency, roots**k)))
                  for k in range(1, modulus // 2 + 1)]
    return int(np.argmax(amplitudes)) + 1, amplitudes


def spectral(matrix: np.ndarray, mask: np.ndarray, modulus: int, k: int) -> float:
    phase = np.exp(2j * np.pi * k * matrix / modulus)
    phase[~mask] = 0
    return float(np.linalg.svd(phase, compute_uv=False)[0])


def native_masked(source: np.ndarray, offset: int, mask: np.ndarray) -> np.ndarray:
    n = int(mask.sum())
    output = np.zeros(mask.shape, dtype=np.int16)
    output[mask] = source[offset:offset+n]
    return output


def fit_block(name: str, full: np.ndarray, starts: set[int], sources: dict,
              rng: np.random.Generator, start: int, n: int, width: int,
              predecessor28: bool) -> dict:
    modulus = 28 if predecessor28 else 29
    matrix, mask = block_ranks(full, starts, start, n, width, predecessor28)
    count = int(mask.sum())
    controls = {a: (seq if modulus == 29 else seq[seq != 28])
                for a,seq in sources.items()}
    harmonic, amps = source_selected_harmonic(controls["Shakespeare"], modulus)
    observed = spectral(matrix, mask, modulus, harmonic)
    shuffled = []
    for _ in range(SHUFFLES):
        shuffled_matrix = matrix.copy()
        shuffled_matrix[mask] = rng.permutation(matrix[mask])
        shuffled.append(spectral(shuffled_matrix, mask, modulus, harmonic))
    shuffled = np.asarray(shuffled)
    source_windows = {}
    for author, source in controls.items():
        scores = []
        for _ in range(RUNES_PER_AUTHOR):
            offset = int(rng.integers(0, len(source) - count + 1))
            source_m = native_masked(source, offset, mask)
            scores.append(spectral(source_m, mask, modulus, harmonic))
        source_windows[author] = {
            "windows": RUNES_PER_AUTHOR,
            "min": float(np.min(scores)),
            "mean": float(np.mean(scores)),
            "max": float(np.max(scores)),
            "at_or_below_original": int(np.count_nonzero(
                np.asarray(scores) <= observed)),
        }
    # Positive plant under fully unknown row and column keys; exact invariance
    # is proved numerically against the independently sourced native GP register.
    plant_source = controls["Gibran"]
    plant = native_masked(plant_source, 4000, mask)
    u = rng.integers(0, modulus, size=(width, 1), dtype=np.int16)
    v = rng.integers(0, modulus, size=(1, width), dtype=np.int16)
    encoded = (plant + u + v) % modulus
    encoded[~mask] = 0
    decoded = (encoded - u - v) % modulus
    decoded[~mask] = 0
    assert np.array_equal(plant, decoded)
    sv_base = spectral(plant, mask, modulus, harmonic)
    sv_encoded = spectral(encoded, mask, modulus, harmonic)
    assert abs(sv_base - sv_encoded) <= 1e-8
    if predecessor28:
        # Recover all published nonzero cipher steps from conditional plaintext
        # for arbitrary selected u,v, with page- and block-initial IVs fixed.
        inverse = (matrix - u - v) % modulus
        inverse[~mask] = 0
        reencryption = (inverse + u + v) % modulus
        assert np.array_equal(reencryption[mask], matrix[mask])
    else:
        inverse = (matrix - u - v) % modulus
        assert np.array_equal((inverse + u + v) % modulus, matrix[mask] if False else matrix)

    return {
        "block": name, "physical_width": width, "original_rune_start": start,
        "source_rune_cells": n, "masked_unknown_or_marker_cells": width*width-count,
        "valid_fourier_cells": count, "modulus": modulus,
        "model": "GP28 predecessor nonzero rank" if predecessor28 else "direct GP29",
        "frozen_independent_source_harmonic": harmonic,
        "native_GP_Fourier_harmonic_amplitude": amps[harmonic-1],
        "original_top_singular": observed,
        "original_histogram_shuffles": {
            "count": SHUFFLES, "median": float(np.median(shuffled)),
            "p95": float(np.quantile(shuffled, 0.95)),
            "at_least_original": int(np.count_nonzero(shuffled >= observed)),
        },
        "independent_native_GP": source_windows,
        "positive_hidden_key_plant": {
            "runes_exactly_recovered": count,
            "singular_value_original": sv_base,
            "singular_value_encrypted": sv_encoded,
            "algebraically_exact_reencryption": True,
        },
        "unspecified_final_five_completion_bound": (
            float(np.sqrt(width*width-n)) if (width*width-n)==5 else None),
    }


def main():
    original_stream, page_starts = original()
    sources = {
        "Shakespeare": gp((ROOT/"resources/control/shakespeare_first300k.txt")
                          .read_text(encoding="utf-8")),
        "Gibran": gp((ROOT/"resources/control/gibran_prophet_58585.txt")
                     .read_text(encoding="utf-8")),
    }
    assert len(sources["Shakespeare"]) > 180000
    assert len(sources["Gibran"]) > 60000
    rng = np.random.default_rng(SEED)
    results = []
    for name, start, n, width in (
            ("81-square", 0, N1, 81),
            ("80-square-five-terminal-unknown", N1, N2, 80)):
        for predecessor28 in (False, True):
            results.append(fit_block(name, original_stream, page_starts,
                                     sources, rng, start, n, width, predecessor28))
    return {
        "status": "Original conditional square-matrix keyfree test; no plaintext presumed",
        "exact_source_rune_geometry": {
            "first_three_pages": [262,266,201],
            "first_three_page_count": 729,
            "first_bookend_end": N1,
            "second_bookend_end": N,
            "duplicated_original_runes": original_stream[N1-6:N1].tolist(),
            "first_block_width": 81, "first_block_square": N1,
            "second_block_width": 80, "second_block_runic_count": N2,
            "missing_terminal_cells": 5,
            "numerical_alignment_selected_after_original_echo": True,
        },
        "key_independent_theorem":
            "Masked Fourier matrix of a mod-m separable row+column additive "
            "cipher changes only by unit-modulus diagonal left/right factors; "
            "all its singular values are exactly invariant for arbitrary "
            "secret row/column pads.",
        "source_harmonic_train": "Shakespeare GP empirical unigram only",
        "seed": SEED,
        "results": results,
        "limitations":
            "Two prospective square-matrix geometric interpretations are "
            "postselected from the genuine six-rune ciphertext repeat; "
            "models require direct GP prose or hypothetical 28-rank GP "
            "without a nonlinear/secret transposition layer. A missing "
            "five-cell suffix is a declared completion, not an observed "
            "hidden glyph. Positive keys are synthetic only.",
    }


if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
