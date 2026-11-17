#!/usr/bin/env python3
"""Source-locked two-layer LP2 SFT for the complete p0-p2 opening and a held-out p42 paragraph.

The upstream decoder is pinned to pnotisdev/cicada3301@15200c67abee106913ba01ff504c5b6e88d16cc7.
Only its periodic column counters are widened from u8 to u16 so the 729-rune opening can be
screened without splitting the message or resetting either key clock. A pre-patch/post-patch
n=300 parity test proves that this storage-only change leaves the existing search unchanged.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import re
import struct
import subprocess
import sys
from pathlib import Path

UPSTREAM_COMMIT = "15200c67abee106913ba01ff504c5b6e88d16cc7"
Q = 29


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_ksb(path: Path):
    b = path.read_bytes()
    if len(b) < 8 or b[:4] != b"KSB1":
        raise ValueError(f"not KSB1: {path}")
    n = struct.unpack_from("<I", b, 4)[0]
    p, out = 8, []
    for _ in range(n):
        ln = struct.unpack_from("<H", b, p)[0]
        p += 2
        name = b[p:p + ln].decode("utf-8")
        p += ln
        length = struct.unpack_from("<I", b, p)[0]
        p += 4
        vals = b[p:p + length]
        p += length
        if len(vals) != length or any(v >= Q for v in vals):
            raise ValueError(f"bad stream {name!r} in {path}")
        out.append((name, vals))
    if p != len(b):
        raise ValueError(f"trailing bytes in {path}")
    return out


def write_ksb(path: Path, items):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as f:
        f.write(b"KSB1" + struct.pack("<I", len(items)))
        for name, vals in items:
            nb = name.encode("utf-8")
            f.write(struct.pack("<H", len(nb)) + nb + struct.pack("<I", len(vals)) + bytes(vals))


def parse_windows(path: Path):
    out, cur = [], None
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("W "):
            if cur:
                out.append(cur)
            fields = line.split()
            cur = {"name": fields[1], "prev": int(fields[2]) if len(fields) > 2 else -1,
                   "runes": [], "lens": None}
        elif line.startswith("R "):
            cur["runes"] = [int(x) for x in line[2:].split()]
        elif line.startswith("L "):
            cur["lens"] = line[2:]
    if cur:
        out.append(cur)
    return out


def write_window(path: Path, name: str, prev: int, runes, lens: str | None = None):
    lines = [f"W {name} {prev}", "R " + " ".join(map(str, runes))]
    if lens is not None:
        lines.append("L " + lens)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    n = text.count(old)
    if n != 1:
        raise RuntimeError(f"{label}: expected one source occurrence, found {n}")
    return text.replace(old, new, 1)


def patch_reference(layer2: Path):
    src = layer2 / "src" / "main.rs"
    text = src.read_text(encoding="utf-8")
    text = replace_once(text, "ncol: [u8; MAXM],", "ncol: [u16; MAXM],", "periodic ncol")
    text = replace_once(text, "cnt: [[u8; Q]; MAXM],", "cnt: [[u16; Q]; MAXM],", "periodic counts")
    text = replace_once(
        text,
        'assert!(a >= 2 && b <= MAXM, "ms within 2..{MAXM} (u8 column counts)");',
        'assert!(a >= 2 && b <= MAXM, "ms within 2..{MAXM} (u16 column counts)");',
        "periodic period bound"
    )
    text = replace_once(
        text,
        'assert!(!periodic || nmax <= 500, "mode=periodic keeps u8 column counts: n <= 500");',
        'assert!(!periodic || nmax <= 10000, "mode=periodic uses u16 column counts: n <= 10000");',
        "periodic length bound"
    )
    src.write_text(text, encoding="utf-8")

    verify = layer2 / "verify.py"
    v = verify.read_text(encoding="utf-8")
    old = 'f"litf={f[\'litf\']}", "n=300"])'
    new = 'f"litf={f[\'litf\']}", f"n={head.get(\'n\', \'300\')}"])'
    v = replace_once(v, old, new, "periodic whole-window verification length")
    verify.write_text(v, encoding="utf-8")


def run(cmd, cwd: Path, capture=True):
    r = subprocess.run([str(x) for x in cmd], cwd=str(cwd), text=True,
                       stdout=subprocess.PIPE if capture else None,
                       stderr=subprocess.PIPE if capture else None)
    if r.returncode:
        raise RuntimeError(
            f"command failed ({r.returncode}): {' '.join(map(str, cmd))}\n"
            f"stdout:\n{(r.stdout or '')[-5000:]}\nstderr:\n{(r.stderr or '')[-5000:]}"
        )
    return r


def norm_tsv(path: Path):
    lines = path.read_text(encoding="utf-8").splitlines()
    return [re.sub(r"\bsecs=[^ ]+", "secs=TIME", line) for line in lines]


def make_null(src: Path, dst: Path, seed: int):
    items = read_ksb(src)
    rng = random.Random(seed)
    null_items = [(f"NULL::{name}", bytes(rng.randrange(Q) for _ in vals)) for name, vals in items]
    write_ksb(dst, null_items)
    if [len(v) for _, v in items] != [len(v) for _, v in null_items]:
        raise AssertionError("null lengths do not match source")
    return {
        "count": len(items),
        "seed": seed,
        "source_lengths_sha256": sha256(",".join(str(len(v)) for _, v in items).encode()),
        "null_lengths_sha256": sha256(",".join(str(len(v)) for _, v in null_items).encode()),
        "sha256": sha256(dst.read_bytes()),
    }


def prepare(upstream: Path, corpus_path: Path):
    upstream = upstream.resolve()
    corpus_path = corpus_path.resolve()
    work = upstream / "work"
    layer2 = work / "layer2"
    data = layer2 / "data"
    data.mkdir(parents=True, exist_ok=True)

    run([sys.executable, "work/kscreen/export.py"], upstream)
    run([sys.executable, "work/layer2/export.py"], upstream)

    corpus_bytes = corpus_path.read_bytes()
    corpus = json.loads(corpus_bytes)
    pages = corpus["pages"]
    source_windows = work / "phpmt" / "data" / "windows.txt"
    wins = parse_windows(source_windows)
    by_name = {w["name"]: w for w in wins}
    opening = by_name["seg0.7"]
    opening_runes = [x for p in pages[:3] for x in p["indices"]]
    if opening["prev"] != -1 or len(opening["runes"]) != 729 or opening["runes"] != opening_runes:
        raise AssertionError("reference seg0.7 is not the exact 729-rune p0-p2 opening")
    write_window(data / "p0_2.txt", "seg0.7", -1, opening_runes, opening["lens"])

    p42 = pages[42]["indices"]
    p41 = pages[41]["indices"]
    if len(p42) != 272 or len(p41) != 273:
        raise AssertionError("unexpected original page 41/42 rune counts")
    p42_prev = p41[-1]
    seg15 = by_name["seg0.15"]["runes"]
    p40_55 = [x for p in pages[40:56] for x in p["indices"]]
    if seg15 != p40_55 or len(seg15) != 3316:
        raise AssertionError("reference seg0.15 does not match original pages 40-55")
    p42_offset = sum(len(pages[i]["indices"]) for i in (40, 41))
    if p42_offset != 504 or seg15[p42_offset:p42_offset + len(p42)] != p42:
        raise AssertionError("p42 holdout is not at the expected untouched section offset")
    if p42_offset < 300:
        raise AssertionError("p42 overlaps the earlier 300-rune section screen")
    write_window(data / "p42.txt", "p42", p42_prev, p42)

    nulls = {}
    for name, seed in (("core", 3301001), ("core20", 3301002), ("combined", 3301003)):
        nulls[name] = make_null(data / f"{name}.ksb", data / f"null_{name}.ksb", seed)

    families = {}
    for name in ("core", "core20", "combined"):
        items = read_ksb(data / f"{name}.ksb")
        families[name] = {
            "count": len(items),
            "lengths_sha256": sha256(",".join(str(len(v)) for _, v in items).encode()),
            "bytes_sha256": sha256((data / f"{name}.ksb").read_bytes()),
        }

    # Prove the u8->u16 change is storage-only for the existing n=300 regime.
    cargo = ["cargo", "build", "--release", "--locked", "--manifest-path", str(layer2 / "Cargo.toml")]
    run(cargo, upstream)
    binpath = layer2 / "target" / "release" / "layer2"
    before = data / "periodic_u8_parity.tsv"
    cmd = [binpath, "screen", "data/p0_2.txt", "file:data/core20.ksb", "data/periodic_u8_parity.tsv",
           "mode=periodic", "ms=2:14", "litf=0", "only=primes", "offs=1000:1100",
           "n=300", "beam=16", "mults=1,28", "models=0,1", "threads=1"]
    run(cmd, layer2)
    before_norm = norm_tsv(before)

    patch_reference(layer2)
    run(cargo, upstream)
    after = data / "periodic_u16_parity.tsv"
    cmd[3] = "data/periodic_u16_parity.tsv"
    run(cmd, layer2)
    after_norm = norm_tsv(after)
    if before_norm != after_norm:
        raise AssertionError("u16 periodic counter patch changed n=300 search output")
    before.unlink()
    after.unlink()

    manifest = {
        "upstream": "pnotisdev/cicada3301",
        "upstream_commit": UPSTREAM_COMMIT,
        "original_corpus_sha256": sha256(corpus_bytes),
        "targets": {
            "opening": {
                "window": "seg0.7", "pages": [0, 1, 2], "runes": len(opening_runes),
                "prev": -1, "sha256": sha256((data / "p0_2.txt").read_bytes()), "complete": True,
            },
            "p42": {
                "window": "p42", "page": 42, "runes": len(p42), "prev": p42_prev,
                "offset_in_seg0.15": p42_offset, "source_section": "seg0.15 = original pages 40-55",
                "sha256": sha256((data / "p42.txt").read_bytes()),
                "selection": "full single-block page 42; held outside the earlier first-300-rune seg0.15 window",
            },
        },
        "families": families,
        "matched_nulls": nulls,
        "periodic_counter_patch": {
            "change": "PSt ncol/cnt storage u8 -> u16; periodic screen length bound 500 -> 10000",
            "verification_change": "periodic whole-window verification now uses the screen header's n",
            "n300_parity": "byte-for-byte identical TSV after normalizing runtime seconds",
        },
        "screen_contract": {
            "serial_solved": "core.ksb x 3 solved keywords; both inner signs, all phases, litf 0/1, Atbash, outer multipliers 1/28, models 0/1",
            "serial_words": "core20.ksb x 30 fixed historical/Cicada keywords; same sign/phase/litf/Atbash/outer/model controls",
            "combined_a1": "combined.ksb, 20 streams x 3 solved keys x signs/phases, one-pointer A1 order; litf=0",
            "unknown_period": "core20.ksb, keyword periods 2-14; litf=0 always and litf=1 only after its independent positive control passes",
            "null": "uniform random GP29 streams preserving every family count and individual stream length",
            "verification": "unchanged upstream whole-window bigram verification: score >= +2.0/rune and >= 20-offset matched-null max + 5.0",
        },
    }
    (data / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


def parse_keywords(path: Path):
    out = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip() and not line.startswith("#"):
            p = line.split()
            out[p[0]] = [int(x) for x in p[1:]]
    return out


def truth_offsets(path: Path):
    out = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"# truth (\S+) item=(.*?) offset=(\d+) ", line)
        if m:
            out[m.group(1)] = (m.group(2), int(m.group(3)))
    return out


def best_rows(path: Path):
    out = {}
    rx = re.compile(r"# window (\S+) best (\S+) item=(.*) offset=(\d+) mult=(\d+) model=(\d+) (.*)$")
    for line in path.read_text(encoding="utf-8").splitlines():
        m = rx.match(line)
        if m:
            out[m.group(1)] = {
                "score": float(m.group(2)), "item": m.group(3), "offset": int(m.group(4)),
                "mult": int(m.group(5)), "model": int(m.group(6)), "inner": m.group(7),
            }
    return out


def verify_candidates(path: Path):
    if not path.exists():
        return []
    return [line for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("CANDIDATE")]


def write_plain_targets(layer2: Path):
    data = layer2 / "data"
    eng = parse_windows(data / "plain.txt")
    if len(eng) < 3:
        raise AssertionError("upstream held-out English control windows missing")
    long = eng[0]["runes"] + eng[1]["runes"][:329]
    short = eng[2]["runes"][:272]
    if len(long) != 729 or len(short) != 272:
        raise AssertionError("bad positive-control lengths")
    p = data / "plain_targets.txt"
    write_window(p, "control729", -1, long, "")
    with p.open("a", encoding="utf-8") as f:
        f.write("W control272 -1\nR " + " ".join(map(str, short)) + "\nL \n")
    return p


def run_screen(layer2: Path, windows: Path, family: str, out: Path, options):
    binpath = layer2 / "target" / "release" / "layer2"
    args = [binpath, "screen", str(windows), family, str(out)] + list(options)
    return run(args, layer2)


def run_verify(layer2: Path, tsv: Path, out: Path, top=10):
    return run([sys.executable, "verify.py", str(tsv), "--top", str(top), "--controls", "20", "--out", str(out)], layer2)


def control_one(layer2: Path, label: str, plant_text: str, family: str, kwfile: str | None,
                item: str, options, expected_item: str, expected_kw: str | None,
                expected_litf: int | None):
    data = layer2 / "data"
    controls = data / "controls"
    controls.mkdir(parents=True, exist_ok=True)
    plant_path = controls / f"{label}.txt"
    tsv = controls / f"{label}.tsv"
    verify_path = controls / f"{label}_verify.txt"
    plant_path.write_text(plant_text, encoding="utf-8")
    screen_opts = list(options)
    if kwfile:
        screen_opts.append(f"kw={kwfile}")
    screen_opts += ["only=" + item, "offs=0:8000", "n=729", "beam=16",
                    "mults=1,28", "models=0,1", "threads=4"]
    run_screen(layer2, Path(f"data/controls/{label}.txt"), family, Path(f"data/controls/{label}.tsv"), screen_opts)
    run_verify(layer2, Path(f"data/controls/{label}.tsv"), Path(f"data/controls/{label}_verify.txt"), top=10)
    best = best_rows(tsv)
    truths = truth_offsets(plant_path)
    candidates = verify_candidates(verify_path)
    checks = []
    for win, (truth_item, truth_off) in truths.items():
        row = best.get(win)
        candidate = any(re.search(rf"\b{re.escape(win)}\b", line) and row and f"offset={row['offset']}" in line for line in candidates)
        good = bool(row and row["item"] == expected_item and abs(row["offset"] - truth_off) <= 2 and candidate)
        if expected_kw and row:
            good = good and f"kw={expected_kw}" in row["inner"]
        if expected_litf is not None and row:
            good = good and f"litf={expected_litf}" in row["inner"]
        checks.append({"window": win, "truth_item": truth_item, "truth_offset": truth_off,
                       "best": row, "candidate": bool(candidate), "pass": bool(good)})
    return {"label": label, "pass": bool(checks) and all(x["pass"] for x in checks),
            "checks": checks, "verify": str(verify_path.relative_to(layer2))}


def controls(layer2: Path):
    sys.path.insert(0, str(layer2))
    import plant_ref

    data = layer2 / "data"
    plain = write_plain_targets(layer2)
    solved = parse_keywords(data / "keywords_solved.txt")
    combined_item = "primes + 1*DIVINITY@3"

    serial_results = []
    for litf in (0, 1):
        serial_text = plant_ref.plant(
            str(plain), str(data / "core20.ksb"), "primes", 2000, 1, 0, 0.18, 101 + litf,
            solved["DIVINITY"], 3, 1, litf, 0
        )
        serial_results.append(control_one(
            layer2, f"serial_litf{litf}_solved_positive", serial_text, "file:data/core.ksb",
            "data/keywords_solved.txt", "primes",
            ["mode=bigram", "litf=0,1", "abort=30:-4"], "primes", "DIVINITY", litf
        ))
        serial_results.append(control_one(
            layer2, f"serial_litf{litf}_words_positive", serial_text, "file:data/core20.ksb",
            "data/keywords.txt", "primes",
            ["mode=bigram", "litf=0,1", "abort=30:-4"], "primes", "DIVINITY", litf
        ))

    combined_text = plant_ref.plant(
        str(plain), str(data / "combined.ksb"), combined_item, 2000, 1, 0, 0.18, 102,
        [0], 0, 1, 0, 0
    )
    combined = control_one(
        layer2, "combined_a1_positive", combined_text, "file:data/combined.ksb", "data/keyword_none.txt",
        combined_item, ["mode=bigram", "litf=0", "abort=30:-4"], combined_item, None, 0
    )

    periodic_results = {0: [], 1: []}
    periodic_plants = [
        (2000, 28, 1, 103, [7, 18, 4, 3, 16, 24], 2, 28, 1),
        (5000, 1, 0, 104, [4, 21, 2, 17, 8, 12, 5, 23, 9], 4, 1, 0),
    ]
    for litf in (0, 1):
        for index, (off, mult, model, seed, kw, phase, isign, atb) in enumerate(periodic_plants):
            label = f"periodic_litf{litf}_m{len(kw)}"
            plant_text = plant_ref.plant(
                str(plain), str(data / "core20.ksb"), "primes", off, mult, model, 0.18, seed + litf,
                kw, phase, isign, litf, atb
            )
            result = control_one(
                layer2, label, plant_text, "file:data/core20.ksb", None, "primes",
                ["mode=periodic", "ms=2:14", f"litf={litf}", "abort=150:2.5"],
                "primes", None, litf
            )
            for check in result["checks"]:
                check["period"] = len(kw)
                check["plant_index"] = index
            periodic_results[litf].append(result)

    report = {
        "serial_pass": all(x["pass"] for x in serial_results),
        "combined_pass": combined["pass"],
        "periodic_litf0_pass": all(x["pass"] for x in periodic_results[0]),
        "periodic_litf1_pass": all(x["pass"] for x in periodic_results[1]),
        "positive_control_lengths": [729, 272],
        "serial": serial_results,
        "combined": combined,
        "periodic_litf0": periodic_results[0],
        "periodic_litf1": periodic_results[1],
        "rule": "every positive window must rank its planted stream offset within 2 and pass unchanged whole-window bigram verification (>=+2/rune and >= matched 20-offset maximum +5)",
    }
    (data / "controls.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


def screen(layer2: Path, window: str, family_name: str, side: str, threads: int):
    data = layer2 / "data"
    manifest = json.loads((data / "manifest.json").read_text(encoding="utf-8"))
    if window == "opening":
        wfile, n = "data/p0_2.txt", 729
    elif window == "p42":
        wfile, n = "data/p42.txt", 272
    else:
        raise ValueError(window)

    configs = {
        "solved": ("core", "null_core", "bigram", "data/keywords_solved.txt", ["litf=0,1", "abort=30:-4"]),
        "words": ("core20", "null_core20", "bigram", "data/keywords.txt", ["litf=0,1", "abort=30:-4"]),
        "combined": ("combined", "null_combined", "bigram", "data/keyword_none.txt", ["litf=0", "abort=30:-4"]),
        "periodic0": ("core20", "null_core20", "periodic", None, ["ms=2:14", "litf=0", "abort=150:2.5"]),
        "periodic1": ("core20", "null_core20", "periodic", None, ["ms=2:14", "litf=1", "abort=150:2.5"]),
    }
    if family_name not in configs:
        raise ValueError(family_name)
    original_name, null_name, mode, kw, extra = configs[family_name]
    selected = original_name if side == "real" else null_name
    family = f"file:data/{selected}.ksb"
    outdir = layer2 / "results"
    outdir.mkdir(parents=True, exist_ok=True)
    stem = f"{window}_{family_name}_{side}"
    tsv = outdir / f"{stem}.tsv"
    verify_path = outdir / f"{stem}_verify.txt"
    opts = [f"mode={mode}", f"n={n}", "beam=16", f"threads={threads}", "mults=1,28", "models=0,1"] + extra
    if kw:
        opts.append(f"kw={kw}")
    run_screen(layer2, Path(wfile), family, Path(f"results/{stem}.tsv"), opts)
    run_verify(layer2, Path(f"results/{stem}.tsv"), Path(f"results/{stem}_verify.txt"), top=20)
    meta = {
        "window": window, "family": family_name, "side": side, "n": n,
        "mode": mode, "family_file": selected + ".ksb", "tsv_sha256": sha256(tsv.read_bytes()),
        "verify_sha256": sha256(verify_path.read_bytes()), "manifest_upstream": manifest["upstream_commit"],
    }
    (outdir / f"{stem}.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(meta, indent=2))


def analyze(results: Path, controls_file: Path, out: Path):
    controls_data = json.loads(controls_file.read_text(encoding="utf-8"))
    lines = [
        "# Two-layer LP2 original-source gate: complete p0-p2 opening and held-out p42",
        "",
        "**Scope:** fixed historical number-stream/keyword two-layer families only; this is not a general LP2 decipherment.",
        "",
        "## Source-locked inputs",
        "",
        "- Complete opening: original LP2 p0-p2, reference window seg0.7, 729 runes, initial previous-ciphertext value -1.",
        "- Independent holdout: complete single-block LP2 p42 paragraph, 272 runes; previous-ciphertext value is the final rune of p41.",
        "- The p42 window begins 504 runes into the existing seg0.15 p40-p55 section, outside the earlier first-300-rune seg0.15 window.",
        "- Reference source: pnotisdev/cicada3301@15200c67abee106913ba01ff504c5b6e88d16cc7.",
        "- The periodic counter widening was checked against the unmodified reference at n=300; normalized screen TSVs were identical.",
        "",
        "## Positive-control gate",
        "",
        f"- Serial fixed-keyword controls (both the 581-stream solved-key family and the 20-stream 30-keyword family): **{'PASS' if controls_data['serial_pass'] else 'FAIL'}**.",
        f"- Combined one-pointer A1 order controls: **{'PASS' if controls_data['combined_pass'] else 'FAIL'}**.",
        f"- Unknown-keyword period 2-14 with ordinary F consumption (litf=0) controls: **{'PASS' if controls_data['periodic_litf0_pass'] else 'FAIL'}**.",
        f"- Unknown-keyword period 2-14 with literal-F bypass (litf=1) controls: **{'PASS' if controls_data['periodic_litf1_pass'] else 'FAIL'}**.",
        "- Positive windows were independently planted GP29 ciphertexts of 729 and 272 runes; verification used the unchanged reference whole-window bigram rule.",
        "",
        "## Original versus equal-work randomized null",
        "",
        "| Window | Family | Original best | Matched-null best | Original verified candidates | Null verified candidates |",
        "|---|---|---:|---:|---:|---:|",
    ]
    families = ("solved", "words", "combined", "periodic0", "periodic1")
    windows = ("opening", "p42")
    survivors = []
    missing = []
    for window in windows:
        for family in families:
            real_tsv = results / f"{window}_{family}_real.tsv"
            null_tsv = results / f"{window}_{family}_null.tsv"
            real_ver = results / f"{window}_{family}_real_verify.txt"
            null_ver = results / f"{window}_{family}_null_verify.txt"
            if not real_tsv.exists() or not null_tsv.exists():
                missing.append((window, family))
                continue

            def best(path):
                rows = best_rows(path)
                if not rows:
                    return "n/a", None
                row = max(rows.values(), key=lambda x: x["score"])
                return f"{row['score']:+.4f}", row

            rb, rr = best(real_tsv)
            nb, nr = best(null_tsv)
            rc = verify_candidates(real_ver)
            nc = verify_candidates(null_ver)
            lines.append(f"| {window} | {family} | {rb} | {nb} | {len(rc)} | {len(nc)} |")
            for line in rc:
                survivors.append({"window": window, "family": family, "candidate": line})
    lines += ["", "## Candidate adjudication", ""]
    if survivors:
        lines.append(f"**{len(survivors)} verified screen candidate(s) require full-section continuation.** They are not yet decipherments.")
        for s in survivors:
            lines.append(f"- {s['window']} / {s['family']}: {s['candidate']}")
    else:
        lines.append("No original screen candidate passed the reference whole-window rule (score >= +2.0 per rune and >= its 20-offset matched-null maximum +5.0). No full-section expansion is justified.")
    if missing:
        lines += ["", "## Incomplete or gated cells", ""]
        for w, f in missing:
            if f == "periodic0" and not controls_data["periodic_litf0_pass"]:
                lines.append(f"- {w} / periodic0: not run because the independently planted ordinary-F unknown-keyword controls did not pass.")
            elif f == "periodic1" and not controls_data["periodic_litf1_pass"]:
                lines.append(f"- {w} / periodic1: not run because the independently planted literal-F unknown-keyword controls did not pass.")
            else:
                lines.append(f"- {w} / {f}: missing screen artifact; this cell remains open.")
    lines += [
        "",
        "## Interpretation and limits",
        "",
        "The search is bounded to the fixed source families: all exported number streams with the three solved-page keys; the 20 historically selected number streams with the 30 fixed keywords; the predeclared one-pointer A1 combination; and unknown keyword periods 2-14 on the same 20 streams. The matched-null KSBs preserve each family’s stream count and individual lengths.",
        "",
        "A screen maximum is a ranking statistic, not plaintext. Only the unchanged independent whole-window re-decode is counted as a candidate. A surviving candidate would still need exact original forward replay and prediction on untouched material before being promoted.",
        "",
        "No conclusion here excludes other keys, other source-selected operations, different section clocks, or other cipher families. A negative result closes only this finite historical two-layer family on the two preregistered source windows.",
        "",
    ]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")
    print(out.read_text(encoding="utf-8"))
    summary = {"survivors": survivors, "missing": missing, "controls": controls_data}
    (out.parent / "layer2_summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    return summary


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("prepare")
    p.add_argument("upstream")
    p.add_argument("corpus")
    c = sub.add_parser("controls")
    c.add_argument("layer2")
    s = sub.add_parser("screen")
    s.add_argument("layer2")
    s.add_argument("window", choices=["opening", "p42"])
    s.add_argument("family", choices=["solved", "words", "combined", "periodic0", "periodic1"])
    s.add_argument("side", choices=["real", "null"])
    s.add_argument("--threads", type=int, default=4)
    a = sub.add_parser("analyze")
    a.add_argument("results")
    a.add_argument("controls")
    a.add_argument("out")
    args = ap.parse_args()

    if args.cmd == "prepare":
        prepare(Path(args.upstream), Path(args.corpus))
    elif args.cmd == "controls":
        controls(Path(args.layer2).resolve())
    elif args.cmd == "screen":
        screen(Path(args.layer2).resolve(), args.window, args.family, args.side, args.threads)
    elif args.cmd == "analyze":
        analyze(Path(args.results), Path(args.controls), Path(args.out))


if __name__ == "__main__":
    main()
