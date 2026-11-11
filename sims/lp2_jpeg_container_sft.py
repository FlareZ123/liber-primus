#!/usr/bin/env python3
"""Original JPEG container audit, with no hypotheses about encrypted runes.

Run in the repository as a standalone test. An optional LP_JPEG_DIR can point
at a local unpacked original-image folder for source-level reproduction.
"""
from __future__ import annotations

from collections import Counter
from hashlib import sha256
from io import BytesIO
import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(os.environ.get("LP_JPEG_DIR", str(ROOT / "resources" / "liber-primus")))
EXPECTED_ICC = "942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0"
EXPECTED_P57 = "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"


def main() -> None:
    groups: Counter[tuple[str, str]] = Counter()
    extra: list[tuple[int, int]] = []
    for i in range(75):
        raw = (SOURCE / f"{i:02}.jpg").read_bytes()
        with Image.open(BytesIO(raw)) as image:
            assert image.format == "JPEG" and image.size == (2400, 3600), i
            icc = image.info.get("icc_profile", b"")
            groups[(image.mode, sha256(icc).hexdigest())] += 1
            if i < 17:
                assert not icc, i
            else:
                assert len(icc) == 2576 and sha256(icc).hexdigest() == EXPECTED_ICC, i
                assert image.mode in ("L", "RGB"), i
        eoi = raw.rfind(b"\xff\xd9")
        assert eoi > 0, i
        tail = raw[eoi + 2:]
        if tail:
            extra.append((i, len(tail)))
        if i >= 17:
            assert not tail, f"LP2 p{i-17} has unexpected trailing bytes"
        if i == 5:
            assert len(tail) == 72700 and tail == raw[:len(tail)][::-1]
        else:
            assert not tail, f"Unexpected JPEG tail in archive scan {i}"
        if i == 74:
            assert sha256(raw).hexdigest() == EXPECTED_P57
    assert groups == Counter({
        ("RGB", sha256(b"").hexdigest()): 17,
        ("RGB", EXPECTED_ICC): 35,
        ("L", EXPECTED_ICC): 23,
    }), groups
    assert extra == [(5, 72700)], extra
    print("PASS: 75 source JPEGs, each 2400x3600; 58 LP2 and 17 LP1")
    print("LP2 image modes: 35 RGB, 23 grayscale; all have the same 2576-byte ICC profile")
    print("LP2 trailing bytes after final JPEG EOI: zero on all 58 pages")
    print("LP1 scan 05: 72,700-byte trailer = exact reversal of its own 72,700-byte prefix")
    print("Scope: JPEG container metadata/trailer only; DCT/pixel steganography remains open")


if __name__ == "__main__":
    main()
