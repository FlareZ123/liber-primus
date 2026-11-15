"""Original-image p0-2 word-gap model, with page 2 completely withheld.

Python 3 with Pillow, NumPy and OpenCV; read-only original-source SFT.
Run from any working directory. The original archive JPGs must be in resources/.
"""
from hashlib import sha256
from pathlib import Path
import re

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "resources" / "liber-primus"
HASHES = (
    "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
    "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f",
    "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
)


def get_lines():
    source = (SRC / "lp2-transcription.txt").read_text(encoding="utf-8")
    groups = re.split(r"(?m)^%\s*$", source)[:3]
    out = [[line.strip() for line in part.splitlines()
            if any("\u16a0" <= c <= "\u16ff" for c in line)] for part in groups]
    assert [len(p) for p in out] == [12, 12, 9]
    assert [sum(sum("\u16a0" <= c <= "\u16ff" for c in line)
                for line in p) for p in out] == [262, 266, 201]
    return out


def source_distances(page, lines):
    filename = SRC / f"{page + 17}.jpg"
    assert sha256(filename.read_bytes()).hexdigest() == HASHES[page]
    image = Image.open(filename).convert("L")
    assert image.size == (2400, 3600)
    binary = (np.asarray(image) < 150).astype(np.uint8)
    distances, clean_lines = [], []
    for line_num, line in enumerate(lines):
        if page == 0 and line_num == 0:
            continue  # Oversized red initial and marginal stave
        y = 660 + 188 * line_num
        crop = binary[y:y + 125, 550:1850]
        _, _, components, _ = cv2.connectedComponentsWithStats(crop, 8)
        ink_starts = sorted(int(x) + 550 for x, yy, width, height, area
                            in components[1:] if area > 150 and height >= 70
                            and 10 <= width <= 120)
        tokens = []
        for ch in line:
            if ch in "-.":
                if tokens:
                    tokens[-1][1] += ch
            elif "\u16a0" <= ch <= "\u16ff":
                tokens.append([ch, ""])
        if len(tokens) != len(ink_starts):
            continue  # Do not invent positions for connected or extraneous ink
        clean_lines.append(line_num)
        for j in range(len(tokens) - 1):
            previous, punctuation = tokens[j]
            if "." in punctuation:
                continue  # Sentence stops have a distinct printed shape
            next_rune = tokens[j + 1][0]
            distances.append((line_num, previous, next_rune,
                              int("-" in punctuation), ink_starts[j + 1] - ink_starts[j]))
    return distances, clean_lines


def design(rows, symbols):
    glyph = {value: i for i, value in enumerate(symbols)}
    n = len(symbols)
    features = np.zeros((len(rows), 2 * n + 2))
    measured = np.array([row[4] for row in rows], dtype=float)
    for i, (_, predecessor, successor, sep, _) in enumerate(rows):
        features[i, glyph[predecessor]] = 1
        features[i, n + glyph[successor]] = 1
        features[i, -2] = 1
        features[i, -1] = sep
    return features, measured


def main():
    lines = get_lines()
    parsed = [source_distances(p, lines[p]) for p in range(3)]
    rows = [pair[0] for pair in parsed]
    chosen = [pair[1] for pair in parsed]
    assert chosen == [[3, 6, 8, 9, 10, 11],
                      [2, 3, 4, 5, 8, 9, 10],
                      [0, 1, 5, 6, 7, 8]]
    assert [len(r) for r in rows] == [126, 144, 124]
    all_glyphs = sorted({g for page in rows for _, a, b, _, _ in page for g in (a, b)})
    assert len(all_glyphs) == 29
    x0, y0 = design(rows[0], all_glyphs)
    x1, y1 = design(rows[1], all_glyphs)
    x2, y2 = design(rows[2], all_glyphs)
    x = np.vstack((x0, x1))
    y = np.concatenate((y0, y1))
    alpha = 0.1
    weights = np.linalg.solve(x.T @ x + alpha * np.eye(x.shape[1]), x.T @ y)
    known_outgoing = {a for group in rows[:2] for _, a, _, _, _ in group}
    valid = np.array([a in known_outgoing for _, a, _, _, _ in rows[2]])
    withheld_rows = [r for r, accepted in zip(rows[2], valid) if accepted]
    error = y2[valid] - x2[valid] @ weights
    separators = np.array([r[3] == 1 for r in withheld_rows])
    gap = float(weights[-1])
    planted_error = error[separators] + round(gap)
    print("Verified original page JPEGs: 17, 18, 19")
    print("Clean ink/transcription line indices:", chosen)
    print("Rune-to-rune distances:", list(map(len, rows)))
    print("Training distances:", len(y), "separators:", sum(r[3] for
          group in rows[:2] for r in group))
    print("Estimated extra printed word marker (pixels):", round(gap, 9))
    print("Held-out p2 distances:", len(error), "separators:", int(sum(separators)))
    print("Unsupported predecessor classes:", len(y2) - len(error))
    print("Blind p2 RMSE:", round(float(np.sqrt(np.mean(error ** 2))), 9))
    print("Blind p2 maximum absolute residual:", round(float(max(abs(error))), 9))
    print("Blind p2 separator maximum absolute residual:",
          round(float(max(abs(error[separators]))), 9))
    print("Planted second separator detected:", int(sum(abs(planted_error) > gap / 2)),
          "of", int(sum(separators)))
    assert len(error) == 120 and sum(separators) == 23
    assert abs(gap - 15.877478565714) < 0.0001
    assert max(abs(error)) < 1.75
    assert max(abs(error[separators])) < 1.16
    assert sum(abs(planted_error) > gap / 2) == 23
    assert not any(abs(error) > gap / 2)


if __name__ == "__main__":
    main()
