"""Original p27 wing versus two independently dated Victorian illustrated plates.

Nonduplicating add-on to existing Moulds/GreatLakes source registration. It
imports the validated original-image registration method; no ciphertext used.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import tempfile
import os

import cv2
import numpy as np
from filelock import FileLock

from lp2_p27_historical_threeplate_registration_sft import (
    EXPECTED_SHA,
    TARGET,
    fetch_bytes,
    match,
    separate_plate_regions,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "im-results" / "lp2-p27-1881-1887-engraving-plate-results.json"
SOURCES = (
    {
        "name": "chambers-1881-common-bee-wing",
        "publication": "W. and R. Chambers Encyclopaedia, Philadelphia: J.B. Lippincott, 1881",
        "catalogue": "https://etc.usf.edu/clipart/21200/21209/bee_wing_21209.htm",
        "url": "https://etc.usf.edu/clipart/21200/21209/bee_wing_21209.tif",
    },
    {
        "name": "cooper-1887-bee-hooks",
        "publication": "Sarah Cooper, Animal Life in the Sea and on the Land, Harper, 1887, p119",
        "catalogue": "https://etc.usf.edu/clipart/8200/8260/bee_wing_8260.htm",
        "url": "https://etc.usf.edu/clipart/8200/8260/bee_wing_8260.tif",
    },
)


def run() -> dict[str, object]:
    original = TARGET.read_bytes()
    assert hashlib.sha256(original).hexdigest() == EXPECTED_SHA
    whole = cv2.imdecode(np.frombuffer(original, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert whole is not None and whole.shape == (3600, 2400)
    target = whole[516:855, 643:1787].copy()
    native = cv2.warpAffine(
        target,
        cv2.getRotationMatrix2D((target.shape[1] / 2, target.shape[0] / 2), 4.0, .87),
        (1300, 430),
        borderValue=255,
    )
    positive = match(native, target)
    assert positive["valid_noncollapsed"] and positive["affine_inliers"] >= 30
    report: dict[str, object] = {
        "target": "resources/liber-primus/44.jpg",
        "target_sha256": EXPECTED_SHA,
        "target_crop": [643, 516, 1787, 855],
        "comparison": "exact source-independent SIFT+RANSAC from historical-threeplate SFT",
        "threshold": ">=30 inliers; scale .08..4; target span x>.50, y>.15",
        "native_wing_positive": positive,
        "historical_sources": [],
    }
    for source in SOURCES:
        record: dict[str, object] = dict(source)
        try:
            data = fetch_bytes(source["url"])
            record["sha256"] = hashlib.sha256(data).hexdigest()
            record["source_bytes"] = len(data)
            img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
            if img is None:
                raise ValueError("original TIFF decoder failed")
            if max(img.shape) > 2800:
                scale = 2800 / max(img.shape)
                img = cv2.resize(img, (round(img.shape[1] * scale), round(img.shape[0] * scale)))
            frames = [("full-plate", img), *separate_plate_regions(img)]
            tested = [{"region": name, **match(test, target)} for name, test in frames]
            record["tested"] = tested
            record["best"] = max(tested, key=lambda v: (v.get("valid_noncollapsed", False), v["affine_inliers"]))
            print(json.dumps({"source": record["name"], "best": record["best"]}), flush=True)
        except Exception as exc:
            record["error"] = f"{type(exc).__name__}: {str(exc)[:200]}"
            print(json.dumps({"source": record["name"], "error": record["error"]}), flush=True)
        report["historical_sources"].append(record)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUTPUT) + ".lock"):
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", newline="\n", dir=OUTPUT.parent,
            suffix=".tmp", delete=False
        ) as dest:
            tmp = Path(dest.name)
            json.dump(report, dest, indent=2)
            dest.write("\n")
            dest.flush()
            os.fsync(dest.fileno())
        os.replace(tmp, OUTPUT)
    print("source-plate report", json.dumps(report, indent=2), flush=True)
    return report


if __name__ == "__main__":
    run()
