#!/usr/bin/env python3
"""Screen source-derived 2013/2014 number streams under the independent R4 channel.

The external R4 implementation is loaded from pnotisdev/cicada3301 at the
pinned commit in the companion workflow. This file only constructs the
historical key candidates and invokes that implementation; it does not copy
its decoder.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

PINNED_PNOTISDEV = "15200c395ab457c3196cb30319e8008fadd2b214"
ROOT = Path(__file__).resolve().parents[1]


def canonical_rotation(values: list[int]) -> tuple[int, ...]:
    seq = tuple(int(v) % 29 for v in values)
    if not seq:
        return seq
    return min(seq[i:] + seq[:i] for i in range(len(seq)))


def read_sources():
    prime_text = (ROOT / "resources/external/2013-01-14-missing-primes-pastebin.md").read_text(encoding="utf-8")
    match = re.search(r"~~~~text\s*(.*?)\s*~~~~", prime_text, re.S)
    if not match:
        raise RuntimeError("Could not locate the original 2013 missing-primes block")
    missing_primes = [int(x) for x in re.findall(r"\d+", match.group(1))]
    if len(missing_primes) != 180:
        raise RuntimeError(f"Expected 180 source-listed missing primes, found {len(missing_primes)}")

    square_text = (ROOT / "resources/cicada2014-openpuff-magic-squares.txt").read_text(encoding="utf-8")
    groups = [
        [int(x) for x in re.findall(r"\d+", block)]
        for block in re.split(r"\n\s*\n", square_text.strip())
    ]
    squares5 = [g for g in groups if len(g) == 25]
    if len(squares5) != 2:
        raise RuntimeError(f"Expected two 5x5 source squares, found {[len(g) for g in groups]}")

    return missing_primes, squares5


def build_keyset():
    missing_primes, squares5 = read_sources()
    rank = list(range(21, 201))  # The source identifies the omitted interval as p21..p200.
    gaps = [missing_primes[0] - 71] + [
        missing_primes[i] - missing_primes[i - 1] for i in range(1, len(missing_primes))
    ]

    # These are source-motivated functions on the 2013 prime sequence:
    # identity, Euler phi(p)=p-1, sigma(p)=p+1, prime ordinal, and next-prime gap.
    prime_streams = [
        ("2013_missing_primes_value", missing_primes),
        ("2013_missing_primes_phi", [p - 1 for p in missing_primes]),
        ("2013_missing_primes_sigma", [p + 1 for p in missing_primes]),
        ("2013_missing_primes_ordinal", rank),
        ("2013_missing_primes_gap", gaps),
    ]

    # The two 5x5 matrices are the two 25-entry blocks in the original
    # OpenPuff magic-square reference; the 7x7 block was already covered by
    # pnotisdev's Phase 60 T2 number-key screen.
    raw_streams = list(prime_streams)
    for i, square in enumerate(squares5, 1):
        raw_streams.append((f"2014_openpuff_5x5_block{i}_row_major", square))

    transforms = [
        ("mod29", lambda x: x),
        ("minus1_mod29", lambda x: x - 1),
        ("plus1_mod29", lambda x: x + 1),
    ]

    unique: dict[tuple[int, ...], list[str]] = {}
    for label, source in raw_streams:
        for transform_name, transform in transforms:
            for direction, oriented in (("forward", source), ("reversed", list(reversed(source)))):
                key = canonical_rotation([transform(x) for x in oriented])
                if len(key) < 3:
                    continue
                unique.setdefault(key, []).append(f"{label}/{transform_name}/{direction}")

    keys = [list(k) for k in unique]
    tags = ["; ".join(unique[k]) for k in unique]
    manifest = [
        {"tag": tag, "length": len(key), "key": key}
        for key, tag in zip(keys, tags)
    ]
    return keys, tags, manifest


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python sims/pnotisdev_r4_extra_source_keys.py <pnotisdev-checkout> [workers]")
    p_root = Path(sys.argv[1]).resolve()
    workers = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    if not (p_root / "work/phase59_keywords_r4.py").exists():
        raise SystemExit(f"Missing pnotisdev checkout at {p_root}")

    sys.path.insert(0, str(p_root / "work"))
    import phase59_keywords_r4 as r4  # noqa: E402

    keys, tags, manifest = build_keyset()
    out = r4.C.OUT / "phase60_r4_extra_source_keys"
    out.mkdir(parents=True, exist_ok=True)
    r4.OUT = out

    (out / "keys.json").write_text(
        json.dumps({"keys": keys, "tags": tags}, separators=(",", ":")),
        encoding="utf-8",
    )
    (out / "key_manifest.json").write_text(
        json.dumps(
            {
                "external_engine": f"pnotisdev/cicada3301@{PINNED_PNOTISDEV}",
                "channel": "R4 mid-word-null / lag-six repair candidate model",
                "sources": [
                    "resources/external/2013-01-14-missing-primes-pastebin.md",
                    "resources/cicada2014-openpuff-magic-squares.txt",
                ],
                "keys": manifest,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Prepared {len(keys)} rotation-unique keys from 2013 prime data and two 5x5 matrices.")
    for tag, key in zip(tags, keys):
        print(f"  len={len(key):3d}  {tag}")

    print("\nRunning planted controls...")
    r4.cmd_control(workers)
    control_files = sorted((out / "control").glob("*.json"))
    controls = [json.loads(p.read_text(encoding="utf-8")) for p in control_files]
    passed = sum(bool(x.get("true_found")) for x in controls)
    print(f"R4 controls: {passed}/{len(controls)} recovered at the planted key/sign/phase")
    if len(controls) < 10 or passed < 8:
        raise SystemExit("R4 control sensitivity was insufficient; refusing to interpret the ciphertext scan.")

    print("\nRunning all LP2 windows...")
    r4.cmd_scan(workers, 0, False)
    r4.summary()
    generic_summary = p_root / "results/analysis/phase59_keywords_r4.txt"
    if generic_summary.exists():
        shutil.copyfile(generic_summary, p_root / "results/analysis/phase60_r4_extra_source_keys.txt")

    scan_files = sorted((out / "scan").glob("*.json"))
    scans = [json.loads(p.read_text(encoding="utf-8")) for p in scan_files]
    if scans:
        best = max(scans, key=lambda x: x.get("best", float("-inf")))
        print(
            f"FINAL: {len(scans)} windows; max S_guard={best['best']:.2f}; "
            f"section={best.get('sec')} start={best.get('start')}; "
            f"cells>=20={sum(x.get('n_hot', 0) for x in scans)}; "
            f"windows>=T300={sum(x.get('best', 0) >= r4.C.T300 for x in scans)}; "
            f"T300={r4.C.T300:.2f}"
        )


if __name__ == "__main__":
    main()
