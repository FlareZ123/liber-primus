"""Director #2966: C7/C8 register gate, pinned public sources, no LP2 key fitting.

Run with Python 3.12 + NumPy, Git and network access. The reference checkers
are unmodified at the pinned public commit. The trained model sees only
Chaucer; Gower's English Prologue is held out, including the exact text
boundaries in the manifest. The full C8 beam may itself be English-biased.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import urllib.request

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "im-results" / "lp2-middle-english-register-gate"
REF = "fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb"
SEED = 2966
ALPHABET = "F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split()
TABLE = {x.lower(): x for x in ALPHABET}
TABLE.update({"ing": "NG", "io": "IA", "k": "C", "q": "C", "v": "U",
              "z": "S", "þ": "TH", "ð": "TH", "ȝ": "G"})
SOURCES = {
    "train": {
        "repo": "GITenberg/Troilus-and-Criseyde_257",
        "revision": "936356e95c3eaf033a7064e7aac62562e120351e",
        "file": "257.txt",
        "blob": "45829db668a199af8378b507549d0a970b90a6a5",
        "title": "Troilus and Criseyde",
        "author": "Geoffrey Chaucer",
        "edition": "Project Gutenberg #257, electronic ASCII edition updated 2010-07-20",
        "start": "BOOK I. Incipit Liber Primus",
        "end": "Explicit Liber Troili et Criseydis.",
    },
    "heldout": {
        "repo": "GITenberg/Confessio-Amantis--Or-Tales-of-the-Seven-Deadly-Sins_266",
        "revision": "8551b982c2f0efa6bfb3fc775ad619c2954a0c03",
        "file": "266.txt",
        "blob": "a84e11740796df8f70ef5a54fc8d9c919f41831e",
        "title": "Confessio Amantis, English Prologue",
        "author": "John Gower",
        "edition": "G. C. Macaulay edition, Project Gutenberg #266 ASCII electronic text 2008-07-03",
        "start": "Absit, et interpres stet procul oro malus.",
        "end": "Explicit Prologus",
    },
}

SPARSE = [
    "/challenges/",
    "/liber-primus/src/",
    "/liber-primus/benchmark/",
    "/liber-primus/analysis/campaign18_skip/",
    "/liber-primus/analysis/round12/C1/",
    "/liber-primus/analysis/round11/lib_numchannel.py",
    "/liber-primus/analysis/run_stats.py",
    "/liber-primus/analysis/round32/I2-multiregister-readjudication/",
    "/liber-primus/analysis/round46/L1-word-loader/",
    "/liber-primus/data/krisyotam_runes.txt",
    "/liber-primus/data/english_quadgrams.txt",
    "/liber-primus/data/panels/panel-r36.npz",
    "/liber-primus/data/keys/self_reliance.txt",
    "/liber-primus/data/keys/armada19/mill_on_liberty.txt",
    "/liber-primus/data/keys/armada18/emerson_essays_first_series.txt",
    "/liber-primus/data/keys/armada19/shelley_frankenstein.txt",
    "/liber-primus/data/keys/armada19/virgil_aeneid_latin.txt",
    "/liber-primus/analysis/latin/latin_218.txt",
    "/liber-primus/analysis/round10b/B6-non-english-plaintext/corpora/de_faust.txt",
    "/liber-primus/analysis/round10b/B6-non-english-plaintext/corpora/de_2.txt",
    "/liber-primus/data/keys/welsh/welsh_mabinogion.txt",
    "/liber-primus/analysis/round10b/B6-non-english-plaintext/corpora/oe_beowulf.txt",
    "/liber-primus/dataset/liber_primus.json",
    "/liber-primus/PROBLEM.json",
]


def git(root: Path, *args: str) -> str:
    p = subprocess.run(["git", "-C", str(root), *args], check=True,
                       text=True, stdout=subprocess.PIPE)
    return p.stdout.strip()


def acquire_ref(dest: Path) -> None:
    dest.mkdir()
    git(dest, "init", "-q")
    git(dest, "remote", "add", "origin", "https://github.com/Dukotah/cicada3301.git")
    git(dest, "config", "core.autocrlf", "false")
    git(dest, "config", "remote.origin.promisor", "true")
    git(dest, "config", "remote.origin.partialclonefilter", "blob:none")
    git(dest, "fetch", "--depth=1", "--filter=blob:none", "origin", REF)
    git(dest, "sparse-checkout", "init", "--no-cone")
    git(dest, "sparse-checkout", "set", "--no-cone", *SPARSE)
    git(dest, "checkout", "--detach", REF)
    assert git(dest, "rev-parse", "HEAD") == REF


def manifest(which: str) -> Path:
    s = SOURCES[which]
    dest = OUT / which
    dest.mkdir(parents=True, exist_ok=True)
    url = f"https://raw.githubusercontent.com/{s['repo']}/{s['revision']}/{s['file']}"
    req = urllib.request.Request(url, headers={"User-Agent": "liber-primus-register-research"})
    with urllib.request.urlopen(req, timeout=60) as response:
        raw = response.read()
    git_blob = hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()
    assert git_blob == s["blob"], (which, git_blob, s["blob"])
    raw.decode("ascii")
    (dest / "source.txt").write_bytes(raw)
    m = {
        "_comment": (
            "R-A GP greedy orthography; K/Q->C, V->U, Z->S, IO->IA, ING->NG. "
            "Thorn/eth->TH; yogh->G as a graphic convention, not historical phoneme recovery; "
            "none of those three occur in these ASCII source editions. "
            "No modernisation or LP2-derived vocabulary. Train retains internal Latin book headings "
            "(small contamination); held-out excludes the Latin Prologue epigraph."
        ),
        "language": "enm",
        "register": "late 14th-century Middle English verse",
        "source": "source.txt",
        "provenance": {
            "title": s["title"], "author": s["author"], "edition": s["edition"],
            "url": url, "license": "public domain (medieval work; historical edition and Project Gutenberg text)",
            "source_sha256": hashlib.sha256(raw).hexdigest(),
            "git_blob_sha1": git_blob,
        },
        "start_after": s["start"], "end_before": s["end"],
        "normalize": "NFD", "casefold": True, "drop_categories": ["Mn"],
        "sentence_marks": ".!?", "table": TABLE,
    }
    p = dest / "manifest.json"
    p.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return p


def fit(stream: list[int]) -> np.ndarray:
    """Normalized conditional probabilities, frozen backoff weight 12."""
    n = 29
    a = np.asarray(stream, dtype=np.int64)
    p = (np.bincount(a, minlength=n) + .5) / (len(a) + .5 * n)
    for order in (2, 3, 4):
        code = np.zeros(len(a) - order + 1, dtype=np.int64)
        for i in range(order):
            code = code * n + a[i:i + len(code)]
        c = np.bincount(code, minlength=n**order).reshape(-1, n)
        prior = np.tile(p, n).reshape(c.shape)
        p = ((c + 12 * prior) / (c.sum(axis=1, keepdims=True) + 12)).ravel()
        assert np.allclose(p.reshape(-1, n).sum(axis=1), 1.0)
    return np.log(p)


def score_model(logq: np.ndarray, idx: list[int]) -> float:
    a = np.asarray(idx, dtype=np.int64)
    if len(a) < 4:
        raise ValueError("window shorter than four runes")
    code = ((a[:-3] * 29 + a[1:-2]) * 29 + a[2:-1]) * 29 + a[3:]
    return float(logq[code].mean())


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    os.environ["PYTHONUTF8"] = "1"
    sys.stdout.reconfigure(encoding="utf-8")
    with tempfile.TemporaryDirectory(prefix="lp2-enm-") as tmp:
        ref = Path(tmp) / "ref"
        acquire_ref(ref)
        sys.path.insert(0, str(ref / "challenges"))
        import c7_corpus_forge as C7
        import c8_register_scorer as C8
        import _heavy as H

        assert H.GP_TOKENS == ALPHABET
        train_manifest, held_manifest = manifest("train"), manifest("heldout")
        corpora = {}
        streams = {}
        for which, mp in (("train", train_manifest), ("heldout", held_manifest)):
            errs = []
            m = C7.load_manifest(str(mp), errs)
            src = C7.read_source(m, str(mp.parent), errs)
            assert src is not None and not errs, errs
            sents, unmapped, letters = C7.derive(src, m, errs)
            assert not errs and not unmapped, (errs, unmapped)
            words = [w for s in sents for w in s]
            streams[which] = [i for w in words for i in w]
            lengths = [len(w) for w in words]
            corpora[which] = {
                "words": len(words), "sentences": len(sents), "runes": len(streams[which]),
                "source_sha256": m["provenance"]["source_sha256"],
                "unmapped": sum(unmapped.values()), "letters": letters,
                "profile9": C7.counts9(lengths), "two_rune_share": C7.s2(lengths),
            }
            (mp.parent / "corpus.txt").write_text(
                "\n".join(C7.line_of(s) for s in sents) + "\n", encoding="utf-8")
            if which == "train":
                assert len(words) >= C7.MIN_WORDS and len(sents) >= C7.MIN_SENTENCES
                c7_errors = []
                c7_status, c7_row = C7.check(str(mp), build=False, seed=SEED,
                                            errs_out=c7_errors)
                c7_jsd, c7_hits = C7.label_gate(m, words)
                c7_place = C7.place(lengths, SEED)
            print(which, json.dumps(corpora[which]), flush=True)

        assert len(streams["train"]) > 20000 and len(streams["heldout"]) > 10000
        logq = fit(streams["train"])
        np.save(OUT / "logq.npy", logq, allow_pickle=False)
        result = {
            "reference_commit": REF, "seed": SEED, "corpora": corpora,
            "c7": {"status": c7_status, "row": c7_row, "errors": c7_errors,
                   "label_jsd": c7_jsd, "label_hits": c7_hits, "place": c7_place},
            "c8": {"mode": "full reference checker build/evaluate", "positives": 200,
                   "cheap_nulls_per_class": 2000, "beam_nulls": 500,
                   "alpha": 0.01, "direct": False, "by_length": {}},
        }
        p = OUT / "output.json"
        p.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        print("C7", json.dumps(result["c7"]), flush=True)
        for L in C8.LENGTHS:
            print(f"Building full keyskip/beam controls L={L}", flush=True)
            sets = C8.build(streams["heldout"], SEED, 200, 2000, 500, False, lengths=(L,))
            r = {
                "middle_english": C8.evaluate(lambda idx: score_model(logq, idx), sets)[L],
                "english": C8.evaluate(H.english_score, sets)[L],
                "panel": C8.evaluate(H.panel_pmax, sets)[L],
            }
            result["c8"]["by_length"][str(L)] = r
            p.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
            print(f"FULL C8 L={L}", json.dumps(r), flush=True)
        head = result["c8"]["by_length"]["236"]
        result["decision"] = (
            "panel_already_sees" if head["panel"]["power"] >= .80
            else "candidate_extension" if head["middle_english"]["power"] >= .80
            else "new_model_failed"
        )
        result["original_candidate_evaluated"] = False
        p.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        print("DECISION", result["decision"], flush=True)


if __name__ == "__main__":
    main()
