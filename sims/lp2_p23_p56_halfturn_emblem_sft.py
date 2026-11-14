"""Original-image five-dot half-turn and source-locked prime inverse audit.

Run: python sims/lp2_p23_p56_halfturn_emblem_sft.py
Requires: numpy, opencv-python-headless. Reads only repository-pinned source bytes.
"""
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "resources" / "liber-primus"
SHA256 = {
    "40.jpg": "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
    "73.jpg": "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
}


def scan(name):
    path = SRC / name
    data = path.read_bytes()
    if name in SHA256:
        assert hashlib.sha256(data).hexdigest() == SHA256[name], name
    gray = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert gray.shape == (3600, 2400), (name, gray.shape)
    return gray


def dots(gray, box):
    x0, y0, x1, y1 = box
    mask = (gray[y0:y1, x0:x1] < 90).astype(np.uint8)
    count, _, stats, centers = cv2.connectedComponentsWithStats(mask)
    sites = [
        (float(centers[i, 0] + x0), float(centers[i, 1] + y0), int(stats[i, cv2.CC_STAT_AREA]))
        for i in range(1, count)
        if 3000 < stats[i, cv2.CC_STAT_AREA] < 4000
    ]
    assert len(sites) == 5, sites
    return sorted(sites)


def glyphs(numbers, translit):
    return "".join(translit[x] for x in numbers)


def main():
    a, b = scan("40.jpg"), scan("73.jpg")
    sites_a = dots(a, (700, 450, 1650, 850))
    sites_b = dots(b, (800, 2400, 1700, 2820))
    # Match left-to-right p23 dots with right-to-left p56 dots.
    pairs = list(zip(sites_a, reversed(sites_b)))
    errors = [
        (abs(xa + xb - 2401), abs(ya + yb - 3255))
        for (xa, ya, _), (xb, yb, _) in pairs
    ]
    assert max(max(e) for e in errors) < 0.85, errors
    print("Five original centroids p23/p56 and 180-degree center errors:")
    for pair, err in zip(pairs, errors):
        print("  ", pair, "|", tuple(round(z, 4) for z in err))

    # At native resolution, compare the fixed source crop and its half-turn.
    x0, y0, x1, y1 = (735, 450, 1600, 850)
    p23_ink = a[y0:y1, x0:x1] < 125
    tx, ty = 2401, 3255
    p56_ink = b[ty - (y1 - 1):ty - y0 + 1, tx - (x1 - 1):tx - x0 + 1] < 125
    p56_aligned = p56_ink[::-1, ::-1]
    assert p23_ink.shape == p56_aligned.shape
    ink_a, ink_b = int(p23_ink.sum()), int(p56_aligned.sum())
    common = int((p23_ink & p56_aligned).sum())
    iou = common / (ink_a + ink_b - common)
    assert (ink_a, ink_b, common) == (17908, 17888, 17684)
    assert iou > 0.97
    print(f"Original 180-degree ink overlap: {common}/{ink_a + ink_b - common} = {iou:.9f} IoU")

    # Source-wide image census at quarter resolution and both orientations.
    a_thumb = cv2.resize(a, (600, 900), interpolation=cv2.INTER_AREA)
    template = a_thumb[113:213, 184:400]
    reversed_template = cv2.flip(template, -1)
    scores = []
    for number in range(17, 75):
        src = a if number == 40 else b if number == 73 else scan(f"{number:02}.jpg")
        thumb = cv2.resize(src, (600, 900), interpolation=cv2.INTER_AREA)
        for angle, needle in ((0, template), (180, reversed_template)):
            _, score, _, where = cv2.minMaxLoc(cv2.matchTemplate(thumb, needle, cv2.TM_CCOEFF_NORMED))
            scores.append((float(score), number, angle, where))
    scores.sort(reverse=True)
    assert scores[0][1:3] == (40, 0) and scores[0][0] > 0.99999, scores[:4]
    assert scores[1][1:3] == (73, 180) and scores[1][0] > 0.985, scores[:4]
    unrelated = max(z[0] for z in scores if z[1] not in (40, 73))
    assert unrelated < 0.50, unrelated
    print("Top original-image template matches: ", scores[:5])
    print(f"Best of other 56 LP2 images, both orientations: {unrelated:.6f}")

    corpus = json.loads((SRC / "lp2-corpus.json").read_text(encoding="utf-8"))
    ink = json.loads((SRC / "lp2-ink-annotations.json").read_text(encoding="utf-8"))
    red23 = next(x for x in ink["pages"] if x["page"] == 23)["red_spans"][0]
    assert (red23["start"], red23["length"]) == (0, 16)
    runes = corpus["runes"]
    heading = [runes.index(c) for c in red23["runes"]]
    assert heading == corpus["pages"][23]["indices"][:16]
    assert 0 not in heading  # No ciphertext F in the red heading.
    key = [(p - 1) % 29 for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53)]
    assert [(corpus["pages"][56]["indices"][i] - key[i]) % 29 for i in range(5)] == [24, 9, 18, 9, 23]
    print("p56 known ANEND prime-totient positive control: 5/5")
    for reverse_cipher in (False, True):
        for reverse_key in (False, True):
            inp = list(reversed(heading)) if reverse_cipher else heading
            ks = list(reversed(key)) if reverse_key else key
            plain = [(c - k) % 29 for c, k in zip(inp, ks)]
            impossible_f = [i for i, p in enumerate(plain) if p == 0 and inp[i] != 0]
            print(
                "p23 red16: Crot180=%s, Krot180=%s, P=%s, impossible plaintext-F positions=%s"
                % (reverse_cipher, reverse_key, glyphs(plain, corpus["translit"]), impossible_f)
            )
    for reverse_cipher in (False, True):
        inp = list(reversed(heading)) if reverse_cipher else heading
        plain = [(28 - c) % 29 for c in inp]
        print("p23 red16: Crot180=%s, direct Atbash=%s" % (reverse_cipher, glyphs(plain, corpus["translit"])))
    print("RESULT: original five-dot half-turn confirmed; no 16-rune decoded plaintext or key established")


if __name__ == "__main__":
    main()
