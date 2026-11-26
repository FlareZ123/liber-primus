#!/usr/bin/env python3
"""Reconstruct the exact independently downloaded fv7ly archive."""
from hashlib import sha256, sha1
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
from PIL import Image
import sys

def main():
    if len(sys.argv)==2:
        with ZipFile(sys.argv[1]) as z:
            a,b,c=[z.read(f"liber-primus-jpegs/{i:02}.jpg") for i in (3,4,5)]
    else:
        a,b,c=[(Path("resources/liber-primus")/f"{i:02}.jpg").read_bytes() for i in (3,4,5)]
    h=c[:336353]
    assert h==c[-336353:][::-1]
    gap=c[336353:-336353]
    assert len(gap)==360 and gap[:2]==b"\n\n"
    text=bytes.fromhex(gap[2:].decode()[::-1]).decode("ascii")
    matrix=[list(map(int,row.split())) for row in text.strip().splitlines()]
    assert all(sum(row)==1033 for row in matrix)
    assert all(sum(col)==1033 for col in zip(*matrix))
    assert sum(matrix[i][i] for i in range(5))==sum(matrix[i][4-i] for i in range(5))==1033
    d=h+bytes.fromhex(gap.decode())+b"\n\n"+c[-336353:]
    payload=d[::-1]+a+b[::-1]
    binary=payload.translate(bytes(range(255,-1,-1)))
    raw=binary.hex().encode("ascii")+b"\n"
    assert len(payload)==2788983 and sha256(payload).hexdigest()=="5d46f4a8a215fdaec1eda52ecd65c3d1ef2f3969876f6046b432a5558fde27f3"
    assert sha256(binary).hexdigest()=="9be35c6613ef8e8c6fb4a7543ac7cb4029a2a03da88e18921c1af7343c440ede"
    assert len(raw)==5577967 and sha256(raw).hexdigest()=="51886868658ea5a95898ff9847af7e56222ed2b1d46bc743311ff6c777651040"
    assert sha1(raw).hexdigest()=="5bc5d0706fa455710ad2a8f598782ef5ce1b3070"
    for data in (h,a,b):
        with Image.open(BytesIO(data)) as im:
            im.load()
            assert im.size==(2400,3600)
    print("Exact source SHA256/SHA1; three distinct JPEGs full-decode.")
    print(text)
if __name__=="__main__":
    main()
