"""Source-complete, unregistered RGB mean of the 58 original LP2 scans.

Tests the separate whole-release interpretation of the conditional p50
Bitcoin vanity-address clue 'Meanpng'. No creator intent is asserted.
"""
from __future__ import annotations

import hashlib
import os
from pathlib import Path
import tempfile

from filelock import FileLock
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
OUTPUT = Path(tempfile.gettempdir()) / "lp2-mean58.png"
EXPECTED_RGB_SHA256 = "2b85992cb5b994f2cc6731796bcbd6d46f48e5504e8c57cef0bb1be8dcef5b5b2"


def main() -> None:
    total = np.zeros((3600, 2400, 3), dtype=np.uint16)
    for index in range(17, 75):
        with Image.open(SOURCE / f"{index:02}.jpg") as image:
            pixels = np.asarray(image.convert("RGB"), dtype=np.uint8)
            assert pixels.shape == (3600, 2400, 3), index
            total += pixels

    # Exact nearest-integer channelwise mean, ties upward.
    mean = ((total.astype(np.uint32) + 29) // 58).astype(np.uint8)
    digest = hashlib.sha256(mean.tobytes()).hexdigest()
    assert digest == EXPECTED_RGB_SHA256, digest

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUTPUT) + ".lock"):
        descriptor, name = tempfile.mkstemp(prefix="lp2-mean58-", suffix=".png", dir=OUTPUT.parent)
        os.close(descriptor)
        try:
            Image.fromarray(mean, "RGB").save(name, format="PNG")
            os.replace(name, OUTPUT)
        finally:
            if os.path.exists(name):
                os.unlink(name)
    print(f"PASS: all 58 original LP2 scans; RGB_SHA256={digest}")
    print(f"PNG written: {OUTPUT}")


if __name__ == "__main__":
    main()
