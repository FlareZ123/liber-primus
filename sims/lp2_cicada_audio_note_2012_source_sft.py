#!/usr/bin/env python3
"""Source-locked 2012 MIDI positive plus independent FFT/CQT note screens of 2013/14 audio.

2012 historical mapping: sorted distinct (MIDI note_off pitch + delta ticks) to
a 25-/23-letter alphabet. PCM-derived note observations are *not* authenticated
MIDI events; the GP29 pitch/interval projections below are deliberately labeled
diagnostics, never presented as a 2012-authored GP29 key.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
import tempfile
import urllib.request
from collections import Counter
from pathlib import Path

import imageio_ffmpeg
import librosa
import mido
import numpy as np
from scipy.signal import find_peaks, stft

ROOT = Path(__file__).resolve().parents[1]
GP = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
GROUPS = [(0, 2), (3, 7), (8, 14), (15, 22), (23, 26), (27, 32), (33, 39), (40, 53), (54, 55)]
SOURCES = {
    "761": (
        "https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3",
        "sha256", "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460"
    ),
    "interconnectedness": (
        "https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3",
        "gitsha1", "09fe068192b76a3697c47ec1d604b527703db798"
    ),
    "c": (
        "https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.3.mp3",
        "gitsha1", "1fbb00303c98bb1430adea408516e12a63b96d6d"
    ),
}
MIDI_URL = "https://raw.githubusercontent.com/neuroretransmit/cicada/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle/song.mid"
MIDI_BLOB_SHA = "11924e0e195208c2eea757655035e149fb8a190f"
SR, HOP, WINDOW = 16000, 512, 300


def gitsha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def acquire(url: str, path: Path, algorithm: str, expected: str) -> dict:
    with urllib.request.urlopen(url, timeout=120) as response:
        data = response.read()
    actual = gitsha1(data) if algorithm == "gitsha1" else hashlib.sha256(data).hexdigest()
    assert actual == expected, f"source mismatch {url}: {actual} != {expected}"
    path.write_bytes(data)
    return {"url": url, "bytes": len(data), algorithm: actual}


def midi_positive(path: Path) -> dict:
    midi = mido.MidiFile(str(path))
    tracks = [[], []]
    for index, track in enumerate(midi.tracks):
        for msg in track:
            if msg.type == "note_off":
                tracks[index - 1].append((msg.note, msg.time))
    alphabets = ("abcdefghiklmnopqrstuvwxyz", "abcdefghijklmnoprstuvwy")
    outputs = []
    for track, abc in zip(tracks, alphabets):
        values = sorted({pitch + ticks for pitch, ticks in track})
        assert len(values) == len(abc), (len(values), len(abc))
        lookup = dict(zip(values, abc))
        decoded = "".join(lookup[pitch + ticks] for pitch, ticks in track)
        outputs.append(decoded)
    assert outputs[0].startswith("verygoodyouhaveproventobemostdedicated")
    assert outputs[1].startswith("letthepriestsoftheravenofdawn")
    return {
        "control": "2012 MIDI original complete known-message positive",
        "events": [len(x) for x in tracks],
        "distinct_pitch_plus_delta": [len(set(p + t for p, t in x)) for x in tracks],
        "first_100_decoded": [x[:100] for x in outputs],
        "participant_words_appear": "muscledroppumpkneebirdwatch" in outputs[0],
        "both_known_openings": True,
    }


def pcm(path: Path) -> np.ndarray:
    completed = subprocess.run(
        [imageio_ffmpeg.get_ffmpeg_exe(), "-nostdin", "-hide_banner", "-loglevel", "error",
         "-i", str(path), "-vn", "-ac", "1", "-ar", str(SR),
         "-f", "f32le", "pipe:1"], check=True, capture_output=True,
    )
    y = np.frombuffer(completed.stdout, dtype="<f4").copy()
    assert y.size > SR, "too few PCM samples"
    return y


def note_fft(y: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    f, _, z = stft(y, fs=SR, nperseg=2048, noverlap=2048 - HOP, boundary="zeros")
    a = np.abs(z)
    flux = np.maximum(np.diff(a, axis=1), 0).sum(axis=0)
    peaks, _ = find_peaks(flux, distance=4, prominence=max(float(flux.std()) * 0.35, 1e-9))
    valid = (f >= 90) & (f <= 1600)
    bands = np.flatnonzero(valid)
    notes, times = [], []
    for onset in peaks:
        lo, hi = int(onset + 1), min(int(onset + 5), a.shape[1])
        if lo >= hi:
            continue
        amp = a[bands, lo:hi].mean(axis=1)
        if amp.max() <= 0:
            continue
        frequency = float(f[bands[int(amp.argmax())]])
        notes.append(int(np.rint(librosa.hz_to_midi(frequency))))
        times.append(int(onset))
    return np.asarray(notes, dtype=np.int16), np.asarray(times, dtype=np.int32)


def note_cqt(y: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    c = np.abs(librosa.cqt(
        y, sr=SR, hop_length=HOP, fmin=librosa.note_to_hz("C2"), n_bins=72
    ))
    flux = np.maximum(np.diff(c, axis=1), 0).sum(axis=0)
    peaks, _ = find_peaks(flux, distance=4, prominence=max(float(flux.std()) * 0.35, 1e-9))
    notes, times = [], []
    for onset in peaks:
        lo, hi = int(onset + 1), min(int(onset + 5), c.shape[1])
        if lo >= hi:
            continue
        amp = c[:, lo:hi].mean(axis=1)
        if amp.max() <= 0:
            continue
        notes.append(36 + int(amp.argmax()))
        times.append(int(onset))
    return np.asarray(notes, dtype=np.int16), np.asarray(times, dtype=np.int32)


def ioc29(values: np.ndarray) -> float:
    freq = np.bincount(values.astype(np.int64), minlength=29)
    n = len(values)
    return float(29 * (freq * (freq - 1)).sum() / (n * (n - 1))) if n > 1 else 0.0


def screen(stream: np.ndarray, sections: list[tuple[str, np.ndarray]]) -> dict:
    if len(stream) < WINDOW:
        return {"eligible": False, "key_length": len(stream)}
    record = {"ioc": -1.0}
    tested = 0
    for name, section in sections:
        c = section[:WINDOW]
        for offset in range(len(stream) - WINDOW + 1):
            k = stream[offset:offset + WINDOW]
            for sign in (-1, 1):
                p = (c + sign * k) % 29
                score = ioc29(p)
                tested += 1
                if score > record["ioc"]:
                    record = {"ioc": round(score, 8), "chapter": name, "offset": offset,
                              "sign": sign, "plaintext_first_75_GP_indices": p[:75].tolist()}
    record["tested"] = tested
    return record


def main() -> None:
    sections = [
        (f"p{start}-{end}",
         np.asarray([r for page in GP["pages"] if start <= page["page"] <= end
                     for r in page["indices"]], dtype=np.int16))
        for start, end in GROUPS
    ]
    assert [len(c) for _, c in sections] == [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]
    for name, c in sections:
        assert len(c) >= WINDOW, name
    rng = np.random.default_rng(1330)
    report = {"schema": "lp2-cicada-audio-note-2012-positive-v1",
              "limits": "2013/14 PCM event mappings are exploratory, not historical 2012 note_off+delta mappings",
              "corpus_chapters": {name: len(c) for name, c in sections}, "sources": {}}
    with tempfile.TemporaryDirectory() as dirname:
        folder = Path(dirname)
        midi_path = folder / "source2012.mid"
        report["midi_source"] = acquire(MIDI_URL, midi_path, "gitsha1", MIDI_BLOB_SHA)
        report["positive"] = midi_positive(midi_path)
        for name, (url, algorithm, expected) in SOURCES.items():
            src = folder / (name + ".mp3")
            meta = acquire(url, src, algorithm, expected)
            signal = pcm(src)
            meta["pcm_seconds"] = round(len(signal) / SR, 4)
            variants = {}
            for method, extractor in (("fft", note_fft), ("cqt", note_cqt)):
                pitches, onset_frames = extractor(signal)
                assert len(pitches) == len(onset_frames)
                entry = {
                    "events": len(pitches),
                    "distinct_pitches": len(set(map(int, pitches))),
                    "top_pitches": Counter(map(int, pitches)).most_common(8),
                    "median_gap_seconds": round(float(np.median(np.diff(onset_frames))) * HOP / SR, 4)
                    if len(pitches) > 1 else None,
                }
                for representation, numbers in (
                    ("absolute_mod29", pitches % 29),
                    ("interval_mod29", np.diff(pitches) % 29),
                ):
                    numbers = np.asarray(numbers, dtype=np.int16)
                    result = screen(numbers, sections)
                    if result.get("eligible", True) is not False:
                        # 20 matched, preseeded, order-shuffled controls across the exact nine sections.
                        nulls = [screen(rng.permutation(numbers), sections)["ioc"] for _ in range(20)]
                        result["shuffled_global_best_ioc_max"] = round(max(nulls), 8)
                        result["shuffled_global_best_ioc_median"] = round(float(np.median(nulls)), 8)
                        known = np.resize(np.asarray(GP["pages"][57]["indices"], dtype=np.int16), WINDOW)
                        planted = (known + numbers[:WINDOW]) % 29
                        assert np.array_equal((planted - numbers[:WINDOW]) % 29, known)
                        result["planted_known_GP_ioc"] = round(ioc29((planted - numbers[:WINDOW]) % 29), 8)
                        # A high IoC without a coherent plaintext and source-authored key map is not a hit.
                    entry[representation] = result
                variants[method] = entry
            meta["note_methods"] = variants
            report["sources"][name] = meta
            print(json.dumps({"source_complete": name, "meta": meta}, ensure_ascii=False), flush=True)
    Path("lp2-audio-note-source-results.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print(json.dumps({"finished": True, "source_names": list(report["sources"]),
                      "positive": report["positive"]}), flush=True)


if __name__ == "__main__":
    main()
