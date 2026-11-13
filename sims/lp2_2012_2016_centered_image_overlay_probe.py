"""Source-fixed 2012→2016 rotated-image inset check.

The 2012 source is 509x503; its quarter-turn is 503x509.
The 2016 source is 563x569, admitting exactly 30 pixels of margin
on every side. Evaluate both quarter-turn directions at this frozen
center position; cyclic shifts supply matched, spatially correlated
background comparisons. Prints numerical evidence only.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_2012 = ROOT / "resources/historical/cicada2012-first-image.jpg"
SOURCE_2016 = ROOT / "resources/historical/cicada2016-4gq25.jpg"


def match(source: np.ndarray, dest: np.ndarray) -> dict[str, float | int]:
    """Score source/destination darkness alignment against every cyclic shift."""
    a = source.astype(np.float64)
    b = dest.astype(np.float64)
    assert a.shape == b.shape == (509, 503)
    a -= a.mean()
    b -= b.mean()
    scale = np.sqrt(np.sum(a * a) * np.sum(b * b))
    assert scale > 0
    scores = np.fft.ifft2(
        np.fft.fft2(a) * np.conjugate(np.fft.fft2(b))
    ).real / scale
    observed = float(scores[0, 0])
    rank = int(np.count_nonzero(scores >= observed - 1.0e-10))
    return {
        "center_correlation": round(observed, 8),
        "shift_null_mean": round(float(scores.mean()), 8),
        "shift_null_sd": round(float(scores.std()), 8),
        "shift_null_max": round(float(scores.max()), 8),
        "center_rank_of_256027": rank,
        "cyclic_upper_fraction": round(rank / scores.size, 8),
    }


def main() -> None:
    with Image.open(SOURCE_2012) as image:
        assert image.size == (509, 503), image.size
        original = np.asarray(image.convert("L"))
    with Image.open(SOURCE_2016) as image:
        assert image.size == (563, 569), image.size
        later = np.asarray(image.convert("L"))
    inset = later[30:539, 30:533]
    assert inset.shape == (509, 503), inset.shape

    result: dict[str, object] = {
        "source_sizes_xy": {"2012": [509, 503], "2016": [563, 569]},
        "fixed_center_margins": [30, 30, 30, 30],
        "source_shape_after_rotation_yx": [509, 503],
        "tests": [],
    }
    tests: list[dict[str, object]] = []
    for quarter_turn in (1, 3):
        turned = np.rot90(original, k=quarter_turn)
        for threshold in (None, 224, 192, 160, 96):
            a = 255 - turned if threshold is None else (turned < threshold).astype(np.float64)
            b = 255 - inset if threshold is None else (inset < threshold).astype(np.float64)
            metrics = match(a, b)
            # Plant a deliberately visible aligned overlay while preserving
            # the real later picture as an unrelated background.
            planted = np.maximum(a, b)
            plant = match(a, planted)
            assert plant["center_correlation"] >= metrics["center_correlation"] - 1e-8
            tests.append({
                "quarter_turn_counterclockwise": quarter_turn,
                "channel": "grayscale_darkness" if threshold is None else f"ink_below_{threshold}",
                "original": metrics,
                "aligned_overlay_positive_control": {
                    "center_correlation": plant["center_correlation"],
                    "cyclic_upper_fraction": plant["cyclic_upper_fraction"],
                },
            })
    result["tests"] = tests
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
