"""One locked source-only candidate decoder for the *truncated* 2012 Seoul QR.

The original archived 240x240 JPEG physically cuts the barcode bottom away.
Rather than invent a new URL, match its intact upper source modules only against
the TEN numeric jpg filenames from Cicada's January 2012 PGP-verified message.
Geometry is calibrated only on the same two standard QR finder patterns, never
on candidate URL payload. This can identify a known URL or stop inconclusive.

Run: python sims/cicada2012_seoul_partial_qr_10source_gate.py
"""
from __future__ import annotations
from hashlib import sha1
from io import BytesIO
import json
from urllib.request import urlopen
from PIL import Image, ImageOps
import qrcode

SOURCE = ("https://raw.githubusercontent.com/neuroretransmit/cicada/"
          "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/"
          "2012/005-845145127.com/img/posters/Poster2012Seul.jpg")
BLOB = "1aa14c216e3aa0be0977d485b12ef451d599daf4"
NUMBERS = (
    "162667212858", "414974253863", "598852142735", "876873892385",
    "935691396441", "316744223127", "427566844663", "644169769482",
    "889296759263", "963846244281",
)
CORRECTIONS = (qrcode.constants.ERROR_CORRECT_L,
               qrcode.constants.ERROR_CORRECT_M,
               qrcode.constants.ERROR_CORRECT_Q)
N = 33  # source finder width ~21 px and horizontal separation ~77 px -> v4.


def photo() -> Image.Image:
    with urlopen(SOURCE, timeout=25) as response:
        raw = response.read(12000)
    assert len(raw) == 11458
    assert sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest() == BLOB
    im = ImageOps.grayscale(Image.open(BytesIO(raw)))
    assert im.size == (240, 240)
    return im


def color_of_finder(r: int, c: int) -> bool:
    """Standard 7x7 QR finder, repeated at both upper original corners."""
    return (r in (0, 6) or c in (0, 6)
            or (r in (2, 3, 4) and c in (2, 3, 4)))


def samples(im: Image.Image, x0: float, y0: float, step: float,
            coords: list[tuple[int,int]]) -> list[int]:
    vals = []
    for r,c in coords:
        x = round(x0 + (c + 0.5) * step)
        y = round(y0 + (r + 0.5) * step)
        if not (0 <= x < 240 and 0 <= y < 240):
            vals.append(127)
        else:
            vals.append(im.getpixel((x,y)))
    return vals


def calibrate(im: Image.Image) -> dict:
    coords = ([(r,c) for r in range(7) for c in range(7)]
              + [(r, N-7+c) for r in range(7) for c in range(7)])
    truth = [color_of_finder(r,c if c<7 else c-(N-7)) for r,c in coords]
    best = None
    # Coordinates are bounded by visually established finder extents; they
    # cannot vary per numeric candidate.
    for ix in range(68,78):
        for iy in range(164,177):
            for k in range(26,35):
                step = k / 10
                p = samples(im, ix, iy, step, coords)
                dark = [v for v,is_dark in zip(p,truth) if is_dark]
                white = [v for v,is_dark in zip(p,truth) if not is_dark]
                black_mean = sum(dark)/len(dark)
                white_mean = sum(white)/len(white)
                delta = white_mean - black_mean
                # Prefer clear simultaneous two-finder separation.
                if best is None or delta > best["separation"]:
                    best={"x0":ix,"y0":iy,"pitch":step,
                          "blackMean":round(black_mean,2),
                          "whiteMean":round(white_mean,2),
                          "separation":round(delta,2)}
    assert best is not None and best["separation"]>20
    return best


def qr_matrix(text: str, ecc: int, mask: int, optimize: int):
    qr=qrcode.QRCode(version=4, error_correction=ecc,
                     box_size=1,border=0,mask_pattern=mask)
    qr.add_data(text,optimize=optimize)
    qr.make(fit=False)
    matrix=qr.get_matrix()
    assert len(matrix)==N and all(len(row)==N for row in matrix)
    return matrix


def main():
    im = photo()
    fit = calibrate(im)
    t = (fit["blackMean"] + fit["whiteMean"]) / 2
    # Upper QR data-bearing portion, entirely visible; no missing bottom rows.
    coords = [(r,c) for r in range(8,20) for c in range(8,25)]
    reading = samples(im,fit["x0"],fit["y0"],fit["pitch"],coords)
    ranks = []
    for num in NUMBERS:
        for ecc in CORRECTIONS:
            for mask in range(8):
                for optimize in (0,20):
                    url=f"http://845145127.com/{num}.jpg"
                    try:
                        code=qr_matrix(url,ecc,mask,optimize)
                    except qrcode.exceptions.DataOverflowError:
                        continue
                    correct=sum((v<t)==code[r][c]
                                for (r,c),v in zip(coords,reading))
                    ranks.append((correct,num,ecc,mask,optimize))
    # Each source URL is selected by its BEST historically legal QR encoding,
    # but ranking a QR parameter does not constitute image-source proof.
    grouped = {}
    for correct,num,ecc,mask,opt in ranks:
        if num not in grouped or correct>grouped[num][0]:
            grouped[num]=(correct,num,ecc,mask,opt)
    order=sorted(grouped.values(),reverse=True)
    answer={
        "source":SOURCE,"sourceGitBlob":BLOB,
        "calibrationFromStandardFinderOnly":fit,
        "sampledIntactDataModules":len(coords),
        "sourceRestrictedNumbers":len(NUMBERS),
        "perNumberBest":[{"agreement":x[0],"fraction":round(x[0]/len(coords),4),
                          "number":x[1],"ecc":x[2],"mask":x[3],
                          "segmentation":x[4]} for x in order],
        "credibleIdentification":bool(order[0][0]>=0.8*len(coords)
            and order[0][0]-order[1][0]>=0.10*len(coords)),
        "notes":"Only image source pixels and ten signed filenames. No arbitrary URL, crop, cipher key, or live destination."
    }
    print(json.dumps(answer,indent=2))


if __name__=="__main__":
    main()
