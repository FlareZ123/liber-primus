#!/usr/bin/env python3
"""Fetch the actual 2012 participant-rendered FluidSynth FLAC, not synthetic audio.

The archived Git blob is byte-pinned. Writes are atomic and file-locked.
"""
from __future__ import annotations

import hashlib
import os
import tempfile
import urllib.request
from pathlib import Path

from filelock import FileLock

URL = ("https://raw.githubusercontent.com/neuroretransmit/cicada/"
       "b13600373d3400d75ec4208198019f3d92a304dd/"
       "2012/009-midi-puzzle/output.flac")
EXPECTED = "ba14386583b5595a36ea8060c742a772ae66f9e1"
EXPECTED_LENGTH = 8_621_783
TARGET = Path("run-data/agent3-2012-original-render/output.flac")


def git_blob_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def main() -> None:
    with urllib.request.urlopen(URL, timeout=180) as source:
        data = source.read()
    digest = git_blob_sha(data)
    assert len(data) == EXPECTED_LENGTH and digest == EXPECTED, (
        len(data), digest
    )
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(TARGET) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="wb", dir=TARGET.parent, prefix=".output.", delete=False
        ) as temporary:
            temporary.write(data)
            path = Path(temporary.name)
        os.replace(path, TARGET)
    print(f"Original participant FLAC bytes={len(data)} SHA_git={digest}", flush=True)


if __name__ == "__main__":
    main()
