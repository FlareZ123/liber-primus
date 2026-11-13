"""Bounded original-source AN END alternate SHA-512-sized digest preimage screen.

This is a read-only exact-byte file check, not a hash inversion or plaintext decoder.
Python 3.10+, pip packages pyskein and gostcrypto, and OpenSSL 3 legacy provider.
Inputs are the 58 original LP2 JPEGs, a few archival 2014 messages / HTML,
and source table bytes; no edited JPEGs, re-encoded text or prefix matching.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess

import gostcrypto
import skein


ROOT = Path(__file__).resolve().parent.parent
RESOURCES = ROOT / "resources"
TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)

SKEIN_EMPTY = (
    "bc5b4c50925519c290cc634277ae3d6257212395cba733bbad37a4af0fa06af"
    "41fca7903d06564fea7a2d3730dbdb80c1f85562dfcc070334ea4d1d9e72cba7a"
)
STREEBOG_EMPTY = (
    "8e945da209aa869f0455928529bcae4679e9873ab707b55315f56ceb98bef0a7"
    "362f715528356ee83cda5f2aac4c6ad2ba3a715c1bcd81cb8e9f90bf4c1c1a8a"
)
WHIRLPOOL_EMPTY = (
    "19fa61d75522a4669b44e39c1d2e1726c530232130d407f89afee0964997f7a7"
    "3e83be698b288febcf88e3e03c4f0757ea8964e59b63d93708b138cc42a66eb3"
)


def digest(data: bytes) -> dict[str, str]:
    """Three authentic full 512-bit hash algorithms (no truncation or salting)."""
    whirlpool = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool", "-binary"],
        input=data,
        capture_output=True,
        check=True,
    ).stdout.hex()
    return {
        "skein512_512": skein.skein512(data, digest_bits=512).hexdigest(),
        "streebog512": gostcrypto.gosthash.new(
            "streebog512", data=data
        ).hexdigest(),
        "whirlpool": whirlpool,
    }


def main() -> None:
    assert len(TARGET) == 128
    assert bytes.fromhex(TARGET).hex() == TARGET

    kat = digest(b"")
    assert kat == {
        "skein512_512": SKEIN_EMPTY,
        "streebog512": STREEBOG_EMPTY,
        "whirlpool": WHIRLPOOL_EMPTY,
    }, f"Published empty-message test-vector failure: {kat}"

    positive = digest(b"AN END original-positive-plant")
    assert len(positive) == 3
    assert len(set(positive.values())) == 3
    assert all(len(value) == 128 for value in positive.values())
    for name, expected in positive.items():
        assert digest(b"AN END original-positive-plant")[name] == expected

    scans = [
        RESOURCES / "liber-primus" / f"{scan:02d}.jpg"
        for scan in range(17, 75)
    ]
    assert len(scans) == 58
    assert all(f.is_file() for f in scans), "Original LP2 JPEG input missing"

    extras = [
        RESOURCES / "cicada2014-onion7-index.html",
        RESOURCES / "historical" / "stage11-2014-index.html",
        RESOURCES / "historical" / "cicada2014-stage11-message.asc",
        RESOURCES / "historical" / "cicada2014-stage09-first-jpeg-recovered.asc",
        RESOURCES / "historical" / "cicada2014-onion2-20140107-170byte.html",
        RESOURCES / "historical" / "cicada2014-onion2-20140107-201byte.html",
    ]
    assert all(f.is_file() for f in extras), "Frozen historical 2014 source missing"

    grid = json.loads((RESOURCES / "liber-primus" / "lp2-grid-256.json").read_text(encoding="utf8"))
    grid_bytes = bytes(grid["bytes"])
    assert len(grid_bytes) == 256
    assert grid_bytes[0] == 203
    candidates = [(str(f.relative_to(ROOT)), f.read_bytes()) for f in scans + extras]
    candidates.append(("resources/liber-primus/lp2-grid-256.json:raw_256_bytes", grid_bytes))

    matches: list[dict[str, object]] = []
    totals = [0, 0]
    for name, data in candidates:
        totals[0] += 1
        totals[1] += len(data)
        hashes = digest(data)
        for algorithm, value in hashes.items():
            if value == TARGET:
                matches.append({
                    "source": name,
                    "algorithm": algorithm,
                    "bytes": len(data),
                    "source_sha256": hashlib.sha256(data).hexdigest(),
                    "target": TARGET,
                })
        print(f"SCANNED {name} bytes={len(data)} sha256={hashlib.sha256(data).hexdigest()}", flush=True)

    print(json.dumps({
        "source": "original p56 AN END 128-character value",
        "target": TARGET,
        "algorithms": list(kat),
        "test_vectors": "three published 512-bit empty-message KATs passed",
        "positive_control": "all three algorithms rehashed exact input",
        "original_source_files": totals[0],
        "source_bytes": totals[1],
        "candidate_hashes": totals[0] * 3,
        "matching_sources": matches,
        "scope": "only unchanged full native bytes of 58 LP2 JPEGs, six explicit historical 2014 text carriers, and the original 256-byte grid, no hidden page or unknown text",
    }, indent=2))
    if matches:
        print("EXACT MATCH: inspect the original object immediately")
    else:
        print("PASS: bounded original-source alternate-512 digest screen, no match")


if __name__ == "__main__":
    main()
