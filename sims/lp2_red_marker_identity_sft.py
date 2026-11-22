"""Original-JPEG red 10-dot versus 13-dot marker test (Pillow only).

From the repository root: python sims/lp2_red_marker_identity_sft.py
Optionally pass --zip /path/to/liber-primus-jpegs.zip.
No ciphertext, language scoring, or fitted cipher parameters are involved.
"""
import argparse
import hashlib
import io
import zipfile
from collections import deque
from pathlib import Path
from PIL import Image

# Native 2400x3600 JPEGs. Coordinates are centers of each glyph's upper dot.
ANCHORS = {32:(949,1633), 36:(993,1456), 38:(620,2545),
           49:(1710,1080), 55:(1053,1256), 56:(1073,1080), 57:(1159,935)}
EXPECTED = {32:13, 36:10, 38:10, 49:10, 55:13, 56:10, 57:13}

def read_jpeg(page, source_zip):
    n=page+17
    if source_zip is None:
        return Path(f"resources/liber-primus/{n:02}.jpg").read_bytes()
    with zipfile.ZipFile(source_zip) as z:
        return z.read(f"liber-primus-jpegs/{n:02}.jpg")

def red_dots(image, anchor):
    cx,cy=anchor
    x0,y0,x1,y1=cx-35,cy-12,cx+35,cy+93
    p=image.crop((x0,y0,x1,y1)).convert("RGB").load()
    red=set()
    for y in range(y1-y0):
        for x in range(x1-x0):
            r,g,b=p[x,y]
            if r>70 and r-g>45 and r-b>45:
                red.add((x,y))
    result=[]
    while red:
        start=red.pop()
        queue=deque([start])
        cc=[start]
        while queue:
            x,y=queue.popleft()
            for dx in (-1,0,1):
                for dy in (-1,0,1):
                    q=(x+dx,y+dy)
                    if q in red:
                        red.remove(q)
                        queue.append(q)
                        cc.append(q)
        xs,ys=zip(*cc)
        left,top,right,bottom=min(xs),min(ys),max(xs),max(ys)
        if 7<=right-left+1<=12 and 7<=bottom-top+1<=12 and len(cc)>=60:
            result.append((left+right+2*x0,top+bottom+2*y0,len(cc)))
    return sorted(result,key=lambda dot:(dot[1],dot[0]))

def relative_centers(dots):
    x,y,_=dots[0]
    return [(xx-x,yy-y) for xx,yy,_ in dots]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--zip",type=Path)
    args=ap.parse_args()
    dots={}
    for page,anchor in ANCHORS.items():
        raw=read_jpeg(page,args.zip)
        img=Image.open(io.BytesIO(raw))
        assert img.size==(2400,3600),(page,img.size)
        dots[page]=red_dots(img,anchor)
        assert len(dots[page])==EXPECTED[page],(page,dots[page])
        print(f"p{page} scan{page+17:02}.jpg dots={len(dots[page])} sha256={hashlib.sha256(raw).hexdigest()}")
        print("  relative half-pixel centers:",relative_centers(dots[page]))
    for control in (36,38,56):
        for a,b in zip(relative_centers(dots[49]),relative_centers(dots[control])):
            assert max(abs(a[0]-b[0]),abs(a[1]-b[1]))<=3,(49,control,a,b)
    for control in (32,57):
        for a,b in zip(relative_centers(dots[55]),relative_centers(dots[control])):
            assert max(abs(a[0]-b[0]),abs(a[1]-b[1]))<=3,(55,control,a,b)
    print("PASS: p49 is 10-dot; p55 is 13-dot; both match their distinct control families within 1.5px.")

if __name__=="__main__":
    main()
