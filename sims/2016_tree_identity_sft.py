#!/usr/bin/env python3
"""Compare signed 2016 central tree against LP2 original p32 and p55 tree crops.

No rune ciphertext or candidate plaintext is consulted. Source-image similarity
alone does not provide a cryptographic key, branch order, or cipher operation.
"""
import hashlib
import json
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
HIST = ROOT / "resources" / "historical" / "cicada2016-4gq25.jpg"
CASES = (
    ("p32", SOURCE / "49.jpg", (650, 2060, 1760, 3130), 252, 100),
    ("p55", SOURCE / "72.jpg", (650, 1410, 1760, 2480), 250, 70),
)
TARGET = (130, 225, 525, 455)
SCALES = np.arange(0.125, 0.2651, 0.005)
SIGMAS = (1.5, 3.0, 5.0)

def read(path):
    source = path.read_bytes()
    image = cv2.imdecode(np.frombuffer(source, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image is not None, path
    return image, hashlib.sha256(source).hexdigest()

def response(image, level, span):
    return np.clip((level-image.astype(np.float32))/span, 0, 1)

def match(target, template):
    ranked = []
    for sigma in SIGMAS:
        dest = cv2.GaussianBlur(target, (0,0), sigma)
        for flipped in (False, True):
            base = cv2.flip(template, 1) if flipped else template
            for scale in SCALES:
                size = (round(base.shape[1]*scale),round(base.shape[0]*scale))
                if size[0]>dest.shape[1] or size[1]>dest.shape[0]:
                    continue
                patch = cv2.resize(base, size, interpolation=cv2.INTER_AREA)
                patch = cv2.GaussianBlur(patch, (0,0), sigma)
                if patch.std()<0.02:
                    continue
                cc = cv2.matchTemplate(dest, patch, cv2.TM_CCOEFF_NORMED)
                _,peak,_,at = cv2.minMaxLoc(cc)
                ranked.append((float(peak),float(scale),sigma,flipped,at,size))
    ranked.sort(reverse=True)
    return [dict(correlation=round(score,6),scale=scale,blur_sigma=sigma,
                 reflected=reflected,top_left=list(at),size=list(size))
            for score,scale,sigma,reflected,at,size in ranked]

def run():
    signed,sha = read(HIST)
    assert signed.shape == (569,563)
    x1,y1,x2,y2=TARGET
    roi = signed[y1:y2,x1:x2]
    quantiles=np.quantile(roi,(0,.25,.5,.75,.90,.95,.99,1)).tolist()
    print("Signed JPEG tree crop gray quantiles",quantiles,flush=True)
    peak=max(5,np.quantile(roi,.97))
    dest=np.clip(roi.astype(np.float32)/float(peak),0,1).astype(np.float32)
    report={"signed":{"path":str(HIST.relative_to(ROOT)), "sha256":sha,
                       "dimensions":[563,569], "crop":list(TARGET),
                       "quantiles":quantiles}, "pages":{}}
    for name,path,(sx1,sy1,sx2,sy2),level,span in CASES:
        page,page_hash=read(path)
        assert page.shape == (3600,2400)
        template=response(page[sy1:sy2,sx1:sx2],level,span)
        ranked=match(dest,template)
        forward=next((v for v in ranked if not v["reflected"]),None)
        reverse=next((v for v in ranked if v["reflected"]),None)
        report["pages"][name]={"sha256":page_hash, "original_crop":[sx1,sy1,sx2,sy2],
                               "best_eight":ranked[:8], "best_unreflected":forward,
                               "best_reflected":reverse}
        print(name,json.dumps({"forward":forward,"reflected":reverse}),flush=True)
    p55,_=read(CASES[1][1])
    tx1,ty1,tx2,ty2=CASES[1][2]
    template=response(p55[ty1:ty2,tx1:tx2],250,70)
    plant=np.zeros_like(dest)
    size=(round(template.shape[1]*.17),round(template.shape[0]*.17))
    small=cv2.resize(template,size,interpolation=cv2.INTER_AREA)
    plant[20:20+small.shape[0],40:40+small.shape[1]]=small*.8
    rng=np.random.default_rng(20163301)
    plant=np.clip(plant+rng.normal(0,.006,plant.shape).astype(np.float32),0,1)
    check=match(plant,template)
    assert check and check[0]["correlation"]>.94,check[0]
    report["planted_control"]={"expected_scale":.17,"expected_origin":[40,20],
                               "recovered":check[0]}
    print("planted control",json.dumps(check[0]),flush=True)
    print("RESULT_JSON",json.dumps(report,separators=(",",":")),flush=True)
    return report

if __name__ == "__main__":
    run()
