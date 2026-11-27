"""Acquire the pinned historical PDF and independently replay the 14 GEB coordinates.

Run from repository root. Only metadata and selected words are printed.
"""
import hashlib
import json
import re
import sys
import subprocess
from urllib.request import Request, urlopen

URL = "https://web.archive.org/web/20160411161235id_/https://dl.dropboxusercontent.com/u/40373160/GEB.pdf"
DIGEST = "0c30a5c957557a580557fced796c9121c4be63bb82fee0b7eea134ff2e65522e"
BASE = "https://cicadanotebook.com/files/"
def get(url, limit):
    with urlopen(Request(url, headers={"User-Agent":"LiberPrimusResearch/1.0"}), timeout=70) as response:
        b = response.read(limit+1)
    if len(b)>limit:
        raise ValueError("size limit")
    return b

def main():
    sys.stdout.reconfigure(errors="backslashreplace")
    meta = get(BASE+"geb_125_results.json", 100_000)
    assert hashlib.sha256(meta).hexdigest()=="25da74084ed523b91dbae064c271d533ff541b7918ce9b94cb9a1f64e93e56b8"
    obj = json.loads(meta)
    print("REFERENCE_METADATA", json.dumps(obj,ensure_ascii=True), flush=True)
    try:
        pdf=get(URL,30_000_000)
    except Exception as exc:
        print("PDF_ACQUISITION_BLOCKED",type(exc).__name__,str(exc),flush=True)
        return 2
    print("PDF_ACQUIRED", len(pdf),hashlib.sha256(pdf).hexdigest(),flush=True)
    assert len(pdf)==23151550 and hashlib.sha256(pdf).hexdigest()==DIGEST
    try:
        import fitz
    except ImportError:
        subprocess.run([sys.executable,"-m","pip","install","--disable-pip-version-check","PyMuPDF==1.26.7"],check=True)
        import fitz
    doc=fitz.open(stream=pdf,filetype="pdf")
    print("PDF_PAGES",len(doc),"METADATA",json.dumps(doc.metadata,ensure_ascii=True),flush=True)
    # Map printed-page offset using unique dialogue headings near the page top.
    headings=["Three-Part Invention","Little Harmonic Labyrinth","Edifying Thoughts of a Tobacco Smoker","Ant Fugue","A Mu Offering","Crab Canon","Canon by Intervallic Augmentation","Chromatic Fantasy, And Feud","Six-Part Ricercar","Contracrostipunctus","Aria with Diverse Variations","Contrafactus","Sloth Canon","Air on G's String"]
    for i,p in enumerate(doc):
        lines=p.get_text(sort=True).splitlines()
        header=" ".join(lines[:8]).casefold()
        for h in headings:
            if h.casefold() in header:
                print("HEADING",i+1,h,flush=True)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
