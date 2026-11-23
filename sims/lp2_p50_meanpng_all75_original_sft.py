"""Exact full-book RGB mean of original LP1+LP2 images (00.jpg–74.jpg).

The conditional printed-table Bitcoin address 1Meanpng… suggests a
literal 'mean PNG' receiver. Earlier tests covered p40–55 and p17–74.
This tests the remaining naturally complete source set: all 75 images.
Classification: no creator-selected key or recovered plaintext.
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
OUTPUT = Path(tempfile.gettempdir()) / "lp2-mean75-original.png"

EXPECTED_RGB_SHA256 = "0d2bc14a476c2509c69baa5df1b4c8210ed99fc81f7868b29de30cf7170a505a"
EXPECTED_RGB_SHA512 = "738ad4d64761bec51fc6f9e310a23717eb9dd32e7e9c5570ce5e6a15d8bbdf2312200f56ef91f87d14a228fb6ece41602bc5021bced33246d9da7ea545c6fce8"
ORIGINAL_P56_SHA512 = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"


def main() -> None:
    total = np.zeros((3600, 2400, 3), dtype=np.uint16)
    for index in range(75):
        with Image.open(SOURCE / f"{index:02d}.jpg") as image:
            pixels = np.asarray(image.convert("RGB"), dtype=np.uint8)
            assert pixels.shape == (3600, 2400, 3), index
            total += pixels

    # Round the exact equal-weight RGB channel mean to the nearest integer.
    # Since 75 is odd, no sum / 75 has an exact half-integer tie.
    mean = ((total.astype(np.uint32) + 37) // 75).astype(np.uint8)
    rgb = mean.tobytes()
    digest256 = hashlib.sha256(rgb).hexdigest()
    digest512 = hashlib.sha512(rgb).hexdigest()
    assert digest256 == EXPECTED_RGB_SHA256, digest256
    assert digest512 == EXPECTED_RGB_SHA512, digest512
    assert digest512 != ORIGINAL_P56_SHA512

    with FileLock(str(OUTPUT) + ".lock"):
        descriptor, tmp = tempfile.mkstemp(
            prefix="lp2-mean75-", suffix=".png", dir=OUTPUT.parent
        )
        os.close(descriptor)
        try:
            Image.fromarray(mean, "RGB").save(tmp, format="PNG")
            os.replace(tmp, OUTPUT)
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)

    print(f"PASS: all 75 original Liber Primus JPGs; RGB_SHA256={digest256}")
    print(f"RGB_SHA512={digest512}; p56_original_hash_match=False")
    print(f"Unmodified RGB mean PNG: {OUTPUT}")


if __name__ == "__main__":
    main()
