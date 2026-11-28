"""Director #3265: exact archived GEB selected-dialogue vector-only diagrams.
Read-only, narrow source inventory: no bitmap XObject matching (already done),
no arbitrary pages, no book text export and no LP2 ciphertext matching.
"""
import json, hashlib, sys, subprocess
from urllib.request import Request, urlopen
from io import BytesIO

URL="https://web.archive.org/web/20160411161235id_/https://dl.dropboxusercontent.com/u/40373160/GEB.pdf"
SHA="0c30a5c957557a580557fced796c9121c4be63bb82fee0b7eea134ff2e65522e"
DIALOGUES=[("3PI",37,41),("LML",111,136),("ETOATS",487,503),("...AF",317,344),
("AMO",239,254),("CC",207,213),("CBIA",161,167),("CFAF",185,190),
("SPR",728,751),("C[1]",83,90),("AWDV",397,412),("C[2]",641,649),
("SC",689,693),("AOGS",437,445)]
assert len(DIALOGUES)==14

def install():
    try: import fitz;return fitz
    except ImportError:
        subprocess.run([sys.executable,"-m","pip","install","--disable-pip-version-check","PyMuPDF==1.26.7"],check=True)
        import fitz;return fitz

def acquire():
    with urlopen(Request(URL,headers={"User-Agent":"LiberPrimusResearch/1.0"}),timeout=80) as r:
        raw=r.read(30_000_001)
    assert len(raw)==23151550 and hashlib.sha256(raw).hexdigest()==SHA,"wrong exact 2016 GEB source"
    return raw

def rect(a):
    return tuple(round(float(v),2) for v in (a.x0,a.y0,a.x1,a.y1))

def cluster_strokes(paths):
    """Fixed small-neighborhood grouping for fragmented single-operation strokes.

    Renderers often encode an authentic diagram as MANY one-dimensional paths,
    so absence of an individually two-dimensional path cannot prove an empty
    vector page. Group original path rectangles by overlap of 6pt padding,
    then retain a component with >=4 paths and union dimensions >=40pt each.
    This is a source inventory, not a geometric LP2 match/fit.
    """
    n=len(paths)
    if not n:return []
    parents=list(range(n))
    def root(i):
        while parents[i]!=i:
            parents[i]=parents[parents[i]];i=parents[i]
        return i
    def overlap(a,b):
        return a.x0<=b.x1+6 and a.x1+6>=b.x0 and a.y0<=b.y1+6 and a.y1+6>=b.y0
    # Sweep sorted x-coordinates, so only potentially adjacent boxes meet.
    ordered=sorted(range(n),key=lambda i:paths[i]["rect"].x0)
    for ii,i in enumerate(ordered):
        a=paths[i]["rect"]
        for j in ordered[ii+1:]:
            b=paths[j]["rect"]
            if b.x0>a.x1+6:break
            if overlap(a,b):
                ri,rj=root(i),root(j)
                if ri!=rj:parents[ri]=rj
    groups={}
    for i in range(n):groups.setdefault(root(i),[]).append(i)
    out=[]
    for ids in groups.values():
        if len(ids)<4:continue
        boxes=[paths[i]["rect"] for i in ids]
        x0=min(b.x0 for b in boxes);x1=max(b.x1 for b in boxes)
        y0=min(b.y0 for b in boxes);y1=max(b.y1 for b in boxes)
        if x1-x0<40 or y1-y0<40:continue
        count=sum(len(paths[i]["items"]) for i in ids)
        out.append(dict(path_count=len(ids),total_ops=count,
                        bbox=[round(x0,2),round(y0,2),round(x1,2),round(y1,2)]))
    return sorted(out,key=lambda c:(c["path_count"],c["total_ops"]),reverse=True)

def main():
    fitz=install()
    doc=fitz.open(stream=acquire(),filetype="pdf")
    pages=[]
    for dlg,start,end in DIALOGUES:
        for pno in range(start,end+1):
            page=doc[pno-1]
            paths=page.get_drawings()
            objects=[]
            grouped=cluster_strokes(paths)
            for i,d in enumerate(paths):
                box=d["rect"]
                w=box.width;h=box.height
                ops=[x[0] for x in d["items"]]
                important=(w>=18 and h>=18 and len(ops)>=2)
                # Baseline fixed score: substantive vector path only if its
                # bounding rectangle is two-dimensional and not a short rule.
                if important:
                    objects.append({
                      "ordinal":i,"rect":rect(box),"ops":len(ops),
                      "line":ops.count("l"),"curve":ops.count("c"),
                      "rect_ops":ops.count("re"),"quad_ops":ops.count("qu"),
                      "close":bool(d.get("closePath")),"fill":d.get("fill") is not None,
                      "stroke":d.get("color") is not None,
                      "width":round(float(d.get("width") or 0),3)})
            pages.append(dict(dialogue=dlg,pdf_page=pno,
               total_paths=len(paths),qualifying_paths=len(objects),objects=objects,
               grouped_vector_components=grouped,
               image_xobjects=len(page.get_images(full=True)),artboard=rect(page.rect)))
    ranked=sorted((x for x in pages if x["qualifying_paths"]),
       key=lambda x:(x["qualifying_paths"],sum(v["ops"] for v in x["objects"])),reverse=True)
    diag={
      "schema":"GEB_2016_exact_dialogue_vector_inventory_v1",
      "source_sha256":SHA,"selected_dialogues":len(DIALOGUES),
      "selected_physical_pages":len(pages),"pages_with_drawings":sum(bool(x["total_paths"]) for x in pages),
      "pages_with_2d_multiop_drawings":len(ranked),
      "raw_drawings":sum(x["total_paths"] for x in pages),
      "substantive_drawings":sum(x["qualifying_paths"] for x in pages),
      "multi_stroke_components":sum(len(x["grouped_vector_components"]) for x in pages),
      "pages_with_multi_stroke_components":sum(bool(x["grouped_vector_components"]) for x in pages),
      "top":ranked[:24],
      "per_dialogue":[{"name":d,"pages":sum(x["dialogue"]==d for x in pages),
          "drawings":sum(x["total_paths"] for x in pages if x["dialogue"]==d),
          "eligible":sum(x["qualifying_paths"] for x in pages if x["dialogue"]==d),
          "clustered":sum(len(x["grouped_vector_components"]) for x in pages if x["dialogue"]==d)}
          for d,_,_ in DIALOGUES],
      "all_source_drawings":pages
    }
    print("GEB_VECTOR_SUMMARY="+json.dumps({k:v for k,v in diag.items() if k!="all_source_drawings"},ensure_ascii=True,default=str),flush=True)
    with open("geb_vector_selected_dialogues_output.json","w",encoding="utf8") as f:
        json.dump(diag,f,indent=2,ensure_ascii=True)
    print("GEB_VECTOR_OUTPUT=geb_vector_selected_dialogues_output.json",flush=True)

if __name__=="__main__":main()
