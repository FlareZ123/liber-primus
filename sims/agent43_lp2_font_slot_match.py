"""Reproduce original LP2 font-slot gate (#2673).
Requires numpy, scipy, Pillow, opencv-python, freetype-py.
python sims/agent43_lp2_font_slot_match.py --allrunes <dir> --junicode <dir>
All input fonts are separately obtained; no fonts are redistributed.
"""
import os
os.environ["OPENBLAS_NUM_THREADS"]="1"
import argparse, io, json, hashlib, re
from collections import defaultdict, Counter
from pathlib import Path
import numpy as np
import cv2
import freetype
from PIL import Image
from scipy.optimize import linear_sum_assignment

ALPH="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
SIZE,HEIGHT=40,30

def normalize(g,sy,sx):
    h,w=g.shape
    nh,nw=max(1,round(h*sy)),max(1,round(w*sx))
    if nh>SIZE or nw>SIZE:return None
    a=cv2.resize(g,(nw,nh),interpolation=cv2.INTER_AREA)
    c=np.zeros((SIZE,SIZE),np.float32)
    y,x=(SIZE-nh)//2,(SIZE-nw)//2
    c[y:y+nh,x:x+nw]=a
    return c.flatten()

def observed(path,lines):
    im=np.array(Image.open(path).convert("RGB"))
    _,lab,st,_=cv2.connectedComponentsWithStats((im.max(axis=2)<160).astype("uint8"),8)
    a=[(x,y,w,h,s,i) for i,(x,y,w,h,s) in enumerate(st) if 550<x<1810 and 650<y<2900 and 100<h<130 and 2<w<130 and s>80]
    out=defaultdict(list);valid=[]
    for j,line in enumerate(lines):
        l=sorted(q for q in a if abs(q[1]-(673+188.25*j))<12)
        txt=re.findall("[\u16a0-\u16ff]",line)
        if len(l)!=len(txt):continue
        valid.append(j+1)
        for c,(x,y,w,h,s,i) in zip(txt,l):
            g=(lab[y:y+h,x:x+w]==i).astype(np.float32)
            out[c].append(normalize(g,HEIGHT/114,HEIGHT/114))
    return out,valid

def score(a,b):
    return 1-2*(a@b.T)/(np.sum(a*a,axis=1)[:,None]+np.sum(b*b,axis=1)[None,:]+1e-9)

def render(path,selected=None,pixels=150):
    f=freetype.Face(str(path));f.set_pixel_sizes(0,pixels)
    ids=selected if selected is not None else (range(1,f.num_glyphs) if str(path).endswith(".pfb") else sorted({i for c,i in f.get_chars() if 0x16a0<=c<=0x16ff}))
    out=[]
    for i in ids:
        f.load_glyph(i,freetype.FT_LOAD_RENDER|freetype.FT_LOAD_NO_HINTING)
        b=f.glyph.bitmap
        if b.width<1 or b.rows<1:continue
        if selected is None and (b.rows<40 or b.width>250 or b.rows>200):continue
        g=np.array(b.buffer,dtype=np.float32).reshape(b.rows,b.pitch)[:,:b.width]/255
        yy,xx=np.where(g>0.15)
        if not len(yy):continue
        g=g[yy.min():yy.max()+1,xx.min():xx.max()+1]
        if selected is not None or g.shape[0]>=40:out.append((i,g))
    return out

def evaluate(A,gs,sy,sx):
    pairs=[(i,normalize(g,sy,sx)) for i,g in gs]
    pairs=[(i,b) for i,b in pairs if b is not None]
    if len(pairs)<len(A):return None
    B=np.stack([x[1] for x in pairs]);D=score(A,B)
    rr,cc=linear_sum_assignment(D);vals=D[rr,cc]
    return float(vals.mean()),float(vals.max()),[int(pairs[k][0]) for k in cc],vals.tolist()

