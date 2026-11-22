#!/usr/bin/env python3
"""Calibrate the LP2 DC-mode statistic with matched JPHide controls.

This is a diagnostic only. It does not assert that LP2 used JPHide.
"""
import hashlib
import json
import os
import pathlib
import pty
import select
import shutil
import subprocess
import tempfile
import time
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
STEGOSTUDIO = "201689b5755c0f1267223cd881429e679230b835"
SSAK = "ab5ebe3438a7d119a4a349810ab7a84fdcc60dcf"
JPHS = "33a11e1bad146f5e9c0d3fe6475812a1cedb9b7e"
BASE = f"https://raw.githubusercontent.com/rickschaves/stegostudio/{STEGOSTUDIO}/test/fixtures/third-party/"
THRESHOLD = 0.03

def run(args, cwd=None):
    return subprocess.run(args, cwd=cwd, check=True, stdout=subprocess.PIPE,
                          stderr=subprocess.STDOUT, text=True).stdout

def download(url, path, expected_sha=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=60) as response:
        data = response.read()
    digest = hashlib.sha256(data).hexdigest()
    if expected_sha and digest != expected_sha:
        raise RuntimeError(f"SHA256 mismatch for {url}: {digest}")
    path.write_bytes(data)
    return digest

def pty_run(argv, passwords):
    prompts = [b"Passphrase:", b"Re-enter  :"] if len(passwords) == 2 else [b"Passphrase:"]
    pid, master = pty.fork()
    if pid == 0:
        os.execv(argv[0], argv)
    transcript = bytearray()
    sent = 0
    deadline = time.monotonic() + 180
    status = None
    while time.monotonic() < deadline:
        ready, _, _ = select.select([master], [], [], 1.0)
        if ready:
            try:
                chunk = os.read(master, 4096)
            except OSError:
                chunk = b""
            if not chunk:
                break
            transcript.extend(chunk)
            while sent < len(passwords) and prompts[sent] in transcript:
                os.write(master, passwords[sent].encode("ascii") + b"\n")
                sent += 1
        waited, child_status = os.waitpid(pid, os.WNOHANG)
        if waited == pid:
            status = child_status
            break
    if status is None:
        try:
            os.kill(pid, 9)
        except ProcessLookupError:
            pass
        _, status = os.waitpid(pid, 0)
        raise RuntimeError("JPHide child timed out: " + transcript.decode("utf-8", "replace"))
    os.close(master)
    exit_code = os.waitstatus_to_exitcode(status)
    output = transcript.decode("utf-8", "replace")
    if sent != len(passwords) or exit_code != 0:
        raise RuntimeError(f"JPHide failed (exit={exit_code}, prompts={sent}/{len(passwords)}):\n{output}")
    return output

def analyzer(path, metric):
    out = run([str(metric), str(path)])
    return json.loads(out.strip().splitlines()[-1])

