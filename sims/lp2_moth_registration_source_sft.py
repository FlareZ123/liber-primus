"""Original-image-only moth registration gate. Requires OpenCV and NumPy.

Input resources/liber-primus/{05,70,72}.jpg, respectively LP1 p05,
LP2 physical p53 and LP2 physical p55. No plaintext or cipher keys are fitted.
"""
from pathlib import Path
import hashlib
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
SOURCES = {
    "05": ("2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7", (600, 1450, 1750, 1950)),
    "70": ("4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548", (250, 2450, 1750, 3480)),
    "72": ("a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba", (250, 2450, 1750, 3480)),
}


def read(name: str) -> np.ndarray:
    payload = (ROOT / (name + ".jpg")).read_bytes()
    digest = hashlib.sha256(payload).hexdigest()
    assert digest == SOURCES[name][0], (name, digest)
    im = cv2.imdecode(np.frombuffer(payload, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert im.shape == (3600, 2400)
    return im


def register(a: str, b: str, images: dict[str, np.ndarray]):
    def features(name: str):
        x0, y0, x1, y1 = SOURCES[name][1]
        roi = images[name][y0:y1, x0:x1]
        return cv2.SIFT_create(nfeatures=5000, contrastThreshold=0.015).detectAndCompute(roi, None)

    ka, da = features(a)
    kb, db = features(b)
    matches = cv2.BFMatcher().knnMatch(da, db, k=2)
    good = [m for m, n in matches if m.distance < 0.68 * n.distance]
    src = np.float32([ka[m.queryIdx].pt for m in good])
    dst = np.float32([kb[m.trainIdx].pt for m in good])
    cv2.setRNGSeed(0)
    m, inliers = cv2.estimateAffinePartial2D(
        src, dst, method=cv2.RANSAC, ransacReprojThreshold=3,
        maxIters=3000, confidence=0.999,
    )
    assert m is not None and inliers is not None
    ox, oy = SOURCES[a][1][:2]
    tx, ty = SOURCES[b][1][:2]
    m[:, 2] += np.array([tx, ty]) - m[:, :2] @ np.array([ox, oy])
    scale = float(np.hypot(m[0, 0], m[1, 0]))
    angle = float(np.degrees(np.arctan2(m[1, 0], m[0, 0])))
    count = int(inliers.sum())
    print(a, b, "matches", count, "/", len(good),
          "scale", round(scale, 7), "rotation_degrees", round(angle, 5),
          "global_shift", [round(float(x), 2) for x in m[:, 2]])
    return m, scale, angle, count


def main():
    images = {name: read(name) for name in SOURCES}
    m1, s1, angle1, count1 = register("05", "70", images)
    m2, s2, angle2, count2 = register("05", "72", images)
    m3, s3, angle3, count3 = register("70", "72", images)
    assert min(count1, count2) > 200 and count3 > 1500
    assert 2.32 < s1 < 2.34 and 2.32 < s2 < 2.34
    assert abs(angle1) < 0.1 and abs(angle2) < 0.1
    assert 0.999 < s3 < 1.001 and abs(angle3) < 0.01
    assert 65 < m3[0, 2] < 67 and 66 < m3[1, 2] < 68

    # The same first-runic-line printing band has the same 114px glyph height
    # in all three untransformed original images.
    for name, im in images.items():
        histogram = (im[630:820, 650:1750] < 110).sum(axis=1)
        ys = np.flatnonzero(histogram > 15) + 630
        bounds = (int(ys.min()), int(ys.max()))
        print(name, "first-line y", bounds, "height", bounds[1] - bounds[0] + 1)
        assert bounds == (673, 786)

    # First numeric row of p05's source 5x5 square is at y2224 (original
    # pixels); the two x extrema bracket the row. Register it by the moth map.
    for name, m in (("70", m1), ("72", m2)):
        projected = [float(m[1, 0] * x + m[1, 1] * 2224 + m[1, 2])
                     for x in (550, 1880)]
        print(name, "first 5x5 row mapped y", projected)
        assert min(projected) > 3600
    print("source rune height under art-fit scale", round(s1 * 114, 2))
    print("PASS: fixed artwork reuse yields no font-coherent or in-page 5x5 overlay")


if __name__ == "__main__":
    main()
