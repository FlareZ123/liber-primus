"""Complete original 2013 ISO DATA/560.13 byte-tape GP28 successor-rank test.

Two exact reversible 28-way successor transports plus fixed EA-equals-predecessor
convention; source keys are consecutive file bytes reduced modulo 28. Positives
are independent GP-native English oracle plants. A direct hypothesis only.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import tempfile
import hashlib

import numpy as np
from filelock import FileLock

from cicada2013_56013_full_literal_pad_scan_sft import (
    ROOT, CHAPTER, PROBE, TOP,
    download_verified_iso, extract_member,
    gp_text, weights, ioc, llr
)


def plaintext_from_rank(cipher: np.ndarray, bytes_for_positions: np.ndarray,
                        mode: str) -> np.ndarray:
    result = np.empty(len(cipher), dtype=np.uint8)
    result[0] = (int(cipher[0]) - int(bytes_for_positions[0] % 29)) % 29
    for i in range(1, len(cipher)):
        preceding = int(cipher[i - 1])
        current = int(cipher[i])
        if current == preceding:
            result[i] = 28
            continue
        if mode == "delta_rank28":
            rank = (current - preceding - 1 + 29) % 29
        elif mode == "excluded_rank28":
            rank = current - int(current > preceding)
        else:
            raise ValueError(mode)
        result[i] = (rank - int(bytes_for_positions[i] % 28) + 28) % 28
    return result


def ciphertext_from_rank(plain: np.ndarray, key: np.ndarray, mode: str) -> np.ndarray:
    out = np.empty(len(plain), dtype=np.uint8)
    out[0] = (int(plain[0]) + int(key[0] % 29)) % 29
    for i in range(1, len(plain)):
        preceding = int(out[i - 1])
        val = int(plain[i])
        if val == 28:
            out[i] = preceding
            continue
        rank = (val + int(key[i] % 28)) % 28
        if mode == "delta_rank28":
            out[i] = (preceding + rank + 1) % 29
        elif mode == "excluded_rank28":
            out[i] = rank + int(rank >= preceding)
        else:
            raise ValueError(mode)
    return out


def screen(data: np.ndarray, cipher: np.ndarray, weight: np.ndarray) -> dict:
    offsets = len(data) - PROBE + 1
    score = np.zeros(offsets, dtype=np.int16)
    scratch = np.empty(offsets, dtype=np.int16)
    rem29 = np.arange(256, dtype=np.int16) % 29
    rem28 = np.arange(256, dtype=np.int16) % 28
    prior = 0
    constant = 0
    for position in range(PROBE):
        current = int(cipher[position])
        if position == 0:
            lookup = weight[(current - rem29 + 29) % 29]
        elif current == prior:
            constant += int(weight[28])
            prior = current
            continue
        else:
            if mode_global == "delta_rank28":
                rank = (current - prior - 1 + 29) % 29
            else:
                rank = current - int(current > prior)
            lookup = weight[(rank - rem28 + 28) % 28]
        np.take(lookup, data[position:position + offsets], out=scratch)
        np.add(score, scratch, out=score)
        prior = current
    if constant:
        score += constant
    picks = np.argpartition(score, -TOP)[-TOP:]
    picks = sorted((int(i) for i in picks), key=lambda i: -int(score[i]))
    return {"scanned_offsets": offsets,
            "top_offsets": picks,
            "top_scores": [int(score[i]) for i in picks],
            "score_distribution": {"min": int(np.min(score)),
                                   "max": int(np.max(score)),
                                   "mean": float(np.mean(score)),
                                   "std": float(np.std(score))}}


def mode_test(data: np.ndarray, original: np.ndarray, truth: np.ndarray,
              weight: np.ndarray, mode: str) -> dict:
    global mode_global
    mode_global = mode
    rng = np.random.default_rng(20133301)
    mock = rng.integers(0, 256, size=1_000_000, dtype=np.uint8)
    offset = 220_103
    planted = ciphertext_from_rank(truth, mock[offset:offset + CHAPTER], mode)
    if not np.array_equal(plaintext_from_rank(planted, mock[offset:offset + CHAPTER], mode), truth):
        raise AssertionError("Exact 729-rune GP28 source-language inverse failed")
    planted_scan = screen(mock, planted, weight)
    if planted_scan["top_offsets"][0] != offset:
        raise AssertionError(f"True planted GP28 key offset not top 1: {mode}")
    print("GP28_RANK_POSITIVE", mode, "offset", offset,
          "first128", planted_scan["top_scores"][0],
          "full729", llr(truth, weight), "ioc", ioc(truth), flush=True)

    answer = screen(data, original, weight)
    strong = []
    for idx, first in zip(answer["top_offsets"], answer["top_scores"]):
        if idx + CHAPTER > len(data):
            continue
        pt = plaintext_from_rank(original, data[idx:idx + CHAPTER], mode)
        strong.append({"offset": idx, "probe_llr": first,
                       "full729_llr": llr(pt, weight), "ioc": ioc(pt),
                       "runes0_40": pt[:40].tolist()})
    strong.sort(key=lambda x: -x["full729_llr"])
    answer["top_offsets"] = answer["top_offsets"][:20]
    answer["top_scores"] = answer["top_scores"][:20]
    answer["top_full_chapter"] = strong[:12]
    answer["positive"] = {"offset": offset, "rank": 1,
                          "first128": planted_scan["top_scores"][0],
                          "full729": llr(truth, weight), "ioc": ioc(truth)}
    return answer


def main() -> None:
    corp = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    real = np.asarray([v for p in corp["pages"] if p["page"] in (0, 1, 2)
                       for v in p["indices"]], dtype=np.uint8)
    if len(real) != CHAPTER:
        raise AssertionError("Original LP2 pp0-2 length changed")
    english = gp_text((ROOT / "resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8"),
                      corp["translit"])
    truth = english[:CHAPTER]
    weight = weights(english)
    with tempfile.TemporaryDirectory(prefix="cicada2013-56013-gp28-") as tmpdir:
        temp = Path(tmpdir)
        original_url, digest = download_verified_iso(temp / "3301.iso")
        member = extract_member(temp / "3301.iso", temp / "560.13")
        print("GP28_SOURCE_IDENTITY", json.dumps({"url": original_url, "iso": digest, "member": member}), flush=True)
        data = np.memmap(temp / "560.13", dtype=np.uint8, mode="r")
        result = {}
        for mode in ("delta_rank28", "excluded_rank28"):
            current = mode_test(data, real, truth, weight, mode)
            result[mode] = current
            print("GP28_FULL_118M_RESULT", mode,
                  json.dumps({"searched": current["scanned_offsets"],
                              "first128": current["score_distribution"],
                              "best_full729": current["top_full_chapter"][:3]}), flush=True)
    record = {"date_utc": "2026-11-23",
              "classification": "source-bounded direct rank28 exclusion test, not author-attested operation",
              "iso": {"url": original_url, **digest},
              "member": member,
              "GP29_special_case": "When original ciphertext rune equals its preceding ciphertext rune, decode one unchanged plaintext ordinal28 (EA); first rune ordinary mod29 key; other runes rank among28 successor glyphs.",
              "original": result}
    path = ROOT / "im-results/cicada2013_56013_full_rank28_original.json"
    with FileLock(str(path) + ".lock", timeout=60):
        with tempfile.NamedTemporaryFile(mode="w", dir=path.parent, suffix=".json",
                                         prefix=".56013rank28-", encoding="utf-8",
                                         delete=False) as out:
            json.dump(record, out, ensure_ascii=False, indent=2)
            out.write("\n")
            out.flush()
            os.fsync(out.fileno())
            name = out.name
        os.replace(name, path)
    print("GP28_REPORT", path.relative_to(ROOT), flush=True)


if __name__ == "__main__":
    main()
