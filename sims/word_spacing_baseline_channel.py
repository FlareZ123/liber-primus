#!/usr/bin/env python3
"""Source-image test for LP2 word-gap and baseline geometry."""
import argparse, json
from collections import Counter, defaultdict
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks
from scipy.stats import spearmanr

RUNES = list("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
LP2 = [0, 1, 2, *range(16, 22), *range(40, 49)]
CONTROLS = [56, 57]
# (page, line, source rune count, runes before '-', left rune ID, right rune ID)
# Seven adjacent-rune pairs repeated at least five times, selected from lp2-transcription.txt.
REPEATED = [
(0,3,22,13,8,17),(2,4,23,22,8,17),(41,2,26,23,8,17),(42,4,22,3,8,17),(46,9,23,19,8,17),
(0,9,20,15,17,22),(41,3,24,5,17,22),(46,4,25,4,17,22),(48,1,24,9,17,22),(48,6,22,13,17,22),
(0,10,23,12,16,25),(2,4,23,19,16,25),(18,2,22,12,16,25),(43,9,25,21,16,25),(44,4,23,18,16,25),(45,3,23,13,16,25),(46,7,24,16,16,25),
(16,2,23,18,14,24),(41,9,21,5,14,24),(41,11,24,14,14,24),(42,9,24,4,14,24),(45,5,23,22,14,24),
(16,3,23,12,6,20),(20,5,23,15,6,20),(20,8,24,15,6,20),(42,2,22,3,6,20),(45,6,22,17,6,20),
(17,5,22,13,26,13),(18,7,22,18,26,13),(20,0,22,10,26,13),(21,0,22,19,26,13),(21,2,24,17,26,13),
(20,10,22,19,11,10),(40,5,23,19,11,10),(42,9,24,6,11,10),(43,0,23,2,11,10),(46,9,23,16,11,10)
]

def detect(path):
    px = np.asarray(Image.open(path).convert("L"))
    proj = (px[:,780:1850] < 145).sum(axis=1)
    peaks, _ = find_peaks(gaussian_filter1d(proj.astype(float), 6),
                          prominence=100, distance=135)
    out = []
    for cy in [int(y) for y in peaks if 400 < y < 3200]:
        y0, y1 = max(0, cy-70), min(px.shape[0], cy+70)
        ink = px[y0:y1,530:1880] < 110
        active = np.flatnonzero(ink.sum(axis=0) >= 2)
        runs = np.split(active, np.flatnonzero(np.diff(active) > 1) + 1)
        glyphs, marks = [], []
        for run in runs:
            if not run.size: continue
            l, r = int(run[0]), int(run[-1])+1
            ys, _ = np.where(ink[:,l:r])
            if len(ys) < 25: continue
            h, w = int(np.ptp(ys)+1), r-l
            item = {"x0":l+530,"x1":r+530,"top":int(ys.min()+y0),
                    "bottom":int(ys.max()+y0),"h":h,"w":w,"area":int(len(ys))}
            if len(ys)>=100 and 70<=h<=145 and w<=130 and 595<=item["x0"]<=1800:
                glyphs.append(item)
            elif 25<=len(ys)<=220 and 5<=h<=24 and 5<=w<=20 and 595<=item["x0"]<=1800:
                item["cx"]=(item["x0"]+item["x1"])/2
                item["cy"]=(item["top"]+item["bottom"])/2
                marks.append(item)
        glyphs.sort(key=lambda z:z["x0"]); marks.sort(key=lambda z:z["x0"])
        out.append({"glyphs":glyphs,"marks":marks})
    return out

def qstats(xs):
    a=np.asarray(xs,dtype=float)
    return {k:round(float(v),3) for k,v in {
        "n":len(a),"min":a.min(),"q05":np.quantile(a,.05),
        "q25":np.quantile(a,.25),"median":np.median(a),
        "q75":np.quantile(a,.75),"q95":np.quantile(a,.95),
        "max":a.max(),"mean":a.mean(),
        "sd":a.std(ddof=1) if len(a)>1 else 0}.items()}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--image-dir",type=Path,default=Path(__file__).resolve().parents[1]/"resources"/"liber-primus")
    ap.add_argument("--scan-offset",type=int,default=17)
    a=ap.parse_args()
    pages=LP2+CONTROLS
    lines={p:detect(a.image_dir/f"{p+a.scan_offset:02d}.jpg") for p in pages}

    marker_events, plain_gaps=[],[]
    for p in pages:
        allowed={0,1,2,6,7} if p==56 else ({0,1,2,3,4} if p==57 else None)
        for li,line in enumerate(lines[p]):
            if allowed is not None and li not in allowed: continue
            gs,ms=line["glyphs"],line["marks"]
            if len(gs)<(5 if p in CONTROLS else 10): continue
            for l,r in zip(gs,gs[1:]):
                cand=[m for m in ms if m["x0"]>=l["x1"] and m["x1"]<=r["x0"]]
                gap=r["x0"]-l["x1"]
                if not cand: plain_gaps.append(gap)
                elif len(cand)==1:
                    m=cand[0]; lg=m["x0"]-l["x1"]; rg=r["x0"]-m["x1"]
                    off=m["cx"]-(l["x1"]+r["x0"])/2
                    if gap<=30 and lg<=15 and rg<=15 and abs(off)<=5:
                        marker_events.append({"page":p,"gap":gap,"w":m["w"],
                            "left":lg,"right":rg,"offset":off,
                            "height":float(np.median([g["h"] for g in gs]) )})

    repeated=[]
    for p,li,n,pos,left_id,right_id in REPEATED:
        line=lines[p][li]; gs,ms=line["glyphs"],line["marks"]
        if len(gs)!=n: raise AssertionError(f"glyph count mismatch p{p} line{li}: {len(gs)} != {n}")
        l,r=gs[pos-1],gs[pos]
        cand=[m for m in ms if m["x0"]>=l["x1"] and m["x1"]<=r["x0"]]
        if len(cand)!=1: raise AssertionError(f"separator mismatch p{p} line{li} boundary{pos}")
        m=cand[0]
        line_left=min(g["x0"] for g in gs); line_right=max(g["x1"] for g in gs)
        repeated.append({"pair":RUNES[left_id]+"→"+RUNES[right_id],"page":p,
            "gap":r["x0"]-l["x1"],"offset":m["cx"]-(l["x1"]+r["x0"])/2,
            "x_fraction":(m["cx"]-line_left)/(line_right-line_left),
            "line_span":line_right-line_left})

    groups=defaultdict(list)
    for e in repeated: groups[e["pair"]].append(e)
    pair_rows=[]
    for pair,rs in sorted(groups.items()):
        offs=[x["offset"] for x in rs]; gaps=[x["gap"] for x in rs]
        pair_rows.append({"pair":pair,"n":len(rs),"pages":sorted({x["page"] for x in rs}),
            "offset_range":[round(min(offs),3),round(max(offs),3)],
            "gap_range":[min(gaps),max(gaps)]})
    offsets=np.array([x["offset"] for x in repeated],float)
    gaps=np.array([x["gap"] for x in repeated],float)
    wso=sum(sum((x["offset"]-np.mean([y["offset"] for y in rs]))**2 for x in rs) for rs in groups.values())
    wsg=sum(sum((x["gap"]-np.mean([y["gap"] for y in rs]))**2 for x in rs) for rs in groups.values())
    dof=len(repeated)-len(groups)
    pair_means={pair:np.mean([x["offset"] for x in rs]) for pair,rs in groups.items()}
    residuals=np.array([x["offset"]-pair_means[x["pair"]] for x in repeated])
    rho_x,p_x=spearmanr(residuals,[x["x_fraction"] for x in repeated])
    rho_span,p_span=spearmanr(residuals,[x["line_span"] for x in repeated])

    row_positions=[]; pitches=[]
    for p in pages:
        allowed={0,1,2,6,7} if p==56 else ({0,1,2,3,4} if p==57 else None)
        rows=[]
        for li,line in enumerate(lines[p]):
            if allowed is not None and li not in allowed: continue
            if len(line["glyphs"])<(5 if p==56 else 10) or not line["marks"]: continue
            ys=[m["cy"] for m in line["marks"]]
            row={"page":p,"line":li,"y":float(np.median(ys)),"sd":float(np.std(ys))}
            row_positions.append(row); rows.append(row)
        rows.sort(key=lambda z:z["line"])
        for x,y in zip(rows,rows[1:]):
            if y["line"]==x["line"]+1:
                pitches.append({"page":p,"from":x["line"],"to":y["line"],"pitch":round(y["y"]-x["y"],1)})
    pc=Counter(x["pitch"] for x in pitches)
    extra=[x for x in pitches if x["pitch"] not in (188.0,188.5,189.0)]
    valid_plain=[x for x in plain_gaps if 0<=x<=30]
    norm=[x["offset"]/x["height"] for x in marker_events]

    result={
      "scope":{"lp2_pages":LP2,"solved_controls":CONTROLS,"scan_offset":a.scan_offset,
               "repeated_source":"resources/lp2-transcription.txt","repeated_events":len(repeated),"repeated_pairs":len(groups)},
      "dot_bearing_gaps":{"events":len(marker_events),"gap_px":qstats([x["gap"] for x in marker_events]),
        "dot_width_px":qstats([x["w"] for x in marker_events]),
        "left_clearance_px":qstats([x["left"] for x in marker_events]),
        "right_clearance_px":qstats([x["right"] for x in marker_events]),
        "center_offset_px":qstats([x["offset"] for x in marker_events]),
        "center_offset_over_glyph_height":qstats(norm),
        "no_marker_gaps":qstats(valid_plain),"excluded_no_marker_gaps_over_30px":len(plain_gaps)-len(valid_plain),
        "solved_control_events":{str(p):sum(x["page"]==p for x in marker_events) for p in CONTROLS}},
      "repeated_exact_pairs":{"events":len(repeated),"pairs":pair_rows,
        "within_pair_offset_pooled_sd_px":round(float(np.sqrt(wso/dof)),3),
        "offset_variance_explained_by_pair":round(1-wso/((offsets-offsets.mean())**2).sum(),3),
        "within_pair_gap_pooled_sd_px":round(float(np.sqrt(wsg/dof)),3),
        "gap_variance_explained_by_pair":round(1-wsg/((gaps-gaps.mean())**2).sum(),3),
        "offset_residual_vs_line_x_fraction_spearman":{"rho":round(float(rho_x),3),"p":round(float(p_x),3)},
        "offset_residual_vs_line_span_spearman":{"rho":round(float(rho_span),3),"p":round(float(p_span),3)}},
      "baseline_grid":{"line_rows":len(row_positions),"intervals":len(pitches),
        "pitch_counts_px":dict(sorted(pc.items())),
        "standard_188_to_189px":sum(pc[x] for x in (188.0,188.5,189.0)),
        "extra_36px":sum(pc[x] for x in (224.0,224.5)),"extra_56px":pc[244.0],
        "extra_intervals":extra,"within_line_marker_y_sd_px":qstats([x["sd"] for x in row_positions]),
        "solved_p56_rows":[x for x in row_positions if x["page"]==56],
        "solved_p57_rows":[x for x in row_positions if x["page"]==57]}
    }
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=="__main__": main()
