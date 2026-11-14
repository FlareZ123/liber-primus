#!/usr/bin/env python3
"""Source-native allograph screen for the 26 GP classes outside the A/R/E SFT.

Uses the existing 169-site manual original-ink manifest.  It does not infer
glyph identities from OCR: every sample is checked against the source
transcription's (page, line, rune-index) address before image extraction.
Only component-ink placements enter the quantitative screen; manual-ink
placements are listed as explicit exclusions.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
from collections import defaultdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "im-results" / "lp2-original-ink-critical-sites.tsv"
TRANSCRIPTION = ROOT / "resources" / "lp2-transcription.txt"
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
IMAGE_DIR = ROOT / "resources" / "liber-primus"


def source_index(runes: list[str]) -> dict[tuple[int, int, int], str]:
    raw = TRANSCRIPTION.read_text(encoding="utf-8")
    pages = raw.split("%")
    allowed = set(runes)
    out: dict[tuple[int, int, int], str] = {}
    for q, page_text in enumerate(pages[:55]):
        physical = q if q < 50 else q + 1
        line_no = 0
        rune_no = 0
        for ch in page_text:
            if ch == "\n":
                line_no += 1
                rune_no = 0
            elif ch in allowed:
                out[(physical, line_no, rune_no)] = ch
                rune_no += 1
    return out


def extract_component(gray: np.ndarray, cx: int, cy: int, threshold: int):
    height, width = gray.shape
    x0, x1 = max(0, cx - 85), min(width, cx + 86)
    y0, y1 = max(0, cy - 75), min(height, cy + 76)
    roi = (gray[y0:y1, x0:x1] < threshold).astype(np.uint8)
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(roi, 8)
    candidates = []
    local_x, local_y = cx - x0, cy - y0
    for k in range(1, n):
        bx, by, bw, bh, area = [int(v) for v in stats[k]]
        if area < 180 or bh < 60 or bw < 10:
            continue
        contains = bx <= local_x < bx + bw and by <= local_y < by + bh
        dx = float(centroids[k][0] + x0 - cx)
        dy = float(centroids[k][1] + y0 - cy)
        distance = math.hypot(dx, dy)
        if not contains and distance > 28:
            continue
        # Prefer a component whose bounding box contains the manually audited
        # glyph centre; then prefer the closest centroid and a normal glyph width.
        score = distance - (18.0 if contains else 0.0) + max(0, bw - 65) * 0.7
        candidates.append((score, k, bx, by, bw, bh, area))
    if not candidates:
        return None, "no-nearby-component"
    candidates.sort()
    _, k, bx, by, bw, bh, area = candidates[0]
    if bw > 82:
        return None, "merged-or-wide-component"
    if bh > 140:
        return None, "oversize-component"
    comp = (labels[by:by + bh, bx:bx + bw] == k).astype(np.uint8)
    if comp.sum() < 180:
        return None, "low-ink-component"
    # A one-pixel white margin keeps normalization stable.
    padded = np.pad(comp, 1, constant_values=0)
    return {
        "mask": padded,
        "bbox": [x0 + bx, y0 + by, bw, bh],
        "area": int(comp.sum()),
        "centroid_distance": float(math.hypot(
            centroids[k][0] + x0 - cx, centroids[k][1] + y0 - cy
        )),
    }, None


def normalize_mask(mask: np.ndarray, out_w: int = 64, out_h: int = 96) -> np.ndarray:
    ys, xs = np.where(mask > 0)
    if len(xs) == 0:
        return np.zeros((out_h, out_w), dtype=np.uint8)
    tight = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = tight.shape
    scale = min((out_h - 4) / h, (out_w - 4) / w)
    nw = max(1, int(round(w * scale)))
    nh = max(1, int(round(h * scale)))
    resized = cv2.resize(tight, (nw, nh), interpolation=cv2.INTER_NEAREST)
    canvas = np.zeros((out_h, out_w), dtype=np.uint8)
    xoff = (out_w - nw) // 2
    yoff = (out_h - nh) // 2
    canvas[yoff:yoff + nh, xoff:xoff + nw] = (resized > 0).astype(np.uint8)
    return canvas


def shifted_iou(a: np.ndarray, b: np.ndarray, radius: int = 3) -> float:
    best = 0.0
    h, w = a.shape
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            shifted = np.zeros_like(b)
            sx0, sx1 = max(0, dx), min(w, w + dx)
            sy0, sy1 = max(0, dy), min(h, h + dy)
            tx0, tx1 = max(0, -dx), min(w, w - dx)
            ty0, ty1 = max(0, -dy), min(h, h - dy)
            shifted[ty0:ty1, tx0:tx1] = b[sy0:sy1, sx0:sx1]
            inter = int(np.logical_and(a, shifted).sum())
            union = int(np.logical_or(a, shifted).sum())
            if union:
                best = max(best, inter / union)
    return best


def pairwise_stats(samples: list[dict], cutoff: float):
    if len(samples) < 2:
        return {"pairs": 0, "min_iou": None, "median_iou": None,
                "cross_page_min_iou": None, "cross_page_median_iou": None,
                "clusters_at_cutoff": [len(samples)] if samples else []}
    all_scores, cross_scores = [], []
    n = len(samples)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for i in range(n):
        for j in range(i + 1, n):
            score = shifted_iou(samples[i]["normalized"], samples[j]["normalized"])
            all_scores.append(score)
            if samples[i]["page"] != samples[j]["page"]:
                cross_scores.append(score)
            if score >= cutoff:
                union(i, j)
    cluster_sizes = sorted(
        [sum(1 for i in range(n) if find(i) == root)
         for root in {find(i) for i in range(n)}],
        reverse=True
    )
    return {
        "pairs": len(all_scores),
        "min_iou": round(float(min(all_scores)), 4),
        "median_iou": round(float(np.median(all_scores)), 4),
        "cross_page_min_iou": round(float(min(cross_scores)), 4) if cross_scores else None,
        "cross_page_median_iou": round(float(np.median(cross_scores)), 4) if cross_scores else None,
        "clusters_at_cutoff": cluster_sizes,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", default="im-results/lp2-26-class-allograph-gate")
    parser.add_argument("--threshold", type=int, default=170)
    parser.add_argument("--cluster-iou", type=float, default=0.72)
    args = parser.parse_args()

    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    runes = corpus["runes"]
    rune_index = {r: i for i, r in enumerate(runes)}
    positions = source_index(runes)

    with MANIFEST.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f, delimiter="\t"))

    current_archive = None
    current_rgb = None
    current_gray = None
    samples_by_rune = defaultdict(list)
    doublet_controls = []
    failures = []
    manual_excluded = []
    source_checks = 0

    for row in rows:
        page = int(row["physical_page"])
        line = int(row["line0"])
        index = int(row["index0"])
        rune = row["gp_rune"]
        if positions.get((page, line, index)) != rune:
            raise ValueError(
                f"Source transcription mismatch: site={row['site_id']} "
                f"page={page} line={line} index={index} rune={rune!r} "
                f"got={positions.get((page, line, index))!r}"
            )
        if row["kind"] == "D" and positions.get((page, line, index + 1)) != rune:
            raise ValueError(f"Doublet source mismatch at {row['site_id']}")
        source_checks += 1

        if row["placement"] != "component-ink":
            manual_excluded.append({
                "site_id": row["site_id"], "page": page, "rune": rune,
                "placement": row["placement"], "kind": row["kind"],
            })
            continue

        archive = row["archive_jpeg"]
        if archive != current_archive:
            path = IMAGE_DIR / archive
            current_rgb = np.asarray(Image.open(path).convert("RGB"))
            current_gray = cv2.cvtColor(current_rgb, cv2.COLOR_RGB2GRAY)
            current_archive = archive
        rgb, gray = current_rgb, current_gray
        centers = [(int(row["x1"]), int(row["y1"]))]
        if row["kind"] == "D":
            centers.append((int(row["x2"]), int(row["y2"])))

        pair_samples = []
        for ordinal, (cx, cy) in enumerate(centers, start=1):
            extracted, reason = extract_component(gray, cx, cy, args.threshold)
            if extracted is None:
                failures.append({
                    "site_id": row["site_id"], "ordinal": ordinal,
                    "page": page, "rune": rune, "reason": reason,
                    "center": [cx, cy],
                })
                continue
            x, y, w, h = extracted["bbox"]
            component_mask = extracted["mask"]
            normalized = normalize_mask(component_mask)
            # Color is measured only over selected component pixels.
            comp = component_mask[1:-1, 1:-1].astype(bool)
            patch = rgb[y:y + h, x:x + w]
            pixels = patch[comp] if patch.shape[:2] == comp.shape else np.empty((0, 3))
            if len(pixels):
                mean_rgb = pixels.mean(axis=0)
                color = "red" if mean_rgb[0] > mean_rgb[1] * 1.35 and mean_rgb[0] > mean_rgb[2] * 1.25 else "dark"
            else:
                color = "unknown"
            sample = {
                "site_id": row["site_id"], "kind": row["kind"],
                "page": page, "rune": rune, "transliteration": row["transliteration"],
                "ordinal": ordinal, "bbox": extracted["bbox"],
                "width": w, "height": h, "area": extracted["area"],
                "color": color, "normalized": normalized,
            }
            samples_by_rune[rune].append(sample)
            pair_samples.append(sample)

        if row["kind"] == "D" and len(pair_samples) == 2:
            observed = shifted_iou(pair_samples[0]["normalized"], pair_samples[1]["normalized"])
            recorded = float(row["iou"]) if row.get("iou") else None
            doublet_controls.append({
                "site_id": row["site_id"], "rune": rune, "page": page,
                "recorded_iou": recorded, "recomputed_iou": round(observed, 4),
                "abs_error": round(abs(observed - recorded), 4) if recorded is not None else None,
            })

    out_dir = ROOT / args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    class_rows = []
    for rune in runes:
        samples = samples_by_rune.get(rune, [])
        stats = pairwise_stats(samples, args.cluster_iou)
        counts = {
            "n": len(samples),
            "pages": sorted({s["page"] for s in samples}),
            "page_count": len({s["page"] for s in samples}),
            "colors": dict(sorted(
                {c: sum(1 for s in samples if s["color"] == c)
                 for c in {s["color"] for s in samples}}.items()
            )),
            "size_range": {
                "width": [min((s["width"] for s in samples), default=0),
                          max((s["width"] for s in samples), default=0)],
                "height": [min((s["height"] for s in samples), default=0),
                           max((s["height"] for s in samples), default=0)],
            },
        }
        clusters = stats["clusters_at_cutoff"]
        split = sum(1 for n in clusters if n >= 2) >= 2
        low_pair = stats["min_iou"] is not None and stats["min_iou"] < args.cluster_iou
        class_row = {
            "rune": rune, "index": rune_index[rune],
            "transliteration": next(
                (s["transliteration"] for s in samples), ""
            ),
            **counts, **stats,
            "screen_flag": bool(split or (low_pair and len(samples) >= 3)),
        }
        class_rows.append(class_row)

    recorded = [x["recorded_iou"] for x in doublet_controls if x["recorded_iou"] is not None]
    recomputed = [x["recomputed_iou"] for x in doublet_controls]
    abs_errors = [x["abs_error"] for x in doublet_controls if x["abs_error"] is not None]
    summary = {
        "manifest_rows": len(rows),
        "source_positions_verified": source_checks,
        "component_ink_glyphs_extracted": sum(len(v) for v in samples_by_rune.values()),
        "manual_placements_excluded": len(manual_excluded),
        "extraction_failures": len(failures),
        "threshold": args.threshold,
        "cluster_iou_cutoff": args.cluster_iou,
        "doublet_positive_control": {
            "n": len(doublet_controls),
            "recorded_iou_min_median_max": [
                round(float(min(recorded)), 4), round(float(np.median(recorded)), 4),
                round(float(max(recorded)), 4)
            ] if recorded else None,
            "recomputed_iou_min_median_max": [
                round(float(min(recomputed)), 4), round(float(np.median(recomputed)), 4),
                round(float(max(recomputed)), 4)
            ] if recomputed else None,
            "mean_abs_error_vs_manifest": round(float(np.mean(abs_errors)), 4) if abs_errors else None,
        },
        "classes": class_rows,
        "screen_flags": [x for x in class_rows if x["screen_flag"]],
        "manual_exclusions": manual_excluded,
        "failures": failures,
        "doublet_controls": doublet_controls,
        "interpretation_limit": (
            "This is a source-located 169-site screen, not a census of every rune. "
            "A flag is a manual-review lead, not proof of an allograph; no flag is "
            "not proof that no rare form exists outside the manifest."
        ),
    }

    (out_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    with (out_dir / "instances.tsv").open("w", encoding="utf-8", newline="") as f:
        fields = ["rune", "transliteration", "page", "site_id", "kind", "ordinal",
                  "color", "x", "y", "width", "height", "area"]
        writer = csv.DictWriter(f, fieldnames=fields, delimiter="\t")
        writer.writeheader()
        for rune in runes:
            for s in samples_by_rune.get(rune, []):
                x, y, w, h = s["bbox"]
                writer.writerow({
                    "rune": rune, "transliteration": s["transliteration"],
                    "page": s["page"], "site_id": s["site_id"], "kind": s["kind"],
                    "ordinal": s["ordinal"], "color": s["color"],
                    "x": x, "y": y, "width": w, "height": h, "area": s["area"],
                })

    # Contact sheet: every extracted source glyph, grouped by GP class.
    cell_w, cell_h, label_w = 82, 122, 112
    max_samples = max((len(samples_by_rune.get(r, [])) for r in runes), default=1)
    cols = min(12, max(1, max_samples))
    atlas = Image.new("RGB", (label_w + cols * cell_w, len(runes) * cell_h), "white")
    draw = ImageDraw.Draw(atlas)
    font = ImageFont.load_default()
    for row_i, rune in enumerate(runes):
        y0 = row_i * cell_h
        samples = sorted(samples_by_rune.get(rune, []), key=lambda s: (s["page"], s["site_id"], s["ordinal"]))
        label = f"{rune} {samples[0]['transliteration'] if samples else ''}"
        draw.text((4, y0 + 8), label, fill="black", font=font)
        for col_i, sample in enumerate(samples[:cols]):
            x0 = label_w + col_i * cell_w
            glyph = Image.fromarray((1 - sample["normalized"]) * 255).convert("RGB")
            atlas.paste(glyph, (x0 + 8, y0 + 4))
            draw.text((x0 + 8, y0 + 102), f"p{sample['page']} {sample['color'][:1]}", fill="black", font=font)
    atlas.save(out_dir / "atlas.png")

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
