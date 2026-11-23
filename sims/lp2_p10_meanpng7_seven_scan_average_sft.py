"""Exact source-fixed RGB mean of original LP2 pp8-14, with p56 digest check.

Read-only single-file test. Requires Pillow and NumPy.
"""
from __future__ import annotations

from hashlib import sha256, sha512
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
SOURCE_HASHES = (
    "6b1026dfdfb447a5a76819883fe576254e8a47fdf1e97ecf1825166833bc6f00",
    "b8b7ee73d51de45833b36d864cb1c9067432cb4efadcf6c319eaef94d52c929d",
    "1716e282c1d5e8a9ff911c01621e9b195d4728c7fa55ac857176a473eaba3239",
    "26f0cb307a23dcb2adf03a70fb9c6da89746258a90fd9be5383b2757ab4aad30",
    "6961f3f8eedba5b802fee9b40ad91fa604cd4e4394f9ba72853141ad71b19b21",
    "3481daeed3ab2bea6effbe36eec22f74955bce87ca4b4ae8674be1d3f84ea08d",
    "861037ea304b4d3b347cce18d97f25146f6f318cb748e59e6140d9eeaef6abd4",
)
EXPECTED_RGB_SHA256 = "bf4c7d36548536b843d51d60ecb8be335f6231cc200cb8805fd4c4b9a5adc389"
EXPECTED_RGB_SHA512 = (
    "f0702434f12bfaa9b5b503714093cf3e8c7a45e145dbca5e64fffbcd0f10bbb"
    "79a26ab2a63b38300efe105f72b8ccfd9275b901325700d4cfe58bbb8d648faf8"
)
P56_AUTHENTIC_TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)


def main() -> None:
    # Seven authentic JPEG scan images: physical LP2 pages 8..14 = 25.jpg..31.jpg.
    accum = np.zeros((3600, 2400, 3), dtype=np.uint16)
    for index, expected in zip(range(25, 32), SOURCE_HASHES, strict=True):
        original = (SOURCE / f"{index}.jpg").read_bytes()
        assert sha256(original).hexdigest() == expected, f"original scan {index}.jpg changed"
        with Image.open(BytesIO(original)) as source_image:
            image_rgb = np.asarray(source_image.convert("RGB"), dtype=np.uint16)
        assert image_rgb.shape == accum.shape
        accum += image_rgb
        print(f"SOURCE original={index}.jpg sha256={expected}")

    # Nearest-integer RGB mean: divisor seven permits no exact half ties.
    result = ((accum + 3) // 7).astype(np.uint8).tobytes()
    digest256 = sha256(result).hexdigest()
    digest512 = sha512(result).hexdigest()
    assert len(result) == 25_920_000
    assert digest256 == EXPECTED_RGB_SHA256
    assert digest512 == EXPECTED_RGB_SHA512
    assert digest512 != P56_AUTHENTIC_TARGET
    print(f"RGB mean SHA256={digest256}")
    print(f"RGB mean SHA512={digest512}")
    print("p56 original SHA512 preimage match: NO")
    print("PASS: original seven-scan channelwise RGB mean is not p56's hash preimage")


if __name__ == "__main__":
    main()
