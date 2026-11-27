"""Bounded source-selected Fig.24 test, following actual acquisition in run 45947474016."""
from lp2_p27_thieme_samepage_topology_sft import *
def main():
    assert sha256(IMAGE.read_bytes()).hexdigest()==SHA256
    crop=cv2.imread(str(IMAGE),cv2.IMREAD_GRAYSCALE)[470:895,590:1840]
    reference=[]
    for t in THRESHOLDS:
        edges,_=source_graph(crop,t)
        g=nx.Graph();g.add_nodes_from(range(1,16));g.add_edges_from(edges)
        if not any(set(g.edges)==set(r.edges) for r in reference):reference.append(g)
    assert len(reference)==2
    req=Request(URLS["fig24"],headers={"User-Agent":"Mozilla/5.0 (compatible; primary-source-research/1.0)"})
    with urlopen(req,timeout=25) as response:body=response.read(2_000_001)
    assert sha256(body).hexdigest()=="24d4be11dd245c6e62dc0bc1bd8e5de031e321795e44479c42371e5c88b84986"
    im=Image.open(BytesIO(body)).convert("RGB")
    assert im.size==(311,121)
    # The broad rectangle encloses the full source forewing. It does not draw
    # artificial closures at existing gaps or erase anatomical annotations.
    source=im.crop((12,13,299,112))
    graph_cells(source,None,260,reference,"fig24_full")
if __name__=="__main__":main()
