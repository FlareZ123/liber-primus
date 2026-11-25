"""LP2 original component orientation gate. Requires numpy, cv2; original 75-JPEG ZIP.
Uses source-labelled solved templates and physical component bounds from
sims/lp2_allglyph_original_allograph_sft.py; no OCR or plaintext scoring.
Usage: python sims/lp2_orientation_original_gate.py archive.zip output.json
"""
import json, sys, cv2, numpy as np
from zipfile import ZipFile
from collections import Counter
cv2.setNumThreads(1)
GP='ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
LINES={56:['ᚫᛄ-ᛟᛋᚱ.ᛗᚣᛚᚩᚻ-ᚩᚫ-ᚳᚦᚷᚹ-ᚹᛚᚫ.ᛉ','ᚩᚪᛈ-ᛗᛞᛞᚢᚷᚹ-ᛚ-ᛞᚾᚣᛄ-ᚳᚠᛡ-ᚫᛏ','ᛈᛇᚪᚦ-ᚳᚫ.','ᚳᛞ-ᚠᚾ-ᛡᛖ-ᚠᚾᚳᛝ-ᚱᚠ-ᚫᛁᚱᛞᛖ-ᛋᚣᛄᛠᚢ','ᛝᚹ-ᛉᚩ-ᛗᛠᚹᚠ-ᚱᚷᛡ-ᛝᚱᛒ-ᚫᚾᚢᛋ.'],57:['ᛈᚪᚱᚪᛒᛚᛖ.ᛚᛁᚳᛖ-ᚦᛖ-ᛁᚾᛋᛏᚪᚱ-ᛏ','ᚢᚾᚾᛖᛚᛝ-ᛏᚩ-ᚦᛖ-ᛋᚢᚱᚠᚪᚳᛖ.','ᚹᛖ-ᛗᚢᛋᛏ-ᛋᚻᛖᛞ-ᚩᚢᚱ-ᚩᚹᚾ-ᚳ','ᛁᚱᚳᚢᛗᚠᛖᚱᛖᚾᚳᛖᛋ.ᚠᛁᚾᛞ-ᚦ','ᛖ-ᛞᛁᚢᛁᚾᛁᛏᚣ-ᚹᛁᚦᛁᚾ-ᚪᚾᛞ-ᛖᛗᛖᚱᚷᛖ.']}
ROWS={56:[(669,786),(861,976),(1050,1165),(1889,2005),(2077,2193)],57:[(917,1032),(1105,1222),(1349,1465),(1537,1652),(1725,1840)]}
OPS=['0','-3','3','-6','6','-12','12','90','180','270','H','V','D','A']
def boxes(im,b,wide=False):
 x1,y1,x2,y2=b; _,_,s,_=cv2.connectedComponentsWithStats((im[y1:y2,x1:x2]<160).astype('uint8'),8)
 return sorted((int(x+x1),int(y+y1),int(w),int(h),int(a)) for x,y,w,h,a in s[1:] if (max(h,w)>80 if wide else h>80) and a>200)
def cut(im,b):
 x,y,w,h,a=b; return (im[y:y+h,x:x+w]<160).astype('uint8')
def center(a):
 y,x=np.where(a>0); a=a[y.min():y.max()+1,x.min():x.max()+1]; h,w=a.shape
 c=np.zeros((192,192),np.uint8); i=(192-h)//2;j=(192-w)//2;c[i:i+h,j:j+w]=a;return c

def transform(a,op):
 c=center(a)
 if op=='H': return c[:,::-1].copy()
 if op=='V': return c[::-1,:].copy()
 if op=='D': return c.T.copy()
 if op=='A': return c[::-1,::-1].T.copy()
 return cv2.warpAffine(c,cv2.getRotationMatrix2D((95.5,95.5),float(op),1),(192,192),flags=cv2.INTER_NEAREST)
def feature(a):
 f=cv2.resize(center(a).astype(np.float32),(48,48),interpolation=cv2.INTER_AREA).ravel();return f/np.linalg.norm(f)

