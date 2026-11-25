#!/usr/bin/env python3
"""Source-calibrated within-word gap residual test; no language scoring or per-page thresholds."""
from __future__ import annotations
import contextlib, io, json, math, runpy
from collections import Counter, defaultdict
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
TRAIN_PAGES=(32,55)
THRESHOLDS=(150,155,160)
STATE_EPSILON_PX=0.5
PAIR_MIN_COUNT=3
with contextlib.redirect_stdout(io.StringIO()):
    BASE=runpy.run_path(str(ROOT/"sims"/"lp2_original_rune_typography_sft.py"))
CORPUS=BASE["CORPUS"]; RAW=BASE["RAW"]
RUNE_INDEX={r:i for i,r in enumerate(CORPUS["runes"])}
DETECT=BASE["detect"]; PREDICT=BASE["predict"]; TYPES=BASE["types"]
SOURCE_IMAGE=BASE["source_image"]

def raw_page_index(page): return page if page<=49 else page-1

def parse_word_groups(line):
    groups=[]; current=[]
    for ch in line:
        value=RUNE_INDEX.get(ch)
        if value is not None: current.append(value)
        elif current: groups.append(current); current=[]
    if current: groups.append(current)
    return groups

def image_at_threshold(gray, threshold):
    if threshold==155: return gray
    out=gray.copy()
    if threshold<155: out[(out>=threshold)&(out<155)]=255
    else: out[(out>=155)&(out<threshold)]=0
    return out

def glyph_geometry(gray,rgb,row,box):
    y0=673+188*row; y_start=y0-10
    left,right=int(box[0]),int(box[1])
    patch=gray[y_start:y0+125,left:right+1]; mask=patch<155
    ys,xs=np.where(mask)
    if len(ys)==0: raise ValueError("empty glyph component")
    pixels=rgb[y_start:y0+125,left:right+1,:][mask]
    red=float(np.mean((pixels[:,0]>1.15*pixels[:,1])&(pixels[:,0]>1.15*pixels[:,2])))
    lum=float(np.mean(.2126*pixels[:,0]+.7152*pixels[:,1]+.0722*pixels[:,2]))
    return {"left":left,"right":right,"top":int(y_start+ys.min()),
            "bottom":int(y_start+ys.max()),"width":int(right-left+1),
            "height":int(ys.max()-ys.min()+1),"baseline":int(y_start+ys.max()),
            "red_fraction":red,"luminance":lum}

def extract_page(page,threshold=155):
    raw=RAW[raw_page_index(page)]; lines=raw.split("/")
    gray0=SOURCE_IMAGE(page); gray=image_at_threshold(gray0,threshold)
    image_path=ROOT/"resources"/"liber-primus"/f"{page+17}.jpg"
    rgb=np.asarray(Image.open(image_path).convert("RGB"))
    records=[]; words=[]; accuracies=[]; aligned=0; nonempty=0
    for row,line in enumerate(lines[:12]):
        groups=parse_word_groups(line); flat=[v for g in groups for v in g]
        if not flat: continue
        nonempty+=1; boxes=DETECT(gray,row)
        if len(boxes)!=len(flat): continue
        aligned+=1
        predicted,confidence=PREDICT(boxes,TYPES)
        accuracy=float(np.mean(np.asarray(predicted)==np.asarray(flat)))
        accuracies.append(accuracy)
        geoms=[glyph_geometry(gray,rgb,row,b) for b in boxes]
        scale=float(np.median([g["height"] for g in geoms]))
        if scale<=0: continue
        row_norm=row/max(1,min(11,len(lines)-1)); offset=0
        for word_index,group in enumerate(groups):
            word_key=".".join(str(x) for x in group); coords=[]
            for gap_index in range(max(0,len(group)-1)):
                li=offset+gap_index; ri=li+1
                gl,gr=geoms[li],geoms[ri]
                coord=(page,row,word_index,gap_index)
                records.append({
                    "coord":coord,"page":page,"row":row,"word_index":word_index,
                    "gap_index":gap_index,"word_key":word_key,
                    "left_rune":int(group[gap_index]),"right_rune":int(group[gap_index+1]),
                    "pair":(int(group[gap_index]),int(group[gap_index+1])),
                    "gap":float(gr["left"]-gl["right"]-1),
                    "left_width":gl["width"],"right_width":gr["width"],
                    "left_height":gl["height"],"right_height":gr["height"],
                    "baseline_delta":gr["baseline"]-gl["baseline"],
                    "row_norm":row_norm,
                    "x_norm":float((gl["left"]+gr["right"])/(2*gray.shape[1])),
                    "left_red_fraction":gl["red_fraction"],
                    "right_red_fraction":gr["red_fraction"],
                    "left_luminance":gl["luminance"],"right_luminance":gr["luminance"],
                    "local_scale":scale,"readback_accuracy":accuracy})
                coords.append(coord)
            words.append({"page":page,"row":row,"word_index":word_index,
                          "word_key":word_key,"runes":group,"coords":coords,
                          "gap_count":len(coords),"readback_accuracy":accuracy})
            offset+=len(group)
    meta={"page":page,"nonempty_rows":nonempty,"aligned_rows":aligned,
          "alignment_fraction":aligned/max(1,nonempty),
          "mean_readback_accuracy":float(np.mean(accuracies)) if accuracies else 0.0,
          "min_readback_accuracy":float(np.min(accuracies)) if accuracies else 0.0,
          "within_word_gaps":len(records)}
    return records,words,meta

