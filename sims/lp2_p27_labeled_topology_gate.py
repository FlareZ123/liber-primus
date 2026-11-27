"""Topology label-transfer gate for p27; candidate JSON edges, optional basal anchor."""
import argparse, json, random
from pathlib import Path
from hashlib import sha256
import networkx as nx
import cv2
from lp2_p27_wing_original_graph_sft import source_graph, THRESHOLDS, SHA256, IMAGE

def matches(edges, candidate, anchor=None):
    g=nx.Graph(edges); h=nx.Graph(candidate)
    if len(h)!=15: return []
    return [m for m in nx.algorithms.isomorphism.GraphMatcher(g,h).isomorphisms_iter()
            if anchor is None or m[1]==anchor]

def main():
    p=argparse.ArgumentParser(); p.add_argument('--image',type=Path,default=IMAGE)
    p.add_argument('--candidate',type=Path); a=p.parse_args()
    assert sha256(a.image.read_bytes()).hexdigest()==SHA256
    image=cv2.imread(str(a.image),cv2.IMREAD_GRAYSCALE); crop=image[470:895,590:1840]
    labels=list('ABCDEFGHIJKLMNO'); random.Random(3109).shuffle(labels)
    label=dict(enumerate(labels,1)); candidate=json.loads(a.candidate.read_text()) if a.candidate else None
    for t in THRESHOLDS:
        edges,_=source_graph(crop,t)
        auto=matches(edges,edges); plant=[(label[x],label[y]) for x,y in edges]
        recovered=matches(edges,plant); anchored=matches(edges,plant,label[1])
        assert label in recovered and anchored==[label]
        assert len(auto)==len(recovered)==(1 if len(edges)==24 else 2)
        wrong=nx.Graph(edges); nx.double_edge_swap(wrong,nswap=12,max_tries=500,seed=3109)
        assert sorted(dict(wrong.degree()).values())==sorted(dict(nx.Graph(edges).degree()).values())
        assert not matches(edges,list(wrong.edges()))
        print(t,len(edges),len(auto),len(anchored),'degree-preserving negative: pass',
              'symmetries:',[{k:v for k,v in m.items() if k!=v} for m in auto])
        if candidate:
            print('candidate mappings:',json.dumps(matches(edges,candidate['edges'],candidate.get('anchor')),sort_keys=True))
if __name__=='__main__': main()
