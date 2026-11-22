"""Original p22 seven detached dots -> p23 five-dot 3-4-5 candidate.

Run: python sims/lp2_p22_3plus4_p23_five_original_sft.py
Requires numpy, opencv-python; source-read-only. The geometric reading and
GF29 inverse are hypotheses, not attributed decoding instructions.
"""
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
SHA = {
    39: "e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7",
    40: "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
}
LEFT = [(1097, 2342), (1152, 2345), (1296, 2351)]
RIGHT = [(1598, 2371), (1683, 2287), (1714, 2359), (1738, 2312)]
FIVE = [(797, 568), (992, 507), (1297, 807), (1479, 546), (1527, 738)]


def image(number):
    raw = (ROOT / f"{number:02d}.jpg").read_bytes()
    assert hashlib.sha256(raw).hexdigest() == SHA[number]
    out = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert out.shape == (3600, 2400)
    return out


def components(img, rectangle, threshold):
    x0, y0, x1, y1 = rectangle
    mask = (img[y0:y1, x0:x1] < threshold).astype(np.uint8)
    _, _, stats, centers = cv2.connectedComponentsWithStats(mask, 8)
    return [((float(c[0]) + x0, float(c[1]) + y0),
             tuple(int(v) for v in s))
            for c, s in zip(centers[1:], stats[1:])]


def dot_counts_22(img):
    pairs = components(img, (400, 2110, 2000, 2550), 100)
    left, right = [], []
    for (x, y), (_, _, w, h, area) in pairs:
        if not (150 <= area <= 700 and 14 <= w <= 40 and 12 <= h <= 30):
            continue
        if 1070 < x < 1330 and 2330 < y < 2380:
            left.append((round(x), round(y)))
        if 1580 < x < 1760 and 2270 < y < 2400:
            right.append((round(x), round(y)))
    assert sorted(left) == LEFT
    assert sorted(right) == RIGHT
    return sorted(left), sorted(right)


def dots_23(img):
    pairs = components(img, (650, 400, 1800, 950), 75)
    found = []
    for (x, y), (_, _, w, h, area) in pairs:
        if 3000 <= area <= 3900 and 65 <= w <= 75 and 65 <= h <= 75:
            found.append((round(x), round(y)))
    assert sorted(found) == FIVE
    return sorted(found)


def multiply(a, b):
    return tuple(tuple(sum(a[i][k]*b[k][j] for k in range(2)) % 29
                       for j in range(2)) for i in range(2))


def power(a, count):
    out = ((1, 0), (0, 1))
    for _ in range(count):
        out = multiply(out, a)
    return out


def transform(matrix, symbols):
    assert len(symbols) % 2 == 0
    result = []
    for i in range(0, len(symbols), 2):
        x, y = symbols[i:i+2]
        result.extend(((matrix[0][0]*x+matrix[0][1]*y) % 29,
                       (matrix[1][0]*x+matrix[1][1]*y) % 29))
    return result


def ioc(a):
    counts = [a.count(i) for i in range(29)]
    return sum(n*(n-1) for n in counts)/(len(a)*(len(a)-1))


def main():
    left, right = dot_counts_22(image(39))
    five = dots_23(image(40))
    assert [len(left), len(right), len(five)] == [3, 4, 5]
    assert 3**2+4**2 == 5**2
    inv5 = pow(5, -1, 29)
    rotation = ((3*inv5 % 29, -4*inv5 % 29),
                (4*inv5 % 29, 3*inv5 % 29))
    inverse = ((3*inv5 % 29, 4*inv5 % 29),
               (-4*inv5 % 29, 3*inv5 % 29))
    assert rotation == ((18, 5), (24, 18))
    assert multiply(rotation, inverse) == ((1, 0), (0, 1))
    assert power(rotation, 7) == ((1, 0), (0, 1))
    assert power(rotation, 5) == ((9, 23), (6, 9))

    corpus = json.loads((ROOT / "lp2-corpus.json").read_text(encoding="utf-8"))
    assert corpus["pages"][23]["indices"][:16] == [
        1, 24, 7, 21, 6, 14, 23, 6, 10, 17, 10, 12, 16, 17, 10, 26
    ]
    cipher = sum((p["indices"] for p in corpus["pages"][23:27]), [])
    assert len(cipher) == 1021
    solved = corpus["pages"][57]["indices"][:94]
    assert len(solved) == 94 and ioc(solved) > 0.05
    assert transform(inverse, transform(rotation, solved)) == solved
    tests = []
    for exponent in (1, 5, 6):
        direct = power(rotation, exponent)
        reverse = power(rotation, (7 - exponent) % 7)
        for start in (0, 16):
            source = cipher[start:]
            source = source[:len(source)//2*2]
            result = transform(direct, source)
            assert transform(reverse, result) == source
            score = ioc(result)
            assert score < 0.04, (exponent, start, score)
            tests.append({"power": exponent, "start": start,
                          "n": len(result), "ioc": round(score, 9),
                          "first16": result[:16]})
    print(json.dumps({
        "status": "PASS: original visual count, direct rotation receiver negative",
        "p22_left": left, "p22_right": right, "p23_dots": five,
        "proposed_rotation": rotation, "order": 7,
        "p23_to_p26_runes": len(cipher),
        "source_ioc": round(ioc(cipher), 9),
        "tests": tests, "solved_p57_control": "94/94 exact roundtrip",
        "unknown_plaintext_recovered": False
    }, indent=2))


if __name__ == "__main__":
    main()
