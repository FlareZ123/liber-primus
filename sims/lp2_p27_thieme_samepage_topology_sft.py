"""Source-fixed p27 wing graph comparison with Metafysica XIV Figs 20 and 24.

Fig.4 of this same webpage is the established p23–26 mayfly art parent.
Fig.20 is a whole cicada (Severa, 1977), Fig.24 is an isolated homopteran
wing (Haupt/Rohdendorf, 1949). Neither name is treated as a cipher key.
Compare all thresholds, not a selected visually pleasing result.
"""
from collections import Counter
from hashlib import sha256
from io import BytesIO
from urllib.request import Request, urlopen
import base64, json, textwrap

import cv2
import networkx as nx
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt
from lp2_p27_wing_original_graph_sft import source_graph, THRESHOLDS, SHA256, IMAGE

URLS = {
    "fig20": "https://www.metafysica.nl/wings/thieme_124_2.jpg",
    "fig24": "https://www.metafysica.nl/wings/rohd1949_38v.jpg",
}
FIG20_HASH = "c0e76a72a0f74bf6b801f9de42e8bee1c82fe6dfce2e7d872aeb260dfa2f0a2a"
# Broad polygon selection on the actual retrieved source Fig.20. Outside
# the polygon remains unmodified in component extraction; only the
# component centroid and fraction inside are checked. No line is drawn
# to complete an otherwise open wing cell.
RIGHT = [(278,110),(290,87),(329,59),(371,36),(420,26),(470,26),
         (491,39),(488,59),(469,84),(441,105),(410,117),(378,121),
         (337,122),(300,119)]
LEFT = [(17,39),(35,26),(83,26),(132,36),(176,59),(215,85),
        (234,110),(210,119),(173,122),(132,122),(103,117),(72,105),
        (44,83),(20,57)]
UPSCALE=4
RANGES=(100,120,140,160,180,200,220,235)
RADII=(6,8,10,12)
INTERFACES=(16,24,32)

def emit_image(tag,im):
    mem=BytesIO(); im.convert("RGB").save(mem,format="JPEG",quality=76,optimize=True)
    data=base64.b64encode(mem.getvalue()).decode()
    for i,part in enumerate(textwrap.wrap(data,1024)):
        print(f"{tag}_{i:05d}:{part}")
    print(f"{tag}_END")

def load_figure(name):
    req=Request(URLS[name],headers={"User-Agent":"Mozilla/5.0 (compatible; primary-source-research/1.0)"})
    with urlopen(req,timeout=25) as response:
        body=response.read(2_000_001)
    assert len(body)<=2_000_000
    h=sha256(body).hexdigest()
    if name=="fig20":
        assert h==FIG20_HASH,"Source changed since acquisition"
    im=Image.open(BytesIO(body)).convert("RGB")
    print("SOURCE",json.dumps({"figure":name,"url":URLS[name],"sha256":h,
                                  "size":im.size,"bytes":len(body)}))
    return im

