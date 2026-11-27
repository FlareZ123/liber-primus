"""Bounded alternate Cicadomorpha source test for LP2 p27 (#3109).
No invented numbering or cipher transforms. Existing graph extractor is reused.
"""
from contextlib import redirect_stdout
from hashlib import sha256
from io import BytesIO, StringIO
import json
from urllib.request import Request, urlopen

import cv2
import fitz
import networkx as nx
import numpy as np
from PIL import Image
from lp2_p27_wing_original_graph_sft import IMAGE, SHA256, THRESHOLDS, source_graph
from lp2_p27_thieme_samepage_topology_sft import graph_cells

SOURCES = (
    ("Dietrich2005-Fig6", 6, (
        "https://ufdcimages.uflib.ufl.edu/UF/00/09/88/13/00015/SN00154040_0088_00419.pdf",
        "https://journals.flvc.org/flaent/article/download/75474/73132/",
    )),
    ("Evans1966-Fig6", 24, (
        "https://media.australian.museum/media/Uploads/Journals/17444/425_complete.pdf",
    )),
)
LIMIT = 80_000_000

def get_page(name, page, urls):
    for url in urls:
        try:
            req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(req, timeout=35) as r:
                b = r.read(LIMIT+1)
            assert len(b) <= LIMIT and b.startswith(b"%PDF")
            doc = fitz.open(stream=b, filetype="pdf")
            p = doc[page]
            print("SOURCE", json.dumps({"name":name,"url":url,"sha256":sha256(b).hexdigest(),
                "bytes":len(b),"page_index":page,"page_count":len(doc),
                "text":p.get_text()[:1200]}))
            pm = p.get_pixmap(matrix=fitz.Matrix(3,3), colorspace=fitz.csGRAY)
            return Image.frombytes("L", (pm.width, pm.height), pm.samples)
        except Exception as e:
            print("UNAVAILABLE", name, url, repr(e))
    return None

def compact_test(im, refs, tag):
    with redirect_stdout(StringIO()):
        out = graph_cells(im.convert("RGB"), None, max(im.size), refs, tag)
    print("GRAPH", json.dumps({
        "tag":tag,"size":im.size,
        "face_counts":sorted(set(x["faces"] for x in out["rows"])),
        "distinct_15face_graphs":out["distinct_15face_graphs"],
        "match_count":out["match_count"],"matches":out["matches"],
    },separators=(",",":")))
    return out["match_count"]

def crops(im):
    a=np.asarray(im)
    boxes=set()
    for t in (100,140,180,220):
        # Figure lines connected in ink; include whole component and its
        # interior, not artificial bridges. Text-sized components omitted.
        contours,_=cv2.findContours((a<t).astype("uint8"),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
        for c in contours:
            x,y,w,h=cv2.boundingRect(c)
            if max(w,h)<0.12*min(a.shape) or min(w,h)<0.025*min(a.shape):
                continue
            if max(w,h)/min(w,h)<1.6: continue
            if cv2.contourArea(c)<0.08*w*h: continue
            pad=max(5,round(max(w,h)*.04))
            boxes.add((max(0,x-pad),max(0,y-pad),min(a.shape[1],x+w+pad),min(a.shape[0],y+h+pad)))
    # Suppress near-identical bounding rectangles from different thresholds.
    selected=[]
    for b in sorted(boxes,key=lambda b:-(b[2]-b[0])*(b[3]-b[1])):
        x,y,X,Y=b
        area=(X-x)*(Y-y)
        if any((max(0,min(X,D)-max(x,A))*max(0,min(Y,E)-max(y,B)))/max(area,(D-A)*(E-B))>.80
            for A,B,D,E in selected): continue
        selected.append(b)
    return sorted(selected)

def main():
    assert sha256(IMAGE.read_bytes()).hexdigest()==SHA256
    orig=cv2.imread(str(IMAGE),cv2.IMREAD_GRAYSCALE)[470:895,590:1840]
    refs=[]
    for t in THRESHOLDS:
        edges,_=source_graph(orig,t)
        g=nx.Graph();g.add_nodes_from(range(1,16));g.add_edges_from(edges)
        if not any(set(g.edges)==set(r.edges) for r in refs):refs.append(g)
    assert compact_test(Image.fromarray(orig).resize((213,72),Image.Resampling.LANCZOS),refs,"native_control")>0
    for name,page,urls in SOURCES:
        im=get_page(name,page,urls)
        if im is None:continue
        boxes=crops(im)
        print("BOXES",name,im.size,json.dumps(boxes))
        for i,b in enumerate(boxes):
            crop=im.crop(b)
            if crop.height>crop.width:crop=crop.rotate(90,expand=True)
            compact_test(crop,refs,f"{name}-{i}")
    print("Decision: match candidates require inspection of the original panel and independent authored order; nonmatching extracted components do not exclude unextracted or non-affine artwork.")
if __name__=="__main__":main()
