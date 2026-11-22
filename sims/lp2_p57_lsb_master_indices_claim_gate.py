#!/usr/bin/env python3
"""Source-exact single-file test for the published p57 LSB master-index claim.

Requires NumPy and Pillow. Read-only: loads original JPEGs from resources.
The physical source file 74.jpg is LP2 p57; 73.jpg is LP2 p56.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
WELCOME = (62, 102, 115, 181, 217, 218, 333, 566, 596, 625, 689)

# Exact original-image SHA256 values independently measured from the source ZIP.
CASES = {
    74: {
        "sha": "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b",
        "zeros": 136346, "y": 1412, "x": 1201, "union": 1543,
        "found": (62, 102, 115, 181, 333, 596, 625, 689),
    },
    73: {
        "sha": "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
        "zeros": 165830, "y": 737, "x": 1175, "union": 1511,
        "found": (62, 181, 566, 625, 689),
    },
    17: {
        "sha": "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
        "zeros": 538102, "y": 1551, "x": 2009, "union": 2077,
        "found": WELCOME,
    },
}


def inspect(page: int) -> dict:
    source = ROOT / f"{page:02}.jpg"
    actual_sha = hashlib.sha256(source.read_bytes()).hexdigest()
    with Image.open(source) as im:
        gray = np.asarray(im.convert("L"), dtype=np.uint8)
    height, width = gray.shape
    # Reproduce the external author's algorithm literally: bottom 60%,
    # grayscale JPEG decompression, bit0 zero-pixel coordinates, local Y.
    crop = gray[int(height * 0.4):, :]
    ys, xs = np.where((crop & 1) == 0)
    uniq_y, uniq_x = np.unique(ys), np.unique(xs)
    united = np.union1d(uniq_y, uniq_x)
    found = tuple(n for n in WELCOME if n in united)
    missing = tuple(n for n in WELCOME if n not in united)
    counts = np.bincount(
        np.concatenate([ys, xs]), minlength=max(WELCOME) + 1
    )
    return {
        "sha": actual_sha,
        "size": (width, height),
        "zeros": len(xs),
        "y": len(uniq_y),
        "x": len(uniq_x),
        "union": len(united),
        "found": found,
        "missing": missing,
        "frequencies": tuple(int(counts[n]) for n in WELCOME),
    }


def verify_authentic_welcome_key() -> None:
    """Test the proposed key against seven authentic known plaintext runes.

    The source author says WELCOME skip locations start at position29.
    Thus positions0..6 have no mask ambiguity: GP29 ciphertext = P+K.
    """
    gp = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
    transcription = (
        Path(__file__).resolve().parents[1]
        / "resources" / "transcriptions" / "lp1_wulfic_canonical.txt"
    ).read_text(encoding="utf-8")
    welcome_section = transcription.split("%")[1]
    ciphertext = "".join(ch for ch in welcome_section if ch in gp)[:7]
    assert ciphertext == "ᚢᛠᛝᛋᛇᚠᚳ"
    c = [gp.index(ch) for ch in ciphertext]
    p = [gp.index(ch) for ch in "ᚹᛖᛚᚳᚩᛗᛖ"]
    authentic_key = [(c_i - p_i) % 29 for c_i, p_i in zip(c, p)]
    assert authentic_key == [23, 10, 1, 10, 9, 10, 16]
    proposed_indices = WELCOME[:7]
    proposed_key = [i % 29 for i in proposed_indices]
    assert proposed_key == [4, 15, 28, 7, 14, 15, 14]
    proposed_plaintext = [(c_i - k_i) % 29 for c_i, k_i in zip(c, proposed_key)]
    assert proposed_plaintext == [26, 13, 22, 8, 27, 14, 20]
    assert all(a != b for a, b in zip(authentic_key, proposed_key))
    print("Authentic solved LP1 WELCOME ciphertext: " + ciphertext)
    print("Auth necessary key 7: " + str(authentic_key))
    print("Claimed modulo29 key 7: " + str(proposed_key))
    print("Claimed decoded GP indices: " + str(proposed_plaintext))
    print("PASS: proposed key fails all 7 original known-plaintext positions.")


def main() -> None:
    verify_authentic_welcome_key()
    for page, expected in CASES.items():
        got = inspect(page)
        print(f"Original {page:02}.jpg / dimensions {got['size']} / SHA256 {got['sha']}")
        print(
            f"LSB0 positions={got['zeros']}, Y={got['y']}, X={got['x']}, "
            f"union={got['union']}; Welcome matched={len(got['found'])}/11"
        )
        print(f"Present: {got['found']} | Absent: {got['missing']}")
        print(f"Per-index frequencies (Welcome order): {got['frequencies']}")
        for field, value in expected.items():
            assert got[field] == value, (
                f"Unexpected original source / algorithm for {page:02}.jpg: "
                f"{field}={got[field]!r}, expected {value!r}"
            )
    assert inspect(74)["frequencies"][4:6] == (0, 0)
    assert inspect(74)["frequencies"][7] == 0
    print("PASS: exact original reproduces 1543 but only 8/11 source-key witnesses.")
    print("PASS: page 17 unrelated image yields 11/11 without any decoding.")


if __name__ == "__main__":
    main()
