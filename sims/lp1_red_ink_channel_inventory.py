#!/usr/bin/env python3
"""Inventory red ink on LP1 archive images and inspect the image-10 JPEG trailer.

Usage:
    python sims/lp1_red_ink_channel_inventory.py /path/to/liber-primus-jpegs.zip
"""
import argparse
import hashlib
import io
import json
import zipfile
from PIL import Image, ImageChops


def red_mask(image):
    red, green, blue = image.convert("RGB").split()
    mask = red.point(lambda x: 255 if x > 140 else 0)
    for channel, predicate in (
        (green, lambda x: x < 120),
        (blue, lambda x: x < 120),
        (ImageChops.subtract(red, green), lambda x: x > 60),
        (ImageChops.subtract(red, blue), lambda x: x > 60),
    ):
        mask = ImageChops.multiply(mask, channel.point(lambda x: 255 if predicate(x) else 0))
    return mask


def image_info(blob):
    image = Image.open(io.BytesIO(blob))
    return {"format": image.format, "size": list(image.size), "mode": image.mode}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("zip_path")
    args = parser.parse_args()
    with zipfile.ZipFile(args.zip_path) as archive:
        names = archive.namelist()
        prefix = next((n.rsplit("/", 1)[0] + "/" for n in names if n.endswith("00.jpg")), "")
        red_images = []
        for image_index in range(17):
            name = prefix + f"{image_index:02d}.jpg"
            blob = archive.read(name)
            image = Image.open(io.BytesIO(blob))
            mask = red_mask(image)
            red_images.append({
                "image_index": image_index,
                "file_bytes": len(blob),
                "red_pixels": mask.histogram()[255],
                "red_bbox": list(mask.getbbox()) if mask.getbbox() else None,
            })

        image10 = archive.read(prefix + "10.jpg")
        eoi = image10.find(b"\xff\xd9")
        if eoi < 0:
            raise RuntimeError("No first JPEG EOI marker in 10.jpg")
        end = eoi + 2
        first_jpeg, trailer = image10[:end], image10[end:]
        image11 = archive.read(prefix + "11.jpg")
        trailer_image = Image.open(io.BytesIO(trailer)).convert("RGB")
        image11_pixels = Image.open(io.BytesIO(image11)).convert("RGB")
        pixel_equal = ImageChops.difference(trailer_image, image11_pixels).getbbox() is None

        print(json.dumps({
            "red_image_indices": [x["image_index"] for x in red_images if x["red_pixels"]],
            "red_images": red_images,
            "image10": {
                "file_bytes": len(image10),
                "file_sha256": hashlib.sha256(image10).hexdigest(),
                "first_jpeg_end_offset": end,
                "first_jpeg": image_info(first_jpeg),
                "trailer_bytes": len(trailer),
                "trailer_sha256": hashlib.sha256(trailer).hexdigest(),
                "trailer_prefix_hex": trailer[:8].hex(),
                "trailer": image_info(trailer),
                "image11_standalone": image_info(image11),
                "trailer_pixels_exactly_equal_image11": pixel_equal,
                "image11_file_sha256": hashlib.sha256(image11).hexdigest(),
            },
        }, indent=2))


if __name__ == "__main__":
    main()
