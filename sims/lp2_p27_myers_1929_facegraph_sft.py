"""Compare actual Myers 1929 Figs 16–18 with the original p27 dual graph.

Input artifact: run 45918639865, artifact 15163084209 (download ZIP).
The candidate crops were selected visually from the complete Fig 16–18
drawings on the printed 48–49 spread (PDF index 4), before scoring.
Labels, dotted lines and the ambient border can create extra components.
Therefore a negative is an extraction-conditioned gate, not a universal redraw exclusion.
"""
import argparse
import hashlib
import json
import zipfile
from collections import Counter
from pathlib import Path
import cv2
import networkx as nx
import numpy as np
from scipy.ndimage import distance_transform_edt

THRESHOLDS = (80, 100, 120, 140, 160, 180, 200)
CROPS = {
    "fig16": (110, 270, 660, 480),
    "fig17": (140, 670, 600, 850),
    "fig18": (840, 210, 1395, 425),
}
ORIGINAL_HASH = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"

def graph(image, threshold):
    n, labels, stats, centers = cv2.connectedComponentsWithStats(
        (image >= threshold).astype(np.uint8), connectivity=8)
    outside = set(np.concatenate((labels[0], labels[-1], labels[:, 0], labels[:, -1])))
    cells = sorted((i for i in range(1, n) if i not in outside and
                    200 < stats[i, 4] < 70000), key=lambda i: centers[i, 0])
    k = len(cells)
    face = np.zeros(labels.shape, np.int32)
    for j, i in enumerate(cells, 1):
        face[labels == i] = j
    dist, indices = distance_transform_edt(face == 0, return_indices=True)
    nearest = face[tuple(indices)]
    nearest[dist > 12] = 0
    borders = Counter()
    base = k + 1
    for a, b in ((nearest[:-1, :], nearest[1:, :]), (nearest[:, :-1], nearest[:, 1:])):
        mask = (a > 0) & (b > 0) & (a != b)
        keys, counts = np.unique(np.minimum(a[mask], b[mask]) * base +
                                 np.maximum(a[mask], b[mask]), return_counts=True)
        borders.update({(int(x) // base, int(x) % base): int(y) for x, y in zip(keys, counts)})
    g = nx.Graph()
    g.add_nodes_from(range(1, k + 1))
    g.add_edges_from(pair for pair, count in borders.items() if count >= 40)
    return g

def normalize(image):
    h, w = image.shape
    return cv2.copyMakeBorder(cv2.resize(image, (1144, round(h * 1144 / w))),
                              40, 40, 40, 40, cv2.BORDER_CONSTANT, value=255)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("artifact", type=Path)
    parser.add_argument("--original", type=Path, default=Path("resources/liber-primus/44.jpg"))
    args = parser.parse_args()
    raw = args.original.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == ORIGINAL_HASH
    native = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)[470:895, 590:1840]
    refs = [graph(native, t) for t in THRESHOLDS]
    assert [(len(g), g.number_of_edges()) for g in refs] == [
        (15,25),(15,25),(15,24),(15,24),(15,24),(15,25),(15,25)]
    assert nx.is_isomorphic(graph(cv2.flip(native,1),120), refs[2])
    with zipfile.ZipFile(args.artifact) as z:
        raster = z.read("myers1929-pdf-index-4.png")
    image = cv2.imdecode(np.frombuffer(raster, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image.shape == (1152,1456)
    output = {"raster_sha256": hashlib.sha256(raster).hexdigest(), "candidates": {}}
    for name, (x0,y0,x1,y1) in CROPS.items():
        candidate = normalize(image[y0:y1,x0:x1])
        rows = []
        for t in THRESHOLDS:
            g = graph(candidate,t)
            rows.append({"threshold":t, "faces":len(g), "edges":g.number_of_edges(),
                         "isomorphic":any(nx.is_isomorphic(g,r) for r in refs)})
        output["candidates"][name] = {"bbox":[x0,y0,x1,y1], "rows":rows}
    print(json.dumps(output,indent=2))

if __name__ == "__main__":
    main()
