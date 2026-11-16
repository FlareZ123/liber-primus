#!/usr/bin/env python3
"""Calibrate Phase23 GEB key detector under single-character OCR corruption.

Tests key-text errors under a fixed authentic-source GP29 encoding. Never
stores or prints copyrighted GEB text. Plant-only, no unknown plaintext
is asserted and no threshold is retuned. Issue #1186.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile

import numpy as np
import lp2_geb_tablefree_bookkey_stage1 as gate


def book_body(raw):
    a, b = raw.find("*** START"), raw.find("*** END")
    return raw[raw.find("\n", a) + 1:b] if a >= 0 and b > a else raw


def altered_key(true_source, amount, kind):
    """Return altered observable OCR and coordinates of actual source glyphs."""
    reader = true_source.copy()
    index_map = np.arange(-3, reader.size - 3, dtype=np.int64)
    if amount == 0:
        return reader, index_map
    sites = [3 + (i + 1) * 600 // (amount + 1) for i in range(amount)]
    assert all(30 <= p < 700 for p in sites)
    # Apply descending-coordinate changes to keep source sites stable.
    for p in reversed(sites):
        if kind == "substitution":
            reader[p] = (int(reader[p]) + 13) % gate.Q
        elif kind == "insert_observed":
            reader = np.insert(reader, p, (int(reader[p]) + 7) % gate.Q)
            index_map = np.insert(index_map, p, -1000000)
        elif kind == "delete_observed":
            reader = np.delete(reader, p)
            index_map = np.delete(index_map, p)
        else:
            raise ValueError(kind)
    return reader, index_map


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--upstream", required=True)
    ap.add_argument("--output", required=True)
    args = ap.parse_args()
    sys.path.insert(0, str(Path(args.upstream) / "work"))
    import book_key_decoder as decoder
    from book_key_flatness import to_runes, flattest_table

    original = gate.get(gate.PINNED_GEB)
    blob = b"blob " + str(len(original)).encode() + b"\0" + original
    assert hashlib.sha1(blob).hexdigest() == gate.GEB_BLOB
    raw = original.decode("utf-8", errors="ignore")
    wr = gate.get(gate.GUTENBERG_WALDEN)
    assert hashlib.sha256(wr).hexdigest() == (
        "2d9a76a2e3e8195c69430516ebd33c4d0757a53ad432ff6186b7b794e6fe99f9"
    )
    er = gate.get(gate.GUTENBERG_EMERSON)
    plaintext = to_runes(book_body(er.decode("utf-8", errors="ignore")))
    assert len(plaintext) > 20000
    MT = decoder.log_ratio(to_runes(book_body(wr.decode("utf-8", errors="ignore"))))
    report = {
        "kind": "plant-only OCR drift robustness with original GEB source",
        "upstream": gate.UPSTREAM, "geb_blob": gate.GEB_BLOB,
        "walden_sha256": hashlib.sha256(wr).hexdigest(),
        "emerson_sha256": hashlib.sha256(er).hexdigest(),
        "model": "phase23 original 729-rune 64-state 8-history beam, skip q=.81",
        "original_ocr_corrupted_in_tests": True, "runs": 6,
        "error_levels": [0, 1, 4, 8],
        "results": {}
    }

    for spelling in ("digraph", "letters"):
        rng = np.random.default_rng(12011 if spelling == "digraph" else 12012)
        K = to_runes(raw, letters=(spelling == "letters"))
        Pdist = np.bincount(plaintext, minlength=29) / len(plaintext)
        Kdist = np.bincount(K, minlength=29) / len(K)
        _, pi = flattest_table(Pdist, Kdist, rng, restarts=3)
        shifts = np.argsort(pi)
        rows = []
        for run in range(6):
            start = 1000 + run * 20123
            pos = 510 + run * 1051
            p = plaintext[pos:pos + gate.WINDOW]
            c, used = decoder.encrypt_skip_ptr(
                p, shifts[K[start:start + 3 * gate.WINDOW]], rng
            )
            original_reference = K[start - 3:start + 3 * gate.WINDOW + 20]
            for kind in ("none", "substitution", "insert_observed", "delete_observed"):
                for errors in ([0] if kind == "none" else [1, 4, 8]):
                    observed, index_map = altered_key(
                        original_reference, errors, kind
                    )
                    score, path = decoder.beam_decode(
                        c, observed, 0, MT, gate.BEAM,
                        decoder.LN_SKIP, gate.PER_PTR, gate.SPREAD
                    )
                    valid = float(score / gate.WINDOW)
                    rows.append({
                        "run": run, "kind": kind, "errors": errors,
                        "score": valid,
                        "hit": bool(valid > gate.THRESHOLD[spelling]),
                        "path_agreement": float(np.mean(index_map[path] == used))
                    })

        by_condition = []
        for kind in ("none", "substitution", "insert_observed", "delete_observed"):
            for level in ([0] if kind == "none" else [1, 4, 8]):
                sub = [r for r in rows if r["kind"] == kind and r["errors"] == level]
                by_condition.append({
                    "kind": kind, "errors": level, "power": sum(r["hit"] for r in sub),
                    "trials": len(sub),
                    "mean_nats_per_rune": float(np.mean([r["score"] for r in sub])),
                    "mean_pointer_accuracy": float(np.mean(
                        [r["path_agreement"] for r in sub]
                    ))
                })
        assert by_condition[0]["power"] >= 4, "uncorrupted source positive failed"
        report["results"][spelling] = by_condition
        print(spelling + ": " + "; ".join(
            f"{x['kind']} {x['errors']}={x['power']}/{x['trials']}"
            for x in by_condition
        ), flush=True)

    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent,
                                     delete=False) as stream:
        json.dump(report, stream, indent=2)
        stream.write("\n")
        temp = stream.name
    os.replace(temp, path)


if __name__ == "__main__":
    main()
