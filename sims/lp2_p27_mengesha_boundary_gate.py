"""Exterior cyclic-contact gate for the two existing Mengesha/p27 maps.
Run from checkout: python sims/lp2_p27_mengesha_boundary_gate.py
No ciphertext fitting. Boundary contacts use a pixel nearest-component surrogate.
"""
import hashlib
import cv2
import numpy as np
import networkx as nx
from scipy.ndimage import distance_transform_edt
from collections import Counter
from lp2_p27_mengesha2011_topology_sft import ROT, ZERO
from lp2_p27_wing_original_graph_sft import IMAGE, SHA256, THRESHOLDS

def compress(xs):
    out=[]
    for x in xs:
        if not out or out[-1]!=x: out.append(x)
    if len(out)>1 and out[0]==out[-1]: out.pop()
    return out

def source_dual():
    emb=nx.PlanarEmbedding()
    emb.set_data({u:[v for v in vs if frozenset((u,v)) not in ZERO] for u,vs in ROT.items()})
    emb.check_structure()
    seen=set(); faces=[]; owner={}
    for u,v in emb.edges():
        if (u,v) not in seen:
            f=emb.traverse_face(u,v,seen); k=len(faces); faces.append(f)
            owner.update({(a,b):k for a,b in zip(f,f[1:]+f[:1])})
    outer=owner[1,2]; f=faces[outer]
    seq=compress([owner[b,a] for a,b in zip(f,f[1:]+f[:1]) if owner[b,a]!=outer])
    h=nx.Graph(); h.add_nodes_from(k for k in range(len(faces)) if k!=outer)
    for (u,v),a in owner.items():
        b=owner[v,u]
        if a!=b and outer not in (a,b): h.add_edge(a,b)
    return h,seq

def interfaces(near):
    c=Counter()
    for a,b in ((near[:-1,:],near[1:,:]),(near[:,:-1],near[:,1:])):
        sel=(a>0)&(b>0)&(a!=b)
        keys,counts=np.unique(np.minimum(a[sel],b[sel])*17+np.maximum(a[sel],b[sel]),return_counts=True)
        c.update({(int(k)//17,int(k)%17):int(n) for k,n in zip(keys,counts)})
    return c

def original(crop,t):
    n,lab,st,cent=cv2.connectedComponentsWithStats((crop>=t).astype(np.uint8),connectivity=8)
    cells=sorted((i for i in range(1,n) if 200<int(st[i,cv2.CC_STAT_AREA])<70000),key=lambda i:float(cent[i,0]))
    assert len(cells)==15
    exterior=lab[0,0]; assert exterior>0 and exterior not in cells
    face=np.zeros(lab.shape,np.int16)
    for j,i in enumerate(cells,1): face[lab==i]=j
    dist,inds=distance_transform_edt(face==0,return_indices=True)
    near=face[tuple(inds)]; near[dist>12]=0
    h=nx.Graph([pair for pair,count in interfaces(near).items() if count>=40]); assert len(h)==15
    face[lab==exterior]=16
    _,inds=distance_transform_edt(face==0,return_indices=True)
    near=face[tuple(inds)]
    contacts={a:v for (a,b),v in interfaces(near).items() if b==16}
    contours,_=cv2.findContours((near!=16).astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    contour=max(contours,key=cv2.contourArea)[:,0,:]
    seq=compress([int(near[y,x]) for x,y in contour])
    return h,contacts,seq

def cyclic_eq(a,b):
    return len(a)==len(b) and any(a==b[i:]+b[:i] for i in range(len(b)))

def unoriented_eq(a,b):
    return cyclic_eq(a,b) or cyclic_eq(a,b[::-1])

def main():
    assert hashlib.sha256(IMAGE.read_bytes()).hexdigest()==SHA256
    crop=cv2.imread(str(IMAGE),cv2.IMREAD_GRAYSCALE)[470:895,590:1840]
    h,source_seq=source_dual()
    print("source exterior",source_seq)
    strict=reduced=0
    for t in THRESHOLDS:
        g,contacts,seq=original(crop,t)
        print(t,"original exterior",seq,"contacts",contacts)
        maps=list(nx.algorithms.isomorphism.GraphMatcher(h,g).subgraph_monomorphisms_iter())
        assert len(maps)==2
        for m in maps:
            mapped=[m[k] for k in source_seq]
            diff=sorted(set(mapped)^set(seq))
            assert diff==[4]
            a=unoriented_eq(mapped,seq)
            b=unoriented_eq(mapped,[x for x in seq if x!=4])
            strict+=a; reduced+=b
            print("mapped",mapped,"difference",diff,"strict",a,"conditional",b)
    assert (strict,reduced)==(0,7)
    _,_,seq=original(crop,120)
    for axis in (0,1):
        _,_,ref=original(np.ascontiguousarray(np.flip(crop,axis)),120)
        if axis==1: ref=[16-x for x in ref]
        assert unoriented_eq(seq,ref)
        print("reflection control PASS axis",axis)
    print("strict 0/14; conditional 7/14; no anatomical attribution or cipher transfer")

if __name__=="__main__":
    main()
