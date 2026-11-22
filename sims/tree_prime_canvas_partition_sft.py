#!/usr/bin/env python3
"""Finite source-led 2016 tree canvas / LP2-p32 prime-partition test.

Requires Pillow. Run from the repository root or any working directory:
    python sims/tree_prime_canvas_partition_sft.py
"""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
TRANSCRIPT = ROOT / "resources/lp2-transcription.txt"
SIGNED_IMAGE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
N_SHUFFLES = 10_000
SHUFFLE_SEED = 0x33012016


def corr(xs: list[float], ys: list[float]) -> float:
    n = len(xs)
    sx, sy = sum(xs), sum(ys)
    numerator = n * sum(x*y for x,y in zip(xs,ys)) - sx*sy
    denominator = math.sqrt(
        (n*sum(x*x for x in xs)-sx*sx) *
        (n*sum(y*y for y in ys)-sy*sy)
    )
    return numerator/denominator


def prefix(values: list[int]) -> list[int]:
    result = [0]
    for item in values:
        result.append(result[-1]+item)
    return result


def source_lag6_gate(corpus: dict, weights: list[float]) -> dict:
    """Test fixed phase-0 image brightness at two original rune clocks."""
    rune_to_index = {r:i for i,r in enumerate(corpus["runes"])}
    text = "%".join(TRANSCRIPT.read_text(encoding="utf8").split("%")[:55])
    words: list[list[tuple[int,int,int]]] = []
    word: list[tuple[int,int,int]] = []
    global_offset = local_offset = 0
    for ch in text:
        if ch in rune_to_index:
            word.append((rune_to_index[ch], global_offset, local_offset))
            global_offset += 1
            local_offset += 1
        elif ch == "%":
            local_offset = 0
        elif ch == "/" or ch.isspace():
            continue
        elif word:
            words.append(word)
            word = []
    if word:
        words.append(word)

    original = [v for p in corpus["pages"] if p["page"] < 56
                for v in p["indices"]]
    assert len(original) == 12956
    assert len(words) == 2896
    assert [v for word in words for v,_,_ in word] == original
    pairs = [(word[i][1], word[i][2],
              (24-2*word[i][0]) % 29 == word[i+6][0])
             for word in words for i in range(len(word)-6)]
    assert len(pairs) == 1290
    assert sum(hit for _,_,hit in pairs) == 80

    def clock(coord: int) -> dict:
        comparisons = []
        for shift in range(121):
            hits = [weights[(p[coord]+shift)%121] for p in pairs if p[2]]
            misses = [weights[(p[coord]+shift)%121] for p in pairs if not p[2]]
            comparisons.append(sum(hits)/len(hits)-sum(misses)/len(misses))
        actual = comparisons[0]
        return {
            "phaseZeroDifference": actual,
            "positiveRankOf121": sum(q >= actual-1e-15 for q in comparisons),
            "twoSidedRankOf121": sum(abs(q) >= abs(actual)-1e-15
                                     for q in comparisons),
            "bestPhase": comparisons.index(max(comparisons)),
            "maxDifference": max(comparisons),
        }

    return {"positions": len(pairs), "T6Hits": 80,
            "bookGlobal": clock(0), "pageLocal": clock(1)}


def run() -> dict:
    corpus = json.loads(CORPUS.read_text(encoding="utf8"))
    source = next(p["indices"] for p in corpus["pages"] if p["page"] == 32)
    assert len(source) == 121
    matrix = [source[i:i+11] for i in range(0,121,11)]
    prime = corpus["prime"]
    widths = [prime[g] for g in matrix[0]]
    heights = [prime[row[0]] for row in matrix]
    assert widths == [73,5,101,19,101,3,43,107,13,19,79]
    assert heights == [73,23,5,23,79,59,53,79,59,109,7]
    xedges, yedges = prefix(widths),prefix(heights)
    assert (xedges[-1],yedges[-1]) == (563,569)

    with Image.open(SIGNED_IMAGE) as original_image:
        image = original_image.convert("RGB")
    assert image.size == (563,569)
    pixels = image.load()
    cells = []
    for row in range(11):
        for col in range(11):
            total = white = count = 0
            for y in range(yedges[row],yedges[row+1]):
                for x in range(xedges[col],xedges[col+1]):
                    r,g,b = pixels[x,y]
                    brightness = (299*r+587*g+114*b)/1000
                    total += brightness
                    white += brightness >= 180
                    count += 1
            ordinal = matrix[row][col]
            cells.append({"row":row, "col":col, "ordinal":ordinal,
                          "prime":prime[ordinal],
                          "mean":total/count, "white":white/count})
    inner = [c for c in cells if c["row"] and c["col"]]
    assert len(cells) == 121 and len(inner) == 100

    pairings = [("ordinal","mean"),("prime","mean"),
                ("ordinal","white"),("prime","white")]
    scores = {f"{a}_{b}":{"full":corr([c[a] for c in cells],
                                      [c[b] for c in cells]),
                            "inner":corr([c[a] for c in inner],
                                         [c[b] for c in inner])}
              for a,b in pairings}

    # The following permutes only the 100 interior rune labels,
    # holding the row/column checksum cells fixed.
    counter = {key:0 for key in scores}
    max_observed = max(abs(v["inner"]) for v in scores.values())
    max_count, state = 0, SHUFFLE_SEED
    for _ in range(N_SHUFFLES):
        perm = list(range(100))
        for i in range(99,0,-1):
            state = (1664525*state+1013904223)&0xffffffff
            j = state % (i+1)
            perm[i],perm[j] = perm[j],perm[i]
        shuffled = {}
        for a,b in pairings:
            shuffled[f"{a}_{b}"] = corr(
                [inner[i][a] for i in perm],[c[b] for c in inner])
        for key,value in shuffled.items():
            if abs(value) >= abs(scores[key]["inner"])-1e-15:
                counter[key] += 1
        if max(abs(v) for v in shuffled.values()) >= max_observed-1e-15:
            max_count += 1

    return {
        "signedJpegSHA256": hashlib.sha256(SIGNED_IMAGE.read_bytes()).hexdigest(),
        "canvasDimensions":list(image.size),
        "treePage":32,"sourceRuneCount":121,
        "widths":widths,"heights":heights,
        "xEdges":xedges,"yEdges":yedges,
        "fullAndInteriorCorrelations":scores,
        "fixedInteriorShuffleCount":N_SHUFFLES,
        "fixedShuffleSeed":SHUFFLE_SEED,
        "perMeasureTailCounts":counter,
        "maxAbsCorrelation":max_observed,
        "maxAbsTailCount":max_count,
        "meanToGP29IndexMatches":sum(round(c["mean"]*28/255)==c["ordinal"]
                                      for c in cells),
        "whiteFractionByCell":[round(c["white"],6) for c in cells],
        "brightnessT6OriginalGate":
            source_lag6_gate(corpus,[c["white"] for c in cells]),
    }


if __name__ == "__main__":
    print(json.dumps(run(),indent=2))
