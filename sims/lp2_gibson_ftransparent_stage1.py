#!/usr/bin/env python3
"""GIBSON literal-F stage-1 original-input screen, using pinned third-party phase-23 code.

Only measurements, offsets, hashes, and original ciphertext are persisted.
The copyrighted original 2012 book text is fetched at runtime, never printed or committed.
The original 2012 source, authentic p56 plaintext-F bypass, candidate anti-repeat\nq=.81 skip law, eight original windows, and fixed zero-score diagnostic gate,
and an 8-position start grid are fixed for the original scan.\nA 128/16 alternative was tested on controls without improving 3/6 and 5/6 recovery.

Distinct source-selected 2012 Gibson poem investigation (Agent42).
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
from lp2_ftransparent_bookkey_beam import beam_decode_f, encrypt_skip_ptr_f

ROOT = Path(__file__).resolve().parents[1]
PINNED_GIBSON = (
    "https://raw.githubusercontent.com/neuroretransmit/cicada/"
    "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/"
    "2012/006-two-book-codes/books/agrippa.txt"
)
GIBSON_BLOB = "673ba225d1277945f2d2e5056bf025db8e89bb92"
GUTENBERG_WALDEN = "https://www.gutenberg.org/cache/epub/205/pg205.txt"
GUTENBERG_EMERSON = "https://www.gutenberg.org/cache/epub/2944/pg2944.txt"
SECTIONS = [
    (0, 2, 729), (3, 7, 1145), (8, 14, 1729),
    (15, 22, 1903), (23, 26, 1021), (27, 32, 1433),
    (33, 39, 1680), (40, 53, 3008),
]
THRESHOLD = {"digraph": 0.0, "letters": 0.0}
BEAM, PER_PTR, SPREAD = 64, 8, 8
Q, WINDOW, SKIP_Q = 29, 729, 0.81
UPSTREAM = "15200c67abee106913ba01ff504c5b6e88d16cc7"


def get(url):
    with urlopen(Request(url, headers={"User-Agent": "lp2-gibson-bookkey-gate"}), timeout=90) as stream:
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
    """Frozen author-era GIBSON-source positive with unknown flattening table.

    A plant is a calibration of the detector's power, never an LP2 recovery.
    """
    rng = np.random.default_rng(4342 if spelling == "digraph" else 4343)
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
            "path_agreement": float(np.mean(path == np.where(used < 0, -1, o + used))),
            "original": False
        })
        wrong_offset = (o + 7000) % (len(key) - 3 * WINDOW - 8)
        wrong_book_offset = (o + 9000) % (len(wrongbook) - 3 * WINDOW - 8)
        random_key = rng.integers(0, Q, 3 * WINDOW)
        uniform_c, _ = encrypt_skip_ptr(plaintext, random_key, rng)
        checks = (
            ("wrong_GIBSON_offset", c, key, wrong_offset),
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
    ap.add_argument("--scope", choices=("smoke", "full", "tail"), default="full")
    ap.add_argument("--output", required=True)
    args = ap.parse_args()
    assert 0 <= args.shard < args.shards

    sys.path.insert(0, str(Path(args.upstream) / "work"))
    import book_key_decoder as bkd
    from book_key_flatness import flattest_table, to_runes

    windows, corpus_sha = original_windows()
    book_bytes = get(PINNED_GIBSON)
    blob = b"blob " + str(len(book_bytes)).encode() + b"\0" + book_bytes
    assert hashlib.sha1(blob).hexdigest() == GIBSON_BLOB, "GIBSON source drift"
    raw = book_bytes.decode("utf-8", errors="strict")
    # The authenticated 2012 line:character extraction begins at verse one.
    first_verse = raw.find("\nI hesitated\n")
    assert first_verse >= 0, "first authentic verse missing"
    raw = raw[first_verse + 1:]
    wb = get(GUTENBERG_WALDEN)
    assert hashlib.sha256(wb).hexdigest() == "2d9a76a2e3e8195c69430516ebd33c4d0757a53ad432ff6186b7b794e6fe99f9", "original source Walden language model drift"
    wb_text = wb.decode("utf-8", errors="ignore")
    p, q = wb_text.find("*** START"), wb_text.find("*** END")
    walden = wb_text[wb_text.find("\n", p) + 1:q] if p >= 0 and q > p else wb_text
    model = bkd.log_ratio(to_runes(walden))
    assert model.shape == (Q, Q)

    outcome = {
        "method": "table-free unknown-shift beam with authentic literal-F bypass and q=.81 candidate anti-doublet skip, stage1 only",
        "upstream": UPSTREAM,
        "gibson_blob_sha1": GIBSON_BLOB,
        "gibson_utf8_bytes": len(book_bytes),
        "gibson_raw_sha256": hashlib.sha256(book_bytes).hexdigest(),
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
            beam_decode_f, encrypt_skip_ptr_f, bkd.log_ratio,
            flattest_table, to_runes, walden, key, model, bkd, spelling
        )
        best = [[-1e100, -1] for _ in windows]
        hit = []
        offsets = 0
        start_wall = time.monotonic()
        # Whole-run conservative window and disjoint near-end extension.
        # The late-region model leaves 128 symbols beyond a 729-rune readout,
        # accommodating realistic skip drift without wrapping the 2012 poem.
        if args.scope == "tail":
            lo = len(key) - 3 * WINDOW
            start = ((lo + SPREAD - 1) // SPREAD) * SPREAD
            end = len(key) - WINDOW - 128
        else:
            start, end = 0, len(key) - 3 * WINDOW
        for offset in range(start, end, SPREAD):
            if (offset // SPREAD) % args.shards != args.shard:
                continue
            if args.scope == "smoke" and offsets >= 6:
                break
            offsets += 1
            for section, original in enumerate(windows):
                score, _ = beam_decode_f(original, key, offset, model,
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
