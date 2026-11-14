"""Original p7/p23/p56 five-dot reflection family and source-locked inverse audit.

Run: python sims/lp2_p23_p56_halfturn_emblem_sft.py
Requires: numpy, opencv-python-headless. Reads only repository-pinned source bytes.
"""
import hashlib
import json
import math
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "resources" / "liber-primus"
SHA256 = {
    "24.jpg": "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c",
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
    a, b, c = scan("40.jpg"), scan("73.jpg"), scan("24.jpg")
    sites_a = dots(a, (700, 450, 1650, 850))
    sites_b = dots(b, (800, 2400, 1700, 2820))
    sites_7 = dots(c, (700, 2800, 1650, 3250))
    errors_7 = [
        (abs(x23 - x7), abs(y23 + y7 - 3674))
        for (x23, y23, _), (x7, y7, _) in zip(sites_a, sites_7)
    ]
    assert max(max(e) for e in errors_7) < 0.2, errors_7
    print("Historical p7-to-p23 vertical-flip five-centroid errors:", errors_7)
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
    diff = p23_ink ^ p56_aligned
    assert int(diff.sum()) == 428
    dist_a = cv2.distanceTransform(p23_ink.astype(np.uint8), cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    dist_b = cv2.distanceTransform(p56_aligned.astype(np.uint8), cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    mismatch_edge_distance = np.where(p23_ink[diff], dist_a[diff], dist_b[diff])
    assert float(np.max(mismatch_edge_distance)) < 1.5
    print(f"All {int(diff.sum())} nonoverlapping ink pixels lie within {float(np.max(mismatch_edge_distance)):.4f} pixels of a circle boundary")
    # Physical p7 at the foot of its chapter uses the same five-dot source
    # drawing as p23, reflected top-to-bottom without horizontal reversal.
    p7_ink = c[3674 - (y1 - 1):3674 - y0 + 1, x0:x1] < 125
    p7_aligned = p7_ink[::-1, :]
    p7_common = int((p23_ink & p7_aligned).sum())
    p7_union = int((p23_ink | p7_aligned).sum())
    assert (int(p7_aligned.sum()), p7_common, p7_union) == (17925, 17908, 17925)
    assert p7_common / p7_union > 0.999
    print(f"p7 vertical reflection to p23: {p7_common}/{p7_union} = {p7_common / p7_union:.9f} IoU")


    # Complete 8-symmetry image census at quarter resolution, source fixed.
    a_thumb = cv2.resize(a, (600, 900), interpolation=cv2.INTER_AREA)
    template = a_thumb[113:213, 184:400]
    transforms = {
        "identity": template,
        "flipX": cv2.flip(template, 1),
        "flipY": cv2.flip(template, 0),
        "rotation180": cv2.flip(template, -1),
        "rotation90CW": cv2.rotate(template, cv2.ROTATE_90_CLOCKWISE),
        "rotation90CCW": cv2.rotate(template, cv2.ROTATE_90_COUNTERCLOCKWISE),
        "transpose": cv2.transpose(template),
        "antitranspose": cv2.flip(cv2.transpose(template), -1),
    }
    scores = []
    for number in range(17, 75):
        src = a if number == 40 else b if number == 73 else c if number == 24 else scan(f"{number:02}.jpg")
        thumb = cv2.resize(src, (600, 900), interpolation=cv2.INTER_AREA)
        for label, needle in transforms.items():
            _, score, _, where = cv2.minMaxLoc(cv2.matchTemplate(thumb, needle, cv2.TM_CCOEFF_NORMED))
            scores.append((float(score), number, label, where))
    scores.sort(reverse=True)
    assert [entry[1:3] for entry in scores[:3]] == [
        (40, "identity"), (24, "flipY"), (73, "rotation180")
    ], scores[:5]
    assert scores[0][0] > 0.99999 and scores[1][0] > 0.995 and scores[2][0] > 0.985
    unrelated = max(entry[0] for entry in scores if entry[1] not in (24, 40, 73))
    assert unrelated < 0.40, unrelated
    print("All 8 original-image symmetries, leading matches:", scores[:8])
    print(f"Other 55 LP2 images, maximum template correlation: {unrelated:.6f}")

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
    # The whole p23–26 visual chapter has a source-fixed 1,021-rune length.
    # Test every half-turn combination against the exact p56 prime-totient
    # algorithm with all optional ciphertext-F bypass paths, no fitted phase.
    chapter = [x for page in corpus["pages"][23:27] for x in page["indices"]]
    assert len(chapter) == 1021
    primes = [
        x for x in range(2, 20000)
        if all(x % divisor for divisor in range(2, math.isqrt(x) + 1))
    ][:1021]
    assert len(primes) == len(chapter)
    forward = [(p - 1) % 29 for p in primes]

    def first_strict_f_failure(cipher, stream):
        states = {0}
        for position, c in enumerate(cipher):
            next_states = set()
            for key_tick in states:
                k = stream[key_tick]
                if c == 0:
                    next_states.add(key_tick)  # literal plaintext F passthrough
                    if k != 0:
                        next_states.add(key_tick + 1)  # encrypted non-F plaintext
                elif (c - k) % 29:
                    next_states.add(key_tick + 1)
            if not next_states:
                return position
            states = next_states
        return None

    assert first_strict_f_failure(corpus["pages"][56]["indices"], forward) is None
    expected_failures = {(False, False): 0, (False, True): 7, (True, False): 162, (True, True): 24}
    for (reverse_cipher, reverse_key), expected in expected_failures.items():
        sequence = list(reversed(chapter)) if reverse_cipher else chapter
        stream = list(reversed(forward)) if reverse_key else forward
        first_failure = first_strict_f_failure(sequence, stream)
        assert first_failure == expected, (reverse_cipher, reverse_key, first_failure)
        print(
            "p23–26 strict plaintext-F gate Crot180=%s Krot180=%s: first forced contradiction at rune %s"
            % (reverse_cipher, reverse_key, first_failure)
        )
    print("RESULT: p7/p23/p56 three-portrait reflection family confirmed; direct p56 prime cipher fails all four p23 full-chapter half-turn arrangements")


if __name__ == "__main__":
    main()
