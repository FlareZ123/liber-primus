#!/usr/bin/env python3
"""Image-only glyph readback for the five numbered LP2 cuneiform passages.

A single-page p43 nearest-template classifier is trained from the source-checked
p43 transcription, then applied to original scans 53-55. A single touching
C+W pair on p37 line 3 is split at its visible two-column ink valley (x=1126).
No target-page glyph labels are used to train the classifier.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

RUNES = list("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
RUNE_INDEX = {r: i for i, r in enumerate(RUNES)}


def source_lines(page_text: str) -> list[str]:
    return [
        line.strip()
        for line in page_text.splitlines()
        if line.strip() and any(ch in RUNE_INDEX for ch in line)
    ]


def crop_ink(mask: np.ndarray) -> np.ndarray:
    yy, xx = np.where(mask)
    if not len(yy):
        raise ValueError("empty glyph crop")
    return mask[yy.min():yy.max() + 1, xx.min():xx.max() + 1]


def glyph_rows(page: int, image_dir: Path) -> tuple[list[list[dict]], list[dict]]:
    scan = page + 17
    rgb = np.asarray(Image.open(image_dir / f"{scan:02d}.jpg").convert("RGB"))
    gray = np.asarray(Image.open(image_dir / f"{scan:02d}.jpg").convert("L"))
    red = (
        (rgb[:, :, 0] > 140)
        & (rgb[:, :, 0] > rgb[:, :, 1] * 1.45)
        & (rgb[:, :, 0] > rgb[:, :, 2] * 1.35)
        & (rgb[:, :, 1] < 160)
        & (rgb[:, :, 2] < 160)
    )
    x0, x1, y0, y1 = 530, 1880, 470, 3190
    black = (gray[y0:y1, x0:x1] < 110) & (~red[y0:y1, x0:x1])
    ys = np.flatnonzero(black.sum(axis=1) >= 18)
    bands = np.split(ys, np.flatnonzero(np.diff(ys) > 20) + 1)
    rows: list[list[dict]] = []
    exceptions: list[dict] = []

    for band in bands:
        if band.size <= 40 or int(band[-1] - band[0]) < 40:
            continue
        band_y0, band_y1 = int(band[0] + y0), int(band[-1] + y0)
        ink = black[int(band[0]):int(band[-1]) + 1]
        xs = np.flatnonzero(ink.sum(axis=0) >= 2)
        runs = np.split(xs, np.flatnonzero(np.diff(xs) > 1) + 1)
        row: list[dict] = []
        for run in runs:
            if not run.size:
                continue
            left, right = int(run[0]), int(run[-1]) + 1
            area = np.argwhere(ink[:, left:right])
            if len(area) < 100 or np.ptp(area[:, 0]) < 32:
                continue
            start_x = left + x0
            height = int(np.ptp(area[:, 0]) + 1)
            if not (595 <= start_x <= 1800 and height >= 70):
                continue
            raw = crop_ink(ink[:, left:right])
            row.append({
                "crop": raw,
                "bbox": [start_x, band_y0, int(raw.shape[1]), int(raw.shape[0])],
            })

        # The only target-page segmentation merge: p37 line 3, C+W at x1072.
        # The split is fixed by the two-column source-ink valley, not plaintext.
        if page == 37 and len(rows) == 2:
            candidates = [
                i for i, item in enumerate(row)
                if item["bbox"][0] == 1072 and item["bbox"][2] == 88
            ]
            if len(candidates) != 1:
                raise AssertionError(("expected one p37 line3 merged C+W crop", row))
            idx = candidates[0]
            item = row[idx]
            split_x = 1126
            valley_counts = (gray[band_y0:band_y1 + 1, 1124:1126] < 110).sum(axis=0)
            if valley_counts.tolist() != [2, 2]:
                raise AssertionError(("p37 line3 source valley changed", valley_counts.tolist()))
            split_at = split_x - item["bbox"][0]
            left_crop = crop_ink(item["crop"][:, :split_at])
            right_crop = crop_ink(item["crop"][:, split_at:])
            row[idx:idx + 1] = [
                {"crop": left_crop, "bbox": [1072, band_y0, left_crop.shape[1], left_crop.shape[0]]},
                {"crop": right_crop, "bbox": [1126, band_y0, right_crop.shape[1], right_crop.shape[0]]},
            ]
            exceptions.append({
                "page": 37,
                "line_1based": 3,
                "merged_bbox_xywh": item["bbox"],
                "split_x": split_x,
                "split_glyph_index_0based": idx,
                "valley_columns": [1124, 1125],
                "valley_dark_pixel_counts": valley_counts.astype(int).tolist(),
            })
        if row:
            rows.append(row)
    return rows, exceptions


def feature(glyph: np.ndarray) -> np.ndarray:
    canvas = np.zeros((100, 100), dtype=np.uint8)
    h, w = glyph.shape
    canvas[:min(h, 100), :min(w, 100)] = glyph[:100, :100].astype(np.uint8) * 255
    resized = Image.fromarray(canvas).resize((50, 50), resample=Image.Resampling.BOX)
    return np.asarray(resized, dtype=np.float32).ravel() / 255


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--transcription", type=Path, default=Path("resources/lp2-transcription.txt"))
    ap.add_argument("--image-dir", type=Path, default=Path("resources/liber-primus"))
    ap.add_argument("--output", type=Path)
    args = ap.parse_args()
    pages = args.transcription.read_text(encoding="utf-8").split("%")
    if len(pages) < 44:
        raise SystemExit(f"expected at least 44 transcription pages, got {len(pages)}")

    # Single source-checked reference page; no target p36-p38 labels enter training.
    train_rows, _ = glyph_rows(43, args.image_dir)
    train_text = source_lines(pages[43])
    if [len(r) for r in train_rows] != [
        sum(ch in RUNE_INDEX for ch in line) for line in train_text
    ]:
        raise AssertionError("p43 image segmentation does not match reference line counts")
    train_features = np.stack([
        feature(item["crop"]) for row in train_rows for item in row
    ])
    train_labels = np.array([
        RUNE_INDEX[ch] for line in train_text for ch in line if ch in RUNE_INDEX
    ])
    if len(train_labels) != len(train_features) or len(train_labels) != 274:
        raise AssertionError((len(train_labels), len(train_features)))
    norms = (train_features * train_features).sum(axis=1)
    loo_dist = norms[:, None] + norms[None, :] - 2 * (train_features @ train_features.T)
    np.fill_diagonal(loo_dist, np.inf)
    loo_pred = train_labels[np.argmin(loo_dist, axis=1)]
    loo_matches = int((loo_pred == train_labels).sum())

    def classify(crop: np.ndarray) -> tuple[int, float]:
        v = feature(crop)
        distances = (v * v).sum() + norms - 2 * (train_features @ v)
        best = int(np.argmin(distances))
        return int(train_labels[best]), float(distances[best])

    page_data = {}
    exceptions = []
    for page in (36, 37, 38):
        observed, page_exceptions = glyph_rows(page, args.image_dir)
        expected = source_lines(pages[page])
        if len(observed) != len(expected):
            raise AssertionError((page, "line count", len(observed), len(expected)))
        exceptions.extend(page_exceptions)
        line_records = []
        for line_no, (items, raw_line) in enumerate(zip(observed, expected), 1):
            if page == 36 and line_no < 6:
                continue
            if page == 38 and line_no > 9:
                continue
            expected_runes = [ch for ch in raw_line if ch in RUNE_INDEX]
            predictions = [classify(item["crop"]) for item in items]
            readback = [RUNES[pred] for pred, _ in predictions]
            if len(readback) != len(expected_runes):
                raise AssertionError((page, line_no, len(readback), len(expected_runes)))
            mismatch_positions = [
                i for i, (a, b) in enumerate(zip(expected_runes, readback)) if a != b
            ]
            line_records.append({
                "page": page,
                "scan": page + 17,
                "line_1based": line_no,
                "source_text_with_word_boundaries": raw_line,
                "expected_runes": "".join(expected_runes),
                "image_readback_runes": "".join(readback),
                "rune_count": len(expected_runes),
                "exact_match": not mismatch_positions,
                "mismatch_positions_0based": mismatch_positions,
                "max_nearest_template_distance": round(
                    max((d for _, d in predictions), default=0), 5
                ),
                **({
                    "glyph_readback": [
                        {
                            "x": item["bbox"][0],
                            "rune": RUNES[pred],
                            "nearest_distance": round(distance, 5),
                        }
                        for item, (pred, distance) in zip(items, predictions)
                    ]
                } if page == 37 and line_no == 3 else {}),
            })
        page_data[str(page)] = line_records

    groups = [
        (1, [(36, 6, 11)]),
        (2, [(37, 1, 4)]),
        (3, [(37, 5, 9)]),
        (4, [(37, 10, 11), (38, 1, 3)]),
        (5, [(38, 4, 9)]),
    ]
    paragraphs = []
    for number, spans in groups:
        lines = []
        for page, first, last in spans:
            lines.extend([
                r for r in page_data[str(page)]
                if first <= r["line_1based"] <= last
            ])
        expected_stream = "".join(r["expected_runes"] for r in lines)
        readback_stream = "".join(r["image_readback_runes"] for r in lines)
        paragraphs.append({
            "number": number,
            "source_pages": sorted({r["page"] for r in lines}),
            "printed_lines": len(lines),
            "rune_count": len(expected_stream),
            "source_rune_stream": expected_stream,
            "image_readback_rune_stream": readback_stream,
            "exact_match": expected_stream == readback_stream,
        })

    target_total = sum(p["rune_count"] for p in paragraphs)
    target_matches = sum(
        sum(a == b for a, b in zip(p["source_rune_stream"], p["image_readback_rune_stream"]))
        for p in paragraphs
    )
    if exceptions:
        line3 = next(r for r in page_data["37"] if r["line_1based"] == 3)
        split_index = exceptions[0]["split_glyph_index_0based"]
        exceptions[0]["split_glyph_readback"] = line3["glyph_readback"][split_index:split_index + 2]

    result = {
        "title": "LP2 five numbered cuneiform passages: image-only glyph readback",
        "method": "p43-only nearest-template classifier, 50x50 BOX features; target p36-p38 labels are not used for training",
        "training": {
            "physical_page": 43,
            "scan": 60,
            "glyphs": len(train_labels),
            "distinct_symbols": len(set(train_labels)),
            "leave_one_out_exact": loo_matches,
            "leave_one_out_total": len(train_labels),
        },
        "segmentation_exceptions": exceptions,
        "paragraphs": paragraphs,
        "target_total_runes": target_total,
        "target_image_readback_matches": target_matches,
        "target_exact_match": target_total == 553 and target_matches == 553,
        "line_records": [r for page in ("36", "37", "38") for r in page_data[page]],
        "boundary_note": "Rune identities are image-readback tested. Original line positions and red labels are source-image checked; hyphen/full-stop word boundaries are retained from the canonical physical-line transcription, not independently classified by this glyph model.",
    }
    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    if not result["target_exact_match"]:
        raise SystemExit("553-rune source readback did not match exactly")


if __name__ == "__main__":
    main()
