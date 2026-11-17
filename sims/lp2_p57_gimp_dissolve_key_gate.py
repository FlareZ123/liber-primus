#!/usr/bin/env python3
"""Bounded test: does the p57 legacy-GIMP dissolve field directly pad LP2 GP29 runes?

Run from any directory. Requires NumPy and the repository's canonical lp2-corpus.json.
This tests only row-major crop order, no offset/reversal/resampling/page reset.
"""
from pathlib import Path
import json
import numpy as np

SEED = 314159265
HEIGHT = 293
WIDTH = 267
X_SKIP = 4
Y_OFFSET = 9
EXPECTED_MASTER_SEEDS = [
    3721122731, 618219707, 807213306, 3144837749, 3447982176,
    3230631767, 755972506, 1398685501, 3196876378, 1337812403,
]
EXPECTED_ROW0 = [
    254, 36, 200, 76, 154, 130, 146, 88, 168, 26,
    86, 84, 114, 176, 79, 54, 216, 79, 247, 239,
]


def gimp_legacy_threshold_crop():
    """Reproduce the 293x267 crop: 4096 row seeds, y-9 row selection, x+4 skip."""
    master = np.random.RandomState(SEED)
    row_seeds = master.randint(0, 2**32, size=4096, dtype=np.uint32)
    assert row_seeds[:10].tolist() == EXPECTED_MASTER_SEEDS

    rows = []
    for y in range(HEIGHT):
        row_rng = np.random.RandomState(int(row_seeds[(y - Y_OFFSET) % 4096]))
        raw = row_rng.randint(
            0, 2**32, size=WIDTH + X_SKIP, dtype=np.uint32
        )
        rows.append((raw[X_SKIP:] % np.uint32(255)).astype(np.uint8))
    field = np.stack(rows)
    assert field.shape == (HEIGHT, WIDTH)
    assert field[0, :20].astype(int).tolist() == EXPECTED_ROW0
    return field


def ioc(values):
    values = np.asarray(values, dtype=np.int64)
    counts = np.bincount(values, minlength=29)
    n = len(values)
    return float(np.sum(counts * (counts - 1)) / (n * (n - 1)))


def main():
    root = Path(__file__).resolve().parents[1]
    corpus = json.loads(
        (root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
    )
    pages = corpus["pages"][:56]  # p50 is the numeric-only, empty page.
    cipher = [int(v) for page in pages for v in page["indices"]]
    assert len(cipher) == 12956
    assert sum(bool(page["indices"]) for page in pages) == 55

    field = gimp_legacy_threshold_crop()
    raw_key = field.reshape(-1)[:len(cipher)].astype(np.int64)
    translit = corpus["translit"]

    candidates = []
    reductions = {
        "R mod 29": raw_key % 29,
        "floor(29R/255)": (raw_key * 29) // 255,
    }
    for reduction_name, key in reductions.items():
        for sign_name, sign in (("C-K", -1), ("C+K", 1)):
            decoded = [(c + sign * int(k)) % 29 for c, k in zip(cipher, key)]
            candidates.append({
                "candidate": f"{reduction_name} {sign_name}",
                "ioc": ioc(decoded),
                "first_80_translit": "".join(translit[x] for x in decoded[:80]),
            })

    print(json.dumps({
        "hypothesis": "first 12956 row-major p57 GIMP dissolve thresholds are a direct GP29 pad",
        "field": {
            "shape": [HEIGHT, WIDTH],
            "seed": SEED,
            "master_row_seeds": 4096,
            "x_skip": X_SKIP,
            "y_offset": Y_OFFSET,
            "values": int(field.size),
            "min": int(field.min()),
            "max": int(field.max()),
        },
        "target": {
            "pages": "LP2 p0-p55 in source order; p50 empty",
            "runes": len(cipher),
            "raw_ioc": ioc(cipher),
            "known_p57_plaintext_ioc": ioc(corpus["pages"][57]["indices"]),
        },
        "candidates": candidates,
        "decision": "Reject direct additive/subtractive GP29 use of this raster stream; do not expand offsets or alternate projections without an independent instruction.",
    }, indent=2))


if __name__ == "__main__":
    main()
