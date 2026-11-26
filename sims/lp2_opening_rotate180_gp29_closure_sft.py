#!/usr/bin/env python3
"""Literal opening-cross 180-degree GP29 alphabet closure test.
Uses the pinned p2/p57 segmentation from the preceding horizontal-reflection SFT.
Requires numpy, scipy, networkx, Pillow. Run from repository root.
"""
from collections import Counter
import json
import numpy as np
from scipy.optimize import linear_sum_assignment
import networkx as nx
from lp2_p2_literal_glyph_reflection_sft import (
    REFS, RUNES, source_lines, glyph_rows, ink_iou,
)

def score(samples, training, rotate=False):
    s=np.zeros((len(samples),29))
    for i,g in enumerate(samples):
        a=g["crop"][::-1,::-1] if rotate else g["crop"]
        for t in training:
            if t is g and not rotate:
                continue
            j=RUNES.index(t["label"])
            s[i,j]=max(s[i,j],ink_iou(a,t["crop"]))
    return s

def summarize(s, samples):
    y=np.array([RUNES.index(g["label"]) for g in samples])
    return dict(n=len(y), nearest_correct=int((s.argmax(1)==y).sum()),
                median_best=float(np.median(s.max(1))),
                min_best=float(s.max(1).min()),
                best_ge_090=int((s.max(1)>=.90).sum()))

def main():
    p2text, lines_p2, lines_p57=source_lines()
    g=glyph_rows(REFS/"19.jpg",lines_p2,[700,888,1077,1269,1453,1638,1830,2016,2205],595,True)
    tr=[x for x in g if 1<=x["row"]<=7]
    ho=[x for x in g if x["row"] in (0,8)]
    solved=glyph_rows(REFS/"74.jpg",lines_p57[:4],[944,1132,1378,1569],850)[7:]
    assert (len(g),len(tr),len(ho),len(solved))==(201,161,40,65)
    assert len(set(x["label"] for x in tr))==29
    ordinary=score(tr,tr); held=score(ho,tr); control=score(solved,tr)
    rotated=score(tr,tr,True); rot_held=score(ho,tr,True)
    y=np.array([RUNES.index(x["label"]) for x in tr])
    yh=np.array([RUNES.index(x["label"]) for x in ho])
    class_scores=np.array([rotated[y==i].mean(0) for i in range(29)])
    # Optimistic unrestricted bijection bound.
    rr,cc=linear_sum_assignment(-class_scores)
    mapping=dict(zip(rr.tolist(),cc.tolist()))
    # Every involution consists exclusively of fixed points and disjoint pairs.
    # Optimize pair gains over the all-fixed-point baseline.
    G=nx.Graph();G.add_nodes_from(range(29))
    for i in range(29):
        for j in range(i+1,29):
            gain=class_scores[i,j]+class_scores[j,i]-class_scores[i,i]-class_scores[j,j]
            if gain>0:
                G.add_edge(i,j,weight=float(gain))
    invol=list(range(29))
    for i,j in nx.max_weight_matching(G):
        invol[i]=j;invol[j]=i
    assert all(invol[invol[i]]==i for i in range(29))
    best=np.vstack([rotated,rot_held]); nearest=rotated.argmax(1)
    modal={i:Counter(nearest[y==i]).most_common(1)[0][0] for i in range(29)}
    def map_stats(m):
        fit=np.array([m[i] for i in y]); test=np.array([m[i] for i in yh])
        return dict(mapping={RUNES[i]:RUNES[m[i]] for i in range(29)},
                    distinct=len(set(m.values()) if isinstance(m,dict) else set(m)),
                    fit_mean_iou=float(rotated[np.arange(len(y)),fit].mean()),
                    held_mean_iou=float(rot_held[np.arange(len(yh)),test].mean()),
                    held_ge_090=int((rot_held[np.arange(len(yh)),test]>=.90).sum()),
                    equal_class_mean_iou=float(np.mean([class_scores[i,m[i]] for i in range(29)])))
    result=dict(ordinary_loo=summarize(ordinary,tr),ordinary_holdout=summarize(held,ho),
                ordinary_solved_p57=summarize(control,solved),
                rotation_best_median=float(np.median(best.max(1))),
                rotation_best_ge_090=int((best.max(1)>=.90).sum()),
                rotation_class_best_mean={RUNES[i]:float(class_scores[i].max()) for i in range(29)},
                modal=map_stats(modal),optimal_bijection=map_stats(mapping),
                optimal_involution=map_stats(invol),
                involution_source_output="".join(RUNES[invol[RUNES.index(c)]] if c in RUNES else c for c in p2text),
                rotation_exact_pixel_replay=all(np.array_equal(x["crop"],x["crop"][::-1,::-1][::-1,::-1]) for x in g))
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
