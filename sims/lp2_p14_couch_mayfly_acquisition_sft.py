"""Bounded acquisition of the single previously identified Karen Couch lead.
No generic reverse-image search. Download exact clipart or its dated corpus
mirror; independently compare with original p14 only if actual pixels emerge.
"""
import base64, hashlib, io, json, re, textwrap
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from html.parser import HTMLParser
from PIL import Image
BASE="https://research.cs.wisc.edu/zhu/s/ttp3_new/imgs/wpclipart-7.2_small/"
MAX=4_000_000
def fetch(url):
    with urlopen(Request(url,headers={"User-Agent":"Mozilla/5.0 (primary-source-research/1.0)"}),timeout=25) as r:
        b=r.read(MAX+1)
        if len(b)>MAX: raise ValueError("bounded fetch limit")
        return b,r.geturl(),r.headers.get_content_type()
def show(url,b,resolved,media):
    im=Image.open(io.BytesIO(b));im.load()
    print("SOURCE",json.dumps({"url":url,"resolved":resolved,"media":media,"bytes":len(b),
        "sha256":hashlib.sha256(b).hexdigest(),"size":im.size,"format":im.format}),flush=True)
    im.thumbnail((900,650))
    canvas=Image.new("RGBA",im.size,"white")
    canvas.alpha_composite(im.convert("RGBA"))
    o=io.BytesIO();canvas.convert("RGB").save(o,"JPEG",quality=90)
    for i,x in enumerate(textwrap.wrap(base64.b64encode(o.getvalue()).decode(),1024)):
        print(f"CANDIDATE_{i:05d}:{x}")
    print("CANDIDATE_END",flush=True)
    return True
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        if tag=="a":
            a=dict(attrs);h=a.get("href")
            if h:self.links.append(h)
def listing(url):
    b,r,m=fetch(url);p=Links();p.feed(b.decode("utf-8","replace"));return p.links
def main():
    direct=[
        "https://www.wpclipart.com/animals/bugs/M/Ma/Mayfly.png",
        "https://wpclipart.com/animals/bugs/M/Ma/Mayfly.png",
        "http://www.wpclipart.com/animals/bugs/M/Ma/Mayfly.png",
        BASE+"animals/bugs/M/Ma/Mayfly.png",
        BASE+"animals/bugs/Mayfly.png",
        BASE+"animals/bugs/mayfly.png",
    ]
    acquired=False
    for url in direct:
        try:b,r,m=fetch(url);show(url,b,r,m);acquired=True;break
        except Exception as e:print("ERROR",url,type(e).__name__,str(e)[:200],flush=True)
    # A 2011 date-bearing corpus copy may have a different directory hierarchy.
    # Only the bugs directory and named mayfly/M subdirectories are traversed.
    urls=[BASE+"animals/bugs/"];seen=set()
    while urls and len(seen)<12:
        url=urls.pop(0)
        if url in seen:continue
        seen.add(url)
        try:
            links=listing(url)
            print("LIST",url,json.dumps(links),flush=True)
            for h in links:
                name=h.rstrip("/").rsplit("/",1)[-1].lower()
                if "mayfl" in name and not h.endswith("/"):
                    u=urljoin(url,h);b,r,m=fetch(u);show(u,b,r,m);acquired=True
                elif h.endswith("/") and (name in {"m","ma","mayfly","mayflies"} or "mayfl" in name):
                    urls.append(urljoin(url,h))
        except Exception as e:print("ERROR",url,type(e).__name__,str(e)[:200],flush=True)
    print("ACQUIRED",acquired,flush=True)
    if not acquired:raise SystemExit("named source unavailable")
if __name__=="__main__":main()
