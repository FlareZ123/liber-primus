#!/usr/bin/env python3
"""Independent 716-rune positive-control gate for the p0 red-title/body boundary.

Uses the pinned external plant_ref.py, authentic prepared core20 key tapes, and
independently planted 716-rune GP29-English controls. Tests both source-fixed
previous-ciphertext states selected by the 13-dot marker: continue from final
red heading rune 5, or reset to -1. The first planted ciphertext rune is
asserted not to equal 5, so changing the W header does not alter the plant.
"""
from __future__ import annotations
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

UPSTREAM_COMMIT = "15200c67abee106913ba01ff504c5b6e88d16cc7"
BODY_SHA256 = "3e6191f2f5ab96359d9dbc27b223bd17d565f0e2978254e4b63041b61b2ed689"
N = 716


def parse_windows(path: Path):
    rows = {}
    lines = path.read_text(encoding="utf-8").splitlines()
    i = 0
    while i < len(lines):
        if lines[i].startswith("W "):
            name = lines[i].split()[1]
            assert i + 2 < len(lines) and lines[i + 1].startswith("R ") and lines[i + 2].startswith("L ")
            runes = [int(x) for x in lines[i + 1][2:].split()]
            lens = [int(x) for x in lines[i + 2][2:].split()]
            assert sum(lens) == len(runes)
            rows[name] = (runes, lens)
            i += 3
        else:
            i += 1
    return rows


def write_plain716(source: Path, target: Path):
    rows = parse_windows(source)
    assert {"eng0", "eng1"} <= rows.keys()
    e0, l0 = rows["eng0"]
    e1, l1 = rows["eng1"]
    assert len(e0) == 398 and len(e1) == 400
    runes = e0 + e1[:318]
    lens = list(l0)
    remaining = 318
    for word_len in l1:
        if remaining == 0:
            break
        take = min(word_len, remaining)
        lens.append(take)
        remaining -= take
    assert remaining == 0 and len(runes) == N and sum(lens) == N
    target.write_text(
        "W eng716 -1\nR " + " ".join(map(str, runes)) + "\nL " + " ".join(map(str, lens)) + "\n",
        encoding="utf-8",
    )
    return hashlib.sha256(bytes(runes)).hexdigest()


def run(args, cwd: Path):
    p = subprocess.run([str(x) for x in args], cwd=cwd, text=True, capture_output=True)
    if p.returncode:
        raise RuntimeError(f"command failed: {' '.join(map(str,args))}\n{p.stdout[-4000:]}\n{p.stderr[-4000:]}")
    return p.stdout


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: agent30_p0_red13_body716_periodic_control_sft.py <prepared-layer2-dir>")
    layer2 = Path(sys.argv[1]).resolve()
    data = layer2 / "data"
    outdir = data / "controls_body716"
    outdir.mkdir(parents=True, exist_ok=True)
    sys.path.insert(0, str(layer2))
    import plant_ref  # pinned source inside prepared run artifact

    plain = outdir / "eng716.txt"
    plain_sha = write_plain716(data / "plain.txt", plain)
    assert plain_sha == hashlib.sha256(bytes(parse_windows(plain)["eng716"][0])).hexdigest()
    assert (data / "core20.ksb").is_file()
    core_sha = hashlib.sha256((data / "core20.ksb").read_bytes()).hexdigest()
    binpath = layer2 / "target" / "release" / "layer2"
    verify_py = layer2 / "verify.py"
    assert binpath.is_file() and verify_py.is_file()

    plants = [
        ("m6", 2000, 28, 1, 103, [7, 18, 4, 3, 16, 24], 2, 28, 1),
        ("m9", 5000, 1, 0, 104, [4, 21, 2, 17, 8, 12, 5, 23, 9], 4, 1, 0),
    ]
    states = {"continuity": 5, "reset": -1}
    checks = []
    for boundary, previous in states.items():
        for name, offset, mult, model, seed, keyword, phase, isign, atbash in plants:
            label = f"{boundary}_{name}"
            text = plant_ref.plant(
                str(plain), str(data / "core20.ksb"), "primes", offset, mult, model,
                0.18, seed, keyword, phase, isign, 0, atbash,
            )
            lines = text.splitlines()
            rline = next(line for line in lines if line.startswith("R "))
            first_cipher = int(rline[2:].split()[0])
            assert first_cipher != 5, f"{label}: first cipher symbol collides with continuity state 5"
            text = re.sub(r"(?m)^W plant_0 -1$", f"W plant_0 {previous}", text, count=1)
            assert f"W plant_0 {previous}" in text
            plant_path = outdir / f"{label}.txt"
            tsv_path = outdir / f"{label}.tsv"
            verify_path = outdir / f"{label}_verify.txt"
            plant_path.write_text(text, encoding="utf-8")
            run([
                binpath, "screen", plant_path.relative_to(layer2), "file:data/core20.ksb",
                tsv_path.relative_to(layer2), "mode=periodic", "ms=2:14", "litf=0", "abort=150:2.5",
                f"n={N}", "beam=16", "mults=1,28", "models=0,1", "threads=4", "only=primes", "offs=0:8000",
            ], layer2)
            run([
                sys.executable, verify_py, tsv_path.relative_to(layer2), "--top", "10", "--controls", "20",
                "--out", verify_path.relative_to(layer2),
            ], layer2)
            vtext = verify_path.read_text(encoding="utf-8")
            candidate_lines = [line for line in vtext.splitlines() if line.startswith("CANDIDATE")]
            assert any("'primes'" in line and f"offset={offset}" in line and f"m={len(keyword)} litf=0" in line
                       for line in candidate_lines), (
                f"{label}: planted source/offset/period did not pass unchanged whole-window verification\n{vtext}"
            )
            checks.append({
                "label": label, "boundary": boundary, "previous": previous, "period": len(keyword),
                "truth_item": "primes", "truth_offset": offset, "mult": mult, "model": model,
                "seed": seed, "keyword": keyword, "phase": phase, "isign": isign, "atbash": atbash,
                "first_cipher": first_cipher, "pass": True,
                "plant_sha256": hashlib.sha256(plant_path.read_bytes()).hexdigest(),
                "tsv_sha256": hashlib.sha256(tsv_path.read_bytes()).hexdigest(),
                "verify_sha256": hashlib.sha256(verify_path.read_bytes()).hexdigest(),
                "verification": candidate_lines,
            })

    manifest = {
        "upstream_commit": UPSTREAM_COMMIT,
        "scope": "source-native 716-rune GP29-English plants for p0 red13 body, periods 6 and 9, ordinary F",
        "original_body_length": N,
        "original_body_sha256": BODY_SHA256,
        "independent_control_plaintext": "complete eng0 (398 runes) + first 318 runes of eng1 (716 total)",
        "control_plaintext_sha256": plain_sha,
        "core20_sha256": core_sha,
        "marker_boundary_states": states,
        "all_controls_pass": len(checks) == 4 and all(x["pass"] for x in checks),
        "checks": checks,
    }
    (outdir / "control_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))
    assert manifest["all_controls_pass"]


if __name__ == "__main__":
    main()
