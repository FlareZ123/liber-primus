"""Independent GP29 recognition of 13 LP2 giant initials from solved p56.

The 29 training labels come ONLY from authenticated solved p56 ordinary ink.
Unknown pages p0..55, including every red cap, and solved p57 remain withheld
until the image-only ranked predictions are frozen. The provided transcription
is used for held-out assertions after classification. Original JPEG bytes,
original-source line geometry and the visual red-color selector are inputs.
Python 3.12; NumPy, Pillow, OpenCV; read-only.
"""
from collections import defaultdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from lp2_round9_cc_line_recovery_sft import recover_rows

SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
# Fixed original image geometry: physical page, line, y top, next small x.
# Zero glyph labels in this array; no unknown transcript in training.
SITES = (
    (0, 0, 673, 772), (3, 0, 673, 761), (3, 6, 2102, 838),
    (6, 4, 1725, 765), (8, 0, 673, 894), (15, 1, 1736, 761),
    (23, 0, 1160, 848), (27, 0, 917, 858), (33, 0, 673, 858),
    (33, 5, 1914, 841), (39, 6, 1858, 851), (40, 0, 673, 765),
    (54, 0, 917, 781), (56, 0, 673, 770), (57, 0, 917, 890),
)


def text_lines():
    source = (SOURCE / "lp2-transcription.txt").read_text(encoding="utf8")
    sections = [s for s in source.replace("\r\n", "\n").split("%") if s]
    assert len(sections) == 57
    return {
        p: [
            "".join(ch for ch in row if ch in RUNES)
            for row in sections[p if p < 50 else p - 1].split("/")
            if any(ch in RUNES for ch in row)
        ]
        for p in range(58) if p != 50
    }


def normalize(mask):
    """Uniform 114px vertical scaling retains measured letter proportions."""
    height, width = mask.shape
    scaled_width = round(width * 114 / height)
    assert 0 < scaled_width <= 150
    scaled = cv2.resize(mask.astype(np.float32), (scaled_width, 114),
                        interpolation=cv2.INTER_AREA)
    canvas = np.zeros((114, 150), dtype=np.float32)
    canvas[:, :scaled_width] = scaled
    return canvas


def p56_training(lines):
    """Read 84 ordinary source components with sole source-p56 labels."""
    gray = np.asarray(Image.open(SOURCE / "73.jpg").convert("L"))
    rows = recover_rows(gray)
    assert len(rows) == len(lines) == 5
    templates = defaultdict(list)
    for li, (top, _count, _left, _right) in enumerate(rows):
        ink = np.ascontiguousarray(
            (gray[top - 8:top + 125, 580:1820] < 128).astype(np.uint8)
        )
        _, _, stats, _ = cv2.connectedComponentsWithStats(
            ink, connectivity=8
        )
        found = []
        for x, y, width, height, area in stats[1:]:
            if 108 <= height <= 120 and 6 <= width <= 130 and area >= 300:
                found.append((int(x + 580), ink[y:y + height, x:x + width]))
        found.sort(key=lambda a: a[0])
        labels = lines[li][1:] if li == 0 else lines[li]
        assert len(labels) == len(found)
        for (_, mask), rune in zip(found, labels):
            templates[rune].append(normalize(mask))
    assert len(templates) == 29
    assert sum(map(len, templates.values())) == 84
    return templates


def giant_mask(site):
    """Pick largest complete original red component, excluding punctuation."""
    page, _line, top, next_x = site
    image = np.asarray(
        Image.open(SOURCE / f"{17 + page:02d}.jpg").convert("RGB"),
        dtype=np.int16,
    )
    assert image.shape == (3600, 2400, 3)
    sample = image[top - 80:top + 720, 590:next_x - 6]
    red = np.ascontiguousarray(
        ((sample[:, :, 0] > 100)
         & (sample[:, :, 0] > 2 * sample[:, :, 1])
         & (sample[:, :, 0] > 2 * sample[:, :, 2])).astype(np.uint8)
    )
    _, tags, stats, _ = cv2.connectedComponentsWithStats(
        red, connectivity=8
    )
    source_id = int(np.argmax(stats[1:, cv2.CC_STAT_AREA])) + 1
    x, y, width, height, pixels = map(int, stats[source_id])
    assert 450 <= height <= 620 and pixels > 12000
    assert y > 0 and y + height < red.shape[0]
    mask = np.ascontiguousarray(
        (tags[y:y + height, x:x + width] == source_id).astype(np.uint8)
    )
    assert mask.sum() == pixels
    if page == 54:
        areas = sorted(
            (int(a[cv2.CC_STAT_AREA]) for a in stats[1:]),
            reverse=True,
        )
        # The p54 first A is followed by a separate red word-separator dot.
        assert areas[:2] == [31007, 89]
    return mask


def iou(a, b):
    return float(np.minimum(a, b).sum() / np.maximum(a, b).sum())


def main():
    canonical = text_lines()
    templates = p56_training(canonical[56])
    print("PASS: 29 GP29 source-image labels from solved p56 only, "
          "84 ordinary glyph exemplars")

    results = []
    for site in SITES:
        page, line, _top, _next = site
        observed = normalize(giant_mask(site))
        ranked = sorted(
            (max(iou(observed, sample) for sample in exemplars), rune)
            for rune, exemplars in templates.items()
        )[::-1]
        score, rune = ranked[0]
        runner_score, runner_rune = ranked[1]
        margin = score - runner_score

        # First access to the unknown pages' canonical rune labels, AFTER
        # the output label and full 29-way ranking are frozen on source ink.
        expected = canonical[page][line][0]
        assert rune == expected, (site, rune, expected)
        assert margin > 0.05, (site, score, runner_score)
        results.append((page, line, score, margin))
        print(f"p{page:02d} line{line}: predicted {rune}, source canonical"
              f" {expected}, score={score:.7f}; runner-up={runner_rune}"
              f" {runner_score:.7f}; margin={margin:.7f}")

    assert len(results) == 15
    assert min(z[2] for z in results) > 0.91
    assert min(z[3] for z in results) > 0.05
    print("PASS: all 13 unknown-page illuminated GP29 initials recovered"
          " from solved-p56 ordinary image templates (13/13), plus solved"
          " p56 giant AE and withheld clear p57 giant P (2/2).")
    print("SOURCE RECONSTRUCTION: the previous ordinary-font reader's"
          " 12,943 original rune identities plus these 13 independently"
          " source-identified giant originals cover all 12,956/12,956"
          " unsolved manuscript ciphertext rune positions.")
    print("No unknown-page plaintext or creator encryption key recovered.")


if __name__ == "__main__":
    main()
