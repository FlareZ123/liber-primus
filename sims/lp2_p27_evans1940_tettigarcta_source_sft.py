"""Source-specific SFT for the Evans 1940-volume Tettigarcta forewing candidate.

Downloads only the identified Evans paper, rasterizes its finite 15-page article,
and tests the original p27 wing against every page and large connected ink region.
Uses the already calibrated p27 SIFT/RANSAC matcher and native positive/negative
controls. No ciphertext fitting, threshold tuning, or generic species search.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import fitz
import numpy as np
import requests

import lp2_p27_historical_threeplate_registration_sft as base

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "resources" / "liber-primus" / "44.jpg"
NEGATIVE = ROOT / "resources" / "liber-primus" / "70.jpg"
SOURCE_URL = "https://eprints.utas.edu.au/13273/1/1940-evans-morphology.pdf"
EXPECTED_TARGET_SHA = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"
OUT = ROOT / "im-results" / "lp2-p27-evans1940-registration.json"
PAGE_DIR = ROOT / "im-results" / "evans1940-pages"


def fetch_source() -> bytes:
    response = requests.get(
        SOURCE_URL,
        timeout=120,
        headers={"User-Agent": "LP2-research-source-plate/1.0"},
    )
    response.raise_for_status()
    data = response.content
    if not 1000 < len(data) < 55_000_000:
        raise ValueError(f"Unexpected source-size bound: {len(data)}")
    if not data.startswith(b"%PDF"):
        raise ValueError("Downloaded source is not a PDF")
    return data


def raster(page: fitz.Page, scale: float = 1.8) -> np.ndarray:
    pix = page.get_pixmap(
        matrix=fitz.Matrix(scale, scale),
        colorspace=fitz.csGRAY,
        alpha=False,
    )
    return np.frombuffer(pix.samples, dtype=np.uint8).reshape(
        pix.height, pix.width
    ).copy()


def main() -> dict[str, object]:
    target_bytes = TARGET.read_bytes()
    target_sha = hashlib.sha256(target_bytes).hexdigest()
    if target_sha != EXPECTED_TARGET_SHA:
        raise ValueError(f"Unexpected p27 source SHA-256: {target_sha}")
    page = cv2.imdecode(np.frombuffer(target_bytes, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    if page is None or page.shape != (3600, 2400):
        raise ValueError("Original p27 JPEG decode/dimensions changed")

    # Preserve the exact 1,144 x 339 crop used by the existing native-source gate.
    wing = page[516:855, 643:1787].copy()
    planted = cv2.warpAffine(
        wing,
        cv2.getRotationMatrix2D((wing.shape[1] / 2, wing.shape[0] / 2), 4.0, 0.87),
        (1300, 430),
        borderValue=255,
    )
    negative_page = cv2.imdecode(
        np.frombuffer(NEGATIVE.read_bytes(), dtype=np.uint8),
        cv2.IMREAD_GRAYSCALE,
    )
    if negative_page is None:
        raise ValueError("p53 negative-control JPEG failed to decode")
    wrong = negative_page[2700:3299, 600:1800]
    positive_control = base.match(planted, wing)
    negative_control = base.match(wrong, wing)
    if positive_control.get("affine_inliers", 0) < 30 or not positive_control.get("valid_noncollapsed", False):
        raise AssertionError(f"Frozen positive control failed: {positive_control}")

    data = fetch_source()
    source_sha = hashlib.sha256(data).hexdigest()
    pdf = fitz.open(stream=data, filetype="pdf")
    page_texts = [pdf[i].get_text() for i in range(len(pdf))]
    locator_pages = [
        i for i, text in enumerate(page_texts)
        if any(token in text.lower() for token in (
            "tettigarcta tomentosa", "fig. 12", "fig.12", "forewing", "nodal line"
        ))
    ]
    # The article is short; inspect every page, not just pages selected by OCR.
    PAGE_DIR.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, object]] = []
    best_overall: dict[str, object] | None = None

    for i in range(len(pdf)):
        page_img = raster(pdf[i])
        page_path = PAGE_DIR / f"evans1940-page-{i:02d}.png"
        cv2.imwrite(str(page_path), page_img)
        text = page_texts[i]
        frames: list[tuple[str, np.ndarray]] = [(f"page-{i}-full", page_img)]
        for label, region in base.separate_plate_regions(page_img):
            frames.append((f"page-{i}-{label}", region))

        frame_results: list[dict[str, object]] = []
        for frame_label, source_img in frames:
            for mirrored in (False, True):
                candidate = cv2.flip(source_img, 1) if mirrored else source_img
                metrics = base.match(candidate, wing)
                record = {
                    "frame": frame_label,
                    "mirrored": mirrored,
                    **metrics,
                }
                frame_results.append(record)
                if best_overall is None or (
                    record.get("affine_inliers", 0),
                    record.get("target_span_x", 0.0),
                    record.get("target_span_y", 0.0),
                ) > (
                    best_overall.get("affine_inliers", 0),
                    best_overall.get("target_span_x", 0.0),
                    best_overall.get("target_span_y", 0.0),
                ):
                    best_overall = record
        page_best = max(
            frame_results,
            key=lambda x: (
                x.get("valid_noncollapsed", False),
                x.get("affine_inliers", 0),
                x.get("target_span_x", 0.0),
            ),
        )
        results.append({
            "pdf_page_index_zero_based": i,
            "text_has_tettigarcta": "tettigarcta" in text.lower(),
            "text_has_fig12": "fig. 12" in text.lower() or "fig.12" in text.lower(),
            "text_has_forewing": "forewing" in text.lower(),
            "text_excerpt": " ".join(text.split())[:1200],
            "raster_size_wh": [int(page_img.shape[1]), int(page_img.shape[0])],
            "page_sha256_png": hashlib.sha256(page_path.read_bytes()).hexdigest(),
            "candidate_frames_tested": len(frame_results),
            "best": page_best,
            "all_matches": frame_results,
        })
        print(json.dumps({
            "page": i,
            "locator_page": i in locator_pages,
            "best": page_best,
        }, ensure_ascii=True), flush=True)

    report: dict[str, object] = {
        "source": "J. W. Evans, The Morphology of Tettigarcta tomentosa White, Papers and Proceedings of the Royal Society of Tasmania (1940 volume), pp.35-49",
        "source_url": SOURCE_URL,
        "source_bytes": len(data),
        "source_sha256": source_sha,
        "pdf_page_count": len(pdf),
        "text_locator_pages_zero_based": locator_pages,
        "target_path": "resources/liber-primus/44.jpg",
        "target_sha256": target_sha,
        "target_registration_crop_xyxy": [643, 516, 1787, 855],
        "target_registration_crop_size_wh": [1144, 339],
        "detector": "shared SIFT 6000 / Lowe 0.75 / bidirectional matches / RANSAC similarity 5px; success >=30 inliers, scale 0.08..4, target span x>0.50 and y>0.15",
        "positive_control": positive_control,
        "negative_control": negative_control,
        "best_overall": best_overall,
        "pages": results,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    pdf.close()
    print("SOURCE_SUMMARY", json.dumps({
        "source_sha256": source_sha,
        "source_bytes": len(data),
        "pdf_page_count": len(results),
        "locator_pages": locator_pages,
        "positive_control": positive_control,
        "negative_control": negative_control,
        "best_overall": best_overall,
    }, ensure_ascii=True), flush=True)
    return report


if __name__ == "__main__":
    main()
