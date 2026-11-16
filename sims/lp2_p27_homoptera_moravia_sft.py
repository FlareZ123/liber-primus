"""Check only two dated Homoptera drawings and the four pinned Moravia figures.

Original p27 wing is compared with a planted similarity transform, a different
original LP2 drawing and pre-2014 primary plates. No ciphertext key is fitted.
Use the existing 2026 source registration SFT; report source hashes and complete
candidate counts. Running this on a network-enabled Windows CI host is supported.
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import os
from pathlib import Path
import tempfile

import cv2
import fitz
import numpy as np
from filelock import FileLock

from lp2_p27_historical_threeplate_registration_sft import (
    EXPECTED_SHA, TARGET, fetch_bytes, match, separate_plate_regions,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "im-results" / "lp2-p27-homoptera-moravia-registration.json"
PREVIEW = ROOT / "im-results" / "p27-homoptera-moravia-previews"

SOURCES = (
    ("rohdendorf1949-zoraida-fig8", "jpg",
     "https://www.metafysica.nl/wings/rohd1949_39.jpg", ""),
    ("rohdendorf1949-machaerota-fig9", "jpg",
     "https://www.metafysica.nl/wings/rohd1949_41.jpg", ""),
    ("kukalova1964-moravia-fig2", "pdf",
     "https://downloads.hindawi.com/journals/psyche/1964/034192.pdf", "Fig. 2"),
    ("kukalovapeck1974-moravia-base-fig3", "pdf",
     "https://www.ephemeroptera-galactica.com/pubs/pub_k/pubkukalovaj1974p416.pdf", "Fig. 3"),
    ("kukalovapeck1976-moravia-fig1", "pdf",
     "https://downloads.hindawi.com/journals/psyche/1976/036962.pdf", "Fig. 1"),
    ("wootton2000-moravia-fig17a", "pdf",
     "https://www.ephemeroptera-galactica.com/pubs/pub_w/pubwoottonr2000p129.pdf", "Fig. 17"),
)

# Pinned alternates only, never additional specimens or species.
ALTERNATE = {
    "kukalovapeck1976-moravia-fig1": (
      "https://www.biodiversitylibrary.org/partpdf/184003",
      "https://biostor.org/pdf/175378",
      "https://groups.csail.mit.edu/mac/projects/psyche/83/83-079.pdf",
      "https://psyche.entclub.org/83/83-079.pdf",
      "https://upload.wikimedia.org/wikipedia/commons/b/b4/Psyche_%28IA_psyche831976camb%29.pdf",
    ),
    "kukalova1964-moravia-fig2": (
      "https://groups.csail.mit.edu/mac/projects/psyche/71/71-153.pdf",
      "https://psyche.entclub.org/71/71-153.pdf",
      "https://archive.org/download/psyche711964camb/psyche711964camb.pdf",
      "https://downloads.hindawi.com/journals/psyche/1964/34192.pdf",
    ),
}


def page_candidates(raw: bytes, hint: str, name: str) -> list[tuple[str, np.ndarray]]:
    document = fitz.open(stream=raw, filetype="pdf")
    # Historically named figure only. Find the figure caption and its
    # immediately adjacent page, since older scanned magazines can put
    # the figure on the opposite leaf.
    target = hint.lower().replace(" ", "")
    hit: list[int] = []
    for i, page in enumerate(document):
        text = page.get_text().lower().replace(" ", "")
        if target in text and (
            "moravia" in text or ("1974" in name and "fig.3" in text)
        ):
            hit.append(i)
    if not hit:
        if "1974" in name:
            hit = [3]
        elif "2000" in name:
            hit = [27]
        elif "1964" in name:
            hit = [9]
        elif "1976" in name:
            hit = [3]
    positions = sorted({j for i in hit[:3] for j in (i - 1, i, i + 1)
                        if 0 <= j < len(document)})[:8]
    frames = []
    for i in positions:
        pix = document[i].get_pixmap(matrix=fitz.Matrix(1.8, 1.8),
                                    colorspace=fitz.csGRAY, alpha=False)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
            pix.height, pix.width).copy()
        if max(img.shape) > 2400:
            k = 2400 / max(img.shape)
            img = cv2.resize(img, (int(img.shape[1] * k),
                                   int(img.shape[0] * k)))
        frames.append((f"pdf-{i}", img))
    document.close()
    return frames


def preview(name: str, img: np.ndarray) -> str:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    scale = 650 / max(img.shape)
    thumb = cv2.resize(img, (max(1, round(img.shape[1] * scale)),
                             max(1, round(img.shape[0] * scale))))
    encoded = cv2.imencode(".jpg", thumb, [cv2.IMWRITE_JPEG_QUALITY, 75])[1].tobytes()
    dest = PREVIEW / (name + ".jpg")
    with FileLock(str(dest) + ".lock"):
        with tempfile.NamedTemporaryFile("wb", dir=PREVIEW, suffix=".tmp",
                                         delete=False) as f:
            temp = Path(f.name)
            f.write(encoded)
            f.flush()
            os.fsync(f.fileno())
        os.replace(temp, dest)
    return hashlib.sha256(encoded).hexdigest()


def run() -> dict[str, object]:
    original = TARGET.read_bytes()
    assert hashlib.sha256(original).hexdigest() == EXPECTED_SHA
    whole = cv2.imdecode(np.frombuffer(original, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert whole is not None and whole.shape == (3600, 2400)
    target = whole[516:855, 643:1787].copy()
    planted = cv2.warpAffine(
        target,
        cv2.getRotationMatrix2D((target.shape[1] / 2,
                                 target.shape[0] / 2), 4, .87),
        (1300, 430), borderValue=255,
    )
    positive = match(planted, target)
    assert positive["valid_noncollapsed"] and positive["affine_inliers"] >= 30
    other = cv2.imdecode(np.frombuffer(
        (ROOT / "resources/liber-primus/70.jpg").read_bytes(), np.uint8),
        cv2.IMREAD_GRAYSCALE)[2700:3299, 600:1800]
    negative = match(other, target)
    report = {
        "original": "resources/liber-primus/44.jpg",
        "sha256": EXPECTED_SHA,
        "target_xyxy": [643, 516, 1787, 855],
        "source_plan": ["Moravia 1964 Fig2", "Moravia 1974 Fig3 base",
                        "Moravia 1976 Fig1", "Moravia 2000 Fig17a",
                        "Rohdendorf 1949 figs8-9 via Metafysica"],
        "registration": "original/mirrored source SIFT partial-affine RANSAC; no anisotropic warp",
        "positive_native": positive,
        "negative_different_original": negative,
        "sources": [],
    }
    for name, kind, url, hint in SOURCES:
        row = {"name": name, "url": url, "figure_hint": hint}
        raw = None
        for attempt in (url, *ALTERNATE.get(name, ())):
            try:
                raw = fetch_bytes(attempt)
                row["resolved_url"] = attempt
                break
            except Exception as exc:
                row.setdefault("fetch_errors", []).append(
                    f"{attempt}: {type(exc).__name__}: {str(exc)[:160]}")
        if raw is None:
            report["sources"].append(row)
            print("SOURCE", json.dumps(row), flush=True)
            continue
        row["sha256"] = hashlib.sha256(raw).hexdigest()
        row["bytes"] = len(raw)
        try:
            frames = (
                [("source", cv2.imdecode(
                    np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE))]
                if kind == "jpg" else page_candidates(raw, hint, name)
            )
            ranked = []
            for label, src in frames:
                if src is None:
                    continue
                for region_name, region in [(label, src),
                                            *[(label + "_" + k, v) for k, v in
                                              separate_plate_regions(src)]]:
                    # Explicitly allow mirrored historical reproductions.
                    # Similarity matching itself permits rotation and
                    # uniform scale, but not reflection.
                    for mirror, candidate in (("original", region),
                                               ("mirror-x", cv2.flip(region, 1))):
                        detail = match(candidate, target)
                        ranked.append({"frame": region_name,
                                       "orientation": mirror, **detail})
                preview(name + "_" + label, src)
            row["candidate_frames"] = len(ranked)
            row["best"] = max(
                ranked, key=lambda x: (x.get("valid_noncollapsed", False),
                                       x["affine_inliers"], x["target_span_x"]),
            ) if ranked else None
            row["matched_fullwing"] = bool(
                row["best"] and row["best"].get("valid_noncollapsed"))
            print("SOURCE", json.dumps({k: row[k] for k in
                ("name", "sha256", "bytes", "candidate_frames",
                 "best", "matched_fullwing")}), flush=True)
        except Exception as exc:
            row["error"] = f"{type(exc).__name__}: {str(exc)[:300]}"
            print("SOURCE", json.dumps(row), flush=True)
        report["sources"].append(row)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUT) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf-8",
                                         dir=OUT.parent, suffix=".tmp",
                                         delete=False) as f:
            temp = Path(f.name)
            json.dump(report, f, indent=2)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(temp, OUT)
    print("FULL_REPORT", json.dumps(report), flush=True)
    return report


if __name__ == "__main__":
    run()
