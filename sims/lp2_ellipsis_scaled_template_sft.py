#!/usr/bin/env python3
"""Original 75-scan p33/p39 three-dot scaled-template and LP1-control SFT.

Use checked-in resources/liber-primus/00.jpg..74.jpg, or --zip with the
original 75-JPEG archive. Dependencies: numpy, opencv-python. Read-only.
"""
import argparse
import hashlib
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
HASHES = {
    50: "13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d",
    56: "d1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00"
}
EXPECTED = {1: 2, 13: 1, 24: 5, 40: 5, 50: 3, 56: 3, 73: 5}
P33 = ((732,1710,70,69), (1149,1710,70,69), (1628,1710,69,69))
P39 = ((1282,1677,32,33), (1478,1677,32,33), (1702,1677,33,33))


def ink(data, threshold):
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    assert image.shape == (3600, 2400, 3)
    return np.all(image < threshold, axis=2).astype(np.uint8)


def dots(bitmap):
    count, _, stats, _ = cv2.connectedComponentsWithStats(bitmap, connectivity=8)
    result = []
    for x, y, w, h, area in stats[1:]:
        if 25 <= w <= 120 and 25 <= h <= 120 and .70 <= w/h <= 1.30 and .58 <= area/(w*h) <= .88:
            result.append((int(x), int(y), int(w), int(h), int(area)))
    return sorted(result, key=lambda v: (v[1], v[0]))


def match(a, b):
    return 2*np.count_nonzero(a & b)/(np.count_nonzero(a)+np.count_nonzero(b))


def run(archive):
    def data(index):
        if archive:
            return archive.read(f"liber-primus-jpegs/{index:02}.jpg")
        return (ROOT / "resources/liber-primus" / f"{index:02}.jpg").read_bytes()

    found = {}
    for page in range(75):
        original = data(page)
        if page in HASHES:
            assert hashlib.sha256(original).hexdigest() == HASHES[page]
        measured = dots(ink(original, 150))
        if measured:
            found[page] = measured
    assert {p:len(v) for p,v in found.items()} == EXPECTED, found
    assert tuple(v[:4] for v in found[50]) == P33
    assert tuple(v[:4] for v in found[56]) == P39
    assert all(len(v) < 3 for p,v in found.items() if p < 17)

    x1 = np.array([x+w/2 for x,_,w,_ in P33])
    x2 = np.array([x+w/2 for x,_,w,_ in P39])
    sx = (x2[2]-x2[0])/(x1[2]-x1[0])
    tx = x2[0] - sx*x1[0]
    predicted = sx*x1[1]+tx
    err = abs(predicted-x2[1])
    sy = P39[0][3]/P33[0][3]
    ty = (P39[0][1]+P39[0][3]/2)-sy*(P33[0][1]+P33[0][3]/2)
    assert err < .2
    print("x-scale", sx, "y-scale", sy,
          "middle-dot-prediction", predicted, "middle-dot-actual", x2[1],
          "residual-original-px", err)

    for threshold, expected in ((100,.982486), (150,.986795), (200,.979154)):
        first = ink(data(50),threshold)
        target = ink(data(56),threshold)[1668:1724,1270:1750]
        scores = []
        for shift in (0,5,10):
            affine = np.array(((sx,0,tx+shift),(0,sy,ty)),dtype=np.float32)
            transformed = cv2.warpAffine(
                first,affine,(2400,3600),
                flags=cv2.INTER_NEAREST,borderValue=0)
            scores.append(float(match(transformed[1668:1724,1270:1750],target)))
        assert abs(scores[0]-expected)<.00001, scores
        assert scores[0]>scores[1]+.17>scores[2]+.15, scores
        print("source-mask",threshold,"matched-F1",scores[0],
              "wrong-shift-5-F1",scores[1],"wrong-shift-10-F1",scores[2])
    print("PASS all 75 original scans, 17 solved LP1 controls, and three-dot scaled-template registration")


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--zip",type=Path)
    args = cli.parse_args()
    if args.zip:
        with ZipFile(args.zip) as archive:
            run(archive)
    else:
        run(None)
