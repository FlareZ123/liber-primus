"""Read-only LP2 JPEG chroma gate; requires compiled sibling C reader, numpy, Pillow, scipy.
Usage: python lp2_chroma_source_sft.py IMAGE_DIRECTORY READER > output.json
Coordinates are zero-based 16x16 luminance pixel blocks, files 17..74.
"""
import sys, subprocess, tempfile, hashlib, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_dilation, sobel
from scipy.stats import spearmanr
from scipy.fft import idctn
ROOT, READER = Path(sys.argv[1]), str(Path(sys.argv[2]).resolve())
RATIO = .337472
MARGIN = 8  # engineering tolerance, not a universal JPEG error bound

def read(path):
    raw = subprocess.check_output([READER, str(path)])
    w,h = map(int,np.frombuffer(raw[:4], dtype='<u2'))
    if w == h == 0:
        assert len(raw)==4
        return None
    q=np.frombuffer(raw[4:260],dtype='<u2').reshape(2,64).astype(float)
    v=np.frombuffer(raw[260:],dtype='<i2').reshape(h,w,2,64)
    return q,v

def measure(path, data):
    q,v=data; h,w=v.shape[:2]; d=v*q
    nz=(v!=0).any(axis=(2,3)); residual=d[:,:,0]+RATIO*d[:,:,1]
    bound=(q[0]+RATIO*q[1])/2
    violation=abs(residual)>bound+MARGIN; bad=violation.any(axis=-1)
    im=np.asarray(Image.open(path).convert('RGB'),dtype=np.int16)
    r,g,b=im.transpose(2,0,1)
    strong=((r-g)>20)&((r-b)>20)
    strong=strong.reshape(h,16,w,16).any(axis=(1,3))
    outside=nz&~binary_dilation(strong,iterations=1)
    def bounds(mask):
        y,x=np.where(mask)
        return [int(x.min()),int(y.min()),int(x.max()),int(y.max())] if len(x) else None
    stats=dict(nonzero=int(nz.sum()),red_blocks=int(strong.sum()),outside_red=int(outside.sum()),
        outside_bounds=bounds(outside),violating_blocks=int(bad.sum()),violating_coefficients=int(violation.sum()),
        violation_bounds=bounds(bad),sha256=hashlib.sha256(v.tobytes()).hexdigest())
    return stats,residual,nz,bad

with tempfile.TemporaryDirectory() as tmp:
    tmp=Path(tmp); base=Image.new('RGB',(64,64),'white'); draw=ImageDraw.Draw(base)
    draw.rectangle((2,2,12,12),fill=(0,0,0)); draw.polygon([(16,1),(32,15),(21,24)],fill=(192,0,0))
    control={}
    for name,plant in [('red_gray',False),('nonred',True)]:
        im=base.copy()
        if plant: ImageDraw.Draw(im).rectangle((32,32,47,47),fill=(0,200,0))
        path=tmp/f'{name}.jpg'; im.save(path,quality=95,subsampling=2)
        s,_,_,bad=measure(path,read(path)); control[name]=s
        assert bool(bad.any())==plant
        if plant: assert bad[2,2]

pages={}; keep={}; p22={}
for i in range(17,75):
    path=ROOT/f'{i:02d}.jpg'; data=read(path)
    if data is None: pages[str(i)]={'components':1}; continue
    q,v=data; s,residual,nz,bad=measure(path,data); pages[str(i)]={'components':3,**s}
    if i in [21,22,23,24,25,26,27,28,29,30,31,51,52,53,54,55,56]: keep[i]=data
    if i==39:
        im=np.array(Image.open(path).convert('L'),dtype=float)
        dark=255-im.reshape(225,16,150,16).mean(axis=(1,3))
        edge=np.hypot(sobel(im,0),sobel(im,1)).reshape(225,16,150,16).mean(axis=(1,3))
        rms=np.sqrt((residual**2).mean(axis=-1))
        p22=dict(nonzero_above_y190=int(nz[:190].sum()),nonzero_below_y190=int(nz[190:].sum()),
            violations_above_y190=int(bad[:190].sum()),rho_darkness=float(spearmanr(rms[196:].ravel(),dark[196:].ravel()).statistic),
            rho_edges=float(spearmanr(rms[196:].ravel(),edge[196:].ravel()).statistic))
        # Visual diagnostic: dequantized residual, at native chroma sampling.
        pix=idctn(residual.reshape(225,150,8,8),axes=(-2,-1),norm='ortho').transpose(0,2,1,3).reshape(1800,1200)
        p22['residual_pixel_range']=[float(pix.min()),float(pix.max())]
        # Optional diagnostic stays outside original source directory.
        if len(sys.argv)>3: Image.fromarray(np.uint8(np.clip(128+12*pix[-260:],0,255))).save(sys.argv[3])

pairs=[]
for a,b in [(21,22),(21,23),(21,24),(26,28),(26,30),(27,29),(27,25),(27,31),(51,52),(51,53),(51,54),(51,55),(51,56)]:
    qa,va=keep[a];qb,vb=keep[b];mask=(va!=0).any(axis=(2,3)); same=(va==vb).all(axis=(2,3))&mask
    pairs.append(dict(a=a,b=b,nonzero_a=int(mask.sum()),same_nonzero_blocks=int(same.sum()),same_quant=bool(np.array_equal(qa,qb)),same_plane=bool(np.array_equal(va,vb))))
print(json.dumps(dict(control=control,pages=pages,p22=p22,pairs=pairs),indent=2))
