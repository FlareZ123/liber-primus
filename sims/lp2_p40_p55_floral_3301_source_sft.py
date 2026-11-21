"""
Original-JPEG selected floral-border span and exactly 3301 intra-page
GP29 transitions. Read-only Windows Python 3.12/Pillow 11.3 SFT.

Reproduction:
    manually dispatch .github/workflows/manual-readonly-python-image-sft.yml
    with script sims/lp2_p40_p55_floral_3301_source_sft.py
"""
from collections import Counter
from hashlib import sha256
from pathlib import Path
import json

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
JPEG_ROOT = ROOT / "resources" / "liber-primus"
CORPUS = json.loads((JPEG_ROOT / "lp2-corpus.json").read_text(encoding="utf8"))
assert len(CORPUS["pages"]) == 58
assert sum(len(x["indices"]) for x in CORPUS["pages"][:56]) == 12956
SUMS = dict(
    reversed(line.strip().split(maxsplit=1))
    for line in (JPEG_ROOT / "SHA256SUMS.txt").read_text(encoding="utf8").splitlines()
    if line.strip()
)


def image_and_margin(page: int) -> tuple[str, str]:
    """Return source image and exact 500px left/right raster-band SHA-256."""
    filename = f"{page + 17:02d}.jpg"
    raw = (JPEG_ROOT / filename).read_bytes()
    full_digest = sha256(raw).hexdigest()
    assert full_digest == SUMS[filename], (page, filename, "source hash changed")
    with Image.open(JPEG_ROOT / filename) as im:
        pixels = np.asarray(im.convert("RGB"))
    assert pixels.shape == (3600, 2400, 3)
    margin_bytes = pixels[:, :500].tobytes() + pixels[:, -500:].tobytes()
    return full_digest, sha256(margin_bytes).hexdigest()


for p in [39, *range(40, 56), 56]:
    original_digest, margin_digest = image_and_margin(p)
    print(f"p{p:02d} image SHA256={original_digest[:16]} margins={margin_digest[:16]}")
    if p == 39:
        outside = margin_digest
    elif p == 40:
        floral = margin_digest
        assert floral != outside
    elif p < 56:
        assert margin_digest == floral
    else:
        assert margin_digest == outside

assert floral.startswith("5410d35d06217c9d")
assert outside.startswith("b261bd33f7c6e089")

unknown = [p for p in CORPUS["pages"] if p["page"] <= 55]
border = [p for p in unknown if 40 <= p["page"] <= 55]
assert len(border) == 16
assert len(border[10]["indices"]) == 0  # p50 numerical grid only.
rune_pages = [p for p in border if p["indices"]]
assert len(rune_pages) == 15
runes = sum(len(p["indices"]) for p in rune_pages)
steps = sum(len(p["indices"]) - 1 for p in rune_pages)
assert runes == 3316
assert steps == 3301

matches = []
all_window_count = 0
for i in range(len(unknown)):
    for j in range(i, len(unknown)):
        all_window_count += 1
        contained = [p for p in unknown[i:j + 1] if p["indices"]]
        n = sum(len(p["indices"]) - 1 for p in contained)
        if n == 3301:
            matches.append((i, j))
assert all_window_count == 1596
assert matches == [(40, 55)]

duplicates = sum(
    a == b
    for p in rune_pages
    for a, b in zip(p["indices"], p["indices"][1:])
)
assert duplicates == 21

# Verify the full printed 16-page motif is a source-defined block, but
# explicitly make no historical cipher inference from the numeric coincidence.
print("Source group: physical p40..p55, printed folio count:", len(border))
print("Rune pages:", len(rune_pages), "runes:", runes)
print("Within-page GP29 transitions:", steps, "zero-delta transitions:", duplicates)
print("Contiguous intervals among p0..55:", all_window_count)
print("Intervals with exactly 3301 transitions:", matches)
print("PASS: unique source-art block has exactly 3301 page-local GP29 transitions.")
print("No recovered plaintext, key, or historical cipher operation asserted.")
