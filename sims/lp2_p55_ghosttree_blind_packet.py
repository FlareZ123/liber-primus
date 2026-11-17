"""Make a deterministic blinded p32/p55 tree-review packet from original JPEGs.

Requires Pillow and filelock. Set LP2_SOURCE_ZIP to the original 75-JPEG ZIP,
and LP2_GHOST_TREE_OUT to an output directory if non-default locations are used.
The private answer key is excluded from the public ZIP.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import random
import tempfile
import zipfile
from pathlib import Path

from filelock import FileLock
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path(os.environ.get("LP2_SOURCE_ZIP", str(ROOT / "liber-primus-jpegs.zip")))
OUT = Path(os.environ.get("LP2_GHOST_TREE_OUT", str(ROOT / "im-results" / "ghost-tree-blind-packet")))

# Source pixels in the repository's canonical 2400x3600 original JPEGs.
CROPS = {
    "target_native": (72, (625, 1430, 1735, 2510)),
    "target_contrast": (72, (625, 1430, 1735, 2510)),
    "reference_p32": (49, (650, 2070, 1760, 3150)),
    "control_p08_tree": (25, (0, 1100, 1110, 2180)),
    "control_p10_tree": (27, (0, 1200, 1110, 2280)),
    "control_p14_tree": (31, (0, 1250, 1110, 2330)),
    "control_p40_flower": (57, (0, 1100, 1110, 2180)),
    "control_p53_flower": (70, (1290, 900, 2400, 1980)),
    "control_p57_plant": (74, (645, 1560, 1755, 2640)),
}


def atomic_bytes(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        fd, temporary = tempfile.mkstemp(dir=path.parent, prefix=".staged-")
        try:
            with os.fdopen(fd, "wb") as handle:
                handle.write(payload)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary, path)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)


def source_bytes(number: int) -> bytes:
    if ARCHIVE.is_file():
        with zipfile.ZipFile(ARCHIVE) as original:
            return original.read(f"liber-primus-jpegs/{number:02d}.jpg")
    return (ROOT / "resources" / "liber-primus" / f"{number:02d}.jpg").read_bytes()


def to_png(image: Image.Image) -> bytes:
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def main() -> None:
    sources = {number: source_bytes(number) for number, _ in CROPS.values()}
    assert all(Image.open(io.BytesIO(source)).size == (2400, 3600) for source in sources.values())
    random_key = hashlib.sha256(sources[72] + b"LP2-blind-tree-packet-v1-20261117").digest()
    shuffled = list(CROPS)
    random.Random(int.from_bytes(random_key, "big")).shuffle(shuffled)

    frames: dict[str, Image.Image] = {}
    manifest: list[dict[str, object]] = []
    reveal: dict[str, dict[str, object]] = {}
    for position, name in enumerate(shuffled):
        label = f"{position + 1:02d}"
        number, bounds = CROPS[name]
        crop = Image.open(io.BytesIO(sources[number])).convert("L").crop(bounds)
        if name == "target_contrast":
            # Fixed ×4 density contrast. No fitted thresholds or image model.
            crop = crop.point(lambda p: max(0, 255 - 4 * (255 - p)))
        assert crop.size == (1110, 1080)
        image_bytes = to_png(crop)
        atomic_bytes(OUT / f"{label}.png", image_bytes)
        frames[label] = crop
        manifest.append({"label": label, "sha256": hashlib.sha256(image_bytes).hexdigest(), "width": 1110, "height": 1080})
        reveal[label] = {"source": name, "original_jpeg": f"{number:02d}.jpg", "bbox_xyxy": bounds}

    review = Image.new("RGB", (3 * 375, 3 * 395), (243, 243, 243))
    draw = ImageDraw.Draw(review)
    for index in range(9):
        label = f"{index + 1:02d}"
        reduced = frames[label].resize((355, 346), resample=Image.Resampling.LANCZOS).convert("RGB")
        x, y = (index % 3) * 375 + 10, (index // 3) * 395 + 10
        review.paste(reduced, (x, y))
        draw.text((x + 12, y + 353), label, fill=(10, 10, 10))
    atomic_bytes(OUT / "contact.png", to_png(review))

    public = {
        "title": "Blinded original LP2 illustration packet",
        "question": "Which image, if any, contains a second recognizable deliberately drawn object beyond its obvious main subject? For any positive, describe exact pixels/features, without guessing an identity.",
        "sources": "Original Liber Primus first-party 2400x3600 JPEGs. One fixed 4x ink-density rendering. Nine shuffled unlabeled crops, including same-source and different-page controls.",
        "contrast": "Image processing for the one contrast item: out = max(0, 255 - 4*(255 - original grayscale)). All other items are native 1:1 grayscale crops.",
        "images": manifest,
    }
    atomic_bytes(OUT / "manifest.json", (json.dumps(public, indent=2) + "\n").encode())
    private = {
        "shuffle_commitment": hashlib.sha256(json.dumps(reveal, sort_keys=True).encode()).hexdigest(),
        "reveal": reveal,
        "original_jpeg_sha256": {f"{n:02d}.jpg": hashlib.sha256(data).hexdigest() for n, data in sources.items()},
    }
    atomic_bytes(OUT / "private-reveal.json", (json.dumps(private, indent=2) + "\n").encode())

    names = [f"{i:02d}.png" for i in range(1, 10)] + ["contact.png", "manifest.json"]
    packed = io.BytesIO()
    with zipfile.ZipFile(packed, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=7) as zf:
        for name in names:
            zf.writestr(name, (OUT / name).read_bytes())
    atomic_bytes(OUT.parent / "ghost-tree-blinded-review.zip", packed.getvalue())
    print("Review ZIP:", OUT.parent / "ghost-tree-blinded-review.zip")
    print("SHA256 key commitment:", private["shuffle_commitment"])


if __name__ == "__main__":
    main()
