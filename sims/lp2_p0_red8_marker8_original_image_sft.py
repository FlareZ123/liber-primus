"""Original LP2 p0 red-ink boundary, source-exact, read-only SFT.
Run from repo: python sims/lp2_p0_red8_marker8_original_image_sft.py
Needs Pillow, numpy and opencv-python. Optional first argument: original 17.jpg.
"""
from __future__ import annotations
import hashlib
import io
import json
import sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

SHA256 = "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e"
RED8 = "ᛋᚻᛖᚩᚷᛗᛡᚠ"
BLACK5 = "ᛋᚣᛖᛝᚳ"
REGIONS = {"oversized_red_initial": (620, 640, 758, 1190),
           "red_continuation7": (765, 640, 1388, 770),
           "mark": (1399, 640, 1448, 770),
           "black5": (1449, 640, 1777, 770)}

def main():
    root = Path(__file__).resolve().parents[1]
    filename = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "resources/liber-primus/17.jpg"
    data = filename.read_bytes()
    assert hashlib.sha256(data).hexdigest() == SHA256
    a = np.asarray(Image.open(io.BytesIO(data)).convert("RGB"))
    assert a.shape == (3600, 2400, 3)
    channels = a.astype(np.int16)
    r, g, b = (channels[:, :, i] for i in range(3))
    red = (r > 80) & (r > 1.45 * g) & (r > 1.45 * b)
    black = (channels.max(axis=2) < 110) & ~red
    census = {}
    for label, (x0, y0, x1, y1) in REGIONS.items():
        census[label] = {"red": int(red[y0:y1, x0:x1].sum()),
                         "black": int(black[y0:y1, x0:x1].sum())}
    assert census == {"oversized_red_initial": {"red": 25133, "black": 0},
                      "red_continuation7": {"red": 23455, "black": 481},
                      "mark": {"red": 1116, "black": 0},
                      "black5": {"red": 0, "black": 11434}}
    x0, y0, x1, y1 = REGIONS["mark"]
    total, _, stats, _ = cv2.connectedComponentsWithStats(
        red[y0:y1, x0:x1].astype(np.uint8), connectivity=8)
    dots = [row for row in stats[1:] if 5 <= row[2] <= 16 and 5 <= row[3] <= 16]
    assert total == 14 and len(dots) == 13
    assert sum(int(dot[4]) for dot in dots) == census["mark"]["red"]
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    assert "".join(corpus["runes"][i] for i in corpus["pages"][0]["indices"][:13]) == RED8 + BLACK5
    ink = json.loads((root / "resources/liber-primus/lp2-ink-annotations.json").read_text(encoding="utf-8"))
    p0 = next(page for page in ink["pages"] if page["page"] == 0)
    # The independent derivative annotation remains pinned as historical testimony.
    assert p0["red_spans"][0]["length"] == 13
    assert p0["large_punctuation"] == [[13, 13, "red"]]
    print(json.dumps({"source_sha256": SHA256, "physical_red_runes": RED8,
                      "physical_black_runes": BLACK5, "large_13dot_position": 8,
                      "census": census,
                      "derived_annotation_placement": 13,
                      "result": "PASS: original red8 | red13dot | black5; rune identities unchanged"},
                     indent=2))

if __name__ == "__main__":
    main()
