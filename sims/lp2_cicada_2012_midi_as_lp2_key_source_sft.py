#!/usr/bin/env python3
"""Authentic 2012 Cicada MIDI note/tick streams as candidate GP29 keys.

Uses the already-proven original MIDI note-off decoder, physically ordered dual
tracks, and source-frozen GP29 maps. No MP3 compression bytes are examined.
This is a direct test for reuse of earlier playable puzzle material in LP2.
"""
from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

import mido
import numpy as np
from filelock import FileLock

from lp2_cicada_audio_note_2012_source_sft import MIDI_URL, MIDI_BLOB_SHA, acquire, midi_positive
from lp2_cicada_audio_note_r4_source_sft import engine, original_words
from lp2_cicada_audio_historical_timing_and_short_period_sft import test_candidate

OUT = Path("lp2-original-2012-midi-as-lp2-key-results.json")
SEED = 20123301


def note_sources(path: Path) -> dict[str, np.ndarray]:
    midi = mido.MidiFile(str(path))
    assert len(midi.tracks) == 2
    ordered = [[], []]
    timed = []
    for index, track in enumerate(midi.tracks):
        absolute_ticks = 0
        for msg in track:
            absolute_ticks += msg.time
            if msg.type == "note_off":
                ordered[index - 1].append((int(msg.note), int(msg.time)))
                timed.append((absolute_ticks, index, int(msg.note), int(msg.time)))
    assert len(ordered[0]) == 558 and len(ordered[1]) == 714
    timed.sort(key=lambda x: (x[0], x[1]))
    arrays = {f"track{i + 1}_{'letter' if i == 0 else 'verse'}": np.asarray(events, dtype=np.int64)
              for i, events in enumerate(ordered)}
    arrays["parallel_chronological_midi"] = np.asarray([(x[2], x[3]) for x in timed], dtype=np.int64)
    arrays["track_concatenation"] = np.vstack(ordered).astype(np.int64)
    assert len(arrays["parallel_chronological_midi"]) == 1272
    return arrays


def representations(a: np.ndarray) -> dict[str, np.ndarray]:
    p, ticks = a[:, 0], a[:, 1]
    sum_key = p + ticks
    _, ranks = np.unique(sum_key, return_inverse=True)
    return {
        "pitch_mod29": np.asarray(p % 29, dtype=np.int32),
        "note_off_delta_mod29": np.asarray(ticks % 29, dtype=np.int32),
        "authentic_note_plus_delta_mod29": np.asarray(sum_key % 29, dtype=np.int32),
        "historical_note_plus_delta_rank": np.asarray(ranks, dtype=np.int32),
    }


def persist(report: dict) -> None:
    with FileLock(str(OUT) + ".lock"):
        tmp = OUT.with_suffix(".tmp")
        tmp.write_text(json.dumps(report, indent=2, allow_nan=True) + "\n", encoding="utf8")
        os.replace(tmp, OUT)


def main() -> None:
    report = {
        "schema": "lp2-2012-authentic-midi-note-key-original-v1",
        "source": {"url": MIDI_URL, "blob_git_sha1": MIDI_BLOB_SHA},
        "semantics": "2012 actual note-off pitch and msg.time; GP29 numeric projections and rank map are new hypotheses, not signed source key statements",
        "midi_positive": {}, "inputs": {}, "results": {},
    }
    with tempfile.TemporaryDirectory() as td:
        temp = Path(td)
        midi_file = temp / "original.mid"
        report["source"]["verified"] = acquire(MIDI_URL, midi_file, "gitsha1", MIDI_BLOB_SHA)
        report["midi_positive"] = midi_positive(midi_file)
        sections = original_words()
        lib, pi, lm, hashes = engine(temp)
        report["model_source_sha"] = hashes
        plants_checked = False
        for source, samples in note_sources(midi_file).items():
            meta = {"events": len(samples),
                    "unique_pitch_plus_delta": len(np.unique(samples[:, 0] + samples[:, 1])),
                    "delta_values": sorted(set(map(int, samples[:, 1])))}
            report["inputs"][source] = meta
            rows = {}
            for i, (name, base) in enumerate(representations(samples).items()):
                cardinality = len(set(map(int, base)))
                if name.endswith("rank") and cardinality > 29:
                    rows[name] = {"eligible": False, "unique_rank_symbols": cardinality,
                                  "reason": "historical ordered-sum alphabet exceeds GP29"}
                    continue
                outcome = test_candidate(lib, pi, lm, sections, base, SEED + i * 1000 + len(samples),
                                         not plants_checked)
                plants_checked = True
                outcome["distinct_key_symbols"] = cardinality
                rows[name] = outcome
            report["results"][source] = rows
            persist(report)
            print(json.dumps({"source_done": source, "meta": meta,
                              "scores": {k: {"ioc": v.get("original_additive", {}).get("ioc"),
                                             "r4": v.get("original_r4_max"),
                                             "eligible": v.get("eligible", True)}
                                         for k, v in rows.items()}}, allow_nan=True), flush=True)
    persist(report)
    print(json.dumps({"completed": True, "sources": list(report["results"]),
                      "positive": report["midi_positive"]["both_known_openings"]}), flush=True)


if __name__ == "__main__":
    main()
