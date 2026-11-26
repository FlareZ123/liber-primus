#!/usr/bin/env python3
"""Independent original-image D/M check for LP2 global rune position 9877.

Reproduces the Round47 segmentation family against the repository's pinned
original JPEGs, then compares page41 line455 j6 with known D/M glyphs on the
solved p56 control page. This is a model-side template check, not a human
oracle. Requires Pillow, NumPy and SciPy.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

RUNES = set("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
PAGE41_SHA256 = "134052dd794a7d11185cc6d942de3f9839bd2b767e0845b0f059f711b269bee2"
PAGE56_SHA256 = "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def runes_only(text: str) -> str:
    return "".join(ch for ch in text if ch in RUNES)


def segment_page(path: Path):
    """Mirror the pinned upstream runic_components/cluster/central filter."""
    image = Image.open(path).convert("RGB")
    pixels = np.asarray(image).astype(np.int16)
    red = (pixels[:, :, 0] > 110) & (pixels[:, :, 1] < 95) & (pixels[:, :, 2] < 95)
    dark = (pixels[:, :, 0] < 105) & (pixels[:, :, 1] < 105) & (pixels[:, :, 2] < 105)
    ink = (red | dark).astype(np.uint8)

    labels, _ = ndimage.label(ink)
    components = []
    for sl in ndimage.find_objects(labels):
        if sl is None:
            continue
        ys, xs = sl
        height = ys.stop - ys.start
        width = xs.stop - xs.start
        if 95 <= height <= 132 and 8 <= width <= 98:
            components.append({
                "x0": xs.start,
                "x1": xs.stop,
                "y0": ys.start,
                "y1": ys.stop,
                "yc": (ys.start + ys.stop) / 2,
                "xc": (xs.start + xs.stop) / 2,
            })

    components.sort(key=lambda item: item["yc"])
    lines = []
    current = []
    for component in components:
        if current and component["yc"] - np.median([x["yc"] for x in current]) > 55:
            lines.append(current)
            current = []
        current.append(component)
    if current:
        lines.append(current)

    clean = []
    for line in lines:
        keep = [x for x in line if 380 < x["xc"] < 2020]
        if keep:
            keep.sort(key=lambda item: item["x0"])
            clean.append(keep)
    return image, clean


def normalized_glyph(image: Image.Image, box: dict) -> np.ndarray:
    crop = image.crop((box["x0"], box["y0"], box["x1"], box["y1"])).convert("L")
    mask = (np.asarray(crop) < 128).astype(np.uint8)
    height, width = mask.shape
    scale = min(120 / height, 60 / width)
    new_height = max(1, round(height * scale))
    new_width = max(1, round(width * scale))
    resized = Image.fromarray(mask * 255).resize(
        (new_width, new_height), Image.Resampling.NEAREST
    )
    canvas = np.zeros((128, 64), dtype=np.uint8)
    x = (64 - new_width) // 2
    y = (128 - new_height) // 2
    canvas[y:y + new_height, x:x + new_width] = (
        np.asarray(resized) > 0
    ).astype(np.uint8)
    return canvas


def hamming(left: np.ndarray, right: np.ndarray) -> float:
    return float(np.mean(left != right))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--contact-sheet", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()

    page41_image = root / "resources/liber-primus/58.jpg"
    page56_image = root / "resources/liber-primus/73.jpg"
    transcription = root / "resources/transcriptions/lp2-image-corrected.txt"

    page41_hash = sha256(page41_image)
    page56_hash = sha256(page56_image)
    assert page41_hash == PAGE41_SHA256
    assert page56_hash == PAGE56_SHA256

    pages = transcription.read_text(encoding="utf-8").split("%")
    page41_lines = [runes_only(line) for line in pages[41].split("/")]
    page41_lines = [line for line in page41_lines if line]
    line455 = page41_lines[0]
    page56_text = runes_only(pages[56])

    assert line455 == "ᛠᛁᚪᛋᚣᛗᛞᚣᛋᛒᛞᛄᛞᚩᚾᛏᛚᚳᚪᛝᚱᚷ"
    assert len(line455) == 22
    assert page56_text.startswith("ᚫ")
    assert len(page56_text) == 85

    image41, lines41 = segment_page(page41_image)
    image56, lines56 = segment_page(page56_image)
    target_line_boxes = lines41[0]
    control_boxes = [box for line in lines56 for box in line]

    # The first page56 rune is the oversized drop cap, excluded by the
    # component-height filter; all remaining 84 glyphs align in reading order.
    assert len(target_line_boxes) == 21
    assert len(control_boxes) == len(page56_text) - 1 == 84

    control_labels = list(page56_text[1:])
    templates = [
        (label, index, normalized_glyph(image56, box))
        for index, (label, box) in enumerate(zip(control_labels, control_boxes))
    ]
    by_class = {
        label: [(index, template) for rune, index, template in templates if rune == label]
        for label in ("ᛗ", "ᛞ")
    }
    assert len(by_class["ᛗ"]) == 3
    assert len(by_class["ᛞ"]) == 5

    first_seven = []
    for j, box in enumerate(target_line_boxes[:7]):
        query = normalized_glyph(image41, box)
        ranked = sorted(
            (hamming(query, template), label, index)
            for label, index, template in templates
        )
        first_seven.append({
            "j": j,
            "expected": line455[j],
            "nearest": ranked[0][1],
            "distance": ranked[0][0],
            "control_index": ranked[0][2],
        })
    assert "".join(item["nearest"] for item in first_seven) == line455[:7]

    target_m = normalized_glyph(image41, target_line_boxes[5])
    target_d = normalized_glyph(image41, target_line_boxes[6])

    def class_distances(query, label):
        values = [hamming(query, template) for _, template in by_class[label]]
        return {
            "minimum": min(values),
            "mean": float(np.mean(values)),
            "distances": values,
        }

    target_j5 = {
        "expected": "ᛗ",
        "M": class_distances(target_m, "ᛗ"),
        "D": class_distances(target_m, "ᛞ"),
    }
    target_j6 = {
        "expected": "ᛞ",
        "M": class_distances(target_d, "ᛗ"),
        "D": class_distances(target_d, "ᛞ"),
    }

    loo_correct = 0
    loo_rows = []
    for held_index, (held_label, _, held_template) in enumerate(
        (item for item in templates if item[0] in ("ᛗ", "ᛞ"))
    ):
        ranked = sorted(
            (hamming(held_template, template), label)
            for j, (label, _, template) in enumerate(
                item for item in templates if item[0] in ("ᛗ", "ᛞ")
            )
            if j != held_index
        )
        predicted = ranked[0][1]
        loo_correct += int(predicted == held_label)
        loo_rows.append({"expected": held_label, "predicted": predicted, "distance": ranked[0][0]})
    assert loo_correct == 8

    output = {
        "source": {
            "upstream_repository": "Dukotah/cicada3301",
            "upstream_commit": "fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb",
            "upstream_target": "gpos9877 = page41 line455 j6",
            "page41_original_image_sha256": page41_hash,
            "page56_control_image_sha256": page56_hash,
        },
        "segmentation": {
            "page41_line455_canonical_runes": len(line455),
            "page41_line455_components": len(target_line_boxes),
            "page56_control_runes": len(page56_text),
            "page56_control_components": len(control_boxes),
            "page56_dropcap_excluded": page56_text[0],
            "known_M_examples": len(by_class["ᛗ"]),
            "known_D_examples": len(by_class["ᛞ"]),
        },
        "first_seven_alignment": first_seven,
        "target_j5": target_j5,
        "target_j6": target_j6,
        "D_M_leave_one_out": {"correct": loo_correct, "total": 8, "rows": loo_rows},
        "decision": "Original-image template comparison supports D at gpos9877. This is a model-side visual check, not a human oracle; retain the external transcription caveat until independent human review.",
    }

    if args.contact_sheet:
        tiles = []
        labels = [
            ("page41 j5 (M)", image41, target_line_boxes[5]),
            ("page41 j6 (D?)", image41, target_line_boxes[6]),
        ]
        for label, image, box in labels:
            crop = image.crop((box["x0"] - 4, box["y0"] - 4, box["x1"] + 4, box["y1"] + 4)).convert("L")
            tiles.append((label, crop))
        for rune, name in (("ᛗ", "control M"), ("ᛞ", "control D")):
            for index, _ in by_class[rune]:
                box = control_boxes[index]
                crop = image56.crop((box["x0"] - 4, box["y0"] - 4, box["x1"] + 4, box["y1"] + 4)).convert("L")
                tiles.append((f"{name} {index}", crop))

        width, height = 160, 190
        columns = 5
        rows = (len(tiles) + columns - 1) // columns
        sheet = Image.new("RGB", (columns * width, rows * height), "white")
        draw = ImageDraw.Draw(sheet)
        for i, (label, crop) in enumerate(tiles):
            crop.thumbnail((120, 145), Image.Resampling.NEAREST)
            x = (i % columns) * width
            y = (i // columns) * height
            sheet.paste(crop.convert("RGB"), (x + (width - crop.width) // 2, y + 5))
            draw.text((x + 4, y + 155), label, fill="black")
        args.contact_sheet.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(args.contact_sheet)

    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
