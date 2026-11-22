#!/usr/bin/env python3
"""Issue #1330: MP3-derived GP29 note streams under the published R4 hold/spend model.

The R4 engine, its language model and decoding parameters are source-pinned and
kept separate from the Cicada-historical 2012 MIDI positive. Source notes are
hypothetical key material, not an inferred historical cipher.
"""
from __future__ import annotations

import ctypes
import json
import math
import os
import random
import subprocess
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
from filelock import FileLock

from lp2_cicada_audio_note_2012_source_sft import (
    GP, SOURCES, acquire, gitsha1, midi_positive, note_cqt, note_fft, pcm,
)

REPO = Path(__file__).resolve().parents[1]
PIN = "15200c67abee106913ba01ff504c5b6e88d16cc7"
R4_FILES = {
    "backward_edge.rs": (
        "work/chanscreen/v2/backward_edge.rs",
        "517f4d1d9c8fb5be96244810e55f0f84699fa46a",
    ),
    "backward_mid.rs": (
        "work/chanscreen/v2/backward_mid.rs",
        "ef4adb6180661083e386bd5d73d13124d16ad210",
    ),
    "model.npz": (
        "work/chanscreen/model.npz",
        "34735ddd180c878ddcc09514023f9146ac28e64e",
    ),
}
GROUPS = [(0, 2), (3, 7), (8, 14), (15, 22), (23, 26),
          (27, 32), (33, 39), (40, 53), (54, 55)]
Q = 29
N = 300
Q_DECODER = 0.81
NU = 0.42
THRESHOLD = 29.799206297530528
RANDOM_NULLS = 4
LOCKED_SEED = 13301330


def pin_asset(root: Path, name: str, path: str, digest: str) -> str:
    url = f"https://raw.githubusercontent.com/pnotisdev/cicada3301/{PIN}/{path}"
    with urllib.request.urlopen(url, timeout=90) as response:
        payload = response.read()
    got = gitsha1(payload)
    assert got == digest, (name, got, digest)
    (root / name).write_bytes(payload)
    return got


def engine(root: Path):
    hashes = {n: pin_asset(root, n, *v) for n, v in R4_FILES.items()}
    subprocess.run(
        ["rustc", "--edition=2021", "-C", "opt-level=3", "--crate-type", "cdylib",
         str(root / "backward_mid.rs"), "-o", str(root / "libbackward_mid.so")],
        cwd=root, check=True, capture_output=True,
    )
    lib = ctypes.CDLL(str(root / "libbackward_mid.so"))
    lib.backward_mid.argtypes = [
        ctypes.c_void_p, ctypes.c_size_t, ctypes.c_void_p, ctypes.c_size_t,
        ctypes.c_int, ctypes.c_double, ctypes.c_int, ctypes.c_size_t,
        ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int,
        ctypes.c_void_p, ctypes.c_double, ctypes.c_void_p,
    ]
    lib.backward_mid.restype = ctypes.c_int
    model = np.load(root / "model.npz")
    pi, L = np.ascontiguousarray(model["pi"], dtype=np.float64), np.ascontiguousarray(model["L"], dtype=np.float64)
    assert pi.shape == (Q,) and L.shape == (Q, Q)
    assert abs(float(pi.sum()) - 1) < 1e-12
    assert np.allclose(L.sum(axis=1), 1, atol=1e-12)
    assert (pi > 0).all() and (L > 0).all()
    return lib, pi, L, hashes


