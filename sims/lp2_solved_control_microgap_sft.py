"""Original LP2 intra-word advance: frozen LP1 renderer, Director #2844.
Run from repo: python sims/lp2_solved_control_microgap_sft.py [--zip ARCHIVE] [--out tape.csv]
Dependencies: Pillow, numpy, opencv-python. Archive image 17 = LP2 p0.
"""
import argparse
import csv
import hashlib
import io
import zipfile
from pathlib import Path
from PIL import Image
import numpy as np
import cv2

parser = argparse.ArgumentParser()
parser.add_argument("--zip", type=Path)
parser.add_argument("--out", type=Path)
args = parser.parse_args()
ROOT = Path(__file__).resolve().parents[1]
Z = zipfile.ZipFile(args.zip) if args.zip else None
GP = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
master = (ROOT / "resources/transcriptions/liber_primus_master.txt").read_text(encoding="utf-8").split("%")
source = {n: [line for line in master[n-1].splitlines() if any(c in GP for c in line)] for n in range(3,75)}

def img(n):
    f = f"{n:02d}.jpg"
    p = io.BytesIO(Z.read(f"liber-primus-jpegs/{f}")) if Z else ROOT / "resources/liber-primus" / f
    return np.array(Image.open(p).convert("L"))

def spans(v):
    p = np.flatnonzero(v)
    return [q for q in np.split(p, np.where(np.diff(p)>1)[0]+1) if len(q)]

def boxes(im,y0,y1,x0=590,x1=1810):
    m = im[y0:y1,x0:x1]<155
    out = []
    for p in spans(m.sum(axis=0)>=2):
        yy = np.flatnonzero(m[:,p].any(axis=1))
        height = yy[-1]-yy[0]+1
        if not 93<=height<=130 or len(p)>100:
            continue
        patch = m[yy[0]:yy[-1]+1,p[0]:p[-1]+1].astype("uint8")
        f = cv2.resize(patch,(48,96),interpolation=cv2.INTER_LINEAR).ravel().astype("float32")
        f /= np.linalg.norm(f)
        out.append((int(p[0])+x0,int(p[-1])+x0,int(yy[0])+y0,int(yy[-1])+y0,f))
    return out

def signature(line):
    ii = [i for i,c in enumerate(line) if c in GP]
    return tuple(GP.index(line[i]) for i in ii), tuple(int(b-a!=1) for a,b in zip(ii,ii[1:]))

F, Y = [], []
# Existing 197-glyph font-template panel, not used to fit gap bearings.
for n in (49,72):
    im = img(n)
    for row,line in enumerate(source[n]):
        y = 673+188*row
        b = boxes(im,y-10,y+125,590,1032 if n==72 and row==3 else 1810)
        labels = signature(line)[0]
        assert len(b)==len(labels),(n,row,len(b),len(labels))
        F.extend(t[-1] for t in b)
        Y.extend(labels)
F,Y = np.array(F),np.array(Y)
assert len(Y)==197 and len(set(Y))==29
T = np.stack([F[Y==k].mean(axis=0) for k in range(29)])
T /= np.linalg.norm(T,axis=1,keepdims=True)

def rows(im):
    v = (im[:,850:1650]<155).sum(axis=1)>55
    for p in spans(v):
        if 65<=len(p)<=140 and 400<=p[0]<=3100:
            yield max(0,int(p[0])-25),min(3600,int(p[-1])+26)

records = []
for n,lines in source.items():
    im = img(n)
    signatures = [signature(l) for l in lines]
    hits = set()
    for y0,y1 in rows(im):
        b = boxes(im,y0,y1)
        if not b:
            continue
        sims = np.stack([t[-1] for t in b]) @ T.T
        a,c = sims.argmax(axis=1),sims.max(axis=1)
        marks = tuple(int(np.any((im[y0:y1,l[1]+1:r[0]]<155).sum(axis=0)>=2)) for l,r in zip(b,b[1:]))
        sig = (tuple(a),marks)
        if min(c)<.88 or signatures.count(sig)!=1:
            continue
        j = signatures.index(sig)
        assert j not in hits,(n,j)
        hits.add(j)
        for k,(l,r) in enumerate(zip(b,b[1:])):
            if not marks[k]:
                records.append((n,j,k,int(a[k]),int(a[k+1]),l[0],l[1],r[0],r[1],l[2],l[3],r[2],r[3]))
A = np.array(records)
X = np.zeros((len(A),58))
X[np.arange(len(A)),A[:,3]]=1
X[np.arange(len(A)),29+A[:,4]]=1
X = np.delete(X,29,axis=1)
y = A[:,7]-A[:,5]
train = A[:,0]<=13
val = ((A[:,0]>=14)&(A[:,0]<=16))|(A[:,0]>=73)
test = ~(train|val)
beta,_,rank,_ = np.linalg.lstsq(X[train],y[train],rcond=None)
e = y-X@beta
assert rank==57
assert (sum(train),sum(val),sum(test))==(927,296,8829)
digest = hashlib.sha256(A.astype("<i4").tobytes()).hexdigest()
assert digest=="ce9360c49b7c2b05b4c3d2fabd7949e57fbe7075108f7dbb0dc712de70993c1d",digest
print("integer tape SHA256",digest)
print("unknown coverage",len(set(map(tuple,A[test,:2]))),sum(len(source[n]) for n in range(17,73)))
for name,mask in (("LP1 fit",train),("heldout solved",val),("unknown",test),("LP2 solved",A[:,0]>=73)):
    v=e[mask]
    print(name,len(v),"RMSE",np.sqrt(np.mean(v**2)),"range",min(v),max(v),"abs>2",sum(abs(v)>2))
    for delta in (1,2,3):
        print("coordinate-plant sensitivity",delta,(sum(abs(v+delta)>2)+sum(abs(v-delta)>2))/(2*len(v)))
    ix=np.flatnonzero(mask)
    pairs=np.array([(i,i+1) for i in ix[:-1] if mask[i+1] and tuple(A[i,:2])==tuple(A[i+1,:2]) and A[i+1,2]==A[i,2]+1])
    if len(pairs):
        cov=np.cov(e[pairs[:,0]],e[pairs[:,1]],ddof=0)[0,1]
        print("adjacent pairs",len(pairs),"innovation",np.var(v)+2*cov)
assert sum(abs(e[val])>2)==0 and sum(abs(e[test])>2)==1
print("flag",A[np.argmax(abs(e))].tolist(),max(abs(e)))
if args.out:
    with args.out.open("w",newline="",encoding="utf-8") as f:
        w=csv.writer(f)
        w.writerow("archive,line,gap,left_gp,right_gp,left_x0,left_x1,right_x0,right_x1,left_y0,left_y1,right_y0,right_y1,residual_px".split(","))
        w.writerows([*map(int,r),f"{v:.9f}"] for r,v in zip(A,e))
