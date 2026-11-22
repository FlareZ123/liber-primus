#!/usr/bin/env python3
"""Original-image LP2 p2 rune-mirroring SFT, with a solved p57 glyph control.

Run: python sims/lp2_p2_literal_glyph_reflection_sft.py
Requires numpy, pillow and scipy. Source text supplies labels and printed
boundaries; glyph detection, reflection and classification operate on JPEG ink.
"""
from __future__ import annotations
from collections import Counter, defaultdict
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
REFS = ROOT / "resources" / "liber-primus"
RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
TRANSLIT = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"]


def source_lines():
    original = (REFS / "lp2-transcription.txt").read_text(encoding="utf-8")
    p2 = original.split("%")[2].split("&")[0].strip()
    p57 = original.split("%")[-1].split("§")[0].strip()
    def parse(block):
        return [[c for c in line if c in RUNES]
                for line in block.replace("\n", "").split("/")
                if any(c in RUNES for c in line)]
    lines_p2, lines_p57 = parse(p2), parse(p57)
    assert [len(x) for x in lines_p2] == [21,24,22,25,23,21,24,22,19]
    assert [len(x) for x in lines_p57] == [20,17,17,18,23]
    return p2, lines_p2, lines_p57


def glyph_rows(jpeg, lines, centers, min_x, p2=False):
    gray = np.asarray(Image.open(jpeg).convert("L"))
    out = []
    for row_id, (center, labels) in enumerate(zip(centers, lines)):
        x0, x1, y0, y1 = 530, 1880, center-60, center+65
        ink = gray[y0:y1, x0:x1] < 110
        xs = np.flatnonzero(ink.sum(axis=0) >= 2)
        runs = np.split(xs, np.flatnonzero(np.diff(xs)>1)+1)
        crops = []
        for run in runs:
            if not run.size:
                continue
            left, right = int(run[0]), int(run[-1])+1
            region = ink[:,left:right]
            ys, xs = np.where(region)
            if len(xs)<100 or np.ptp(ys)<32:
                continue
            if not min_x <= left+x0 <= 1800 or np.ptp(ys)+1<70:
                continue
            crops.append(region[ys.min():ys.max()+1,xs.min():xs.max()+1])
        if p2 and row_id == 0:
            # p2 infinity ornament joins the H/B/M cluster. Frozen cut from
            # lp2_full_source_rune_assignment_audit.py, (2,0) component 9.
            joined = crops.pop(9)[33:,:]
            for j, part in enumerate(np.split(joined,[47,86],axis=1)):
                yy,xx = np.where(part)
                crops.insert(9+j,part[yy.min():yy.max()+1,xx.min():xx.max()+1])
        assert len(crops)==len(labels), (jpeg.name,row_id,len(crops),len(labels))
        out.extend(dict(row=row_id,label=label,crop=crop)
                   for label,crop in zip(labels,crops))
    return out


def ink_iou(a,b):
    ha,wa=a.shape
    hb,wb=b.shape
    canvas=np.zeros((max(ha,hb)+2,max(wa,wb)+2),bool)
    canvas[1:1+ha,1:1+wa]=a
    best=0.0
    for dy in (-1,0,1):
        for dx in (-1,0,1):
            other=np.zeros_like(canvas)
            other[1+dy:1+dy+hb,1+dx:1+dx+wb]=b
            both=np.logical_and(canvas,other).sum()
            either=np.logical_or(canvas,other).sum()
            best=max(best,both/either if either else 0.)
    return float(best)


def rank(sample,training,mirror=False):
    crop=sample["crop"][:,::-1] if mirror else sample["crop"]
    candidates=[]
    for symbol in RUNES:
        values=[ink_iou(crop,t["crop"]) for t in training
                if t["label"]==symbol and t is not sample]
        if values:
            candidates.append((symbol,max(values)))
    return sorted(candidates,key=lambda item:item[1],reverse=True)


def report():
    p2text,lines_p2,lines_p57=source_lines()
    image=np.asarray(Image.open(REFS/"19.jpg").convert("L"))
    projection=(image[:,595:1800]<160).sum(axis=1)
    peaks,_=find_peaks(gaussian_filter1d(projection.astype(float),sigma=5),
                       prominence=40,distance=100)
    centers=[int(v) for v in peaks if 450<v<3150][:9]
    assert centers==[700,888,1077,1269,1453,1638,1830,2016,2205]
    glyphs=glyph_rows(REFS/"19.jpg",lines_p2,centers,595,True)
    training=[g for g in glyphs if 1<=g["row"]<=7]
    withheld=[g for g in glyphs if g["row"] in (0,8)]
    assert len(glyphs)==201 and len(training)==161 and len(withheld)==40
    assert len(set(g["label"] for g in training))==29
    original=[rank(g,training) for g in training]
    held=[rank(g,training) for g in withheld]
    # Solved p57 uses the same black font; exclude seven differently printed
    # red rubric glyphs from its first line.
    solved=glyph_rows(REFS/"74.jpg",lines_p57[:4],[944,1132,1378,1569],850)
    black=solved[7:]
    control=[rank(g,training) for g in black]
    reflected=[rank(g,training,True) for g in glyphs]
    votes=defaultdict(Counter)
    for g in training:
        votes[g["label"]][rank(g,training,True)[0][0]]+=1
    mapping={r:votes[r].most_common(1)[0][0] for r in RUNES}
    hold_mirror=[rank(g,training,True) for g in withheld]
    result="".join(mapping.get(c,c) for c in p2text)
    translit="".join(TRANSLIT[RUNES.index(c)] if c in RUNES else c for c in result)
    return {
      "source_images":["19.jpg","74.jpg"],
      "total_glyphs":len(glyphs),
      "rune_classes":len(votes),
      "original_train_leave_one_out_correct":sum(g["label"]==r[0][0] for g,r in zip(training,original)),
      "original_train_total":len(training),
      "original_held_out_correct":sum(g["label"]==r[0][0] for g,r in zip(withheld,held)),
      "original_held_out_total":len(withheld),
      "solved_p57_black_correct":sum(g["label"]==r[0][0] for g,r in zip(black,control)),
      "solved_p57_black_total":len(black),
      "ordinary_loo_median_iou":round(float(np.median([r[0][1] for r in original])),6),
      "mirror_median_iou":round(float(np.median([r[0][1] for r in reflected])),6),
      "mirror_ge_0_9":sum(r[0][1]>=0.9 for r in reflected),
      "mirror_total":len(reflected),
      "mapping_outputs":len(set(mapping.values())),
      "mapping":mapping,
      "mirror_holdout_consistent_with_frozen_map":sum(mapping[g["label"]]==r[0][0] for g,r in zip(withheld,hold_mirror)),
      "mirror_holdout_total":len(withheld),
      "mirror_pixel_double_flip_exact":all(np.array_equal(g["crop"],g["crop"][:,::-1][:,::-1]) for g in glyphs),
      "reflected_full_p2_gp29":translit,
      "mirror_predictions":[{"row":g["row"],"label":g["label"],
                            "nearest":r[0][0],"iou":round(r[0][1],4),
                            "runner_up":r[1][0],
                            "margin":round(r[0][1]-r[1][1],4)}
                            for g,r in zip(glyphs,reflected)]
    }


if __name__=="__main__":
    print(json.dumps(report(),ensure_ascii=False,indent=2))
