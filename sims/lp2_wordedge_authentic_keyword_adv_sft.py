#!/usr/bin/env python3
"""Issue #1195: one source-fixed LP2 word-boundary extra-key-advance gate.

Run in GitHub Actions with the pinned phase24 reference engine; manual CI only.
The 2014 solved LP1 keyword FIRFUMFERENFE is the only source key.
No LP2 language parameter, key phase, event rate, alphabet or window is fitted.
"""
import hashlib
import json
from pathlib import Path
import sys

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
KEYWORD = "FIRFUMFERENFE"
Q = 29
NU = 0.42
COLLISION_Q = 0.81
T300 = 29.799
WINDOW = 300
PHASE = 0
EXPECTED_CORPUS_SHA256 = "58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338"


def model(training):
    """Unfitted GP29 bigram language model, trained on source-held Gibran."""
    freq = np.bincount(training, minlength=Q).astype(float) + 0.5
    pi = freq / freq.sum()
    counts = np.full((Q, Q), 0.5, dtype=np.float64)
    np.add.at(counts, (training[:-1], training[1:]), 1.0)
    lm = counts / counts.sum(axis=1)[:, None]
    assert np.allclose(lm.sum(axis=1), 1.0) and abs(pi.sum() - 1.0) < 1e-12
    return pi, lm


