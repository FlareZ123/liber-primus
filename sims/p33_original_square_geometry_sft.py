#!/usr/bin/env python3
"""SFT: source-visible p33 geometry versus count-only square reshapes.

Run from a repository checkout with Pillow and NumPy installed:
    python sims/p33_original_square_geometry_sft.py
"""
from hashlib import sha256
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
RUNE_LO, RUNE_HI = 0x16A0, 0x16FF


def count_runes(line: str) -> int:
    return sum(RUNE_LO <= ord(char) <= RUNE_HI for char in line)


def main() -> None:
    # Canonical page delimiter is the original transcript's '%\\n'.
    pages = (SOURCE / "lp2-transcription.txt").read_text(encoding="utf-8").split("%\n")
    assert len(pages) >= 34
    p33 = pages[33]
    sections = p33.split("&")
    assert len(sections) == 2, len(sections)
    line_groups = [
        [line for line in section.splitlines() if "/" in line]
        for section in sections
    ]
    assert [len(group) for group in line_groups] == [5, 6]

    printed = [[count_runes(line) for line in group] for group in line_groups]
    assert printed == [[18, 16, 18, 23, 16], [19, 18, 18, 22, 22, 24]], printed
    assert sum(map(sum, printed)) == 214
    heading_lengths = [10, 8]  # original red rune spans; dot marks are punctuation
    body = [
        [length - heading_lengths[i] if j == 0 else length
         for j, length in enumerate(group)]
        for i, group in enumerate(printed)
    ]
    assert body == [[8, 16, 18, 23, 16], [11, 18, 18, 22, 22, 24]], body
    assert [sum(group) for group in body] == [81, 115]
    assert sum(map(sum, body)) == 196

    jpeg = (SOURCE / "50.jpg").read_bytes()  # archive index p33 + 17
    digest = sha256(jpeg).hexdigest()
    assert digest == "13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d"
    image = np.asarray(Image.open(SOURCE / "50.jpg").convert("RGB"))
    assert image.shape == (3600, 2400, 3)
    dark = np.min(image, axis=2) < 150
    profile = dark[:, 550:1860].sum(axis=1)
    smooth = np.convolve(profile, np.ones(31, dtype=float) / 31, mode="same")
    candidates = [
        y for y in range(550, 3050)
        if smooth[y] >= 310 and smooth[y] >= smooth[y - 1] and smooth[y] > smooth[y + 1]
    ]
    peaks = []
    for y in sorted(candidates, key=lambda pos: smooth[pos], reverse=True):
        if all(abs(y - other) >= 140 for other in peaks):
            peaks.append(y)
    peaks.sort()
    assert [698, 900, 1096, 1279, 1472, 1952, 2148, 2320, 2509, 2706, 2894] == peaks, peaks
    assert peaks[5] - peaks[4] > 400

    print("Source SHA-256:", digest)
    print("Original scan text-row centers (pixels):", peaks)
    print("Original sections: 5 + 6 lines; 3 black separator circles between")
    print("Visible-line rune counts including headings:", printed)
    print("Visible-line body rune counts:", body)
    print("Body totals 81 (5 lines) + 115 (6 lines) = 196 = 14^2")
    print("No physical 14x14 or 9x9 layout; both require arbitrary line reflow.")
    print("PASS: exact count arithmetic, source-image row geometry and heading exclusion")


if __name__ == "__main__":
    main()
