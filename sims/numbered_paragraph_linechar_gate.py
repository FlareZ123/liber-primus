#!/usr/bin/env python3
"""Source-locked test of the numbered-paragraph line:character hypothesis.

Reads resources/lp2-transcription.txt and original LP2 JPEG scans 53-55.
The sole frozen candidate is: for numbered paragraph n, take its n-th printed
line and n-th GP rune (one-based), excluding the red paragraph label. The
wrong-margin control counts that red label as a character on the first line.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import numpy as np
from PIL import Image

GP = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᛠᚪᚫᚣᛡ"
GP_LATIN = [
    "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J", "EI",
    "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D", "EA", "A",
    "AE", "Y", "IO",
]
GP_MAP = dict(zip(GP, GP_LATIN))
RUNE_RE = re.compile(r"[\u16A0-\u16FF]")


def nonmarker_lines(page: str) -> list[str]:
    return [
        line.strip()
        for line in page.splitlines()
        if line.strip() and line.strip() not in {"&", "$", "%"}
    ]


def paragraph_lines(pages: list[str]) -> list[list[str]]:
    p36, p37, p38 = (nonmarker_lines(pages[i]) for i in (36, 37, 38))
    # The transcription's numeral-hyphen prefix represents a red margin label;
    # that hyphen is not a printed GP separator.
    return [
        p36[5:11],
        p37[0:4],
        p37[4:9],
        p37[9:11] + p38[0:3],
        p38[3:9],
    ]


def selected(paras: list[list[str]]) -> list[dict]:
    rows = []
    for n, para in enumerate(paras, 1):
        assert len(para) >= n, (n, len(para))
        line = para[n - 1]
        # Remove the red numeral and transcript-only delimiter on the first line.
        body_line = re.sub(rf"^{n}-", "", line, count=1)
        runes = RUNE_RE.findall(body_line)
        rune = runes[n - 1] if len(runes) >= n else None
        rows.append({
            "paragraph": n,
            "line_in_paragraph": n,
            "rune_column": n,
            "physical_page_lines": len(para),
            "selected_line": line,
            "selected_rune": rune,
            "selected_gp_latin": GP_MAP.get(rune),
        })
    return rows


def line_bands(gray: np.ndarray) -> list[tuple[int, int]]:
    crop = gray[450:3250, 580:1850]
    density = (crop < 135).sum(axis=1)
    rows = np.where(density > 35)[0]
    bands = []
    if len(rows):
        start = prev = int(rows[0])
        for y in rows[1:]:
            y = int(y)
            if y - prev > 25:
                if prev - start + 1 >= 46:
                    bands.append((start + 450, prev + 450))
                start = y
            prev = y
        if prev - start + 1 >= 46:
            bands.append((start + 450, prev + 450))
    return [(a, b) for a, b in bands if a >= 600]


def image_label_audit(image_dir: Path) -> list[dict]:
    expected = {
        53: (11, [6]),
        54: (11, [1, 5, 10]),
        55: (11, [4]),
    }
    out = []
    for scan, (expected_text_lines, expected_lines) in expected.items():
        rgb = np.asarray(Image.open(image_dir / f"{scan:02d}.jpg").convert("RGB"))
        red = (
            (rgb[:, :, 0] > 140)
            & (rgb[:, :, 0] > rgb[:, :, 1] * 1.45)
            & (rgb[:, :, 0] > rgb[:, :, 2] * 1.35)
            & (rgb[:, :, 1] < 160)
            & (rgb[:, :, 2] < 160)
        )
        # Group red pixels by vertical runs in the left text margin. Tiny dot
        # punctuation is excluded by the fixed height threshold.
        row_counts = red[450:3200, 500:800].sum(axis=1)
        active = np.where(row_counts > 0)[0]
        row_bands = []
        if len(active):
            start = prev = int(active[0])
            for y in active[1:]:
                y = int(y)
                if y - prev > 10:
                    if prev - start + 1 > 80:
                        row_bands.append((start + 450, prev + 450))
                    start = y
                prev = y
            if prev - start + 1 > 80:
                row_bands.append((start + 450, prev + 450))
        components = []
        for y0, y1 in row_bands:
            ys, xs = np.where(red[y0:y1 + 1, 500:800])
            if len(xs):
                components.append((
                    int(xs.min() + 500),
                    int(y0),
                    int(xs.max() - xs.min() + 1),
                    int(y1 - y0 + 1),
                ))
        components.sort(key=lambda x: x[1])

        gray = np.asarray(Image.open(image_dir / f"{scan:02d}.jpg").convert("L"))
        bands = line_bands(gray)
        if len(components) != len(expected_lines):
            raise AssertionError((scan, components, expected_lines))
        if len(bands) != expected_text_lines:
            raise AssertionError((scan, len(bands), expected_text_lines, bands))

        for (x, y, w, h), line_no in zip(components, expected_lines):
            center_y = y + h / 2
            band_y = bands[line_no - 1]
            if not (band_y[0] - 20 <= center_y <= band_y[1] + 20):
                raise AssertionError((scan, center_y, line_no, band_y))

            # Exclude red ink and measure the first black body-glyph column.
            def black_start(band):
                y0, y1 = band
                pix = (
                    (gray[y0:y1 + 1, 580:1850] < 135)
                    & (~red[y0:y1 + 1, 580:1850])
                )
                xd = pix.sum(axis=0)
                xs = np.where(xd >= 3)[0]
                return int(xs[0] + 580) if len(xs) else None

            body_start = black_start(band_y)
            continuation_start = (
                black_start(bands[line_no]) if line_no < len(bands) else None
            )
            out.append({
                "scan": scan,
                "physical_lp2_page": scan - 17,
                "printed_text_line_count": len(bands),
                "red_label_bbox_xywh": [x, y, w, h],
                "red_label_line_1based": line_no,
                "body_rune_start_x": body_start,
                "next_line_start_x": continuation_start,
            })
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--transcription",
        type=Path,
        default=Path("resources/lp2-transcription.txt"),
    )
    ap.add_argument(
        "--image-dir",
        type=Path,
        default=Path("resources/liber-primus"),
    )
    args = ap.parse_args()
    pages = args.transcription.read_text(encoding="utf-8").split("%")
    if len(pages) < 56:
        raise SystemExit(f"expected at least 56 LP2 pages, got {len(pages)}")

    paras = paragraph_lines(pages)
    rows = selected(paras)
    # Counting the red margin numeral as character 1 is the frozen wrong-margin
    # control; the numeral is not a member of GP29.
    wrong_margin = ["1"] + [r["selected_gp_latin"] for r in rows[1:]]
    image = image_label_audit(args.image_dir)
    print(json.dumps({
        "cue": "five red Arabic paragraph labels 1-5 on physical LP2 pages 36-38",
        "paragraph_line_counts": [len(p) for p in paras],
        "paragraph_start_lines_1based": [6, 1, 5, 10, 4],
        "frozen_rule": (
            "paragraph n -> line n, GP-rune column n; one-based; "
            "exclude red margin label"
        ),
        "readout": rows,
        "readout_gp_latin": " ".join(r["selected_gp_latin"] or "?" for r in rows),
        "held_out_page_prediction": {
            "physical_lp2_page": 38,
            "paragraph": 5,
            "line_in_paragraph": 5,
            "rune_column": 5,
            "rune": rows[4]["selected_rune"],
            "gp_latin": rows[4]["selected_gp_latin"],
            "evidence_level": "within-study holdout; not research-wide blind",
        },
        "wrong_margin_control_gp_latin": " ".join(wrong_margin),
        "original_jpeg_label_audit": image,
        "decision": (
            "bounded negative: paragraph labels do not supply a "
            "source-selected line:character grammar or key"
        ),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
