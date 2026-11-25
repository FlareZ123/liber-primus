"""Ordinary red/black same-line baseline and isolated chroma registration.
Usage: python sims/lp2_red_baseline_registration.py archive.zip orientation.json registration.json
Generate orientation.json with lp2_orientation_original_gate.py first.
"""
import json,sys,cv2,numpy as np
from zipfile import ZipFile
from collections import defaultdict,Counter
z=ZipFile(sys.argv[1])
r=json.load(open(sys.argv[2]))
rows=defaultdict(list)
for row in r['tape']:
 if row[6]>=.90:rows[row[0]].append(row)
records=[]; page_details=[]; chroma=[]
for p,rs in rows.items():
 im=cv2.imdecode(np.frombuffer(z.read(f'liber-primus-jpegs/{p+17:02}.jpg'),np.uint8),cv2.IMREAD_COLOR)
 page=[]
 for _,x,y,w,h,k,u,*_ in rs:
  a=im[y:y+h,x:x+w].astype(np.int16);b,g,red=a.transpose(2,0,1)
  gray=cv2.cvtColor(a.astype(np.uint8),cv2.COLOR_BGR2GRAY);ink=gray<160
  red_mask=(red-g>50)&(red-b>35)&(g<180)
  frac=np.sum(red_mask&ink)/np.sum(ink)
  cls='red' if frac>=.8 else 'black' if frac<=.05 else 'mixed'
  page.append(dict(p=p,x=x,y=y,w=w,h=h,k=k,cls=cls,frac=frac))
  if cls=='red':
   a=im[y-4:y+h+4,x-4:x+w+4].astype(np.int16); b,g,red=a.transpose(2,0,1); gray=cv2.cvtColor(a.astype(np.uint8),cv2.COLOR_BGR2GRAY)
   lum=gray<160; chr=(red-g>50)&(red-b>35)&(g<180)
   yy,xx=np.where(lum); y2,x2=np.where(chr)
   if not (lum[[0,-1],:].any() or lum[:,[0,-1]].any() or chr[[0,-1],:].any() or chr[:,[0,-1]].any()):
    chroma.append(dict(p=p,x=x,y=y,w=w,h=h,k=k,dx=float(x2.mean()-xx.mean()),dy=float(y2.mean()-yy.mean()),iou=float((lum&chr).sum()/(lum|chr).sum())))
 lines=[]
 for a in sorted(page,key=lambda q:q['y']):
  if not lines or a['y']-lines[-1][-1]['y']>30:lines.append([])
  lines[-1].append(a)
 for line in lines:
  black=[a for a in line if a['cls']=='black']; red=[a for a in line if a['cls']=='red']
  if red:page_details.append([p,min(a['y'] for a in line),len(red),len(black)])
  if len(black)<4:continue
  top=float(np.median([a['y'] for a in black])); bottom=float(np.median([a['y']+a['h'] for a in black]))
  for a in line:
   a['top_res']=a['y']-top;a['bottom_res']=a['y']+a['h']-bottom;records.append(a)
print('color',Counter((('LP1' if a['p']<0 else 'unknown' if a['p']<56 else 'solved'),a['cls']) for a in records)); print('red lines',page_details)
for label in ['LP1','unknown','solved']:
 for c in ['black','red','mixed']:
  a=[a for a in records if ('LP1' if a['p']<0 else 'unknown' if a['p']<56 else 'solved')==label and a['cls']==c];print(label,c,len(a),Counter((x['top_res'],x['bottom_res']) for x in a).most_common(20))
print('outliers',[(a['p'],a['x'],a['y'],a['w'],a['h'],a['k'],a['top_res'],a['bottom_res']) for a in records if a['cls']=='red' and max(abs(a['top_res']),abs(a['bottom_res']))>3]);json.dump({'baseline':records,'chroma':chroma,'red_lines':page_details},open(sys.argv[3],'w'))
for label in ['LP1','unknown','solved']:
 a=[a for a in chroma if ('LP1' if a['p']<0 else 'unknown' if a['p']<56 else 'solved')==label];print('chroma',label,len(a),[(key,min(t[key] for t in a),max(t[key] for t in a),float(np.median([t[key] for t in a]))) for key in ['dx','dy','iou']])
print('max chroma unknown', sorted([a for a in chroma if 0<=a['p']<56],key=lambda a:-max(abs(a['dx']),abs(a['dy'])))[:6])
