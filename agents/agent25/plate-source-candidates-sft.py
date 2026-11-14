"""Four dated Clker plates against one fixed original LP2 p42 mirror border.

No-write Python3/Pillow 11.3 source test. The website's displayed upload dates
are metadata, not independent archival proof of image-byte publication dates.
A successful retrieval is an image candidate, not a cipher/key or plaintext.
"""
from __future__ import annotations

import hashlib
import io
import json
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[2]
ORIGINAL = ROOT / "resources" / "liber-primus" / "59.jpg"
SHA256 = "e523427112ec6259e97d1711f0420469d961324dedb7dc4eac67ecd9543729f6"
CANDIDATES = (
    ("mswildcrd", "2013-01-16", "https://www.clker.com/cliparts/H/h/J/w/S/E/swirl-tree-hi.png"),
    ("missyven", "2013-06-06", "https://www.clker.com/cliparts/4/W/z/w/A/z/swirl-tree-hi.png"),
    ("DeAwnBunch", "2012-07-12", "https://www.clker.com/cliparts/C/x/Q/b/Y/j/leaf-flourish-hi.png"),
    ("Chris", "2013-10-21", "https://www.clker.com/cliparts/b/6/b/y/d/v/swirl-black-filigree-hi.png"),
)


def mask(image: Image.Image) -> Image.Image:
    """Source-fixed grayscale ink threshold180 on a white alpha-composited field."""
    background = Image.new("RGBA", image.size, "white")
    background.alpha_composite(image.convert("RGBA"))
    return background.convert("L").point(lambda x: 255 if x < 180 else 0)


def score(a: Image.Image, b: Image.Image) -> dict:
    """Exact binary intersection/union and Dice scores."""
    assert a.size == b.size
    aa = a.histogram()[255]
    bb = b.histogram()[255]
    both = ImageChops.multiply(a, b).histogram()[255]
    either = ImageChops.lighter(a, b).histogram()[255]
    assert either
    return {"IoU": round(both / either, 8), "F1": round(2 * both / (aa + bb), 8),
            "intersection": both, "union": either}


def source_image(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0",
        "Accept": "image/png,image/*;q=0.9"})
    with urllib.request.urlopen(req, timeout=16) as response:
        payload = response.read(8_000_001)
    if len(payload) > 8_000_000:
        raise ValueError("Image >8 MB")
    return payload


def main() -> None:
    raw = ORIGINAL.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == SHA256
    original = Image.open(io.BytesIO(raw)).convert("RGB")
    assert original.size == (2400, 3600)
    left = mask(original.crop((0, 0, 500, 3600)))
    right = mask(original.crop((1900, 0, 2400, 3600)))
    box = left.getbbox()
    assert box == (28, 798, 500, 2836)
    positive = score(left, ImageOps.mirror(right))
    negative = score(left, ImageOps.flip(left))
    assert positive["IoU"] == 0.98196210 and negative["IoU"] < 0.15
    target = left.crop(box)
    print(json.dumps({"originalSHA256": SHA256, "leftCrop": [0, 0, 500, 3600],
        "maskBBox": list(box), "threshold": 180, "mirrorPositive": positive,
        "verticalNegative": negative}, sort_keys=True))
    retrieved = 0
    for author, upload, url in CANDIDATES:
        result = {"claimedUploadDate": upload, "uploader": author, "url": url}
        try:
            content = source_image(url)
            result["rawSHA256"] = hashlib.sha256(content).hexdigest()
            result["byteLength"] = len(content)
            with Image.open(io.BytesIO(content)) as inp:
                inp.load()
                result["dimensions"] = list(inp.size)
                imgmask = mask(inp)
                ibox = imgmask.getbbox()
                if ibox is None:
                    raise ValueError("empty image mask")
                result["inkBoundingBox"] = list(ibox)
                normalized = imgmask.crop(ibox).resize(target.size, Image.Resampling.NEAREST)
            result["sameHanded"] = score(target, normalized)
            result["reflected"] = score(target, ImageOps.mirror(normalized))
            retrieved += 1
        except (urllib.error.URLError, ValueError, OSError, TimeoutError) as exc:
            result["notDownloaded"] = f"{type(exc).__name__}: {exc}"
        print(json.dumps(result, sort_keys=True))
    print(json.dumps({"retrieved": retrieved, "totalCandidates": len(CANDIDATES),
       "caution": "Exact published hi.png endpoints; a source-year attribution or key must be independently established."},
       sort_keys=True))


if __name__ == "__main__":
    main()