def main():
 z=ZipFile(sys.argv[1])
 def load(p):
  name=f'liber-primus-jpegs/{p+17:02}.jpg'; return cv2.imdecode(np.frombuffer(z.read(name),np.uint8),0)
 templates=[]
 for p in (56,57):
  im=load(p)
  for li,(y1,y2) in enumerate(ROWS[p]):
   bs=boxes(im,(220,y1,2050,y2)); ss=[GP.index(ch) for ch in LINES[p][li] if ch in GP]
   if p==56:
    if li==0:bs,ss=bs[1:],ss[1:]
    elif li in (1,2):bs=bs[1:]
   else:
    if li==0:bs,ss=bs[1:7],ss[1:7]
    elif li==1:bs=[b for b in bs if b[0]>=890][:-1];ss=ss[:-2]
    elif li==2:bs=[b for b in bs if b[0]>=890]
   assert len(bs)==len(ss),(p,li,len(bs),len(ss))
   for b,k in zip(bs,ss):
    if 7<=b[2]<=110 and b[3]<=122:templates.append((p,k,b,cut(im,b)))
 assert len(templates)==163 and len({t[1] for t in templates})==29
 refs=np.stack([[feature(transform(t[3],op)) for t in templates] for op in OPS])
 labels=np.array([t[1] for t in templates]); train=np.array([t[0]==56 for t in templates]); assert len(set(labels[train]))==29; flat=refs.reshape(-1,refs.shape[-1]).T.copy()
 def score(fs,exclude=None):
  s=(fs@flat).reshape(len(fs),len(OPS),len(templates))
  if exclude is not None:
   for i,j in enumerate(exclude):s[i,:,j]=-1
  return s
 controls=[]; plants=[]
 for i,(p,k,b,a) in enumerate(templates):
  if (labels==k).sum()<2:continue
  s=score(np.stack([feature(transform(a,op)) for op in OPS]),[i]*len(OPS))[:,:,labels==k].max(2)
  controls.append((p,k,b[:4],float(s[0,0]),float(s[0,1:].max()-s[0,0]),OPS[1+int(s[0,1:].argmax())]))
  for j in range(1,len(OPS)):
   plants.append((OPS[j],k,float(s[j,j]-s[j,0]),OPS[int(s[j].argmax())]))
 cal=[]
 for i,(p,k,b,a) in enumerate(templates):
  if p!=56 or (train & (labels==k)).sum()<2:continue
  q=score(np.stack([feature(a)]),[i])[0][:,train & (labels==k)].max(1)
  cal.append(float(q[1:].max()-q[0]))
 threshold=max(.025,max(cal)+.005)
 held=[]; heldplants=[]
 for p,k,b,a in templates:
  if p!=57:continue
  transformed=[transform(a,op) for op in OPS]
  q=score(np.stack([feature(a) for a in transformed])); q[:,:,~train]=-1
  sc=q[:,:,labels==k].max(2); gl=q.max(2); held.append([k,float(sc[0,0]),float(sc[0,1:].max()-sc[0,0])])
  for j,op in enumerate(OPS[1:],1):
   ys,xs=np.where(transformed[j]); h=ys.max()-ys.min()+1; w=xs.max()-xs.min()+1
   eligible=7<=min(w,h) and 80<=max(w,h)<=122 and len(ys)>200
   heldplants.append([op,k,bool(eligible),float(sc[j,j]-sc[j,0]),float(gl[j,1:].max()-gl[j,0]),float(gl[j,1:].max()),OPS[1+int(gl[j,1:].argmax())]])
 out=[]; suspects=[]; totals=Counter(); page_rows=[]; tape=[]
 for p in range(-17,58):
  im=load(p); bs=[b for b in boxes(im,(440,440,2100,3250),wide=True) if 7<=min(b[2],b[3]) and 80<=max(b[2],b[3])<=122 and b[4]>160]
  if not bs:continue
  fs=np.stack([feature(cut(im,b)) for b in bs]); s=score(fs); s[:,:,~train]=-1; us=s[:,0,:]; ix=us.argmax(1); ks=labels[ix]; base=us.max(1)
  slopes=[]
  for row in sorted(set(round(b[1]/188) for b in bs)):
   coords=np.array([(b[0],b[1]) for j,b in enumerate(bs) if round(b[1]/188)==row and base[j]>.95])
   if len(coords)<8:continue
   dx=coords[:,0,None]-coords[:,0];dy=coords[:,1,None]-coords[:,1]; mask=np.abs(dx)>200
   if mask.any():slopes.append(float(np.median(dy[mask]/dx[mask])))
  skew=float(np.degrees(np.arctan(np.median(slopes)))) if slopes else None
  for j,(b,k) in enumerate(zip(bs,ks)):
   k=int(k); sc=s[j][:,labels==k].max(1); best=1+int(sc[1:].argmax()); d=float(sc[best]-sc[0]); glob=s[j].max(1); gb=int(glob.argmax()); other=float(glob[gb]-glob[0])
   row=[p,*b[:4],k,round(float(sc[0]),6),OPS[best],round(d,6),OPS[gb],round(other,6)]
   tape.append(row)
   totals['all']+=1
   if sc[0]>=.90:
    totals['upright_confident']+=1
    if d>=threshold:out.append(row)
   if other>=threshold and glob[gb]>=.90:suspects.append(row)
  page_rows.append([p,len(bs),skew,int((base>=.90).sum()),max((abs(float(np.degrees(np.arctan(v)))) for v in slopes),default=None)])
 result={'threshold':threshold,'calibration_count':len(cal),'calibration_max_margin':max(cal),'control_count':len(controls),'independent_p57_count':len(held),'independent_p57_plants':{op:{'n':sum(t[0]==op for t in heldplants),'eligible':sum(t[0]==op and t[2] for t in heldplants),'same_detected':sum(t[0]==op and t[2] and t[3]>=threshold for t in heldplants),'global_detected':sum(t[0]==op and t[2] and t[4]>=threshold and t[5]>=.90 for t in heldplants)} for op in OPS[1:]},'independent_p57_max_margin':max(x[2] for x in held),'independent_p57_min_upright':min(x[1] for x in held),'control_max_margin':max(x[4] for x in controls),'control_min_upright':min(x[3] for x in controls),'control_by_page':dict(Counter(x[0] for x in controls)),'plants':{op:{'n':sum(t[0]==op for t in plants),'detected':sum(t[0]==op and t[2]>=threshold for t in plants),'exact_op_winner':sum(t[0]==op and t[3]==op for t in plants)} for op in OPS[1:]},'totals':dict(totals),'same_class_outliers':out,'global_outliers':suspects,'pages':page_rows,'tape_columns':['page','x','y','w','h','upright_class','upright_similarity','best_nonidentity_same_class','same_class_margin','best_global_op','global_margin'],'tape':tape}
 with open(sys.argv[2],'w') as f:json.dump(result,f,separators=(',',':'))
 print(json.dumps({k:v for k,v in result.items() if k!='tape'},indent=1))
if __name__=='__main__':main()
