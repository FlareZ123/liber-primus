"""Fit the original p24/p57 31-parameter exploratory GIMP opacity surrogate.

Requires NumPy, OpenCV, Pillow and PyTorch. Uses unedited 41.jpg and 74.jpg.
This is a fit to one known solved image; it is NOT the historical GIMP
master, SECRA joint_k17_2, or evidence for an encoded LP2 key.
Reproducer: python sims/lp2_p57_source31_fit.py
"""
from pathlib import Path
import os

import cv2
import numpy as np
from PIL import Image
import torch
from torch.nn import functional as F

torch.set_num_threads(2)
ROOT = Path(os.environ.get("LP2_RESOURCE_DIR", Path(__file__).resolve().parent.parent / "resources/liber-primus"))
def scan(n):
    return np.asarray(Image.open(ROOT / f"{n:02}.jpg").convert("L"))

a = scan(41)
b = scan(74)
H, W = 274, 293
xs = np.rint(658 + (np.arange(W) + .5)*25/6).astype(int)
ys = np.rint(1979 + (np.arange(H) + .5)*25/6).astype(int)
target = b[np.ix_(ys, xs)] < 128
assert target.sum() == 2033
row_seed = np.random.RandomState(314159265).randint(0,2**32,4096,dtype=np.uint32)
R = np.empty((H,W),np.uint8)
for y in range(H):
    raw=np.random.RandomState(int(row_seed[(y-9)%4096])).randint(0,2**32,W+4,dtype=np.uint32)
    R[y]=(raw[4:]%np.uint32(255)).astype(np.uint8)
assert [int(R[y,x]) for x,y in [(53,250),(44,256),(41,265),(57,269)]] == [0]*4

source=cv2.GaussianBlur(a[1100:1830,:600].astype(np.float32),(0,0),1.2)
src=torch.from_numpy(source)[None,None]
rr,cc=np.meshgrid(np.arange(H),np.arange(W),indexing="ij")
u=torch.tensor(cc/W,dtype=torch.float32)
v=torch.tensor(rr/H,dtype=torch.float32)
cc=torch.tensor(cc,dtype=torch.float32)
rr=torch.tensor(rr,dtype=torch.float32)
tgt=torch.tensor(target,dtype=torch.float32)
th=torch.tensor(R,dtype=torch.float32)
tiles=np.random.default_rng(3301).random((H//16+1,W//16+1)) < .65
train_tiles=tiles[np.arange(H)[:,None]//16,np.arange(W)[None,:]//16]
training=torch.tensor(train_tiles)
centers=[(x,y) for x in (.2,.5,.8) for y in (.25,.75)]
rbf=torch.stack([torch.exp(-((u-x)**2+(v-y)**2)/(2*.32**2)) for x,y in centers])
rx=2*u-1
ry=2*v-1
poly=torch.stack([rx,ry,rx**2,ry**2,rx*ry,rx**3,ry**3,rx**2*ry,rx*ry**2,torch.cos(torch.pi*rx)*torch.cos(torch.pi*ry)])
p=torch.nn.Parameter(torch.zeros(31))
with torch.no_grad():
    p[20]=-1
optimizer=torch.optim.Adam([p],lr=.028)

def prediction(p):
    x=-23.476689+20*p[0]+(2.518272+.25*p[2])*cc+(.007736+.2*p[4])*rr+10*(p[5:11,None,None]*rbf).sum(0)
    y=1157.988073+20*p[1]+(2.399729+.25*p[3])*rr+10*(p[11:17,None,None]*rbf).sum(0)
    grid=torch.stack((x/599*2-1,(y-1100)/729*2-1),-1)[None]
    vals=F.grid_sample(src,grid,padding_mode="zeros",align_corners=True)[0,0]
    inside=(x>=0)&(x<=599)&(y>=1100)&(y<=1829)
    darkness=torch.where(inside,(255-vals).clamp(0,255)/255,torch.zeros_like(vals))
    gamma=torch.exp(.2*p[18])
    gain=.904071*torch.exp(.25*p[17])
    local=torch.exp(.35*(p[21:31,None,None]*poly).sum(0))
    alpha=(255*gain*local*(darkness+1e-8).pow(gamma)+2*p[19]).clamp(0,255)
    temperature=1+torch.exp(p[20])*8
    return (alpha-th-.5)/temperature

def count(logits, mask):
    pred=logits.detach().numpy()>0
    tp=int((pred&target&mask).sum())
    fp=int((pred&~target&mask).sum())
    fn=int((~pred&target&mask).sum())
    return (tp,fp,fn,round(2*tp/(2*tp+fp+fn),8))

best=(-1,None,None)
for step in range(1801):
    optimizer.zero_grad()
    logits=prediction(p)
    prob=logits.sigmoid()
    tp=(prob*tgt*training).sum()
    fp=(prob*(1-tgt)*training).sum()
    fn=((1-prob)*tgt*training).sum()
    objective=1-2*tp/(2*tp+fp+fn+1e-8)
    objective+=.015*(p[5:17]**2).mean()+.008*(p[21:31]**2).mean()
    objective+=.0003*(p[:5]**2).sum()+.002*(p[17:21]**2).sum()
    objective.backward()
    torch.nn.utils.clip_grad_norm_([p],5)
    optimizer.step()
    if step%150==0:
        with torch.no_grad():
            current=prediction(p)
            tr=count(current,train_tiles)
            hold=count(current,~train_tiles)
            print(f"step={step} train={tr} spatial_eval={hold}",flush=True)
            if hold[-1]>best[0]:
                best=(hold[-1],p.detach().numpy().copy(),step)
print("BEST checkpoint selected on evaluation set (exploratory, NOT an untouched holdout):",best[2],best[0])
print("Fitted 31 parameters:",best[1].tolist())
