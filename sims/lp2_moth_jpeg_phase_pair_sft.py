"""Source-image-only LP2 p53/p55 cloned-moth JPEG phase experiment.

Requires Pillow and numpy; read-only; compatible with Windows Python.
Run from the repository root as python sims/lp2_moth_jpeg_phase_pair_sft.py.
"""

from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "resources" / "liber-primus"
PAGE_SHAPE = (3600, 2400)
# Crops are (top, left), and both share a 550-row by 1,270-column artwork region.
LOCATIONS = ((70, (2663, 564)), (72, (2730, 630)))
HEIGHT, WIDTH = 550, 1270


def crop(rgb: np.ndarray, top: int, left: int) -> np.ndarray:
    return rgb[top : top + HEIGHT, left : left + WIDTH]


def encode_region(patch: np.ndarray, top: int, left: int, qtables: dict) -> np.ndarray:
    page = Image.new("RGB", (PAGE_SHAPE[1], PAGE_SHAPE[0]), "white")
    page.paste(Image.fromarray(patch, mode="RGB"), (left, top))
    encoded = BytesIO()
    page.save(encoded, format="JPEG", qtables=qtables, subsampling=2, dpi=(400, 400))
    encoded.seek(0)
    with Image.open(encoded) as round_trip:
        return crop(np.asarray(round_trip.convert("RGB")), top, left).astype(np.float64)


def principal_metrics(a: np.ndarray, b: np.ndarray, synthesized: list[np.ndarray]) -> dict:
    observed = (a - b).mean(axis=2)
    predicted = (synthesized[0] - synthesized[1]).mean(axis=2)
    residual = observed - predicted
    corr = float(np.corrcoef(observed.ravel(), predicted.ravel())[0, 1])
    return {
        "original_mean_absolute_rgb_difference": float(np.abs(observed).mean()),
        "synthetic_mean_absolute_rgb_difference": float(np.abs(predicted).mean()),
        "phase_difference_correlation": corr,
        "phase_explained_squared_correlation": corr * corr,
        "residual_mean_absolute_difference": float(np.abs(residual).mean()),
        "residual_rmse": float(np.mean(residual * residual) ** 0.5),
        "residual_abs_above_3": int(np.count_nonzero(np.abs(residual) > 3)),
        "residual_max_abs": float(np.abs(residual).max()),
    }


def main() -> None:
    images = []
    qtables = []
    for page, (top, left) in LOCATIONS:
        with Image.open(SOURCES / f"{page}.jpg") as image:
            assert image.size == (PAGE_SHAPE[1], PAGE_SHAPE[0])
            qtables.append(image.quantization)
            images.append(crop(np.asarray(image.convert("RGB")), top, left).astype(np.float64))
    assert qtables[0] == qtables[1], "JPEG quantization tables differ"
    common = np.rint((images[0] + images[1]) / 2).astype(np.uint8)
    synthetic = [
        encode_region(common, top, left, qtables[0])
        for _, (top, left) in LOCATIONS
    ]
    m = principal_metrics(images[0], images[1], synthetic)
    print("p53/p55 artwork, actual JPEG phase vs identical-source synthetic:")
    for key, value in m.items():
        print(f"  {key} = {value}")
    assert 0.85 <= m["phase_difference_correlation"] <= 0.90
    assert 0.18 <= m["residual_mean_absolute_difference"] <= 0.23
    assert 0.4 <= m["residual_rmse"] <= 0.7
    # A painted source-only signal of +12 RGB units survives this operation.
    modified = common.copy().astype(np.int16)
    footprint = (slice(100, 140), slice(150, 350))
    modified[footprint] = np.clip(modified[footprint] + 12, 0, 255)
    modified = modified.astype(np.uint8)
    altered_first = encode_region(modified, *LOCATIONS[0][1], qtables[0])
    altered_mean = np.rint((altered_first + synthetic[1]) / 2).astype(np.uint8)
    altered_pair_model = [
        encode_region(altered_mean, top, left, qtables[0])
        for _, (top, left) in LOCATIONS
    ]
    planted = principal_metrics(altered_first, synthetic[1], altered_pair_model)
    print(f"  planted_source_patch_residual_rmse = {planted['residual_rmse']}")
    assert planted["residual_rmse"] > m["residual_rmse"] * 1.5
    print("PASS: phase artifact explains the bulk of the paired moth delta; control recovered")


if __name__ == "__main__":
    main()
