#!/usr/bin/env python3
"""Original JPEG chroma residual control, following the source DCT gate.

Distinguish page-native RGB JPEG encoding from actual visible red ink and
test exact copied chroma residue. Uses unchanged archive JPEG bytes.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

import cv2
import numpy as np

SHA = {
    17: "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
    18: "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f",
    21: "72bea2bfcd4f1b8e2095f882811d0f294e329d4b1bfe68f8ed5ec726d0a1e9d6",
    22: "bcef0a3b80532b25a013052ec4394ab47ab69ce675b5b3db59cbad044e7adabd",
    26: "b8b7ee73d51de45833b36d864cb1c9067432cb4efadcf6c319eaef94d52c929d",
    27: "1716e282c1d5e8a9ff911c01621e9b195d4728c7fa55ac857176a473eaba3239",
    28: "26f0cb307a23dcb2adf03a70fb9c6da89746258a90fd9be5383b2757ab4aad30",
    29: "6961f3f8eedba5b802fee9b40ad91fa604cd4e4394f9ba72853141ad71b19b21",
    30: "3481daeed3ab2bea6effbe36eec22f74955bce87ca4b4ae8674be1d3f84ea08d",
    51: "6f1b4c04b64ee54c689478bd3986bb6ab8a3b81f48780562094e9f248e4e87f8",
    52: "d713dd913d9b835ac61f298e8c0855f5093599e348edaedef964710db8664afa",
}
# Archive JPEG indices, corresponding to physical LP2 index n-17.
# Expected number of RGB-chromatic residue pixels.
GROUPS = [
    ((18,), 0),
    ((21, 22), 43),
    ((26, 28, 30), 1277),
    ((27, 29), 1462),
    ((51, 52), 759),
]


def original(base: Path, n: int) -> np.ndarray:
    path = base / f"{n:02}.jpg"
    assert hashlib.sha256(path.read_bytes()).hexdigest() == SHA[n], path
    image = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    assert image is not None and image.shape == (3600, 2400, 3), path
    return image


def delta(image: np.ndarray) -> np.ndarray:
    pixels = image.astype(np.int16)
    blue, green, red = (pixels[:, :, i] for i in range(3))
    return np.stack((blue - green, red - green), axis=0)


def main() -> None:
    base = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("resources/liber-primus")
    groups = []
    for ids, expected in GROUPS:
        deltas = [delta(original(base, n)) for n in ids]
        mask = np.any(deltas[0] != 0, axis=0)
        assert int(mask.sum()) == expected, (ids, int(mask.sum()))
        assert all(np.array_equal(deltas[0], item) for item in deltas[1:]), ids
        max_deviation = int(np.abs(deltas[0]).max())
        assert max_deviation <= 5, ids
        groups.append({"archives": list(ids), "physical_lp2_pages": [n - 17 for n in ids],
                       "exact_residual_pixels": expected,
                       "chroma_delta_pixel_identical": True,
                       "maximum_channel_deviation": max_deviation})
    red_page = original(base, 17).astype(np.int16)
    n_red = int(np.count_nonzero((red_page[:, :, 2] > red_page[:, :, 1] + 40)
                                 & (red_page[:, :, 2] > red_page[:, :, 0] + 40)
                                 & (red_page[:, :, 2] > 90)))
    assert n_red == 60278, n_red
    print(json.dumps({
        "original_sha_pinned": list(SHA),
        "color_JPEG_without_actual_visible_color_groups": groups,
        "true_red_content_control": {"archive": 17, "red_pixels": n_red},
        "inference": "RGB export can retain copied near-neutral chroma masks. This does not prove or disprove all steganography or select a payload."
    }, indent=2))


if __name__ == "__main__":
    main()
