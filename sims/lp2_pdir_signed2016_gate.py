#!/usr/bin/env python3
"""Source-selected 2016 signed-message keys under genuine original LP2 pdir.

A deliberately *small*, predeclared experiment for Director Issue #1329.
Four pre-cipher keys from the authenticated 2016 message, four source-obvious
previous-word rules; 18 pointer conventions are legal but test 000 first.
No ciphertext-driven key selection, offset fitting, or linguistic fitting.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import random
import re
import struct
import subprocess
import sys
from tempfile import NamedTemporaryFile

from filelock import FileLock

from lp2_pdir_issue1329_gate import source_gate

RULES = ("A_prev_G", "E_prev_n4", "G4_prev", "GP_prev")
CONVS = tuple(f"{h}{m}{c}" for h in range(2) for m in range(3) for c in range(3))
STREAM_LENGTH = 1200
SCREEN_TOP = 50


def atomic_bytes(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with NamedTemporaryFile(mode="wb", dir=path.parent, prefix=path.name + ".tmp.",
                                delete=False) as f:
            f.write(content)
            tmp_name = f.name
        os.replace(tmp_name, path)


def key_streams(local: Path) -> list[tuple[str, list[int]]]:
    corpus = json.loads((local / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    signed = (local / "resources/historical/cicada2016-4gq25-outguess.asc").read_text(encoding="utf-8")
    a, b = signed.index("Hello."), signed.index("-----BEGIN PGP SIGNATURE-----")
    words = re.findall(r"(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])", signed[a:b])
    assert len(words) == 43, f"Signed source must have exactly 43 lexical words, got {len(words)}"
    start = next(i for i in range(len(words)-1) if words[i:i+2] == ["Its", "words"])
    phrase = ["Its","words","are","the","map","their","meaning","is","the",
              "road","and","their","numbers","are","the","direction"]
    assert words[start:start+16] == phrase
    translit = corpus["translit"]
    tokens = sorted(((w.upper(), i) for i, w in enumerate(translit)), key=lambda x: -len(x[0]))
    ing_index = translit.index("NG")
    primes = corpus["prime"]

    def word_runes(word: str) -> list[int]:
        upper = word.upper().replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Z", "S")
        out = []
        i = 0
        while i < len(upper):
            if upper.startswith("ING", i):
                out.append(ing_index)
                i += 3
                continue
            token = next(((t, k) for t, k in tokens if upper.startswith(t, i)), None)
            assert token is not None, (word, upper, i)
            out.append(token[1])
            i += len(token[0])
        return out

    streams = []
    for prefix, subset in (("signed43", words), ("clue16", phrase)):
        enc = [word_runes(w) for w in subset]
        streams.append((prefix + "-GP-symbols-INGaware", [v for w in enc for v in w]))
        streams.append((prefix + "-GP-primesum-perword", [
            sum(primes[k] for k in w) % 29 for w in enc
        ]))
    assert len(streams) == 4
    assert len({tuple(seq) for _, seq in streams}) == 4
    return streams


def ksb(streams: list[tuple[str, list[int]]]) -> bytes:
    content = bytearray(b"KSB1" + struct.pack("<I", len(streams)))
    for name, short in streams:
        assert 1 <= len(short) <= STREAM_LENGTH
        values = (short * (STREAM_LENGTH // len(short) + 1))[:STREAM_LENGTH]
        raw_name = name.encode("ascii")
        content += struct.pack("<H", len(raw_name)) + raw_name
        content += struct.pack("<I", len(values)) + bytes(values)
    return bytes(content)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("external", type=Path)
    p.add_argument("--conv", default="000")
    a = p.parse_args()
    assert a.conv in CONVS
    local = Path(__file__).resolve().parent.parent
    external = a.external.resolve()
    rule_names = source_gate(local, external)
    assert all(r in rule_names for r in RULES)
    keys = key_streams(local)

    rng = random.Random(3301)
    controls = [(f"null-{j+1}", [rng.randrange(29) for _ in range(STREAM_LENGTH)])
                for j in range(len(keys))]
    work = external / "work/kscreen"
    data = work / "data"
    families = {"signed2016": keys, "null": controls}
    for kind, streams in families.items():
        atomic_bytes(data / f"issue1329-{kind}.ksb", ksb(streams))

    engine = work / "target/release" / ("kscreen.exe" if os.name == "nt" else "kscreen")
    assert engine.exists()
    outdir = external / "results/kscreen/issue1329-signed2016" / a.conv
    out = []
    for kind in ("signed2016", "null"):
        for rule in RULES:
            for neg in (0, 1):
                direction = "rev" if neg else "fwd"
                # Windows are exact original section 0.7 and 0.8 and D-vector
                # content is precomputed from frozen external direction rules.
                windows = data / "dirs" / (rule + ".txt")
                assert windows.exists()
                lines = windows.read_text(encoding="utf-8").splitlines()
                chosen = []
                include = False
                for line in lines:
                    if line.startswith("W "):
                        include = line.split()[1] in ("seg0.7", "seg0.8")
                    if include:
                        chosen.append(line)
                assert sum(line.startswith("W ") for line in chosen) == 2
                win = data / f"issue1329-{rule}-two-original.txt"
                atomic_bytes(win, ("\n".join(chosen) + "\n").encode("utf-8"))
                tsv = outdir / kind / f"{rule}-{direction}.tsv"
                tsv.parent.mkdir(parents=True, exist_ok=True)
                if not tsv.exists():
                    with NamedTemporaryFile(mode="w+b", dir=tsv.parent, prefix=tsv.name + ".tmp.",
                                            delete=False) as f:
                        tmp = Path(f.name)
                    cmd = [
                        str(engine), "screen",
                        "data/" + win.name, "file:data/issue1329-" + kind + ".ksb",
                        str(tmp.resolve()), "threads=4", f"pdir={a.conv}", "pad=300",
                        f"dirneg={neg}", f"top={SCREEN_TOP}"
                    ]
                    subprocess.run(cmd, cwd=work, check=True, capture_output=True, text=True)
                    blob = tmp.read_text(encoding="utf-8")
                    assert f"pdir={a.conv}" in blob.splitlines()[0], tmp
                    with FileLock(str(tsv) + ".lock"):
                        os.replace(tmp, tsv)
                text = tsv.read_text(encoding="utf-8")
                match = re.search(r"^# best ([0-9.]+)", text, re.MULTILINE)
                assert match
                best = float(match.group(1))
                out.append({"family": kind, "rule": rule, "orientation": direction,
                            "ioc": best,
                            "candidate": best >= 1.40,
                            "file": str(tsv.relative_to(outdir)).replace("\\", "/")})
                print(kind, rule, direction, best, flush=True)

    results = {
        "source": "2016 authenticated signed message, original source GP29",
        "runes": 12956, "original_word_count": 2896,
        "registered_windows": ["seg0.7", "seg0.8"],
        "input_keys": [{"name": k, "unit_period": len(v),
                        "source_sequence_sha256": hashlib.sha256(bytes(v)).hexdigest()}
                       for k, v in keys],
        "key_length": STREAM_LENGTH, "pdir": a.conv,
        "rules": RULES, "orientations": 2, "models": 2, "multipliers": [1, 28],
        "source_causal_2016": "four literal GP key interpretations; no fitted offsets or key phases",
        "results": out, "best_original": max(x["ioc"] for x in out if x["family"] == "signed2016"),
        "best_null": max(x["ioc"] for x in out if x["family"] == "null"),
        "candidate_count": sum(x["candidate"] for x in out if x["family"] == "signed2016"),
        "caution": "A result >=1.40 still needs whole-window re-decryption and source-exact forward validation.",
    }
    atomic_bytes(outdir / "report.json", (json.dumps(results, indent=2) + "\n").encode("utf-8"))
    print(json.dumps({k: results[k] for k in ("best_original", "best_null", "candidate_count")},
                     indent=2), flush=True)


if __name__ == "__main__":
    main()
