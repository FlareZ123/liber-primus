"""Full-position literal first-party 2013 DATA/560.13 byte-key test on original LP2.

This tests exactly two direct keystream consumers against all possible byte
offsets of the genuine 2013 ISO member. No postselected source-derived key,
secret-state tuning, hidden word resets, or language-model plaintext claims.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
from pathlib import Path
import re
import tempfile

import numpy as np
import pycdlib
from filelock import FileLock

from cicada2013_iso_rootfs_join_sft import download_verified_iso

ROOT = Path(__file__).resolve().parents[1]
REPORT = Path("im-results/cicada2013_56013_full_direct_pad_scan.json")
ISO_MEMBER = "/DATA/560.13;1"
PROBE = 128
CHAPTER = 729
TOP = 2048


def gp_text(text: str, tokens: list[str]) -> np.ndarray:
    text = text.upper().replace("QU", "CW").replace("V", "U")
    text = text.replace("K", "C").replace("Q", "C").replace("Z", "S")
    choices = sorted(enumerate(tokens), key=lambda p: -len(p[1]))
    indices: list[int] = []
    for word in re.findall(r"[A-Z]+", text):
        at = 0
        while at < len(word):
            if word.startswith("ING", at):
                indices.append(21)
                at += 3
                continue
            if word.startswith("IO", at):
                indices.append(27)
                at += 2
                continue
            match = next(((i, t) for i, t in choices if word.startswith(t, at)), None)
            if match is None:
                raise ValueError("Unknown GP spelling in source " + word)
            indices.append(match[0])
            at += len(match[1])
    return np.asarray(indices, dtype=np.uint8)


def extract_member(iso_path: Path, key_path: Path) -> dict:
    cd = pycdlib.PyCdlib()
    cd.open(str(iso_path))
    try:
        extents = [(int(start), int(length))
                   for start, length in cd.get_file_byte_extents(iso_path=ISO_MEMBER)]
    finally:
        cd.close()
    if not extents:
        raise ValueError("Original ISO 560.13 member absent")
    hasher = hashlib.sha256()
    total = 0
    with iso_path.open("rb") as src, key_path.open("wb") as dst:
        for start, length in extents:
            src.seek(start)
            remaining = length
            while remaining:
                block = src.read(min(1 << 20, remaining))
                if not block:
                    raise ValueError("Original ISO member short read")
                hasher.update(block)
                dst.write(block)
                remaining -= len(block)
                total += len(block)
        dst.flush()
        os.fsync(dst.fileno())
    return {"iso_member": ISO_MEMBER, "byte_extents": extents,
            "length": total, "sha256": hasher.hexdigest()}


def weights(gp_source: np.ndarray) -> np.ndarray:
    count = np.bincount(gp_source, minlength=29) + 0.5
    q = count / count.sum()
    return np.rint(12 * np.log(q * 29)).astype(np.int16)


def source_stream(raw: np.ndarray, mode: str) -> np.ndarray:
    if mode == "raw29":
        return raw
    out = raw.copy()
    out[1:] = ((raw[1:].astype(np.int16) - raw[:-1] + 29) % 29).astype(np.uint8)
    return out


def direct_plain(observed: np.ndarray, byte_key: np.ndarray) -> np.ndarray:
    return ((observed.astype(np.int16) - (byte_key % 29).astype(np.int16) + 29) % 29).astype(np.uint8)


def llr(plain: np.ndarray, score: np.ndarray) -> int:
    return int(score[plain.astype(np.intp)].sum())


def ioc(plain: np.ndarray) -> float:
    n = int(len(plain))
    c = np.bincount(plain, minlength=29)
    return float(np.sum(c * (c - 1)) / (n * (n - 1)))


def screen(data: np.ndarray, cipher: np.ndarray, weight: np.ndarray,
           top: int = TOP) -> dict:
    offsets = len(data) - PROBE + 1
    if offsets <= 0:
        raise ValueError("Insufficient original byte tape for probe")
    aggregate = np.zeros(offsets, dtype=np.int16)
    scratch = np.empty(offsets, dtype=np.int16)
    rem = np.arange(256, dtype=np.int16) % 29
    for position, symbol in enumerate(cipher[:PROBE]):
        lookup = weight[(int(symbol) - rem + 29) % 29]
        np.take(lookup, data[position:position + offsets], out=scratch)
        np.add(aggregate, scratch, out=aggregate)
    n_best = min(top, offsets)
    picks = np.argpartition(aggregate, -n_best)[-n_best:]
    picks = sorted((int(i) for i in picks), key=lambda i: -int(aggregate[i]))
    return {"top_offsets": picks, "top_scores": [int(aggregate[i]) for i in picks],
            "score_distribution": {"min": int(np.min(aggregate)), "max": int(np.max(aggregate)),
                                   "mean": float(np.mean(aggregate)),
                                   "std": float(np.std(aggregate))},
            "scanned_offsets": offsets}


def evaluate(data: np.ndarray, raw: np.ndarray, weight: np.ndarray,
             source: np.ndarray) -> dict:
    result = {}
    for mode in ("raw29", "difference29"):
        ciphertext = source_stream(raw, mode)
        hit = screen(data, ciphertext, weight)
        winners = []
        for idx in hit["top_offsets"]:
            if idx + CHAPTER > len(data):
                continue
            pt = direct_plain(ciphertext[:CHAPTER], data[idx:idx + CHAPTER])
            winners.append({"offset": idx, "probe_llr": int(hit["top_scores"][hit["top_offsets"].index(idx)]),
                            "chapter_llr": llr(pt, weight), "ioc": ioc(pt),
                            "first40": "".join(source[i] for i in pt[:40])})
        winners.sort(key=lambda x: (-x["chapter_llr"], -x["ioc"]))
        hit["top_offsets"] = hit["top_offsets"][:20]
        hit["top_scores"] = hit["top_scores"][:20]
        hit["full_chapter_leaders"] = winners[:15]
        result[mode] = hit
    return result


def positive_controls(seed: int, oracle: np.ndarray, weight: np.ndarray,
                      dictionary: list[str]) -> dict:
    rng = np.random.default_rng(seed)
    random_bytes = rng.integers(0, 256, size=1_000_000, dtype=np.uint8)
    starting_at = 330_103
    key = random_bytes[starting_at:starting_at + CHAPTER]
    truth = oracle[:CHAPTER]
    outcomes = {}
    for mode in ("raw29", "difference29"):
        if mode == "raw29":
            cipher = ((truth.astype(np.int16) + (key % 29)) % 29).astype(np.uint8)
        else:
            steps = ((truth.astype(np.int16) + (key % 29)) % 29).astype(np.uint8)
            cipher = np.cumsum(steps, dtype=np.int64).astype(np.int64) % 29
            cipher = cipher.astype(np.uint8)
        observed = source_stream(cipher, mode)
        recovered = direct_plain(observed, key)
        if not np.array_equal(recovered, truth):
            raise AssertionError("Exact original-register positive failed")
        candidate = screen(random_bytes, observed, weight, 5)
        if candidate["top_offsets"][0] != starting_at:
            raise AssertionError(f"Known {mode} original-language positive was not top-ranked: {candidate['top_offsets']}")
        outcomes[mode] = {"planted_at": starting_at, "rank": 1,
                          "llr_first128": candidate["top_scores"][0],
                          "true_chapter_llr": llr(truth, weight),
                          "true_chapter_ioc": ioc(truth),
                          "exact_plaintext_runes": int(len(truth))}
    return outcomes


def write_atomic_locked(report: dict) -> None:
    dest = ROOT / REPORT
    dest.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(dest) + ".lock", timeout=60):
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
                                         dir=dest.parent, prefix=".56013-",
                                         suffix=".json", delete=False) as temp:
            json.dump(report, temp, ensure_ascii=False, indent=2)
            temp.write("\n")
            temp.flush()
            os.fsync(temp.fileno())
            name = temp.name
        os.replace(name, dest)


def main() -> None:
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    first = np.asarray([x for p in corpus["pages"] if p["page"] in (0, 1, 2)
                        for x in p["indices"]], dtype=np.uint8)
    if len(first) != CHAPTER:
        raise ValueError(f"Original opening chapter changed: {len(first)}")
    english = gp_text((ROOT / "resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8"),
                      corpus["translit"])
    if len(english) < CHAPTER:
        raise ValueError("Insufficient original-register control language")
    confidence = weights(english)
    check = positive_controls(3301, english, confidence, corpus["translit"])
    print("POSITIVE_VALIDATED", json.dumps(check), flush=True)
    with tempfile.TemporaryDirectory(prefix="cicada2013-full56013-") as td:
        root = Path(td)
        iso_path = root / "3301.iso"
        iso_url, iso_digest = download_verified_iso(iso_path)
        identity = extract_member(iso_path, root / "560.13")
        print("ORIGINAL_ISO_IDENTITY", json.dumps({"url": iso_url, "iso": iso_digest,
                                                    "member": identity}), flush=True)
        data = np.memmap(root / "560.13", dtype=np.uint8, mode="r")
        if len(data) < 1_000_000:
            raise AssertionError("Wrong original 2013 data member")
        original = evaluate(data, first, confidence, corpus["translit"])
    report = {"date_utc": "2026-11-23", "scope": "literal 2013 ISO DATA/560.13 all-byte-offset p0–2 first128 GP29 additive and predecessor-difference direct keys; original 729 GP rune held-out",
              "source": {"iso_url": iso_url, **iso_digest, "extracted": identity},
              "language_control": {"source": "Gibran Prophet, original GP-native orthography",
                                   "runes": len(english), "weight": confidence.tolist()},
              "planted_positive": check, "original": original,
              "interpretation": "No original key operator chosen by Cicada; any output must have independent genuine English and exact forward reencryption. High-rank statistical matches alone are not plaintext."}
    write_atomic_locked(report)
    for mode, result in original.items():
        print("ORIGINAL_FULLTAPE_RESULT", mode, json.dumps({
            "scanned_offsets": result["scanned_offsets"],
            "probe_distribution": result["score_distribution"],
            "top_chapter": result["full_chapter_leaders"][:5]}), flush=True)
    print("REPORT", REPORT, flush=True)


if __name__ == "__main__":
    main()
