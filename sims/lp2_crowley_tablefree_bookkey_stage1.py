#!/usr/bin/env python3
"""CROWLEY stage-1 original-input screen, using pinned third-party phase-23 code.

Only measurements, offsets, hashes, and original ciphertext are persisted.
The 2013 original-source Crowley chapters are read locally and hashed, never printed.
The source/algorithm, spellings, skip law, eight original windows, thresholds,
and 8-position start grid are fixed before any original screen.

Distinct source-selected 2013 Crowley book-code investigation (Agent3).
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import time
from urllib.request import Request, urlopen

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
# Three original, independently dated 2013 Crowley book-code chapters.
# No OCR, source substitution, tuned offset or later edition is used.
CROWLEY_CHAPTERS = (
    ("resources/external/2013-book-of-law-I.txt", "64876892683fab1467481fe87d85743a8ea17982"),
    ("resources/external/2013-book-of-law-II.txt", "cb4353b080d7584441f85502aeccb60796e6fe0f"),
    ("resources/external/2013-book-of-law-III.txt", "36e716252a271d31f5c4ba25b3cb78199ccc1114"),
)
GUTENBERG_WALDEN = "https://www.gutenberg.org/cache/epub/205/pg205.txt"
GUTENBERG_EMERSON = "https://www.gutenberg.org/cache/epub/2944/pg2944.txt"
SECTIONS = [
    (0, 2, 729), (3, 7, 1145), (8, 14, 1729),
    (15, 22, 1903), (23, 26, 1021), (27, 32, 1433),
    (33, 39, 1680), (40, 53, 3008),
]
THRESHOLD = {"digraph": -0.0112, "letters": -0.0417}
BEAM, PER_PTR, SPREAD = 64, 8, 8
Q, WINDOW, SKIP_Q = 29, 729, 0.81
UPSTREAM = "15200c67abee106913ba01ff504c5b6e88d16cc7"


def get(url):
    with urlopen(Request(url, headers={"User-Agent": "lp2-crowley-bookkey-gate"}), timeout=90) as stream:
        return stream.read()


def original_windows():
    corpus_bytes = (ROOT / "resources/liber-primus/lp2-corpus.json").read_bytes()
    assert hashlib.sha256(corpus_bytes).hexdigest() == "58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338", "original source corpus drift"
    source = json.loads(corpus_bytes)
    pages = {p["page"]: p["indices"] for p in source["pages"]}
    assert len(source["runes"]) == 29
    out = []
    for a, b, expected in SECTIONS:
        seq = np.asarray([r for page in range(a, b + 1) for r in pages[page]], dtype=np.int64)
        assert seq.size == expected, (a, b, seq.size, expected)
        out.append(seq[:WINDOW])
    return out, hashlib.sha256(corpus_bytes).hexdigest()


def control(beam_decode, encrypt_skip_ptr, log_ratio, flattest_table,
            to_runes, wrongbook_text, key, MT, source, spelling):
    """Frozen original-2013 CROWLEY-source positive with unknown flattening table.

    A plant is a calibration of the detector's power, never an LP2 recovery.
    """
    rng = np.random.default_rng(4242 if spelling == "digraph" else 4243)
    raw = get(GUTENBERG_EMERSON).decode("utf-8", errors="ignore")
    # Gutenberg body rule from the exact upstream algorithm; no supplied crib.
    a, b = raw.find("*** START"), raw.find("*** END")
    text = raw[raw.find("\n", a) + 1:b] if a >= 0 and b > a else raw
    P = to_runes(text, letters=False)
    assert len(P) >= 8 * WINDOW
    p_dist = np.bincount(P, minlength=Q) / len(P)
    k_dist = np.bincount(key, minlength=Q) / len(key)
    _, pi = flattest_table(p_dist, k_dist, rng, restarts=3)
    table = np.argsort(pi)
    output = []
    negatives = []
    wrongbook = to_runes(wrongbook_text, letters=(spelling == "letters"))
    assert len(wrongbook) > 3 * WINDOW + 50
    for run in range(6):
        o = 300 + run * ((len(key) - 3 * WINDOW - 350) // 6)
        assert o > 0 and o + 3 * WINDOW < len(key)
        po = 500 + run * 901
        plaintext = P[po:po + WINDOW]
        c, used = encrypt_skip_ptr(plaintext, table[key[o:o + 3 * WINDOW]], rng)
        # Free 8-key alignment, including a three-position initial misalignment.
        start = o - 3
        score, path = beam_decode(c, key, start, MT, BEAM, source.LN_SKIP,
                                  PER_PTR, SPREAD)
        s = score / WINDOW
        assert np.isfinite(s)
        output.append({
            "offset": int(o), "beam": float(s),
            "pass": bool(s > THRESHOLD[spelling]),
            "path_agreement": float(np.mean(path == o + used)),
            "original": False
        })
        wrong_offset = (o + 7000) % (len(key) - 3 * WINDOW - 8)
        wrong_book_offset = (o + 9000) % (len(wrongbook) - 3 * WINDOW - 8)
        random_key = rng.integers(0, Q, 3 * WINDOW)
        uniform_c, _ = encrypt_skip_ptr(plaintext, random_key, rng)
        checks = (
            ("wrong_CROWLEY_offset", c, key, wrong_offset),
            ("wrong_book_Walden", c, wrongbook, wrong_book_offset),
            ("uniform_key_null", uniform_c, key, start)
        )
        for label, control_c, control_key, control_offset in checks:
            null_score, _ = beam_decode(
                control_c, control_key, control_offset, MT,
                BEAM, source.LN_SKIP, PER_PTR, SPREAD
            )
            ratio = float(null_score / WINDOW)
            negatives.append({"kind": label, "score": ratio,
                              "pass": ratio > THRESHOLD[spelling]})
    if not any(x["pass"] for x in output):
        raise AssertionError("Native six-plant detector calibration failed")
    assert not any(x["pass"] for x in negatives), "Null crossed registered stage1 threshold"
    return output, negatives


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--upstream", required=True, help="directory holding pinned work/*.py")
    ap.add_argument("--shard", type=int, required=True)
    ap.add_argument("--shards", type=int, default=4)
    ap.add_argument("--scope", choices=("smoke", "full"), default="full")
    ap.add_argument("--output", required=True)
    args = ap.parse_args()
    assert 0 <= args.shard < args.shards

    sys.path.insert(0, str(Path(args.upstream) / "work"))
    import book_key_decoder as bkd
    from book_key_flatness import flattest_table, to_runes

    windows, corpus_sha = original_windows()
    chunks = []
    for rel, expected_git_blob in CROWLEY_CHAPTERS:
        chapter = (ROOT / rel).read_bytes()
        blob = b"blob " + str(len(chapter)).encode() + b"\0" + chapter
        assert hashlib.sha1(blob).hexdigest() == expected_git_blob, rel + " source drift"
        chunks.append(chapter)
    book_bytes = b"\n".join(chunks)
    raw = book_bytes.decode("utf-8", errors="strict")
    wb = get(GUTENBERG_WALDEN)
    assert hashlib.sha256(wb).hexdigest() == "2d9a76a2e3e8195c69430516ebd33c4d0757a53ad432ff6186b7b794e6fe99f9", "original source Walden language model drift"
    wb_text = wb.decode("utf-8", errors="ignore")
    p, q = wb_text.find("*** START"), wb_text.find("*** END")
    walden = wb_text[wb_text.find("\n", p) + 1:q] if p >= 0 and q > p else wb_text
    model = bkd.log_ratio(to_runes(walden))
    assert model.shape == (Q, Q)

    outcome = {
        "method": "pnotisdev phase23 table-invariant skip-aware beam, stage1 only",
        "upstream": UPSTREAM,
        "crowley_chapter_git_blobs": [x[1] for x in CROWLEY_CHAPTERS],
        "crowley_utf8_bytes": len(book_bytes),
        "crowley_raw_sha256": hashlib.sha256(book_bytes).hexdigest(),
        "walden_raw_sha256": hashlib.sha256(wb).hexdigest(),
        "corpus_sha256": corpus_sha,
        "section_page_ranges": [list(x) for x in SECTIONS],
        "threshold": THRESHOLD,
        "beam": BEAM, "per_ptr": PER_PTR, "spread": SPREAD,
        "skip_q": SKIP_Q, "window_size": WINDOW,
        "shard": args.shard, "shards": args.shards, "scope": args.scope,
        "formats": {}
    }

    for spelling in ("digraph", "letters"):
        letters = spelling == "letters"
        key = to_runes(raw, letters=letters)
        minimum_key_length = 3 * WINDOW + 16
        assert len(key) > minimum_key_length
        plant, negatives = control(
            bkd.beam_decode, bkd.encrypt_skip_ptr, bkd.log_ratio,
            flattest_table, to_runes, walden, key, model, bkd, spelling
        )
        best = [[-1e100, -1] for _ in windows]
        hit = []
        offsets = 0
        start_wall = time.monotonic()
        # Cover every original source key offset with a 128-rune
        # skip-drift reserve after a 729-rune original window.
        # Source keys never wrap. Grid stride is fixed by the upstream beam.
        start, end = 0, len(key) - WINDOW - 128
        for offset in range(start, end, SPREAD):
            if (offset // SPREAD) % args.shards != args.shard:
                continue
            if args.scope == "smoke" and offsets >= 6:
                break
            offsets += 1
            for section, original in enumerate(windows):
                score, _ = bkd.beam_decode(original, key, offset, model,
                                           BEAM, bkd.LN_SKIP, PER_PTR, SPREAD)
                value = float(score / WINDOW)
                if value > best[section][0]:
                    best[section] = [value, offset]
                if value > THRESHOLD[spelling]:
                    hit.append({"section": section, "offset": offset,
                                "nats_per_rune": value})
            if offsets % 200 == 0:
                print(f"shard={args.shard} {spelling} offsets={offsets} "
                      f"elapsed={time.monotonic()-start_wall:.1f}s",
                      flush=True)

        summary = {
            "key_runes": int(len(key)), "offsets_tested": offsets,
            "best_by_section": [
                {"section": i, "score": float(v[0]), "offset": int(v[1])}
                for i, v in enumerate(best)
            ], "stage1_hits": hit,
            "plant": plant, "negative_controls": negatives,
            "elapsed_seconds": time.monotonic()-start_wall
        }
        outcome["formats"][spelling] = summary
        print(f"{spelling} shard={args.shard}, offsets={offsets}, "
              f"hits={len(hit)}, max={max(v[0] for v in best):.7f}",
              flush=True)

    result = Path(args.output)
    result.parent.mkdir(parents=True, exist_ok=True)
    from filelock import FileLock
    import tempfile
    with FileLock(str(result) + ".lock"):
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
                                         dir=result.parent, delete=False) as f:
            json.dump(outcome, f, indent=2)
            f.write("\n")
            temp = f.name
        os.replace(temp, result)
    print("RESULT " + str(result), flush=True)


if __name__ == "__main__":
    main()
