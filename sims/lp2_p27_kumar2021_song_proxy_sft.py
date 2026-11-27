"""Test a modern figure crediting Song 2004 as acquisition proxy only."""
import base64, hashlib, json, urllib.request
from pathlib import Path
import cv2
import fitz
import numpy as np
from lp2_p27_historical_threeplate_registration_sft import TARGET, EXPECTED_SHA, match, separate_plate_regions

URL="https://gigvvy.com/journals/ijase/articles/ijase-202106-18-2-001.pdf"
OUT=Path("im-results/lp2-p27-kumar2021-proxy")
OUT.mkdir(parents=True,exist_ok=True)
raw=TARGET.read_bytes()
assert hashlib.sha256(raw).hexdigest()==EXPECTED_SHA
wing=cv2.imdecode(np.frombuffer(raw,np.uint8),cv2.IMREAD_GRAYSCALE)[516:855,643:1787].copy()
plant=cv2.warpAffine(wing,cv2.getRotationMatrix2D((wing.shape[1]/2,wing.shape[0]/2),4,.87),(1300,430),borderValue=255)
positive=match(plant,wing)
assert positive["valid_noncollapsed"]
report={"url":URL,"native_positive":positive,"scope":"exact-parent similarity only; 2021 proxy does not establish 2004 attribution"}
try:
    with urllib.request.urlopen(urllib.request.Request(URL,headers={"User-Agent":"LP2-research-source-plate/1.0"}),timeout=45) as response:
        data=response.read(25_000_001)
        report.update(final_url=response.geturl(),http_status=response.status)
    if len(data)>25_000_000 or not data.startswith(b"%PDF-"):
        raise ValueError("not a bounded PDF")
    report.update(pdf_bytes=len(data),pdf_sha256=hashlib.sha256(data).hexdigest())
    with fitz.open(stream=data,filetype="pdf") as doc:
        page=doc[2]
        caption=" ".join(page.get_text().split())
        assert "Song et al." in caption and "2004" in caption and "Cicada" in caption,caption[:500]
        pix=page.get_pixmap(matrix=fitz.Matrix(2.5,2.5),colorspace=fitz.csGRAY,alpha=False)
        img=np.frombuffer(pix.samples,np.uint8).reshape(pix.height,pix.width).copy()
        frames=[("page",img),*separate_plate_regions(img)]
        for i,info in enumerate(page.get_image_info()):
            box=fitz.Rect(info["bbox"])
            if box.width<40 or box.height<25: continue
            p=page.get_pixmap(matrix=fitz.Matrix(3,3),clip=box,colorspace=fitz.csGRAY,alpha=False)
            a=np.frombuffer(p.samples,np.uint8).reshape(p.height,p.width).copy()
            frames.append((f"embedded-{i}",a))
        hits=[{"frame":name,"reflected":reflection,**match(cv2.flip(frame,1) if reflection else frame,wing)} for name,frame in frames for reflection in (False,True)]
        report.update(status="ACQUIRED",page_index=2,caption_text=caption,registration=hits)
        preview=cv2.resize(img,(int(img.shape[1]*1000/img.shape[0]),1000),interpolation=cv2.INTER_AREA)
        ok,encoded=cv2.imencode(".png",preview)
        assert ok
        report["page_preview_png_base64"]=base64.b64encode(encoded).decode("ascii")
        cv2.imwrite(str(OUT/"figure-page.png"),img)
except Exception as exc:
    report.update(status="BLOCKED",error=f"{type(exc).__name__}: {exc}")
(OUT/"source-test-output.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
print(json.dumps({k:v for k,v in report.items() if k!="page_preview_png_base64"}),flush=True)
