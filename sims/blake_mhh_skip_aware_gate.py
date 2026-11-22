#!/usr/bin/env python3
"""Skip-aware full-offset test of Blake's Marriage of Heaven and Hell as an LP2 key.

Motivation is deliberately narrow: Cicada's 2012 MIDI contains a Blake passage;
the p57 circumference wording and 2016 "road" clue are compatible with the
same work, but do not uniquely select it. The local rigid-alignment test was
negative. This adapter applies the independently validated Campaign XVIII
key-skip beam decoder to the same pinned 1906 text and the local page-labelled
LP2 corpus.

External decoder:
  https://github.com/Dukotah/cicada3301
  pinned commit f63501d8f2d835b80c30230eb89a1110fb9197d2
  analysis/campaign18_skip/{sweep.py,skipdecode.py}
The external repository is imported, not copied or modified. Its sweep uses
the committed English quadgram model and its fixed prefilter/beam parameters.
The local JSON corpus is used directly so the image-only page 50 remains
explicitly labelled instead of being silently dropped by the external
transcription loader.

Run:
  python sims/blake_mhh_skip_aware_gate.py --external-root /tmp/dukotah/liber-primus
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_EXTERNAL_COMMIT = "f63501d8f2d835b80c30230eb89a1110fb9197d2"
CORPUS_PATH = ROOT / "resources/liber-primus/lp2-corpus.json"
KEY_PATH = ROOT / "resources/external/blake-marriage-1906-gutenberg45315.txt"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_external_sweep(external_root: Path):
    sweep_dir = external_root / "analysis/campaign18_skip"
    sys.path[:0] = [
        str(external_root / "src"),
        str(external_root / "analysis"),
        str(sweep_dir),
    ]
    path = sweep_dir / "sweep.py"
    spec = importlib.util.spec_from_file_location("lp2_campaign18_skip_sweep", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot import external sweep at {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    import skipdecode
    if not skipdecode.gate():
        raise RuntimeError("Campaign XVIII planted-key/wrong-key gate failed; refusing corpus screen")
    return module


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--external-root", required=True, type=Path)
    args = ap.parse_args()

    external_root = args.external_root.resolve()
    if not (external_root / "analysis/campaign18_skip/sweep.py").is_file():
        raise FileNotFoundError(external_root / "analysis/campaign18_skip/sweep.py")
    if not CORPUS_PATH.is_file() or not KEY_PATH.is_file():
        raise FileNotFoundError("required local corpus or pinned Blake source is absent")

    corpus_raw = CORPUS_PATH.read_bytes()
    corpus = json.loads(corpus_raw)
    pages = sorted(
        (p for p in corpus["pages"] if 0 <= int(p["page"]) <= 55),
        key=lambda p: int(p["page"]),
    )
    if len(pages) != 56:
        raise AssertionError(f"expected physical LP2 pages 0..55, found {len(pages)}")
    rune_count = sum(len(p["indices"]) for p in pages)
    nonempty = [p for p in pages if p["indices"]]
    if rune_count != 12956 or len(nonempty) != 55:
        raise AssertionError(
            f"corpus gate changed: {rune_count} runes / {len(nonempty)} nonempty pages"
        )
    empty_pages = [int(p["page"]) for p in pages if not p["indices"]]
    if empty_pages != [50]:
        raise AssertionError(f"expected only image/table page 50 to be empty, got {empty_pages}")

    sweep = load_external_sweep(external_root)
    key = sweep.load_text(str(KEY_PATH))
    if len(key) != 18584:
        raise AssertionError(f"Blake GP key length changed: expected 18584, got {len(key)}")

    external_commit = "unknown"
    head_path = external_root.parent / ".git/HEAD"
    if head_path.exists():
        external_commit = head_path.read_text(encoding="ascii").strip()
    qgram_path = external_root / "data/english_quadgrams.txt"
    skip_path = external_root / "analysis/campaign18_skip/skipdecode.py"
    sweep_path = external_root / "analysis/campaign18_skip/sweep.py"

    print("SOURCE-FROZEN BLAKE MHH SKIP-AWARE LP2 TEST")
    print(f"external_expected_commit={EXPECTED_EXTERNAL_COMMIT}")
    print(f"external_git_head={external_commit}")
    print(f"lp2_corpus_sha256={sha256(CORPUS_PATH)}")
    print(f"blake_mhh_1906_sha256={sha256(KEY_PATH)}")
    print(f"quadgram_model_sha256={sha256(qgram_path)}")
    print(f"skipdecode_sha256={sha256(skip_path)}")
    print(f"sweep_sha256={sha256(sweep_path)}")
    print(f"lp2_pages={len(pages)} nonempty_pages={len(nonempty)} empty_pages={empty_pages}")
    print(f"lp2_unknown_runes={rune_count}")
    print(f"blake_mhh_gp_key_runes={len(key)}")
    print(
        "decoder_parameters="
        f"MAXSKIP={sweep.MAXSKIP}, PREFILTER_BG={sweep.PREFILTER_BG}, "
        f"PREFILTER_K={sweep.PREFILTER_K}, SCREEN_LEN={sweep.SCREEN_LEN}, "
        f"SCREEN_BEAM={sweep.SCREEN_BEAM}, FULL_BEAM={sweep.FULL_BEAM}, "
        f"SCREEN_THR={sweep.SCREEN_THR}, CONF_THR={sweep.CONF_THR}, "
        "signs=(-1,+1), atbash=(off,on)"
    )

    texts = [("blake_mhh_1906_gutenberg45315", key)]
    all_hits = []
    best_pages = []
    for page in pages:
        page_no = int(page["page"])
        ct = page["indices"]
        if not ct:
            print(f"page {page_no:02d}: empty source page; no ciphertext")
            continue
        hits, best = sweep.attack_page(
            np.asarray(ct, dtype=np.int64), page_no, texts
        )
        best_pages.append((float(best[0]), page_no, best[1]))
        print(
            f"page {page_no:02d} len={len(ct):3d} "
            f"best_screen={best[0]:.3f} via={best[1]} "
            f"confirmed_hits={len(hits)}"
        )
        for hit in sorted(hits, reverse=True)[:3]:
            score, name, sign, atbash, offset, plaintext = hit
            print(
                f"  HIT score={score:.3f} key={name} sign={sign} "
                f"atbash={atbash} offset={offset}"
            )
            print(f"  PLAINTEXT={plaintext}")
            all_hits.append((page_no, hit))

    if best_pages:
        top = max(best_pages)
        print(
            f"GLOBAL_BEST_SCREEN page={top[1]} score={top[0]:.3f} "
            f"candidate={top[2]}"
        )
    print(f"CONFIRMED_HITS={len(all_hits)} (full-page score > {sweep.CONF_THR})")
    if not all_hits:
        print("RESULT=NO_CONFIRMED_PLAINTEXT_HIT")
    else:
        print("RESULT=REQUIRES_INDEPENDENT_PLAINTEXT_AND_REENCRYPTION_VALIDATION")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
