#!/usr/bin/env python3
"""Source-derived GF(29^2) order-56 page-clock gate for LP2.

The p7->p8 source polynomial has irreducible factor x^2-8, so alpha^2=8
has multiplicative order 56 in GF(29^2). This tests the explicit page-clock
fork on unknown physical pages p0..p55 using the 2014 numeric page order.

Decisive invariant: every alpha^e is a monomial 2x2 map. Even powers are
diagonal scalar maps; odd powers are anti-diagonal swap+scale maps. Therefore
for either page-local adjacent-pair registration, the two paired-position
histograms are only relabelled and/or swapped. Their IoCs are invariant for
ANY exponent schedule, not just the 32 natural variants scanned below.

Run:
    python sims/lp2_p7_gf841_order56_pageclock_sft.py
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
GIBRAN = (ROOT / "resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8")
MOD = 29

PAGES = [p for p in CORPUS["pages"] if p["page"] <= 55 and p.get("indices")]
assert len(PAGES) == 55
assert sum(len(p["indices"]) for p in PAGES) == 12956
assert [p["page"] for p in PAGES] == list(range(50)) + list(range(51, 56))


def gf_mul(x: tuple[int, int], y: tuple[int, int]) -> tuple[int, int]:
    """Multiply a+b*alpha in GF(29)[alpha]/(alpha^2-8)."""
    a, b = x
    c, d = y
    return ((a*c + 8*b*d) % MOD, (a*d + b*c) % MOD)


def alpha_pow(e: int, root_sign: int = 1) -> tuple[int, int]:
    base = (0, root_sign % MOD)
    out = (1, 0)
    e %= 56
    while e:
        if e & 1:
            out = gf_mul(out, base)
        base = gf_mul(base, base)
        e >>= 1
    return out


assert alpha_pow(28) == (28, 0)
assert alpha_pow(56) == (1, 0)
assert len({alpha_pow(e) for e in range(56)}) == 56
assert all(
    alpha_pow(e)[1] == 0 if e % 2 == 0 else alpha_pow(e)[0] == 0
    for e in range(56)
)


def ioc(seq: list[int]) -> float:
    counts = [0] * MOD
    for x in seq:
        counts[x] += 1
    return sum(n*(n-1) for n in counts) / (len(seq)*(len(seq)-1))


def paired_lanes(seq: list[int], offset: int) -> tuple[list[int], list[int]]:
    pairs = (len(seq) - offset) // 2
    return (
        [seq[offset + 2*j] for j in range(pairs)],
        [seq[offset + 2*j + 1] for j in range(pairs)],
    )


def lane_mean(pages: list[dict], offset: int) -> float:
    vals: list[float] = []
    for p in pages:
        a, b = paired_lanes(p["indices"], offset)
        vals += [ioc(a), ioc(b)]
    return sum(vals) / len(vals)


def transform_page(
    seq: list[int],
    exponent: int,
    root_sign: int,
    swap_coordinates: bool,
    offset: int,
) -> list[int]:
    out = list(seq)
    key = alpha_pow(exponent, root_sign)
    pairs = (len(seq) - offset) // 2
    for j in range(pairs):
        i = offset + 2*j
        pair = (seq[i+1], seq[i]) if swap_coordinates else (seq[i], seq[i+1])
        y = gf_mul(pair, key)
        if swap_coordinates:
            y = (y[1], y[0])
        out[i], out[i+1] = y
    return out


def flatten(pages: list[dict]) -> list[int]:
    return [x for p in pages for x in p["indices"]]


def encode_gp(text: str) -> list[int]:
    enc = {s: i for i, s in enumerate(CORPUS["translit"])}
    text = text.upper().replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S")
    text = re.sub("[^A-Z]", "", text)
    out: list[int] = []
    i = 0
    while i < len(text):
        dig = text[i:i+2]
        if dig in enc:
            out.append(enc[dig])
            i += 2
        else:
            out.append(enc[text[i]])
            i += 1
    return out


def segment_like_unknown(tape: list[int]) -> list[dict]:
    out = []
    k = 0
    for p in PAGES:
        n = len(p["indices"])
        out.append({"page": p["page"], "indices": tape[k:k+n]})
        k += n
    return out


# Key-independent necessary condition.
original_lane_mean = {offset: lane_mean(PAGES, offset) for offset in (0, 1)}
assert 0.0339 < original_lane_mean[0] < 0.0342
assert 0.0339 < original_lane_mean[1] < 0.0342

native = encode_gp(GIBRAN)
total = sum(len(p["indices"]) for p in PAGES)
max_start = len(native) - total
native_controls = {0: [], 1: []}
for j in range(512):
    start = math.floor(j * max_start / 511)
    pp = segment_like_unknown(native[start:start+total])
    for offset in (0, 1):
        native_controls[offset].append(lane_mean(pp, offset))

for offset in (0, 1):
    assert original_lane_mean[offset] < min(native_controls[offset])


# Natural finite family: +/- root, +/- exponent, p/p+1 origin,
# coordinate orientation, and first/last singleton framing.
variants = []
for root_sign in (1, -1):
    for direction in (1, -1):
        for phase in (0, 1):
            for swap in (False, True):
                for offset in (0, 1):
                    decoded_pages = []
                    for p in PAGES:
                        q = dict(p)
                        q["indices"] = transform_page(
                            p["indices"],
                            direction * (p["page"] + phase),
                            root_sign,
                            swap,
                            offset,
                        )
                        decoded_pages.append(q)

                    for src, dst in zip(PAGES, decoded_pages):
                        sa, sb = paired_lanes(src["indices"], offset)
                        da, db = paired_lanes(dst["indices"], offset)
                        assert sorted((ioc(sa), ioc(sb))) == sorted((ioc(da), ioc(db)))

                    variants.append({
                        "root_sign": root_sign,
                        "direction": direction,
                        "phase": phase,
                        "swap_coordinates": swap,
                        "pair_offset": offset,
                        "global_ioc": ioc(flatten(decoded_pages)),
                    })


# Exact reversible native plants for every finite variant.
plant_pages = segment_like_unknown(native[:total])
for v in variants:
    recovered_pages = []
    for p in plant_pages:
        exponent = v["direction"] * (p["page"] + v["phase"])
        encrypted = transform_page(
            p["indices"], -exponent, v["root_sign"], v["swap_coordinates"], v["pair_offset"]
        )
        recovered = transform_page(
            encrypted, exponent, v["root_sign"], v["swap_coordinates"], v["pair_offset"]
        )
        q = dict(p)
        q["indices"] = recovered
        recovered_pages.append(q)
    assert flatten(recovered_pages) == flatten(plant_pages)

variants.sort(key=lambda x: x["global_ioc"], reverse=True)
summary = {
    "source": {
        "field": "GF(29)[alpha]/(alpha^2-8)",
        "alpha_order": 56,
        "unknown_physical_pages": "p0..p55 (p50 rune-free)",
        "unknown_runes": 12956,
    },
    "invariant": {
        "original_lane_mean_offset0": original_lane_mean[0],
        "original_lane_mean_offset1": original_lane_mean[1],
        "native_512_offset0_min": min(native_controls[0]),
        "native_512_offset0_mean": sum(native_controls[0]) / 512,
        "native_512_offset1_min": min(native_controls[1]),
        "native_512_offset1_mean": sum(native_controls[1]) / 512,
    },
    "finite_original_variants": {
        "count": len(variants),
        "best_global_ioc": variants[0]["global_ioc"],
        "worst_global_ioc": variants[-1]["global_ioc"],
        "best_variant": variants[0],
    },
    "positive_controls": "32/32 native GP plants recover exactly",
    "decision": (
        "reject alpha^page multiplication on adjacent GP29 rune pairs as an "
        "ordinary-prose decoder; any exponent schedule has the same lane-IoC obstruction"
    ),
}
print(json.dumps(summary, indent=2, sort_keys=True))
