"""Source-controlled LP2 p57 runic font discriminator (single-file test).

Requires Pillow, NumPy, OpenCV, SciPy and fontTools.
Runs in GitHub Actions; can also run from the repository root on Windows.
The external TTF is fetched in memory and Git-blob-SHA checked; no font is redistributed.
"""
from __future__ import annotations

import hashlib
import io
import json
import zipfile
from pathlib import Path
from urllib.request import urlopen

import cv2
import numpy as np
from PIL import Image, ImageFont
from scipy.ndimage import distance_transform_edt
from fontTools.ttLib import TTFont

IMAGE = Path("resources/liber-primus/74.jpg")
IMAGE_SHA256 = "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"
TITLE_RUNES = "ᚪᚱᚪᛒᛚᛖᛚᛁ"
ALPHABET = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᛠᛡᛇᚣ"
CANDIDATE_URL = (
    "https://raw.githubusercontent.com/krisyotam/cicada3301/"
    "main/tools/solvers/iddqd/ttf/BabelStoneRunicBeorhtnoth.ttf"
)
CANDIDATE_GIT_BLOB = "414f3b5852438dd8450411e204aeff75adab0d42"


def tight(mask: np.ndarray) -> np.ndarray:
    y, x = np.nonzero(mask)
    return mask[y.min():y.max() + 1, x.min():x.max() + 1]


def title_targets(data: bytes) -> list[np.ndarray]:
    rgb = np.asarray(Image.open(io.BytesIO(data)).convert("RGB"), dtype=np.int16)
    red = (
        (rgb[:, :, 0] >= 110)
        & (rgb[:, :, 0] >= rgb[:, :, 1] + 45)
        & (rgb[:, :, 0] >= rgb[:, :, 2] + 45)
    )
    counts = red[890:1050, 885:1135].sum(axis=0)
    hits = np.flatnonzero(counts > 0) + 885
    runs: list[list[int]] = []
    for x in hits:
        if not runs or x > runs[-1][-1] + 1:
            runs.append([int(x)])
        else:
            runs[-1].append(int(x))
    intervals = [(s[0], s[-1]) for s in runs if len(s) >= 9]
    assert len(intervals) == 6, intervals
    assert intervals[0][0] == 890 and intervals[-1][1] == 1132, intervals
    masks = []
    for x0, x1 in intervals:
        masks.append(tight(red[890:1050, x0:x1 + 1]))
    # First two source-black letters of LIKE immediately after the red title:
    # L is a shape discriminator; I is a narrow vertical positive control.
    black = np.all(rgb < 160, axis=2)
    for x0, x1 in [(1185, 1218), (1222, 1230)]:
        masks.append(tight(black[890:1050, x0:x1 + 1]))
    return masks


def glyph(face: ImageFont.FreeTypeFont, ch: str) -> np.ndarray:
    mask = face.getmask(ch, mode="L")
    values = np.asarray(mask).reshape(mask.size[1], mask.size[0])
    return tight(values > 125)


def normalize(mask: np.ndarray) -> np.ndarray:
    resized = cv2.resize(
        tight(mask).astype(np.uint8), (96, 96), interpolation=cv2.INTER_AREA
    )
    return resized > 0


def match(a: np.ndarray, b: np.ndarray) -> tuple[float, float]:
    x, y = normalize(a), normalize(b)
    dx, dy = distance_transform_edt(~x), distance_transform_edt(~y)
    chamfer = (dx[y].mean() + dy[x].mean()) / 2
    union = np.logical_or(x, y).sum()
    intersection = np.logical_and(x, y).sum()
    return round(float(chamfer), 4), round(float(intersection / union), 4)



