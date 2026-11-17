#!/usr/bin/env python3
"""Source-locked repeated-audio residual gate for original 2014 Interconnectedness MP3.

This tests a new, narrow hypothesis: the repeated opening/noise at the source-
published time separation might carry a deliberate *difference* payload.
It never turns arbitrary PCM samples into a fitted GP29 key.
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import tempfile
import urllib.request
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from filelock import FileLock
from scipy.signal import correlate

SOURCE = "https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3"
GIT_BLOB_SHA1 = "09fe068192b76a3697c47ec1d604b527703db798"
SAMPLERATE = 44100
SOURCE_REPORTED_REPEAT_LAG = 11559607
OUT = Path("interconnectedness-repeated-wave-residual.json")


def git_sha1(raw: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(raw)).encode("ascii") + b"\0" + raw).hexdigest()


def corr(a: np.ndarray, b: np.ndarray) -> float:
    ac = a.astype(np.float64) - float(np.mean(a))
    bc = b.astype(np.float64) - float(np.mean(b))
    return float(np.dot(ac, bc) / np.sqrt(np.dot(ac, ac) * np.dot(bc, bc)))


def describe_pair(a: np.ndarray, b: np.ndarray) -> dict:
    aa = a.astype(np.float64)
    bb = b.astype(np.float64)
    aa -= float(aa.mean())
    bb -= float(bb.mean())
    gain = float(np.dot(aa, bb) / np.dot(aa, aa))
    residual = bb - gain * aa
    return {
        "samples": int(len(a)),
        "pearson_r": corr(a, b),
        "gain": gain,
        "rms_intro": float(np.sqrt(np.mean(aa ** 2))),
        "rms_tail": float(np.sqrt(np.mean(bb ** 2))),
        "rms_residual": float(np.sqrt(np.mean(residual ** 2))),
        "residual_to_tail_rms": float(np.sqrt(np.mean(residual ** 2) / np.mean(bb ** 2))),
        "same_original_f32_samples": int(np.count_nonzero(a == b)),
        "residual_windows_one_second": [
            {
                "sec": k,
                "rms": float(np.sqrt(np.mean(residual[k * SAMPLERATE:(k+1)*SAMPLERATE] ** 2))),
                "pearson_r": corr(a[k * SAMPLERATE:(k+1)*SAMPLERATE], b[k * SAMPLERATE:(k+1)*SAMPLERATE])
            }
            for k in range(len(a) // SAMPLERATE)
        ]
    }


def main() -> None:
    with tempfile.TemporaryDirectory() as directory:
        source_file = Path(directory) / "interconnectedness.mp3"
        with urllib.request.urlopen(SOURCE, timeout=120) as response:
            raw = response.read()
        assert git_sha1(raw) == GIT_BLOB_SHA1, git_sha1(raw)
        source_file.write_bytes(raw)
        proc = subprocess.run([
            imageio_ffmpeg.get_ffmpeg_exe(), "-nostdin", "-hide_banner", "-loglevel", "error",
            "-i", str(source_file), "-vn", "-ac", "2", "-ar", str(SAMPLERATE),
            "-f", "f32le", "-acodec", "pcm_f32le", "pipe:1",
        ], check=True, capture_output=True)
        pcm = np.frombuffer(proc.stdout, dtype="<f4").reshape(-1, 2)
        n = int(len(pcm))
        lag = SOURCE_REPORTED_REPEAT_LAG
        assert n > lag + 3 * SAMPLERATE, n
        available = n - lag
        length = min(available - 1000, 14 * SAMPLERATE)
        assert length > 3 * SAMPLERATE, (available, length)
        report = {
            "source_git_blob_sha1": GIT_BLOB_SHA1,
            "source_sha256": hashlib.sha256(raw).hexdigest(),
            "source_bytes": len(raw),
            "source_pcm_samples_per_channel": n,
            "source_duration_seconds": n / SAMPLERATE,
            "reported_repeat_lag_samples": lag,
            "reported_repeat_lag_seconds": lag / SAMPLERATE,
            "source_hypothesis": "source-reported opening waveform recurs near end; a deliberate residual might be observable",
            "decoder": "ffmpeg float32 stereo 44100Hz, published fixed lag; normal least-squares gain and a small exact-alignment diagnostic",
            "channel_tests_at_exact_reported_lag": {},
            "wrong_segment_controls": {},
            "lag_refinement": {},
        }
        for c in range(2):
            intro = pcm[:length, c]
            tail = pcm[lag:lag + length, c]
            report["channel_tests_at_exact_reported_lag"][str(c)] = describe_pair(intro, tail)
            for control in [60, 120, 200]:
                start = control * SAMPLERATE
                report["wrong_segment_controls"][f"channel{c}_t{control}"] = {
                    "pearson_r": corr(intro, pcm[start:start + length, c]),
                }

        # The initial lag comes from a published original waveform observation,
        # not fitted to the ciphertext. A bounded +-1000 sample diagnostic checks
        # whether MP3 encoder delay creates a channel-relative offset.
        for c in range(2):
            src = np.asarray(pcm[:4 * SAMPLERATE, c], dtype=np.float64)
            dst = np.asarray(pcm[lag - 1000:lag + 4 * SAMPLERATE + 1000, c], dtype=np.float64)
            src -= src.mean()
            dst -= dst.mean()
            correlations = correlate(dst, src, mode="valid", method="fft")
            idx = int(np.argmax(correlations))
            refined_lag = lag + idx - 1000
            intro = pcm[:length, c]
            tail = pcm[refined_lag:refined_lag + length, c]
            report["lag_refinement"][str(c)] = {
                "searched_offset_range": [-1000, 1000],
                "best_offset": int(idx - 1000),
                "best_absolute_lag": refined_lag,
                "best_pair": describe_pair(intro, tail),
            }

        with FileLock(str(OUT) + ".lock"):
            temp = OUT.with_suffix(".json.tmp")
            temp.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
            os.replace(temp, OUT)
        print("SOURCE", report["source_git_blob_sha1"], len(raw), "samples", n)
        for c in range(2):
            print("CHANNEL", c, "exact", report["channel_tests_at_exact_reported_lag"][str(c)]["pearson_r"],
                  "best_lag", report["lag_refinement"][str(c)]["best_absolute_lag"],
                  "best_r", report["lag_refinement"][str(c)]["best_pair"]["pearson_r"],
                  "residual_rms_ratio", report["lag_refinement"][str(c)]["best_pair"]["residual_to_tail_rms"])
        print("WRONG_CONTROLS", report["wrong_segment_controls"])


if __name__ == "__main__":
    main()
