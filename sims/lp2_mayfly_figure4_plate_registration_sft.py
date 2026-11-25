"""Register the recovered Figure 4 plate against the original p24 artwork.
Usage: python lp2_mayfly_figure4_plate_registration_sft.py PLATE_ZIP LP_ZIP
Dependencies: numpy, scipy, opencv-python, Pillow.
Fit central body/antennae only. Wing/leg/tail pixels are excluded from fit.
The masks and specimen boxes were chosen visually; this is a comparative
registration, not an exhaustive search over all historical sources.
"""
import cv2,numpy as np
from scipy.optimize import differential_evolution
from PIL import Image
from io import BytesIO
import zipfile,hashlib,json,sys

def load(zip_path,member):
    with zipfile.ZipFile(zip_path) as z:b=z.read(member)
    return np.array(Image.open(BytesIO(b)).convert('L'),np.float32),hashlib.sha256(b).hexdigest()
S,sha=load(sys.argv[1],'thieme_90_source.jpg')
T,tsha=load(sys.argv[2],'liber-primus-jpegs/41.jpg')
assert sha=='3aab1ba8badc949c7959da1562bd65cc143a416232cc6561c8bd1bc267ec9cac'
S=255-S;T=255-T[1100:2400,30:530]
items={1:(151,526,234,(62,565)),2:(137,284,194,(74,318)),3:(278,432,176,(274,378)),5:(381,100,201,(381,57)),6:(292,618,209,(351,679)),7:(374,290,219,(469,315)),8:(158,105,232,(158,47))}
X,Y=np.meshgrid(np.arange(8,497,2.5,dtype=np.float32),np.arange(45,631,2.5,dtype=np.float32))
B0=cv2.remap(T,X,Y,cv2.INTER_LINEAR)
train=((abs(X-282)<35)&(Y>218)&(Y<470))|((Y>65)&(Y<225)&(abs(X-282)>25))
wing=((X<233)|(X>331))&(Y>191)&(Y<340)&(X>15)&(X<490)
legs=((abs(X-282)>24)&(abs(X-282)<106)&(Y>340)&(Y<445))
tail=(abs(X-282)<66)&(Y>490)&(Y<625)
train &= ~(wing|legs|tail)
assert not np.any(train&(wing|legs|tail))
B=cv2.GaussianBlur(B0,(0,0),.35)
BH=B-cv2.GaussianBlur(B,(0,0),2.0)
def ncc(a,b,m):
    a=a[m].astype(np.float64);b=b[m].astype(np.float64);a-=a.mean();b-=b.mean()
    return float((a@b)/np.sqrt((a@a)*(b@b)+1e-30))
def evaluation(params,item,flip,ret=False):
    xc,yc,span,(lx,ly)=items[item];sx,sy,tx,ty,shear=params
    yy=yc+(Y-ty)/sy;xx=xc+flip*(X-tx-shear*(yy-yc))/sx
    A=cv2.remap(S,xx.astype(np.float32),yy.astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=0)
    A=cv2.GaussianBlur(A,(0,0),.55)
    valid=(abs(xx-lx)>8)|(abs(yy-ly)>8)
    sc=ncc(A,B,train&valid)
    if not ret:return -sc
    AH=A-cv2.GaussianBlur(A,(0,0),2.0)
    return {'train':sc,'wing':ncc(A,B,wing&valid),'wing_highpass':ncc(AH,BH,wing&valid),'legs':ncc(A,B,legs&valid),'tail':ncc(A,B,tail&valid),'params':list(map(float,params))}
out=[]
for item in items:
    scale=520/items[item][2]
    for flip in [1,-1]:
        bounds=[(.75*scale,1.25*scale),(.70*scale,1.45*scale),(260,305),(255,310),(-.30,.30)]
        fit=differential_evolution(lambda x:evaluation(x,item,flip),bounds,seed=20261125,popsize=7,maxiter=38,tol=1e-5,polish=True)
        out.append({'item':item,'flip':flip,**evaluation(fit.x,item,flip,True)})
pair=[]
for flip in [1,-1]:
    def ev(params,ret=False):
        sx,sy,tx,ty=params
        A=cv2.remap(T,((X-282)*sx*flip+tx).astype(np.float32),(ty-Y*sy).astype(np.float32),cv2.INTER_LINEAR)
        sc=ncc(A,B0,train)
        return (sc,ncc(A,B0,wing),ncc(A,B0,legs),ncc(A,B0,tail)) if ret else -sc
    r=differential_evolution(ev,[(.97,1.03),(.97,1.03),(270,295),(1340,1410)],seed=20261125,popsize=8,maxiter=40,polish=True)
    pair.append({'flip_x':flip,'params':list(map(float,r.x)),'train_wing_legs_tail':ev(r.x,True)})
print(json.dumps({'source_sha256':sha,'target_sha256':tsha,'matches':out,'upper_to_lower':pair},indent=2))
