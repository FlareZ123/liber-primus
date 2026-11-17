#!/usr/bin/env python3
"""Final source-locked historical note+delta and short c.mp3 periodic GP29 gate.

2012 authored operation is (note_off pitch + MIDI message delta ticks) ranked
into a reduced alphabet. No original MIDI note-off events exist inside later
MP3 PCM; their onset proxies and conversion to GP29 are predeclared hypotheses.
"""
from __future__ import annotations

import json
import math
import os
import tempfile
from pathlib import Path

import mido
import numpy as np
from filelock import FileLock

from lp2_cicada_audio_note_2012_source_sft import (
    GP, HOP, SR, MIDI_URL, MIDI_BLOB_SHA, SOURCES,
    acquire, midi_positive, note_cqt, note_fft, pcm, screen,
)
from lp2_cicada_audio_note_r4_source_sft import (
    THRESHOLD, engine, guard, original_words, plant,
)

FIXED_SEED = 33012012
HISTORICAL_BPM = 120
HISTORICAL_TPB = 96
HISTORICAL_OFF_DELTAS = np.asarray([24, 96, 192, 384], dtype=np.int64)
ADDITIVE_NULLS = 20
R4_NULLS = 4
WINDOW = 300
OUT = Path("lp2-audio-note-historical-ticks-results.json")


def wrong_track(midi_path: Path) -> dict:
    mid = mido.MidiFile(str(midi_path))
    assert mid.ticks_per_beat == HISTORICAL_TPB, mid.ticks_per_beat
    tracks = [[msg.note + msg.time for msg in t if msg.type == "note_off"] for t in mid.tracks]
    assert len(tracks) == 2
    assert {msg.tempo for t in mid.tracks for msg in t if msg.type == "set_tempo"} == {500000}
    vals = [sorted(set(x)) for x in tracks]
    alph = ("abcdefghiklmnopqrstuvwxyz", "abcdefghijklmnoprstuvwy")
    correct = ["".join(dict(zip(vals[i], alph[i]))[n] for n in tracks[i]) for i in (0, 1)]
    wrong0 = "".join(dict(zip(vals[1], alph[1])).get(n, "?") for n in tracks[0])
    wrong1 = "".join(dict(zip(vals[0], alph[0])).get(n, "?") for n in tracks[1])
    assert correct[0].startswith("verygoodyouhaveproventobemostdedicated")
    assert correct[1].startswith("letthepriestsoftheravenofdawn")
    assert not wrong0.startswith("verygood") and not wrong1.startswith("letthepriests")
    unique_ticks = sorted({msg.time for t in mid.tracks for msg in t if msg.type == "note_off"})
    assert unique_ticks == HISTORICAL_OFF_DELTAS.tolist()
    return {
        "ticks_per_beat": mid.ticks_per_beat,
        "source_tempo_microseconds_per_beat": 500000,
        "author_event_ticks_values": unique_ticks,
        "correct_first_70": [c[:70] for c in correct],
        "wrong_track_first_70": [wrong0[:70], wrong1[:70]],
        "wrong_track_unknown_symbol_counts": [wrong0.count("?"), wrong1.count("?")],
        "wrong_track_failed_both_known_openings": True,
    }


def fixed_representations(pitches: np.ndarray, frames: np.ndarray) -> dict[str, np.ndarray]:
    p = np.asarray(pitches, dtype=np.int64)
    f = np.asarray(frames, dtype=np.int64)
    assert len(p) == len(f) and len(p) > 0
    # Estimate elapsed inter-onset time from unmodified PCM event timestamps.
    # Fixed 2012 clock: 96 ticks per beat, beat duration 0.5 s. The 2012
    # MIDI uses msg.time, not inter-onset time, so this is a proxy, not a
    # reconstruction of the original MIDI event stream.
    ticks = np.rint(np.diff(f, prepend=f[0]) * HOP / SR * HISTORICAL_TPB
                    * HISTORICAL_BPM / 60).astype(np.int64)
    nearest = HISTORICAL_OFF_DELTAS[
        np.abs(ticks[:, None] - HISTORICAL_OFF_DELTAS[None, :]).argmin(axis=1)]
    add_raw = p + ticks
    add_class = p + nearest

    def rank(values: np.ndarray) -> np.ndarray:
        _, inverse = np.unique(values, return_inverse=True)
        return inverse.astype(np.int32)

    return {
        "pitch_rank": rank(p),
        "pitch_plus_onset_ticks_mod29": np.asarray(add_raw % 29, dtype=np.int32),
        "pitch_plus_historical_duration_class_mod29": np.asarray(add_class % 29, dtype=np.int32),
        "pitch_plus_historical_duration_class_rank": rank(add_class),
    }


def repeat_if_short(base: np.ndarray) -> np.ndarray:
    x = np.asarray(base, dtype=np.int32)
    if len(x) >= WINDOW:
        return x
    # A short named 2014 audio clip may carry a periodic key rather than a
    # one-time 300-symbol pad, as in earlier historical Cicada Vigenere clues.
    return np.resize(x, WINDOW + len(x) * 2)


