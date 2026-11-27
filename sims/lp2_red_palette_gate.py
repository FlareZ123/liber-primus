"""Issue #3121: original LP2 red-palette gate. Python 3; numpy, OpenCV, Pillow, scikit-learn.
Usage: python sims/lp2_red_palette_gate.py resources/liber-primus > palette.json
Accepts the maintainer original ZIP as well as the directory. No ciphertext scoring.
"""
import sys,io,zipfile,json,hashlib
from pathlib import Path
from collections import Counter
import cv2,numpy as np
from PIL import Image,JpegImagePlugin
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import LeaveOneGroupOut,cross_val_predict
from sklearn.metrics import mean_absolute_error
cv2.setNumThreads(1)
source=Path(sys.argv[1]); z=zipfile.ZipFile(source) if source.is_file() else None
def original(p):
    name=f'{p+17:02}.jpg'
    return Image.open(io.BytesIO(z.read('liber-primus-jpegs/'+name) if z else (source/name).read_bytes()))
def mask(a):
    r,g,b=a.transpose(2,0,1).astype(np.int16)
    return ((r-g>65)&(r-b>65)&(g<160)&(b<160)).astype(np.uint8)
spans={0:'ᛋᚻᛖᚩᚷᛗᛡᚠᛋᚣᛖᛝᚳ',3:'ᛚᛄᛇᚻᛝᚳᚦᛏᚫᛄᛏᛉᚻᛏᚢᛟᛈᛞᚦ',6:'ᚪᛏᛉᛒᛗᚷᛡᛋᛒᛉᛇ',7:'ᛞᚩᛟᛏᚦᚫᚳᚹᛄᛉᛠᚷᛠᛗ',8:'ᛉᛁᛉᛗᚢᛉᛗᚳᚦᛈᚩᛒ',15:'ᚠᚢᛚᛗᚪᛠᚣᛟᚪᛚᚢᛝᚾᚳᚢᛒᚾᛏᚠᛝ',23:'ᚢᚪᚹᛝᚷᛉᛞᚷᛁᛒᛁᛇᛏᛒᛁᚣ',27:'ᛗᛈᚣᛚᛋᚩᚪᚫᚻᛚᛖᛇᛁᛗᛚᛚᛋᚳᛈ',33:'ᛞᛇᛉᚳᚠᛁᚪᚹᚻᚷᛝᚦᛇᛁᚠᚳᛟᛇ',39:'ᛡᚳᛋ',40:'ᚠᚾᛗᚣᚷᛞᚫᚻ',53:'ᛏᛈᚹᛇᛋᚹᛒᛇᚦᚾᚻᚷᛄᚱᛡᛞᛡᚦᚪᛁᛇᚫᛉᛚᛇᛠᛡᚪᛄᚻᚱᚦᛈᛞᛄᛝᚩᚷᚠᛇᛗᚳᚻᛞᚩᛏᚳᚢᚱᛈᚾ',54:'ᚪᛗᛝᛞᛡᚦᛉᛁᛗ',56:'ᚫᛄᛟᛋᚱ',57:'ᛈᚪᚱᚪᛒᛚᛖ'}
rows=[]; pages={}; qtables=Counter()
for p in range(58):
    im=original(p); qt=hashlib.sha256(json.dumps(im.quantization,sort_keys=True).encode()).hexdigest()[:12]; qtables[qt]+=1
    a=np.asarray(im.convert('RGB')); m=mask(a)
    if not m.any():continue
    _,lab,st,_=cv2.connectedComponentsWithStats(m,8); d=cv2.distanceTransform(m,cv2.DIST_L2,5); pr=[]
    for i,(x,y,w,h,n) in enumerate(st[1:],1):
        kind='rune' if 100<=h<=125 and w<=100 and n>=400 else 'initial' if h>125 and n>=400 else 'dot' if 6<=w<=14 and 6<=h<=14 and n>=40 else 'other'
        if kind=='other':continue
        c=lab[y:y+h,x:x+w]==i; dd=d[y:y+h,x:x+w]; pix=a[y:y+h,x:x+w]; core=pix[c&(dd>=4)]; edge=pix[c&(dd<=2)]
        if not len(core) or not len(edge):continue
        full=[]
        for yy in range((y+7)//8*8,y+h-7,8):
            for xx in range((x+7)//8*8,x+w-7,8):
                if c[yy-y:yy-y+8,xx-x:xx-x+8].all():full.extend(a[yy:yy+8,xx:xx+8].reshape(-1,3).tolist())
        ring=a[max(0,y-6):min(a.shape[0],y+h+6),max(0,x-6):min(a.shape[1],x+w+6)]; rr=ring.astype(np.int16)
        bg=ring[(rr[:,:,0]-rr[:,:,1]<30)&(rr[:,:,0]-rr[:,:,2]<55)&(rr[:,:,1]>120)]
        fc=np.array(full).reshape(-1,3); ref=np.array([192,0,0])
        v=dict(p=p,x=int(x),y=int(y),w=int(w),h=int(h),n=int(n),kind=kind,core_n=len(core),core_med=np.median(core,axis=0).tolist(),core_mode=list(Counter(map(tuple,core.tolist())).most_common(1)[0][0]),core_near=float(np.mean(np.max(abs(core.astype(int)-ref),axis=1)<=3)),edge_med=np.median(edge,axis=0).tolist(),full_n=len(fc),full_med=np.median(fc,axis=0).tolist() if len(fc) else None,bg=np.median(bg,axis=0).tolist() if len(bg) else [0,0,0],phase=[int(x%8),int(y%8)],qt=qt)
        pr.append(v)
    glyphs=sorted([v for v in pr if v['kind'] in ('rune','initial')],key=lambda v:v['y']); groups=[]
    for v in glyphs:
        if not groups or v['y']-groups[-1][0]['y']>20:groups.append([])
        groups[-1].append(v)
    ordered=[v for group in groups for v in sorted(group,key=lambda v:v['x'])]; expected=spans.get(p,'')
    if len(ordered)==len(expected):
        for v,glyph in zip(ordered,expected):v['glyph']=glyph
    rows.extend(pr); pages[p]={'runes':len(glyphs),'annotated':len(expected),'dots':sum(v['kind']=='dot' for v in pr),'qt':qt}
def summarize(rs):
    med=np.array([v['core_med'] for v in rs]); edge=np.array([v['edge_med'] for v in rs]); full=[v for v in rs if v['full_n']]
    return {'components':len(rs),'median_rgb_counts':{str(k):n for k,n in Counter(map(tuple,med.tolist())).most_common()},'core_R_range':[float(med[:,0].min()),float(med[:,0].max())],'edge_R_range':[float(edge[:,0].min()),float(edge[:,0].max())],'core_near_median':float(np.median([v['core_near'] for v in rs])),'full_components':len(full),'full_median_rgb_counts':{str(k):n for k,n in Counter(tuple(v['full_med']) for v in full).most_common()}}
runes=[v for v in rows if v['kind']=='rune']
X=np.array([[v['w'],v['h'],v['n'],v['n']/(v['w']*v['h']),v['core_n']/v['n'],*v['phase'],*v['bg']] for v in runes]); y=np.array([v['edge_med'][0] for v in runes]); g=np.array([v['p'] for v in runes])
loo=LeaveOneGroupOut(); pred=cross_val_predict(RandomForestRegressor(n_estimators=100,min_samples_leaf=5,random_state=3121,n_jobs=1),X,y,groups=g,cv=loo); base=np.empty(len(y))
for tr,te in loo.split(X,y,g):base[te]=np.median(y[tr])
rep={}
for v in runes:
    if 'glyph' in v:rep.setdefault(v['glyph'],[]).append(v)
repeat={k:{'n':len(v),'pages':len(set(x['p'] for x in v)),'core_R':[min(x['core_med'][0] for x in v),max(x['core_med'][0] for x in v)],'edge_R':[min(x['edge_med'][0] for x in v),max(x['edge_med'][0] for x in v)]} for k,v in rep.items() if len(set(x['p'] for x in v))>=2}
# Phase-complete synthetic single-ink and planted two-ink controls, using native quantizers and sampling.
im=original(0); q=im.quantization; sampling=JpegImagePlugin.get_sampling(im); controls={}
for kind,w,h in [('dot',10,10),('stem',9,114),('wide',27,114)]:
    for color in [176,192,208]:
        cores=[]; edges=[]
        for dx in range(16):
            for dy in range(16):
                a=np.full((160,80,3),[218,207,183],np.uint8); x0,y0=16+dx,16+dy; a[y0:y0+h,x0:x0+w]=[color,0,0]
                f=io.BytesIO(); Image.fromarray(a).save(f,format='JPEG',qtables=q,subsampling=sampling); f.seek(0)
                b=np.asarray(Image.open(f).convert('RGB')); m=mask(b); d=cv2.distanceTransform(m,cv2.DIST_L2,5)
                cores.append(np.median(b[d>=4],axis=0)); edges.append(np.median(b[(d>0)&(d<=2)],axis=0))
        c=np.array(cores); e=np.array(edges)
        controls[kind+str(color)]={'core_rgb_min':c.min(0).tolist(),'core_rgb_max':c.max(0).tolist(),'edge_R_range':[float(e[:,0].min()),float(e[:,0].max())],'core_R_counts':dict(Counter(c[:,0].tolist()))}
print(json.dumps({'quantization_tables':dict(qtables),'pages':pages,'by_kind':{k:summarize([v for v in rows if v['kind']==k]) for k in ['rune','initial','dot']},'unknown_runes':summarize([v for v in runes if v['p']<56]),'solved_runes':summarize([v for v in runes if v['p']>=56]),'same_glyph_across_pages':repeat,'edge_R_leave_page_out_MAE':{'geometry':mean_absolute_error(y,pred),'median_baseline':mean_absolute_error(y,base)},'controls':controls,'rows':rows},ensure_ascii=False,indent=2))
