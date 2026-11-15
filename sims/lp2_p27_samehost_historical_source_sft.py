"""Source-fixed p27 wing comparison with same-host illustrations adjoining LP2 mayfly source.

This tests two finite, independently captioned figures on a documented pre-2014 website.
It does not invent a source match or invoke a ciphertext decoder.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import tempfile

import cv2
from filelock import FileLock
import numpy as np
import requests

from lp2_p27_historical_threeplate_registration_sft import match, separate_plate_regions

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "resources/liber-primus/44.jpg"
OUTPUT = ROOT / "im-results/lp2-p27-samehost-historical-wing-source.json"
EXPECTED_SHA = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"

SOURCES = {
    "zoraida_egregia_fig8": "https://www.metafysica.nl/wings/rohd1949_39.jpg",
    "machaerota_spangbergi_fig9": "https://www.metafysica.nl/wings/rohd1949_41.jpg",
}

def run() -> None:
    original = TARGET.read_bytes()
    assert hashlib.sha256(original).hexdigest() == EXPECTED_SHA
    target = cv2.imdecode(np.frombuffer(original, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert target is not None and target.shape == (3600, 2400)
    wing = target[516:855, 643:1787]
    rotated = cv2.warpAffine(
        wing, cv2.getRotationMatrix2D((wing.shape[1]/2, wing.shape[0]/2), 4.0, .87),
        (1300, 430), borderValue=255
    )
    positive = match(rotated, wing)
    assert positive["valid_noncollapsed"] and positive["affine_inliers"] >= 30
    wrong_raw = (ROOT / "resources/liber-primus/70.jpg").read_bytes()
    wrong = cv2.imdecode(np.frombuffer(wrong_raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    negative = match(wrong[2700:3299, 600:1800], wing)
    assert not negative["valid_noncollapsed"]
    report = {
        "source": "Original p27 44.jpg and www.metafysica.nl/wings/wings_14.html Figs 8,9",
        "original_sha256": EXPECTED_SHA,
        "crop_xyxy": [643, 516, 1787, 855],
        "criterion": "SIFT/RANSAC >=30 inliers, scale 0.08..4, x-span>0.50, y-span>0.15",
        "positive": positive,
        "negative": negative,
        "figures": [],
    }
    for name, url in SOURCES.items():
        record = {"name": name, "url": url}
        try:
            response = requests.get(url, timeout=35, headers={"User-Agent": "Mozilla/5.0 (LP2 comparative research)"})
            response.raise_for_status()
            data = response.content
            image = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
            if image is None:
                raise ValueError("Source returned non-image content")
            record.update({"byte_count": len(data), "sha256": hashlib.sha256(data).hexdigest(), "image_shape": image.shape})
            candidates = [("whole-figure", image)] + separate_plate_regions(image)
            record["matches"] = [{"candidate": label, **match(frame, wing)} for label, frame in candidates]
            record["best"] = max(record["matches"], key=lambda x: (x["valid_noncollapsed"],x["affine_inliers"]))
        except (requests.RequestException, ValueError, OSError) as error:
            record["retrieval_error"] = str(error)[:500]
        report["figures"].append(record)
        print(json.dumps(record, ensure_ascii=True), flush=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUTPUT) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=OUTPUT.parent, prefix=".p27-samehost-", suffix=".tmp", delete=False) as handle:
            tmp = Path(handle.name)
            json.dump(report, handle, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp, OUTPUT)
    print("Controls: planted wing matched; unrelated original ornament rejected.")


if __name__ == "__main__":
    run()
