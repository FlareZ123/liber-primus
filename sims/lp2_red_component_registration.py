"""Whole-source red-component chroma/luminance registration and one-pixel plants.
Usage: python sims/lp2_red_component_registration.py archive.zip components.json
"""
from zipfile import ZipFile
import cv2,numpy as np,sys,json
from collections import Counter
z=ZipFile(sys.argv[1]); tape=[]; plants=[]
for p in range(-17,58):
 im=cv2.imdecode(np.frombuffer(z.read(f'liber-primus-jpegs/{p+17:02}.jpg'),np.uint8),cv2.IMREAD_COLOR);a=im.astype(np.int16);b,g,r=a.transpose(2,0,1)
 chroma=(r-g>50)&(r-b>35)&(g<180)
 if not chroma.any():continue
 n,cl,cs,cc=cv2.connectedComponentsWithStats(chroma.astype(np.uint8),8)
 luma=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)<160
 m,ll,ls,lc=cv2.connectedComponentsWithStats(luma.astype(np.uint8),8)
 for j,(x,y,w,h,area) in enumerate(cs[1:],1):
  if area<5:continue
  cm=cl[y:y+h,x:x+w]==j; ids,counts=np.unique(ll[y:y+h,x:x+w][cm],return_counts=True); ok=ids>0
  if not ok.any():tape.append([p,int(x),int(y),int(w),int(h),int(area),0,None,None,None]);continue
  k=ids[ok][counts[ok].argmax()]; overlap=int(counts[ok].max()); la=int(ls[k,4]);iou=overlap/(area+la-overlap)
  dx=float(cc[j,0]-lc[k,0]);dy=float(cc[j,1]-lc[k,1]);tape.append([p,int(x),int(y),int(w),int(h),int(area),la,float(iou),dx,dy])
  if p>=56 and iou>=.9:
   for sx,sy in [(1,0),(-1,0),(0,1),(0,-1)]:
    shifted_ids, shifted_counts=np.unique(ll[y+sy:y+h+sy,x+sx:x+w+sx][cm],return_counts=True); keep=shifted_ids>0
    if not keep.any():plants.append([p,sx,sy,True,False]);continue
    k2=shifted_ids[keep][shifted_counts[keep].argmax()]; overlap2=int(shifted_counts[keep].max()); iou2=overlap2/(area+int(ls[k2,4])-overlap2)
    dx2=float(cc[j,0]+sx-lc[k2,0]); dy2=float(cc[j,1]+sy-lc[k2,1]); plants.append([p,sx,sy,bool(iou2<.9 or max(abs(dx2),abs(dy2))>.5),bool(k2==k and abs(dx2-dx-sx)<1e-9 and abs(dy2-dy-sy)<1e-9)])
print('total',len(tape));print('counts',Counter(('LP1' if x[0]<0 else 'unknown' if x[0]<56 else 'solved',x[7] is not None and x[7]>=.9) for x in tape))
for lab,sel in [('LP1',lambda x:x[0]<0),('unknown',lambda x:0<=x[0]<56),('solved',lambda x:x[0]>=56)]:
 a=[x for x in tape if sel(x) and x[7]!=None and x[7]>=.9];print(lab,'maxabs',max(abs(x[8]) for x in a),max(abs(x[9]) for x in a),'iou min',min(x[7] for x in a));print('worst',sorted(a,key=lambda x:-max(abs(x[8]),abs(x[9])))[:5]);print('unmatched', [x for x in tape if sel(x) and (x[7] is None or x[7]<.9)][:20])
print('plants',len(plants),'detected',sum(x[3] for x in plants),'correct original match/offset',sum(x[4] for x in plants));json.dump({'tape':tape,'plants':plants},open(sys.argv[2],'w'))
