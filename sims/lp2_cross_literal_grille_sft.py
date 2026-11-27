"""Fixed-coordinate source test for Director #3163. Run with Pillow, NumPy, SciPy.
Argument: original JPEG directory or ZIP of the original JPEGs.
"""
import sys, json
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
from PIL import Image
import numpy as np
from scipy.ndimage import label, find_objects, binary_fill_holes

BOXES = ((57,1684,547,2960),(1853,640,2343,1916))
# 12/12/9 rune baselines visually observable from original pages; exclude footer art.
TEXT_Y = ((650,2870),(650,2870),(650,2310))
CONN = np.array([[0,1,0],[1,1,1],[0,1,0]])

def get_image(source, i):
    name=f'{i:02}.jpg'
    if source.is_dir():
        return np.asarray(Image.open(source/name).convert('L'))
    with ZipFile(source) as z:
        member=next(n for n in z.namelist() if n.rsplit('/',1)[-1]==name)
        return np.asarray(Image.open(BytesIO(z.read(member))).convert('L'))

def apertures(ink):
    # Padding means an edge-connected white pixel is exterior, never a hole.
    a=np.pad(ink,1)
    h=(binary_fill_holes(a,structure=CONN)&~a)[1:-1,1:-1]
    ids,n=label(h,structure=CONN)
    sizes=np.bincount(ids.ravel())[1:]
    boxes=[(s[1].stop-s[1].start,s[0].stop-s[0].start) for s in find_objects(ids)]
    return h, {'count':int(n),'pixels':int(h.sum()),'largest_area':int(max(sizes,default=0)), 'max_width':max((w for w,h in boxes),default=0),'max_height':max((h for w,h in boxes),default=0)}

def main(source):
    # Topology positive: two real enclosed apertures; open-edge notch is not one.
    plant=np.ones((25,25),bool);plant[3:7,4:8]=False;plant[12:16,14:20]=False;plant[:4,21:24]=False
    _,check=apertures(plant);assert check=={'count':2,'pixels':40,'largest_area':24,'max_width':6,'max_height':4}
    # A complete two-position rectangular grille: one cell from each half-turn orbit.
    cells=np.arange(24).reshape(4,6);m=np.zeros_like(cells,bool);m[:2,:]=True
    masks=(m,m[::-1,::-1]);assert np.all(np.sum(masks,axis=0)==1)
    plain=np.arange(24);cipher=np.empty_like(cells)
    for j,mask in enumerate(masks):cipher[mask]=plain[12*j:12*(j+1)]
    assert np.array_equal(np.concatenate([cipher[mask] for mask in masks]),plain)
    out=[]
    for page,i in enumerate(range(17,20)):
        a=get_image(source,i); assert a.shape==(3600,2400)
        # Original visible central text region, independently bounded from preview.
        y0,y1=TEXT_Y[page];text=np.zeros_like(a,bool);text[y0:y1,550:1850]=a[y0:y1,550:1850]<125
        ys,xs=np.where(text);text_bbox=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
        row={'p':page,'text_bbox':text_bbox,'ink_pixels':int(text.sum()),'figures':[]}
        for x0,y0,x1,y1 in BOXES:
            ink=a[y0:y1,x0:x1]<125
            holes,stats=apertures(ink)
            mask=np.zeros_like(text);mask[y0:y1,x0:x1]=holes
            rect=np.zeros_like(text);rect[y0:y1,x0:x1]=True
            stats.update({'rectangle':[x0,y0,x1,y1],'ink_fraction':float(ink.mean()),'hole_overlap_0':int((mask&text).sum()),'hole_overlap_180':int((mask[::-1,::-1]&text).sum()),'rectangle_overlap_0':int((rect&text).sum()),'rectangle_overlap_180':int((rect[::-1,::-1]&text).sum())})
            assert not any(stats[k] for k in ('hole_overlap_0','hole_overlap_180','rectangle_overlap_0','rectangle_overlap_180'))
            row['figures'].append(stats)
        out.append(row)
    print(json.dumps({'threshold':125,'hole_connectivity':4,'control':check,'halfturn_control_cells':24,'original':out},indent=2))

if __name__=='__main__':
    main(Path(sys.argv[1] if len(sys.argv)>1 else 'resources/liber-primus'))
