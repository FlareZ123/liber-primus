#!/usr/bin/env python3
"""Exact source-byte inventory for all 58 original LP2 JPEG containers.

Usage: python sims/lp2_jpeg_container_offset_inventory_sft.py [image-directory]
Outputs JSON containing each file SHA-256, marker offsets/lengths, SOS and
entropy byte boundaries, EOI position, and ancillary metadata classifications.
"""
from __future__ import annotations
import json
import sys
from collections import Counter
from pathlib import Path
from lp2_jpeg_marker_audit import audit

ROOT = Path(__file__).resolve().parents[1]
BASE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "resources" / "liber-primus"
rows = []
dqt_payloads = Counter()
dht_signatures = set()
for n in range(17, 75):
    path = BASE / (str(n) + ".jpg")
    row = audit(path)
    assert row["error"] is None, (path, row["error"])
    assert row["scan_count"] == 1 and row["trailing_bytes"] == 0, path
    assert row["restart_markers"] == [] and row["eoi_offset"] == row["bytes"] - 2, path
    markers = row["markers"]
    assert [m["name"] for m in markers if m["name"].startswith("APP")] == ["APP0", "APP2"], path
    assert not any(m["name"] == "COM" for m in markers), path
    jfif = next(m["jfif"] for m in markers if "jfif" in m)
    assert jfif == {"version":[1,1],"units":1,"x_density":400,"y_density":400,"thumbnail_width":0,"thumbnail_height":0,"thumbnail_bytes":0}, path
    icc = next(m["icc"] for m in markers if "icc" in m)
    assert icc["sequence"] == icc["total"] == 1 and icc["data_length"] == 2576, path
    sof = next(m for m in markers if m["name"] == "SOF0")
    assert (sof["width"], sof["height"], sof["precision"]) == (2400,3600,8), path
    assert len(sof["components"]) in (1,3), path
    assert not any(m.get("exif") or m.get("xmp") or m.get("iptc_or_photoshop") or m.get("mpf") or m.get("adobe_app14") for m in markers), path
    dqt_payloads.update(m["payload_sha256"] for m in markers if m["name"] == "DQT")
    dht_signatures.add(tuple(m["payload_sha256"] for m in markers if m["name"] == "DHT"))
    raw = path.read_bytes()
    rows.append({
        "physical_page": n-17, "file": str(n) + ".jpg", "bytes": row["bytes"], "sha256": row["sha256"],
        "marker_sequence": [m["name"] for m in markers],
        "segments": [{k:m[k] for k in ("name","offset","length_offset","segment_length","payload_offset","payload_length","payload_sha256")} for m in markers if "segment_length" in m],
        "jfif": jfif, "icc": icc,
        "sof0": {k:sof[k] for k in ("offset","width","height","precision","components")},
        "scans": row["scans"], "eoi_offset": row["eoi_offset"], "trailing_bytes": row["trailing_bytes"],
        "raw_soi_count": raw.count(b"\xff\xd8"), "raw_eoi_count": raw.count(b"\xff\xd9")
    })

assert len(rows) == 58
assert Counter(len(r["sof0"]["components"]) for r in rows) == {1:23,3:35}
assert len({r["icc"]["data_sha256"] for r in rows}) == 1
assert len({r["segments"][0]["payload_sha256"] for r in rows}) == 1
assert len({r["segments"][1]["payload_sha256"] for r in rows}) == 1
assert all(r["raw_soi_count"] == r["raw_eoi_count"] == 1 and r["trailing_bytes"] == 0 for r in rows)
assert dict(dqt_payloads) == {
    "31ebb9300d2f056cdb8ec3ff1ca73a358978675dfc0bd3d250d7d651b0674c93":58,
    "441cfb11d25025cfb0c3e5eb3fe0f15d4e63e5bb7cbc148a974245cd7f7b2d46":35,
}
assert rows[0]["segments"][0]["payload_sha256"] == "fb259e3d53dc86ac12d161aef88d442454ba017b260166043144cf2378b74f1e"
assert rows[0]["segments"][1]["payload_sha256"] == "62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f"
assert rows[0]["icc"]["data_sha256"] == "942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0"
assert sum(r["bytes"] for r in rows) == 35362230
assert sum(r["scans"][0]["stuffed_bytes"] for r in rows) == 130739
assert len(dht_signatures) == 58

summary = {
    "files":58, "total_bytes":sum(r["bytes"] for r in rows), "dimensions":"2400x3600",
    "components":{"grayscale":23,"RGB":35},
    "marker_sequence_groups":dict(Counter(" ".join(r["marker_sequence"]) for r in rows)),
    "APP_segments":116, "JFIF":"1.1; density 400x400; no embedded thumbnail",
    "ICC":"one 2576-byte chunk per image, sequence 1/1; identical all 58",
    "APP0_payload_sha256":rows[0]["segments"][0]["payload_sha256"],
    "APP2_payload_sha256":rows[0]["segments"][1]["payload_sha256"],
    "ICC_profile_sha256":rows[0]["icc"]["data_sha256"],
    "DQT_payload_sha256_counts":dict(dqt_payloads),
    "distinct_combined_DHT_signatures":len(dht_signatures),
    "EXIF_XMP_IPTC_COM_MPF_APP14_other_APP":"absent",
    "raw_SOI_EOI":"one each per file", "scan_count":58, "trailing_bytes":0,
    "restart_markers":0, "entropy_stuffed_bytes":sum(r["scans"][0]["stuffed_bytes"] for r in rows)
}
print(json.dumps({"schema":"lp2-jpeg-container-offset-inventory-v1","source":"resources/liber-primus/17.jpg–74.jpg","scope":"physical pages p0–p57, including solved p56/p57 controls","summary":summary,"files":rows},separators=(",",":")))
