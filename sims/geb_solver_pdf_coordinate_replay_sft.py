"""Independent GEB coordinate replay on the pinned solver-linked 2005 PDF.

Inputs: archived PDF bytes, fixed chapter opening locations documented in Session
125, and the original signed message's coordinates.  Selected words are not used
in the extraction. Compare line-opening turns with every-label turns.
No book body is written or redistributed.
"""
import hashlib
import json
import re
import subprocess
import sys
from urllib.request import Request,urlopen

URL="https://web.archive.org/web/20160411161235id_/https://dl.dropboxusercontent.com/u/40373160/GEB.pdf"
DIGEST="0c30a5c957557a580557fced796c9121c4be63bb82fee0b7eea134ff2e65522e"
# (label, opening PDF page, maximum pages to inspect, speech, word, letter)
ROWS=[
 ("3PI",37,1,6,1,3),("LML",111,1,1,1,1),
 ("ETOATS",487,4,19,9,1),("...AF",317,1,5,3,1),
 ("AMO",239,1,13,10,1),("CC",207,1,8,6,1),
 ("CBIA",161,1,3,7,2),("CFAF",185,1,5,23,6),
 ("SPR",728,1,1,8,1),("C[1]",83,1,4,5,3),
 ("AWDV",397,1,6,2,1),("C[2]",641,1,2,17,5),
 ("SC",689,1,3,17,1),("AOGS",437,1,2,8,1)]
EXPECTED="utqtzbrvsdtvzp"
# Deliberately fixed named cast, not general colon-separated text.
LABEL=r"(?:Achilles|Tortoise|Crab|Anteater|Sloth|Genie|Djinn|God|Author|Narrator|Hofstadter|Bach|Zeno|Record Player|Mr\. Tortoise|Mr\. Crab|Mad Hatter|Hare)"
START=re.compile(r"(?im)^\s*("+LABEL+r")\s*:")
ANY=re.compile(r"(?i)\b("+LABEL+r")\s*:")
WORDS=re.compile(r"[^\W_]+(?:['’\-][^\W_]+)*",re.UNICODE)

def get(url):
    with urlopen(Request(url,headers={"User-Agent":"LiberPrimusResearch/1.0"}),timeout=80) as r:
        data=r.read(30_000_001)
    assert len(data)==23151550 and hashlib.sha256(data).hexdigest()==DIGEST
    return data

def split_turns(text,pattern):
    matches=list(pattern.finditer(text))
    return [(m.group(1),text[m.end():matches[i+1].start() if i+1<len(matches) else len(text)],m.start())
            for i,m in enumerate(matches)]

def extract(text,pattern,s,w,l):
    turns=split_turns(text,pattern)
    if len(turns)<s:
        return {"turn_count":len(turns),"letter":None,"labels":[x[0] for x in turns[:s]]}
    label,body,pos=turns[s-1]
    # Eliminate bracketed stage instructions; keep text otherwise unchanged.
    body=re.sub(r"\[[^\]]*\]"," ",body)
    words=WORDS.findall(body)
    word=words[w-1] if len(words)>=w else None
    return {"speaker":label,"word":word,"letter":word[l-1].lower() if word and len(word)>=l else None,
            "word_count":len(words),"turn_count":len(turns),"labels":[x[0] for x in turns[:s]],
            "turn_offset":pos}

def geometry_text(page):
    # Reconstruct visible line ordering from span baseline positions rather
    # than trusting individual PDF text-block line breaks.
    lines=[]
    for block in page.get_text("dict")["blocks"]:
        if block["type"]!=0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                x,y=span["origin"]
                if span["text"].strip():
                    lines.append((y,x,span["text"],span["bbox"]))
    rows=[]
    for y,x,t,b in sorted(lines):
        if not rows or abs(y-rows[-1][0])>2:
            rows.append([y,[]])
        rows[-1][1].append((x,t,b))
    result=[]
    for y,spans in rows:
        spans.sort()
        parts=[]
        previous=None
        for x,t,b in spans:
            if previous is not None and x-previous>1.5:
                parts.append(" ")
            parts.append(t)
            previous=b[2]
        text="".join(parts)
        result.append(text)
        labels=[(m.group(1),m.start()) for m in ANY.finditer(text)]
        if labels and page.number+1 in (317,397,487,488,489,490):
            print("BASELINE",page.number+1,round(y,2),round(spans[0][0],2),json.dumps(labels),flush=True)
    return "\n".join(result)

def main():
    sys.stdout.reconfigure(errors="backslashreplace")
    raw=get(URL)
    try:
        import fitz
    except ImportError:
        subprocess.run([sys.executable,"-m","pip","install","--disable-pip-version-check","PyMuPDF==1.26.7"],check=True)
        import fitz
    doc=fitz.open(stream=raw,filetype="pdf")
    reference_url="https://cicadanotebook.com/files/geb_125.py"
    with urlopen(Request(reference_url,headers={"User-Agent":"LiberPrimusResearch/1.0"}),timeout=35) as r:
        reference=r.read(100000)
    assert hashlib.sha256(reference).hexdigest()=="5a7095134b0e3f716bc89a315dd5fd92c5b427d409b75a5d62b277ecf856d273"
    print("REFERENCE_CODE",json.dumps(reference.decode("utf-8"),ensure_ascii=True),flush=True)
    for mode in ("geometry",):
        selected=[]
        for name,opening,n,s,w,l in ROWS:
            pages=[doc[i-1] for i in range(opening,opening+n)]
            texts=[geometry_text(p) for p in pages]
            # Remove stand-alone page numbers, preserving the line boundaries
            # that carry the distinction between the two coordinate rules.
            text="\n".join(re.sub(r"(?m)^\s*\d{1,3}\s*$","",x) for x in texts)
            a=extract(text,START,s,w,l)
            b=extract(text,ANY,s,w,l)
            selected.append(a["letter"] or "?")
            print("REPLAY",mode,name,opening,json.dumps({"line_start":a,"every_label":b},ensure_ascii=True),flush=True)
            # Render selected page(s) to establish image availability without
            # publishing copyrighted page images.
            if mode=="raw":
                for page in pages:
                    pix=page.get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
                    print("RENDER",page.number+1,pix.width,pix.height,hashlib.sha256(pix.samples).hexdigest(),flush=True)
        answer="".join(selected)
        print("RESULT",mode,answer,sum(a==b for a,b in zip(answer,EXPECTED)),len(EXPECTED),flush=True)

if __name__=="__main__":
    main()
