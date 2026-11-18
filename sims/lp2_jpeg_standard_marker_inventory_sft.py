#!/usr/bin/env python3
"""Assert the LP2-wide standard-JPEG marker inventory for Director #1644."""
from __future__ import annotations

import importlib.util
import statistics
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "resources" / "liber-primus"
AUDIT_PATH = ROOT / "sims" / "lp2_jpeg_marker_audit.py"

spec = importlib.util.spec_from_file_location("jpeg_marker_audit", AUDIT_PATH)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
audit = module.audit


def marker_signature(row: dict) -> str:
    return "/".join(item["name"] for item in row["markers"])


def sof(row: dict) -> dict:
    return next(item for item in row["markers"] if item["name"].startswith("SOF"))


def payload_hashes(row: dict, name: str) -> tuple[str, ...]:
    return tuple(
        item["payload_sha256"]
        for item in row["markers"]
        if item["name"] == name
    )


def dht_bytes(row: dict) -> int:
    return sum(
        item["payload_length"] + 4
        for item in row["markers"]
        if item["name"] == "DHT"
    )


rows = [audit(BASE / f"{index:02d}.jpg") for index in range(75)]
assert all(row["error"] is None for row in rows)

lp2 = rows[17:75]
assert len(lp2) == 58
assert Counter(row["trailing_bytes"] for row in lp2) == Counter({0: 58})
assert Counter(row["scan_count"] for row in lp2) == Counter({1: 58})
assert sum(
    item["name"] == "COM"
    for row in lp2
    for item in row["markers"]
) == 0

dimensions = Counter(
    (
        sof(row)["height"],
        sof(row)["width"],
        len(sof(row)["components"]),
        sof(row)["precision"],
    )
    for row in lp2
)
assert dimensions == Counter({
    (3600, 2400, 3, 8): 35,
    (3600, 2400, 1, 8): 23,
})

signatures = Counter(marker_signature(row) for row in lp2)
assert signatures == Counter({
    "APP0/APP2/DQT/DQT/SOF0/DHT/DHT/DHT/DHT/SOS/EOI": 35,
    "APP0/APP2/DQT/SOF0/DHT/DHT/SOS/EOI": 23,
})

app_signatures = {
    (
        payload_hashes(row, "APP0"),
        payload_hashes(row, "APP2"),
    )
    for row in lp2
}
assert len(app_signatures) == 1

color = [row for row in lp2 if len(sof(row)["components"]) == 3]
gray = [row for row in lp2 if len(sof(row)["components"]) == 1]
assert len({payload_hashes(row, "DQT") for row in color}) == 1
assert len({payload_hashes(row, "DQT") for row in gray}) == 1
assert len({payload_hashes(row, "DHT") for row in lp2}) == 58

trailing_controls = [
    (index, row["trailing_bytes"])
    for index, row in enumerate(rows)
    if row["trailing_bytes"]
]
assert trailing_controls == [(5, 336713), (10, 3486295)]

icc_probe = (BASE / "44.jpg").read_bytes()
assert b"Artifex Software sRGB ICC Profile" in icc_probe
assert b"Copyright Artifex Software 2011" in icc_probe

sizes = [row["bytes"] for row in lp2]
mean = statistics.mean(sizes)
sd = statistics.pstdev(sizes)

targets = []
for jpg, page in [(44, 27), (67, 50), (72, 55)]:
    row = rows[jpg]
    rank = sorted(sizes).index(row["bytes"]) + 1
    targets.append({
        "page": page,
        "jpg": jpg,
        "size": row["bytes"],
        "rank": f"{rank}/58",
        "z": (row["bytes"] - mean) / sd,
        "components": len(sof(row)["components"]),
        "dht_bytes": dht_bytes(row),
        "trailing": row["trailing_bytes"],
        "marker_signature": marker_signature(row),
    })

assert [(x["jpg"], x["size"], x["dht_bytes"], x["trailing"]) for x in targets] == [
    (44, 580041, 259, 0),
    (67, 581983, 149, 0),
    (72, 614928, 232, 0),
]

print({
    "status": "PASS: no LP2 standard-marker payload or source-selected JPEG anomaly",
    "lp2_count": len(lp2),
    "marker_signatures": dict(signatures),
    "dimensions": dict(dimensions),
    "shared_app_signature_count": len(app_signatures),
    "color_dqt_signatures": len({payload_hashes(row, "DQT") for row in color}),
    "gray_dqt_signatures": len({payload_hashes(row, "DQT") for row in gray}),
    "distinct_dht_signatures": len({payload_hashes(row, "DHT") for row in lp2}),
    "lp2_trailing_pages": [],
    "pre_lp2_trailing_controls": trailing_controls,
    "targets": targets,
})
