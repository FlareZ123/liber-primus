#!/usr/bin/env python3
"""Source-locked skip-aware GP29 running-key test of Cicada's 2014 Self-Reliance key.

The key is the exact Self-Reliance text used in the historical 2014 material,
pinned by the external repository commit in the companion workflow. The
inverse allows up to three key-symbol skips per ciphertext rune when a skipped
key symbol would have emitted the previous ciphertext rune. It tests every
source offset with enough remaining key for that bound, both arithmetic signs,
and optional GP29 Atbash of the ciphertext.

The external Campaign XVIII decoder is imported at a pinned commit. Its
quadgram model is generic English; its fast prefilter bigram model is replaced
with an independent Shakespeare-derived model to avoid training on the key
source itself. This is a source-specific candidate test, not a claim that
Self-Reliance was actually used as the LP2 key.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import random
import re
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CORPUS_PATH = ROOT / "resources/liber-primus/lp2-corpus.json"
SHAKESPEARE_PATH = ROOT / "resources/control/shakespeare_first300k.txt"
EXPECTED_EXTERNAL_COMMIT = "f63501d8f2d835b80c30230eb89a1110fb9197d2"
PLANT_OFFSET = 12345
PLANT_SEED = 0x330136


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def encode_source_native(text: str, translit: list[str]) -> np.ndarray:
    """Use the GP spellings independently attested in solved LP1 source.

    ING is one ᛝ rune and IO is one ᛡ rune in the source-calibrated LP1
    orthography. Remaining multi-rune spellings use the canonical longest
    GP token. This is the primary key spelling tested here.
    """
    tokens = sorted(((token, i) for i, token in enumerate(translit)),
                    key=lambda item: -len(item[0]))
    clean = (text.upper().replace("QU", "CW").replace("V", "U")
             .replace("K", "C").replace("Q", "C").replace("Z", "S"))
    out: list[int] = []
    for word in re.findall(r"[A-Z]+", clean):
        i = 0
        while i < len(word):
            if word.startswith("ING", i):
                out.append(21)
                i += 3
                continue
            if word.startswith("IO", i):
                out.append(27)
                i += 2
                continue
            for token, ordinal in tokens:
                if word.startswith(token, i):
                    out.append(ordinal)
                    i += len(token)
                    break
            else:
                raise ValueError(f"unmapped source at {word[i:i+12]!r}")
    return np.asarray(out, dtype=np.int64)


def load_external_decoder(external_root: Path):
    sweep_dir = external_root / "analysis/campaign18_skip"
    sys.path[:0] = [str(external_root / "src"),
                    str(external_root / "analysis"), str(sweep_dir)]
    path = sweep_dir / "sweep.py"
    spec = importlib.util.spec_from_file_location("lp2_self_reliance_skip_sweep", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot import external sweep at {path}")
    sweep = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(sweep)
    import skipdecode
    if not skipdecode.gate():
        raise RuntimeError("pinned skip-decoder planted-key/wrong-key gate failed")
    return sweep, skipdecode


def replace_prefilter_lm(sweep, shakespeare: str, translit: list[str]) -> None:
    """Use a language model independent of the candidate running-key text."""
    idx = encode_source_native(shakespeare[:240000], translit)
    mono = np.ones(29, dtype=np.float64)
    bigram = np.ones((29, 29), dtype=np.float64)
    for value in idx:
        mono[int(value)] += 1.0
    for a, b in zip(idx[:-1], idx[1:]):
        bigram[int(a), int(b)] += 1.0
    sweep.M_LM = np.log(mono / mono.sum())
    sweep.BG_LM = np.log(bigram / bigram.sum(axis=1, keepdims=True))


def encipher_keyskip(plain: np.ndarray, key: np.ndarray, offset: int,
                     sign: int, suppression: float = 0.83) -> tuple[np.ndarray, int]:
    rng = random.Random(PLANT_SEED)
    out: list[int] = []
    ptr = offset
    previous = None
    skips = 0
    for p in plain:
        while True:
            emitted = (int(p) - sign * int(key[ptr])) % 29
            if previous is not None and emitted == previous and rng.random() < suppression:
                ptr += 1
                skips += 1
                continue
            break
        out.append(emitted)
        previous = emitted
        ptr += 1
    return np.asarray(out, dtype=np.int64), skips


def verify_reencipher(cipher: np.ndarray, plain: list[int], key: np.ndarray,
                      offset: int, sign: int, atbash: int,
                      max_skip: int) -> tuple[int, list[int]] | None:
    """Independently prove that a returned plaintext has a legal key-skip path."""
    target = ((28 - cipher) % 29) if atbash else cipher
    ptr = offset
    previous = None
    skips: list[int] = []
    for i, p in enumerate(plain):
        accepted = False
        for d in range(max_skip + 1):
            if i == 0 and d:
                break
            if ptr + d >= len(key):
                break
            if d and previous is None:
                continue
            skipped_ok = all(
                (int(p) - sign * int(key[ptr + m])) % 29 == previous
                for m in range(d)
            )
            if not skipped_ok:
                continue
            emitted = (int(p) - sign * int(key[ptr + d])) % 29
            if emitted == int(target[i]):
                ptr += d + 1
                previous = int(target[i])
                skips.append(d)
                accepted = True
                break
        if not accepted:
            return None
    return ptr, skips


def search_page(sweep, skipdecode, cipher: np.ndarray, key: np.ndarray):
    best = (-99.0, None)
    hits = []
    for sign in (-1, 1):
        for atbash in (0, 1):
            transformed = ((28 - cipher) % 29) if atbash else cipher
            offsets = sweep.prefilter(transformed, key, sign)
            for offset in offsets:
                screen_len = min(sweep.SCREEN_LEN, len(transformed))
                screen_plain = sweep.beam(
                    transformed, key, sign, int(offset),
                    screen_len, sweep.SCREEN_BEAM
                )
                screen_text = skipdecode.idx_to_trans(screen_plain)
                screen_score = sweep.Q.score_norm(screen_text)
                if screen_score > best[0]:
                    best = (screen_score, (sign, atbash, int(offset)))
                if screen_score <= sweep.SCREEN_THR:
                    continue
                full_plain = sweep.beam(
                    transformed, key, sign, int(offset),
                    len(transformed), sweep.FULL_BEAM
                )
                full_text = skipdecode.idx_to_trans(full_plain)
                full_score = sweep.Q.score_norm(full_text)
                if full_score <= sweep.CONF_THR:
                    continue
                trace = verify_reencipher(
                    cipher, full_plain, key, int(offset), sign,
                    atbash, sweep.MAXSKIP
                )
                if trace is None:
                    raise AssertionError("skip beam returned a path that fails independent re-encipherment")
                end_ptr, skip_counts = trace
                hits.append({
                    "score": float(full_score),
                    "sign": sign,
                    "atbash": atbash,
                    "offset": int(offset),
                    "key_end": int(end_ptr),
                    "skip_count": int(sum(skip_counts)),
                    "skip_max": int(max(skip_counts, default=0)),
                    "plaintext": full_text,
                })
    hits.sort(key=lambda item: item["score"], reverse=True)
    return best, hits


def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python sims/lp2_self_reliance_skip_aware_gate.py <external-liber-primus-root>")
    external_root = Path(sys.argv[1]).resolve()
    sweep_dir = external_root / "analysis/campaign18_skip"
    key_path = external_root / "data/keys/self_reliance.txt"
    if not (sweep_dir / "sweep.py").is_file() or not key_path.is_file():
        raise FileNotFoundError("pinned external decoder or Self-Reliance key text is missing")
    if not CORPUS_PATH.is_file() or not SHAKESPEARE_PATH.is_file():
        raise FileNotFoundError("local original LP2 corpus or Shakespeare control is missing")

    corpus_raw = CORPUS_PATH.read_bytes()
    corpus = json.loads(corpus_raw)
    pages = sorted((p for p in corpus["pages"] if 0 <= int(p["page"]) <= 55),
                   key=lambda p: int(p["page"]))
    rune_count = sum(len(p["indices"]) for p in pages)
    nonempty = [p for p in pages if p["indices"]]
    assert len(pages) == 56 and len(nonempty) == 55 and rune_count == 12956
    assert [int(p["page"]) for p in pages if not p["indices"]] == [50]

    sweep, skipdecode = load_external_decoder(external_root)
    key_text = key_path.read_text(encoding="utf-8", errors="ignore")
    key = encode_source_native(key_text, corpus["translit"])
    assert len(key) == 41471, f"source-calibrated Self-Reliance key length changed: {len(key)}"
    shakespeare = SHAKESPEARE_PATH.read_text(encoding="utf-8")
    replace_prefilter_lm(sweep, shakespeare, corpus["translit"])

    print("SOURCE-LOCKED SELF-RELIANCE SKIP-AWARE LP2 GATE")
    print(f"external_expected_commit={EXPECTED_EXTERNAL_COMMIT}")
    print(f"self_reliance_sha256={sha256(key_path)}")
    print(f"self_reliance_gp_runes={len(key)}")
    print(f"lp2_corpus_sha256={hashlib.sha256(corpus_raw).hexdigest()}")
    print(f"shakespeare_control_sha256={sha256(SHAKESPEARE_PATH)}")
    print(f"lp2_unknown_runes={rune_count}; physical_pages=56; rune_bearing_pages=55; runeless_page=50")
    print(f"decoder=CampaignXVIII skip beam; MAXSKIP={sweep.MAXSKIP}; screen={sweep.SCREEN_LEN}; "
          f"screen_beam={sweep.SCREEN_BEAM}; full_beam={sweep.FULL_BEAM}; "
          f"prefilter_BG={sweep.PREFILTER_BG}; prefilter_K={sweep.PREFILTER_K}")
    print("key_spelling=source-calibrated GP: ING->ᛝ, IO->ᛡ, other tokens longest-first")
    print("search=all source offsets with room for MAXSKIP per rune; signs=(-1,+1); Atbash=(off,on)")
    print("prefilter_bigram_model=independent Shakespeare first 240000 characters")
    
    # Source-calibrated positive control: the exact key stream must be recoverable
    # when its offset, sign and ciphertext are planted using the same skip rule.
    plant_plain = encode_source_native(shakespeare[240000:245000], corpus["translit"])[:240]
    assert len(plant_plain) == 240
    plant_cipher, plant_skips = encipher_keyskip(plant_plain, key, PLANT_OFFSET, -1)
    plant_decoded = sweep.beam(plant_cipher, key, -1, PLANT_OFFSET,
                               len(plant_cipher), sweep.FULL_BEAM)
    assert plant_decoded == plant_plain.tolist(), "source-calibrated planted key was not recovered exactly"
    plant_trace = verify_reencipher(plant_cipher, plant_decoded, key,
                                    PLANT_OFFSET, -1, 0, sweep.MAXSKIP)
    assert plant_trace is not None
    print(f"POSITIVE_CONTROL=PASS; planted_offset={PLANT_OFFSET}; runes={len(plant_plain)}; "
          f"planted_skips={plant_skips}; recovered_skips={sum(plant_trace[1])}; exact_plaintext=240/240")

    total_hits = 0
    best_rows = []
    hit_offsets = {}
    cumulative_runes = 0
    for page in pages:
        page_no = int(page["page"])
        ct = np.asarray(page["indices"], dtype=np.int64)
        if len(ct) == 0:
            print(f"page {page_no:02d}: runeless physical source page; no ciphertext")
            continue
        best, hits = search_page(sweep, skipdecode, ct, key)
        best_rows.append((page_no, best[0], best[1]))
        print(f"page {page_no:02d} len={len(ct):3d} best_screen={best[0]:.3f} "
              f"via={best[1]} confirmed_hits={len(hits)}")
        for hit in hits[:3]:
            print(f"  HIT score={hit['score']:.3f} sign={hit['sign']} atbash={hit['atbash']} "
                  f"offset={hit['offset']} key_end={hit['key_end']} skips={hit['skip_count']} "
                  f"reencipher=PASS")
            print(f"  PLAINTEXT={hit['plaintext'][:160]}")
            hit_offsets.setdefault(page_no, []).append(hit)
            total_hits += 1
        cumulative_runes += len(ct)

    print(f"GLOBAL_BEST_SCREEN={max(best_rows, key=lambda x: x[1]) if best_rows else None}")
    print(f"CONFIRMED_HITS={total_hits}; threshold={sweep.CONF_THR}; exact re-encipherment required")
    if not total_hits:
        print("RESULT=NO_CONFIRMED_SELF_RELIANCE_PLAINTEXT_HIT")
    else:
        print("RESULT=HITS_REQUIRE_CROSS_PAGE_OFFSET_CONTINUITY_AND_INDEPENDENT_PLAINTEXT_REVIEW")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
