#!/usr/bin/env python3
"""Source-locked zero-key OutGuess check of the three 2014 Stage10 response images.

The three response images are the original LP1 archive members 14.jpg–16.jpg.
The same 2014 puzzle chain used unkeyed OutGuess on LP1 members 10.jpg–13.jpg;
the workflow first reruns the repository's byte-exact signed-message positive
controls, then applies that exact extraction command to 14.jpg–16.jpg.

This is a bounded carrier check, not a claim that every steganographic method
or password has been exhausted.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"
MANIFEST = IMAGE_DIR / "SHA256SUMS.txt"
KEY = ROOT / "resources" / "control" / "cicada-3301-public-key.asc"
OUT = Path("lp1-stage10-outguess-output")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def expected_hashes() -> dict[str, str]:
    found: dict[str, str] = {}
    for line in MANIFEST.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^([0-9a-f]{64})\s+\*?(\d{2}\.jpg)$", line.strip())
        if m:
            found[m.group(2)] = m.group(1)
    return found


def printable_ratio(data: bytes) -> float:
    if not data:
        return 0.0
    return sum(b in (9, 10, 13) or 32 <= b < 127 for b in data) / len(data)


def verify_pgp(path: Path, home: Path) -> tuple[bool, str]:
    result = subprocess.run(
        ["gpg", "--homedir", str(home), "--batch", "--status-fd", "1",
         "--verify", str(path)],
        capture_output=True, text=True, check=False, timeout=30,
    )
    match = re.search(r"\[GNUPG:\] VALIDSIG ([0-9A-F]+)", result.stdout)
    return result.returncode == 0 and match is not None, (
        match.group(1) if match else result.stderr.strip()[:500]
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = expected_hashes()
    with tempfile.TemporaryDirectory(prefix="lp1-stage10-gpg-") as home_name:
        home = Path(home_name)
        home.chmod(0o700)
        imported = subprocess.run(
            ["gpg", "--homedir", str(home), "--batch", "--import", str(KEY)],
            capture_output=True, text=True, check=False, timeout=30,
        )
        if imported.returncode != 0:
            raise RuntimeError(f"Could not import Cicada public key: {imported.stderr}")

        rows = []
        for page in (14, 15, 16):
            name = f"{page:02d}.jpg"
            image = IMAGE_DIR / name
            raw = image.read_bytes()
            digest = sha256(raw)
            expected = manifest.get(name)
            if expected is None or digest != expected:
                raise AssertionError(
                    f"{name} does not match the repository's original-image manifest: "
                    f"actual={digest}, expected={expected}"
                )

            output = OUT / f"lp1-{page:02d}.outguess"
            output.unlink(missing_ok=True)
            result = subprocess.run(
                ["outguess", "-r", str(image), str(output)],
                capture_output=True, text=True, check=False, timeout=60,
            )
            payload = output.read_bytes() if output.exists() else b""
            is_pgp = payload.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
            valid_sig = False
            signature = "not a clear-signed PGP message"
            if is_pgp:
                valid_sig, signature = verify_pgp(output, home)

            row = {
                "image": name,
                "image_bytes": len(raw),
                "image_sha256": digest,
                "outguess_returncode": result.returncode,
                "outguess_stdout": result.stdout.strip()[:1000],
                "outguess_stderr": result.stderr.strip()[:1000],
                "output_bytes": len(payload),
                "output_sha256": sha256(payload),
                "printable_ratio": round(printable_ratio(payload), 6),
                "pgp_clearsigned": is_pgp,
                "pgp_signature_valid": valid_sig,
                "pgp_signature_detail": signature,
                "output_prefix_hex": payload[:48].hex(),
            }
            rows.append(row)
            print(json.dumps(row, sort_keys=True))
            if is_pgp and payload:
                print(f"PGP_OUTPUT_BEGIN {name}")
                print(payload[:2500].decode("utf-8", errors="replace"))
                print(f"PGP_OUTPUT_END {name}")

    report = {
        "method": "pinned OutGuess 0.4-compatible -r extraction, no password",
        "positive_control": "workflow first runs cicada2014_stage09_missing_first_outguess_sft.py",
        "scope": "LP1 archive members 14.jpg, 15.jpg, 16.jpg (2014 Stage10 response)",
        "results": rows,
    }
    (OUT / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("REPORT", json.dumps(report, sort_keys=True))


if __name__ == "__main__":
    main()