NUMERIC_NAMES=("left_width/scale","right_width/scale","left_height/scale",
 "right_height/scale","baseline_delta/scale","row_position","x_position",
 "left_red_fraction","right_red_fraction","left_luminance","right_luminance",
 "local_scale/100")

def numeric_vector(r):
    s=max(float(r["local_scale"]),1.0)
    return np.asarray([r["left_width"]/s,r["right_width"]/s,
      r["left_height"]/s,r["right_height"]/s,r["baseline_delta"]/s,
      r["row_norm"],r["x_norm"],r["left_red_fraction"],r["right_red_fraction"],
      r["left_luminance"]/255.0,r["right_luminance"]/255.0,s/100.0],dtype=float)

def fit_gap_model(records):
    counts=Counter(r["pair"] for r in records)
    pair_vocab={p:i for i,p in enumerate(sorted(p for p,n in counts.items() if n>=PAIR_MIN_COUNT))}
    pair_offset=59; numeric_offset=pair_offset+len(pair_vocab)
    nums=np.vstack([numeric_vector(r) for r in records])
    mean=nums.mean(axis=0); std=nums.std(axis=0); std[std<1e-8]=1.0
    def design(rs):
        x=np.zeros((len(rs),numeric_offset+len(NUMERIC_NAMES)),dtype=float)
        x[:,0]=1.0
        x[:,numeric_offset:]=(np.vstack([numeric_vector(r) for r in rs])-mean)/std
        for i,r in enumerate(rs):
            x[i,1+r["left_rune"]]=1.0
            x[i,30+r["right_rune"]]=1.0
            pi=pair_vocab.get(r["pair"])
            if pi is not None: x[i,pair_offset+pi]=1.0
        return x
    x=design(records); y=np.asarray([r["gap"] for r in records],dtype=float)
    penalty=np.zeros(x.shape[1]); penalty[1:59]=5.0
    penalty[pair_offset:numeric_offset]=25.0; penalty[numeric_offset:]=10.0
    regularizer=np.diag(penalty)
    beta=np.linalg.solve(x.T@x+regularizer,x.T@y)
    for _ in range(5):
        residual=y-x@beta; center=float(np.median(residual))
        scale=1.4826*float(np.median(np.abs(residual-center)))+1e-6
        weights=np.minimum(1.0,1.345*scale/np.maximum(np.abs(residual-center),1e-6))
        xtw=x.T*weights
        beta=np.linalg.solve(xtw@x+regularizer,xtw@y)
    return {"beta":beta,"pair_vocab":pair_vocab,"mean":mean,"std":std,
            "pair_offset":pair_offset,"numeric_offset":numeric_offset}

def predict_records(records,model):
    if not records: return []
    beta=model["beta"]; pv=model["pair_vocab"]; no=model["numeric_offset"]
    x=np.zeros((len(records),len(beta))); x[:,0]=1.0
    x[:,no:]=(np.vstack([numeric_vector(r) for r in records])-model["mean"])/model["std"]
    for i,r in enumerate(records):
        x[i,1+r["left_rune"]]=1.0; x[i,30+r["right_rune"]]=1.0
        pi=pv.get(r["pair"])
        if pi is not None: x[i,model["pair_offset"]+pi]=1.0
    out=[]
    for r,pred in zip(records,x@beta):
        residual=float(r["gap"]-pred)
        state=-1 if residual < -STATE_EPSILON_PX else (1 if residual>STATE_EPSILON_PX else 0)
        q=dict(r); q["predicted_gap"]=float(pred); q["residual"]=residual; q["state"]=int(state)
        out.append(q)
    return out

