"""Cross-package ordinary-rune rendering gate on original LP1/LP2 JPEGs.

Requires Python 3, NumPy, Pillow and OpenCV.
Run from the repository:
    python sims/lp1_lp2_ordinary_glyph_rendering_gate.py
Or point to the maintainer's full original-image archive:
    python sims/lp1_lp2_ordinary_glyph_rendering_gate.py --archive /path/to/liber-primus-jpegs.zip

The test compares only ordinary black glyphs. Red rubrication, punctuation,
oversized initials, illustrations and rows that cannot be aligned one-to-one
with the pinned source transcription are excluded before classification.
"""
from collections import defaultdict
from hashlib import sha256
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
import argparse
import json

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
AB = "0123456789abcdefghijklmnopqrs"  # one ASCII character per GP29 index

# Source transcription rows, encoded through AB. Line order is top-to-bottom.
P3 = [
    "1slfc054c16dss07e", "g5ksqjscg59pljr", "rjj7pdnlr43srja00",
    "i1lc1pqd4padp5pp97hejn", "4ra0d5ccp542d0bj3c57rhp7",
    "hskf4qbp4j52cpg5d7j6c5", "ld1c54i7rdahqhe0ka44j56",
    "hq45012drb7g0sb6hp200s", "d2d0oebjidlf3fj7cbk7e12",
    "p7j2nqb5fre3l4jh74janqb", "5e81qdkblqj0bdc1r7cbn",
    "7e1okofjrcepjrjadqpj10",
]
P4 = [
    "jqqcpe4bfii79nb1feqg", "igjc4qnf9ipnrdh19slbr",
    "pb6hd2ed977akjpkdh13sr4", "rs044cbj4janqb8k01b1rk2",
    "scb3c44j1jf5sckapp5k7ak", "gdi1dsrd2ghgji1k3kicb",
    "d1sk56s6frgj", "hj420d74b4e5lbsmbi", "qjnqb5pr10d0o55s4",
    "1b4ojhd6dh19sl09ei", "q6asl1jg56ssbphd7n0q",
    "ep10cbdek2sok25q1r", "5ikpcae2fp8p2q0k5i4d0oe4hip5h0",
]
P14 = [
    "of7oad1mpd0i4fdd2j9o4", "k7di3d1saa8nkmsbi",
    "sap6i2manml0binae91", "k0847dnr87f5en8rirs4",
    "eich7sfhkn7d5p37enoobs", "7qs5bo5j9dg38jdj5r44o",
    "krah0fd5lj57ajjao8ql5mh", "sca479hrojmda3s5se",
    "9kg8hrkc1o8q6ig61cmrp", "ornim4p0f7rqjfqojrg46i",
    "9okrjdfqm438jdj5r44gdh",
]
P32 = [
    "k2p7p1dr57l87hjfmiarm728h", "r4g2003283jie7nfk0nlhcr",
    "ko7n9pegqj627er27hf4ere", "o1h8s7l18clrsbfd2gml3",
    "jh1nfhbs4mi99761ko3q1g", "0bgo6hc",
]
P55 = [
    "lpja7fhejfc6n2p0roh5174h", "s0eaj15d8lkcjfnrd0h8c5",
    "cisia6e6fifc22if2m5saj", "5enb1hia",
]

# Original scan row origins used by the existing F-glyph/typography studies.
Y = {
    3:  [680, 860, 1040, 1240, 1420, 1620, 1800, 2000, 2180, 2360, 2560, 2740],
    4:  [680, 860, 1040, 1240, 1420, 1620, 1800, 2040, 2240, 2420, 2620, 2800, 2950],
    14: [680, 860, 1080, 1280, 1500, 1680, 1880, 2100, 2320, 2540, 2740],
    49: [673 + 188 * i for i in range(6)],
    72: [673 + 188 * i for i in range(4)],
}
# Exact-count rows only. This excludes the large red initials, their overlap
# into adjacent lines, red footer text, and lines with ambiguous segmentation.
SELECTED = {
    3: [3, 5, 6, 7, 8, 9, 10, 11],
    4: [2, 3, 5, 6, 10, 11],
    14: list(range(1, 11)),
    49: list(range(6)),
    72: list(range(4)),
}
# LP1 p14's oversized red initial overlaps rows 1–2; crop after it.
XLO = {(14, 1): 750, (14, 2): 750}
# LP2 p55's final line ends before the tree illustration.
XMAX = {(72, 3): 1032}


