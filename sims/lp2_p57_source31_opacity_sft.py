"""Original LP2 p57 source-plate 31-parameter GIMP Dissolve surrogate.

Reproduce: python sims/lp2_p57_source31_opacity_sft.py
Requires Pillow, NumPy, OpenCV, PyTorch. Source JPEGs 41/43/74.jpg.
This is an EXPLORATORY fitted surrogate; it is not SECRA's joint_k17_2 master.
"""
import json
import os
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F

BASE = Path(os.environ.get('LP2_RESOURCE_DIR', Path(__file__).resolve().parent.parent / 'resources/liber-primus'))
H, W = 274, 293
PARAMS = [
 -0.4197134, -1.0596066, 0.27187684, 0.8301954, -0.04895701,
 -0.02297604, -0.02351705, -0.02941094, 0.0339827, 0.11197183,
 0.12013306, 0.25721604, -0.047982, -0.10246871, -0.06210231,
 0.22109462, 0.25291213, 0.40548295, -0.20955533, -0.41372782,
 -3.219688, 0.16613685, -0.04917186, 0.40276337, -0.577023,
 -0.07598461, 0.00996666, -0.52790207, -0.09529118, 0.04888418,
 -0.14666124,
]

def read(n):
    return np.asarray(Image.open(BASE / f'{n:02}.jpg').convert('L'))

def score(bits, target, mask):
    tp = int(np.count_nonzero(bits & target & mask))
    fp = int(np.count_nonzero(bits & ~target & mask))
    fn = int(np.count_nonzero(~bits & target & mask))
    return {'tp': tp, 'fp': fp, 'fn': fn, 'f1': 2*tp/(2*tp+fp+fn)}

def run():
    torch.set_num_threads(2)
    p24, p26, p57 = read(41), read(43), read(74)
    assert np.array_equal(p24[900:2500, :600], p26[900:2500, :600])
    xs = np.rint(658+(np.arange(W)+.5)*25/6).astype(int)
    ys = np.rint(1979+(np.arange(H)+.5)*25/6).astype(int)
    target = p57[np.ix_(ys, xs)] < 128
    assert target.sum() == 2033
    rowseeds = np.random.RandomState(314159265).randint(0, 2**32, 4096, dtype=np.uint32)
    field = np.empty((H,W), np.uint8)
    for row in range(H):
        raw = np.random.RandomState(int(rowseeds[(row-9)%4096])).randint(0, 2**32, W+4, dtype=np.uint32)
        field[row] = (raw[4:]%np.uint32(255)).astype(np.uint8)
    assert all(field[y,x] == 0 and target[y,x] for x,y in [(53,250),(44,256),(41,265),(57,269)])
    source = cv2.GaussianBlur(p24[1100:1830, :600].astype(np.float32), (0,0), 1.2)
    src = torch.from_numpy(source)[None,None]
    rr, cc = np.meshgrid(np.arange(H), np.arange(W), indexing='ij')
    u = torch.tensor(cc/W, dtype=torch.float32)
    v = torch.tensor(rr/H, dtype=torch.float32)
    cc = torch.tensor(cc, dtype=torch.float32)
    rr = torch.tensor(rr, dtype=torch.float32)
    centers = [(a,b) for a in (.2,.5,.8) for b in (.25,.75)]
    rbf = torch.stack([torch.exp(-((u-a)**2+(v-b)**2)/(2*.32**2)) for a,b in centers])
    rx,ry = 2*u-1,2*v-1
    poly = torch.stack([rx,ry,rx**2,ry**2,rx*ry,rx**3,ry**3,rx**2*ry,rx*ry**2,torch.cos(torch.pi*rx)*torch.cos(torch.pi*ry)])
    p = torch.tensor(PARAMS, dtype=torch.float32)
    assert len(p) == 31
    with torch.no_grad():
        x = -23.476689+20*p[0]+(2.518272+.25*p[2])*cc+(.007736+.2*p[4])*rr+10*(p[5:11,None,None]*rbf).sum(0)
        y = 1157.988073+20*p[1]+(2.399729+.25*p[3])*rr+10*(p[11:17,None,None]*rbf).sum(0)
        grid = torch.stack((x/599*2-1,(y-1100)/729*2-1),-1)[None]
        values = F.grid_sample(src, grid, padding_mode='zeros', align_corners=True)[0,0]
        inrange = (x>=0)&(x<=599)&(y>=1100)&(y<=1829)
        darkness = torch.where(inrange,(255-values).clamp(0,255)/255,torch.zeros_like(values))
        gamma = torch.exp(.2*p[18]); gain=.904071*torch.exp(.25*p[17])
        local = torch.exp(.35*(p[21:31,None,None]*poly).sum(0))
        alpha = (255*gain*local*(darkness+1e-8).pow(gamma)+2*p[19]).clamp(0,255).numpy()
    bits = alpha > field.astype(np.float32)+.5
    seed = np.random.default_rng(3301)
    tiles = seed.random((H//16+1,W//16+1)) < .65
    training = tiles[np.arange(H)[:,None]//16,np.arange(W)[None,:]//16]
    results = {
      'model': '31-parameter exploratory surrogate, held-out checkpoint selected post hoc',
      'source_black_cells': int(target.sum()),
      'training': score(bits,target,training),
      'spatial_holdout': score(bits,target,~training),
      'whole_image': score(bits,target,np.ones_like(target,bool)),
      'mismatch': int(np.count_nonzero(bits^target)),
      'false_positive_components': None,
      'p24_p26_equal': True,
    }
    ncomp, labels = cv2.connectedComponents((bits&~target).astype(np.uint8), connectivity=8)
    sizes = np.bincount(labels.ravel())[1:]
    results['false_positive_components'] = sorted(map(int, sizes), reverse=True)[:6]
    assert 355 <= results['mismatch'] <= 365
    assert results['spatial_holdout']['f1'] > .92
    print(json.dumps(results,indent=2))

if __name__ == '__main__':
    run()
