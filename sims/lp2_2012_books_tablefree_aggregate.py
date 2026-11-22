#!/usr/bin/env python3
"""Aggregate 2012 book-key stage1 original-source shards (Issue #1191)."""
import argparse
import json
from pathlib import Path
import tempfile
import os

FORMATS = ("digraph", "letters")
N = 29
W = 729
STRIDE = 8


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--folder", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--scope", choices=("smoke", "full"), required=True)
    args = ap.parse_args()
    parts = [json.loads(f.read_text(encoding="utf-8")) for f in sorted(args.folder.glob("part-*.json"))]
    required = 32 if args.scope == "full" else 1
    assert len(parts) == required, (len(parts), required)
    assert sorted(p["shard"] for p in parts) == list(range(required))
    reference = parts[0]
    for p in parts:
        for field in ("upstream", "book_name", "book_blob_sha1", "book_raw_sha256",
                      "walden_raw_sha256", "corpus_sha256", "threshold",
                      "section_page_ranges", "window_size", "beam",
                      "per_ptr", "spread", "skip_q", "shards", "scope"):
            assert p[field] == reference[field], ("shard mismatch", field)
        assert p["shards"] == 32

    result = {
        "source": {name: reference[name] for name in
                   ("upstream", "book_name", "book_blob_sha1", "book_raw_sha256",
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
        rows = []
        for section in range(8):
            top = max((p["formats"][fmt]["best_by_section"][section]["score"],
                       p["formats"][fmt]["best_by_section"][section]["offset"])
                      for p in parts)
            rows.append({"section": section, "max_score": float(top[0]),
                         "key_offset": int(top[1]),
                         "crossed_threshold": bool(top[0] > reference["threshold"][fmt])})
        hits = [h for p in parts for h in p["formats"][fmt]["stage1_hits"]]
        # The source-positive RNG restarts per shard; float beam scores may
        # differ in low bits across runners, so full-JSON deduplication
        # overcounts logically identical plants. Index by run position instead.
        plant_by_shard = [p["formats"][fmt]["plant"] for p in parts]
        neg_by_shard = [p["formats"][fmt]["negative_controls"] for p in parts]
        assert all(len(x) == 6 for x in plant_by_shard)
        assert all(len(x) == 18 for x in neg_by_shard)
        for idx in range(6):
            assert len({bool(row[idx]["pass"]) for row in plant_by_shard}) == 1, (
                "Plant decision changed across shards", fmt, idx)
        for idx in range(18):
            assert len({bool(row[idx]["pass"]) for row in neg_by_shard}) == 1, (
                "Null decision changed across shards", fmt, idx)
            assert len({row[idx]["kind"] for row in neg_by_shard}) == 1
        plant_records = [item for row in plant_by_shard for item in row]
        negative_records = [item for row in neg_by_shard for item in row]
        unique_plants = plant_by_shard[0]
        unique_negatives = neg_by_shard[0]
        result["formats"][fmt] = {
            "key_runes": length,
            "screen_offsets": total,
            "section_peaks": rows,
            "stage1_hits": sorted(hits, key=lambda h: -h["nats_per_rune"]),
            "plant_passes": sum(bool(x["pass"]) for x in unique_plants),
            "plant_trials": len(unique_plants),
            "plant_passes_repeated": sum(bool(x["pass"]) for x in plant_records),
            "plant_trials_repeated": len(plant_records),
            "negative_control_passes": sum(bool(x["pass"]) for x in unique_negatives),
            "negative_control_trials": len(unique_negatives),
            "negative_control_passes_repeated": sum(bool(x["pass"]) for x in negative_records),
            "negative_control_trials_repeated": len(negative_records)
        }
        print(f"{fmt}: {total} screened offsets, "
              f"{len(hits)} stage-1 crossings, "
              f"{result['formats'][fmt]['plant_passes']}/{result['formats'][fmt]['plant_trials']} unique plants "
              f"({result['formats'][fmt]['plant_passes_repeated']}/{result['formats'][fmt]['plant_trials_repeated']} shard records), "
              f"{result['formats'][fmt]['negative_control_passes']}/{result['formats'][fmt]['negative_control_trials']} unique nulls; "
              f"highest {max(x['max_score'] for x in rows):.6f}",
              flush=True)
        for row in rows:
            print(f"  section{row['section']}: {row['max_score']:.7f} "
                  f"offset={row['key_offset']}, hit={row['crossed_threshold']}",
                  flush=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
                                     dir=args.output.parent, delete=False) as f:
        json.dump(result, f, indent=2)
        f.write("\n")
        temp = f.name
    os.replace(temp, args.output)


if __name__ == "__main__":
    main()
