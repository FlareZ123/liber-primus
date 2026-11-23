"""SHA-512 of the three already source-frozen Meanpng output *files*.

The original p50 conditional Bitcoin address starts `1Meanpng`; earlier
original-image SFTs computed mean RGB byte hashes but not encoded PNG hashes.
This SFT consumes exactly their three existing image groups and encoder options,
with no image-group search, compression sweep, or post-hoc image registration.

Run with Python 3, Pillow and NumPy:
    python sims/lp2_p50_meanpng_pngfile_p56_source_sft.py
"""
from __future__ import annotations

import hashlib
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
P56 = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"

# Each group reproduces the exact *preexisting* native source image choice,
# RGB arithmetic mean, nearest-integer rounding and Pillow PNG save option.
GROUPS = {
    "floral16": {
        "range": range(57, 73),
        "count": 16,
        "optimize": True,
        "rgb_sha512": "67bef2bebed49baa9f05335610fe27ea2979f3e8bfd80b091c100796b65b1947fa4e27094eada5c653a2df9425cffcff15ec51c438886677a2af41de4a1aa7be",
        "png_sha512": "752d2161af7f99557862754d8123beee796bb78cf9a8b6c79aa45c358bde4551fca8f07a76ddcbf4f07c5fadc00e4c9936a757bf7bf0aa28493d851cc060eedd",
        "png_bytes": 2115572,
    },
    "lp2all58": {
        "range": range(17, 75),
        "count": 58,
        "optimize": False,
        "rgb_sha512": "681185483d44050790deb4d31ab2d96c565dc6736130d2410f5c91ae7cca3967976fd80f6f1df79497ab091d23f47fc8ea2656b93ee04ac35fdf3cf9c42dd414",
        "png_sha512": "3c8fe96f7435f75c17718041d3012d0327b22fde0855ad7337d3423d7912b0fe9d05786d1b42920f0f02a8eeb43cb9bb412d82c1cc76082b12a6bd5f2a0ba440",
        "png_bytes": 2763778,
    },
    "all75": {
        "range": range(75),
        "count": 75,
        "optimize": False,
        "rgb_sha512": "738ad4d64761bec51fc6f9e310a23717eb9dd32e7e9c5570ce5e6a15d8bbdf2312200f56ef91f87d14a228fb6ece41602bc5021bced33246d9da7ea545c6fce8",
        "png_sha512": "d34a9b3bc8325beb28370b98835a43867ca79c13dfaab978695ab94aea315b0adb11deaf371141a49ac50e6c1ca4f6fa6258a39be322443259cfa69ab45311d4",
        "png_bytes": 3752780,
    },
}


def main() -> None:
    """Hash original source-defined PNG objects using the fixed Pillow encoder."""
    canvas = (3600, 2400, 3)
    accumulators = {
        name: np.zeros(canvas, dtype=np.uint32) for name in GROUPS
    }
    for image_number in range(75):
        with Image.open(SOURCE / f"{image_number:02}.jpg") as image:
            rgb = np.asarray(image.convert("RGB"), dtype=np.uint8)
        assert rgb.shape == canvas, (image_number, rgb.shape)
        for name, config in GROUPS.items():
            if image_number in config["range"]:
                accumulators[name] += rgb

    for name, config in GROUPS.items():
        count = config["count"]
        mean = ((accumulators[name] + count // 2) // count).astype(np.uint8)
        rgb_digest = hashlib.sha512(mean.tobytes()).hexdigest()
        assert rgb_digest == config["rgb_sha512"], (name, "source mean mismatch")

        stream = BytesIO()
        Image.fromarray(mean, "RGB").save(
            stream, format="PNG", optimize=config["optimize"]
        )
        data = stream.getvalue()
        digest = hashlib.sha512(data).hexdigest()
        assert len(data) == config["png_bytes"], (name, "PNG byte size mismatch")
        assert digest == config["png_sha512"], (name, "PNG SHA mismatch")
        assert digest != P56, (name, "original p56 target matched")
        print(f"{name}: {len(data)} PNG bytes, SHA512={digest}, p56_match=False")

    print("PASS three fixed original-source RGB means and PNG file-level hashes")


if __name__ == "__main__":
    main()