def original():
    """Preserve every original rune and word boundary across page/line wraps."""
    blob = (ROOT / "resources/liber-primus/lp2-corpus.json").read_bytes()
    digest = hashlib.sha256(blob).hexdigest()
    assert digest == EXPECTED_CORPUS_SHA256
    corpus = json.loads(blob)
    source = (ROOT / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8")
    fragments = source.strip().split("%")
    assert len(fragments) == 57, len(fragments)
    runes = {ch: i for i, ch in enumerate(corpus["runes"])}
    pages = [[] for _ in range(58)]
    starts = [[] for _ in range(58)]
    before_word = True
    # The raw transcription omits physical p50: its 256 table digits
    # are in a separately parsed numeric artifact, with no GP runes.
    for printed, fragment in enumerate(fragments):
        page = printed if printed < 50 else printed + 1
        data = []
        word_starts = []
        for ch in fragment:
            if ch in runes:
                data.append(runes[ch])
                word_starts.append(bool(before_word))
                before_word = False
            elif ch in "-.&$§":
                before_word = True
            elif ch in "/ \n\t\r":
                continue
            else:
                raise AssertionError(f"Unclassified original glyph page{page}: {ch!r}")
        assert data == corpus["pages"][page]["indices"], page
        pages[page] = data
        starts[page] = word_starts
    out = {}
    for p, next_page, label in ((0, 1, "p0_p1_first300"), (40, 41, "p40_p41_first300")):
        c = (pages[p] + pages[next_page])[:WINDOW]
        candidate = (starts[p] + starts[next_page])[:WINDOW]
        assert len(c) == len(candidate) == WINDOW
        candidate[0] = False
        out[label] = (np.asarray(c, dtype=np.int64),
                      np.asarray(candidate, dtype=np.uint8))
    assert sum(len(x) for x in pages[:56]) == 12956
    return out, digest


def emit(plain, cand, key, seed):
    """Independent hold-channel generator with extra advance at word starts.

    The collision rule and "hold" key behaviour follow source phase24
    plant_edge.py step(ch='m04') at original q=.81, including the uniform
    different-rune replacement on an aborted collision.
    """
    rng = np.random.default_rng(seed)
    ciphertext = []
    j = PHASE
    advances = 0
    repairs = 0
    for i, p in enumerate(plain):
        if i and cand[i] and rng.random() < NU:
            j += 1
            advances += 1
        raw = (int(p) + int(key[j])) % Q
        if ciphertext and raw == ciphertext[-1] and rng.random() < COLLISION_Q:
            index = int(rng.integers(0, Q - 1))
            x = index + (index >= ciphertext[-1])
            repairs += 1
            # hold: the normal key position is reused on the next rune
        else:
            x = raw
            j += 1
        ciphertext.append(int(x))
    return np.asarray(ciphertext, dtype=np.int64), advances, repairs


def score(cipher, cand, key, pi, lm, engine):
    """Original phase24 exact marginal likelihood, never estimated key skips."""
    raw = engine.all_offsets_edge(cipher, key, 1, COLLISION_Q,
                                  "hold", pi, lm, kind=2, cand=cand, nu=NU)
    base = engine.all_offsets_edge(cipher, key, 1, COLLISION_Q,
                                   "hold", pi, lm, kind=0, cand=cand, nu=0)
    # The historically fixed first key position is zero; no phase fitting.
    advance_score = float(raw[PHASE, 0] - raw[PHASE, 1])
    base_score = float(base[PHASE, 0] - base[PHASE, 1])
    return {
        "advance": advance_score,
        "base": base_score,
        "gain": advance_score - base_score,
        "crosses_T300": bool(advance_score >= T300),
        "event_mask_count": int(cand.sum())
    }


def main():
    assert len(sys.argv) == 2, "Pass the checked-out pinned external repository path"
    upstream = Path(sys.argv[1]).resolve()
    sys.path.insert(0, str(upstream / "work"))
    sys.path.insert(0, str(upstream / "work/chanscreen/v2"))
    from book_key_flatness import to_runes
    import engine_edge

    key13 = to_runes(KEYWORD, letters=False)
    assert len(key13) == 13, (len(key13), key13)
    assert to_runes(KEYWORD, letters=True).tolist() == key13.tolist()
    key = np.tile(key13, 64)
    assert len(key) == 832
    pages, corpus_sha = original()

    gibran = (ROOT / "resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8")
    source = to_runes(gibran)
    train_end = int(len(source) * 0.75)
    pi, lm = model(source[:train_end])
    held = source[train_end:]
    assert len(held) >= WINDOW * 4

    # Frozen original word boundaries are the only event candidates in all
    # original and plant streams; the independent source language is held out.
    cand = pages["p0_p1_first300"][1]
    plants = []
    for n in range(3):
        plaintext = held[100 + n * 301:100 + n * 301 + WINDOW]
        cipher, advances, repairs = emit(plaintext, cand, key, 119500 + n)
        good = score(cipher, cand, key, pi, lm, engine_edge)
        wrong_key = np.tile(key13[::-1], 64)
        wrong = score(cipher, cand, wrong_key, pi, lm, engine_edge)
        # A complete one-time uniform GP29 key as an independent wrong-source
        # comparator, frozen independently from the original LP2 ciphertext.
        rng = np.random.default_rng(20141195 + n)
        nullkey = rng.integers(0, Q, len(key), dtype=np.int64)
        null = score(cipher, cand, nullkey, pi, lm, engine_edge)
        plants.append({
            "advance_events": advances, "collision_repairs": repairs,
            "true_source_key": good, "reverse_wrong_key": wrong,
            "uniform_wrong_key": null
        })
        assert good["crosses_T300"], "Powered native-positive plant missed the registered gate"
        assert good["gain"] >= 20.0, "Native-positive did not distinguish extra advances"
        assert not wrong["crosses_T300"], "Native-positive reversed-key null crossed gate"
        assert not null["crosses_T300"], "Native-positive uniform-key null crossed gate"

    original_readouts = {
        name: score(cipher, starts, key, pi, lm, engine_edge)
        for name, (cipher, starts) in pages.items()
    }
    report = {
        "source": "2014 solved LP1 keyword FIRFUMFERENFE; phase24 extra-advance likelihood",
        "original_corpus_sha256": corpus_sha,
        "original_windows": ["p0 first262 + p1 first38", "p40 first231 + p41 first69"],
        "keyword": KEYWORD, "keyword_runes": key13.tolist(),
        "source_key_phase": PHASE, "source_key_repeat": 13, "source_key_length": len(key),
        "channel": "hold", "output_sign": 1, "q": COLLISION_Q,
        "advance_probability": NU, "window": WINDOW,
        "threshold_T300": T300, "native_train_runes": train_end,
        "native_heldout_runes": len(held), "plants": plants,
        "original": original_readouts,
        "original_undeciphered_plaintext_runes": 12956,
        "registered_gate_passed": all(x["true_source_key"]["crosses_T300"] for x in plants),
        "candidate_original_hit": any(x["crosses_T300"] and x["gain"] >= 20
                                      for x in original_readouts.values())
    }
    print(json.dumps(report, sort_keys=True, indent=2), flush=True)


if __name__ == "__main__":
    main()
