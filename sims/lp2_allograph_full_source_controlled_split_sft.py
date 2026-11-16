#!/usr/bin/env python3
"""Full-LP2 controlled allograph split test.

Reuses the source-locked p56/p57 templates and component extraction from
lp2_allglyph_original_allograph_sft.py. The unknown-page test is page-held-out:
odd/even physical pages alternate between feature selection and evaluation.
Synthetic no-message books resample same-rune p56/p57 forms while preserving
each target glyph's page, line, size, ink class and JPEG block phase.

The synthetic extension does not re-encode full-page JPEGs; the independent
six-page Q92-recompressed null is documented in
im-results/lp2-allograph-synthetic-no-message-control.md.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

import lp2_allglyph_original_allograph_sft as source

ROOT = source.ROOT
GP = source.GP
KERNEL = source.KERNEL
IMAGE_DIR = ROOT / "resources" / "liber-primus"
CORPUS = IMAGE_DIR / "lp2-corpus.json"


def load(page: int, mode: str = "L") -> np.ndarray:
    path = IMAGE_DIR / f"{page + 17:02d}.jpg"
    return np.asarray(Image.open(path).convert(mode))


def normalize(mask: np.ndarray) -> np.ndarray:
    ys, xs = np.where(mask)
    if not len(ys):
        return np.zeros((72, 60), dtype=bool)
    tight = mask[ys.min():ys.max()+1, xs.min():xs.max()+1].astype(np.uint8)
    h, w = tight.shape
    nw = max(1, round(w * 72 / h))
    if nw > 60:
        nw = 60
        nh = max(1, round(h * 60 / w))
    else:
        nh = 72
    interpolation = cv2.INTER_AREA if nh < h or nw < w else cv2.INTER_CUBIC
    resized = cv2.resize(tight * 255, (nw, nh), interpolation=interpolation) >= 127
    out = np.zeros((72, 60), dtype=bool)
    y0, x0 = (72 - nh) // 2, (60 - nw) // 2
    out[y0:y0+nh, x0:x0+nw] = resized
    return out


def patch_matrix(items: list[dict]) -> tuple[np.ndarray, list[tuple[int, int]]]:
    masks = np.stack([z["norm"] for z in items]).astype(np.uint8)
    values, positions = [], []
    for y in range(0, 72 - 6 + 1, 6):
        for x in range(0, 60 - 6 + 1, 6):
            values.append(masks[:, y:y+6, x:x+6].mean(axis=(1, 2)))
            positions.append((x, y))
    return np.stack(values, axis=1), positions


def centered_design(items: list[dict]) -> tuple[np.ndarray, np.ndarray, list[tuple[int, int]]]:
    values, positions = patch_matrix(items)
    residual = values.copy()
    line_groups = defaultdict(list)
    for i, z in enumerate(items):
        line_groups[(z["page"], z["line"])].append(i)
    for indices in line_groups.values():
        residual[indices] -= residual[indices].mean(axis=0, keepdims=True)

    n = len(items)
    columns = [
        np.ones(n),
        np.log(np.asarray([z["h"] for z in items], dtype=float)),
        np.log(np.asarray([z["w"] for z in items], dtype=float)),
        np.log(np.asarray([z["area"] for z in items], dtype=float)),
        np.asarray([z["color"] == "red" for z in items], dtype=float),
        np.asarray([z["x"] / 2400 for z in items], dtype=float),
    ]
    for phase_axis in (0, 1):
        phase = np.asarray([z["phase"][phase_axis] for z in items], dtype=int)
        for level in range(1, 8):
            columns.append((phase == level).astype(float))
    return residual, np.column_stack(columns), positions


def heldout_score(items: list[dict], train_parity: int) -> dict | None:
    train = [z for z in items if z["page"] % 2 == train_parity]
    test = [z for z in items if z["page"] % 2 != train_parity]
    if len(train) < 30 or len(test) < 30:
        return None

    train_values, train_design, positions = centered_design(train)
    beta = np.linalg.lstsq(train_design, train_values, rcond=None)[0]
    train_residual = train_values - train_design @ beta
    n = len(train)
    min_size = max(5, int(math.ceil(0.15 * n)))
    best = None

    for j, position in enumerate(positions):
        values = train_residual[:, j]
        order = np.argsort(values, kind="stable")
        sorted_values = values[order]
        gaps = np.diff(sorted_values)
        valid = np.arange(min_size - 1, n - min_size)
        if not len(valid):
            continue
        k = int(valid[np.argmax(gaps[valid])]) + 1
        gap = float(gaps[k - 1])
        if gap <= 0:
            continue

        lower = [train[i] for i in order[:k]]
        upper = [train[i] for i in order[k:]]
        lower_pages = {z["page"] for z in lower}
        upper_pages = {z["page"] for z in upper}
        if (len(lower_pages) < 3 or len(upper_pages) < 3
                or len(lower_pages & upper_pages) < 2):
            continue

        effect = float(sorted_values[k:].mean() - sorted_values[:k].mean())
        balance = 2 * min(k, n - k) / n
        score = effect * balance * gap
        if best is None or score > best["score"]:
            best = {
                "score": score,
                "patch": position,
                "threshold": float((sorted_values[k-1] + sorted_values[k]) / 2),
                "train_gap": gap,
                "train_effect": effect,
                "train_split": [k, n-k],
                "beta": beta[:, j],
                "feature_index": j,
            }

    if best is None:
        return None

    test_values, test_design, _ = centered_design(test)
    residual = test_values[:, best["feature_index"]] - test_design @ best["beta"]
    lower_mask = residual <= best["threshold"]
    upper_mask = ~lower_mask
    lower_pages = {test[i]["page"] for i in np.where(lower_mask)[0]}
    upper_pages = {test[i]["page"] for i in np.where(upper_mask)[0]}
    best.update({
        "test_split": [int(lower_mask.sum()), int(upper_mask.sum())],
        "test_pages": [len(lower_pages), len(upper_pages)],
        "test_shared_pages": len(lower_pages & upper_pages),
        "test_effect": float(residual[upper_mask].mean() - residual[lower_mask].mean()),
    })
    best.pop("beta")
    best.pop("feature_index")
    return best


def synthetic_book(items_by_class: dict[int, list[dict]],
                   templates_by_class: dict[int, list[np.ndarray]],
                   seed: int) -> dict[int, list[dict]]:
    rng = np.random.default_rng(seed)
    out = defaultdict(list)
    kernel = np.ones((3, 3), dtype=np.uint8)

    for cls, items in items_by_class.items():
        pool = templates_by_class[cls]
        for target in items:
            prototype = pool[int(rng.integers(0, len(pool)))]
            resized = cv2.resize(
                prototype * 255, (target["w"], target["h"]),
                interpolation=(cv2.INTER_AREA
                               if target["h"] < prototype.shape[0]
                               or target["w"] < prototype.shape[1]
                               else cv2.INTER_CUBIC),
            ) >= 127
            draw = rng.random()
            if draw < 0.10:
                resized = cv2.dilate(resized.astype(np.uint8), kernel) > 0
            elif draw < 0.20:
                resized = cv2.erode(resized.astype(np.uint8), kernel) > 0

            dx, dy = int(rng.integers(-1, 2)), int(rng.integers(-1, 2))
            shifted = np.zeros_like(resized)
            sy0, sy1 = max(0, -dy), min(target["h"], target["h"] - dy)
            sx0, sx1 = max(0, -dx), min(target["w"], target["w"] - dx)
            shifted[sy0+dy:sy1+dy, sx0+dx:sx1+dx] = resized[sy0:sy1, sx0:sx1]

            sample = {k: target[k] for k in
                      ("page", "cls", "x", "h", "w", "area", "line", "color", "phase")}
            sample["norm"] = normalize(shifted)
            out[cls].append(sample)
    return out


def run(args: argparse.Namespace) -> dict:
    corpus = json.loads(args.corpus.read_text(encoding="utf-8"))
    originals = [page["indices"] for page in corpus["pages"]]
    assert len(originals) == 58 and sum(map(len, originals)) == 13136

    templates = source.baseline(load)
    template_class = np.asarray([t["cls"] for t in templates], dtype=int)
    reference = np.stack([t["feature"] for t in templates], axis=1)
    templates_by_class = defaultdict(list)
    for template in templates:
        ys, xs = np.where(template["img"])
        crop = template["img"][ys.min():ys.max()+1, xs.min():xs.max()+1].astype(np.uint8)
        templates_by_class[template["cls"]].append(crop)

    mapped_count = exact_count = substitution_count = unaligned_count = insertion_count = 0
    candidate_count = morphology_matches = 0
    items_by_class = defaultdict(list)
    page_dimensions, quant_tables = set(), []

    for page in range(58):
        path = IMAGE_DIR / f"{page + 17:02d}.jpg"
        image = load(page)
        rgb = load(page, "RGB")
        with Image.open(path) as pil:
            page_dimensions.add(pil.size)
            quant_tables.append(tuple(pil.quantization[0]))

        boxes = [b for b in source.components(image, (440, 440, 2100, 3250))
                 if 80 <= b[3] <= 122 and 7 <= b[2] <= 110 and b[4] > 160]
        rows, features = [], []
        for x, y, w, h, area in boxes:
            mask = (image[y:y+h, x:x+w] < 160).astype(np.uint8)
            full, feature = source.vector(mask)
            rows.append({"x": x, "y": y, "w": w, "h": h, "area": area,
                         "mask": mask, "full": full, "dil": cv2.dilate(full, KERNEL)})
            features.append(feature)
        candidate_count += len(rows)
        if not rows:
            continue

        scores = np.stack(features) @ reference
        predicted = template_class[np.argmax(scores, axis=1)]
        for row, cls in zip(rows, predicted):
            row["predicted"] = int(cls)

        ordered_indices = sorted(range(len(rows)),
                                 key=lambda i: (round(rows[i]["y"] / 188), rows[i]["x"]))
        predicted_sequence = [rows[i]["predicted"] for i in ordered_indices]
        matcher = SequenceMatcher(None, originals[page], predicted_sequence, autojunk=False)
        aligned = {}
        exact_page = substitutions_page = 0
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "equal":
                exact_page += i2 - i1
                for k in range(i2 - i1):
                    aligned[ordered_indices[j1+k]] = originals[page][i1+k]
            elif tag == "replace" and i2 - i1 == j2 - j1:
                substitutions_page += i2 - i1
                for k in range(i2 - i1):
                    aligned[ordered_indices[j1+k]] = originals[page][i1+k]

        exact_count += exact_page
        substitution_count += substitutions_page
        unaligned_count += len(originals[page]) - exact_page - substitutions_page
        insertion_count += len(rows) - exact_page - substitutions_page
        mapped_count += len(aligned)

        for row_index, cls in aligned.items():
            row = rows[row_index]
            matching = [t for t in templates if t["cls"] == cls]
            residual = min(source.distance(row["full"], row["dil"], t["img"], t["dil"])
                           for t in matching)
            if residual > 0.03:
                continue
            morphology_matches += 1
            if page >= 56:
                continue

            crop_rgb = rgb[row["y"]:row["y"]+row["h"], row["x"]:row["x"]+row["w"]]
            red = ((crop_rgb[:, :, 0].astype(int) > crop_rgb[:, :, 1].astype(int) + 40)
                   & (crop_rgb[:, :, 0].astype(int) > crop_rgb[:, :, 2].astype(int) + 40)
                   & (crop_rgb[:, :, 0] > 100))
            color = "red" if red.sum() > max(3, 0.02 * red.size) else "black"
            items_by_class[cls].append({
                "page": page, "cls": cls, "x": row["x"], "y": row["y"],
                "w": row["w"], "h": row["h"], "area": row["area"],
                "line": round(row["y"] / 188), "color": color,
                "phase": (row["x"] % 8, row["y"] % 8),
                "norm": normalize(row["mask"]),
            })

    assert candidate_count == 13083, candidate_count
    assert mapped_count == 13041, mapped_count
    assert exact_count == 13039, exact_count
    assert substitution_count == 2, substitution_count
    assert morphology_matches == 12963, morphology_matches
    assert len(quant_tables) == 58 and len(set(quant_tables)) == 1
    assert page_dimensions == {(2400, 3600)}
    assert len(items_by_class) == 29

    observed = []
    for cls, items in items_by_class.items():
        for parity in (0, 1):
            result = heldout_score(items, parity)
            if result:
                observed.append((result["score"], cls, parity, result))
    best = max(observed, key=lambda x: x[0])

    null_maxima = []
    for rep in range(args.null_reps):
        synthetic = synthetic_book(items_by_class, templates_by_class, args.seed + rep)
        scores = []
        for cls, items in synthetic.items():
            for parity in (0, 1):
                result = heldout_score(items, parity)
                if result:
                    scores.append((result["score"], cls, parity, result))
        null_maxima.append(max(scores, key=lambda x: x[0])[0])

    exceedances = sum(value >= best[0] for value in null_maxima)
    return {
        "images": 58,
        "dimensions": [2400, 3600],
        "identical_luma_qtable": True,
        "luma_qtable_sha256": hashlib.sha256(bytes(quant_tables[0])).hexdigest(),
        "source_templates": len(templates),
        "source_template_classes": len(templates_by_class),
        "candidate_components": candidate_count,
        "source_mapped_candidates": mapped_count,
        "source_exact_matches": exact_count,
        "source_substitutions": substitution_count,
        "source_unaligned": unaligned_count,
        "candidate_insertions": insertion_count,
        "morphology_matches_all_58": morphology_matches,
        "unknown_clean_glyphs_p0_p55": sum(map(len, items_by_class.values())),
        "unknown_clean_red_glyphs": sum(z["color"] == "red"
                                        for items in items_by_class.values() for z in items),
        "rune_class_counts_p0_p55": [len(items_by_class[i]) for i in range(29)],
        "observed_familywise_best": {
            "score": best[0], "class": best[1], "rune": GP[best[1]],
            "train_page_parity": best[2],
            **best[3],
        },
        "null_model": {
            "type": "same-rune p56/p57 prototype resampling; target page/line/size/ink/x-position/JPEG phase retained; ±1 px jitter; 10% dilation and 10% erosion",
            "full_page_jpeg_reencode": False,
            "seed": args.seed,
            "replicates": args.null_reps,
            "maxima": null_maxima,
            "minimum": min(null_maxima),
            "median": float(np.median(null_maxima)),
            "maximum": max(null_maxima),
            "exceedances_ge_observed": exceedances,
            "plus_one_p": (1 + exceedances) / (1 + args.null_reps),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, default=CORPUS)
    parser.add_argument("--null-reps", type=int, default=20)
    parser.add_argument("--seed", type=int, default=4401)
    args = parser.parse_args()
    print(json.dumps(run(args), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
