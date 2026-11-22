#!/usr/bin/env python3
"""SFT: source-selected unkeyed OutGuess on two Stage08 daughter JPEGs.

Exact 2014 Stage08 parent-image extraction is the positive control. No password
search or LP2 scan is performed. Outputs are saved only when nonempty.
"""
from __future__ import annotations

import hashlib
from pathlib import Path
import subprocess
import urllib.request

SOURCE_REV = "76d3ee8c762f60025822c8c05edbf31351636469"
SOURCE = ("https://raw.githubusercontent.com/krisyotam/cicada3301/"
          f"{SOURCE_REV}/puzzles/2014/assets/stage08/")
PINS = {
    "index.jpg": ("58de2bf93cc61e6817f7cae98afd690df9b9d039", 359282),
    "index.bz2": ("c568e481008fba993741acb77a7f12492b19afa6", 12683),
    "index.1.jpg": ("75ef728f091411aa2d4599665d92eaad6a0155f4", 1084),
    "index.2.jpg": ("4afb862b93386253dbc734e15853832f5e2642b5", 1635),
}
EXPECTED_PARENT_SHA256 = (
    "cf57f8f9758b20d129b7a157afd26383e5d9209bbe76eb9f78ebe19a320997c7"
)


def source_file(name: str, dest: Path) -> bytes:
    with urllib.request.urlopen(SOURCE + name, timeout=35) as response:
        raw = response.read()
    sha = hashlib.sha1(
        b"blob " + str(len(raw)).encode("ascii") + b"\0" + raw
    ).hexdigest()
    assert (sha, len(raw)) == PINS[name], (name, sha, len(raw))
    dest.write_bytes(raw)
    print(f"SOURCE {name} size={len(raw)} git_blob={sha} "
          f"sha256={hashlib.sha256(raw).hexdigest()}")
    return raw


def extract(src: Path, dst: Path) -> tuple[int, bytes]:
    completed = subprocess.run(
        ["outguess", "-r", str(src), str(dst)],
        check=False,
        capture_output=True,
        text=True,
        timeout=45,
    )
    payload = dst.read_bytes() if dst.exists() else b""
    print(f"EXTRACT {src.name}: code={completed.returncode}, "
          f"bytes={len(payload)}, sha256={hashlib.sha256(payload).hexdigest()}, "
          f"stdout={completed.stdout.strip()!r}, "
          f"stderr={completed.stderr.strip()[:2000]!r}")
    return completed.returncode, payload


def main() -> None:
    root = Path("outguess-stage08-daughters")
    root.mkdir(exist_ok=True)
    original = {}
    for name in PINS:
        original[name] = source_file(name, root / name)
    assert hashlib.sha256(original["index.bz2"]).hexdigest() == EXPECTED_PARENT_SHA256
    code, parent = extract(root / "index.jpg", root / "index.jpg.outguess")
    assert code == 0, "OutGuess historic Stage08 parent positive control failed"
    assert parent == original["index.bz2"], "Parent extraction differs from pinned 12683 bytes"
    print("PASS parent: exact OutGuess historic 12,683-byte bzip2 extraction")
    outcomes = []
    for name in ("index.1.jpg", "index.2.jpg"):
        code, candidate = extract(root / name, root / (name + ".outguess"))
        outcomes.append((name, code, len(candidate), hashlib.sha256(candidate).hexdigest()))
    print("DAUGHTER_RESULTS", outcomes)
    print("PASS: frozen unkeyed OutGuess parent control and daughter test finished. "
          "Nonempty daughter payloads require separate source/format evaluation.")


if __name__ == "__main__":
    main()
