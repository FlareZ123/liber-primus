"""Export exact canonical GP29 inputs for the two executed solvers."""
import json
import pathlib

here=pathlib.Path(__file__).resolve().parent
source=json.loads((here.parent.parent/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
pages=[p["indices"] for p in source["pages"] if 0<=p["page"]<=55 and p["indices"]]
assert len(pages)==55 and sum(map(len,pages))==12956
prefixes=[p[:next((i for i,x in enumerate(p) if i and x==0),len(p))] for p in pages]
alphabet="0123456789abcdefghijklmnopqrs"
def write(name,data,want):
    b=("".join("".join(alphabet[x] for x in p)+"\n" for p in data)).encode("ascii")
    h=2166136261
    for x in b:h=((h^x)*16777619)&0xffffffff
    assert h==want,hex(h)
    pathlib.Path(name).write_bytes(b)
write("pages.txt",pages,0x0534412c)
write("prefixes.txt",prefixes,0x02b81fdf)
