"""Original-image p27 wing-face topology and bounded 15-cell transport SFT.

Read-only. Requires numpy, scipy and opencv-python. Run from a checkout of
FlareZ123/liber-primus with original resources/liber-primus/44.jpg and
lp2-corpus.json present. No cipher key or unknown plaintext is presumed.
"""
from __future__ import annotations

from collections import Counter
from functools import lru_cache
from hashlib import sha256
from pathlib import Path

import cv2
import numpy as np
from scipy.ndimage import distance_transform_edt
import json

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "44.jpg"
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
SHA256 = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"
N = 15
THRESHOLDS = (80, 100, 120, 140, 160, 180, 200)
EXPECTED_PATHS = (
    (1, 2, 5, 7, 4, 3, 6, 8, 11, 12, 9, 14, 10, 13, 15),
    (1, 2, 5, 7, 4, 3, 6, 8, 11, 12, 14, 9, 10, 13, 15),
    (1, 2, 5, 7, 4, 3, 9, 6, 8, 11, 12, 14, 10, 13, 15),
    (1, 2, 5, 7, 4, 8, 11, 6, 3, 9, 12, 14, 10, 13, 15),
)


def source_graph(crop: np.ndarray, threshold: int) -> tuple[list[tuple[int, int]], list[tuple[int, int]]]:
    black = crop < threshold
    n, labels, stats, centers = cv2.connectedComponentsWithStats(
        (~black).astype(np.uint8), connectivity=8
    )
    cells = sorted(
        (i for i in range(1, n) if 200 < int(stats[i, cv2.CC_STAT_AREA]) < 70000),
        key=lambda i: float(centers[i, 0]),
    )
    assert len(cells) == N, (threshold, "face count", len(cells))
    face = np.zeros(labels.shape, dtype=np.int16)
    for number, label in enumerate(cells, start=1):
        face[labels == label] = number
    dist, indices = distance_transform_edt(face == 0, return_indices=True)
    nearest = face[tuple(indices)]
    nearest[dist > 12] = 0

    borders: Counter[tuple[int, int]] = Counter()
    for a, b in ((nearest[:-1, :], nearest[1:, :]),
                 (nearest[:, :-1], nearest[:, 1:])):
        selected = (a > 0) & (b > 0) & (a != b)
        pairs = np.minimum(a[selected], b[selected]) * 16 + np.maximum(a[selected], b[selected])
        keys, counts = np.unique(pairs, return_counts=True)
        borders.update({(int(k) // 16, int(k) % 16): int(c) for k, c in zip(keys, counts)})
    # The 40-pixel shared-interface threshold drops incidental point contacts.
    edges = sorted(pair for pair, count in borders.items() if count >= 40)
    positions = [(int(round(centers[i, 0] + 590)),
                  int(round(centers[i, 1] + 470))) for i in cells]
    return edges, positions


def graph_paths(edges: list[tuple[int, int]]) -> list[tuple[int, ...]]:
    adjacent: dict[int, set[int]] = {n: set() for n in range(1, N + 1)}
    for a, b in edges:
        adjacent[a].add(b)
        adjacent[b].add(a)
    routes: list[tuple[int, ...]] = []

    def visit(current: int, path: tuple[int, ...], used: int) -> None:
        if len(path) == N:
            if current == N:
                routes.append(path)
            return
        for neighbor in sorted(adjacent[current]):
            if used & (1 << (neighbor - 1)) == 0:
                visit(neighbor, path + (neighbor,), used | (1 << (neighbor - 1)))

    visit(1, (1,), 1)
    return routes


def encode(plaintext: list[int], path: tuple[int, ...]) -> list[int]:
    out: list[int] = []
    for offset in range(0, len(plaintext), N):
        block = plaintext[offset:offset + N]
        if len(block) < N:
            out.extend(block)  # explicitly chosen illustrative tail rule
            break
        cells = [0] * N
        for rune, cell in zip(block, path):
            cells[cell - 1] = rune
        out.extend(cells)
    return out


def decode(ciphertext: list[int], path: tuple[int, ...]) -> list[int]:
    out: list[int] = []
    for offset in range(0, len(ciphertext), N):
        block = ciphertext[offset:offset + N]
        out.extend([block[cell - 1] for cell in path] if len(block) == N else block)
    return out


def ioc(indices: list[int]) -> float:
    counts = Counter(indices)
    return sum(count * (count - 1) for count in counts.values()) / (
        len(indices) * (len(indices) - 1)
    )


def main() -> None:
    assert sha256(IMAGE.read_bytes()).hexdigest() == SHA256
    original = cv2.imread(str(IMAGE), cv2.IMREAD_GRAYSCALE)
    assert original.shape == (3600, 2400)
    crop = original[470:895, 590:1840]
    for threshold in THRESHOLDS:
        edges, centers = source_graph(crop, threshold)
        paths = sorted(graph_paths(edges))
        assert paths == sorted(EXPECTED_PATHS), (threshold, paths)
        print(f"pixel threshold {threshold}: cells 15, graph edges {len(edges)}, basal-to-tip full paths {len(paths)}")
        if threshold == 120:
            assert len(edges) == 24
            print("original 120-threshold cell centroids:", centers)
            for path in paths:
                print("  possible route:", "-".join(map(str, path)))

    pages = {int(page["page"]): page for page in json.loads(CORPUS.read_text(encoding="utf-8"))["pages"]}
    unknown = [int(index) for page in range(27, 33) for index in pages[page]["indices"]]
    solved = [int(index) for index in pages[57]["indices"]]
    assert len(unknown) == 1433 and len(solved) == 95
    assert len(unknown) % N == 8
    assert abs(ioc(unknown) - 0.03418620154615663) < 1e-13
    assert abs(ioc(solved) - 0.06270996640537514) < 1e-13
    for path in EXPECTED_PATHS:
        planted = encode(solved, path)
        assert planted != solved
        assert decode(planted, path) == solved
        result = decode(unknown, path)
        assert encode(result, path) == unknown
        assert Counter(result) == Counter(unknown)
        assert abs(ioc(result) - ioc(unknown)) < 1e-13
    print(f"authentic solved-p57 plants: {len(EXPECTED_PATHS)}/4 exact inverses")
    print(f"original p27..32: {len(unknown)} runes, tail 8; all graph-only decodes preserve IoC {ioc(unknown):.14f}")
    print(f"authentic clear p57 GP29 IoC: {ioc(solved):.14f}")
    print("DECISION: geometric path is nonunique, and this source-only transposition cannot explain original symbol frequencies; no plaintext/key was recovered")


if __name__ == "__main__":
    main()
