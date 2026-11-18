"""SFT: original LP2 p0 artwork contains an exact 180-degree paired illustration.

Reads only resources/liber-primus/17.jpg (physical LP2 p0).
Requires numpy, Pillow, opencv-python-headless.
Run: python sims/lp2_p0_artwork_rot180_symmetry_sft.py
"""
from __future__ import annotations
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/"resources"/"liber-primus"/"17.jpg"

with Image.open(PATH) as image:
    rgb=np.asarray(image.convert("RGB"))
assert rgb.shape==(3600,2400,3), rgb.shape
black=np.all(rgb<80,axis=2).astype(np.uint8)
count,labels,stats,centers=cv2.connectedComponentsWithStats(black,8)

large=[]
for i in range(1,count):
    area=int(stats[i,cv2.CC_STAT_AREA])
    if area>100_000:
        x=int(stats[i,cv2.CC_STAT_LEFT]); y=int(stats[i,cv2.CC_STAT_TOP])
        w=int(stats[i,cv2.CC_STAT_WIDTH]); h=int(stats[i,cv2.CC_STAT_HEIGHT])
        large.append((i,x,y,w,h,area,centers[i]))
assert len(large)==2, large
large.sort(key=lambda v:v[2])
a,b=large
assert (a[1],a[2],a[3],a[4],a[5])==(1853,649,490,1254,145054), a
assert (b[1],b[2],b[3],b[4],b[5])==(57,1697,490,1254,144944), b

def component_mask(item):
    i,x,y,w,h,_,_=item
    return (labels[y:y+h,x:x+w]==i).astype(np.uint8)

ma=component_mask(a)
mb=np.rot90(component_mask(b),2)
intersection=int(np.logical_and(ma,mb).sum())
union=int(np.logical_or(ma,mb).sum())
iou=intersection/union
assert iou>0.985, iou

# A true 180-degree pair about the page center has centroid sums W-1,H-1.
cx=float(a[6][0]+b[6][0]); cy=float(a[6][1]+b[6][1])
assert abs(cx-(rgb.shape[1]-1))<0.1, cx
assert abs(cy-(rgb.shape[0]-1))<0.1, cy

print({
    "image": str(PATH.relative_to(ROOT)),
    "shape": rgb.shape,
    "components": [
        {"bbox": a[1:6], "centroid": [float(a[6][0]),float(a[6][1])]},
        {"bbox": b[1:6], "centroid": [float(b[6][0]),float(b[6][1])]},
    ],
    "rot180_iou": iou,
    "centroid_sum": [cx,cy],
    "page_center_double": [rgb.shape[1]-1,rgb.shape[0]-1],
})
print("PASS: p0's two large black illustrations are near-pixel-identical 180-degree counterparts centered on the physical page.")
