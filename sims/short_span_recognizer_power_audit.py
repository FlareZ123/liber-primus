#!/usr/bin/env python3
"""Quantify why the current short-span recognizer cannot be calibrated on authentic Cicada controls.

This is an audit, not a plaintext scorer. Counts are frozen from the cited source
artifacts and the local LP2 transcription. It reports optimistic non-overlapping
window counts, zero-false-positive confidence bounds, and family-wise multiplicity.
"""
import json
import math

ALPHA_SINGLE = 0.01
FAMILY_SIZES = {
    "p0_affine_fragments": 1816,
    "p0_affine_transforms": 27812,
}
P57_BODY_RUNES = 105
P57_TITLE_RUNES = 7
C2_SOLVED_FILE_LETTERS = 9294
C2_TRAILING_PLAINTEXT_TAIL_LETTERS = 143  # generous: includes the preceding "duty of every pilgrim" line
C2_DEV_SOURCE_COUNT = 3


def zero_fp_upper_95(n: int) -> float:
    """One-sided 95% binomial upper bound after zero false positives in n trials."""
    return 1.0 - 0.05 ** (1.0 / n)


def familywise(alpha: float, m: int) -> dict:
    return {
        "m": m,
        "independent_trials_illustration": 1.0 - (1.0 - alpha) ** m,
        "bonferroni_per_candidate_alpha_for_1pct_FWER": alpha / m,
    }


def main() -> None:
    window_rows = {}
    for length in (6, 8, 10, 12):
        n = P57_BODY_RUNES // length
        window_rows[str(length)] = {
            "body_nonoverlapping_windows": n,
            "overlapping_windows_upper_bound": P57_BODY_RUNES - length + 1,
            "95pct_upper_FPR_if_zero_false_positives": zero_fp_upper_95(n),
        }

    tail_fraction = C2_TRAILING_PLAINTEXT_TAIL_LETTERS / C2_SOLVED_FILE_LETTERS
    output = {
        "classification": "insufficient authentic-control power; do not score original candidates with this calibration",
        "p57": {
            "title_runes": P57_TITLE_RUNES,
            "body_runes": P57_BODY_RUNES,
            "window_counts": window_rows,
        },
        "external_C2_positive_pool_audit": {
            "dev_sources": [
                "solved_plaintext.txt: PGP-signed hex/ciphertext plus a short trailing plaintext tail",
                "self_reliance.txt: Emerson public-domain essay, not Cicada plaintext",
                "thematic.txt: 41-word keyword list, not body prose",
            ],
            "solved_plaintext_file_letters": C2_SOLVED_FILE_LETTERS,
            "generously_counted_trailing_plaintext_letters": C2_TRAILING_PLAINTEXT_TAIL_LETTERS,
            "trailing_tail_fraction_of_file": tail_fraction,
            "estimated_share_of_uniform_three-source_positive_draws": tail_fraction / C2_DEV_SOURCE_COUNT,
            "caveat": "The C2 checker strips non-A-Z and does not parse PGP; hex A-F and signature/header text enter the positive pool.",
        },
        "familywise_at_1pct_single_candidate_FPR": {
            name: familywise(ALPHA_SINGLE, m) for name, m in FAMILY_SIZES.items()
        },
        "interpretation": (
            "The p57 body supplies at most 8-17 non-overlapping windows at lengths 12-6; "
            "even zero false positives cannot bound FPR near 1%. The p0 candidate family "
            "requires a family-maximum null calibration, not a single-window 1% threshold. "
            "The available C2 positive pool is not an authentic solved-Cicada body corpus."
        ),
    }
    print(json.dumps(output, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
