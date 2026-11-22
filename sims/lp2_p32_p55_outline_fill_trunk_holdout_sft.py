"""Original-image tree correspondence: fit on trunk, predict independent crown.

Requires Pillow, NumPy, OpenCV and SciPy. Reads the original 2400x3600
JPGs from resources/liber-primus, without altering the source images.
"""
from hashlib import sha256
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
IMAGE = {
    "p32": ("49.jpg", (650, 2070, 1810, 3230), "c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72"),
    "p55": ("72.jpg", (625, 1430, 1735, 2510), "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"),
    "p57": ("74.jpg", (650, 1960, 1750, 3200), "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"),
    "p8": ("25.jpg", (0, 600, 560, 2900), "6b1026dfdfb447a5a76819883fe576254e8a47fdf1e97ecf1825166833bc6f00"),
}

def load(name):
    image, (left, top, right, bottom), digest = IMAGE[name]
    path = ROOT / image
    assert sha256(path.read_bytes()).hexdigest() == digest, image
    gray = np.asarray(Image.open(path).convert("L"))
    crop = gray[top:bottom, left:right]
    return 255 - cv2.resize(crop, (360, 360), interpolation=cv2.INTER_AREA).astype(np.float32)

def float_mask(ink, threshold, mode, mirror):
    binary = (ink > threshold).astype(np.uint8)
    if mode == "outline":
        mask = ink / 255
    elif mode == "dilate":
        mask = cv2.dilate(binary, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    else:
        mask = binary_fill_holes(binary).astype(np.uint8)
    return np.fliplr(mask).copy() if mirror else mask

def render(mask, blur, scale):
    softened = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), blur)
    size = round(360 * scale)
    center = (360 - size) // 2
    out = np.zeros((360, 360), dtype=np.float32)
    out[center:center + size, center:center + size] = cv2.resize(
        softened, (size, size), interpolation=cv2.INTER_AREA
    )
    return out

def register(target, source, rows, slack=45):
    start, stop = rows
    padded = cv2.copyMakeBorder(
        target, slack, slack, slack, slack, cv2.BORDER_CONSTANT, value=0
    )
    corr = cv2.matchTemplate(
        padded[start:stop + 2 * slack], source[start:stop], cv2.TM_CCOEFF_NORMED
    )
    _, best, _, xy = cv2.minMaxLoc(corr)
    return float(best), (xy[0] - slack, xy[1] - slack)

def held_corr(target, source, shift, rows):
    aligned = cv2.warpAffine(
        source, np.float32([[1, 0, shift[0]], [0, 1, shift[1]]]), (360, 360)
    )
    start, stop = rows
    return float(np.corrcoef(target[start:stop].ravel(), aligned[start:stop].ravel())[0, 1])

def trunk_to_crown(name, mirror=False):
    target = load("p32")
    ink = load(name)
    trials = []
    for threshold in (15, 25, 35, 45, 55):
        for mode in ("outline", "dilate", "fill"):
            mask = float_mask(ink, threshold, mode, mirror)
            for blur in (5, 9, 13):
                for scale in (0.8, 0.85, 0.9, 0.95, 1.0):
                    source = render(mask, blur, scale)
                    score, shift = register(target, source, (175, 340))
                    trials.append((score, threshold, mode, blur, scale, shift, source))
    best = max(trials, key=lambda row: row[0])
    score, threshold, mode, blur, scale, shift, source = best
    crown = held_corr(target, source, shift, (40, 175))
    whole = held_corr(target, source, shift, (0, 360))
    return score, crown, whole, (threshold, mode, blur, scale, shift)

def main():
    cases = (("p55", False), ("p55", True), ("p57", False), ("p8", False))
    results = {}
    for case in cases:
        result = trunk_to_crown(*case)
        results[case] = result
        print(
            f"{case} trunk={result[0]:.6f} crown_holdout={result[1]:.6f} "
            f"whole={result[2]:.6f} parameters={result[3]}"
        )
    primary = results[("p55", False)]
    assert abs(primary[0] - 0.914336) < 0.002
    assert abs(primary[1] - 0.898599) < 0.002
    assert primary[1] > max(results[key][1] for key in results if key != ("p55", False)) + 0.10
    print("PASS: original p55 contour fill predicts source p32 crown from trunk-only registration")

if __name__ == "__main__":
    main()
