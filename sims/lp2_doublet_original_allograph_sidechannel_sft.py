"""Original LP2 doublet-versus-glyph-morphology physical carrier test.

Source premise: rare adjacent equal GP runes might be permitted by a
visually distinct glyph escapement, enabling an otherwise 28-choice codec.
Compare 86 original doublets against all non-doublet runes, measuring
binary glyph displacements from independently solved-page templates.
"""
from __future__ import annotations

import json
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path
from math import exp, lgamma

import cv2
import numpy as np

import lp2_allglyph_original_allograph_sft as base

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / 'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))


def load(page: int) -> np.ndarray:
    filename = ROOT / 'resources/liber-primus' / f'{page+17:02d}.jpg'
    return cv2.imread(str(filename), cv2.IMREAD_GRAYSCALE)


def hypergeometric_upper(n: int, k: int, draws: int, observed: int) -> float:
    """One-sided fixed-marginal carrier enrichment; not a cipher p-value."""
    def comb_log(a: int, b: int) -> float:
        return lgamma(a+1) - lgamma(b+1) - lgamma(a-b+1)
    logs = [comb_log(k, j)+comb_log(n-k, draws-j)-comb_log(n,draws)
            for j in range(observed, min(k,draws)+1)
            if j <= k and draws-j <= n-k]
    if not logs:
        return 0.
    peak = max(logs)
    return exp(peak) * sum(exp(v-peak) for v in logs)


def main() -> None:
    templates = base.baseline(load)
    ref = np.stack([t['feature'] for t in templates], axis=1)
    paired: list[dict] = []
    total_original_doublets = 0
    paired_doublets = 0
    missing_doublets = []
    for page in range(56):
        source = CORPUS['pages'][page]['indices']
        if not source:
            continue
        total_original_doublets += sum(source[i] == source[i-1]
                                       for i in range(1,len(source)))
        im = load(page)
        boxes = [b for b in base.components(im, (440,440,2100,3250))
                 if 80 <= b[3] <= 122 and 7 <= b[2] <= 110 and b[4]>160]
        boxes.sort(key=lambda b: (round(b[1]/188),b[0]))
        runes=[]
        for x,y,w,h,area in boxes:
            mask=(im[y:y+h,x:x+w]<160).astype(np.uint8)
            full,feature=base.vector(mask)
            cls=templates[int((feature@ref).argmax())]['cls']
            runes.append((cls,x,y,full,cv2.dilate(full,base.KERNEL)))
        predicted=[q[0] for q in runes]
        sm=SequenceMatcher(None,source,predicted,autojunk=False)
        mapping={}
        for tag,i1,i2,j1,j2 in sm.get_opcodes():
            if tag == 'equal' or (tag=='replace' and i2-i1 == j2-j1):
                for d in range(i2-i1):
                    mapping[i1+d]=j1+d
        for i, j in mapping.items():
            _,x,y,mask,dil=runes[j]
            matching=[t for t in templates if t['cls']==source[i]]
            distance=min(base.distance(mask,dil,t['img'],t['dil']) for t in matching)
            in_doublet=(i>0 and source[i]==source[i-1]) or (i+1<len(source) and source[i]==source[i+1])
            paired.append(dict(page=page,position=i,
                rune=source[i], doublet=in_doublet,
                exception=distance>.03,distance=distance))
        for i in range(1,len(source)):
            if source[i]==source[i-1]:
                if i in mapping and (i-1) in mapping:
                    paired_doublets+=1
                else:
                    missing_doublets.append([page,i])
    doublet=[r for r in paired if r['doublet']]
    normal=[r for r in paired if not r['doublet']]
    n=len(paired)
    abnormal=sum(r['exception'] for r in paired)
    observed=sum(r['exception'] for r in doublet)
    p=hypergeometric_upper(n,abnormal,len(doublet),observed)
    byclass={}
    for cl in range(29):
        d=[r for r in paired if r['rune']==cl and r['doublet']]
        n0=[r for r in paired if r['rune']==cl and not r['doublet']]
        if d:
            byclass[CORPUS['translit'][cl]]={
                'doubletPositions':len(d), 'doubletMorphologyExceptions':sum(r['exception'] for r in d),
                'normalPositions':len(n0), 'normalMorphologyExceptions':sum(r['exception'] for r in n0)}
    result={
        'source':'original LP2 2014 physical JPEGs and exact indexed GP29 transcription',
        'originalDoubletEvents':total_original_doublets,
        'doubletEventsWithBothGlyphsMapped':paired_doublets,
        'unmappedDoubletEvents':missing_doublets,
        'mappedGlyphPositions':n,
        'doubletGlyphPositions':len(doublet),
        'normalGlyphPositions':len(normal),
        'doubletMorphologyExceptions':observed,
        'normalMorphologyExceptions':sum(r['exception'] for r in normal),
        'doubletMeanDistance':sum(r['distance'] for r in doublet)/len(doublet),
        'normalMeanDistance':sum(r['distance'] for r in normal)/len(normal),
        'fixedMarginalEnrichmentP':p,
        'byClass':byclass,
        'highestDistanceDoublets':sorted(doublet,key=lambda r:-r['distance'])[:20]}
    assert total_original_doublets==86
    assert 12500 <= len(paired) <= 13100
    assert len(templates)==163
    print(json.dumps(result,indent=2))


if __name__=='__main__':
    main()
