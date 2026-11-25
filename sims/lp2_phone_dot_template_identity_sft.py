#!/usr/bin/env python3
"""Verify exact p41-p55 side-art identity in the original LP2 JPEGs."""
from __future__ import annotations
import argparse
import hashlib
from pathlib import Path
from PIL import Image, ImageChops

EXPECTED = {
58:"cef4a7baf17e31676ec219db99808287a63b6f33",
59:"781940e751b879a4fe1a62bdcf4ac518e1e5c6a9",
60:"165003151e37729d2b4fde70c92a432ad9c70d00",
61:"6aaa4e0d3b89d652ef4eec43af4382d871e9e087",
62:"5a29229e871ca21e28a2500b448c5df04b6d5545",
63:"b02c15229caaecec339a5614f07396850e3b068c",
64:"9cc071ca1f93dd29750deccc11f3a7cc056c94db",
65:"a2db4b4363f4a991dc7a2f17855d7b238df9d09e",
66:"c5243ea1324cf3b72b79a41366f8d0e434ce3978",
67:"f5abe00085811319f5183c2468ea1171d9dbfb82",
68:"701e47789abf4401d61420ff938c2b72aa03ad2c",
69:"2bb9807409b2536feb788ec0cdf7a0fefb8ea5e6",
70:"55791b97f20e57e9f0ffb4f28596712d5db2ed68",
71:"5658a7f992c06ac7191f275cf32be2ce35b59754",
72:"ee00cd34013fe3a5c6808650abb6d3206b6f1b13",
}
CROPS = {"left":(0,700,550,3000), "right":(1850,700,2400,3000)}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--image-dir",type=Path,default=Path(__file__).resolve().parents[1]/"resources"/"liber-primus")
    args=parser.parse_args()
    images={}
    for n,expected in EXPECTED.items():
        path=args.image_dir/f"{n}.jpg"
        data=path.read_bytes()
        actual=hashlib.sha1(b"blob "+str(len(data)).encode()+bytes([0])+data).hexdigest()
        assert actual==expected,(path.name,actual,expected)
        im=Image.open(path).convert("L")
        assert im.size==(2400,3600),(path.name,im.size)
        images[n]=im
    ref=images[58]
    for n,im in images.items():
        for side,box in CROPS.items():
            assert ImageChops.difference(ref.crop(box),im.crop(box)).getbbox() is None,(n,side)
    center=(600,700,1800,3000)
    assert ImageChops.difference(images[58].crop(center),images[62].crop(center)).getbbox() is not None
    print("PASS: Git blobs 58-72 verified; both 550x2300 side-art crops are identical across p41-p55; p41/p45 central text differs.")

if __name__=="__main__":
    main()
