#!/usr/bin/env python3
"""Original stereo-side difference test of the historical 2012 pitch-duration key.

Separate source-native stereo channels are observable, unlike arbitrary audio
spectrogram projections. The published R4 settings and planted nulls are fixed.
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import tempfile
import uuid
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from filelock import FileLock

from lp2_cicada_audio_pitch_duration_gate_sft import (
    SOURCE, GP, GROUPS, authentic_midi, detect_notes, direct_test, profile,
)
from lp2_cicada_audio_note_r4_source_sft import engine, original_words, screen_source
from lp2_cicada_audio_note_2012_source_sft import gitsha1

SR = 16000
N = 300


def stereo_pcm(path):
    completed = subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(), "-nostdin", "-hide_banner",
        "-loglevel", "error", "-i", str(path), "-vn",
        "-ac", "2", "-ar", str(SR), "-f", "f32le", "pipe:1",
    ], capture_output=True, check=True)
    samples = np.frombuffer(completed.stdout, dtype="<f4").reshape(-1, 2).copy()
    return samples


def main():
    manifest = json.loads((SOURCE / "manifest.json").read_text(encoding="utf8"))
    check = {item["file"]: item["digest"] for item in manifest}
    for name in ("761.MP3", "interconnectedness.mp3", "c.mp3"):
        data = (SOURCE / name).read_bytes()
        actual = hashlib.sha256(data).hexdigest() if name == "761.MP3" else gitsha1(data)
        assert actual == check[name], (name, actual, check[name])
    _, codebooks, _ = authentic_midi()
    sections = [
        (f"p{first}-{last}", np.asarray(
            [r for page in GP["pages"] if first <= page["page"] <= last
             for r in page["indices"]], dtype=np.int16,
        ))
        for first, last in GROUPS
    ]
    assert [len(c) for _, c in sections] == [
        729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308
    ]
    report = {
        "schema": "lp2-stereo-side-literal-2012-duration-key-v1",
        "operation": "difference stereo side = (L-R)/2; CQT pitch+nearest 24/96/192/384 sounding ticks",
        "parameters": "historical 2012 tempo 120bpm, published original R4 fixed q=.81 nu=.42",
        "source": {}, "r4_reference": "pnotisdev 15200c67abee106913ba01ff504c5b6e88d16cc7",
    }
    keys = {}
    for source, name in (("761", "761.MP3"), ("interconnectedness", "interconnectedness.mp3"),
                         ("c", "c.mp3")):
        both = stereo_pcm(SOURCE / name)
        left, right = both[:, 0], both[:, 1]
        side = (left - right) * 0.5
        note_events = detect_notes(side)
        summary, key = profile(note_events, codebooks)
        keys[source] = key
        correlation = float(np.corrcoef(left[::100], right[::100])[0, 1])
        report["source"][source] = {
            "channel_correlation": round(correlation, 6),
            "stereo_side_to_mid_rms_ratio": round(
                float(np.linalg.norm(side) / np.linalg.norm((left + right) * .5)), 5
            ),
            "side_timing": summary,
            "side_direct": direct_test(key, sections),
        }
        print(json.dumps({"source": source, "analysis": report["source"][source]}), flush=True)

    with tempfile.TemporaryDirectory() as directory:
        lib, pi, lm, hashes = engine(Path(directory))
        report["r4_exact_pins"] = hashes
        cipher = original_words()
        for name in report["source"]:
            key = keys[name]
            report["source"][name]["side_r4"] = (
                screen_source(lib, pi, lm, cipher, key, 13302130 + len(key))
                if len(key) >= N else {"eligible": False}
            )
            print(json.dumps({"source": name, "r4": report["source"][name]["side_r4"]}), flush=True)

    destination = SOURCE / "stereo-side-timing-results.json"
    with FileLock(str(destination) + ".lock"):
        tmp = destination.with_suffix(".tmp" + uuid.uuid4().hex)
        tmp.write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
        os.replace(tmp, destination)


if __name__ == "__main__":
    main()
