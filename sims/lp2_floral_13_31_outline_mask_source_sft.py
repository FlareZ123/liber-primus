"""Original LP2 floral border's mirrored five-dot binary-mask source test.

Read-only single-file test. Requires Pillow and NumPy.
Uses original JPEG scans 57.jpg..72.jpg, physical LP2 pages p40..p55.
This source test does not assert a cipher or recover plaintext.
"""
from pathlib import Path
import hashlib
import json

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "resources" / "liber-primus"
REF_SHA256 = "3f5af995b39f94f268d4aa94825a10f2429f4a3affa1921a7f627e6d1bfcfb69"

# Fixed, native-size original-image coordinates. Each tier is read left to
# right, tiers top to bottom. The bottom pair is slightly vertically staggered.
LEFT_DOTS = ((396, 1476), (366, 1498), (424, 1498),
             (380, 1540), (420, 1533))
RIGHT_DOTS = tuple((2399 - x, y) for x, y in LEFT_DOTS)
INNER_RADIUS = 8
THRESHOLD = 180


def gray(source: Path) -> np.ndarray:
    """Read original JPEG decoded luminance with no resampling."""
    with Image.open(source) as image:
        image.load()
        assert image.size == (2400, 3600), (source, image.size)
        return np.asarray(image.convert("L"), dtype=np.uint8)


def dot_bits(image: np.ndarray, centers: tuple[tuple[int, int], ...]) -> tuple[int, ...]:
    """Classify only original dot cores, independent of nearby branch strokes."""
    counts = []
    for x, y in centers:
        patch = image[y - INNER_RADIUS:y + INNER_RADIUS + 1,
                      x - INNER_RADIUS:x + INNER_RADIUS + 1]
        assert patch.shape == (17, 17)
        counts.append(int(np.count_nonzero(patch < THRESHOLD)))
    assert all(count <= 2 or count >= 280 for count in counts), counts
    return tuple(int(count >= 280) for count in counts)


def bits_integer(bits: tuple[int, ...]) -> int:
    out = 0
    for bit in bits:
        out = (out << 1) | bit
    return out


def main() -> None:
    reference_path = ROOT / "57.jpg"
    assert hashlib.sha256(reference_path.read_bytes()).hexdigest() == REF_SHA256
    reference = gray(reference_path)
    left = dot_bits(reference, LEFT_DOTS)
    right = dot_bits(reference, RIGHT_DOTS)
    assert left == (0, 1, 1, 0, 1), left
    assert right == (1, 1, 1, 1, 1), right
    assert (bits_integer(left), bits_integer(right)) == (13, 31)

    # A synthetic two-dot fill must be detected as a changed codeword.
    plant = reference.copy()
    for x, y in (LEFT_DOTS[0], LEFT_DOTS[3]):
        plant[y - INNER_RADIUS:y + INNER_RADIUS + 1,
              x - INNER_RADIUS:x + INNER_RADIUS + 1] = 0
    assert dot_bits(plant, LEFT_DOTS) == (1, 1, 1, 1, 1)
    assert dot_bits(reference, LEFT_DOTS) == left

    # Compare unchanged original source regions with their mirror using exact
    # decoded source pixels; there is no registration, fit, interpolation or OCR.
    left_border = reference[500:3100, 20:600] < 120
    right_mirrored = reference[500:3100, 1800:2380][:, ::-1] < 120
    disagreement = int(np.count_nonzero(left_border != right_mirrored))
    assert disagreement == 2262, disagreement

    # The binary masks are a static source clue shared across every one of
    # the 16 floral pages, and cannot act as a different key on each page.
    left_window = reference[1430:1570, 340:450]
    right_window = reference[1430:1570, 1950:2060]
    for scan in range(57, 73):
        current = gray(ROOT / f"{scan:02}.jpg")
        assert np.array_equal(current[1430:1570, 340:450], left_window)
        assert np.array_equal(current[1430:1570, 1950:2060], right_window)
        assert dot_bits(current, LEFT_DOTS) == left
        assert dot_bits(current, RIGHT_DOTS) == right

    ink = json.loads((ROOT / "lp2-ink-annotations.json").read_text(encoding="utf-8"))
    grid = json.loads((ROOT / "lp2-grid-256.json").read_text(encoding="utf-8"))
    assert ink["counts"]["red13"] == 30
    assert ink["counts"]["black13"] == 1
    assert ink["counts"]["red"] == 225
    assert len(grid["bytes"]) == 256
    assert sum(page["rows"] for page in grid["pages"]) == 32
    assert 225 + 30 + 1 == 256

    print(json.dumps({
        "original_source": "resources/liber-primus/57.jpg..72.jpg",
        "original_57_sha256": REF_SHA256,
        "left_five_bits": "".join(map(str, left)),
        "right_five_bits": "".join(map(str, right)),
        "mask_values_base2": [bits_integer(left), bits_integer(right)],
        "mirrored_dark_pixel_disagreements_at_120": disagreement,
        "repeated_identically_across_flower_pages": 16,
        "thirteen_dot_markers": 31,
        "thirteen_dot_markers_by_color": [30, 1],
        "printed_numeric_table_rows": 32,
        "printed_numeric_table_bytes": 256,
        "red_runes_plus_thirteen_dot_markers": 256,
        "synthetic_fill_control": "PASS",
        "status": "Original-image binary motif, conditional link to marks/grid; no plaintext or key"
    }, indent=2))


if __name__ == "__main__":
    main()
