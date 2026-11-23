"""Reproduce the exact seven-tree-page native RGB mean with no output writes.

Requires Pillow and NumPy. Uses untouched original archive 25.jpg..31.jpg.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

import numpy as np
from PIL import Image


def main() -> None:
    resources = Path(__file__).resolve().parent.parent / "resources" / "liber-primus"
    names = [resources / f"{n:02d}.jpg" for n in range(25, 32)]
    images: list[np.ndarray] = []
    for name in names:
        with Image.open(name) as im:
            arr = np.asarray(im.convert("RGB"), dtype=np.uint8)
            assert arr.shape == (3600, 2400, 3), (name, arr.shape)
            images.append(arr)
    stack = np.stack(images).astype(np.uint16)
    common = np.all(stack == stack[0], axis=(0, 3))
    mean = ((stack.sum(axis=0, dtype=np.uint32) + 3) // 7).astype(np.uint8)
    digest = hashlib.sha256(mean.tobytes()).hexdigest()
    assert int(common.sum()) == 6_412_242, int(common.sum())
    assert digest == "bf4c7d36548536b843d51d60ecb8be335f6231cc200cb8805fd4c4b9a5adc389", digest
    print("Original seven scanned pages:", ", ".join(p.name for p in names))
    print("Pixel-identical positions:", int(common.sum()), "/", common.size)
    print("Seven-image mean RGB SHA-256:", digest)
    print("PASS: exact literal original-source tree7 mean. No unknown plaintext recovered.")


if __name__ == "__main__":
    main()