def build_encoder(tmp):
    # Prefer the archived SSAK 64-bit binary if it is runnable; otherwise build
    # the public h3xx source, whose version.h explicitly identifies v0.3.
    ssak = tmp / "ssak"
    run(["git", "clone", "--quiet", "https://github.com/mmtechnodrone/SSAK.git", str(ssak)])
    run(["git", "checkout", "--quiet", SSAK], cwd=ssak)
    candidate = ssak / "programs" / "64" / "jphide"
    seek = ssak / "programs" / "64" / "jpseek"
    version = ""
    if candidate.exists() and seek.exists():
        try:
            p = subprocess.run([str(candidate)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                               text=True, timeout=10)
            version = p.stdout.strip()
            if "version" in version.lower():
                return candidate, seek, version, "SSAK pinned binary"
        except Exception:
            pass
    src = tmp / "jphs"
    run(["git", "clone", "--quiet", "https://github.com/h3xx/jphs.git", str(src)])
    run(["git", "checkout", "--quiet", JPHS], cwd=src)
    run(["make", "-j2"], cwd=src)
    candidate = src / "jphide"
    seek = src / "jpseek"
    p = subprocess.run([str(candidate)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                       text=True, timeout=10)
    version = p.stdout.strip()
    if "0.3" not in version:
        raise RuntimeError("Expected pinned h3xx v0.3 fallback, got: " + version)
    return candidate, seek, version, "h3xx source v0.3"

def main():
    metric = ROOT / "sims" / "lp2_jphide_dc_metric"
    run(["gcc", "-O2", "-Wall", "-Wextra", "-o", str(metric),
         str(ROOT / "sims" / "lp2_jphide_dc_metric.c"), "-ljpeg"])
    cover = ROOT / "resources" / "liber-primus" / "17.jpg"
    if not cover.exists():
        raise RuntimeError(f"Missing original LP2 page 17: {cover}")
    original = analyzer(cover, metric)

    with tempfile.TemporaryDirectory(prefix="lp2-jphide-dc-") as td:
        tmp = pathlib.Path(td)
        jphide, jpseek, version, provenance = build_encoder(tmp)
        payload = b"LP2-JPHIDE-DC-POSITIVE-CONTROL-v0.3\n" + bytes(range(256))
        payload_path = tmp / "payload.bin"
        stego_path = tmp / "page17-jphide-positive.jpg"
        recovered_path = tmp / "recovered.bin"
        payload_path.write_bytes(payload)
        password = "LP2-DC-POSITIVE-CONTROL"
        embed_log = pty_run([str(jphide), str(cover), str(stego_path), str(payload_path)],
                            [password, password])
        seek_log = pty_run([str(jpseek), str(stego_path), str(recovered_path)], [password])
        recovered = recovered_path.read_bytes()
        if recovered != payload:
            raise RuntimeError("JPHide positive did not recover exact payload")
        if not stego_path.exists():
            raise RuntimeError("JPHide did not create a stego JPEG")
        stego = analyzer(stego_path, metric)

        fixtures = tmp / "fixtures"
        fixture_specs = [
            ("v05_mode0_positive", "jphide-v05-f10/lightening_jars_btv.jpg",
             "7fc1b2d3d10dbedf45686082229209877f4ef7a3861f22887c618877382d3711"),
            ("v05_mode1_positive", "jphide-v05-f10/trap.jpg",
             "ed17d808b2096ce7c2d7c3aef71e71c8b1c7973ff16af6f4d7766c153cb86534"),
            ("clean_photo_q90", "clean/photo_like_4_q90.jpg", None),
            ("clean_graphic_q80", "clean/graphic_q80.jpg", None),
            ("clean_solid_q90", "clean/solid_q90.jpg", None),
        ]
        fixture_results = []
        for name, rel, expected in fixture_specs:
            path = fixtures / pathlib.Path(rel).name
            digest = download(BASE + rel, path, expected)
            item = analyzer(path, metric)
            item["case"] = name
            item["sha256"] = digest
            fixture_results.append(item)

        result = {
            "classification": "calibration experiment; not evidence that LP2 used JPHide",
            "encoder": {"provenance": provenance, "version_output": version},
            "payload": {"bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest(),
                        "extracted_exactly": recovered == payload},
            "matched_pair": {"cover": original, "stego": stego,
                             "mode_pair_threshold": THRESHOLD,
                             "cover_below_threshold": original["even_fraction"] < THRESHOLD,
                             "stego_above_threshold": stego["even_fraction"] >= THRESHOLD,
                             "cover_m0_negative": original["m0_numerator"] < 0,
                             "stego_m0_nonnegative": stego["m0_numerator"] >= 0},
            "historical_v05_and_clean_fixtures": fixture_results,
            "jphide_output_tail": embed_log[-1200:],
            "jpseek_output_tail": seek_log[-1200:],
        }
        print(json.dumps(result, indent=2, sort_keys=True))
        print("DECISION threshold=0.03; matched_pair_cover_fraction="
              f"{original['even_fraction']:.9f}; matched_pair_stego_fraction="
              f"{stego['even_fraction']:.9f}; v03_positive_hit="
              f"{stego['even_fraction'] >= THRESHOLD}; "
              f"cover_m0_num={original['m0_numerator']}; "
              f"stego_m0_num={stego['m0_numerator']}")

if __name__ == "__main__":
    main()
