"""Source-image-only LP2 p3–7 scrollwork/illuminated-cap path gate.

Read-only Python 3.12/Pillow+numpy+OpenCV SFT; original, unchanged
2400x3600 JPEGs in resources/liber-primus/20.jpg..24.jpg.
Reports whether the margin scrolls distinguish page-specific directions
and registers every genuinely large red initial before any decipherment.
"""
from pathlib import Path
import json

import cv2
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
ims = {
    p: np.asarray(Image.open(root / f"{p+17}.jpg").convert("RGB"))
    for p in range(3,8)
}
assert all(img.shape == (3600,2400,3) for img in ims.values())

# The bands exclude the actual text and large initials; they are
# physically identical page coordinates, never cipher-score-selected.
regions = {"left":(10,400), "right":(2000,2390)}
out = {"originals": list(range(20,25)), "margins": {}}
for name,(a,b) in regions.items():
    region = {p: ims[p][450:2800,a:b,:] for p in ims}
    identical = all(np.array_equal(region[4],region[p]) for p in [5,6,7])
    assert identical, (name,"non-identical p4–7 scroll")
    # p3 has a slightly differently rasterized rendition of the same
    # scroll silhouette, not a mirrored or page-number-specific route.
    first = np.mean(region[3],axis=2)<110
    second = np.mean(region[4],axis=2)<110
    overlap = float(np.count_nonzero(first & second) /
                    np.count_nonzero(first | second))
    assert 0.93 < overlap < 0.96, (name,overlap)
    out["margins"][name] = {
        "crop":[a,b,450,2800],
        "p4_through_p7_exact_full_rgb_identical":identical,
        "p3_p4_thresholded_ink_iou":round(overlap,6),
    }

# Fixed published source-red pixel class; count *connected initial
# components* rather than any ordinary red inline rune.
redcaps={}
for p,image in ims.items():
    rgb=image.astype(np.int16)
    mask=((rgb[:,:,0]>115)&(rgb[:,:,0]>1.5*rgb[:,:,1])&
          (rgb[:,:,0]>1.5*rgb[:,:,2])&(rgb[:,:,1]<145)).astype("uint8")
    n,lab,stats,ctr=cv2.connectedComponentsWithStats(mask,8)
    caps=[{"area":int(s[cv2.CC_STAT_AREA]),"bbox":list(map(int,s[:4]))}
          for s in stats[1:] if s[cv2.CC_STAT_AREA]>20000]
    redcaps[p] = sorted(caps,key=lambda item:item["bbox"][1])
assert [len(redcaps[p]) for p in range(3,8)] == [2,0,0,1,0]
assert [c["bbox"][:2] for c in redcaps[3]] == [[601,669],[601,2098]]
assert [c["bbox"][:2] for c in redcaps[6]] == [[601,1721]]
out["source_red_capitals"]=redcaps
out["decision"]=(
    "Both margin motifs are identical page-specific objects p4–p7. "
    "Three large red initials mark prose starts p3 twice and p6 once, "
    "without a drawn line/arrow from a scroll tip to a word or a forced "
    "off-page reading order. No selected reversible text path or plaintext."
)
print(json.dumps(out,indent=2))
print("PASS original-source scroll and illuminated-cap visual gate")
