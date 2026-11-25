"""Reproduce central-line layout on original LP2 p49–51 scans.
Usage: python sims/lp2_p50_paths_layout_gate.py [image-directory]
Requires Pillow and NumPy; defaults to resources/liber-primus.
"""
from pathlib import Path
import sys
import numpy as np
from PIL import Image

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
for page in (49, 50, 51):
    image = np.asarray(Image.open(root / f"{page + 17:02}.jpg").convert("L"))
    assert image.shape == (3600, 2400)
    rows = np.flatnonzero((image[:, 600:1800] < 100).sum(axis=1) > 10)
    clusters = [x for x in np.split(rows, np.flatnonzero(np.diff(rows) > 12) + 1) if len(x) > 15]
    print(page, [(int(x[0]), int(x[-1])) for x in clusters])
    assert len(clusters) == 13
