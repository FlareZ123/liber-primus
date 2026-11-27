"""Replay the stock-root branch gate on original LP2 and signed 2016 artwork.

Requires NumPy, SciPy and Pillow. The default input layout is the shared repo.
Only published opposing-crown registrations enter the held-root evaluation.
"""
import argparse
import base64
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

STOCK_SHAPE = (210, 160)
ROOT_ROW = 162
CROPS = {49: (650, 2060, 1760, 3130), 72: (650, 1410, 1760, 2480)}
P32 = [
    (0.85202, 0.88311, -11.254, 36.728, 4.26535),
    (0.87435, 0.86402, -13.184, 40.015, 4.34961),
]
P55 = [
    (0.84549, 0.84596, -6.390, 45.343, 0.68921, 0.785118, 1.412223),
    (0.84484, 0.84308, -6.461, 45.558, 0.58098, 0.810180, 1.267289),
]
SIGNED = [
    (1 / 1.05, 1 / 1.05, -201.25 / 1.05, -256.25 / 1.05, 4.0),
    (1 / 1.05, 1 / 1.05, -200.25 / 1.05, -255.25 / 1.05, 2.5),
]
LEVELS = (0.30, 0.40, 0.50, 0.60, 0.70)
SHIFTS = (-0.5, 0.0, 0.5)
CONNECTIVITY = np.ones((3, 3), dtype=bool)


def decode_mask(path, shape, digest):
    data = base64.b64decode(path.read_text())
    runs, n, shift = [], 0, 0
    for byte in data:
        n += (byte & 127) << shift
        if byte & 128:
            shift += 7
        else:
            runs.append(n)
            n, shift = 0, 0
    diff = np.repeat(np.arange(len(runs)) % 2, runs).reshape(shape)
    mask = np.logical_xor.accumulate(diff.astype(bool), axis=0)
    assert hashlib.sha256(mask.tobytes()).hexdigest() == digest
    return mask


def grayscale(path):
    with Image.open(path) as image:
        return np.asarray(image.convert("L"), dtype=float)


def native_sample(path, page):
    x0, y0, x1, y1 = CROPS[page]
    image = grayscale(path)[y0:y1, x0:x1]
    locations = []
    for axis, origin in enumerate((y0, x0)):
        edge = np.abs(np.diff(image, axis=axis)).sum(axis=1 - axis)
        coords = np.arange(edge.size) + origin + 0.5
        harmonic = np.dot(edge, np.exp(-2j * np.pi * (9 / 50) * coords))
        phase = (-np.angle(harmonic) / (2 * np.pi * (9 / 50))) % (50 / 9)
        centers = phase + (np.arange(-1, 700) + 0.5) * (50 / 9) - origin
        centers = centers[(0 <= centers) & (centers < image.shape[axis] - 1)]
        locations.append(np.rint(centers).astype(int))
    return image[np.ix_(*locations)]


def warp(array, shape, registration, inverse=False, order=1, invalid=0.0):
    sx, sy, tx, ty, *_ = registration
    y, x = np.indices(shape, dtype=float)
    if inverse:
        coords = ((y - ty) / sy, (x - tx) / sx)
    else:
        coords = (sy * y + ty, sx * x + tx)
    return ndi.map_coordinates(array, coords, order=order, cval=invalid, prefilter=False)


def fill_prediction(mask, shape, registration):
    blurred = ndi.gaussian_filter(mask.astype(float), registration[4], mode="constant")
    return warp(blurred, shape, registration)


def contour_prediction(mask, shape, registration):
    fill = fill_prediction(mask, shape, registration)
    dy, dx = np.gradient(fill)
    distance = (fill - registration[5]) / np.maximum(1e-4, np.hypot(dx, dy))
    return 0.23809524 * np.exp(-0.5 * (distance / registration[6]) ** 2)


def fit_photometry(predicted, target, calibration):
    values = predicted[calibration]
    gain, bias = np.linalg.lstsq(
        np.column_stack((values, np.ones(values.size))), target[calibration], rcond=None
    )[0]
    assert gain > 0
    return (target - bias) / gain


def components(mask):
    labels, count = ndi.label(mask, CONNECTIVITY)
    return labels, np.bincount(labels.ravel(), minlength=count + 1)


def root_only(mask):
    root = mask[ROOT_ROW:].copy()
    labels, sizes = components(root)
    trunk = np.unique(labels[0, 50:85])
    trunk = trunk[trunk != 0]
    if trunk.size == 0:
        return np.zeros_like(root)
    return labels == trunk[np.argmax(sizes[trunk])]