def p55_original_masks() -> tuple[list[np.ndarray], list[str]]:
    manifest = json.loads(Path("resources/liber-primus/lp2-p55-source-glyph-coordinates.json").read_text(encoding="utf-8"))
    source = Path("resources/liber-primus/72.jpg").read_bytes()
    actual_sha = hashlib.sha256(source).hexdigest()
    assert actual_sha == manifest["sha256"], ("p55 source mismatch", actual_sha)
    runes = json.loads(Path("resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))["runes"]
    assert len(runes) == 29
    rgb = np.asarray(Image.open(io.BytesIO(source)).convert("RGB"))
    ink = np.max(rgb, axis=2) < 160
    masks, labels = [], []
    for index, item in enumerate(manifest["glyphs"]):
        assert item["ordinal"] == index + 1
        x0, y0, x1, y1 = item["rect"]
        mask = tight(ink[y0:y1 + 1, x0:x1 + 1])
        masks.append(mask)
        labels.append(runes[item["gp29_index"]])
    assert len(masks) == len(labels) == 76
    print("P55 HELD-OUT ORIGINAL", actual_sha, "runes", len(labels), "unique", len(set(labels)))
    return masks, labels


def p55_font_report(name: str, data: bytes, originals: list[np.ndarray], labels: list[str]) -> None:
    coverage = TTFont(io.BytesIO(data), lazy=True).getBestCmap()
    face = ImageFont.truetype(io.BytesIO(data), size=160)
    templates = {ch: glyph(face, ch) for ch in ALPHABET if ord(ch) in coverage}
    if any(ch not in templates for ch in labels):
        print("P55 HELD-OUT", name, "MISSING EXPECTED SYMBOLS")
        return
    chamfers, ious, ranks, ratios, hard = [], [], [], [], []
    for i, (correct, target) in enumerate(zip(labels, originals)):
        distances = sorted((match(target, other)[0], ch) for ch, other in templates.items())
        rank = next(j + 1 for j, (_, ch) in enumerate(distances) if ch == correct)
        d, overlap = match(target, templates[correct])
        aspect_target = target.shape[1] / target.shape[0]
        aspect_template = templates[correct].shape[1] / templates[correct].shape[0]
        ratios.append(abs(np.log(aspect_target / aspect_template)))
        chamfers.append(d)
        ious.append(overlap)
        ranks.append(rank)
        if rank >= 15:
            hard.append(f"{i + 1}:{correct}:rank{rank}:nearest{distances[0][1]}")
    print(f"P55 HELD-OUT {name}: mean_chamfer={np.mean(chamfers):.5f} "
          f"median_chamfer={np.median(chamfers):.5f} mean_IoU={np.mean(ious):.5f} "
          f"top1={sum(r == 1 for r in ranks)}/{len(ranks)} "
          f"top3={sum(r <= 3 for r in ranks)}/{len(ranks)} "
          f"mean_true_rank={np.mean(ranks):.3f} "
          f"mean_log_aspect_error={np.mean(ratios):.4f} "
          f"hard={','.join(hard[:12])}")


def font_report(name: str, data: bytes, originals: list[np.ndarray]) -> None:
    font = TTFont(io.BytesIO(data), lazy=True)
    coverage = font.getBestCmap()
    version = font["name"].getDebugName(5)
    family = font["name"].getDebugName(1)
    face = ImageFont.truetype(io.BytesIO(data), size=160)
    templates = {
        ch: glyph(face, ch)
        for ch in ALPHABET
        if ord(ch) in coverage
    }
    print(f"FONT {name}: family={family!r}, version={version!r}, "
          f"SHA256={hashlib.sha256(data).hexdigest()}, "
          f"runic coverage={len(templates)}/{len(ALPHABET)}")
    if not all(ch in templates for ch in TITLE_RUNES):
        print("  MISSING EXPECTED RUNES; comparison ineligible")
        return
    measured = []
    for index, (expected, target) in enumerate(zip(TITLE_RUNES, originals)):
        ranks = sorted(
            (match(target, rendered)[0], ch)
            for ch, rendered in templates.items()
        )
        correct_distance, correct_iou = match(target, templates[expected])
        correct_rank = next(i + 1 for i, (_, ch) in enumerate(ranks) if ch == expected)
        measured.append((correct_distance, correct_iou))
        print(f"  title rune {index}: expected {expected} "
              f"chamfer={correct_distance:.4f} IoU={correct_iou:.4f} "
              f"expected_rank={correct_rank}/{len(ranks)} "
              f"independent_top5={ranks[:5]}")
    print(f"  mean expected-distance={np.mean([x[0] for x in measured]):.4f}; "
          f"mean expected-IoU={np.mean([x[1] for x in measured]):.4f}")
    print(f"  sanity planted shape self-comparison={match(templates[TITLE_RUNES[0]], templates[TITLE_RUNES[0]])}")


def main() -> None:
    raw = IMAGE.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    assert sha == IMAGE_SHA256, f"original p57 source mismatch: {sha}"
    original = title_targets(raw)
    print("SOURCE", IMAGE, "SHA256", sha)
    print("TITLE six red runes after giant P + first two black LIKE runes:", TITLE_RUNES)
    print("original bounding rectangles (width,height)", [x.shape[::-1] for x in original])
    print("duplicate ᚪ similarity", match(original[0], original[2]))
    print("cross-ink L similarity", match(original[4], original[6]))

    with urlopen(CANDIDATE_URL, timeout=40) as response:
        candidate = response.read()
    assert len(candidate) == 55556, len(candidate)
    blob = hashlib.sha1(b"blob " + str(len(candidate)).encode() + b"\0" + candidate).hexdigest()
    assert blob == CANDIDATE_GIT_BLOB, blob
    print("Candidate blob verified", blob)
    p55_masks, p55_labels = p55_original_masks()
    font_report("Archived BabelStone Beorhtnoth", candidate, original)
    p55_font_report("Archived BabelStone Beorhtnoth", candidate, p55_masks, p55_labels)

    # All six official fonts provide stronger within-family controls.
    # Their latest versions postdate LP2; use for shape discrimination only.
    modern_url = "https://www.babelstone.co.uk/Fonts/Download/BabelStoneAngloSaxon.zip"
    with urlopen(modern_url, timeout=40) as response:
        modern_zip = response.read()
    with zipfile.ZipFile(io.BytesIO(modern_zip)) as archive:
        names = sorted(n for n in archive.namelist() if n.lower().endswith(".ttf"))
        print("MODERN BABELSTONE COMPARISON: six post-2014 candidates", names)
        for name in names:
            data = archive.read(name)
            font_report("2023 official " + name, data, original)
            p55_font_report("2023 official " + name, data, p55_masks, p55_labels)

    for label, path in [
        ("Noto Sans Runic control", "/usr/share/fonts/truetype/noto/NotoSansRunic-Regular.ttf"),
        ("FreeSerif control", "/usr/share/fonts/truetype/freefont/FreeSerif.ttf"),
    ]:
        found = Path(path)
        if found.exists():
            data = found.read_bytes()
            font_report(label, data, original)
            p55_font_report(label, data, p55_masks, p55_labels)
        else:
            print("Control unavailable", label, path)


if __name__ == "__main__":
    main()
