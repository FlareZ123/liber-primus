#!/usr/bin/env python3
"""Independent decode/check of the 2014 Interconnectedness MP3 timing selector.

Run with:
  python3 sims/interconnectedness_audio_timing_sft.py --mp3 /tmp/index.mp3
Requires ffmpeg and numpy. The workflow installs both; the MP3 is never executed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

import numpy as np

EXPECTED_BYTES = 6_651_873
EXPECTED_GIT_BLOB_SHA1 = "09fe068192b76a3697c47ec1d604b527703db798"
EXPECTED_SAMPLE_RATE = 44_100
REPORTED_LAG = 11_559_607
SOURCE_URL = "https://raw.githubusercontent.com/krisyotam/cicada3301/76d3ee8c762f60025822c8c05edbf31351636469/media/audio/index.mp3"
ROOT = Path(__file__).resolve().parents[1]


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def correlation(a: np.ndarray, b: np.ndarray) -> float:
    a = np.asarray(a, dtype=np.float64)
    b = np.asarray(b, dtype=np.float64)
    a = a - a.mean()
    b = b - b.mean()
    denom = math.sqrt(float(np.dot(a, a)) * float(np.dot(b, b)))
    return float(np.dot(a, b) / denom) if denom else 0.0


def prime_count(n: int) -> int:
    if n < 2:
        return 0
    sieve = bytearray(b"\x01") * (n + 1)
    sieve[0:2] = b"\x00\x00"
    for p in range(2, int(n**0.5) + 1):
        if sieve[p]:
            sieve[p * p:n + 1:p] = b"\x00" * (((n - p * p) // p) + 1)
    return sum(sieve)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mp3", required=True, type=Path)
    parser.add_argument("--output", type=Path, default=Path("interconnectedness-audio-timing.json"))
    args = parser.parse_args()

    raw = args.mp3.read_bytes()
    blob_sha1 = git_blob_sha1(raw)
    assert len(raw) == EXPECTED_BYTES, len(raw)
    assert blob_sha1 == EXPECTED_GIT_BLOB_SHA1, blob_sha1

    pcm_path = args.mp3.with_suffix(".stereo-f32le")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(args.mp3),
         "-f", "f32le", "-acodec", "pcm_f32le", "-ar", str(EXPECTED_SAMPLE_RATE),
         "-ac", "2", str(pcm_path)],
        check=True,
    )
    pcm = np.fromfile(pcm_path, dtype="<f4")
    assert pcm.size % 2 == 0
    stereo = pcm.reshape((-1, 2))
    frames = int(stereo.shape[0])
    assert frames > REPORTED_LAG
    overlap = frames - REPORTED_LAG

    channel_corr = [
        correlation(stereo[:overlap, ch], stereo[REPORTED_LAG:, ch])
        for ch in range(2)
    ]
    mono = stereo.mean(axis=1)
    mono_corr = correlation(mono[:overlap], mono[REPORTED_LAG:])

    # A tight local scan checks whether the reported lag is actually the peak.
    scan = []
    for delta in range(-20, 21):
        lag = REPORTED_LAG + delta
        n = frames - lag
        scan.append({
            "delta_samples": delta,
            "lag_samples": lag,
            "corr_left": correlation(stereo[:n, 0], stereo[lag:, 0]),
            "corr_right": correlation(stereo[:n, 1], stereo[lag:, 1]),
        })
    best = max(scan, key=lambda x: (x["corr_left"] + x["corr_right"]) / 2)

    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    page_lengths = {p["page"]: len(p["indices"]) for p in corpus["pages"]}
    lag_remainder = REPORTED_LAG % 1152
    duration = frames / EXPECTED_SAMPLE_RATE
    lag_seconds = REPORTED_LAG / EXPECTED_SAMPLE_RATE
    tail_seconds = overlap / EXPECTED_SAMPLE_RATE

    result = {
        "source_url": SOURCE_URL,
        "source_bytes": len(raw),
        "git_blob_sha1": blob_sha1,
        "sha256": hashlib.sha256(raw).hexdigest(),
        "sample_rate_hz": EXPECTED_SAMPLE_RATE,
        "channels": 2,
        "decoded_frames_per_channel": frames,
        "duration_seconds": duration,
        "reported_repeat_lag_samples": REPORTED_LAG,
        "repeat_lag_seconds": lag_seconds,
        "overlap_samples": overlap,
        "overlap_seconds": tail_seconds,
        "correlation_first_vs_tail": {
            "left": channel_corr[0],
            "right": channel_corr[1],
            "mono": mono_corr,
        },
        "local_lag_scan_plus_minus_20": scan,
        "local_peak": best,
        "page_length_alignment": {
            "p0_runes": page_lengths.get(0),
            "p29_runes": page_lengths.get(29),
            "rounded_lag_seconds": round(lag_seconds),
            "rounded_duration_seconds": round(duration),
            "rounded_overlap_seconds": round(tail_seconds),
            "p55_runes": page_lengths.get(55),
            "p56_runes": page_lengths.get(56),
            "prime_count_262": prime_count(262),
            "lag_mod_1152": lag_remainder,
            "prime_count_lag_remainder": prime_count(lag_remainder),
        },
    }
    args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
