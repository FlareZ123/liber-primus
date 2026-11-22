"""Original-JPEG LSB coordinate controls for a claimed external LP key.

Source: nexon33/cicada3301 EXTRACTION_DOCUMENTATION.md (2025-10-28).
The claimed cicada-image input is cicada-solvers/iddqd's
liber-primus__images--unsolved/57.jpg, byte-identical to the full
original archive member 74.jpg (LP2 physical p57).
Requires Python 3, numpy, Pillow. No network access or mutable inputs.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = ROOT / "resources" / "liber-primus"
MASTERS = np.asarray([62, 102, 115, 181, 217, 218, 333, 566, 596, 625, 689])
EXPECTED_P57_GIT_BLOB = "4397143b4df5ad729b00cfd740a74994052f46d2"


def git_blob_sha1(data: bytes) -> str:
    """Calculate the immutable Git-blob identity of an original JPEG."""
    header = b"blob " + str(len(data)).encode("ascii") + b"\x00"
    return hashlib.sha1(header + data).hexdigest()


def inspect(physical_page: int) -> dict[str, object]:
    """Run precisely the external 40%-crop grayscale-LSB-zero coordinate rule."""
    file = ORIGINALS / f"{physical_page + 17:02d}.jpg"
    with Image.open(file) as image:
        gray = np.asarray(image.convert("L"))
    height, width = gray.shape
    region = gray[int(height * 0.4) :, :]
    y, x = np.where((region & 1) == 0)
    indices = np.union1d(np.unique(y), np.unique(x))
    frequency = np.bincount(np.concatenate((y, x)), minlength=max(width, height))
    present = MASTERS[np.isin(MASTERS, indices)]
    missing = MASTERS[~np.isin(MASTERS, indices)]
    return {
        "page": physical_page,
        "originalImage": file.name,
        "dimensions": [width, height],
        "gitBlobSha1": git_blob_sha1(file.read_bytes()),
        "uniqueCoordinates": int(len(indices)),
        "maxCoordinate": int(indices[-1]),
        "lsbZeroPixels": int(len(y)),
        "claimedIndicesPresent": present.tolist(),
        "claimedIndicesAbsent": missing.tolist(),
        "matchesOutOf11": int(len(present)),
        "frequencyIndex333": int(frequency[333]),
    }


def main() -> None:
    """Adjudicate the claimed primary page against independently chosen pages."""
    pages = [15, 32, 40, 53, 54, 55, 56, 57]
    observations = [inspect(p) for p in pages]
    by_page = {p["page"]: p for p in observations}
    target = by_page[57]

    assert target["gitBlobSha1"] == EXPECTED_P57_GIT_BLOB
    assert target["dimensions"] == [2400, 3600]
    assert target["uniqueCoordinates"] == 1543
    assert target["maxCoordinate"] == 1791
    assert target["lsbZeroPixels"] == 136346
    assert target["claimedIndicesAbsent"] == [217, 218, 566]
    assert target["matchesOutOf11"] == 8
    assert target["frequencyIndex333"] == 484

    # These controls are original manuscript JPEGs, not synthetic all-zero masks.
    assert all(by_page[p]["matchesOutOf11"] == 11 for p in [15, 40, 53, 54, 55])
    assert by_page[56]["matchesOutOf11"] == 5
    assert by_page[32]["matchesOutOf11"] == 7
    print(json.dumps({
        "externalClaim": "nexon33/cicada3301 LSB-zero x/y-coordinate master index extraction",
        "target": target,
        "otherOriginalPages": [p for p in observations if p["page"] != 57],
        "decision": "The 1543 total is reproducible, but the purported 11-coordinate source selector misses three indices. Five unrelated authentic pages contain all eleven, so coordinate membership is not a discriminating hidden-data test.",
    }, indent=2))


if __name__ == "__main__":
    main()
