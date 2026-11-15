"""Original p27 wing versus three pre-2014 Moravia convergens source plates.

Reuses the calibrated, frozen SIFT/RANSAC criterion of the preceding
three-plate experiment. A match is a near-exact artwork attribution only.
An unmatched plate does not exclude freehand redraws or similar anatomy.

Run: python sims/lp2_p27_moravia_original_plate_sft.py
Dependencies: numpy, opencv-python-headless, pymupdf, requests, filelock.
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
from filelock import FileLock

import lp2_p27_historical_threeplate_registration_sft as original


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "im-results" / "lp2-p27-moravia-original-plate-registration.json"

# Figures and adjacent pages selected by their original printed captions,
# before inspecting any p27 score. The 1976 alternative URLs expose the same
# journal article (Psyche 83, pp. 79-93), not independent plate evidence.
SOURCES = (
    {
        "name": "kukalova1974-moravia-fig3",
        "pages": (2, 3, 4),
        "urls": ("https://www.ephemeroptera-galactica.com/pubs/pub_k/pubkukalovaj1974p416.pdf",),
        "figure": "Kukalova-Peck 1974, Psyche, printed p419, Fig3, enlarged forewing base",
    },
    {
        "name": "kukalova-peck1976-moravia-fig1",
        "pages": (2, 3, 4),
        "urls": (
            "https://downloads.hindawi.com/journals/psyche/1976/036962.pdf",
            "https://www.biodiversitylibrary.org/partpdf/184003",
        ),
        "figure": "Kukalova-Peck and Peck 1976, Psyche 83, printed p82, Fig1 forewing",
    },
    {
        "name": "wootton2000-moravia-fig17a",
        "pages": (26, 27, 28),
        "urls": ("https://www.ephemeroptera-galactica.com/pubs/pub_w/pubwoottonr2000p129.pdf",),
        "figure": "Wootton and Kukalova-Peck 2000, Biological Reviews 75, printed p156, Fig17A",
    },
)


def source_frames(data: bytes, pages: tuple[int, ...]) -> list[tuple[str, np.ndarray]]:
    pdf = fitz.open(stream=data, filetype="pdf")
    result = []
    for page in pages:
        if page >= len(pdf):
            continue
        pix = pdf[page].get_pixmap(
            matrix=fitz.Matrix(1.8, 1.8), colorspace=fitz.csGRAY, alpha=False
        )
        raster = np.frombuffer(pix.samples, np.uint8).reshape(
            pix.height, pix.width
        ).copy()
        if max(raster.shape) > 2000:
            ratio = 2000 / max(raster.shape)
            raster = cv2.resize(
                raster,
                (int(raster.shape[1] * ratio), int(raster.shape[0] * ratio)),
            )
        result.append((f"original-pdf-page-{page}", raster))
    pdf.close()
    return result


def fetch_paper(urls: tuple[str, ...]) -> tuple[str, bytes]:
    failures = []
    for url in urls:
        try:
            data = original.fetch_bytes(url)
            with fitz.open(stream=data, filetype="pdf") as pdf:
                if len(pdf) < 5:
                    raise ValueError("Unexpectedly short PDF")
            return url, data
        except Exception as exc:
            failures.append(f"{url}: {type(exc).__name__}: {str(exc)[:160]}")
    raise RuntimeError("; ".join(failures))


def run() -> dict:
    raw = original.TARGET.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == original.EXPECTED_SHA
    page = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert page.shape == (3600, 2400)
    wing = page[516:855, 643:1787].copy()

    # Calibrate on the unchanged source wing before touching external plates.
    planted = cv2.warpAffine(
        wing,
        cv2.getRotationMatrix2D(
            (wing.shape[1] / 2, wing.shape[0] / 2), 4.0, 0.87
        ),
        (1300, 430),
        borderValue=255,
    )
    positive = original.match(planted, wing)
    assert positive["valid_noncollapsed"] and positive["affine_inliers"] >= 30

    report = {
        "original_page": "resources/liber-primus/44.jpg",
        "original_sha256": original.EXPECTED_SHA,
        "p27_crop_xyxy": [643, 516, 1787, 855],
        "fixed_detector": "SIFT6000 Lowe0.75, RANSAC similarity 5px; 30 inliers and whole-shape coverage",
        "native_positive": positive,
        "papers": [],
    }
    for source in SOURCES:
        record = {"name": source["name"], "printed_figure": source["figure"]}
        try:
            url, data = fetch_paper(source["urls"])
            record.update(url=url, pdf_sha256=hashlib.sha256(data).hexdigest(),
                          original_bytes=len(data))
            frames = []
            for label, raster in source_frames(data, source["pages"]):
                frames.append({"frame": f"{label}-whole-page",
                               **original.match(raster, wing)})
                for region_name, region in original.separate_plate_regions(raster):
                    frames.append({
                        "frame": f"{label}-{region_name}",
                        **original.match(region, wing),
                    })
            record["tested_frames"] = len(frames)
            record["best"] = max(
                frames,
                key=lambda v: (
                    v.get("valid_noncollapsed", False),
                    v["affine_inliers"],
                    v["target_span_x"],
                ),
            )
            record["near_exact_match"] = bool(
                record["best"].get("valid_noncollapsed", False)
            )
            record["all_frames"] = frames
        except Exception as exc:
            record["download_or_decode_error"] = (
                f"{type(exc).__name__}: {str(exc)[:600]}"
            )
            # This source is UNTESTED, never counted as a negative.
        report["papers"].append(record)
        print(json.dumps({
            k: record.get(k) for k in
            ("name", "url", "pdf_sha256", "tested_frames",
             "best", "near_exact_match", "download_or_decode_error")
        }), flush=True)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUTPUT) + ".lock"):
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", newline="\n", dir=OUTPUT.parent,
            prefix=".p27-moravia-", suffix=".tmp", delete=False
        ) as output:
            tmp = Path(output.name)
            json.dump(report, output, indent=2, ensure_ascii=True)
            output.write("\n")
            output.flush()
            os.fsync(output.fileno())
        os.replace(tmp, OUTPUT)
    print(json.dumps({"native_control_inliers": positive["affine_inliers"],
                      "source_results": [
                          {"name": p["name"], "matched": p.get("near_exact_match"),
                           "tested": p.get("tested_frames")}
                          for p in report["papers"]
                      ]}))
    return report


if __name__ == "__main__":
    run()
