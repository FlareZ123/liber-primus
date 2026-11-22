"""Original-JPEG six-rune echo allograph gate. Read-only, Windows-compatible SFT.

Usage: python lp2_p27_p55_echo_glyph_ink_sft.py [path/to/liber-primus-jpegs.zip]
Default: original images at resources/liber-primus/{44,72}.jpg.
"""
from __future__ import annotations

import hashlib
import io
import sys
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE = {
    "44": ("c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e", 1105, 1220,
           [(1288, 1341), (1348, 1393), (1398, 1451), (1471, 1505), (1510, 1563), (1569, 1579)]),
    "72": ("a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba", 1238, 1352,
           [(738, 790), (798, 842), (847, 900), (921, 955), (960, 1013), (1019, 1029)]),
}
SYMBOLS = "DJUBEI"


def source_bytes(stem: str, archive: Path | None) -> bytes:
    if archive:
        with zipfile.ZipFile(archive) as handle:
            return handle.read(f"liber-primus-jpegs/{stem}.jpg")
    return (Path("resources") / "liber-primus" / f"{stem}.jpg").read_bytes()


def normalized_glyphs(stem: str, archive: Path | None) -> list[np.ndarray]:
    expected_hash, y0, y1, horizontal = SOURCE[stem]
    raw = source_bytes(stem, archive)
    assert hashlib.sha256(raw).hexdigest() == expected_hash, f"original source mismatch {stem}"
    with Image.open(io.BytesIO(raw)) as decoded:
        gray = decoded.convert("L")
    assert gray.size == (2400, 3600)
    result = []
    for x0, x1 in horizontal:
        crop = gray.crop((x0, y0, x1, y1))
        normalized = crop.resize((60, 114), Image.Resampling.BOX)
        result.append(np.asarray(normalized) < 128)
    assert len(result) == len(SYMBOLS)
    return result


def overlap(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.logical_and(a, b).sum() / np.logical_or(a, b).sum())


def main() -> None:
    archive = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    first, last = normalized_glyphs("44", archive), normalized_glyphs("72", archive)
    similarity = [[overlap(a, b) for b in last] for a in first]
    print("Original p27 44.jpg vs p55 72.jpg, full source SHA256 verified")
    print("Source rune offsets p27 28..33, p55 70..75; exact same DJU-BEI")
    for idx, symbol in enumerate(SYMBOLS):
        matching = similarity[idx][idx]
        incorrect = max(x for j, x in enumerate(similarity[idx]) if idx != j)
        top = max(range(6), key=lambda j: similarity[idx][j])
        print(f"{symbol}: source-shape IoU={matching:.6f}; nearest different glyph={incorrect:.6f}; matching column={top}")
        assert matching > 0.87, f"source glyph shape changed at {symbol}"
        assert matching > incorrect + 0.20, f"ambiguous source shape at {symbol}"
        assert top == idx, f"glyph no longer best matches its same-identity partner {symbol}"
    assert max(similarity[i][j] for i in range(6) for j in range(6) if i != j) < 0.70
    print("PASS: all 6 repeated-source glyphs are mutually shape-consistent; no visible allograph gate")
    print("This test does not decrypt any rune or exclude pixel-LSB/channel steganography.")


if __name__ == "__main__":
    main()
