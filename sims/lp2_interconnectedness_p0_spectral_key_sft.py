#!/usr/bin/env python3
"""One fixed 262-symbol spectral-key test on the source-hashed 2014 MP3.

Hypothesis: the measured 262.122608 s repeated high-frequency-noise interval
(11,559,607 samples at 44.1 kHz) supplies one GP29 key symbol per p0 rune.
The 3.5–9 kHz band is the reported repeated-noise band. Divide that band into
29 equal bins and take the maximum-energy bin in each equal-duration interval
of the 262-symbol loop. This is a single predeclared extraction: no phase,
band, quantizer, or key search.

This is exploratory, not a proposed solution. It tests p0 only; the repository's
262/277 same-clock report already rejects applying the same additive pad to both
p0 and p29.
"""
from __future__ import annotations

import hashlib
import json
import math
import subprocess
import tempfile
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CORPUS_PATH = ROOT / "resources/liber-primus/lp2-corpus.json"
TRANSCRIPTION_PATH = ROOT / "resources/liber-primus/lp2-transcription.txt"
SOURCE_URL = "https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3"
EXPECTED_BYTES = 6_651_873
EXPECTED_GIT_SHA1 = "09fe068192b76a3697c47ec1d604b527703db798"
SAMPLE_RATE = 44_100
LOOP_SAMPLES = 11_559_607
BAND_LOW_HZ = 3_500.0
BAND_HIGH_HZ = 9_000.0
BAND_COUNT = 29


def load_corpus():
    data = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    page0 = next(p for p in data["pages"] if p["page"] == 0)["indices"]
    assert len(page0) == 262, len(page0)
    return data, page0


def p0_word_lengths(corpus):
    text = TRANSCRIPTION_PATH.read_text(encoding="utf-8")
    rune_to_index = {r: i for i, r in enumerate(corpus["runes"])}
    lengths = []
    current = 0
    seen = 0
    for ch in text:
        if ch == "%":
            break
        if ch in rune_to_index:
            current += 1
            seen += 1
        elif ch == "-":
            if current:
                lengths.append(current)
                current = 0
    if current:
        lengths.append(current)
    assert seen == 262, seen
    assert sum(lengths) == 262, lengths
    return lengths


def download_original():
    with urllib.request.urlopen(SOURCE_URL, timeout=120) as response:
        raw = response.read()
    assert len(raw) == EXPECTED_BYTES, len(raw)
    git_sha1 = hashlib.sha1(
        f"blob {len(raw)}\0".encode("ascii") + raw
    ).hexdigest()
    assert git_sha1 == EXPECTED_GIT_SHA1, git_sha1
    return raw, git_sha1


def decode_pcm(raw: bytes, workdir: Path):
    mp3 = workdir / "interconnectedness.mp3"
    pcm_path = workdir / "interconnectedness-mono-44100-f32le.pcm"
    mp3.write_bytes(raw)
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(mp3), "-vn", "-ac", "1", "-ar", str(SAMPLE_RATE),
            "-f", "f32le", "-acodec", "pcm_f32le", str(pcm_path),
        ],
        check=True,
    )
    samples = np.fromfile(pcm_path, dtype="<f4")
    assert len(samples) > LOOP_SAMPLES, len(samples)
    return samples


def dominant_band_symbol(segment: np.ndarray) -> tuple[int, list[float]]:
    # The Hann taper is the standard finite-window spectral estimate.
    windowed = segment.astype(np.float64) * np.hanning(len(segment))
    spectrum = np.fft.rfft(windowed)
    power = spectrum.real * spectrum.real + spectrum.imag * spectrum.imag
    frequencies = np.fft.rfftfreq(len(segment), d=1.0 / SAMPLE_RATE)
    edges = np.linspace(BAND_LOW_HZ, BAND_HIGH_HZ, BAND_COUNT + 1)
    energies = []
    for lo, hi in zip(edges[:-1], edges[1:]):
        mask = (frequencies >= lo) & (frequencies < hi)
        energies.append(float(power[mask].sum()))
    return int(np.argmax(energies)), energies


def extract_key(samples: np.ndarray, start: int, total_samples: int, count: int):
    boundaries = np.rint(
        np.linspace(start, start + total_samples, count + 1)
    ).astype(np.int64)
    symbols, energy_rows = [], []
    for i in range(count):
        a, b = int(boundaries[i]), int(boundaries[i + 1])
        assert b > a
        symbol, energies = dominant_band_symbol(samples[a:b])
        symbols.append(symbol)
        energy_rows.append(energies)
    return symbols, boundaries, energy_rows


def ioc(values):
    counts = np.bincount(np.asarray(values, dtype=np.int64), minlength=29)
    n = len(values)
    return float(np.sum(counts * (counts - 1)) / (n * (n - 1)))


def entropy(values):
    counts = np.bincount(np.asarray(values, dtype=np.int64), minlength=29)
    probs = counts[counts > 0] / len(values)
    return float(-np.sum(probs * np.log2(probs)))


