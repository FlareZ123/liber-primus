"""Read-only, bounded exact Zenodo 23487409 claimed-solution PDF audit.

This is a fresh native HTTP transport attempt, separate from indexed web-cache
search; print only minimum source evidence. Do not persist third-party PDF
bytes into this repository. A PDF parser is used only if the recorded
103.2 kB / MD5 exact public artifact is actually downloaded.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import urllib.error
import urllib.request

RECORD=23487409
EXPECTED_MD5="89f1248f3c24f8b628e4305fb1dcbe6c"
URLS=(
  "https://zenodo.org/api/records/23487409",
  "https://zenodo.org/records/23487409/files/Cicada%203301.pdf?download=1",
  "https://zenodo.org/records/23487409/files/Cicada%203301.pdf",
  "https://zenodo.org/api/records/23487409/files/Cicada%203301.pdf/content",
  "https://zenodo.org/record/23487409/files/Cicada%203301.pdf?download=1",
)
HEAD={"User-Agent":"Mozilla/5.0 (compatible; Cicada3301-source-research/1.0)",
      "Accept":"application/pdf, application/json, */*"}

def get(url):
    req=urllib.request.Request(url, headers=HEAD)
    with urllib.request.urlopen(req,timeout=12) as response:
        content=response.read(250000)
        return response.status, response.url, response.headers.get("Content-Type"),content

for url in URLS:
    try:
        status,final,typ,data=get(url)
        print("ZENODO_FETCH",json.dumps({"url":url,"status":status,"final_url":final,"type":typ,
                "bytes":len(data),"first":data[:35].hex(),"sha256":hashlib.sha256(data).hexdigest()}),flush=True)
        if url.endswith("/23487409") and typ and "json" in typ:
            try:
                j=json.loads(data)
                print("ZENODO_META",json.dumps({"files":[{k:v for k,v in x.items() if k in
                     ("key","size","checksum","links")} for x in j.get("files",[])],
                     "doi":j.get("doi"),"title":j.get("metadata",{}).get("title")}),flush=True)
            except Exception as e:
                print("ZENODO_META_INVALID",str(e),flush=True)
        if data.startswith(b"%PDF-"):
            md5=hashlib.md5(data).hexdigest()
            if md5!=EXPECTED_MD5:
                print("ZENODO_PDF_MD5_MISMATCH",md5,flush=True)
                continue
            p=Path("zenodo-public-solution-readonly.pdf")
            p.write_bytes(data)
            proc=subprocess.run(["pdftotext","-layout",str(p),"-"],capture_output=True,
                                text=True,check=False,timeout=20)
            text=proc.stdout
            pages=text.split("\f")
            print("ZENODO_PDF_VERIFIED",json.dumps({"md5":md5,"sha256":hashlib.sha256(data).hexdigest(),
                 "pages":len([x for x in pages if x.strip()]),"chars":len(text),
                 "head":text[:3500],"pdftotext_exit":proc.returncode}),flush=True)
            import re
            pattern=re.compile(r"(?:liber primus|LP2|page[s]?\s+0.?55|decryp|rune|SHA.?512|key(?:word)?|Vigen[eè]re|original ciphertext)",re.I)
            excerpts=[]
            for i,page in enumerate(pages):
                if not page.strip():continue
                lines=page.splitlines()
                for j,line in enumerate(lines):
                    if pattern.search(line):
                        excerpts.append({"page":i+1,"excerpt":" ".join(lines[max(0,j-1):min(j+2,len(lines))])[:360]})
                        if len(excerpts)>=65:break
                if len(excerpts)>=65:break
            print("ZENODO_PDF_RELEVANT_LINES",json.dumps(excerpts),flush=True)
            p.unlink()
            break
    except Exception as e:
        print("ZENODO_FETCH_FAILED",json.dumps({"url":url,"error":str(e)[:240]}),flush=True)
