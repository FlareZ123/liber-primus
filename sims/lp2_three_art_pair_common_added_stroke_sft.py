"""Three original matched LP artwork pairs: common high-contrast added-stroke test.

This bounded source-art test uses fixed, previously published pair registrations.
It neither reads ciphertext nor claims that faint symbols and file steganography
are impossible. Run on the six unmodified repository JPEGs.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from scipy.ndimage import binary_fill_holes

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    5: "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7",
    41: "62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80",
    49: "c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72",
    70: "4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548",
    72: "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
    74: "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b",
}

def image(number: int) -> np.ndarray:
    file = ROOT / "resources" / "liber-primus" / f"{number:02}.jpg"
    binary = file.read_bytes()
    assert hashlib.sha256(binary).hexdigest() == FILES[number], file
    result = cv2.imdecode(np.frombuffer(binary, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert result is not None and result.shape == (3600, 2400)
    return result

p05, p41, p49, p70, p72, p74 = [image(n) for n in FILES]

# Moth, physical p53 to p55: unchanged source emblem translated (+66, +67).
moth_source = 255 - cv2.resize(p70[2740:3150, 600:1710], (360, 360))
moth_target = 255 - cv2.resize(p72[2807:3217, 666:1776], (360, 360))
original_delta = np.abs(
    p70[2740:3150,600:1710].astype(np.int16) -
    p72[2807:3217,666:1776].astype(np.int16)
)
assert int(original_delta.max()) == 10

# Mayfly, p24 to clear p57: published source-only affine from the dotted figure.
xx, yy = np.meshgrid(np.arange(600, 1900), np.arange(1900, 3250))
cc = (xx - 658) / (25 / 6)
rr = (yy - 1979) / (25 / 6)
map_x = (-23.476689 + 2.518272 * cc + 0.007736 * rr).astype(np.float32)
map_y = (1157.988073 + 2.399729 * rr).astype(np.float32)
mayfly_reg = cv2.remap(
    p41, map_x, map_y, cv2.INTER_LINEAR,
    borderMode=cv2.BORDER_CONSTANT, borderValue=255
)
mayfly_source = 255 - cv2.resize(mayfly_reg, (360, 360))
mayfly_target = 255 - cv2.resize(p74[1900:3250, 600:1900], (360, 360))

# Tree, p55 to blurred p32: independently trunk-registered source silhouette.
tree_outline = cv2.resize(p72[1430:2510, 625:1735], (360, 360))
tree_fill = binary_fill_holes((255 - tree_outline) > 15).astype(np.uint8) * 255
matrix = cv2.getRotationMatrix2D((180, 180), 0, 0.9)
matrix[0, 2] -= 12
matrix[1, 2] += 1
tree_warp = cv2.warpAffine(tree_fill, matrix, (360, 360), borderValue=0)
tree_source = cv2.GaussianBlur(tree_warp, (0, 0), 9)
tree_target = 255 - cv2.resize(p49[2070:3230, 650:1810], (360, 360))

# One universal detector: high contrast ink, >8 normalized pixels beyond
# source stroke, contiguous candidate area >=20. No rune score is consulted.
def measure(source: np.ndarray, target: np.ndarray) -> tuple[dict, np.ndarray]:
    assert source.shape == target.shape == (360, 360)
    source_ink, target_ink = source > 100, target > 100
    distance = cv2.distanceTransform(
        (~source_ink).astype(np.uint8), cv2.DIST_L2, 3
    )
    extra = target_ink & (distance > 8)
    count, _, stats, _ = cv2.connectedComponentsWithStats(extra.astype(np.uint8))
    areas = stats[1:, 4].tolist()
    return {
        "source_ink": int(source_ink.sum()),
        "target_ink": int(target_ink.sum()),
        "distant_pixels": int(extra.sum()),
        "components": count - 1,
        "components_at_least20": sum(v >= 20 for v in areas),
        "largest_component": max(areas, default=0),
    }, distance

cases = {
    "moth_p53_p55": (moth_source, moth_target),
    "mayfly_p24_p57": (mayfly_source, mayfly_target),
    "tree_p55_p32": (tree_source, tree_target),
}
output = {}
for name, (source, target) in cases.items():
    original, distance = measure(source, target)
    assert original["components_at_least20"] == 0, (name, original)
    # Real source-only positive: four 12px stamps placed where the SOURCE
    # reference is most blank within four fixed quadrants. Never examine
    # target pixels or decoded text when selecting planted coordinates.
    planted = target.copy()
    marks = []
    for y0, y1, x0, x1 in (
        (20, 155, 20, 155), (20, 155, 205, 340),
        (205, 340, 20, 155), (205, 340, 205, 340)
    ):
        admissible = distance[y0:y1 - 12, x0:x1 - 12]
        dy, dx = np.unravel_index(np.argmax(admissible), admissible.shape)
        y, x = int(y0 + dy), int(x0 + dx)
        assert float(distance[y, x]) > 20
        planted[y:y + 12, x:x + 12] = 255
        marks.append([x, y])
    positive, _ = measure(source, planted)
    assert positive["components_at_least20"] >= 4, (name, positive)
    assert positive["distant_pixels"] >= original["distant_pixels"] + 280
    output[name] = {
        "original": original, "positive": positive,
        "plant_xy_selected_from_source_only": marks
    }

# Two deliberately incorrect source artworks should trigger large residuals.
wrong_moth, _ = measure(mayfly_source, moth_target)
wrong_tree, _ = measure(mayfly_source, tree_target)
assert wrong_moth["components_at_least20"] >= 10
assert wrong_tree["components_at_least20"] >= 1
output["wrong_reference"] = {
    "moth_using_mayfly": wrong_moth,
    "tree_using_mayfly": wrong_tree,
}
output["decision"] = (
    "No shared large (>8px from source), high-contrast (>100), "
    "20+ connected-pixel additions across these three source-matched artworks."
)
print(json.dumps(output, indent=2))