def format_words(values, word_lengths, translit):
    out, offset = [], 0
    for n in word_lengths:
        out.append("".join(translit[x] for x in values[offset:offset + n]))
        offset += n
    assert offset == len(values)
    return " ".join(out)


def run_selftest():
    # Each synthetic one-second interval contains a tone at the center of its
    # assigned band. This checks the 29-band quantizer without external input.
    edges = np.linspace(BAND_LOW_HZ, BAND_HIGH_HZ, BAND_COUNT + 1)
    expected = list(range(BAND_COUNT))
    samples_per_window = SAMPLE_RATE
    n = np.arange(samples_per_window, dtype=np.float64)
    synthetic = []
    for symbol in expected:
        f = (edges[symbol] + edges[symbol + 1]) / 2.0
        synthetic.append(np.sin(2.0 * np.pi * f * n / SAMPLE_RATE).astype(np.float32))
    synthetic_pcm = np.concatenate(synthetic)
    recovered = []
    for i in range(BAND_COUNT):
        a = i * samples_per_window
        b = (i + 1) * samples_per_window
        recovered.append(dominant_band_symbol(synthetic_pcm[a:b])[0])
    assert recovered == expected, (recovered, expected)
    key = [((i * 11) + 7) % 29 for i in range(262)]
    plain = [((i * 17) + 3) % 29 for i in range(262)]
    cipher = [(p + k) % 29 for p, k in zip(plain, key)]
    decoded = [(c - k) % 29 for c, k in zip(cipher, key)]
    assert decoded == plain
    print(json.dumps({
        "type": "selftest",
        "status": "PASS",
        "syntheticFrequencyBands": 29,
        "base29AdditiveRoundTrip": True,
    }))


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--network", action="store_true")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        run_selftest()
        return
    if not args.network:
        parser.error("use --network or --selftest")

    corpus, cipher = load_corpus()
    word_lengths = p0_word_lengths(corpus)
    with tempfile.TemporaryDirectory(prefix="lp2-audio-spectral-") as tmp:
        workdir = Path(tmp)
        raw, git_sha1 = download_original()
        samples = decode_pcm(raw, workdir)

        key, boundaries, _ = extract_key(
            samples, start=0, total_samples=LOOP_SAMPLES, count=262
        )
        unit_samples = LOOP_SAMPLES / 262.0
        # The next 15 clock intervals begin at the measured repeat offset.
        # This is a diagnostic only; it is not used to alter the p0 key.
        tail, tail_boundaries, _ = extract_key(
            samples,
            start=LOOP_SAMPLES,
            total_samples=int(round(15 * unit_samples)),
            count=15,
        )
        counts = np.bincount(np.asarray(key), minlength=29).tolist()
        key_preview = "".join(corpus["translit"][x] for x in key)
        base = {
            "type": "source-and-key",
            "sourceUrl": SOURCE_URL,
            "sourceBytes": len(raw),
            "sourceGitBlobSha1": git_sha1,
            "sampleRate": SAMPLE_RATE,
            "decodedMonoSamples": int(len(samples)),
            "decodedDurationSeconds": len(samples) / SAMPLE_RATE,
            "reportedNoiseRepeatOffsetSamples": LOOP_SAMPLES,
            "reportedNoiseRepeatOffsetSeconds": LOOP_SAMPLES / SAMPLE_RATE,
            "p0RuneCount": len(cipher),
            "p0WordCount": len(word_lengths),
            "p0WordLengths": word_lengths,
            "clockUnitSamples": unit_samples,
            "clockUnitSeconds": unit_samples / SAMPLE_RATE,
            "frequencyBandHz": [BAND_LOW_HZ, BAND_HIGH_HZ],
            "frequencyBandCount": BAND_COUNT,
            "keyBandIndices": key,
            "keyBandTransliteration": key_preview,
            "keySymbolCounts": counts,
            "keyShannonEntropyBitsPerSymbol": entropy(key),
            "tail15BandIndices": tail,
            "tail15MatchesFirst15": sum(a == b for a, b in zip(tail, key[:15])),
            "tail15ExactSequenceMatch": tail == key[:15],
            "windowSamplesMinMax": [
                int(np.diff(boundaries).min()),
                int(np.diff(boundaries).max()),
            ],
            "tailWindowSamplesMinMax": [
                int(np.diff(tail_boundaries).min()),
                int(np.diff(tail_boundaries).max()),
            ],
            "ciphertextIoC": ioc(cipher),
        }
        print(json.dumps(base, sort_keys=True))

        for sign, label in [(-1, "subtract-key"), (1, "add-key")]:
            plain = [(c + sign * k) % 29 for c, k in zip(cipher, key)]
            print(json.dumps({
                "type": "p0-decryption",
                "operation": label,
                "plaintextIoC": ioc(plain),
                "plaintextWords": format_words(
                    plain, word_lengths, corpus["translit"]
                ),
                "plaintextIndices": plain,
            }, sort_keys=True))


if __name__ == "__main__":
    main()
