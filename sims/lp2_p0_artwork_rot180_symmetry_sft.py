"""SFT: original LP2 p0 artwork contains an exact 180-degree paired illustration and validates the oversized initial S.

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

# Independent binary-image challenge: can native differences of the two
# author-drawn rotated copies carry a substantial hidden symbol? This
# excludes >3px enclosed holes/strokes only, not subpixel DCT steganography.
xor=np.bitwise_xor(ma,mb)
xor_count=int(xor.sum())
count_xor,_,comp_xor,_=cv2.connectedComponentsWithStats(xor,8)
xor_areas=sorted((int(c) for c in comp_xor[1:,4]),reverse=True)
assert (xor_count,count_xor-1,xor_areas[0])==(2074,684,49)
def deep_holes(left,right,radius):
    eroded=cv2.erode(left,np.ones((2*radius+1,2*radius+1),np.uint8))
    return int(np.count_nonzero((eroded>0)&(right==0)))
deep=[(r,deep_holes(ma,mb,r),deep_holes(mb,ma,r)) for r in (1,2,3)]
assert deep==[(1,11,5),(2,1,0),(3,0,0)]
test_mask=cv2.erode(ma&mb,np.ones((21,21),np.uint8))
ys,xs=np.nonzero(test_mask)
assert xs.size
yy,xx=int(ys[0]),int(xs[0])
planted=mb.copy()
planted[yy-4:yy+5,xx-4:xx+5]=0
assert deep_holes(ma,planted,3)>0
print({"xor_pixels":xor_count,"xor_component_count":count_xor-1,
       "max_xor_component":xor_areas[0],"deep_holes_radius1_2_3":deep,
       "planted_9px_hole_detected":deep_holes(ma,planted,3)})
print("PASS: original rotated art contains no >3px enclosed patch discrepancy.")



# The source transcription records the large red glyph as the oversized
# first S of the 8-rune word. Validate that identification directly against
# the second red word's ordinary-sized initial S, without using OCR.
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
ordinary=red_components[1:]
assert [v[1] for v in ordinary]==[772,822,881,919,968,1028,1085,1139,1179,1236,1295,1351]

def red_component_mask(item):
    i,x,y,w,h,_=item
    return (rlabels[y:y+h,x:x+w]==i).astype(np.uint8)

oversized_s=red_component_mask(red_components[0])
ious=[]
for item in ordinary:
    glyph=red_component_mask(item)
    scaled=cv2.resize(glyph,(oversized_s.shape[1],oversized_s.shape[0]),interpolation=cv2.INTER_NEAREST)
    intersection=int(np.logical_and(oversized_s,scaled).sum())
    union=int(np.logical_or(oversized_s,scaled).sum())
    ious.append(intersection/union)
best=int(np.argmax(ious))
# ordinary index 7 (x=1139) is the first rune of the second red word, also S.
assert best==7, ious
assert ious[best]>0.94, ious
assert ious[best]-max(v for i,v in enumerate(ious) if i!=best)>0.40, ious

print({
    "oversized_initial_bbox": red_components[0][1:6],
    "ordinary_red_glyph_x": [v[1] for v in ordinary],
    "oversized_s_iou_by_ordinary_position": ious,
    "best_match_ordinary_index_zero_based": best,
    "best_match_x": ordinary[best][1],
    "best_match_rune": "S (second word initial)",
})
print("PASS: p0's oversized first S is a scaled match to the second red word's ordinary initial S; it is not a separate endpoint marker.")
