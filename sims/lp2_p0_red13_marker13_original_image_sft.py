"""LP2 original p0 red title boundary SFT, exact 2014 image source.
python sims/lp2_p0_red13_marker13_original_image_sft.py [original-17.jpg]
Requires Pillow, NumPy, opencv-python.
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

SHA = "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e"
WORD1 = "ᛋᚻᛖᚩᚷᛗᛡᚠ"
WORD2 = "ᛋᚣᛖᛝᚳ"
BODY7 = "ᚦᛄᚷᚫᚠᛄᛟ"
CROPS = {
    "giant_initial": (620, 640, 758, 1190),
    "word1_remaining7": (765, 640, 1122, 770),
    "red_word_dot": (1122, 640, 1135, 770),
    "word2_all5": (1135, 640, 1395, 770),
    "red13dot_marker": (1399, 640, 1448, 770),
    "first_black_body7": (1449, 640, 1777, 770),
}
COUNTS = {
    "giant_initial": (25133, 0),
    "word1_remaining7": (14256, 0),
    "red_word_dot": (100, 7),
    "word2_all5": (9102, 474),
    "red13dot_marker": (1116, 0),
    "first_black_body7": (0, 11434),
}


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "resources/liber-primus/17.jpg"
    raw = source.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == SHA
    image = np.asarray(Image.open(io.BytesIO(raw)).convert("RGB")).astype(np.int16)
    assert image.shape == (3600, 2400, 3)
    red = (image[:, :, 0] > 80) & (image[:, :, 0] > 1.45 * image[:, :, 1]) & (image[:, :, 0] > 1.45 * image[:, :, 2])
    black = (image.max(axis=2) < 110) & ~red
    result = {}
    for label, (left, top, right, bottom) in CROPS.items():
        result[label] = (int(red[top:bottom, left:right].sum()), int(black[top:bottom, left:right].sum()))
    assert result == COUNTS

    def components(label: str) -> np.ndarray:
        left, top, right, bottom = CROPS[label]
        _, _, stats, _ = cv2.connectedComponentsWithStats(
            red[top:bottom, left:right].astype(np.uint8), connectivity=8
        )
        return stats[1:]

    assert sum(int(s[4] >= 70) for s in components("word1_remaining7")) == 7
    # One rune in the five-rune second word has a disconnected component.
    assert sum(int(s[4] >= 70) for s in components("word2_all5")) == 6
    dot = components("red_word_dot")
    assert len(dot) == 1
    assert tuple(map(int, dot[0][:5])) == (1, 85, 10, 10, 100)
    marker = components("red13dot_marker")
    assert len(marker) == 13
    assert sum(int(s[4]) for s in marker) == 1116
    assert all(5 <= s[2] <= 16 and 5 <= s[3] <= 16 for s in marker)

    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    prefix = "".join(corpus["runes"][i] for i in corpus["pages"][0]["indices"][:20])
    assert prefix == WORD1 + WORD2 + BODY7
    original = (root / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8").splitlines()[0]
    assert original.startswith(WORD1 + "-" + WORD2 + "." + "ᚦᛄᚷᚫ-ᚠᛄᛟ-")
    ink = json.loads((root / "resources/liber-primus/lp2-ink-annotations.json").read_text(encoding="utf-8"))
    p0 = next(p for p in ink["pages"] if p["page"] == 0)
    assert p0["red_spans"][0]["length"] == 13
    assert p0["large_punctuation"] == [[13, 13, "red"]]

    print(json.dumps({
        "result": "PASS: red8, small red divider, red5, large red13-dot after rune13, black body",
        "source_sha256": SHA, "title": [WORD1, WORD2],
        "body_first7": BODY7, "large_mark_offset": 13, "census": result
    }, indent=2))


if __name__ == "__main__":
    main()