def coarse(A,gs):
    if not gs:return None,0
    h=np.array([g.shape[0] for _,g in gs])
    mode=Counter(h//5).most_common(1)[0][0]*5+2.5
    gs=[(i,g) for i,g in gs if .7*mode<=g.shape[0]<=1.4*mode and g.shape[1]<=1.7*mode]
    if len(gs)<29:return None,len(gs)
    best=None
    for sy in (HEIGHT/mode*.9,HEIGHT/mode,HEIGHT/mode*1.1):
        for ratio in (.5,.7,.9,1.1,1.3):
            sx=sy*ratio;v=evaluate(A,gs,sy,sx)
            if v and (best is None or v[0]<best[0]):best=(*v,sy,sx)
    return best,len(gs)

def refine(A,gs,v):
    sy,sx=v[-2:];best=v
    for y in np.arange(max(.10,sy-.035),sy+.036,.007):
        for xx in np.arange(max(.06,sx-.045),sx+.046,.009):
            q=evaluate(A,gs,y,xx)
            if q and q[0]<best[0]:best=(*q,float(y),float(xx))
    return best

def freeze(A,gs,v):
    by=dict(gs);B=np.stack([normalize(by[i],v[-2],v[-1]) for i in v[2]])
    D=score(A,B)
    return float(np.diag(D).mean()),np.diag(D).tolist(),D.tolist()

def plant(path,ids,ratio):
    gs=render(path,ids,240);h=np.median([g.shape[0] for _,g in gs]);s=114/h;out=[]
    for i,g in gs:
        nh,nw=max(1,round(g.shape[0]*s)),max(1,round(g.shape[1]*s*ratio))
        a=np.pad(cv2.resize(g,(nw,nh),interpolation=cv2.INTER_AREA),5)
        im=Image.fromarray(np.uint8(np.round((1-a)*255)))
        f=io.BytesIO();im.save(f,format="JPEG",quality=92);f.seek(0)
        a=(np.array(Image.open(f))<160).astype(np.float32)
        yy,xx=np.where(a);a=a[yy.min():yy.max()+1,xx.min():xx.max()+1]
        out.append(normalize(a,HEIGHT/114,HEIGHT/114))
    return np.stack(out)

def family(x):return x["font"][:4] if x["font"].endswith(".pfb") else "Juni"

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--resources",type=Path,default=Path("resources/liber-primus"))
    p.add_argument("--allrunes",type=Path,required=True)
    p.add_argument("--junicode",type=Path,required=True)
    p.add_argument("--output",type=Path,default=Path("lp2-font-slot-results.json"))
    args=p.parse_args()
    lines=(args.resources/"lp2-transcription.txt").read_text(encoding="utf-8").splitlines()
    a,va=observed(args.resources/"18.jpg",lines[13:25])
    b,vb=observed(args.resources/"19.jpg",lines[26:35])
    assert all(a[c] and b[c] for c in ALPH)
    A=np.stack([np.median(a[c],axis=0) for c in ALPH]);B=np.stack([np.median(b[c],axis=0) for c in ALPH])
    paths=sorted(args.allrunes.glob("*.pfb"))+sorted(list(args.junicode.glob("*.otf"))+list(args.junicode.glob("*.ttf")))
    data=[]
    for path in paths:
        gs=render(path);v,n=coarse(A,gs)
        data.append({"font":path.name,"path":str(path),"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"num_slots":len(gs),"rune_sized_slots":n,"v":v})
        print(path.name,v[0] if v else None,flush=True)
    data.sort(key=lambda x:x["v"][0] if x["v"] else 999)
    top=[x for x in data[:12] if x["v"]];families={family(x) for x in top}
    for x in data:
        if family(x) not in families and x["v"]:top.append(x);families.add(family(x))
    for x in top:
        gs=render(x["path"]);v=refine(A,gs,x["v"]);x["refined"]=v
        x["holdout_frozen"]=freeze(B,gs,v)[:2]
        x["holdout_reassign"]=evaluate(B,gs,v[-2],v[-1])
        print("refined",x["font"],v[0],x["holdout_frozen"][0],flush=True)
    top.sort(key=lambda x:x["refined"][0]);controls=[]
    for suffix in (".pfb",".otf"):
        x=next((x for x in top if x["font"].endswith(suffix)),None)
        if x is None:continue
        path=x["path"];gs=render(path);ids=x["refined"][2];P=plant(path,ids,.83)
        c,_=coarse(P,gs);v=refine(P,gs,c)
        true=evaluate(P,[(i,g) for i,g in gs if i in ids],v[-2],v[-1])
        fixed=freeze(P,gs,(*v[:2],ids,v[3],v[-2],v[-1]))
        controls.append({"font":x["font"],"result":v,"exact_ids":sum(i==j for i,j in zip(ids,v[2])),"fixed_true_mean":fixed[0],"fixed_true_max":max(fixed[1]),"true_restricted":true,"planted_ids":ids})
    for x in top[:2]:
        gs=render(x["path"]);v=x["refined"];f=freetype.Face(x["path"])
        x["slot_names"]=[f.get_glyph_name(i).decode() if f.has_glyph_names else str(i) for i in v[2]]
        x["match_matrix_selected"]=freeze(A,gs,v)[2]
        x["holdout_matrix_selected"]=freeze(B,gs,v)[2]
    out={"alphabet":ALPH,"valid_lines":[va,vb],"split_half_distances":np.diag(score(A,B)).tolist(),"num_fonts":len(data),"ranked_coarse":data,"refined_top":top,"controls":controls}
    args.output.write_text(json.dumps(out,indent=2),encoding="utf-8")
    print("split",np.diag(score(A,B)).mean(),"best",[(x["font"],x["refined"][0],x["holdout_frozen"][0]) for x in top[:5]])

if __name__=="__main__":main()