def finite_branches(root):
    """Track connected components as one horizontal row is added above them."""
    previous_labels = np.zeros((0, root.shape[1]), dtype=int)
    tips = {}
    bars = []
    for row in range(root.shape[0] - 1, -1, -1):
        labels, sizes = components(root[row:])
        children = {int(label): [] for label in range(1, len(sizes))}
        counts = np.bincount(previous_labels.ravel())
        for child, (tip_y, tip_x) in tips.items():
            receiving = int(labels[1:][previous_labels == child][0])
            children[receiving].append((tip_y, tip_x, int(counts[child])))
        tips = {}
        for label, inherited in children.items():
            siblings = sorted(inherited, key=lambda tip: (-tip[0], tip[1]))
            if siblings:
                tips[label] = siblings[0][:2]
                for tip_y, tip_x, size in siblings[1:]:
                    bars.append((tip_y, tip_x, tip_y - row - ROOT_ROW, size))
            else:
                tips[label] = (row + ROOT_ROW, int(np.flatnonzero(labels[0] == label)[0]))
        previous_labels = labels
    return sorted(bars, reverse=True)


def right_terminal(bars, minimum_depth):
    return any(y >= 200 and x >= 74 and depth >= minimum_depth and area >= 6
               for y, x, depth, area in bars)


def topology_variants(fields):
    summaries = []
    for field_index, field in enumerate(fields):
        for dy in SHIFTS:
            for dx in SHIFTS:
                shifted = ndi.shift(field, (dy, dx), order=1, mode="constant", prefilter=False)
                for level in LEVELS:
                    root = root_only(shifted >= level)
                    bars = finite_branches(root)
                    summaries.append({
                        "trunk_seen": bool(root.any()), "terminal_seen": right_terminal(bars, 2),
                        "strict_terminal_seen": right_terminal(bars, 3),
                        "field_index": field_index, "dy": dy, "dx": dx, "level": level,
                        "bars": bars, "right_small": sum(y >= 200 and x >= 74 for y, x, _, _ in bars),
                    })
    return {
        "variants": len(summaries),
        "trunk_seen": sum(item["trunk_seen"] for item in summaries),
        "right_terminal_seen": sum(item["terminal_seen"] for item in summaries),
        "strict_right_terminal_seen": sum(item["strict_terminal_seen"] for item in summaries),
        "right_any_branch": sum(item["right_small"] > 0 for item in summaries),
        "positive_fields": sorted({item["field_index"] for item in summaries if item["terminal_seen"]}),
        "positive_params_if_sparse": [
            [item["field_index"], item["dy"], item["dx"], item["level"]]
            for item in summaries if item["terminal_seen"]
        ] if sum(item["terminal_seen"] for item in summaries) <= 12 else None,
        "distinct_bars": sorted({
            bar for item in summaries for bar in item["bars"] if bar[1] >= 74 and bar[0] >= 200
        }),
    }


def contour_fills(ink):
    for level in (12, 20, 30, 40):
        line = ink > (level / 252)
        for closing in (0, 1):
            source = ndi.binary_closing(line, structure=CONNECTIVITY) if closing else line
            labels, sizes = components(source)
            gate = labels[130, 65:105]
            labels_at_trunk = np.unique(gate[gate > 0])
            if labels_at_trunk.size:
                selected = labels == labels_at_trunk[np.argmax(sizes[labels_at_trunk])]
                yield ndi.binary_fill_holes(selected).astype(float)
            else:
                yield np.zeros_like(ink)


