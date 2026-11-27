#!/usr/bin/env python3
# Compare p14 and p27 internal wing cell graph without adding strokes.
# Usage: python lp2_p14_p27_internal_wing_graph_sft.py liber-primus-jpegs.zip
import zipfile,cv2,numpy as np,networkx as nx
from scipy.ndimage import distance_transform_edt
from collections import Counter
import json,sys
z=zipfile.ZipFile(sys.argv[1])
def load(n):
 f=next(x for x in z.namelist() if x.rsplit('/',1)[-1]==f'{n}.jpg');return cv2.imdecode(np.frombuffer(z.read(f),np.uint8),0)
a=load(31)[2125:2480,1300:1630];b=load(44)[470:895,590:1840]
def graph(arr,t,min_area,radius,interface,poly=None):
 n,lab,stats,cent=cv2.connectedComponentsWithStats((arr>=t).astype(np.uint8),8)
 labels=[]
 for i in range(1,n):
  x,y,w,h,s=stats[i]
  if x==0 or y==0 or x+w==arr.shape[1] or y+h==arr.shape[0] or s<min_area:continue
  if poly is not None and np.count_nonzero(poly[lab==i])<.85*s:continue
  labels.append(i)
 if len(labels)!=15:return len(labels),None
 face=np.zeros_like(lab)
 for j,i in enumerate(labels,1):face[lab==i]=j
 d,idx=distance_transform_edt(face==0,return_indices=True);nearest=face[tuple(idx)];nearest[d>radius]=0
 pairs=Counter()
 for x,y in ((nearest[:-1],nearest[1:]),(nearest[:,:-1],nearest[:,1:])):
  mask=(x>0)&(y>0)&(x!=y);pairs.update(zip(np.minimum(x[mask],y[mask]),np.maximum(x[mask],y[mask])))
 g=nx.Graph();g.add_nodes_from(range(1,16));g.add_edges_from(k for k,v in pairs.items() if v>=interface)
 return 15,g
refs=[]
for t in range(80,201,20):
 n,g=graph(b,t,201,12,40);assert n==15,(t,n)
 if not any(nx.is_isomorphic(g,h) for h in refs):refs.append(g)
mask=np.zeros(a.shape,np.uint8);cv2.fillPoly(mask,[np.array([(15,15),(65,15),(152,54),(208,113),(251,194),(308,289),(319,330),(274,343),(155,328),(92,293),(56,224),(30,139)])],1)
bsmall=cv2.resize(b,(370,126),interpolation=cv2.INTER_AREA)
results={}
for name,arr,poly in [('p14',a,mask),('p27_downsample',bsmall,None)]:
 counts={};hit=[];configs=0;edges=set()
 for t in range(80,221,5):
  for min_area in [10,15,20,30]:
   n,g=graph(arr,t,min_area,4,10,poly);counts[f'{t}/{min_area}']=n
   if n!=15:continue
   for rad in [3,4,5,6,8]:
    for interface in [8,10,12,16]:
     _,g=graph(arr,t,min_area,rad,interface,poly);configs+=1;edges.add(g.number_of_edges())
     if any(nx.is_isomorphic(g,h) for h in refs):hit.append([t,min_area,rad,interface])
 results[name]={'face_count_range':[min(counts.values()),max(counts.values())],'15_cell_masks':sum(v==15 for v in counts.values()),'graph_comparisons':configs,'edge_counts':sorted(edges),'matches':len(hit),'matching_parameters':hit,'counts':counts}
print(json.dumps(results,indent=2))