def test_candidate(lib, pi, lm, sections, primitive: np.ndarray,
                   seed: int, controls_required: bool) -> dict:
    key = repeat_if_short(primitive)
    direct_sec = [(n, c) for n, c, _ in sections]
    orig = screen(key, direct_sec)
    record = {"stream_length": len(primitive), "repeat_short_period": len(primitive) < WINDOW,
              "original_additive": orig, "null_additive_max": -math.inf,
              "original_r4_max": -math.inf, "original_r4_argmax": None,
              "null_r4_max": -math.inf, "R4_threshold": THRESHOLD}
    for null in range(1, ADDITIVE_NULLS + 1):
        rng = np.random.default_rng(seed + null)
        shuffle = repeat_if_short(rng.permutation(primitive))
        record["null_additive_max"] = max(record["null_additive_max"],
                                           screen(shuffle, direct_sec)["ioc"])
    if controls_required:
        positives = {}
        for mode in ("hold", "spend"):
            for sign in (1, -1):
                c, desc = plant(sections[0][2], key, mode, sign, pi, lm, seed + (mode == "spend") * 100 + sign)
                sc, off = guard(lib, c, sections[0][2], key, sign, mode, pi, lm)
                positives[mode + "_" + str(sign)] = {
                    **desc, "score": round(sc, 5), "offset": off,
                    "passed": bool(sc >= THRESHOLD and abs(off) <= 3)
                }
        assert all(x["passed"] for x in positives.values()), positives
        record["synthetic_plants"] = positives
    for trial in range(0, R4_NULLS + 1):
        if trial:
            rng = np.random.default_rng(seed + 40000 + trial)
            working = repeat_if_short(rng.permutation(primitive))
        else:
            working = key
        best = (-math.inf, None)
        for label, c, ws in sections:
            for mode in ("hold", "spend"):
                for sign in (1, -1):
                    score, off = guard(lib, c, ws, working, sign, mode, pi, lm)
                    if score > best[0]:
                        best = score, [label, mode, sign, off]
        if trial:
            record["null_r4_max"] = max(record["null_r4_max"], best[0])
        else:
            record["original_r4_max"], record["original_r4_argmax"] = best
    record["r4_triggered"] = bool(record["original_r4_max"] >= THRESHOLD)
    return record


def persist(report: dict) -> None:
    with FileLock(str(OUT) + ".lock"):
        tmp = OUT.with_suffix(".tmp")
        tmp.write_text(json.dumps(report, indent=2, allow_nan=True) + "\n", encoding="utf8")
        os.replace(tmp, OUT)


def main() -> None:
    sections = original_words()
    report = {
        "schema": "lp2-audio-note-historical-2012-timing-locked-v1",
        "rules_frozen_before_original_cipher": {
            "midi_source": MIDI_URL, "midi_blob_sha1": MIDI_BLOB_SHA,
            "duration_proxy": "inter-onset gap in 32ms PCM frames, not original MIDI note-off delta",
            "fixed_2012_bpm": HISTORICAL_BPM, "fixed_2012_ticks_per_beat": HISTORICAL_TPB,
            "historical_tick_classes": HISTORICAL_OFF_DELTAS.tolist(),
            "symbol_maps": ["pitch_rank", "pitch_plus_onset_ticks_mod29",
                            "pitch_plus_historical_duration_class_mod29",
                            "pitch_plus_historical_duration_class_rank"],
            "r4_threshold": THRESHOLD, "direct_ioc_threshold": 1.40,
            "additive_shuffles": ADDITIVE_NULLS, "r4_shuffles": R4_NULLS,
            "short_note_clip": "repeat primitive note motif periodically to 300+2 periods",
            "seed": FIXED_SEED,
        },
        "midi_control": {}, "source": {}, "interpretation": "no post-scoring parameter tuning permitted",
    }
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        midi = tmp / "song.mid"
        report["midi_hash"] = acquire(MIDI_URL, midi, "gitsha1", MIDI_BLOB_SHA)
        report["midi_known_positive"] = midi_positive(midi)
        report["midi_control"] = wrong_track(midi)
        lib, pi, lm, hashes = engine(tmp)
        report["r4_source_git_blob_shas"] = hashes
        assert len(sections) == 9
        controlled = False
        for source, (url, algo, digest) in SOURCES.items():
            mp3 = tmp / (source + ".mp3")
            identity = acquire(url, mp3, algo, digest)
            signal = pcm(mp3)
            rec = {"verified_source": identity, "pcm_duration_s": round(len(signal) / SR, 3),
                   "methods": {}}
            for method, fn in (("fft", note_fft), ("cqt", note_cqt)):
                pitches, frames = fn(signal)
                representations = fixed_representations(pitches, frames)
                method_rows = {}
                for map_name, values in representations.items():
                    # Rank methods extending 2012's sorted-event alphabet can
                    # inject directly into 29 GP symbols only when K <= 29.
                    distinct = len(set(map(int, values)))
                    if map_name.endswith("rank") and distinct > 29:
                        method_rows[map_name] = {"eligible": False, "distinct_rank_symbols": distinct,
                                                "reason": "historical rank alphabet exceeds GP29"}
                        continue
                    answer = test_candidate(lib, pi, lm, sections, values,
                                            FIXED_SEED + len(values) + sum(ord(c) for c in map_name),
                                            not controlled)
                    controlled = True
                    answer["distinct_key_symbols"] = distinct
                    method_rows[map_name] = answer
                rec["methods"][method] = {
                    "n_events": len(pitches), "source_pitch_count": len(set(map(int, pitches))),
                    "rank_counts": {k: len(set(map(int, a))) for k, a in representations.items()},
                    "candidates": method_rows,
                }
            report["source"][source] = rec
            persist(report)
            print(json.dumps({"completed": source,
                              "rows": {m: {k: {"direct_ioc": v.get("original_additive", {}).get("ioc"),
                                                "r4": v.get("original_r4_max"), "eligible": v.get("eligible", True)}
                                            for k, v in sub["candidates"].items()}
                                       for m, sub in rec["methods"].items()}}, allow_nan=True), flush=True)
    persist(report)
    print(json.dumps({"finished": True, "wrong_track": report["midi_control"],
                      "evaluated": list(report["source"])}, allow_nan=True), flush=True)


if __name__ == "__main__":
    main()
