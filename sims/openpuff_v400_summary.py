#!/usr/bin/env python3
"""Aggregate only 58 authenticated-workflow LP2 JPEG result records.

The separate 2014 positive-control artifact is intentionally excluded.
"""
import json
from pathlib import Path

from openpuff_v400_extract import write_json_atomic


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "probe-output"
ORDER = [*range(50, 57), *range(17, 50), *range(57, 75)]


def aggregate(output_dir=OUTPUT):
    assert sorted(ORDER) == list(range(17, 75))
    records = []
    for archive_index in ORDER:
        stem = f"{archive_index:02d}"
        path = output_dir / f"p{stem}" / "result.json"
        result = json.loads(path.read_text(encoding="utf-8"))
        if result["carrier_basename"] != f"{stem}.jpg":
            raise ValueError(f"Result is for another source image: {path}")
        records.append({
            "archive_jpg": f"{stem}.jpg",
            "physical_lp2_page": archive_index - 17,
            "result": result,
        })
    if len(records) != 58:
        raise RuntimeError("Incomplete 58-image OpenPuff evidence")
    write_json_atomic(output_dir / "summary.json", records)
    return records


if __name__ == "__main__":
    data = aggregate()
    print(f"Recorded {len(data)} source-identifiable LP2 candidates.")
    print(f"Files present: {sum(bool(item['result']['output_present']) for item in data)}.")
