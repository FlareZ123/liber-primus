"""Fixed three-image 2014 Stage10 -> RGB mean PNG original-source gate.

The historically bundled /107.jpg, /167.jpg and /229.jpg are archive JPEG
14.jpg, 15.jpg and 16.jpg. Their grouping comes from the contemporaneous
2014 post-magic-square HTML. The speculative Meanpng instruction comes
from a separate p50 Bitcoin address; no signed source links them.

Executed on original 2400x3600 JPEGs. No image subset, alignment, colors,
thresholds, detector or post-result enhancement is selected.
"""
from __future__ import annotations

from hashlib import sha256, sha512
from pathlib import Path
import os
import tempfile

from filelock import FileLock
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
TARGET = Path(tempfile.gettempdir()) / "lp2-stage10-three-mean.png"
ORIGINAL_SHA256 = {
    14: "de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e",
    15: "f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9",
    16: "984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe",
}
EXPECTED_RGB_SHA256 = "df08c1b7645d7c6d50c7aedd51d43ca58c5a44dc13893707e64ad887dc0b636b"
EXPECTED_RGB_SHA512 = "665f4ec3c0fac340bc5ad2b03f5b5e95202e79cc1cb80ad9f5307a50300f86dd02e0b514c0d216f07d1631e3479e0e8a08020b0587001037f35a0f7f310bf097"
PAGE56_HASH = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"


def main() -> None:
    original = []
    for index in (14, 15, 16):
        file = SOURCE / f"{index:02}.jpg"
        assert sha256(file.read_bytes()).hexdigest() == ORIGINAL_SHA256[index]
        with Image.open(file) as image:
            pix = np.asarray(image.convert("RGB"), dtype=np.uint8)
            assert pix.shape == (3600, 2400, 3)
            original.append(pix)

    total = np.zeros_like(original[0], dtype=np.uint16)
    for image in original:
        total += image
    mean = ((total + 1) // 3).astype(np.uint8)
    assert sha256(mean.tobytes()).hexdigest() == EXPECTED_RGB_SHA256
    assert sha512(mean.tobytes()).hexdigest() == EXPECTED_RGB_SHA512
    assert EXPECTED_RGB_SHA512 != PAGE56_HASH

    shared = np.all(original[0] == original[1], axis=2) & np.all(
        original[1] == original[2], axis=2
    )
    assert int(shared.sum()) == 7_541_879

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(TARGET) + ".lock"):
        handle, tmp = tempfile.mkstemp(
            prefix="lp2-stage10-three-", suffix=".png", dir=TARGET.parent
        )
        os.close(handle)
        try:
            Image.fromarray(mean).save(tmp, format="PNG")
            os.replace(tmp, TARGET)
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)
    print("PASS Stage10 complete 3-original 2014 JPEG mean")
    print("Original equal RGB positions: 7541879 / 8640000")
    print("Mean RGB SHA256:", EXPECTED_RGB_SHA256)
    print("Mean RGB SHA512:", EXPECTED_RGB_SHA512)
    print("Unmodified output:", TARGET)


if __name__ == "__main__":
    main()
