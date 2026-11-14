"""Single-file test of one source-illustrated January 2015 p0 punch-card reading.

A 2015-01-28 uploaded image repeats the original p0 oversized red S initial
at three-line intervals. Source-rendered preview:
https://uncovering-cicada.fandom.com/wiki/File:01_-_9AQaicp_with_basic_puch_card_system_.jpg
This SFT reconstructs that fixed visible operation from ORIGINAL 17.jpg,
without assuming the CDN's resized/reencoded bytes preserve source SHA1.

Test ONLY the literal foreground-stencil-over-rune overlap >= 50% readout.
Neither the period upload nor the manuscript authenticates this choice.
No arbitrary mask phase, offset tuning, GP key, or NLP interpretation.
"""
from pathlib import Path
import json
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "resources" / "liber-primus"
src = cv2.imread(str(ART / "17.jpg"), cv2.IMREAD_COLOR)
assert src is not None and src.shape == (3600, 2400, 3), "original source p0 expected"
p0 = (ART / "lp2-transcription.txt").read_text(encoding="utf-8").split("%", 1)[0]
lines = [x.rstrip("/") for x in p0.splitlines() if x.strip()]
assert len(lines) == 12, f"expected original p0 twelve printed lines, got {len(lines)}"
assert lines[3].startswith("ᛋᛈᛏ"), "p0 first full-width line changed"
# The exact first large red initial occupies x601..750, y667..1165.
b, g, r = (src[:, :, k].astype(np.int16) for k in (0, 1, 2))
red = (r > 130) & (g < 90) & (b < 90)
assert 30000 <= red[667:1166, 601:751].sum() < 34000
selected = []
per_line = []
for idx in range(3, 12):
    row = idx + 1
    y0 = 665 + idx * 188
    black = src[y0-30:y0+115, 575:1820].max(axis=2) < 115
    xcount = (black.sum(axis=0) >= 3).astype(np.int8)
    edges = np.diff(np.pad(xcount, (1, 1)))
    starts = np.where(edges == 1)[0] + 575
    ends = np.where(edges == -1)[0] - 1 + 575
    columns = [(int(a), int(b)) for a, b in zip(starts, ends) if b-a>=2]
    assert len(columns) >= 8
    # Copy original source S exactly; no resized screenshot sample becomes evidence.
    shift = (idx // 3) * (3 * 188)
    repeated_red = np.zeros_like(black)
    for y in range(black.shape[0]):
        original_y = y0 - 30 + y - shift
        if 667 <= original_y < 1166:
            repeated_red[y, 601-575:751-575] = red[original_y, 601:751]
    found = []
    for j, (x1, x2) in enumerate(columns[:8]):
        symbol = lines[idx][j]
        region = black[:, x1-575:x2+1-575]
        cover = repeated_red[:, x1-575:x2+1-575]
        fraction = float(np.count_nonzero(region & cover) / np.count_nonzero(region))
        # The original source geometry determines this single readout threshold.
        if fraction >= 0.5:
            found.append({"column": j, "rune": symbol, "overlap": round(fraction, 6)})
            if symbol not in ".-":
                selected.append(symbol)
    per_line.append({"printed_line": row, "hits": found})

literal = "".join(selected)
assert literal == "ᛋᚫᚻᛉᛖᛒᛉᚷᛝᛇᚻᛞᛝ", literal
assert len(literal) == 13
print("P0_PERIOD_PUNCHCARD_SOURCE_GATE " + json.dumps({
    "date": "2015-01-28T23:03:42Z",
    "status": "bounded natural-stencil readout, no authenticated decryption",
    "source": "original LP2 p0 17.jpg and first 12 source transcription lines",
    "hypothesis": "repeat red S every 3 lines and select rune glyphs with >=50% black-ink intersection",
    "literal_runes": literal,
    "length": len(literal),
    "per_line": per_line,
    "limitation": "community source image CDN preview SHA1 differs from original upload; stencil operation is only a participant illustration",
}, ensure_ascii=False))
