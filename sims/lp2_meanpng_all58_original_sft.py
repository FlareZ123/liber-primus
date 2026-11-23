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
EXPECTED_RGB_SHA256 = "2b8592cb5b994f2cc6731796bcbd6d46f48e5504e8c57cef0bb1be8dcef5b5b2"
EXPECTED_RGB_SHA512 = "681185483d44050790deb4d31ab2d96c565dc6736130d2410f5c91ae7cca3967976fd80f6f1df79497ab091d23f47fc8ea2656b93ee04ac35fdf3cf9c42dd414"
SOURCE_P56_SHA512 = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"


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
    digest512 = hashlib.sha512(mean.tobytes()).hexdigest()
    assert digest512 == EXPECTED_RGB_SHA512, digest512
    assert digest512 != SOURCE_P56_SHA512

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
    print(f"RGB_SHA512={digest512}; p56_original_hash_match=False")
    print(f"PNG written: {OUTPUT}")


if __name__ == "__main__":
    main()
