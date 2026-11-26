"""Fixed source-aligned two-sided vertical-residue detector; no OCR or image enhancement."""
import argparse, hashlib, io, json, zipfile
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, JpegImagePlugin

# Archive indices, not LP2 page numbers. Keep held 72 separate.
TRAIN = {11: [730, 954, 1142, 1331, 1575, 1763, 2007, 2196, 2384, 2572, 2760],
         73: [730, 918, 1106, 1946, 2134],
         71: [1162, 1350, 1539, 1727, 1915, 2104, 2292, 2480, 2668, 2857]}
HELD = {72: [730, 918, 1106, 1294]}
THRESHOLD = 100
RUN_THRESHOLD = 8

def read(z, n):
    raw = z.read(f'liber-primus-jpegs/{n:02}.jpg')
    return Image.open(io.BytesIO(raw)), hashlib.sha256(raw).hexdigest()

def candidates(im, centers):
    gray = np.array(im.convert('L'))
    _, _, stats, centroids = cv2.connectedComponentsWithStats((gray < THRESHOLD).astype('uint8'))
    dots = [(int(x), int(y), int(w), int(h), int(a), float(cx), float(cy))
            for (x,y,w,h,a),(cx,cy) in zip(stats[1:],centroids[1:])
            if 9 <= w <= 10 and 9 <= h <= 10 and a >= .95*w*h]
    return [(int(round(cx)), int(round(cy))) for _,_,_,_,_,cx,cy in dots
            if 610 <= cx <= 1780 and any(abs(cy-y)<=3 for y in centers)
            and not any((ox,oy)!=(cx,cy) and abs(ox-cx)<=36 and abs(oy-cy)<=46
                        for *_,ox,oy in dots)]

def score(a, x, y):
    # Same 7 central columns above/below; no need to estimate a clipping rectangle.
    def run(col):
        best = n = 0
        for v in col:
            n = n+1 if v < THRESHOLD else 0
            best = max(best,n)
        return best
    # Demand both ends in the *same* column. Windows leave center 48 px untested.
    return max(min(run(a[y-48:y-23,c]),run(a[y+24:y+49,c])) for c in range(x-3,x+4))

def jpeg(im, parent):
    b=io.BytesIO()
    im.save(b,format='JPEG',qtables=parent.quantization,subsampling=JpegImagePlugin.get_sampling(parent),optimize=True)
    raw=b.getvalue()
    return np.array(Image.open(io.BytesIO(raw)).convert('L')),hashlib.sha256(raw).hexdigest()

def controls(im, points, stroke):
    arr=np.array(im.convert('RGB'))
    results=[]
    for x,y in points:
        # 16-aligned crop origin preserves source JPEG block phase for 4:2:0.
        x0=((x-64)//16)*16; y0=((y-80)//16)*16
        crop=arr[y0:y0+160,x0:x0+144].copy(); cx=x-x0;cy=y-y0
        baseline=Image.fromarray(crop)
        normal,nhash=jpeg(baseline,im)
        # Layer a real LP1 vertical rune over the separator column, then restore
        # an opaque central strip of the original background+dot (partial erasure).
        layer=crop.copy(); h,w=stroke.shape[:2]
        xx=cx-w//2;yy=cy-h//2
        layer[yy:yy+h,xx:xx+w]=np.minimum(layer[yy:yy+h,xx:xx+w],stroke)
        rows={'xy':[x,y], 'normal':score(normal,cx,cy),'normal_jpeg':nhash,'edits':[]}
        for erase in (16,32,48,64,80,114):
            v=layer.copy();lo=cy-erase//2;hi=lo+erase;v[lo:hi,xx:xx+w]=crop[lo:hi,xx:xx+w]
            edited,ehash=jpeg(Image.fromarray(v),im)
            rows['edits'].append({'erase':erase,'score':score(edited,cx,cy), 'jpeg':ehash, 'identical_normal':ehash==nhash})
        # Entire overwritten rectangle restored: an exact source-history collision.
        v=layer.copy();v[yy:yy+h,xx:xx+w]=crop[yy:yy+h,xx:xx+w]
        full,fhash=jpeg(Image.fromarray(v),im)
        assert np.array_equal(v,crop) and np.array_equal(full,normal) and fhash==nhash
        rows['full_erase_exact_collision']=True;results.append(rows)
    return results

def experiment(archive,stage):
    with zipfile.ZipFile(archive) as z:
        lp1,_=read(z,11);stroke=np.array(lp1.convert('RGB'))[897:1011,1541:1551]
        assert stroke.shape==(114,10,3)
        out={'stage':stage,'signature':'two-sided vertical residual in same column','score_threshold':RUN_THRESHOLD,'pages':[]}
        for n,lines in (TRAIN if stage=='train' else HELD).items():
            im,sha=read(z,n); pts=candidates(im,lines);gray=np.array(im.convert('L'))
            scores=[{'xy':[x,y],'score':score(gray,x,y)} for x,y in pts]
            synth=controls(im,pts,stroke)
            out['pages'].append({'archive_index':n,'sha256':sha,'candidates':scores,'controls':synth,
                                 'original_positive':sum(v['score']>=RUN_THRESHOLD for v in scores),
                                 'normal_positive':sum(v['normal']>=RUN_THRESHOLD for v in synth),
                                 'synthetic_positive':{str(e):sum(v['edits'][i]['score']>=RUN_THRESHOLD for v in synth) for i,e in enumerate((16,32,48,64,80,114))}})
        return out
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('stage',choices=['train','held']);p.add_argument('--out',type=Path);a=p.parse_args()
    r=experiment(a.archive,a.stage);s=json.dumps(r,indent=2);a.out.write_text(s+'\n') if a.out else print(s)
