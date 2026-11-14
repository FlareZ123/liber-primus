"""SFT: source-blind p27 forewing registration against three dated, primary plate images.

Network is used only for original plate downloads; LP2 image is checked in.
A positive native-image affine plant calibrates detection. No ciphertext fitting.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import tempfile

import cv2
import fitz
import numpy as np
import requests
from filelock import FileLock


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "resources" / "liber-primus" / "44.jpg"
OUTPUT = ROOT / "im-results" / "lp2-p27-historical-threeplate-registration.json"
EXPECTED_SHA = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"

SOURCES = (
    ("moulds2012", "pdf", "https://www.mapress.com/zootaxa/2012/f/zt03287p262.pdf"),
    ("moulds2005", "pdf", "https://media.australian.museum/media/Uploads/Journals/18025/1447_complete.pdf"),
    ("greatlakes1972", "pdf", "https://orthsoc.org/sina/i00lap72.pdf"),
)


def fetch_bytes(url: str) -> bytes:
    response = requests.get(url, timeout=90, headers={"User-Agent": "LP2-research-source-plate/1.0"})
    response.raise_for_status()
    if not 1000 < len(response.content) < 55_000_000:
        raise ValueError("Unexpected source-size bounds")
    return response.content


def source_pages(name: str, kind: str, data: bytes) -> list[tuple[str, np.ndarray]]:
    if kind == "png":
        img = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError("PNG decode failed")
        return [("full-image", img)]

    pdf = fitz.open(stream=data, filetype="pdf")
    # The figure is near the opening anatomical terminology section in both publications.
    candidates = set()
    for i in range(min(21, len(pdf))):
        txt = pdf[i].get_text().lower()
        if "5–6" in txt or "5-6" in txt or "fig. 5" in txt or "figures 5" in txt:
            candidates.update((j for j in (i - 1, i, i + 1) if 0 <= j < len(pdf)))
    if name == "greatlakes1972":
        # The only relevant venation plate is printed page 60, PDF index 27.
        candidates = {i for i in (26, 27, 28) if i < len(pdf)}
    elif not candidates:
        candidates.update(range(min(12, len(pdf))))
    # Reduce artifacts to finite, pre-selected pages (the caption and adjacent spread).
    out: list[tuple[str, np.ndarray]] = []
    for i in sorted(candidates)[:10]:
        pix = pdf[i].get_pixmap(matrix=fitz.Matrix(1.8, 1.8), colorspace=fitz.csGRAY, alpha=False)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width).copy()
        if max(img.shape) > 2000:
            scale = 2000 / max(img.shape)
            img = cv2.resize(img, (int(img.shape[1] * scale), int(img.shape[0] * scale)))
        out.append((f"pdf-page-{i}", img))
    pdf.close()
    return out



def separate_plate_regions(image: np.ndarray) -> list[tuple[str, np.ndarray]]:
    """Find long, mostly-continuous ink drawings and strip isolated letter components."""
    ink = (image < 180).astype(np.uint8)
    ink = cv2.morphologyEx(ink, cv2.MORPH_CLOSE, np.ones((2, 2), np.uint8))
    n, components, stats, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
    selected: list[tuple[float, str, np.ndarray]] = []
    for i in range(1, n):
        x, y, w, h, area = [int(t) for t in stats[i]]
        if w < 160 or h < 35 or not (1.25 <= w / h <= 12) or area < 450:
            continue
        # Retain only the contiguous drawing: independent annotations and type are blinded.
        mask = np.where(components[y:y + h, x:x + w] == i, 0, 255).astype(np.uint8)
        label = f"ink-component-{i}-xywh-{x}-{y}-{w}-{h}"
        selected.append((float(w * h), label, cv2.copyMakeBorder(mask, 12, 12, 12, 12, cv2.BORDER_CONSTANT, value=255)))
    selected.sort(reverse=True, key=lambda v: v[0])
    return [(label, image) for _, label, image in selected[:6]]


def match(source: np.ndarray, target: np.ndarray) -> dict[str, object]:
    sift = cv2.SIFT_create(nfeatures=6000, contrastThreshold=0.004, edgeThreshold=22)
    kp_t, d_t = sift.detectAndCompute(target, None)
    kp_s, d_s = sift.detectAndCompute(source, None)
    result: dict[str, object] = {"source_keypoints": len(kp_s), "target_keypoints": len(kp_t)}
    if d_s is None or d_t is None or len(kp_s) < 3 or len(kp_t) < 3:
        return {**result, "ratio_matches": 0, "affine_inliers": 0, "target_span_x": 0.0, "target_span_y": 0.0}
    pairs = cv2.BFMatcher(cv2.NORM_L2).knnMatch(d_t, d_s, k=2)
    reverse = {m.queryIdx: m.trainIdx for m in cv2.BFMatcher(cv2.NORM_L2).match(d_s, d_t)}
    good = [a for a, b in pairs if a.distance < 0.75 * b.distance and reverse.get(a.trainIdx) == a.queryIdx]
    result["ratio_matches"] = len(good)
    if len(good) < 4:
        return {**result, "affine_inliers": 0, "target_span_x": 0.0, "target_span_y": 0.0}
    src = np.float32([kp_t[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp_s[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    model, mask = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=5.0, maxIters=3000, confidence=0.995)
    if model is None or mask is None:
        return {**result, "affine_inliers": 0, "target_span_x": 0.0, "target_span_y": 0.0}
    inliers = mask.ravel().astype(bool)
    pts = src.reshape(-1, 2)[inliers]
    result["affine_inliers"] = int(inliers.sum())
    result["target_span_x"] = round(float(np.ptp(pts[:, 0]) / target.shape[1]), 5)
    result["target_span_y"] = round(float(np.ptp(pts[:, 1]) / target.shape[0]), 5)
    scale = float(np.hypot(model[0, 0], model[0, 1]))
    result["scale"] = round(scale, 6)
    result["valid_noncollapsed"] = 0.08 <= scale <= 4.0 and result["target_span_x"] > 0.5 and result["target_span_y"] > 0.15
    result["similarity_matrix"] = np.round(model, 5).tolist()
    return result


def run() -> dict[str, object]:
    raw = TARGET.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == EXPECTED_SHA
    img = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert img is not None and img.shape == (3600, 2400)
    # Coordinates frozen from p27 original illustrator's 1,144-by-339 wing.
    wing = img[516:855, 643:1787].copy()
    # A separate p53 logo region is a non-wing source-image control.
    wrong = cv2.imdecode(np.frombuffer((ROOT / "resources" / "liber-primus" / "70.jpg").read_bytes(), dtype=np.uint8), cv2.IMREAD_GRAYSCALE)[2700:3299, 600:1800]
    planted = cv2.warpAffine(wing, cv2.getRotationMatrix2D((wing.shape[1] / 2, wing.shape[0] / 2), 4.0, 0.87), (1300, 430), borderValue=255)
    control_true = match(planted, wing)
    control_false = match(wrong, wing)
    assert control_true["affine_inliers"] >= 30, control_true
    assert control_true["target_span_x"] > 0.50 and control_true["valid_noncollapsed"], control_true

    report: dict[str, object] = {
        "original_lp2": "resources/liber-primus/44.jpg",
        "original_sha256": EXPECTED_SHA,
        "crop_xyxy": [643, 516, 1787, 855],
        "detector": "SIFT 6000, Lowe 0.75; RANSAC similarity 5px",
        "native_affine_positive": control_true,
        "different_artwork_negative": control_false,
        "source_results": [],
    }
    for name, kind, url in SOURCES:
        record: dict[str, object] = {"name": name, "url": url}
        try:
            data = fetch_bytes(url)
            record["sha256"] = hashlib.sha256(data).hexdigest()
            record["bytes"] = len(data)
            page_items = source_pages(name, kind, data)
            candidates = []
            for label, source in page_items:
                candidates.append({"frame": label + "-fullpage", **match(source, wing)})
                for region_label, region_image in separate_plate_regions(source):
                    candidates.append({"frame": label + "-" + region_label, **match(region_image, wing)})
            record["tested_frames"] = len(candidates)
            record["best"] = max(candidates, key=lambda x: (x.get("valid_noncollapsed", False), x["affine_inliers"], x["target_span_x"]))
            record["all_frames"] = candidates
            print(json.dumps({"name": name, "sha256": record["sha256"], "best": record["best"]}, ensure_ascii=True), flush=True)
        except Exception as exc:
            record["error"] = f"{type(exc).__name__}: {str(exc)[:500]}"
            print(json.dumps({"name": name, "error": record["error"]}), flush=True)
        report["source_results"].append(record)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUTPUT) + ".lock"):
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", newline="\n", dir=OUTPUT.parent, prefix=".p27-plate-", suffix=".tmp", delete=False) as out:
            temp_path = Path(out.name)
            json.dump(report, out, indent=2, ensure_ascii=True)
            out.write("\n")
            out.flush()
            os.fsync(out.fileno())
        os.replace(temp_path, OUTPUT)
    print("POSITIVE:", json.dumps(control_true, ensure_ascii=True))
    print("NEGATIVE:", json.dumps(control_false, ensure_ascii=True))
    return report


if __name__ == "__main__":
    run()
