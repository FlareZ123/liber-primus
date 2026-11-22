"""Dense original-input test of the 2013 CicadaOS DATA/560.13 stream as a direct GP29 pad.

Runs only the historically motivated direct byte projections and both additive signs.
A hit requires full-page natural-language text with exact re-encryption; a statistical
screen alone is never a decipherment. The original p0 heading's first 13 red runes
are excluded before freezing the 249-rune body.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import tempfile
import time
from urllib.request import urlopen
from uuid import uuid4

import numpy as np
from filelock import FileLock

ROOT = Path(__file__).resolve().parents[1]
PAD_SHA256 = "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f"
PAD_SIZE = 118818811
PAD_URL = "https://archive.org/download/3301.iso/3301.iso/DATA%2F560.13"
PAD_PATH = Path(os.environ.get("RUNNER_TEMP", tempfile.gettempdir())) / "lp2-2013-560.13"
OUT_PATH = ROOT / "im-results" / "lp2-2013-56013-dense-original-result.json"
PREFIX = 64
BATCH = 250000
ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRS"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for data in iter(lambda: source.read(2 ** 20), b""):
            digest.update(data)
    return digest.hexdigest()


def recover_pad() -> Path:
    with FileLock(str(PAD_PATH) + ".lock"):
        if PAD_PATH.exists() and PAD_PATH.stat().st_size == PAD_SIZE and sha256_file(PAD_PATH) == PAD_SHA256:
            return PAD_PATH
        staging = PAD_PATH.with_name(PAD_PATH.name + "." + uuid4().hex + ".tmp")
        try:
            with urlopen(PAD_URL, timeout=120) as remote, staging.open("wb") as dest:
                shutil.copyfileobj(remote, dest, 2 ** 20)
            assert staging.stat().st_size == PAD_SIZE, "Historical CicadaOS byte length mismatch"
            assert sha256_file(staging) == PAD_SHA256, "Historical CicadaOS SHA256 mismatch"
            os.replace(staging, PAD_PATH)
        finally:
            staging.unlink(missing_ok=True)
    return PAD_PATH


def native_gp_words(text: str, translit: list[str]) -> np.ndarray:
    token = sorted(((s, i) for i, s in enumerate(translit)), key=lambda x: -len(x[0]))
    out: list[int] = []
    for word in re.findall(r"[A-Za-z]+", text.upper()):
        word = word.replace("QU", "CW").replace("K", "C").replace("Q", "C").replace("V", "U").replace("Z", "S")
        word = word.replace("ING", "NG").replace("IO", "IA")
        pos = 0
        while pos < len(word):
            for label, rune in token:
                if word.startswith(label, pos):
                    out.append(rune)
                    pos += len(label)
                    break
            else:
                raise ValueError("Unexpected GP source transliteration: " + word[pos:])
    return np.asarray(out, dtype=np.uint8)


def references() -> tuple[np.ndarray, np.ndarray, np.ndarray, list[str]]:
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
    cipher = np.asarray(corpus["pages"][0]["indices"][13:], dtype=np.uint8)
    assert len(cipher) >= 200
    assert sum(p["runic_count"] for p in corpus["pages"][:56]) == 12956
    shakespeare = native_gp_words(
        (ROOT / "resources/control/shakespeare_first300k.txt").read_text(encoding="utf8"), corpus["translit"])
    latin_text = (ROOT / "resources/control/latin-vulgate-gp-wholewords.txt").read_text(encoding="utf8")
    latin = np.fromiter(
        (ALPHABET.index(ch) for line in latin_text.splitlines() if line and not line.lstrip().startswith("#")
         for ch in line.strip() if ch in ALPHABET), dtype=np.uint8)
    old = json.loads((ROOT / "resources/control/beowulf_oe_gp_profile_corrected.json").read_text(encoding="utf8"))
    old_counts = np.asarray(old["allGpCounts"], dtype=np.float64)
    counts = [np.bincount(shakespeare, minlength=29).astype(np.float64),
              np.bincount(latin, minlength=29).astype(np.float64),
              old_counts]
    prob = sum((c + 0.5) / (c.sum() + 14.5) for c in counts) / 3.0
    weights = np.rint(100 * np.log(29 * prob)).astype(np.int16)
    assert weights.shape == (29,) and len(shakespeare) > 100000 and len(latin) > 100000
    native_low = []
    for seq in (shakespeare, latin):
        w = weights[seq].astype(np.int32)
        roll = np.cumsum(np.concatenate((np.array([0], np.int64), w)), dtype=np.int64)
        native_low.append(int(np.percentile((roll[PREFIX:] - roll[:-PREFIX])[::11], 0.5)))
    threshold = min(native_low)
    print("Original p0 body runes", len(cipher), "native sizes", len(shakespeare), len(latin),
          "64-rune lower-half-percentile source thresholds", native_low,
          "pre-frozen scan threshold", threshold, flush=True)
    return cipher, shakespeare, latin, weights, corpus["translit"]


def projected(pad: np.ndarray, projection: str) -> np.ndarray:
    if projection == "mod29":
        return np.asarray(pad % 29, dtype=np.uint8)
    if projection == "scaled29":
        return np.asarray((pad.astype(np.uint16) * 29) // 256, dtype=np.uint8)
    raise ValueError("Unrecognized projection")


def decode(cipher: np.ndarray, residues: np.ndarray, offset: int, sign: int) -> np.ndarray:
    assert 0 <= offset and offset + len(cipher) <= len(residues)
    return np.asarray((cipher.astype(np.int16) + sign * residues[offset:offset + len(cipher)].astype(np.int16)) % 29, dtype=np.uint8)


def ioc(seq: np.ndarray) -> float:
    ct = np.bincount(seq, minlength=29)
    return float(np.sum(ct * (ct - 1)) / (len(seq) * (len(seq) - 1)))


def scan(residues: np.ndarray, cipher: np.ndarray, weights: np.ndarray, threshold: int,
         sign: int, limit: int | None = None) -> tuple[int, list[dict]]:
    stop = len(residues) - len(cipher) + 1
    if limit is not None:
        stop = min(stop, limit)
    table = np.empty((29, 29), dtype=np.int16)
    for c in range(29):
        for key in range(29):
            table[c, key] = weights[(c + sign * key) % 29]
    records: list[dict] = []
    candidates = 0
    for start in range(0, stop, BATCH):
        size = min(BATCH, stop - start)
        scores = np.zeros(size, dtype=np.int32)
        for i in range(PREFIX):
            scores += table[int(cipher[i]), residues[start + i:start + i + size]]
        eligible = np.flatnonzero(scores >= threshold)
        candidates += len(eligible)
        if len(eligible) > 5000:
            raise RuntimeError("Too many native-prefilter hits; refusing an untracked truncated scan")
        for local in eligible:
            off = start + int(local)
            plain = decode(cipher, residues, off, sign)
            full = int(weights[plain].astype(np.int32).sum())
            records.append({"offset": off, "prefix_score": int(scores[local]), "full_score": full,
                            "ioc": round(ioc(plain), 8), "plain_indices": plain.tolist() if full >= 0 else []})
        if start and start % 10000000 < BATCH:
            print("scanned", start, "/", stop, "prefix candidates", candidates, flush=True)
    return candidates, sorted(records, key=lambda x: x["full_score"], reverse=True)[:30]


def test_fixture(cipher: np.ndarray, shakespeare: np.ndarray, weights: np.ndarray,
                 threshold: int) -> None:
    offset = 3301
    pad = np.random.default_rng(3301).integers(0, 256, 25000, dtype=np.uint8)
    for projection in ("mod29", "scaled29"):
        residues = projected(pad, projection)
        for sign in (-1, 1):
            plant = shakespeare[20000:20000 + len(cipher)].copy()
            assert int(weights[plant[:PREFIX]].astype(np.int32).sum()) >= threshold
            encrypted = (plant.astype(np.int16) - sign * residues[offset:offset + len(plant)].astype(np.int16)) % 29
            encrypted = encrypted.astype(np.uint8)
            num, candidates = scan(residues, encrypted, weights, threshold, sign)
            match = next((r for r in candidates if r["offset"] == offset), None)
            assert match is not None, (projection, sign, candidates[:5])
            recovered = decode(encrypted, residues, offset, sign)
            assert np.array_equal(recovered, plant)
            reciphered = (recovered.astype(np.int16) - sign * residues[offset:offset + len(plant)].astype(np.int16)) % 29
            assert np.array_equal(reciphered.astype(np.uint8), encrypted)
            print("Source-native full page plant", projection, sign, "recovered at", offset,
                  "rank", next(i + 1 for i, r in enumerate(candidates) if r["offset"] == offset),
                  "candidate-count", num, flush=True)


def write_atomic(path: Path, data: dict) -> None:
    payload = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    with FileLock(str(path) + ".lock"):
        stage = path.with_name(path.name + "." + uuid4().hex + ".tmp")
        try:
            stage.write_text(payload, encoding="utf8")
            os.replace(stage, path)
        finally:
            stage.unlink(missing_ok=True)


def main() -> None:
    cipher, shakespeare, latin, weights, translit = references()
    low = []
    for seq in (shakespeare, latin):
        w = weights[seq].astype(np.int32)
        cum = np.cumsum(np.concatenate((np.array([0], np.int64), w)), dtype=np.int64)
        low.append(int(np.percentile((cum[PREFIX:] - cum[:-PREFIX])[::11], 0.5)))
    threshold = min(low)
    test_fixture(cipher, shakespeare, weights, threshold)
    if "--fixture-only" in os.sys.argv:
        return
    path = recover_pad()
    input_bytes = np.memmap(path, dtype=np.uint8, mode="r")
    output = {"classification": "exhaustive direct-pad offset test, not key claim",
              "input_size": int(input_bytes.size), "input_sha256": PAD_SHA256,
              "original_page": 0, "red_heading_skipped": 13, "body_runes": int(len(cipher)),
              "prefix_runes": PREFIX, "threshold": threshold, "training": "Shakespeare/Latin/Old English GP mixture",
              "native_bottom_0_5_percent_thresholds": low, "models": []}
    begin = time.monotonic()
    for projection in ("mod29", "scaled29"):
        residues = projected(input_bytes, projection)
        for sign in (-1, 1):
            count, top = scan(residues, cipher, weights, threshold, sign)
            for item in top:
                p = decode(cipher, residues, item["offset"], sign)
                item["translit_prefix"] = "".join(translit[int(i)] for i in p[:130])
                item.pop("plain_indices", None)
            output["models"].append({"projection": projection, "decryption_sign": sign,
                                     "tested_offsets": int(len(input_bytes) - len(cipher) + 1),
                                     "source_native_prefix_candidates": count, "top": top})
            print("MODEL", projection, sign, "candidates", count, "best", top[:2], flush=True)
    output["elapsed_seconds"] = round(time.monotonic() - begin, 1)
    write_atomic(OUT_PATH, output)
    print("Complete full-offset source-pad result", str(OUT_PATH), "elapsed",
          output["elapsed_seconds"], flush=True)


if __name__ == "__main__":
    main()
