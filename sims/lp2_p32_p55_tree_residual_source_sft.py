"""Fixed multiscale tree residual: original LP2 p32 (49.jpg) vs p55 (72.jpg).

A two-model image residual and a JPEG quantization-matched planted positive.
Read-only original input, exact SHA-256 locked, no guessed rune decoding.
Requires numpy, opencv-python, scipy, Pillow.
"""
from hashlib import sha256
from io import BytesIO
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_fill_holes, gaussian_filter

SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
PAGES = {
    "p32": ("49.jpg", (650, 2070, 1810, 3230), "c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72"),
    "p55": ("72.jpg", (625, 1430, 1735, 2510), "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"),
    "p57": ("74.jpg", (650, 1960, 1750, 3200), "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"),
}


def source_image(name):
    filename, _, digest = PAGES[name]
    data = (SOURCE / filename).read_bytes()
    assert sha256(data).hexdigest() == digest, filename
    image = Image.open(BytesIO(data))
    assert image.size == (2400, 3600)
    return image


def inkcrop(image, rect):
    left, top, right, bottom = rect
    gray = np.asarray(image.convert("L"))
    return 255 - cv2.resize(
        gray[top:bottom, left:right], (360, 360), interpolation=cv2.INTER_AREA
    ).astype(np.float32)


def render(source, mode, scale, blur):
    mask = source > 15
    if mode == "fill":
        binary = binary_fill_holes(mask).astype(np.float32)
    else:
        binary = cv2.dilate(
            mask.astype(np.float32),
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)),
        )
    soft = cv2.GaussianBlur(binary, (0, 0), blur)
    side = round(360 * scale)
    off = (360 - side) // 2
    result = np.zeros((360, 360), np.float32)
    result[off:off + side, off:off + side] = cv2.resize(
        soft, (side, side), interpolation=cv2.INTER_AREA
    )
    return result


def shift(img, dx, dy):
    return cv2.warpAffine(
        img, np.float32([[1, 0, dx], [0, 1, dy]]), (360, 360)
    )


def trunk_align(target, source):
    padded = cv2.copyMakeBorder(
        target, 45, 45, 45, 45, cv2.BORDER_CONSTANT, value=0
    )
    correlations = cv2.matchTemplate(
        padded[175:430], source[175:340], cv2.TM_CCOEFF_NORMED
    )
    _, score, _, xy = cv2.minMaxLoc(correlations)
    offsets = (xy[0] - 45, xy[1] - 45)
    return shift(source, *offsets), float(score), offsets


def pearson(a, b, start, stop):
    return float(np.corrcoef(
        a[start:stop].ravel(), b[start:stop].ravel()
    )[0, 1])


def fit_intensity(target, modeled):
    interval = slice(175, 340)
    predictor = np.column_stack((
        modeled[interval].ravel(), np.ones(modeled[interval].size)
    ))
    gain, bias = np.linalg.lstsq(
        predictor, target[interval].ravel(), rcond=None
    )[0]
    return gain * modeled + bias


def components(binary):
    n, _, stats, centers = cv2.connectedComponentsWithStats(
        binary.astype(np.uint8), 8
    )
    output = []
    for i in range(1, n):
        area = int(stats[i, cv2.CC_STAT_AREA])
        if area >= 4:
            rect = [int(v) for v in stats[i, :4]]
            xy = [round(float(v), 1) for v in centers[i]]
            output.append({"area": area, "xywh": rect, "centroid": xy})
    return sorted(output, key=lambda obj: -obj["area"])


def stable_residual(target, fitted_a, fitted_b):
    high_a = target - fitted_a
    high_b = target - fitted_b
    high_a -= gaussian_filter(high_a, sigma=8)
    high_b -= gaussian_filter(high_b, sigma=8)
    valid = np.zeros((360, 360), dtype=bool)
    valid[40:175, 25:335] = True
    return (high_a > 20) & (high_b > 20) & valid


def planted_original_quality_jpeg(original):
    # Three simple strokes in the upper-right empty white part of p32 crop.
    # Coordinates are frozen in registered 360x360 crop; expand to original.
    clone = original.copy()
    pen = ImageDraw.Draw(clone)
    x = lambda v: round(650 + 1160 * v / 360)
    y = lambda v: round(2070 + 1160 * v / 360)
    for start, end in (
        ((300, 44), (300, 73)),
        ((300, 44), (316, 44)),
        ((300, 57), (312, 57)),
    ):
        pen.line(
            (x(start[0]), y(start[1]), x(end[0]), y(end[1])),
            fill=(25, 25, 25), width=9,
        )
    buffer = BytesIO()
    clone.save(
        buffer, format="JPEG", qtables=original.quantization, subsampling=0
    )
    reconstructed = Image.open(BytesIO(buffer.getvalue()))
    return inkcrop(reconstructed, PAGES["p32"][1])


def main():
    p32_image = source_image("p32")
    target = inkcrop(p32_image, PAGES["p32"][1])
    tree = inkcrop(source_image("p55"), PAGES["p55"][1])
    sapling = inkcrop(source_image("p57"), PAGES["p57"][1])

    # Fixed historical trunk-selected best fill model, used without refitting.
    fill = shift(render(tree, "fill", 0.9, 9), -12, 1)
    # Morphologically independent model: optimize only the source trunk rows.
    dilate, dilate_training, dilate_shift = trunk_align(
        target, render(tree, "dilate", 0.88, 9)
    )
    independent, _, independent_shift = trunk_align(
        target, render(sapling, "fill", 0.9, 9)
    )
    assert dilate_shift == (-11, -1)
    assert independent_shift == (-29, 45)
    assert abs(pearson(target, fill, 40, 175) - 0.8985987355) < 0.003
    assert abs(pearson(target, dilate, 40, 175) - 0.8377199086) < 0.003
    assert abs(pearson(target, independent, 40, 175) - 0.5723539184) < 0.003
    assert abs(dilate_training - 0.8385010958) < 0.003
    modeled_a = fit_intensity(target, fill)
    modeled_b = fit_intensity(target, dilate)

    actual_mask = stable_residual(target, modeled_a, modeled_b)
    actual = components(actual_mask)
    assert [x["area"] for x in actual] == [77, 21, 6, 4]
    assert actual[0]["xywh"] == [161, 164, 9, 11]

    planted = planted_original_quality_jpeg(p32_image)
    positive_mask = stable_residual(planted, modeled_a, modeled_b)
    positive = components(positive_mask)
    assert positive[0]["xywh"] == [299, 42, 18, 32]
    assert positive[0]["area"] >= 150
    assert not actual_mask[40:80, 285:325].any()
    assert int(positive_mask[40:80, 285:325].sum()) >= 150
    print({
        "source": "original p32=49.jpg, p55=72.jpg, negative p57=74.jpg",
        "model_fill_crown_correlation": pearson(target, fill, 40, 175),
        "model_dilate_crown_correlation": pearson(target, dilate, 40, 175),
        "different_tree_crown_correlation": pearson(target, independent, 40, 175),
        "original_stable_components_area4plus": actual,
        "planted_JPEG_component": positive[0],
        "original_mark_zone_stable_pixels": int(actual_mask[40:80, 285:325].sum()),
        "same_quantization_planted_mark_zone_stable_pixels": int(positive_mask[40:80, 285:325].sum()),
    })
    print("PASS: no isolated original JPEG-scale mark, matched synthetic positive detected")


if __name__ == "__main__":
    main()
