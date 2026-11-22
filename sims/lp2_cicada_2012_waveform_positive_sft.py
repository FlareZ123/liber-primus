#!/usr/bin/env python3
"""Literal 2012 Cicada MIDI cipher through original sounding waveforms and MP3.

Independent positive for the historical pitch + sounding-duration receiver.
It does not claim that any later Cicada recording contains this code.
"""
from __future__ import annotations

import json
import os
import subprocess
import tempfile
import urllib.request
from pathlib import Path

import imageio_ffmpeg
import mido
import numpy as np
from filelock import FileLock
from scipy.ndimage import uniform_filter1d

from lp2_cicada_audio_note_2012_source_sft import gitsha1

MIDI_URL = ("https://raw.githubusercontent.com/neuroretransmit/cicada/"
            "b13600373d3400d75ec4208198019f3d92a304dd/"
            "2012/009-midi-puzzle/song.mid")
SHA = "11924e0e195208c2eea757655035e149fb8a190f"
ALPHABETS = ("abcdefghiklmnopqrstuvwxyz", "abcdefghijklmnoprstuvwy")
SR = 16000
DURATIONS = np.array([24, 96, 192, 384], dtype=int)
SECONDS = DURATIONS * 0.5 / 96


def notes_from_track(midi, track):
    tick = 0
    starts = {}
    notes = []
    for event in midi.tracks[track]:
        tick += event.time
        if event.type == "note_on" and event.velocity > 0:
            starts[(event.channel, event.note)] = tick
        elif event.type == "note_off":
            key = (event.channel, event.note)
            before = starts.pop(key)
            assert tick - before == event.time
            assert event.time in DURATIONS
            notes.append((event.note, before * 0.5 / 96, tick * 0.5 / 96, event.time))
    assert not starts
    return notes


def synthesize(notes, harmonics):
    duration = notes[-1][2]
    waveform = np.zeros(round((duration + 1) * SR), dtype=np.float32)
    for pitch, first, last, _ in notes:
        begin, end = round(first * SR), round(last * SR)
        step = np.arange(end - begin)
        env = np.minimum(1, np.minimum(step / 320, (end - begin - step - 1) / 320)).clip(0, 1)
        hz = 440 * 2 ** ((pitch - 69) / 12)
        wave = sum(gain * np.sin(step * (2 * np.pi * multiple * hz / SR))
                   for multiple, gain in harmonics)
        waveform[begin:end] += np.asarray(wave * env, dtype=np.float32)
    return waveform


def recover(waveform):
    active = uniform_filter1d(np.abs(waveform), size=128) > 0.05
    edges = np.diff(np.r_[False, active, False].astype(np.int8))
    starts, stops = np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)
    received = []
    for first, last in zip(starts, stops):
        segment = waveform[first:last]
        middle = segment[len(segment) // 5: len(segment) * 4 // 5]
        spectrum = np.abs(np.fft.rfft(middle * np.hanning(len(middle)), n=65536))
        hz = int(spectrum.argmax()) * SR / 65536
        assert hz > 0
        pitch = round(69 + 12 * np.log2(hz / 440))
        elapsed = (last - first) / SR
        ticks = int(DURATIONS[np.argmin(np.abs(SECONDS - elapsed))])
        received.append((pitch, ticks))
    return received


def mp3_cycle(waveform, temp):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    target = Path(temp) / "synthesized.mp3"
    subprocess.run([
        ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error",
        "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
        "-codec:a", "libmp3lame", "-b:a", "128k", "-y", str(target),
    ], input=waveform.astype("<f4").tobytes(), check=True, capture_output=True)
    result = subprocess.run([
        ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", str(target), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "pipe:1",
    ], check=True, capture_output=True)
    return np.frombuffer(result.stdout, dtype="<f4").copy()


def main():
    with tempfile.TemporaryDirectory() as temp:
        midipath = Path(temp) / "song.mid"
        with urllib.request.urlopen(MIDI_URL, timeout=120) as response:
            original = response.read()
        assert gitsha1(original) == SHA
        midipath.write_bytes(original)
        midi = mido.MidiFile(str(midipath))
        assert midi.ticks_per_beat == 96
        report = {
            "schema": "cicada-2012-full-waveform-original-sft-v1",
            "midi_blob_sha1": SHA,
            "tempo_us_per_beat": 500000,
            "duration_ticks": DURATIONS.tolist(),
            "description": "All source MIDI note-offs equal the prior note-on sounding duration",
            "controls": [],
        }
        for track_index in (1, 2):
            notes = notes_from_track(midi, track_index)
            expected_pairs = [(p, delta) for p, _, _, delta in notes]
            book = sorted({p + delta for p, delta in expected_pairs})
            alphabet = ALPHABETS[track_index - 1]
            assert len(book) == len(alphabet)
            codebook = dict(zip(book, alphabet))
            known = "".join(codebook[p + delta] for p, delta in expected_pairs)
            beginning = ("verygoodyouhaveproventobemostdedicated"
                         if track_index == 1 else "letthepriestsoftheravenofdawn")
            assert known.startswith(beginning)
            for timbre, harmonics in (
                ("sine", ((1, 0.5),)),
                ("three_harmonics", ((1, 0.3), (2, 0.15), (3, 0.05))),
            ):
                original_wave = synthesize(notes, harmonics)
                cases = [("uncompressed", original_wave)]
                if timbre == "three_harmonics":
                    cases.append(("MP3_128kbps", mp3_cycle(original_wave, temp)))
                for codec, wave in cases:
                    recovered = recover(wave)
                    assert recovered == expected_pairs, (
                        track_index, timbre, codec, len(recovered), len(expected_pairs)
                    )
                    readback = "".join(codebook[p + delta] for p, delta in recovered)
                    assert readback == known
                    result = {
                        "track": track_index,
                        "codec": codec,
                        "timbre": timbre,
                        "exact_pairs": len(recovered),
                        "total_pairs": len(expected_pairs),
                        "decoded_text_first100": readback[:100],
                        "all_plaintext_exact": True,
                    }
                    report["controls"].append(result)
                    print(json.dumps(result), flush=True)
        assert sum(x["exact_pairs"] for x in report["controls"] if x["codec"] == "MP3_128kbps") == 1272
        output = Path("run-data/agent3-cicada-2012-waveform-positive.json")
        output.parent.mkdir(parents=True, exist_ok=True)
        with FileLock(str(output) + ".lock"):
            tmpfile = output.with_suffix(".tmp")
            tmpfile.write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
            os.replace(tmpfile, output)


if __name__ == "__main__":
    main()