def read_source(image_number, archive):
    if archive is not None:
        raw = archive.read(f"liber-primus-jpegs/{image_number:02}.jpg")
    else:
        raw = (ROOT / "resources/liber-primus" / f"{image_number:02}.jpg").read_bytes()
    rgb = np.array(Image.open(BytesIO(raw)).convert("RGB"))
    return rgb, raw


def extract_line(rgb, y0, xlo=590, xmax=1810):
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    ink = gray[y0 - 10:y0 + 125, xlo:xmax] < 155
    columns = np.flatnonzero(ink.sum(axis=0) >= 2)
    if not len(columns):
        return []
    groups = np.split(columns, np.where(np.diff(columns) > 1)[0] + 1)
    result = []
    for group in groups:
        if not len(group):
            continue
        yy = np.flatnonzero(ink[:, group].any(axis=1))
        if not len(yy) or yy[-1] - yy[0] + 1 < 93:
            continue
        left = int(group[0]) + xlo
        right = int(group[-1]) + xlo
        glyph = ink[yy[0]:yy[-1] + 1, group[0]:group[-1] + 1].astype("uint8")
        feature = cv2.resize(glyph.astype("float32"), (48, 96),
                             interpolation=cv2.INTER_LINEAR).ravel()
        norm = np.linalg.norm(feature)
        if norm:
            feature /= norm
        height = int(yy[-1] - yy[0] + 1)
        width = int(right - left + 1)
        result.append({
            "feature": feature,
            "width": width,
            "height": height,
            "aspect": width / height,
        })
    return result


def collect_page(image_number, lines, selected_rows, rgb):
    records = []
    for row in selected_rows:
        text = lines[row]
        boxes = extract_line(
            rgb, Y[image_number][row],
            xlo=XLO.get((image_number, row), 590),
            xmax=XMAX.get((image_number, row), 1810),
        )
        if len(boxes) != len(text):
            raise AssertionError(
                f"image {image_number:02}, row {row}: "
                f"{len(boxes)} glyph components != {len(text)} source runes"
            )
        for column, (symbol, box) in enumerate(zip(text, boxes)):
            records.append({
                "page": image_number,
                "row": row,
                "column": column,
                "label": AB.index(symbol),
                **box,
            })
    return records


def prototypes(records):
    labels = np.array(sorted({r["label"] for r in records}), dtype=int)
    templates = []
    for label in labels:
        features = np.stack([r["feature"] for r in records if r["label"] == label])
        mean = features.mean(axis=0)
        templates.append(mean / np.linalg.norm(mean))
    return labels, np.stack(templates)


def classify(train, test):
    labels, templates = prototypes(train)
    features = np.stack([r["feature"] for r in test])
    similarities = features @ templates.T
    predicted = labels[similarities.argmax(axis=1)]
    actual = np.array([r["label"] for r in test])
    eligible = np.isin(actual, labels)
    correct = int(np.sum((predicted == actual) & eligible))
    return {
        "glyphs": len(test),
        "eligible": int(eligible.sum()),
        "correct": correct,
        "accuracy": correct / int(eligible.sum()) if eligible.any() else None,
    }


def geometry(lp1, lp2):
    def by_class(records):
        groups = defaultdict(list)
        for r in records:
            groups[r["label"]].append(r)
        return {
            label: {
                key: float(np.median([r[key] for r in values]))
                for key in ("width", "height", "aspect")
            }
            for label, values in groups.items()
        }
    a, b = by_class(lp1), by_class(lp2)
    ratios = {
        key: np.array([a[k][key] / b[k][key] for k in range(29)])
        for key in ("width", "height", "aspect")
    }
    return {
        "class_count": len(a.keys() & b.keys()),
        "median_LP1_over_LP2": {k: float(np.median(v)) for k, v in ratios.items()},
        "min_LP1_over_LP2": {k: float(np.min(v)) for k, v in ratios.items()},
        "max_LP1_over_LP2": {k: float(np.max(v)) for k, v in ratios.items()},
    }


