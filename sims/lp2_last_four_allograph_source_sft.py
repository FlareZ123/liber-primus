#!/usr/bin/env python3
"""Original LP2 allograph source census for TH/W/M/D, conditional on the rune transcript.

Run: python sims/lp2_last_four_allograph_source_sft.py --archive ORIGINAL_ZIP
The underlying source is the 58 original JPEGs. Unknown plaintext is never used.
"""
from __future__ import annotations
import argparse
import io
import json
from collections import Counter
from pathlib import Path
from zipfile import ZipFile
import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
TRANS = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"]
COUNTS = {
 "TH":"MLHHKGDIIMKNHNGHIOGGLMLKIJKEHMIJHIIHIGDNEHMCIHQKLDABMGHECE",
 "W":"FJIFJDHGEKHKLKDBFGGLFKGLMHDFLJIJKPLFELFNDHKGDNINGCAFFEICFD",
 "M":"KFDJMEHHKMKGFMCDHJHIOJGIHIJLLKGIEIKHHIKIHJHIHKHGLEAHKINFDD",
 "D":"JIOIDMJGFLKHEKEFKERPJJBIFGGHNNHNELNHHIHGIHJHIJKHJCAFEKKDFE",
}
THRESHOLD = {"TH":0.12,"W":0.10,"M":0.06,"D":0.10}
WIDTH = {"TH":(33,34,35),"W":(33,34,35),"M":(52,53,54),"D":(52,53,54)}
EXCEPTIONS = {
 (2,"M"):"printed HBM cluster joined by insect illustration",
 (25,"TH"):"printed CTH glyph pair shares source ink component",
 (27,"M"):"oversized source-red initial M",
 (33,"D"):"oversized source-red initial D",
 (39,"W"):"large artistic source line of five glyphs MSWOEH",
 (39,"M"):"large artistic source line of five glyphs MSWOEH",
}
SOLVED_LABELS = [
 (727,["AE","J","OE","S","R","M","Y","L","O","H","O","AE","C","TH","G","W","W","L","AE","X"],[5]),
 (892,["O","A","P","M","D","D","U","G","W","L","D","N","Y","J","C","F","IA","AE","T"],[0]),
 (1080,["P","EO","A","TH","C","AE"],[0]),
 (1919,["C","D","F","N","IA","E","F","N","C","NG","R","F","AE","I","R","D","E","S","Y","J","EA","U"],[]),
 (2102,["NG","W","X","O","M","EA","W","F","R","G","IA","NG","R","B","AE","N","U","S"],[]),
]

def rows(gray):
    projection = (gray[:,595:1800]<160).sum(axis=1)
    centers,_=find_peaks(gaussian_filter1d(projection.astype(float),5),prominence=40,distance=100)
    result=[]
    for center in centers:
        if not 450<center<3150: continue
        y0,y1=max(0,center-60),min(gray.shape[0],center+65)
        ink=gray[y0:y1,530:1880]<110
        cols=np.flatnonzero(ink.sum(axis=0)>=2)
        boxes=[]
        for chunk in np.split(cols,np.flatnonzero(np.diff(cols)>1)+1):
            if not len(chunk): continue
            left,right=int(chunk[0]),int(chunk[-1])+1
            area=np.argwhere(ink[:,left:right])
            if len(area)<100 or np.ptp(area[:,0])<32: continue
            x=left+530
            if 595<=x<=1800 and np.ptp(area[:,0])+1>=70:
                boxes.append((x,right+530,int(y0+area[:,0].min()),int(y0+area[:,0].max()+1)))
        if boxes: result.append((int(center),boxes))
    return result

def feature(gray,box):
    x0,x1,y0,y1=box
    pixels=(gray[y0:y1,x0:x1]<160).astype(np.uint8)
    return cv2.resize(pixels,(48,64),interpolation=cv2.INTER_AREA).ravel().astype(np.float32)

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--archive",type=Path)
    ap.add_argument("--start",type=int,default=0)
    ap.add_argument("--stop",type=int,default=58)
    args=ap.parse_args()
    assert 0<=args.start<args.stop<=58
    assert all(len(v)==58 for v in COUNTS.values())
    transcription=(ROOT/"resources"/"lp2-transcription.txt").read_text(encoding="utf-8")
    p43=transcription.split("%")[43]
    labels43=[[TRANS[RUNES.index(ch)] for ch in line if ch in RUNES]
              for line in p43.split("/") if any(ch in RUNES for ch in line)]
    assert len(labels43)==12 and sum(map(len,labels43))==274
    archive=ZipFile(args.archive) if args.archive else None
    def load(page):
        name=f"{page+17:02}.jpg"
        if archive:
            return np.asarray(Image.open(io.BytesIO(archive.read("liber-primus-jpegs/"+name))).convert("L"))
        return np.asarray(Image.open(ROOT/"resources"/"liber-primus"/name).convert("L"))
    try:
        p56=load(56)
        labels,features=[],[]
        solved_rows=rows(p56)
        for center,want,skips in SOLVED_LABELS:
            physical=min(solved_rows,key=lambda x:abs(x[0]-center))[1]
            physical=[box for i,box in enumerate(physical) if i not in skips]
            assert len(physical)==len(want),(center,len(physical),len(want))
            for box,label in zip(physical,want):
                if label=="AE" and box[0]==601: continue # enlarged red control
                labels.append(label);features.append(feature(p56,box))
        assert len(labels)==84 and len(set(labels))==29
        p43_image=load(43)
        p43_rows=rows(p43_image)
        assert len(p43_rows)==len(labels43)
        for (_,boxes),names in zip(p43_rows,labels43):
            assert len(boxes)==len(names),(len(boxes),len(names))
            for box,label in zip(boxes,names):
                labels.append(label);features.append(feature(p43_image,box))
        assert len(labels)==358
        templates=np.stack(features)
        total=Counter()
        for page in range(args.start,args.stop):
            gray=load(page)
            got=Counter()
            for _,boxes in rows(gray):
                for box in boxes:
                    sample=feature(gray,box)
                    distances=np.square(templates-sample).mean(axis=1)
                    idx=int(np.argmin(distances))
                    name=labels[idx]
                    if name in COUNTS and box[1]-box[0] in WIDTH[name] and float(distances[idx])<=THRESHOLD[name]:
                        got[name]+=1
            for name in COUNTS:
                expected=ord(COUNTS[name][page])-65-int((page,name) in EXCEPTIONS)
                assert got[name]==expected,(page,name,got[name],expected)
                total[name]+=got[name]
        if (args.start,args.stop)==(0,58):
            assert total==Counter({"TH":460,"W":408,"M":439,"D":447})
        print(json.dumps({"original_scans":"17.jpg–74.jpg",
            "pages":[args.start,args.stop],
            "fixed_original_training":{"solved_p56":84,"labeled_p43":274},
            "normalized_source_image_shape":[48,64],
            "source_class_width":WIDTH,"source_shape_score_ceiling":THRESHOLD,
            "ordinary_matched":dict(total),
            "nonordinary_source_cases":[{"page":p,"rune":n,"reason":why}
                for (p,n),why in EXCEPTIONS.items() if args.start<=p<args.stop],
            "conclusion":"bounded original-font null for remaining four classes; zero plaintext or key"},
            indent=2))
    finally:
        if archive: archive.close()

if __name__=="__main__":
    main()
