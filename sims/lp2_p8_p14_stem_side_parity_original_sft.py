"""Source-JPEG p8–p14 stem parity gate; Pillow/NumPy, read-only Python SFT."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"

def mask(page: int, side: str) -> np.ndarray:
    with Image.open(root / f"{page + 17:02d}.jpg") as jpeg:
        gray = jpeg.convert("L")
        assert gray.size == (2400, 3600)
        x = 0 if side == "L" else 1800
        return np.asarray(gray.crop((x, 600, x + 600, 2970))) < 170

pages = {}
counts = []
for p in range(8, 15):
    left, right = mask(p, "L"), mask(p, "R")
    nleft, nright = int(left.sum()), int(right.sum())
    side = "L" if nleft > 5000 else "R" if nright > 5000 else "NONE"
    assert side == ("L" if p % 2 == 0 else "R")
    assert (nleft > 5000) != (nright > 5000)
    counts.append((nleft, nright))
    pages[p] = {"L": left, "R": right}
    print(f"p{p}: {side}; left={nleft}; right={nright}")

assert counts == [(55074,0),(0,54837),(54868,0),(0,54837),
                  (54868,0),(0,54837),(54868,181)]
for a, b in [(10,12),(10,14)]:
    assert np.array_equal(pages[a]["L"], pages[b]["L"])
for a, b in [(9,11),(9,13)]:
    assert np.array_equal(pages[a]["R"], pages[b]["R"])

# Reused same image, shifted horizontally by 16 px (not mirrored).
l, r = pages[10]["L"][:,16:], pages[9]["R"][:,:-16]
iou = np.logical_and(l,r).sum() / np.logical_or(l,r).sum()
assert iou > 0.97, iou

# Slight p8 antialias alignment lies within two-pixel dilation.
def dilated(x: np.ndarray) -> np.ndarray:
    return np.asarray(Image.fromarray(x.astype(np.uint8)*255)
                      .filter(ImageFilter.MaxFilter(5))) > 0

a, b = pages[8]["L"], pages[10]["L"]
assert int(np.count_nonzero(a & ~dilated(b))) <= 2
assert int(np.count_nonzero(b & ~dilated(a))) <= 2
print("PASS: p8-p14 side stems are two duplicated page-parity templates")
