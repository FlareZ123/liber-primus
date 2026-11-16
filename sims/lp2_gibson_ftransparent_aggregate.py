#!/usr/bin/env python3
"""Aggregate source-hash-verified LP2 GIBSON-F stage1 shards (Issue #1186)."""
import argparse
import json
from pathlib import Path
import tempfile
import os
from filelock import FileLock

FORMATS = ("digraph", "letters")
N = 29
W = 729
STRIDE = 8


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--folder", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--scope", choices=("smoke", "full", "tail"), required=True)
    args = ap.parse_args()
    parts = [json.loads(f.read_text(encoding="utf-8")) for f in sorted(args.folder.glob("part-*.json"))]
    required = 4 if args.scope in ("full", "tail") else 1
    assert len(parts) == required, (len(parts), required)
    assert sorted(p["shard"] for p in parts) == list(range(required))
    reference = parts[0]
    for p in parts:
        for field in ("upstream", "gibson_ftransparent_blob_sha1", "gibson_ftransparent_raw_sha256",
                      "walden_raw_sha256", "corpus_sha256", "threshold",
                      "section_page_ranges", "window_size", "beam",
                      "per_ptr", "spread", "skip_q", "shards", "scope"):
            assert p[field] == reference[field], ("shard mismatch", field)
        assert p["shards"] == 4

    result = {
        "source": {name: reference[name] for name in
                   ("upstream", "gibson_ftransparent_blob_sha1", "gibson_ftransparent_raw_sha256",
                    "walden_raw_sha256", "corpus_sha256")},
        "window": W, "scope": args.scope, "shards": len(parts),
        "threshold": reference["threshold"], "formats": {}
    }
    for fmt in FORMATS:
        ks = {p["formats"][fmt]["key_runes"] for p in parts}
        assert len(ks) == 1
        length = next(iter(ks))
        total = sum(p["formats"][fmt]["offsets_tested"] for p in parts)
        if args.scope == "full":
            expected = len(range(0, length - 3 * W, STRIDE))
            assert total == expected, (fmt, total, expected)
        if args.scope == "tail":
            lo = length - 3 * W
            start = ((lo + STRIDE - 1) // STRIDE) * STRIDE
            expected = len(range(start, length - W - 128, STRIDE))
            assert total == expected, (fmt, total, expected)
        rows = []
        for section in range(8):
            top = max((p["formats"][fmt]["best_by_section"][section]["score"],
                       p["formats"][fmt]["best_by_section"][section]["offset"])
                      for p in parts)
            rows.append({"section": section, "max_score": float(top[0]),
                         "key_offset": int(top[1]),
                         "crossed_threshold": bool(top[0] > reference["threshold"][fmt])})
        hits = [h for p in parts for h in p["formats"][fmt]["stage1_hits"]]
        result["formats"][fmt] = {
            "key_runes": length,
            "screen_offsets": total,
            "section_peaks": rows,
            "stage1_hits": sorted(hits, key=lambda h: -h["nats_per_rune"]),
            "plant_passes": sum(x["pass"] for x in reference["formats"][fmt]["plant"]),
            "plant_trials": 6
        }
        print(f"{fmt}: {total} screened offsets, "
              f"{len(hits)} stage-1 crossings, "
              f"{result['formats'][fmt]['plant_passes']}/6 distinct native plants; "
              f"highest {max(x['max_score'] for x in rows):.6f}",
              flush=True)
        for row in rows:
            print(f"  section{row['section']}: {row['max_score']:.7f} "
                  f"offset={row['key_offset']}, hit={row['crossed_threshold']}",
                  flush=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(args.output) + ".lock"):
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
                                         dir=args.output.parent, delete=False) as f:
            json.dump(result, f, indent=2)
            f.write("\n")
            temp = f.name
        os.replace(temp, args.output)


if __name__ == "__main__":
    main()
