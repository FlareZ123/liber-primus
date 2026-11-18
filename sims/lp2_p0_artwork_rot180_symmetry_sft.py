"""SFT: original LP2 p0 artwork contains an exact 180-degree paired illustration and an enlarged F endpoint marker.

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

# The large red sigil at the title's left is a scaled copy of the eighth
# red title rune. Segment only substantial red components in the title band.
r,g,b=(rgb[:,:,j].astype(np.int16) for j in range(3))
red=(((r-g)>50)&((r-b)>50)&(r>75)).astype(np.uint8)
rn,rlabels,rstats,_=cv2.connectedComponentsWithStats(red,8)
red_components=[]
for i in range(1,rn):
    x=int(rstats[i,cv2.CC_STAT_LEFT]); y=int(rstats[i,cv2.CC_STAT_TOP])
    w=int(rstats[i,cv2.CC_STAT_WIDTH]); h=int(rstats[i,cv2.CC_STAT_HEIGHT])
    area=int(rstats[i,cv2.CC_STAT_AREA])
    if area>1000 and y<800:
        red_components.append((i,x,y,w,h,area))
red_components.sort(key=lambda v:v[1])
assert red_components[0][1:6]==(601,667,150,498,32003), red_components[0]
first_word_components=red_components[1:9]
assert len(first_word_components)==8
assert [v[1] for v in first_word_components]==[772,822,881,919,968,1028,1085,1139]

def red_component_mask(item):
    i,x,y,w,h,_=item
    return (rlabels[y:y+h,x:x+w]==i).astype(np.uint8)

sigil=red_component_mask(red_components[0])
ious=[]
for item in first_word_components:
    glyph=red_component_mask(item)
    scaled=cv2.resize(glyph,(sigil.shape[1],sigil.shape[0]),interpolation=cv2.INTER_NEAREST)
    intersection=int(np.logical_and(sigil,scaled).sum())
    union=int(np.logical_or(sigil,scaled).sum())
    ious.append(intersection/union)
best=int(np.argmax(ious))
assert best==7, ious
assert ious[7]>0.94, ious
assert ious[7]-max(ious[:7])>0.40, ious
# The canonical p0 first word is S H E O G M IA F, so component 8 is F.
print({
    "red_sigil_bbox": red_components[0][1:6],
    "first_word_glyph_x": [v[1] for v in first_word_components],
    "sigil_iou_by_first_word_position": ious,
    "best_match_position_one_based": best+1,
    "best_match_rune": "F",
})
print("PASS: p0's large red sigil is an enlarged copy of the first red word's final F rune, marking the reversal endpoint.")
