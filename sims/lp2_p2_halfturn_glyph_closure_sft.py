#!/usr/bin/env python3
"""Test GP29 closure under the literal 180-degree p2 marginal-art transform."""
import json
import numpy as np
from scipy.optimize import linear_sum_assignment
from lp2_p2_literal_glyph_reflection_sft import (
    REFS, RUNES, source_lines, glyph_rows, ink_iou,
)

CENTERS = [700, 888, 1077, 1269, 1453, 1638, 1830, 2016, 2205]

def score(g, train, rotate):
    a = g["crop"][::-1, ::-1] if rotate else g["crop"]
    s = np.zeros(29)
    for t in train:
        i = RUNES.index(t["label"])
        s[i] = max(s[i], ink_iou(a, t["crop"]))
    return s

def main():
    text, p2, p57 = source_lines()
    glyphs = glyph_rows(REFS / "19.jpg", p2, CENTERS, 595, True)
    train = [g for g in glyphs if 1 <= g["row"] <= 7]
    held = [g for g in glyphs if g["row"] in (0, 8)]
    solved = glyph_rows(REFS / "74.jpg", p57[:4], [944,1132,1378,1569], 850)[7:]
    assert (len(glyphs), len(train), len(held), len(solved)) == (201,161,40,65)
    result = {}
    for rotate in (False, True):
        groups = [(name, np.array([score(g, train, rotate) for g in gs]),
                   np.array([RUNES.index(g["label"]) for g in gs]))
                  for name, gs in (("train",train),("held",held),("solved",solved))]
        _, tr, y = groups[0]
        mat = np.array([tr[y == i].mean(axis=0) for i in range(29)])
        _, m = linear_sum_assignment(-mat)
        out = {}
        for name, s, labels in groups:
            v = s[np.arange(len(s)),m[labels]]
            best = s.max(axis=1)
            out[name] = dict(n=len(s),
                nearest_agrees=int((s.argmax(axis=1)==m[labels]).sum()),
                assigned_median=float(np.median(v)),
                assigned_ge90=int((v>=.9).sum()),
                nearest_median=float(np.median(best)),
                nearest_ge90=int((best>=.9).sum()))
        vals = np.unique(mat)
        lo, hi = 0, len(vals)-1
        while lo < hi:
            mid = (lo+hi+1)//2
            i,j = linear_sum_assignment(-(mat>=vals[mid]).astype(int))
            if np.all(mat[i,j]>=vals[mid]): lo=mid
            else: hi=mid-1
        i,j = linear_sum_assignment(-(mat>=.9).astype(int))
        mapping = "".join(RUNES[k] for k in m)
        out.update(mapping=mapping, involution=bool(np.all(m[m]==np.arange(29))),
            classwise_nearest_distinct=len(set(mat.argmax(axis=1))),
            classwise_assigned_iou=mat[np.arange(29),m].tolist(),
            best_bottleneck=float(vals[lo]),
            max_90_class_matches=int((mat[i,j]>=.9).sum()),
            output=text.translate(str.maketrans(RUNES,mapping)))
        result[str(rotate)]=out
    result["page_rotation_centers"]=[3599-y for y in CENTERS[::-1]]
    result["page_rotation_nearest_center_distances"]=[
        min(abs(x-y) for y in CENTERS) for x in result["page_rotation_centers"]]
    assert result["False"]["mapping"]==RUNES
    assert result["False"]["held"]["nearest_agrees"]==40
    assert result["False"]["solved"]["nearest_agrees"]==65
    assert result["True"]["max_90_class_matches"]==3
    assert abs(result["True"]["best_bottleneck"]-.26987576353298814)<1e-6
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