def pair_similarity(lp1, lp2):
    a = np.stack([r["feature"] for r in lp1])
    b = np.stack([r["feature"] for r in lp2])
    la = np.array([r["label"] for r in lp1])
    lb = np.array([r["label"] for r in lp2])
    similarity = a @ b.T
    same = similarity[la[:, None] == lb[None, :]]
    different = similarity[la[:, None] != lb[None, :]]
    return {
        "same_class_pairs": int(same.size),
        "different_class_pairs": int(different.size),
        "same_class_cosine_mean": float(same.mean()),
        "same_class_cosine_median": float(np.median(same)),
        "different_class_cosine_mean": float(different.mean()),
        "different_class_cosine_median": float(np.median(different)),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path,
                        help="optional original 75-image ZIP; defaults to repo resources/liber-primus/")
    args = parser.parse_args()
    archive = ZipFile(args.archive) if args.archive else None
    try:
        page_lines = {3: P3, 4: P4, 14: P14, 49: P32, 72: P55}
        loaded, image_hashes = {}, {}
        for n in page_lines:
            loaded[n], raw = read_source(n, archive)
            image_hashes[f"{n:02}.jpg"] = sha256(raw).hexdigest()

        lp1 = []
        for n in (3, 4, 14):
            lp1.extend(collect_page(n, page_lines[n], SELECTED[n], loaded[n]))
        lp2 = []
        for n in (49, 72):
            lp2.extend(collect_page(n, page_lines[n], SELECTED[n], loaded[n]))

        assert len(lp1) == 500, len(lp1)
        assert len(lp2) == 197, len(lp2)
        assert len({r["label"] for r in lp1}) == 29
        assert len({r["label"] for r in lp2}) == 29

        cross = {
            "LP2_templates_to_LP1": classify(lp2, lp1),
            "LP1_templates_to_LP2": classify(lp1, lp2),
        }
        page_results = {}
        for n in (3, 4, 14):
            page_results[f"LP1_image_{n:02}"] = classify(
                lp2, [r for r in lp1 if r["page"] == n])
        for n in (49, 72):
            page_results[f"LP2_image_{n:02}"] = classify(
                lp1, [r for r in lp2 if r["page"] == n])

        controls = {
            "LP2_image49_to_image72": classify(
                [r for r in lp2 if r["page"] == 49],
                [r for r in lp2 if r["page"] == 72]),
            "LP2_image72_to_image49": classify(
                [r for r in lp2 if r["page"] == 72],
                [r for r in lp2 if r["page"] == 49]),
            "LP1_image14_to_images03_04": classify(
                [r for r in lp1 if r["page"] == 14],
                [r for r in lp1 if r["page"] in (3, 4)]),
            "LP1_images03_04_to_image14": classify(
                [r for r in lp1 if r["page"] in (3, 4)],
                [r for r in lp1 if r["page"] == 14]),
        }
        result = {
            "input_images_sha256": image_hashes,
            "LP1_glyphs": len(lp1),
            "LP2_glyphs": len(lp2),
            "GP29_classes": 29,
            "selected_rows": {str(k): SELECTED[k] for k in SELECTED},
            "cross_package": cross,
            "per_image": page_results,
            "within_package_controls": controls,
            "cross_package_pair_similarity": pair_similarity(lp1, lp2),
            "native_geometry": geometry(lp1, lp2),
            "scope": (
                "500 black body glyphs from LP1 images 03/04/14 and 197 from "
                "LP2 images 49/72; fixed source rows; 48x96 normalized binary "
                "silhouettes; nearest-centroid cosine classifier; no unknown "
                "ciphertext, plaintext, or key inference."
            ),
        }
        assert cross["LP2_templates_to_LP1"]["correct"] == 500
        assert cross["LP1_templates_to_LP2"]["correct"] == 197
        assert all(v["correct"] == v["glyphs"] for v in page_results.values())
        print(json.dumps(result, indent=2))
    finally:
        if archive:
            archive.close()


if __name__ == "__main__":
    main()
