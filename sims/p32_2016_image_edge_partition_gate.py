#!/usr/bin/env python3
"""Locked test of the p32 edge-vector partition against the 2016 4gq25 image."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image

IMAGE = Path("resources/historical/cicada2016-4gq25.jpg")
EXPECTED_GIT_BLOB = "22027296dcd7df53c5127e6aadbabeaf3223f72d"
TOP_ROW_WIDTHS = np.array([73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79], dtype=np.int64)
FIRST_COLUMN_HEIGHTS = np.array([73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7], dtype=np.int64)
THRESHOLD = 128
N_PERMUTATIONS = 100_000
SEED = 3301


def git_blob_sha1(raw: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(raw)).encode("ascii") + b"\0" + raw).hexdigest()


def edges_from_lengths(lengths: np.ndarray) -> np.ndarray:
    return np.cumsum(lengths)[:-1]


def boundary_scores(projection: np.ndarray) -> np.ndarray:
    # Edge b lies between pixels b-1 and b; score both adjacent columns/rows.
    return (projection[:-1] + projection[1:]) / 2.0


def score_edges(edge_score: np.ndarray, edges: np.ndarray) -> float:
    return float(np.mean(edge_score[edges - 1]))


def main() -> None:
    raw = IMAGE.read_bytes()
    blob = git_blob_sha1(raw)
    if len(raw) != 26342 or blob != EXPECTED_GIT_BLOB:
        raise SystemExit(f"wrong source image: bytes={len(raw)} git_blob={blob}")
    image = Image.open(IMAGE).convert("L")
    width, height = image.size
    if (width, height) != (563, 569):
        raise SystemExit(f"wrong image dimensions: {(width, height)}")
    if int(TOP_ROW_WIDTHS.sum()) != width or int(FIRST_COLUMN_HEIGHTS.sum()) != height:
        raise SystemExit("edge-vector sums do not match source image dimensions")

    gray = np.asarray(image, dtype=np.uint8)
    ink = gray >= THRESHOLD
    x_projection = ink.mean(axis=0)
    y_projection = ink.mean(axis=1)
    x_edge_score = boundary_scores(x_projection)
    y_edge_score = boundary_scores(y_projection)
    x_edges = edges_from_lengths(TOP_ROW_WIDTHS)
    y_edges = edges_from_lengths(FIRST_COLUMN_HEIGHTS)
    actual_x = score_edges(x_edge_score, x_edges)
    actual_y = score_edges(y_edge_score, y_edges)
    actual_joint = (actual_x + actual_y) / 2.0

    rng = np.random.default_rng(SEED)
    null_x = np.empty(N_PERMUTATIONS, dtype=np.float64)
    null_y = np.empty(N_PERMUTATIONS, dtype=np.float64)
    for i in range(N_PERMUTATIONS):
        null_x[i] = score_edges(x_edge_score, edges_from_lengths(rng.permutation(TOP_ROW_WIDTHS)))
        null_y[i] = score_edges(y_edge_score, edges_from_lengths(rng.permutation(FIRST_COLUMN_HEIGHTS)))
    null_joint = (null_x + null_y) / 2.0

    def summary(actual: float, null: np.ndarray) -> dict:
        return {
            "actual_mean_ink_fraction": actual,
            "permutation_mean": float(null.mean()),
            "permutation_sd": float(null.std(ddof=1)),
            "lower_tail_p": float((1 + np.count_nonzero(null <= actual)) / (len(null) + 1)),
            "percentile": float((1 + np.count_nonzero(null <= actual)) / (len(null) + 1)),
            "n": int(len(null)),
        }

    # The 11x11 cell occupancy is diagnostic only; the predeclared decision
    # statistic is boundary ink fraction against same-length permutation nulls.
    x_bounds = np.concatenate(([0], x_edges, [width]))
    y_bounds = np.concatenate(([0], y_edges, [height]))
    cell_ink = np.zeros((11, 11), dtype=np.float64)
    for row in range(11):
        for col in range(11):
            patch = ink[y_bounds[row]:y_bounds[row + 1], x_bounds[col]:x_bounds[col + 1]]
            cell_ink[row, col] = float(patch.mean()) if patch.size else float("nan")

    result = {
        "source": {
            "path": str(IMAGE),
            "bytes": len(raw),
            "git_blob_sha1": blob,
            "sha512": hashlib.sha512(raw).hexdigest(),
            "dimensions": [width, height],
        },
        "frozen_parameters": {
            "top_row_widths": TOP_ROW_WIDTHS.tolist(),
            "first_column_heights": FIRST_COLUMN_HEIGHTS.tolist(),
            "x_edges": x_edges.tolist(),
            "y_edges": y_edges.tolist(),
            "threshold": THRESHOLD,
            "permutations": N_PERMUTATIONS,
            "seed": SEED,
            "null": "independent random permutations of the exact width/height multisets",
        },
        "scores": {
            "x": summary(actual_x, null_x),
            "y": summary(actual_y, null_y),
            "joint": summary(actual_joint, null_joint),
        },
        "cell_ink_fraction": np.round(cell_ink, 3).tolist(),
    }
    print(json.dumps(result, indent=2))
    print("DECISION: " + (
        "EDGE_ALIGNMENT_SIGNAL" if result["scores"]["joint"]["lower_tail_p"] <= 0.01
        else "NO_EDGE_ALIGNMENT_SIGNAL"
    ))


if __name__ == "__main__":
    main()