def graph_cells(im, polygon, source_width, refgraphs, tag):
    # Resample on a normalized source wing scale so all candidate and
    # low-resolution original controls use identical geometric settings.
    scale=195/source_width
    im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
    if polygon:
        polygon=[(round(x*scale),round(y*scale)) for x,y in polygon]
    native_size=im.size
    im=im.resize((im.width*UPSCALE,im.height*UPSCALE),Image.Resampling.BICUBIC)
    area=np.asarray(im)
    channels={"gray":np.asarray(im.convert("L")),"green":area[:,:,1],"blue":area[:,:,2]}
    if polygon:
        selector=Image.new("1",im.size,0)
        ImageDraw.Draw(selector).polygon([(x*UPSCALE,y*UPSCALE) for x,y in polygon],fill=1)
        selector=np.array(selector,dtype=bool)
    else:
        selector=np.ones(area.shape[:2],dtype=bool)
    summaries=[]; matched=[]; seen=set()
    for channel,values in channels.items():
        for threshold in RANGES:
            n,lab,stats,centers=cv2.connectedComponentsWithStats((values>=threshold).astype(np.uint8),connectivity=8)
            cells=[]
            for i in range(1,n):
                x,y,w,h,a=stats[i]
                if x==0 or y==0 or x+w==lab.shape[1] or y+h==lab.shape[0]: continue
                if a<4*UPSCALE**2: continue
                cx,cy=centers[i]
                if not selector[int(cy),int(cx)]: continue
                pixels=lab==i
                if np.count_nonzero(pixels&selector)<0.85*a: continue
                cells.append(i)
            cells.sort(key=lambda i:centers[i,0])
            row={"tag":tag,"channel":channel,"threshold":threshold,"faces":len(cells)}
            if len(cells)==15:
                face=np.zeros_like(lab,dtype=np.int16)
                for k,i in enumerate(cells,1): face[lab==i]=k
                dist,idx=distance_transform_edt(face==0,return_indices=True)
                nearest=face[tuple(idx)]
                graphs=[]
                for radius in RADII:
                    q=nearest.copy(); q[dist>radius]=0
                    borders=Counter()
                    for a,b in ((q[:-1,:],q[1:,:]),(q[:,:-1],q[:,1:])):
                        keep=(a>0)&(b>0)&(a!=b)
                        pairs=np.minimum(a[keep],b[keep])*16+np.maximum(a[keep],b[keep])
                        keys,counts=np.unique(pairs,return_counts=True)
                        borders.update({(int(k)//16,int(k)%16):int(v) for k,v in zip(keys,counts)})
                    for cutoff in INTERFACES:
                        edges=tuple(sorted(k for k,v in borders.items() if v>=cutoff))
                        G=nx.Graph(); G.add_nodes_from(range(1,16)); G.add_edges_from(edges)
                        mappings=[j for j,R in enumerate(refgraphs) if nx.is_isomorphic(G,R)]
                        graphs.append([radius,cutoff,len(edges),mappings])
                        if mappings:
                            matched.append([channel,threshold,radius,cutoff,mappings])
                        seen.add(edges)
                row["graphs"]=graphs
                # Emit one labelled source segmentation per unique channel
                # family at its first 15-face threshold. Not a selected hit.
                if not any(x["channel"]==channel and x["faces"]==15 for x in summaries):
                    canvas=im.copy(); draw=ImageDraw.Draw(canvas)
                    for k,i in enumerate(cells,1):
                        cx,cy=centers[i]; draw.ellipse((cx-9,cy-9,cx+9,cy+9),fill="white",outline="red")
                        draw.text((cx-6,cy-6),str(k),fill="red")
                    # Small JPEG for inspection without raw full-source republishing.
                    canvas.thumbnail((600,300))
                    emit_image(f"MASK_{tag}_{channel}",canvas)
            summaries.append(row)
    result={"tag":tag,"native_size":native_size,"rows":summaries,"distinct_15face_graphs":len(seen),"match_count":len(matched),"matches":matched}
    print("GRAPH",json.dumps(result,separators=(",",":")))
    return result

def main():
    assert sha256(IMAGE.read_bytes()).hexdigest()==SHA256
    crop=cv2.imread(str(IMAGE),cv2.IMREAD_GRAYSCALE)[470:895,590:1840]
    reference=[]
    for t in THRESHOLDS:
        edges,_=source_graph(crop,t)
        g=nx.Graph();g.add_nodes_from(range(1,16));g.add_edges_from(edges)
        if not any(set(g.edges)==set(r.edges) for r in reference):reference.append(g)
    assert len(reference)==2
    print("REFERENCE",json.dumps([sorted(g.edges) for g in reference]))
    # Exact original positive: downsample the known wing to the candidate's
    # low native resolution and independently recover its topology.
    plant=Image.fromarray(crop).convert("RGB")
    plant=plant.resize((213,72),Image.Resampling.LANCZOS)
    control=graph_cells(plant,None,195,reference,"native_lowres")
    source20=load_figure("fig20")
    assert source20.size==(526,271)
    # crop both forewings from the same actual source; the original polygon
    # selection is preserved in each crop. No hand-traced fake boundaries.
    for tag,box,polygon in (("fig20_right",(275,18,500,126),RIGHT),
                            ("fig20_left",(10,18,240,126),LEFT)):
        x0,y0,_,_=box
        graph_cells(source20.crop(box),[(x-x0,y-y0) for x,y in polygon],195,reference,tag)
    try:
        source24=load_figure("fig24")
    except Exception as e:
        print("FIG24_UNAVAILABLE",type(e).__name__,str(e))
        return
    # Fig.24's actual raster must be inspected before fixing crop or
    # attempting a graph comparison; it is not silently pooled as a
    # negative. Emit a bounded preview with source identity.
    preview=source24.copy();preview.thumbnail((900,500))
    emit_image("FIG24_PREVIEW",preview)

if __name__=="__main__":main()
