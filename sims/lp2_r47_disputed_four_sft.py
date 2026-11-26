"""Agent2 #2982 narrow original-image adjudication. Python 3 + numpy, Pillow, OpenCV.
Usage from repository root: python sims/lp2_r47_disputed_four_sft.py
Uses only original 73.jpg to label templates; four original target crops at fixed registered coordinates.
All coordinate conventions: physical source JPEG, zero-based x,y, width,height; grayscale threshold <128.
"""
from pathlib import Path
from PIL import Image
import cv2
import numpy as np
import hashlib

ROOT = Path(__file__).resolve().parent.parent / 'resources/liber-primus'
ALPHABET = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
LABELS = dict(zip(ALPHABET, 'F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()))
KNOWN = ['ᚫᛄᛟᛋᚱᛗᚣᛚᚩᚻᚩᚫᚳᚦᚷᚹᚹᛚᚫᛉ','ᚩᚪᛈᛗᛞᛞᚢᚷᚹᛚᛞᚾᚣᛄᚳᚠᛡᚫᛏ','ᛈᛇᚪᚦᚳᚫ','ᚳᛞᚠᚾᛡᛖᚠᚾᚳᛝᚱᚠᚫᛁᚱᛞᛖᛋᚣᛄᛠᚢ','ᛝᚹᛉᚩᛗᛠᚹᚠᚱᚷᛡᛝᚱᛒᚫᚾᚢᛋ']
SITES = [(276,18,(1262,673,35,114)),(5054,37,(1445,2367,34,115)),(6054,42,(1610,1050,34,114)),(9877,58,(914,673,53,114))]
def read(n):
    a = np.asarray(Image.open(ROOT / f'{n:02}.jpg').convert('L'))
    assert a.shape == (3600,2400)
    return a
def mask(a,g):
    x,y,w,h = g
    return a[y:y+h,x:x+w] < 128
def vector(m):
    h,w=m.shape
    a=np.zeros((128,136),dtype=np.float32)
    y,x=(128-h)//2,(136-w)//2
    a[y:y+h,x:x+w]=m
    return a
def source_rows(a):
    _,_,st,_=cv2.connectedComponentsWithStats((a[:,580:1820]<128).astype('uint8'), connectivity=8)
    boxes=[tuple(map(int,(x+580,y,w,h))) for x,y,w,h,area in st[1:] if 108<=h<=120 and 6<=w<=130 and area>=300]
    rows=[]
    for box in sorted(boxes,key=lambda g:g[1]):
        if not rows or box[1]-rows[-1][0][1]>12: rows.append([])
        rows[-1].append(box)
    return [sorted(row) for row in rows if len(row)>=3]
def main():
    p56=read(73)
    templates={}
    for i,(row,ks) in enumerate(zip(source_rows(p56),KNOWN)):
        ks=ks[1:] if i==0 else ks
        assert len(ks)==len(row)
        for k,g in zip(ks,row):
            templates.setdefault(k,[]).append(vector(mask(p56,g)))
    assert len(templates)==29
    def classify(m):
        v=vector(m)
        scores={}
        for k,vs in templates.items():
            best=0.
            for a in vs:
                for dy in range(-2,3):
                    for dx in range(-2,3):
                        b=np.roll(np.roll(a,dy,0),dx,1)
                        best=max(best,float(np.minimum(v,b).sum()/np.maximum(v,b).sum()))
            scores[k]=best
        return sorted(scores.items(),key=lambda q:-q[1])
    winners=[]
    for gpos,p,g in SITES:
        m=mask(read(p),g)
        scores=classify(m)
        print(gpos,p,g,[(LABELS[k],round(v,8)) for k,v in scores[:3]])
        winners.append(LABELS[scores[0][0]])
    assert winners==['A','TH','AE','D']
    disputed=mask(read(58),(914,673,53,114))
    solved_d=mask(p56,(976,861,53,114))
    adjacent_m=mask(read(58),(855,673,53,114))
    assert np.array_equal(disputed,solved_d)
    assert not np.array_equal(disputed,adjacent_m)
    print('exact D binary-mask SHA256',hashlib.sha256(disputed.tobytes()).hexdigest())
    print('PASS: all four labels supported; exact D template match, not M')
if __name__=='__main__': main()
