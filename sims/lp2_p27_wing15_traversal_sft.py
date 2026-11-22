"""Original p27 wing: a 15-face proximity graph does not fix a traversal.

Requires NumPy, SciPy and OpenCV. Uses unmodified resources/liber-primus/44.jpg.
A source-pixel proximity graph is NOT a physical shared-vein or taxonomy graph.
No candidate plaintext, cipher, or historical key is claimed.
"""
from functools import lru_cache
from hashlib import sha256
from pathlib import Path

import cv2
import numpy as np
from scipy.ndimage import label
from scipy.spatial import cKDTree

SOURCE = Path(__file__).resolve().parents[1] / "resources/liber-primus/44.jpg"
EXPECTED_SHA = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"
X0, X1, Y0, Y1 = 520, 1940, 450, 930
THRESHOLD, MIN_AREA, MIN_NEAR_SAMPLES = 160, 200, 25


def get_faces():
    raw = SOURCE.read_bytes()
    assert sha256(raw).hexdigest() == EXPECTED_SHA, "Unexpected source JPEG"
    image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image.shape == (3600, 2400)
    region = image[Y0:Y1, X0:X1]
    components, count = label(region > THRESHOLD, structure=np.ones((3, 3), dtype=bool))
    sizes = np.bincount(components.ravel())
    boundary = set(np.concatenate((components[0], components[-1],
                                   components[:, 0], components[:, -1])))
    faces = []
    for component in range(1, count + 1):
        if component in boundary or sizes[component] < MIN_AREA:
            continue
        y, x = np.nonzero(components == component)
        contours, _ = cv2.findContours(
            (components == component).astype(np.uint8), cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_NONE
        )
        outline = max(contours, key=cv2.contourArea)[:, 0, :]
        faces.append({
            "centroid": (round(X0 + x.mean()), round(Y0 + y.mean())),
            "area": int(sizes[component]),
            "outline": outline,
            "tree": cKDTree(outline),
        })
    faces.sort(key=lambda face: face["centroid"][0])
    assert len(faces) == 15
    assert faces[6]["centroid"] == (1231, 839) and faces[6]["area"] == 344
    return faces


def near_graph(faces, radius):
    """A declared contour-distance proxy, not actual vein-sharing topology."""
    adjacency = [set() for _ in faces]
    for i, a in enumerate(faces):
        for j in range(i + 1, len(faces)):
            b = faces[j]
            near_a = np.count_nonzero(b["tree"].query(a["outline"])[0] <= radius)
            near_b = np.count_nonzero(a["tree"].query(b["outline"])[0] <= radius)
            if near_a >= MIN_NEAR_SAMPLES and near_b >= MIN_NEAR_SAMPLES:
                adjacency[i].add(j)
                adjacency[j].add(i)
    return adjacency


def count_paths(adjacency, end=None):
    """Directed Hamiltonian paths; with end, fix first/last x-extreme faces."""
    count = len(adjacency)
    all_visited = (1 << count) - 1

    @lru_cache(None)
    def walk(mask, last):
        if mask == all_visited:
            return int(end is None or last == end)
        return sum(walk(mask | (1 << nxt), nxt) for nxt in adjacency[last]
                   if not mask & (1 << nxt))

    starts = range(count) if end is None else (0,)
    return sum(walk(1 << start, start) for start in starts)


def main():
    assert count_paths([{1}, {0, 2}, {1}]) == 2
    assert count_paths([{1, 2}, {0, 2}, {0, 1}]) == 6
    assert count_paths([{1}, {0, 2}, {1}], end=2) == 1

    faces = get_faces()
    print("SOURCE", EXPECTED_SHA)
    print("FACE CENTROIDS / AREAS", [
        (i + 1, f["centroid"], f["area"]) for i, f in enumerate(faces)
    ])
    for radius, expected_all, expected_anchored in (
        (16, 40, 4), (20, 54, 4), (24, 144, 6)
    ):
        graph = near_graph(faces, radius)
        edges = sum(map(len, graph)) // 2
        paths = count_paths(graph)
        anchored = count_paths(graph, end=14)
        print(f"radius {radius}: edges {edges}, paths {paths}, root-tip paths {anchored}")
        assert (paths, anchored) == (expected_all, expected_anchored)
    print("PASS: no unique 15-face order selected by this source-pixel proxy")


if __name__ == "__main__":
    main()
