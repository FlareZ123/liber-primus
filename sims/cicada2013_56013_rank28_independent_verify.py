#!/usr/bin/env python3
"""Check the independent C++ scan and produce a compact, source-bound result artifact."""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path


def close(a: float, b: float, tol: float = 1e-9) -> bool:
    return abs(a - b) <= tol


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: verify.py INPUT_METADATA.json CPP_SCAN.json OUTPUT.json")
    metadata_path, scan_path, output_path = map(Path, sys.argv[1:])
    meta = json.loads(metadata_path.read_text(encoding="utf-8"))
    scan = json.loads(scan_path.read_text(encoding="utf-8"))
    lp1 = list((metadata_path.parent / "lp1.bin").read_bytes())
    tokens = meta["tokens"]

    assert meta["iso"]["bytes"] == 136_398_848
    assert meta["iso"]["sha256"] == "784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f"
    assert meta["member"]["bytes"] == 118_818_811
    assert meta["member"]["sha256"] == "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f"
    assert meta["receiver"]["gp29_runes"] == 729
    assert meta["positive_control"]["original_solved_lp1_runes"] == 755
    assert len(lp1) == 729
    assert scan["inverse_selftest"].startswith("PASS")

    expected = {
        "delta_rank28": {
            "max": -46,
            "best_offset": 81_152_333,
            "best_probe": -297,
            "best_chapter": -4376,
            "best_ioc": 0.036238110312184386,
        },
        "excluded_rank28": {
            "max": 2,
            "best_offset": 251_599,
            "best_probe": -263,
            "best_chapter": -4313,
            "best_ioc": 0.0367845460438053,
        },
    }
    for mode, exp in expected.items():
        r = scan["original"][mode]
        assert r["scanned_offsets"] == 118_818_684, (mode, r["scanned_offsets"])
        assert r["max"] == exp["max"], (mode, r["max"], exp["max"])
        best = r["top_full729"][0]
        assert best["offset"] == exp["best_offset"], (mode, best["offset"], exp["best_offset"])
        assert best["probe_score"] == exp["best_probe"], (mode, best["probe_score"])
        assert best["chapter_score"] == exp["best_chapter"], (mode, best["chapter_score"])
        assert close(best["ioc"], exp["best_ioc"], 1e-12), (mode, best["ioc"])
        assert len(best["runes"]) == 729 and all(0 <= x < 29 for x in best["runes"])
        r["top_full729"][0]["gp_text"] = "".join(tokens[x] for x in best["runes"])
        r["top_full729"][0]["classification"] = "non-plaintext statistical leader; not an authenticated decryption"

    for mode in ("delta_rank28", "excluded_rank28"):
        p = scan["authentic_lp1_positive"][mode]
        assert p["planted_offset"] == 330_103 and p["rank"] == 1
        assert p["first128_score"] == 598
        assert p["chapter_score"] == 3327
        assert close(p["ioc"], 0.06230874749, 1e-10)
        assert p["exact_recovered_runes"] == 729
        assert p["recovered_runes"] == lp1
        p["gp_text"] = "".join(tokens[x] for x in p["recovered_runes"])

    null = scan["null"]
    assert null["replicates"] >= 20
    assert len(null["delta_maxima"]) == len(null["excluded_maxima"]) == len(null["family_maxima"]) == null["replicates"]
    observed = max(scan["original"]["delta_rank28"]["max"], scan["original"]["excluded_rank28"]["max"])
    exceed = sum(1 for x in null["family_maxima"] if x >= observed)
    expected_p = (1 + exceed) / (null["replicates"] + 1)
    assert null["observed_family_max"] == observed
    assert null["familywise_exceedances"] == exceed
    assert close(null["p_familywise"], expected_p)

    output = {
        "classification": "independent C++ original-byte rank28 reproduction; negative for these two exact transports only",
        "source": meta,
        "engine": scan["engine"],
        "inverse_selftest": scan["inverse_selftest"],
        "original": scan["original"],
        "authentic_lp1_positive": scan["authentic_lp1_positive"],
        "null": scan["null"],
        "interpretation": (
            "Both exact rank28 inverses reproduce the published all-offset maxima and best full-729 "
            "candidate scores. The authentic solved-LP1 GP29 positive is recovered exactly and ranks "
            "first. Original DATA/560.13 offsets produce only near-random-register leaders. The "
            "32-byte block-permutation null scans the full offset space under both models and reports "
            "a familywise maximum-statistic p-value. This excludes only the two tested direct rank28 "
            "byte-tape transports; it does not identify the historical LP2 cipher or key."
        ),
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "verified": True,
        "delta": {
            "max": scan["original"]["delta_rank28"]["max"],
            "best_offset": scan["original"]["delta_rank28"]["top_full729"][0]["offset"],
            "best_full729": scan["original"]["delta_rank28"]["top_full729"][0]["chapter_score"],
        },
        "excluded": {
            "max": scan["original"]["excluded_rank28"]["max"],
            "best_offset": scan["original"]["excluded_rank28"]["top_full729"][0]["offset"],
            "best_full729": scan["original"]["excluded_rank28"]["top_full729"][0]["chapter_score"],
        },
        "lp1_positive": {
            m: scan["authentic_lp1_positive"][m]["rank"]
            for m in ("delta_rank28", "excluded_rank28")
        },
        "null": {
            "replicates": null["replicates"],
            "observed_family_max": observed,
            "familywise_exceedances": exceed,
            "p_familywise": expected_p,
        },
        "output": str(output_path),
    }, indent=2))


if __name__ == "__main__":
    main()
