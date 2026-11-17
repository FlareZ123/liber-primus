#!/usr/bin/env python3
"""Source-locked original audio pitch+duration key gate with historical MIDI control.

The historical 2012 positive uses literal pitch + note-on to note-off duration.
PCM extraction is an experimental receiver and cannot identify encrypted LP2 by
itself. All GP29 plaintext claims require a full original-cipher decode.
"""
from __future__ import annotations

import json
import os
import tempfile
import uuid
from collections import Counter
from pathlib import Path

import librosa
import mido
import numpy as np
from filelock import FileLock
from scipy.ndimage import median_filter
from scipy.signal import find_peaks

from lp2_cicada_audio_note_2012_source_sft import GP, GROUPS, HOP, SR, gitsha1, pcm, screen
from lp2_cicada_audio_note_r4_source_sft import (
    THRESHOLD, engine, guard, original_words, plant, screen_source,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "run-data/agent3-authentic-audio"
CLASS_TICKS = np.asarray([24, 96, 192, 384], dtype=np.int32)
CLASS_SECONDS = CLASS_TICKS * (0.5 / 96)
CLASS_TOLERANCE = np.asarray([0.05, 0.12, 0.20, 0.30])
N = 300
SEED = 13302012


def authentic_midi():
    raw = (SOURCE / "song.mid").read_bytes()
    assert gitsha1(raw) == "11924e0e195208c2eea757655035e149fb8a190f"
    midi = mido.MidiFile(str(SOURCE / "song.mid"))
    assert midi.ticks_per_beat == 96 and len(midi.tracks) == 3
    codebooks, stats = [], []
    for tid, track in enumerate(midi.tracks[1:], 1):
        now = 0
        active = {}
        previous = None
        events = []
        for msg in track:
            now += msg.time
            if msg.type == "note_on" and msg.velocity > 0:
                active[(msg.channel, msg.note)] = now
            elif msg.type == "note_off":
                duration = now - active.pop((msg.channel, msg.note))
                assert previous is not None and previous.type == "note_on"
                assert previous.note == msg.note and previous.channel == msg.channel
                assert duration == msg.time, (tid, duration, msg.time)
                assert duration in CLASS_TICKS
                events.append((msg.note, duration, now))
            previous = msg
        expected = (558, 714)[tid - 1]
        assert len(events) == expected and not active
        codebook = set(p + dur for p, dur, _ in events)
        codebooks.append(codebook)
        stats.append({
            "track": tid, "note_count": len(events),
            "unique_pitch_duration_codevalues": len(codebook),
            "pitches": sorted(set(p for p, _, _ in events)),
            "durations": dict(Counter(str(d) for _, d, _ in events)),
            "note_off_delta_equals_sounding_duration": len(events),
        })
    assert [len(s) for s in codebooks] == [25, 23]
    return midi, codebooks, stats


def detect_notes(y: np.ndarray):
    c = np.abs(librosa.cqt(
        y, sr=SR, hop_length=HOP, fmin=librosa.note_to_hz("C2"), n_bins=72,
    ))
    flux = np.maximum(np.diff(c, axis=1), 0).sum(axis=0)
    peaks, _ = find_peaks(
        flux, distance=4, prominence=max(float(flux.std()) * 0.35, 1e-9),
    )
    onsets = []
    for t in peaks:
        amplitude = c[:, t + 1:t + 5].mean(axis=1)
        if len(amplitude):
            onsets.append((int(amplitude.argmax()), int(t + 1)))
    background = np.percentile(c, 10, axis=1)
    smooth = median_filter(c, size=(1, 3))
    future_by_pitch = {}
    for k, t in onsets:
        future_by_pitch.setdefault(k, []).append(t)
    notes = []
    for k, t in onsets:
        if t + 6 >= c.shape[1]:
            continue
        peak = float(smooth[k, t:t + 5].max())
        floor = float(background[k])
        threshold = floor + 0.35 * (peak - floor)
        limit = min(t + int(3 * SR / HOP), c.shape[1] - 3)
        future = smooth[k, t + 3:limit]
        crossed = np.flatnonzero(
            (future[:-2] < threshold)
            & (future[1:-1] < threshold)
            & (future[2:] < threshold)
        )
        end = t + 3 + int(crossed[0]) if len(crossed) else limit
        # Rearticulation of the same pitch terminates its previous note.
        later = next((u for u in future_by_pitch[k] if u > t + 3), None)
        if later is not None:
            end = min(end, later)
        notes.append((k + 36, (end - t) * HOP / SR, t * HOP / SR))
    return notes


def synthetic_2012(midi: mido.MidiFile):
    now = 0
    active = {}
    notes = []
    for msg in midi.tracks[1]:
        now += msg.time
        if msg.type == "note_on" and msg.velocity > 0:
            active[(msg.channel, msg.note)] = now
        if msg.type == "note_off":
            on = active.pop((msg.channel, msg.note))
            notes.append((msg.note, on * 0.5 / 96, now * 0.5 / 96))
            if len(notes) == 120:
                break
    assert len(notes) == 120
    y = np.zeros(int((notes[-1][2] + 1) * SR), dtype=np.float32)
    for pitch, start, stop in notes:
        a, b = round(start * SR), round(stop * SR)
        length = b - a
        t = np.arange(length)
        envelope = np.minimum(1, np.minimum(t / 320, (length - t - 1) / 320)).clip(0, 1)
        hz = 440 * (2 ** ((pitch - 69) / 12))
        y[a:b] += (0.5 * np.sin(t * (2 * np.pi * hz / SR)) * envelope).astype(np.float32)
    return y


def profile(notes, codebooks):
    pitch = np.asarray([p for p, _, _ in notes], dtype=np.int32)
    duration = np.asarray([d for _, d, _ in notes], dtype=np.float64)
    which = np.abs(duration[:, None] - CLASS_SECONDS).argmin(axis=1)
    code = pitch + CLASS_TICKS[which]
    aligned = np.abs(duration - CLASS_SECONDS[which]) < CLASS_TOLERANCE[which]
    key = np.asarray(code % 29, dtype=np.int16)
    return {
        "events": len(notes), "distinct_pitches": len(set(pitch.tolist())),
        "distinct_pitch_duration_values": len(set(code.tolist())),
        "duration_class_close": round(float(aligned.mean()), 6),
        "in_2012_track1_codebook": round(float(np.isin(code, sorted(codebooks[0])).mean()), 6),
        "in_2012_track2_codebook": round(float(np.isin(code, sorted(codebooks[1])).mean()), 6),
        "duration_class_counts": np.bincount(which, minlength=4).tolist(),
        "first_20_pitch_duration_seconds": [
            [int(p), round(float(d), 3)] for p, d, _ in notes[:20]
        ],
    }, key


def direct_test(key, sections):
    if len(key) < N:
        return {"eligible": False, "note_symbols": len(key)}
    rng = np.random.default_rng(SEED + len(key))
    actual = screen(key, sections)
    nulls = [screen(rng.permutation(key), sections)["ioc"] for _ in range(20)]
    known = np.resize(np.asarray(GP["pages"][57]["indices"], dtype=np.int16), N)
    synthetic = (known + key[:N]) % 29
    assert np.array_equal((synthetic - key[:N]) % 29, known)
    return {
        "eligible": True, "test": "GP29 additive original section starts",
        "best": actual, "matched_20_shuffle_max": round(float(max(nulls)), 7),
        "matched_20_shuffle_median": round(float(np.median(nulls)), 7),
        "planted_300_exact": True,
        "preregistered_ioc_threshold": 1.4,
    }


def main():
    manifest = json.loads((SOURCE / "manifest.json").read_text(encoding="utf8"))
    for entry in manifest:
        data = (SOURCE / entry["file"]).read_bytes()
        if entry["algorithm"] == "gitsha1":
            actual = gitsha1(data)
        else:
            import hashlib
            actual = hashlib.sha256(data).hexdigest()
        assert actual == entry["digest"], entry["file"]
    midi, codebooks, stats = authentic_midi()
    positive, positive_key = profile(detect_notes(synthetic_2012(midi)), codebooks)
    assert positive["duration_class_close"] > 0.9
    assert positive["in_2012_track1_codebook"] > 0.99
    chapters = [
        (f"p{a}-{b}", np.asarray(
            [x for page in GP["pages"] if a <= page["page"] <= b
             for x in page["indices"]], dtype=np.int16,
        ))
        for a, b in GROUPS
    ]
    assert [len(s) for _, s in chapters] == [
        729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308,
    ]
    report = {
        "schema": "lp2-audio-note-duration-source-r4-v1",
        "history": stats, "synthetic_positive": positive,
        "inference": "2012 note_off delta equals each note duration; later PCM durations are exploratory",
        "fixed_receiver": {
            "source_tempo_bpm": 120, "ticks_per_beat": 96,
            "duration_ticks": CLASS_TICKS.tolist(),
            "CQT_hop": HOP, "sample_rate": SR, "duration_drop": 0.35,
            "duration_cap_seconds": 3, "class_seconds": CLASS_SECONDS.tolist(),
            "class_tolerance_seconds": CLASS_TOLERANCE.tolist(),
            "native_GP29_lift": "raw pitch + quantized original duration ticks mod29",
        },
        "sources": {},
    }
    note_keys = {}
    for source, name in (
        ("761", "761.MP3"),
        ("interconnectedness", "interconnectedness.mp3"),
        ("c", "c.mp3"),
    ):
        notes = detect_notes(pcm(SOURCE / name))
        profile_stats, key = profile(notes, codebooks)
        note_keys[source] = key
        report["sources"][source] = {
            "timing": profile_stats,
            "direct": direct_test(key, chapters),
        }
        print(json.dumps({"source": source, "summary": report["sources"][source]}), flush=True)

    with tempfile.TemporaryDirectory() as tmp:
        lib, pi, lm, hashes = engine(Path(tmp))
        report["r4_source_hashes"] = hashes
        r4_sections = original_words()
        control_key = note_keys["761"]
        control_results = {}
        for mode in ("hold", "spend"):
            for sign in (1, -1):
                cipher, meta = plant(r4_sections[0][2], control_key, mode, sign,
                                     pi, lm, SEED + sign + (mode == "spend") * 1000)
                score, off = guard(
                    lib, cipher, r4_sections[0][2], control_key, sign, mode, pi, lm,
                )
                assert score >= THRESHOLD and abs(off) <= 3
                control_results[f"{mode}_{sign}"] = {
                    "score": round(score, 5), "offset": off, "meta": meta,
                }
        report["r4_planted_source_key_controls"] = control_results
        for source, key in note_keys.items():
            if len(key) < N:
                report["sources"][source]["r4"] = {"eligible": False}
                continue
            report["sources"][source]["r4"] = screen_source(
                lib, pi, lm, r4_sections, key, SEED + len(key),
            )
            print(json.dumps({
                "source": source, "r4": report["sources"][source]["r4"],
            }), flush=True)

    output = SOURCE / "timing-gate-results.json"
    with FileLock(str(output) + ".lock"):
        temporary = SOURCE / ("timing-gate-" + uuid.uuid4().hex + ".tmp")
        temporary.write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
        os.replace(temporary, output)
    print(json.dumps({"completed": True, "path": str(output),
                      "midi_duration_events": sum(s["note_count"] for s in stats)}), flush=True)


if __name__ == "__main__":
    main()
