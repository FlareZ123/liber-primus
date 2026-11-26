"""#2967: compare exact 2010 source SVG with original LP2 cuneiform stamp.
Usage: python sims/lp2_cuneiform_svg_similarity.py liber-primus-jpegs.zip
Dependencies: numpy scipy Pillow opencv-python cairosvg.
"""
import hashlib, io, json, math, re, sys, zipfile
from pathlib import Path
import xml.etree.ElementTree as ET
import cairosvg
import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects
from scipy.optimize import differential_evolution

D = 4
GROUPS = [
    ("17_tens", ["path3673"], 4),
    ("17_units", ["path3849", "path3851", "path3853"], 2),
    ("13_tens", ["path3869"], 3),
    ("13_units", ["path3801", "path3803", "path3805"], 1),
    ("55_tens", ["path6745", "path6749", "path6751", "path6753", "path6755"], 7),
    ("55_units", ["path6425", "path6427", "path6429"], 9),
    ("1", ["path2828"], 8),
]
DIGITS = [("17", [0, 1]), ("13", [2, 3]), ("55", [4, 5]), ("1", [6])]


def get_paths(svg_bytes):
    assert len(svg_bytes) == 220819
    assert hashlib.sha1(svg_bytes).hexdigest() == "4a117a94d010e658cf0f8bc8a04830a51874e453"
    selected = {p for _, ids, _ in GROUPS for p in ids}
    data, raw = [], {}

    def walk(el, x=0., y=0.):
        if "transform" in el.attrib:
            m = re.fullmatch(r"translate\(([^)]+)\)", el.attrib["transform"])
            assert m
            dx, dy = map(float, re.split(r"[, ]+", m.group(1)))
            x += dx
            y += dy
        if el.tag.endswith("}path") and el.attrib.get("id") in selected:
            name, d = el.attrib["id"], el.attrib["d"]
            raw[name] = d
            assert "stroke-width:3;" in el.attrib["style"]
            # Match the locally executed extracted-path precision.
            d = re.sub(r"-?\d+\.\d+", lambda m: str(round(float(m.group(0)), 3)), d)
            data.append((name, round(x, 5), round(y, 5), d))
        for child in el:
            walk(child, x, y)

    walk(ET.fromstring(svg_bytes))
    assert len(data) == len(selected)
    assert raw["path3673"].split(" ", 2)[2] == raw["path3869"].split(" ", 2)[2]
    return data


def crop(mask):
    y, x = np.where(mask)
    return mask[y.min():y.max()+1, x.min():x.max()+1].astype(np.uint8)


def source(data, ids):
    paths = "".join(f'<path transform="translate({x},{y})" d="{d}"/>'
                    for name, x, y, d in data if name in ids)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="806" height="478"'
           ' viewBox="0 0 806 478"><g fill="none" stroke="black" stroke-width="3"'
           ' stroke-linecap="round" stroke-linejoin="miter">' + paths + '</g></svg>')
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=806*D, output_height=478*D)
    return crop(np.array(Image.open(io.BytesIO(png)))[:, :, 3] > 127)


def rotate_scale(src, angle, scale):
    h, w = src.shape
    size = int(math.ceil(math.hypot(h, w)*scale))+8
    mat = cv2.getRotationMatrix2D(((w-1)/2, (h-1)/2), angle, scale)
    mat[:, 2] += [(size-w)/2, (size-h)/2]
    return crop(cv2.warpAffine(src, mat, (size, size), flags=cv2.INTER_NEAREST))


def max_iou(src, tgt, angle, scale):
    p = rotate_scale(src, angle, scale)
    h, w = p.shape
    canvas = np.pad(tgt, ((h, h), (w, w)))
    inter = int(round(cv2.matchTemplate(canvas.astype(np.float32),
                       p.astype(np.float32), cv2.TM_CCORR).max()))
    return inter / (int(p.sum()) + int(tgt.sum()) - inter)


def optimize(pairs):
    def objective(x):
        return -sum(max_iou(s, t, *x) for s, t in pairs)/len(pairs)
    r = differential_evolution(objective, [(-75, 75), (.45, 1.7)],
        seed=91, popsize=10, maxiter=60, tol=.00005, polish=False)
    return dict(angle=float(r.x[0]), scale=float(r.x[1])*D,
        mean_iou=float(-r.fun), ious=[max_iou(s, t, *r.x) for s, t in pairs])


def run(zip_path, svg_path):
    data = get_paths(svg_path.read_bytes())
    with zipfile.ZipFile(zip_path) as z:
        pages = {p: np.array(Image.open(io.BytesIO(z.read(
            f"liber-primus-jpegs/{p}.jpg"))).convert("L")) for p in [50, 51]}
    l, _ = label(pages[51][130:600, 960:1440] < 128, np.ones((3, 3)))
    def target(ids):
        return crop(np.isin(l, ids))
    assert [int(target([lab]).sum()) for _, _, lab in GROUPS] == [2528,8756,1726,3070,6228,5548,1538]
    comps = [(source(data, ids), target([lab])) for _, ids, lab in GROUPS]
    digits = []
    for _, ix in DIGITS:
        ids = sum([GROUPS[i][1] for i in ix], [])
        labs = [GROUPS[i][2] for i in ix]
        digits.append((source(data, ids), target(labs)))
    out = {name: optimize([pair]) for (name, _, _), pair in zip(GROUPS, comps)}
    out["shared_components"] = optimize(comps)
    out.update({"digit_"+name: optimize([pair]) for (name, _), pair in zip(DIGITS, digits)})
    out["shared_digits"] = optimize(digits)
    plants = [(s, np.pad(rotate_scale(s, 22, 1.15), ((9, 5), (7, 13)))) for s, t in comps]
    out["copy_control_at_truth"] = [max_iou(s, t, 22, 1.15) for s, t in plants]
    out["copy_control_fit"] = optimize(plants)
    assert out["copy_control_at_truth"] == [1]*7
    out["threshold_tens"] = []
    for p, ylo, yhi in [(50, 3000, 3460), (51, 130, 600)]:
        for threshold in [64, 128, 192]:
            lbl, _ = label(pages[p][ylo:yhi, 960:1440] < threshold, np.ones((3, 3)))
            top = []
            for i, b in enumerate(find_objects(lbl)):
                m = (lbl[b] == i+1).astype(np.uint8)
                if m.sum() > 100 and b[0].start < 230:
                    top.append((b[1].start, m))
            top.sort(key=lambda v: v[0])
            a, b = top[0][1], top[2][1]
            out["threshold_tens"].append(dict(page=p, threshold=threshold,
                area_ratio=float(a.sum()/b.sum()), iou=max_iou(a, b, 0, 1)))
    return out


if __name__ == "__main__":
    svg = Path(__file__).resolve().parents[1] / "resources/external/babylonian_numerals_2010.svg"
    print(json.dumps(run(Path(sys.argv[1]), svg), indent=2))