def state_summary(records):
    if not records: return {"n":0,"mae":None,"state_counts":{},"entropy_bits":None}
    residual=np.asarray([r["residual"] for r in records])
    counts=Counter(int(r["state"]) for r in records); n=len(records)
    entropy=-sum((v/n)*math.log2(v/n) for v in counts.values())
    return {"n":n,"mae":float(np.mean(np.abs(residual))),
            "median_abs_residual":float(np.median(np.abs(residual))),
            "state_counts":{str(k):int(v) for k,v in sorted(counts.items())},
            "entropy_bits":float(entropy)}

def repeated_word_agreement(words, records, permutations=500):
    state_by_coord = {r["coord"]: int(r["state"]) for r in records}
    groups = defaultdict(list)
    for word in words:
        if word["gap_count"] < 2:
            continue
        states = [state_by_coord.get(coord) for coord in word["coords"]]
        if any(value is None for value in states):
            continue
        groups[word["word_key"]].append(word["coords"])

    repeated = {key: occ for key, occ in groups.items() if len(occ) >= 2}
    if not repeated:
        return {"repeated_word_types": 0, "pairwise_position_comparisons": 0,
                "observed_agreement": None, "null_mean": None,
                "null_95pct": None, "permutation_p": None, "top": []}

    def agreement(state_map):
        numerator = 0
        denominator = 0
        per_word = []
        for key, occurrences in repeated.items():
            width = min(len(coords) for coords in occurrences)
            word_num = 0
            word_den = 0
            for pos in range(width):
                vals = [state_map.get(coords[pos]) for coords in occurrences]
                if any(value is None for value in vals):
                    continue
                n = len(vals)
                pairs = n * (n - 1) // 2
                if not pairs:
                    continue
                counts = Counter(vals)
                matches = sum(v * (v - 1) // 2 for v in counts.values())
                numerator += matches
                denominator += pairs
                word_num += matches
                word_den += pairs
            if word_den:
                per_word.append({"word_runes": key, "occurrences": len(occurrences),
                                 "gap_length": width, "agreement": word_num / word_den})
        return (numerator / denominator if denominator else None,
                denominator, per_word)

    observed, comparisons, per_word = agreement(state_by_coord)
    pair_records = defaultdict(list)
    for record in records:
        pair_records[record["pair"]].append(record)
    rng = np.random.default_rng(20261125)
    null_values = []
    for _ in range(permutations):
        shuffled_map = {}
        for pair, pair_rows in pair_records.items():
            shuffled_states = rng.permutation([int(row["state"]) for row in pair_rows])
            for row, state in zip(pair_rows, shuffled_states):
                shuffled_map[row["coord"]] = int(state)
        value, _, _ = agreement(shuffled_map)
        if value is not None:
            null_values.append(value)
    null_array = np.asarray(null_values, dtype=float)
    p_value = ((1 + int(np.sum(null_array >= observed))) /
               (1 + len(null_array))) if len(null_array) else None
    per_word.sort(key=lambda item: (item["agreement"], item["occurrences"]), reverse=True)
    return {
        "repeated_word_types": len(repeated),
        "pairwise_position_comparisons": int(comparisons),
        "observed_agreement": float(observed) if observed is not None else None,
        "null_mean": float(np.mean(null_array)) if len(null_array) else None,
        "null_95pct": float(np.quantile(null_array, 0.95)) if len(null_array) else None,
        "permutation_p": float(p_value) if p_value is not None else None,
        "permutations": len(null_array),
        "top": per_word[:12],
    }

def threshold_state_map(page,threshold,model):
    records,_,meta=extract_page(page,threshold)
    if meta["alignment_fraction"]<0.8: return {}
    return {r["coord"]:r["state"] for r in predict_records(records,model)}

def main():
    pages=list(range(56)); page_records={}; page_words={}; page_meta={}
    for page in pages:
        records,words,meta=extract_page(page,155)
        page_records[page]=records; page_words[page]=words; page_meta[page]=meta
    train_records=[r for p in TRAIN_PAGES for r in page_records[p]]
    if len(train_records)<80: raise RuntimeError(f"Insufficient within-word training gaps: {len(train_records)}")
    model=fit_gap_model(train_records)
    control_pages=[]; unknown_pages=[]
    for p in pages:
        if p in TRAIN_PAGES or not page_records[p]: continue
        m=page_meta[p]
        if m["alignment_fraction"]>=0.9 and m["mean_readback_accuracy"]>=0.98 and m["min_readback_accuracy"]>=0.95:
            control_pages.append(p)
        else: unknown_pages.append(p)
    all_records=[r for p in pages for r in page_records[p]]
    scored=predict_records(all_records,model); by_page=defaultdict(list)
    for r in scored: by_page[r["page"]].append(r)
    train_scored=[r for p in TRAIN_PAGES for r in by_page[p]]
    control_scored=[r for p in control_pages for r in by_page[p]]
    unknown_scored=[r for p in unknown_pages for r in by_page[p]]
    control_words=[w for p in control_pages for w in page_words[p]]
    unknown_words=[w for p in unknown_pages for w in page_words[p]]

    # Keep the model and trit classifier fixed; vary only the image threshold.
    stable_pages=sorted(set(TRAIN_PAGES)|set(control_pages))
    maps={t:{} for t in THRESHOLDS}
    for t in THRESHOLDS:
        for p in stable_pages: maps[t].update(threshold_state_map(p,t,model))
    common=set.intersection(*(set(maps[t]) for t in THRESHOLDS)) if maps else set()
    stable=sum(1 for c in common if len({maps[t][c] for t in THRESHOLDS})==1)
    stability={"thresholds":list(THRESHOLDS),"common_source_coordinates":len(common),
               "same_trit_at_all_thresholds":stable,
               "stability_fraction":stable/len(common) if common else None}

    result={
      "classification":"within-word residual-channel test; no language scoring",
      "source_readout":"page order -> line order -> word order -> left-to-right within-word gaps",
      "residual_alphabet":{"states":[-1,0,1],
        "rule":"residual < -0.5px => -1; abs(residual) <= 0.5px => 0; residual > 0.5px => +1",
        "frozen_before_unknown_scoring":True},
      "model":{"training_pages":list(TRAIN_PAGES),"training_within_word_gaps":len(train_records),
        "ordered_pair_terms":len(model["pair_vocab"]),"numeric_terms":list(NUMERIC_NAMES),
        "ridge_and_huber":True},
      "coverage":{"pages_processed":len(pages),
        "pages_with_within_word_gaps":sum(bool(page_records[p]) for p in pages),
        "aligned_within_word_gaps":len(all_records),"heldout_control_pages":control_pages,
        "unknown_pages":unknown_pages,"page_meta":list(page_meta.values())},
      "residuals":{"training":state_summary(train_scored),
        "heldout_controls":state_summary(control_scored),"unknown":state_summary(unknown_scored)},
      "repeatability":{"heldout_controls":repeated_word_agreement(control_words,control_scored),
        "unknown":repeated_word_agreement(unknown_words,unknown_scored)},
      "threshold_stability":stability,
      "interpretation":("The signed residual trit is only a candidate side-channel readout. "
        "No mapping to GP29 symbols is imposed. A stable source-coordinate sequence and "
        "a first-party selection rule are still required before treating it as key material.")
    }
    output=ROOT/"im-results"/"lp2-withinword-gap-residual-sequence-sft.json"
    output.write_text(json.dumps(result,indent=2),encoding="utf-8")
    print(json.dumps({"output":str(output.relative_to(ROOT)),
      "classification":result["classification"],"model":result["model"],
      "coverage":{"pages_processed":result["coverage"]["pages_processed"],
        "pages_with_within_word_gaps":result["coverage"]["pages_with_within_word_gaps"],
        "aligned_within_word_gaps":result["coverage"]["aligned_within_word_gaps"],
        "heldout_control_pages":control_pages,"unknown_page_count":len(unknown_pages)},
      "residuals":result["residuals"],"repeatability":result["repeatability"],
      "threshold_stability":stability,"interpretation":result["interpretation"]},indent=2))

if __name__=="__main__":
    main()
