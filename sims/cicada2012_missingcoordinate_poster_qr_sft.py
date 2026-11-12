"""Exact 2012 source-poster QR recovery for the two coordinates absent from
the signed 12-point original. All downloads are pinned to archived Git blobs.

Uses externally documented Pillow/zxing-cpp, no bespoke barcode decoder.
Node-independent Python 3 test: python sims/cicada2012_missingcoordinate_poster_qr_sft.py
"""
from __future__ import annotations

from hashlib import sha1, sha256
from base64 import b64encode
import os
from io import BytesIO
import json
from urllib.parse import quote
from urllib.request import urlopen
from PIL import Image, ImageOps, ImageEnhance
import zxingcpp

ARCHIVES = [
    ("neuroretransmit/cicada",
     "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3"),
    ("cicada-solvers/The-Complete-Cicada3301-Archive",
     "c3127e0e9eb5afbb582d37988d6369fe38429238"),
]
POSTERS = [
    # Source's Seoul photographed QR, present in both archives.
    (0, "2012/005-845145127.com/img/posters/Poster2012Seul.jpg",
     11458, "1aa14c216e3aa0be0977d485b12ef451d599daf4", "Seoul photocrop"),
    # Separate original Seoul frame, not merely another filename for same blob.
    (1, "2012/additional media/images/The posters/Poster_2012_seul.jpg",
     19592, "026e351774e80a7151fc1eeb3a0f60759c1cf844", "Seoul street photo"),
    # Caution: archive cannot independently distinguish Arkansas from Sydney.
    (0, "2012/005-845145127.com/img/posters/Arkansas-or-Sydney.jpg",
     113529, "b7734efd01ffbf5f6cc2fceff69afaa95056374f", "Arkansas-or-Sydney"),
    # Independent known found photo, as an original-image QR positive control.
    (0, "2012/005-845145127.com/img/posters/Miami-FL-US.jpg",
     482985, "3cfe541f033bf99d48cb55c941761f4a919cf50d", "Miami control"),
    (1, "2012/additional media/images/The posters/Poster_2012 us.jpg",
     113529, "b7734efd01ffbf5f6cc2fceff69afaa95056374f", "Other US duplicate")
]


def gitblob(data: bytes) -> str:
    return sha1(f"blob {len(data)}\0".encode("ascii") + data).hexdigest()


def read_qr(original: Image.Image) -> dict[str, object]:
    # Freeze image-only three geometry-neutral variants. Rotation/inversion
    # is handled by zxing-cpp itself, no fitted crop or manually guessed bytes.
    images = [
        ("original", original),
        ("gray", ImageOps.grayscale(original)),
        ("contrast", ImageEnhance.Contrast(
            ImageOps.grayscale(original)).enhance(2.0)),
    ]
    readings = {}
    for name, img in images:
        found = zxingcpp.read_barcodes(img)
        readings[name] = [
            {"text": code.text, "format": str(code.format)}
            for code in found
        ]
    return readings


def main() -> None:
    records = []
    for idx, path, size, blob, description in POSTERS:
        ownerrepo, commit = ARCHIVES[idx]
        url = (f"https://raw.githubusercontent.com/{ownerrepo}/{commit}/"
               + quote(path, safe="/"))
        with urlopen(url, timeout=25) as response:
            raw = response.read(size + 1)
        assert len(raw) == size, (path, len(raw), size)
        assert gitblob(raw) == blob, path
        if idx in (0, 1) and os.environ.get("SHOW_SEOUL_ORIGINAL") == "1":
            print(f"PINNED_SEOUL_JPEG_BASE64_{len(records)} " + b64encode(raw).decode("ascii"))
        img = Image.open(BytesIO(raw))
        img.load()
        readings = read_qr(img)
        records.append({
            "designation": description, "source":url,
            "fileSize":size,"gitBlob":blob,"sha256":sha256(raw).hexdigest(),
            "dimensions":list(img.size),"QRreadout":readings,
        })
    assert len(records) == 5
    assert records[2]["gitBlob"] == records[4]["gitBlob"], "US photo should be same archived file"
    assert records[0]["gitBlob"] != records[1]["gitBlob"], "Seoul should be distinct images"
    print(json.dumps({"originalPosterImages":records,
                      "inferenceLimit":"QR visual decoding cannot prove original find-location without independently dated metadata; images may be mirror copies",
                      "historicalNetworkProbes":0},indent=2))


if __name__ == "__main__":
    main()
