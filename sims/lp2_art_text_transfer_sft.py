"""Issue #2898: fixed tree geometry, physical glyph rectangles, no cipher fitting.
Usage: python lp2_art_text_transfer_sft.py [original JPEG directory]
Dependencies: numpy, opencv-python. No OCR or image fitting.
"""
from pathlib import Path
from collections import defaultdict
import sys
import cv2
import numpy as np

ROOT = Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'resources'/'liber-primus'
# Existing trunk-only art fit, identical convention to folio red-dot SFT.
SCALE = np.array([.9*1160/1110, .9*1160/1080])
SHIFT = np.array([650,2070])+np.array([6,19])*1160/360-SCALE*np.array([625,1430])

def load(n):
    a=cv2.imread(str(ROOT/f'{n:02}.jpg'),cv2.IMREAD_GRAYSCALE)
    assert a is not None and a.shape==(3600,2400)
    return a

def glyphs(a, y_end=1800):
    # Previously pinned LP2 physical-glyph extraction, no altered thresholds.
    _,_,stats,_=cv2.connectedComponentsWithStats((a<140).astype(np.uint8),8)
    rows=defaultdict(list)
    for x,y,w,h,area in stats[1:]:
        if 600<=x<1830 and 500<=y<y_end and 60<=h<125 and 7<=w<95 and area>140:
            rows[round((int(y)+30)/180)*180].append((int(x),int(y),int(x+w),int(y+h)))
    return [np.array(sorted(rows[y]),dtype=float).reshape(-1,2,2) for y in sorted(rows)]

def envelope(boxes):
    return np.array([boxes[:,0].min(0), boxes[:,1].max(0)])

def counts(target, box):
    center=target.mean(1)
    inside=np.all((center>=box[0])&(center<box[1]),axis=1)
    intersects=np.all(np.maximum(target[:,0],box[0])<np.minimum(target[:,1],box[1]),axis=1)
    contained=np.all((target[:,0]>=box[0])&(target[:,1]<=box[1]),axis=1)
    return [np.flatnonzero(s).tolist() for s in (inside,intersects,contained)]

def report(src_rows,dst_rows,scale,shift):
    source=np.concatenate(src_rows);target=np.concatenate(dst_rows)
    box=envelope(source)*scale+shift
    print('projected full text envelope',box.tolist())
    print('full envelope: center/intersects/contained counts',list(map(len,counts(target,box))))
    projected=[envelope(row)*scale+shift for row in src_rows]
    for i,box in enumerate(projected):
        print('source row',i+1,'projected envelope',box.tolist(),'center/intersects/contained counts',list(map(len,counts(target,box))))
    a=source.mean(1)*scale+shift
    # A center falling INSIDE a specific real glyph box is a stricter
    # coordinate readout than the broad envelope. Do not snap to nearest.
    hits=np.all((a[:,None,:]>=target[None,:,0,:])&(a[:,None,:]<target[None,:,1,:]),axis=2)
    print('glyph center hits',int(hits.sum()),'source hit count',int(hits.any(1).sum()),'distinct targets',int(hits.any(0).sum()))
    print('hits (0-based source,destination)',np.argwhere(hits).tolist() if len(source)<150 else 'omitted for control')
    return hits

def main():
    a,b=load(49),load(72)
    p32,p55=glyphs(a),glyphs(b)
    assert list(map(len,p32))==[25,23,23,21,22,7]
    assert list(map(len,p55))==[24,22,22,8]
    print('p55->p32:',SCALE.tolist(),SHIFT.tolist())
    f=report(p55,p32,SCALE,SHIFT)
    print('p32->p55:')
    g=report(p32,p55,1/SCALE,-SHIFT/SCALE)
    mutual=np.argwhere(f & g.T)
    print('mutual pairs',len(mutual),mutual.tolist())
    assert (int(f.sum()), int(g.sum()),len(mutual))==(25,26,22)
    p32_boxes=np.concatenate(p32); p55_boxes=np.concatenate(p55)
    assert list(map(len,counts(p32_boxes,envelope(p55_boxes)*SCALE+SHIFT)))==[27,28,26]
    assert counts(p55_boxes,(envelope(p32_boxes)-SHIFT)/SCALE)==[list(range(46))]*3
    # Reversible positive: a true transformed copy has exactly one hit per
    # source and destination glyph; deliberately use the actual p55 boxes.
    plant=p55_boxes*SCALE+SHIFT
    q=p55_boxes.mean(1)*SCALE+SHIFT
    h=np.all((q[:,None,:]>=plant[None,:,0,:])&(q[:,None,:]<plant[None,:,1,:]),axis=2)
    assert np.array_equal(h,np.eye(len(q),dtype=bool))
    print("positive planted affine-copy control: 76/76 unique exact correspondences")
    # Independently reused solved LP1 scroll frame, exact original identity
    # on entire top and bottom art strips. No text used in registration.
    c,d=load(6),load(7)
    for lo,hi in ((0,640),(3120,3600)):
        assert np.array_equal(c[lo:hi],d[lo:hi])
    # Identity is selected by identical corresponding art. Extend the same
    # central ordinary-glyph detector to y<3000 to cover the solved text.
    # The large red initial is outside ordinary glyph size bounds.
    cr,dr=glyphs(c,3000),glyphs(d,3000)
    print('LP1 06->07 reused solved frame, identical top/bottom pixels; ordinary text detector')
    print('extracted row counts',list(map(len,cr)),list(map(len,dr)))
    report(cr,dr,np.ones(2),np.zeros(2))

if __name__=='__main__': main()
