"""Original p33 initial source-morphology test. Requires OpenCV, NumPy.
Usage: python sims/lp2_p33_initial_native_glyph_sft.py [--archive original.zip]
"""
from pathlib import Path
from zipfile import ZipFile
import argparse
import cv2
import numpy as np

def run(load):
    def crop(page, box, red=False):
        x,y,w,h=box
        a=load(page)[y:y+h,x:x+w]
        b,g,r=cv2.split(a)
        m=((r.astype(int)-g>75)&(r.astype(int)-b>75)) if red else cv2.cvtColor(a,cv2.COLOR_BGR2GRAY)<160
        return cv2.resize(m.astype('float32'),(100,200),interpolation=cv2.INTER_AREA)>.5
    m=crop(57,(1003,1350,53,114))
    d=crop(57,(1378,1349,53,115))
    c27=crop(27,(601,913,230,496),True)
    c33=crop(33,(601,667,230,498),True)
    def iou(a,b):
        return float((a&b).sum()/(a|b).sum())
    for name,a in [('p27',c27),('p33',c33),('known M',m),('known D',d)]:
        print(name, 'M',round(iou(a,m),6), 'D',round(iou(a,d),6))
    assert iou(c27,m)>.95 and iou(c27,d)<.71
    assert iou(c33,d)>.95 and iou(c33,m)<.71

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--archive',type=Path)
    args=ap.parse_args()
    if args.archive:
        with ZipFile(args.archive) as z:
            run(lambda p:cv2.imdecode(np.frombuffer(z.read(f'liber-primus-jpegs/{p+17:02}.jpg'),np.uint8),cv2.IMREAD_COLOR))
    else:
        root=Path(__file__).resolve().parents[1]
        run(lambda p:cv2.imread(str(root/'resources'/'liber-primus'/f'{p+17:02}.jpg')))