def original_words() -> list[tuple[str, np.ndarray, np.ndarray]]:
    parts = (REPO / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf8").split("%")
    assert len(parts) == 57
    rune_map = {r: n for n, r in enumerate(GP["runes"])}
    flags, by_page = {}, {}
    needs_word = True
    for block_number, part in enumerate(parts):
        page = block_number if block_number < 50 else block_number + 1
        indices, ws = [], []
        for char in part:
            if char in rune_map:
                indices.append(rune_map[char])
                ws.append(int(needs_word))
                needs_word = False
            elif char in "-.$&§123457":
                needs_word = True
        assert indices == GP["pages"][page]["indices"], page
        by_page[page], flags[page] = indices, ws
    sections = []
    for from_page, to_page in GROUPS:
        c = np.asarray([r for p in range(from_page, to_page + 1)
                        for r in by_page.get(p, [])], dtype=np.int32)
        ws = np.asarray([b for p in range(from_page, to_page + 1)
                         for b in flags.get(p, [])], dtype=np.uint8)
        assert len(c) >= N and len(c) == len(ws)
        # A screen starts at the first symbol of its own candidate window.
        ws[0] = 1
        sections.append((f"p{from_page}-{to_page}", c[:N], ws[:N]))
    assert sum(sum(flags[p]) for p in flags if p <= 55) == 2896
    assert sum(len(by_page.get(p, [])) for p in range(56)) == 12956
    return sections


def log_common(cipher: np.ndarray) -> float:
    repeat = int(np.count_nonzero(cipher[1:] == cipher[:-1]))
    return (-len(cipher) * math.log(Q)
            + (len(cipher) - 1 - repeat) * math.log1p(Q_DECODER / (Q - 1))
            + repeat * math.log1p(-Q_DECODER))


def guard(lib, c, ws, key, sign, channel, pi, lm):
    c = np.ascontiguousarray(c, dtype=np.int32)
    ws = np.ascontiguousarray(ws, dtype=np.uint8)
    key = np.ascontiguousarray(key, dtype=np.int32)
    result = np.empty((len(key) + 1, 2), dtype=np.float64)
    cand = np.zeros(len(c), dtype=np.uint8)
    mode = {"hold": 0, "spend": 1}[channel]
    rc = lib.backward_mid(
        c.ctypes.data, len(c), key.ctypes.data, len(key), sign, Q_DECODER,
        mode, Q, pi.ctypes.data, lm.ctypes.data, result.ctypes.data, 3,
        cand.ctypes.data, NU, ws.ctypes.data
    )
    assert rc == 0, rc
    lo, uu = result[:, 0], result[:, 1]
    assert not np.isnan(lo).any() and not np.isnan(uu).any()
    assert not np.isposinf(lo).any() and (lo <= 1e-9).all()
    with np.errstate(invalid="ignore"):
        scores = np.where(np.isfinite(lo) & np.isfinite(uu),
                          np.minimum(lo - uu, lo - log_common(c)), -np.inf)
    j = int(np.argmax(scores))
    return float(scores[j]), j


def plant(ws: np.ndarray, key: np.ndarray, mode: str, sign: int,
          pi: np.ndarray, lm: np.ndarray, seed: int) -> tuple[np.ndarray, dict]:
    rng = np.random.default_rng(seed)
    lengths = []
    starts = np.flatnonzero(ws)
    for i, start in enumerate(starts):
        end = int(starts[i + 1]) if i + 1 < len(starts) else len(ws)
        lengths.append((int(start), end))
    nulls = set()
    for lo, hi in lengths:
        L = hi - lo
        if L >= 3 and rng.random() < NU:
            nulls.add(lo + int(rng.integers(1, L - 1)))
    c, pt = [], []
    prev = None
    pointer = 0
    prev_plain = None
    for index in range(len(ws)):
        if index in nulls:
            c.append(int(rng.integers(0, Q)))
            continue
        p = int(rng.choice(Q, p=pi if prev_plain is None else lm[prev_plain]))
        prev_plain = p
        pt.append(p)
        assert pointer < len(key) - 1, "source note stream too short for plant"
        x = (p + sign * int(key[pointer])) % Q
        if prev is not None and x == prev and rng.random() < Q_DECODER:
            choice = int(rng.integers(0, Q - 1))
            x = choice + 1 if choice >= prev else choice
            if mode == "spend":
                pointer += 1
        else:
            pointer += 1
        c.append(x)
        prev = x
    assert len(c) == len(ws)
    return np.asarray(c, dtype=np.int32), {
        "seed": seed, "real_symbols": len(pt), "inserted_nulls": len(nulls),
        "actual_key_consumption": pointer, "true_offset": 0, "mode": mode,
        "sign": sign,
    }


def screen_source(lib, pi, lm, sections, notes, seed):
    record = {"n": len(notes), "max": -math.inf, "argmax": None, "null_max": -math.inf,
              "nulls": RANDOM_NULLS, "count_original_cells": 0}
    for trial in range(RANDOM_NULLS + 1):
        key = notes if trial == 0 else np.random.default_rng(seed + trial).permutation(notes)
        trialbest = (-math.inf, None)
        for chapter, c, ws in sections:
            for mode in ("hold", "spend"):
                for sign in (1, -1):
                    score, off = guard(lib, c, ws, key, sign, mode, pi, lm)
                    if score > trialbest[0]:
                        trialbest = score, (chapter, mode, sign, off)
                    if trial == 0:
                        record["count_original_cells"] += max(0, len(key) - N + 1)
        if trial == 0:
            record["max"], record["argmax"] = trialbest
        else:
            record["null_max"] = max(record["null_max"], trialbest[0])
    record["threshold_exceeded"] = bool(record["max"] >= THRESHOLD)
    return record


def main() -> None:
    sections = original_words()
    report = {"schema": "lp2-audio-note-r4-v1", "parameters": {
        "R4_q": Q_DECODER, "R4_nu": NU, "threshold_nats": THRESHOLD,
        "channels": ["hold", "spend"], "signs": [1, -1], "window": N,
        "shuffled_notes_per_representation": RANDOM_NULLS, "seed": LOCKED_SEED,
    }, "model_source": PIN, "result": {}, "controls": {}}
    with tempfile.TemporaryDirectory() as dirname:
        root = Path(dirname)
        lib, pi, lm, hashes = engine(root)
        report["model_git_blob_sha1"] = hashes
        # Original source has no literal MIDI event tick values: use PCM-derived
        # absolute pitches or intervals as provisional numeric GP keys only.
        for source, (url, typ, expected) in SOURCES.items():
            audio = root / (source + ".mp3")
            meta = acquire(url, audio, typ, expected)
            samples = pcm(audio)
            record = {"source": meta, "duration_s": round(len(samples) / 16000, 3), "representations": {}}
            for mname, extract in (("fft", note_fft), ("cqt", note_cqt)):
                pitch, frame = extract(samples)
                for kname, vals in (("pitch", pitch), ("interval", np.diff(pitch))):
                    key = np.asarray(vals % Q, dtype=np.int32)
                    label = mname + "_" + kname
                    if len(key) < N:
                        record["representations"][label] = {"eligible": False, "note_events": len(key)}
                        continue
                    if not report["controls"]:
                        for channel in ("hold", "spend"):
                            for sign in (1, -1):
                                cipher, description = plant(sections[0][2], key, channel, sign, pi, lm,
                                                            13302020 + sign + (channel == "spend") * 1000)
                                best, offset = guard(lib, cipher, sections[0][2], key, sign, channel, pi, lm)
                                record_test = {**description, "score": round(best, 4), "offset": offset,
                                               "passed": bool(best >= THRESHOLD and abs(offset) <= 3)}
                                report["controls"][channel + "_" + str(sign)] = record_test
                        assert all(c["passed"] for c in report["controls"].values()), report["controls"]
                    record["representations"][label] = screen_source(
                        lib, pi, lm, sections, key, LOCKED_SEED + len(key)
                    )
            report["result"][source] = record
            print(json.dumps({"source": source, "results": record}, default=float), flush=True)
    final = Path("lp2-audio-note-r4-source-results.json")
    with FileLock(str(final) + ".lock"):
        out = final.with_suffix(".tmp")
        out.write_text(json.dumps(report, indent=2, allow_nan=True) + "\n", encoding="utf8")
        os.replace(out, final)
    print(json.dumps({"done": True, "controls": report["controls"],
                      "best": {s: max((v.get("max", -math.inf) for v in meta["representations"].values()), default=-math.inf)
                               for s, meta in report["result"].items()}}, default=float), flush=True)


if __name__ == "__main__":
    main()