def signed_blocks(gray):
    # For a block at (x,y), exclude a bright pixel anywhere in [x-2,x+4)×[y-2,y+4).
    maximum = ndi.maximum_filter(gray, size=6, origin=-1)
    by, bx = np.indices((gray.shape[0] // 2, gray.shape[1] // 2))
    yy, xx = 2 * by, 2 * bx
    actual = (gray[yy, xx] + gray[yy + 1, xx] + gray[yy, xx + 1] + gray[yy + 1, xx + 1]) / 4
    return actual, maximum[yy, xx] <= 40


def half_calibration(shape, fit, signed=False):
    y, x = np.indices(shape)
    if signed:
        y, x = y * 2, x * 2
        return (y >= 290) & (y < 420) & ((188 <= x) & (x < 284) if fit == 0 else (284 <= x) & (x < 384))
    return (y >= 15) & (y < 125) & ((15 <= x) & (x < 100) if fit == 0 else (100 <= x) & (x < 185))


def filled_fields(target, stock, registrations, signed_valid=None):
    signed = signed_valid is not None
    for index, registration in enumerate(registrations):
        if signed:
            sx, sy, tx, ty, blur = registration
            registration = (2 * sx, 2 * sy, tx + sx / 2, ty + sy / 2, blur)
        reference = fill_prediction(stock, target.shape, registration)
        calibration = half_calibration(target.shape, index, signed)
        if signed:
            calibration &= signed_valid
        normalized = fit_photometry(reference, target, calibration)
        if signed:
            for missing in (0.0, 1.0):
                values = np.where(signed_valid, normalized, missing)
                yield warp(values, STOCK_SHAPE, registration, inverse=True)
        else:
            yield warp(normalized, STOCK_SHAPE, registration, inverse=True)


def rendered_controls(mask, p32_shape, p55_shape, signed_shape, signed_valid):
    def filled(shape, regs):
        for reg in regs:
            latent = fill_prediction(mask, shape, reg)
            yield warp(latent, STOCK_SHAPE, reg, inverse=True)

    signed_regs = [
        (2 * sx, 2 * sy, tx + sx / 2, ty + sy / 2, sig) for sx, sy, tx, ty, sig in SIGNED
    ]
    signed_fields = [
        warp(np.where(signed_valid, fill_prediction(mask, signed_shape, reg), missing),
             STOCK_SHAPE, reg, inverse=True)
        for reg in signed_regs for missing in (0.0, 1.0)
    ]
    contour_fields = [
        warp(field, STOCK_SHAPE, reg, inverse=True)
        for reg in P55 for field in contour_fills(contour_prediction(mask, p55_shape, reg))
    ]
    return {
        "p32": topology_variants(filled(p32_shape, P32)),
        "p55": topology_variants(contour_fields),
        "signed_2016": topology_variants(signed_fields),
    }


def ornament_signature(source):
    filled = source > 0.5
    _, sizes = components(filled)
    support = [int(size) for size in sizes[1:] if size >= 6]
    holes = ndi.binary_fill_holes(filled) & ~filled
    _, hole_sizes = components(holes)
    return len(support), int((hole_sizes[1:] >= 6).sum())


def ornament_control(image_dir, pages, box):
    x0, y0, x1, y1 = box
    crops = [grayscale(image_dir / f"{page:02}.jpg")[y0:y1, x0:x1] for page in pages]
    assert np.array_equal(*crops)
    base = (255 - crops[0]) / 255
    h, w = base.shape
    native = tuple(max(1, round(n / (50 / 9))) for n in base.shape)
    probe_y = (np.arange(native[0]) + 0.5) * h / native[0] - 0.5
    probe_x = (np.arange(native[1]) + 0.5) * w / native[1] - 0.5
    aligned = ndi.map_coordinates(base, np.meshgrid(probe_y, probe_x, indexing="ij"), order=1)
    exact = ornament_signature(aligned)
    resampled = []
    for sig in (0.0, 0.7, 2.5, 4.3):
        blurred = ndi.gaussian_filter(aligned, sig)
        for dy in SHIFTS:
            for dx in SHIFTS:
                resampled.append(ornament_signature(ndi.shift(blurred, (dy, dx), order=1)))
    return {
        "reports_source_copy": True,
        "baseline_components_and_holes": exact,
        "nuisance_trials": len(resampled),
        "changed_signatures": sum(value != exact for value in resampled),
        "distinct_signatures": sorted(set(resampled)),
    }


def main():
    repo = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--images", type=Path, default=repo / "resources/liber-primus")
    parser.add_argument("--fixtures", type=Path, default=repo / "im-results")
    parser.add_argument("--signed", type=Path, default=repo / "resources/historical/cicada2016-4gq25.jpg")
    args = parser.parse_args()
    stock = decode_mask(args.fixtures / "lp2-tree-common-stock-mask.b64", STOCK_SHAPE,
                        "a918dfdc5036d78dd9a2bf46552b1c91e7fadb20e0e41e61d9d01b4c10c5a993")[:, ::-1]
    deletion = stock.copy()
    deletion[203:, 74:] = False
    bars = {name: finite_branches(root_only(mask)) for name, mask in (("stock", stock), ("deletion", deletion))}
    assert not right_terminal(bars["stock"], 3)
    assert right_terminal(bars["stock"], 2) and not right_terminal(bars["deletion"], 2)
    p32 = np.maximum(0, 252 - native_sample(args.images / "49.jpg", 49)) / 252
    p55 = np.maximum(0, 252 - native_sample(args.images / "72.jpg", 72)) / 252
    graph_cut = decode_mask(args.fixtures / "lp2-p55-contour-inverse-mask.b64", (192, 199),
                            "ae6cb034b8f55fc24ffcd7389fdfa93ea368c7a8309abb7e23bdfe8a1668080b").astype(float)
    assert hashlib.sha256(args.signed.read_bytes()).hexdigest() == "a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe"
    with Image.open(args.signed) as image:
        signed, valid = signed_blocks(np.asarray(image.convert("RGB"), dtype=float).mean(axis=2))
    controls = {
        name: rendered_controls(mask, p32.shape, p55.shape, signed.shape, valid)
        for name, mask in (("stock", stock), ("deletion", deletion))
    }
    result = {
        "latent_bars": bars,
        "controls": controls,
        "original": {
            "p32": topology_variants(filled_fields(p32, stock, P32)),
            "p55_direct": topology_variants(
                warp(field, STOCK_SHAPE, reg, inverse=True) for reg in P55 for field in contour_fills(p55)
            ),
            "p55_graph_cut": topology_variants(warp(graph_cut, STOCK_SHAPE, reg, inverse=True) for reg in P55),
            "signed_2016": topology_variants(filled_fields(signed, stock, SIGNED, valid)),
        },
        "ornaments": {
            "floral": ornament_control(args.images, (57, 72), (0, 0, 450, 3600)),
            "cuneiform": ornament_control(args.images, (51, 56), (900, 100, 1550, 500)),
        },
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
