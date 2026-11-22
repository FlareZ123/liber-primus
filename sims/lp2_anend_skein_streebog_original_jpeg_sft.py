"""
Conditional original-asset preimage gate for two untested 512-bit hash families.

AN END (LP2 p56) prints a 512-bit digest without specifying the algorithm.
Check the 75 original first/second-release JPEG entity bytes and three exact
first-party 2014 source files as candidates under
the Skein-512-512 and Streebog-512 algorithms. This is a narrow exact-byte check,
not a general preimage search or an assumption about the missing onion's origin.

Windows 11 / Python 3.11:
    python -m pip install pyskein gostcrypto
    python sims/lp2_anend_skein_streebog_original_jpeg_sft.py

No output files, mutations, cryptographic guesses, or external requests.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import gostcrypto
import skein

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "resources" / "liber-primus"
TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)

SKEIN_EMPTY = (
    "bc5b4c50925519c290cc634277ae3d6257212395cba733bbad37a4af0fa06af4"
    "1fca7903d06564fea7a2d3730dbdb80c1f85562dfcc070334ea4d1d9e72cba7a"
)
STREEBOG_EMPTY = (
    "8e945da209aa869f0455928529bcae4679e9873ab707b55315f56ceb98bef0a7"
    "362f715528356ee83cda5f2aac4c6ad2ba3a715c1bcd81cb8e9f90bf4c1c1a8a"
)


def streebog512(data: bytes) -> str:
    """Return the unkeyed 512-bit GOST R 34.11-2012 digest."""
    return gostcrypto.gosthash.new("streebog512", data=data).hexdigest()


def run() -> dict:
    """Compare two KAT-validated hash families with bounded original assets."""
    assert len(TARGET) == 128
    assert skein.skein512(b"", digest_bits=512).hexdigest() == SKEIN_EMPTY
    assert streebog512(b"") == STREEBOG_EMPTY
    images = sorted(IMAGES.glob("[0-9][0-9].jpg"))
    assert len(images) == 75, "The original release must contain 00.jpg–74.jpg"
    assert [p.name for p in images] == [f"{i:02d}.jpg" for i in range(75)]
    matches = []
    scanned_bytes = 0
    samples = []
    primary_sources = [
        ROOT / "resources" / "cicada2014-onion7-index.html",
        ROOT / "resources" / "cicada2014-may2-signed-message.asc",
        ROOT / "resources" / "cicada2014-openpuff-magic-squares.txt",
    ]
    sources = images + primary_sources
    for image in sources:
        original = image.read_bytes()
        scanned_bytes += len(original)
        methods = {
            "Skein-512-512": skein.skein512(original, digest_bits=512).hexdigest(),
            "Streebog-512": streebog512(original),
        }
        assert all(len(digest) == 128 for digest in methods.values())
        for name, digest in methods.items():
            if digest == TARGET:
                matches.append({"file": image.name, "algorithm": name,
                                "sha256": hashlib.sha256(original).hexdigest(),
                                "digest": digest})
        if image.name in {"00.jpg", "17.jpg", "56.jpg", "73.jpg", "74.jpg", "cicada2014-onion7-index.html", "cicada2014-may2-signed-message.asc"}:
            samples.append({"file": image.name,
                            "bytes": len(original),
                            "sha256": hashlib.sha256(original).hexdigest(),
                            **methods})
    report = {
        "originalAssets": len(images),
        "historicalFirstPartySources": [p.name for p in primary_sources],
        "exactEntityBytes": scanned_bytes,
        "digestFamilies": ["Skein-512-512", "Streebog-512"],
        "knownAnswerTests": 2,
        "preimageChecks": len(sources) * 2,
        "matchedTarget": bool(matches),
        "matches": matches,
        "sampleChecksums": samples,
        "scope": "Original JPEG bytes plus three first-party 2014 source files in repository; unknown target page, URL, headers and alternative serializations remain open",
    }
    print(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    run()
