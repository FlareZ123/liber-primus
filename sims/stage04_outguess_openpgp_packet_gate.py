"""Determine whether the 2014 Stage04 7,524-byte OutGuess object is an OpenPGP packet.

The original output is a pinned source artifact. This read-only test does not
guess a passphrase, decrypt an encrypted message, or modify the artifact.
"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAYLOAD = ROOT / "resources/external/derived/2014-stage04/04-outguess.bin"
CONTROL = ROOT / "resources/control/cicada-3301-public-key.asc"
EXPECTED_SHA256 = "35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db"
PACKET_RE = re.compile(r"^:(?:[a-z][a-z0-9 -]* packet|encrypted data packet):", re.MULTILINE)


def inspect(path: Path) -> dict[str, object]:
    data = path.read_bytes()
    result = subprocess.run(
        ["gpg", "--batch", "--no-tty", "--list-packets", str(path)],
        capture_output=True,
        text=True,
        timeout=20,
        check=False,
    )
    details = (result.stdout + "\n" + result.stderr).strip()
    first = data[0] if data else None
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "first16hex": data[:16].hex(),
        "rfc4880_header_bit": bool(first is not None and first & 0x80),
        "packet_tag": ((first & 0x3F) if first & 0x40 else ((first >> 2) & 0xF)) if first is not None and first & 0x80 else None,
        "gpg_returncode": result.returncode,
        "packet_descriptions": [line for line in details.splitlines() if line.startswith(":")][:8],
        "diagnostic_head": details[:500],
        "accepted_packet_stream": result.returncode == 0 and bool(PACKET_RE.search(result.stdout)),
    }


def main() -> None:
    positive = inspect(CONTROL)
    unknown = inspect(PAYLOAD)
    assert positive["accepted_packet_stream"], "authentic known-key OpenPGP control failed"
    assert unknown["bytes"] == 7524
    assert unknown["sha256"] == EXPECTED_SHA256
    print(json.dumps({"openpgp_control": positive, "opaque_stage04": unknown}, sort_keys=True))


if __name__ == "__main__":
    main()
