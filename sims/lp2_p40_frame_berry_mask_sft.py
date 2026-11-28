"""Original-source p40--p55 frame berry-mask census.

Read-only test over all 75 original 2400x3600 JPEGs. It quantifies the small
bilateral berry ornament in the exact p40--p55 frame.

Run: python sims/lp2_p40_frame_berry_mask_sft.py
Requires Pillow and NumPy.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
BLACK = 80
RADIUS = 10
PATCH_RADIUS = 18
RIGHT_CENTERS = [(2003,1476),(2033,1497),(1975,1499),(1980,1533),(2019,1540)]
LEFT_CENTERS = [(2399-x,y) for x,y in RIGHT_CENTERS]
EXPECTED_RIGHT_COUNTS = [316,317,317,307,311]
EXPECTED_LEFT_COUNTS = [0,317,317,307,0]
EXPECTED_RIGHT_MASK = [1,1,1,1,1]
EXPECTED_LEFT_MASK = [0,1,1,1,0]
EXPECTED_ARCHIVES = list(range(57,73))
EXPECTED_SHA57 = "3f5af995b39f94f268d4aa94825a10f2429f4a3affa1921a7f627e6d1bfcfb69"
EXPECTED_LEFT_ROI_SHA = "4a735b73a6f2169358635b1ad52e140c1d4099837c43359df07c396d4e5434a4"
EXPECTED_RIGHT_ROI_SHA = "41eb1e9056d3f463a3dd267b7dbe4bf4780c6f1b6ab779297a2c430806750b49"

def load(page:int)->np.ndarray:
    source=ROOT/f"{page:02d}.jpg"
    if page==57:
        assert hashlib.sha256(source.read_bytes()).hexdigest()==EXPECTED_SHA57
    image=np.asarray(Image.open(source).convert("L"))
    assert image.shape==(3600,2400),(page,image.shape)
    return image

YY,XX=np.ogrid[-RADIUS:RADIUS+1,-RADIUS:RADIUS+1]
CIRCLE=XX*XX+YY*YY<=RADIUS*RADIUS

def circle_black_count(image:np.ndarray,center:tuple[int,int])->int:
    x,y=center
    p=image[y-RADIUS:y+RADIUS+1,x-RADIUS:x+RADIUS+1]
    return int(np.count_nonzero((p<BLACK)&CIRCLE))

def patch(image:np.ndarray,center:tuple[int,int])->np.ndarray:
    x,y=center;r=PATCH_RADIUS
    return image[y-r:y+r+1,x-r:x+r+1]

def iou(a:np.ndarray,b:np.ndarray)->float:
    aa=a<BLACK;bb=b<BLACK
    return float(np.count_nonzero(aa&bb))/float(np.count_nonzero(aa|bb))

rows=[];left_roi_matches=[];right_roi_matches=[]
base=load(57)
left_roi=base[1440:1560,340:445]
right_roi=base[1440:1565,1955:2050]
assert hashlib.sha256(left_roi.tobytes()).hexdigest()==EXPECTED_LEFT_ROI_SHA
assert hashlib.sha256(right_roi.tobytes()).hexdigest()==EXPECTED_RIGHT_ROI_SHA

for archive in range(75):
    image=load(archive)
    right=[circle_black_count(image,c) for c in RIGHT_CENTERS]
    left=[circle_black_count(image,c) for c in LEFT_CENTERS]
    right_mask=[int(value>250) for value in right]
    left_mask=[int(value>250) for value in left]
    rows.append((archive,right,left,right_mask,left_mask))
    if hashlib.sha256(image[1440:1560,340:445].tobytes()).hexdigest()==EXPECTED_LEFT_ROI_SHA:
        left_roi_matches.append(archive)
    if hashlib.sha256(image[1440:1565,1955:2050].tobytes()).hexdigest()==EXPECTED_RIGHT_ROI_SHA:
        right_roi_matches.append(archive)

p40=rows[57]
assert p40[1]==EXPECTED_RIGHT_COUNTS
assert p40[2]==EXPECTED_LEFT_COUNTS
assert p40[3]==EXPECTED_RIGHT_MASK
assert p40[4]==EXPECTED_LEFT_MASK
signature=[archive for archive,_r,_l,rmask,lmask in rows if rmask==EXPECTED_RIGHT_MASK and lmask==EXPECTED_LEFT_MASK]
assert signature==EXPECTED_ARCHIVES
assert left_roi_matches==EXPECTED_ARCHIVES
assert right_roi_matches==EXPECTED_ARCHIVES
assert [n-17 for n in signature]==list(range(40,56))

pair_ious=[iou(np.fliplr(patch(base,r)),patch(base,l)) for r,l in zip(RIGHT_CENTERS,LEFT_CENTERS)]
assert pair_ious[1]>0.999 and pair_ious[2]>0.997 and pair_ious[3]>0.999
assert pair_ious[0]<0.01 and pair_ious[4]<0.05

print({
 "status":"PASS","archive_pages":signature,"lp2_pages":[n-17 for n in signature],
 "right_black_counts":p40[1],"left_black_counts":p40[2],
 "right_filled_mask":p40[3],"left_filled_mask":p40[4],
 "right_filled":sum(p40[3]),"left_filled":sum(p40[4]),
 "unfilled_left_slots":sum(p40[3])-sum(p40[4]),
 "pair_iou80":[round(v,9) for v in pair_ious],
 "left_roi_exact_archives":left_roi_matches,"right_roi_exact_archives":right_roi_matches,
 "decision":"Unique p40-p55 frame carries a 3-left/5-right filled-berry cardinality with two missing left counterparts."
})
