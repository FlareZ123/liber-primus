"""Mengesha 2011 Table 3.2 non-affine p27 topology gate; read-only.
Source: https://www.rexresearch1.com/AirfoilDesignLibrary/StructuralDesignBiomimeticWingsMengesha.pdf
Printed pp38-39, Tables 3.1-3.2. Rotation is derived from cubic Bezier
tangents at t=.01 from each endpoint, descending atan2; row 6 endpoint
order reversed relative to its listed control points. No cipher fit.
"""
import networkx as nx
import cv2
import numpy as np
from scipy.ndimage import distance_transform_edt
from scipy.stats import spearmanr
from collections import Counter
from hashlib import sha256
from lp2_p27_wing_original_graph_sft import IMAGE, SHA256, THRESHOLDS, source_graph

ROT={1:[6,2],2:[3,11,9,1],3:[31,2,4,32,24],4:[3,5],5:[32,4,6],6:[33,5,1,7],7:[22,6,8],8:[14,20,7,9],9:[2,10,8],10:[11,13,9],11:[12,10,2],12:[11,16,13],13:[12,14,10],14:[13,15,8],15:[16,19,14],16:[12,17,15],17:[16,29,18],18:[17,28,19],19:[18,20,15],20:[19,21,8],21:[27,22,20],22:[23,7,21],23:[24,33,22],24:[3,23,25],25:[31,24,26],26:[30,25,27],27:[26,21,28],28:[29,27,18],29:[17,30,28],30:[29,31,26],31:[30,3,25],32:[3,5,33],33:[32,6,23]}
# Source edge IDs 2,4,5,6 have all three diameter coefficients zero.
ZERO={frozenset(x) for x in [(2,3),(4,5),(5,6),(1,6)]}
X=[None,40,4.2,26.4,39.5,39,39.5,35.4,20.9,11,9.1,2.5,4.4,8.1,13.1,12.2,7,9.2,15.6,16.1,23.6,28.2,34.9,35.1,25.7,21.5,19.3,20.1,17.3,11.6,14.5,18,34.7,36.7]
def dual(remove):
    emb=nx.PlanarEmbedding()
    emb.set_data({u:[v for v in vs if frozenset((u,v)) not in remove] for u,vs in ROT.items()})
    emb.check_structure()
    seen=set(); faces=[]; owner={}
    for u,v in emb.edges():
        if (u,v) not in seen:
            f=emb.traverse_face(u,v,seen); k=len(faces); faces.append(f)
            owner.update({(a,b):k for a,b in zip(f,f[1:]+f[:1])})
    # Directed 3->2 in full graph, or 1->2 after removing outer-only edges,
    # bounds exterior. These are the maximum absolute-area face in geometry.
    outer=owner[(1,2) if remove else (3,2)]
    h=nx.Graph();h.add_nodes_from(k for k in range(len(faces)) if k!=outer)
    for (u,v),a in owner.items():
        b=owner[v,u]
        if a!=b and outer not in (a,b): h.add_edge(a,b)
    return h,faces

def interfaces(crop,pairs):
    n,labels,stats,centers=cv2.connectedComponentsWithStats((crop>=80).astype(np.uint8),connectivity=8)
    cells=sorted((i for i in range(1,n) if 200<int(stats[i,cv2.CC_STAT_AREA])<70000),key=lambda i:float(centers[i,0]))
    assert len(cells)==15
    face=np.zeros(labels.shape,np.int16)
    for j,i in enumerate(cells,1):face[labels==i]=j
    dist,inds=distance_transform_edt(face==0,return_indices=True)
    for limit in (12,18,24,36,48,72,100):
        near=face[tuple(inds)];near[dist>limit]=0;c=Counter()
        for a,b in ((near[:-1,:],near[1:,:]),(near[:,:-1],near[:,1:])):
            s=(a>0)&(b>0)&(a!=b)
            keys,counts=np.unique(np.minimum(a[s],b[s])*16+np.maximum(a[s],b[s]),return_counts=True)
            c.update({(int(k)//16,int(k)%16):int(n) for k,n in zip(keys,counts)})
        print("radius",limit,"missing pair interface lengths",[c[p] for p in pairs])

def main():
    assert sha256(IMAGE.read_bytes()).hexdigest()==SHA256
    crop=cv2.imread(str(IMAGE),cv2.IMREAD_GRAYSCALE)[470:895,590:1840]
    a,_=dual(set());b,faces=dual(ZERO)
    assert (len(a),a.number_of_edges())==(19,45)
    assert (len(b),b.number_of_edges())==(15,29)
    for t in THRESHOLDS:
        edges,_=source_graph(crop,t);h=nx.Graph(edges)
        assert not nx.is_isomorphic(b,h)
        if t not in (80,120):continue
        maps=list(nx.algorithms.isomorphism.GraphMatcher(b,h).subgraph_monomorphisms_iter())
        assert len(maps)==2
        for m in maps:
            inv={v:k for k,v in m.items()}
            x=[np.mean([X[k] for k in faces[inv[j]]]) for j in range(1,16)]
            rho=float(spearmanr(range(1,16),x).statistic)
            missing=sorted(tuple(sorted((m[u],m[v]))) for u,v in b.edges if not h.has_edge(m[u],m[v]))
            print(t,"rho",rho,"missing",missing,"boundary cycles",[faces[inv[j]] for j in range(1,16)])
            if t==80 and rho<-.98:interfaces(crop,missing)
    print("Strict topology fails; relaxed maps require unsupported missing adjacencies.")
if __name__=="__main__":main()
