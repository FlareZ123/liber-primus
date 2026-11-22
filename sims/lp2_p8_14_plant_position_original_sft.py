"""Exact original-LP2 p8..p14 plant sprite and orientation test.

Inputs are original 2400x3600 resources/liber-primus/25.jpg through 31.jpg.
Pillow and NumPy required. Read-only and runnable on Windows 11.
"""
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
LEFT = (0, 600, 480, 2950)
RIGHT = (1910, 600, 2400, 2950)


def pixels(image: int, box: tuple[int, int, int, int]) -> np.ndarray:
    with Image.open(ROOT / f"{image:02d}.jpg") as src:
        assert src.size == (2400, 3600), (image, src.size)
        return np.asarray(src.convert("RGB").crop(box))


def root_mask(image: int, box: tuple[int, int, int, int]) -> np.ndarray:
    """Monochrome black mask; anti-aliased margins do not control decisions."""
    return pixels(image, box).mean(axis=2) < 120


def iou(a: np.ndarray, b: np.ndarray) -> float:
    return np.logical_and(a, b).sum() / np.logical_or(a, b).sum()


def main() -> None:
    # Tree-shaped rooted stalk on odd-numbered original image pages is left.
    left_reference = pixels(27, LEFT)
    for image in (29, 31):
        assert np.array_equal(left_reference, pixels(image, LEFT))
        print(f"p{image - 17}: left-side plant pixel-identical to p10")

    # Its right-side counterpart alternates strictly; same image across p9/11/13.
    right_reference = pixels(26, RIGHT)
    for image in (28, 30):
        assert np.array_equal(right_reference, pixels(image, RIGHT))
        print(f"p{image - 17}: right-side plant pixel-identical to p9")

    # The two copies have the SAME horizontal orientation: the whole plant
    # is translated horizontally by 1784 pixels, rather than mirror-reflected.
    y0, y1 = 690, 2870
    x0, x1 = 45, 445
    left = root_mask(27, (x0, y0, x1, y1))
    shifted = root_mask(28, (x0 + 1784, y0, x1 + 1784, y1))
    same_orientation = iou(left, shifted)

    # Search the mirrored-side comparator at all plausible horizontal
    # registrations; ensure the flip does not explain the repeated object.
    right_half = root_mask(28, (1800, y0, 2400, y1))
    mirrored = right_half[:, ::-1]
    best_flipped = max(
        iou(left, mirrored[:, x0 + shift:x1 + shift])
        for shift in range(-45, 101)
    )
    print(f"Same-orientation dark mask IoU: {same_orientation:.9f}")
    print(f"Best mirror orientation IoU (146 shifts): {best_flipped:.9f}")
    assert same_orientation > 0.96
    assert best_flipped < 0.11

    # P8 is at the same left-side location but is NOT pixel-identical
    # to p10, a departure explicitly retained rather than concealed.
    assert not np.array_equal(pixels(25, LEFT), left_reference)
    print("p8 shares the left-side placement, but differs in rendered pixels.")
    print("PASS: L/R/L/R/L/R/L plant placement, exact same-side source reuse;")
    print("      translation instead of mirror reversal across opposite sides.")


if __name__ == "__main__":
    main()
