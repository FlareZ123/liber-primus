"""Exhaustive all-secret GP29 five-rune Hill cipher capacity certificate.

Every 5x5 inverse Hill matrix over F29 has five nonzero projective rows.
Allow each row an independent arbitrary 29-symbol output permutation,
and even ignore row independence. The five largest row-residue frequencies
bound the count of any chosen native plaintext rune. All 732,541 projective
rows and five global block phases are checked exactly by FFT slices.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import numpy as np
from scipy.fft import fftn, ifft

Q = 29
ROOT = Path(__file__).resolve().parent.parent
N = 12956
ROW_COUNT = (Q**5 - 1)//(Q - 1)


def directions() -> np.ndarray:
    """Enumerate all nonzero projective F29^5 rows, one normalization each."""
    rows = np.zeros((ROW_COUNT, 5), dtype=np.int16)
    offset = 0
    for lead in range(5):
        count = Q**(4-lead)
        span = rows[offset:offset+count]
        span[:, lead] = 1
        values = np.arange(count, dtype=np.int32)
        for j in range(4, lead, -1):
            span[:, j] = values % Q
            values //= Q
        offset += count
    assert offset == ROW_COUNT
    return rows


def bound(cipher: np.ndarray, rows: np.ndarray, phase: int) -> dict:
    """Exact all-key top-five histogram bound at a fixed global phase."""
    blocks_n = (len(cipher)-phase)//5
    blocks = cipher[phase:phase+5*blocks_n].reshape(-1, 5)
    hist = np.zeros((Q,)*5, dtype=np.float32)
    np.add.at(hist, tuple(blocks.T), 1)
    spectrum = fftn(hist, overwrite_x=True, workers=2).ravel()
    assert abs(spectrum[0].real-blocks_n) < 0.001
    harmonic = np.arange(Q, dtype=np.int32)[None, :, None]
    maxima = np.empty(len(rows), dtype=np.int32)
    for start in range(0, len(rows), 4096):
        subset = rows[start:start+4096].astype(np.int32)
        freq = subset[:, None, :] * harmonic % Q
        index = freq[:, :, 0].copy()
        for axis in range(1, 5):
            index = index*Q + freq[:, :, axis]
        projected = ifft(spectrum[index], axis=1, workers=2)
        rounded = np.rint(projected.real).astype(np.int32)
        assert np.all(rounded >= 0)
        assert np.all(rounded.sum(axis=1) == blocks_n)
        assert np.max(abs(projected.real-rounded)) < 0.005
        maxima[start:start+len(subset)] = rounded.max(axis=1)
    top = np.argsort(maxima)[-5:][::-1]
    witnesses = []
    for index in top:
        row = rows[index].astype(np.int64)
        counts = np.bincount((blocks @ row)%Q, minlength=Q)
        assert counts.max() == maxima[index], "FFT and direct count mismatch"
        witnesses.append({"row":list(map(int,row)), "target":int(np.argmax(counts)),
                          "count":int(counts.max())})
    unaligned = len(cipher)-blocks_n*5
    return {"phase":phase,"blocks":blocks_n,"row_count":ROW_COUNT,
            "top5_counts":[w["count"] for w in witnesses],
            "top5_total":sum(w["count"] for w in witnesses),
            "unaligned":unaligned,
            "any_one_GP_plaintext_rune_upper":
                sum(w["count"] for w in witnesses)+unaligned,
            "witnesses":witnesses}


def original() -> np.ndarray:
    source = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text("utf8"))
    pages = [p["indices"] for p in source["pages"]
             if p["status"] == "unsolved" and p["indices"]]
    assert len(pages) == 55
    cipher = np.asarray([x for page in pages for x in page], dtype=np.int16)
    assert len(cipher) == N and np.all((0 <= cipher)&(cipher < Q))
    return cipher



def page_reset_cipher(phase: int) -> tuple[np.ndarray, int]:
    """Concatenate complete five-rune blocks, resetting a common phase at pages."""
    source = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text("utf8"))
    pages = [np.asarray(p["indices"],dtype=np.int16) for p in source["pages"]
             if p["status"]=="unsolved" and p["indices"]]
    assert len(pages)==55 and sum(len(p) for p in pages)==N
    kept = [p[phase:phase+5*((len(p)-phase)//5)] for p in pages]
    joined = np.concatenate(kept)
    assert len(joined)%5==0
    return joined, N-len(joined)


def plant(rows: np.ndarray) -> dict:
    """Source-authenticated LP1 05 magic matrix encrypts a controlled GP source."""
    rng = np.random.default_rng(3301)
    plain = rng.integers(0, 28, size=N, dtype=np.int16)
    plain[plain >= 18] += 1
    plain[rng.choice(N-1, 1575, replace=False)] = 18
    magic = np.asarray([[272,138,341,131,151],
                        [366,199,130,320,18],
                        [226,245,91,245,226],
                        [18,320,130,199,366],
                        [151,131,341,138,272]], dtype=np.int64) % Q
    aug = np.concatenate([magic, np.eye(5,dtype=np.int64)],axis=1)
    for j in range(5):
        pivot = next(i for i in range(j,5) if aug[i,j])
        aug[[j,pivot]] = aug[[pivot,j]]
        aug[j] = (aug[j]*pow(int(aug[j,j]),-1,Q))%Q
        for i in range(5):
            if i != j:
                aug[i] = (aug[i]-aug[i,j]*aug[j])%Q
    inverse = aug[:,5:]
    complete = N//5*5
    p = plain[:complete].reshape(-1,5).astype(np.int64)
    c = p @ magic.T % Q
    assert np.array_equal(c @ inverse.T % Q, p)
    cipher = np.concatenate([c.ravel(),plain[complete:]])
    score = bound(cipher,rows,0)
    assert score["any_one_GP_plaintext_rune_upper"] >= 1575
    return {"true_E":1575,"recovered":complete,
            "true_source_magic_matrix_mod29_invertible":True,
            "all_key_bound":score["any_one_GP_plaintext_rune_upper"]}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--phases", type=int, nargs="*", choices=range(5),
                        default=list(range(5)))
    parser.add_argument("--positive", action="store_true")
    args = parser.parse_args()
    cipher, rows = original(), directions()
    checks = []
    for phase in args.phases:
        result = bound(cipher,rows,phase)
        print("ORIGINAL "+json.dumps(result,separators=(",",":")),flush=True)
        checks.append(result)
    pages = []
    for phase in args.phases:
        joined, missing = page_reset_cipher(phase)
        result = bound(joined,rows,0)
        result["phase"] = phase
        result["uncovered_original_page_edges"] = missing
        result["any_one_GP_plaintext_rune_upper"] = result["top5_total"]+missing
        print("PAGE_RESET "+json.dumps(result,separators=(",",":")),flush=True)
        pages.append(result)
    if args.positive:
        print("PLANTED "+json.dumps(plant(rows),separators=(",",":")),flush=True)
    print("SUMMARY "+json.dumps({
        "runes":N,"tested_phases":len(checks),"all_five_checked":len(checks)==5,
        "maximum_global_any_one_plain_symbol":max(x["any_one_GP_plaintext_rune_upper"]
                                                  for x in checks),
        "maximum_common_page_reset_symbol":max(x["any_one_GP_plaintext_rune_upper"]
                                               for x in pages),
        "hypothesis":"global five-rune Hill over GP29; arbitrary secret output "+
                     "per-column alphabets, any invertible secret matrix",
        "no_original_plaintext":True},separators=(",",":")),flush=True)


if __name__ == "__main__":
    main()
