"""Test the previously untested later illustrated plates in Moulds 2012.

No plaintext, face permutations or numeric key guesses. Exact-parent SIFT gate
is reused; an independent normalized dual-graph gate admits geometric redraws.
The first 21 PDF pages are deliberately outside this experiment.
"""
from __future__ import annotations
from collections import Counter
from hashlib import sha256
from pathlib import Path
import json
import re

import cv2
import fitz
import networkx as nx
import numpy as np
from scipy.ndimage import distance_transform_edt

from lp2_p27_historical_threeplate_registration_sft import (
    TARGET, EXPECTED_SHA, fetch_bytes, match,
)
from lp2_p27_wing_original_graph_sft import source_graph

URL = "https://www.mapress.com/zootaxa/2012/f/zt03287p262.pdf"
EXPECTED_PDF = "f08eeaaee15221b2ca16510893ca1e77f80a3321516691167a4cfbb3dd5e9264"
OUT = Path("im-results/lp2-p27-moulds-lateplates")
OUT.mkdir(parents=True, exist_ok=True)
cv2.setNumThreads(2)

def graph(image, threshold):
    """Same native-pixel area/contact gate; explicitly discard exterior."""
    n, labels, stats, centers = cv2.connectedComponentsWithStats(
        (image >= threshold).astype(np.uint8), connectivity=8)
    outside = set(np.concatenate((labels[0], labels[-1], labels[:,0], labels[:,-1])))
    cells = sorted((i for i in range(1,n) if i not in outside and
                    200 < stats[i,cv2.CC_STAT_AREA] < 70000),
                   key=lambda i: float(centers[i,0]))
    if len(cells) != 15:
        return len(cells), None
    face = np.zeros(labels.shape, np.int16)
    for k,i in enumerate(cells,1):
        face[labels == i] = k
    dist, indices = distance_transform_edt(face==0, return_indices=True)
    nearest = face[tuple(indices)]
    nearest[dist>12] = 0
    borders=Counter()
    for a,b in ((nearest[:-1,:],nearest[1:,:]),(nearest[:,:-1],nearest[:,1:])):
        selected=(a>0)&(b>0)&(a!=b)
        keys,counts=np.unique(np.minimum(a[selected],b[selected])*16+
                              np.maximum(a[selected],b[selected]),return_counts=True)
        borders.update({(int(k)//16,int(k)%16):int(c) for k,c in zip(keys,counts)})
    g=nx.Graph()
    g.add_nodes_from(range(1,16))
    g.add_edges_from(pair for pair,c in borders.items() if c>=40)
    return len(cells),g

def plate_regions(image):
    """Retain all sufficiently large elongated connected illustration components."""
    ink=cv2.morphologyEx((image<180).astype(np.uint8),cv2.MORPH_CLOSE,np.ones((2,2),np.uint8))
    n,components,stats,_=cv2.connectedComponentsWithStats(ink,connectivity=8)
    for i in range(1,n):
        x,y,w,h,area=map(int,stats[i])
        if w>=160 and h>=35 and 1.5<=w/h<=6 and area>=450:
            region=image[y:y+h,x:x+w].copy()
            region[components[y:y+h,x:x+w]!=i]=255
            yield (x,y,w,h),region

def normalized(region):
    width=1144
    h=max(1,round(region.shape[0]*width/region.shape[1]))
    return cv2.copyMakeBorder(cv2.resize(region,(width,h),interpolation=cv2.INTER_LINEAR),
                              40,40,40,40,cv2.BORDER_CONSTANT,value=255)

raw=TARGET.read_bytes()
assert sha256(raw).hexdigest()==EXPECTED_SHA
source=cv2.imdecode(np.frombuffer(raw,dtype=np.uint8),cv2.IMREAD_GRAYSCALE)
target=source[516:855,643:1787].copy()
native=source[470:895,590:1840].copy()
refs=[]
for threshold in (80,100,120,140,160,180,200):
    count,g=graph(native,threshold)
    assert count==15
    old_edges,_=source_graph(native,threshold)
    assert set(map(frozenset,g.edges))==set(map(frozenset,old_edges))
    if not any(nx.is_isomorphic(g,prev) for prev in refs):
        refs.append(g)
assert len(refs)==2
# Native reflection is a genuinely different pixel raster; graph shape must survive.
assert nx.is_isomorphic(graph(cv2.flip(native,1),120)[1],refs[1])
planted=cv2.warpAffine(target,cv2.getRotationMatrix2D((target.shape[1]/2,target.shape[0]/2),4.,.87),(1300,430),borderValue=255)
positive=match(planted,target)
assert positive["valid_noncollapsed"]
report={"original_sha256":EXPECTED_SHA,"source":URL,"first_pdf_index":21,
        "native_positive":positive,"target_graph_edges":[len(g.edges) for g in refs],
        "records":[],"plate_pages":[]}
try:
    data=fetch_bytes(URL)
    report["source_sha256"]=sha256(data).hexdigest()
    report["source_bytes"]=len(data)
    assert report["source_sha256"]==EXPECTED_PDF
    with fitz.open(stream=data,filetype="pdf") as doc:
        for i in range(21,len(doc)):
            page=doc[i]
            text=page.get_text()
            # Figure captions, not ordinary taxonomic prose. Genus plates
            # sometimes abbreviate "fore wing", so all FIGURE(S) lines qualify.
            if not re.search(r"(?im)^\s*FIGURES?\s+\d+",text):
                continue
            report["plate_pages"].append(i)
            pix=page.get_pixmap(matrix=fitz.Matrix(2.5,2.5),colorspace=fitz.csGRAY,alpha=False)
            image=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width).copy()
            for bbox,region in plate_regions(image):
                norm=normalized(region)
                row={"pdf_index":i,"bbox":bbox,"faces":[],"graph_hits":[]}
                for t in (100,120,160,200):
                    count,g=graph(norm,t)
                    row["faces"].append([t,count])
                    if g is not None:
                        for j,ref in enumerate(refs):
                            if nx.is_isomorphic(g,ref):
                                row["graph_hits"].append([t,len(ref.edges)])
                # Native and reflected source candidates, independent of graph results.
                row["native"]=match(region,target)
                row["reflected"]=match(cv2.flip(region,1),target)
                report["records"].append(row)
                if row["graph_hits"] or any(row[k].get("valid_noncollapsed",False) for k in ("native","reflected")):
                    name=f"p{i}-x{bbox[0]}-y{bbox[1]}.png"
                    cv2.imwrite(str(OUT/name),region)
                    row["candidate_image"]=name
            if len(report["plate_pages"])%10==0:
                print("plates",len(report["plate_pages"]),"candidates",len(report["records"]),flush=True)
    report["status"]="EXECUTED"
except (OSError,ValueError,AssertionError,RuntimeError) as exc:
    report["status"]="BLOCKED_OR_PARTIAL"
    report["error"]=f"{type(exc).__name__}: {exc}"
(OUT/"topology.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"status":report["status"],"plate_pages":len(report["plate_pages"]),
                  "regions":len(report["records"]),
                  "graph_hits":sum(bool(r["graph_hits"]) for r in report["records"]),
                  "sift_hits":sum(any(r[k].get("valid_noncollapsed",False) for k in ("native","reflected")) for r in report["records"])}))
