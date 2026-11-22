"""Source-native GP29 glyph allograph gate over 58 original LP2 JPEGs.

Requires numpy, Pillow, opencv-python. Run from any OS; optionally provide --archive
pointing to the maintainer's 75-image original ZIP. No OCR or tuned cipher keys.
"""
from __future__ import annotations

import argparse
import io
import json
from difflib import SequenceMatcher
from collections import Counter
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GP = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
LINES = {
    56: [
        'ᚫᛄ-ᛟᛋᚱ.ᛗᚣᛚᚩᚻ-ᚩᚫ-ᚳᚦᚷᚹ-ᚹᛚᚫ.ᛉ',
        'ᚩᚪᛈ-ᛗᛞᛞᚢᚷᚹ-ᛚ-ᛞᚾᚣᛄ-ᚳᚠᛡ-ᚫᛏ',
        'ᛈᛇᚪᚦ-ᚳᚫ.',
        'ᚳᛞ-ᚠᚾ-ᛡᛖ-ᚠᚾᚳᛝ-ᚱᚠ-ᚫᛁᚱᛞᛖ-ᛋᚣᛄᛠᚢ',
        'ᛝᚹ-ᛉᚩ-ᛗᛠᚹᚠ-ᚱᚷᛡ-ᛝᚱᛒ-ᚫᚾᚢᛋ.',
    ],
    57: [
        'ᛈᚪᚱᚪᛒᛚᛖ.ᛚᛁᚳᛖ-ᚦᛖ-ᛁᚾᛋᛏᚪᚱ-ᛏ',
        'ᚢᚾᚾᛖᛚᛝ-ᛏᚩ-ᚦᛖ-ᛋᚢᚱᚠᚪᚳᛖ.',
        'ᚹᛖ-ᛗᚢᛋᛏ-ᛋᚻᛖᛞ-ᚩᚢᚱ-ᚩᚹᚾ-ᚳ',
        'ᛁᚱᚳᚢᛗᚠᛖᚱᛖᚾᚳᛖᛋ.ᚠᛁᚾᛞ-ᚦ',
        'ᛖ-ᛞᛁᚢᛁᚾᛁᛏᚣ-ᚹᛁᚦᛁᚾ-ᚪᚾᛞ-ᛖᛗᛖᚱᚷᛖ.',
    ],
}
ROWS = {56: [(669,786),(861,976),(1050,1165),(1889,2005),(2077,2193)],
        57: [(917,1032),(1105,1222),(1349,1465),(1537,1652),(1725,1840)]}
KERNEL = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))


def components(image, bounds):
    x1, y1, x2, y2 = bounds
    mask = (image[y1:y2, x1:x2] < 160).astype(np.uint8)
    _, _, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    return sorted((int(x+x1),int(y+y1),int(w),int(h),int(a))
                  for x,y,w,h,a in stats[1:] if h>80 and a>200)


def vector(mask):
    h, w = mask.shape
    full = np.zeros((128,120), np.uint8)
    full[4:4+h,4:4+w] = mask
    feature = cv2.resize(full, (60,64), interpolation=cv2.INTER_AREA).ravel().astype(np.float32)
    return full, feature / max(np.linalg.norm(feature), 1.0)


def baseline(load):
    templates = []
    for page in (56,57):
        im = load(page)
        for lineno, (y1,y2) in enumerate(ROWS[page]):
            boxes = components(im, (220,y1,2050,y2))
            seq = [ch for ch in LINES[page][lineno] if ch in GP]
            if page == 56:
                if lineno == 0:
                    boxes, seq = boxes[1:], seq[1:]  # giant red initial
                elif lineno in (1,2):
                    boxes = boxes[1:]  # previous line's oversized red initial
            else:
                if lineno == 0:
                    boxes, seq = boxes[1:7], seq[1:7]  # ordinary red title glyphs
                elif lineno == 1:
                    boxes = [b for b in boxes if b[0]>=890][:-1]  # merged terminal pair
                    seq = seq[:-2]
                elif lineno == 2:
                    boxes = [b for b in boxes if b[0]>=890]  # giant initial descender
            assert len(boxes) == len(seq), (page, lineno, len(boxes), len(seq))
            for ch,(x,y,w,h,a) in zip(seq,boxes):
                if w>110 or w<7 or h>122: continue  # merged ordinary glyphs
                cut = (im[y:y+h,x:x+w] < 160).astype(np.uint8)
                full, feature = vector(cut)
                templates.append(dict(cls=GP.index(ch),page=page,x=x,y=y,
                                      img=full,dil=cv2.dilate(full,KERNEL),feature=feature))
    assert len(templates)==163 and len({t['cls'] for t in templates})==29
    return templates


def distance(a, adil, b, bdil):
    return (int(np.logical_and(a, np.logical_not(bdil)).sum()) +
            int(np.logical_and(b, np.logical_not(adil)).sum())) / (int(a.sum())+int(b.sum()))


def audit(load, originals=None):
    templates = baseline(load)
    positive = {}
    for cls in range(29):
        model = next(t for t in templates if t['cls']==cls)
        altered = model['img'].copy()
        altered[25:47,15:73] = 1
        adil = cv2.dilate(altered,KERNEL)
        positive[cls] = min(distance(altered,adil,t['img'],t['dil'])
                            for t in templates if t['cls']==cls)
    assert min(positive.values()) > .03
    reference = np.stack([p['feature'] for p in templates],axis=1)
    all_rows = []
    page_counts = []
    source_audit = []
    suspicious_source = []
    for page in range(58):
        im = load(page)
        boxes = [b for b in components(im,(440,440,2100,3250))
                 if 80<=b[3]<=122 and 7<=b[2]<=110 and b[4]>160]
        candidates = []
        for x,y,w,h,a in boxes:
            mask = (im[y:y+h,x:x+w]<160).astype(np.uint8)
            full,feature = vector(mask)
            candidates.append((x,y,w,h,full,feature))
        if not candidates:
            page_counts.append((page,0))
            continue
        observed = np.stack([v[5] for v in candidates])
        scores = observed @ reference
        page_rows = []
        for i,(x,y,w,h,full,feature) in enumerate(candidates):
            t = templates[int(scores[i].argmax())]
            cls=t['cls']
            dil=cv2.dilate(full,KERNEL)
            matching=[q for q in templates if q['cls']==cls]
            d = min(distance(full,dil,q['img'],q['dil']) for q in matching)
            page_rows.append(dict(page=page,cls=cls,x=x,y=y,w=w,h=h,
                                  cosine=round(float(scores[i].max()),5),distance=round(d,5),
                                  _full=full,_dil=dil))
        if originals is not None and page < len(originals) and originals[page] is not None:
            source = originals[page]
            ordered = sorted(page_rows,key=lambda r:(round(r['y']/188),r['x']))
            known = ''.join(chr(65+u) for u in source)
            predicted = ''.join(chr(65+r['cls']) for r in ordered)
            matcher = SequenceMatcher(None,known,predicted,autojunk=False)
            aligned=[]
            substitutions=[]
            exact=0
            for tag,i1,i2,j1,j2 in matcher.get_opcodes():
                if tag=='equal':
                    exact += i2-i1
                    aligned += [(i1+k,j1+k) for k in range(i2-i1)]
                elif tag=='replace' and i2-i1==j2-j1:
                    substitutions += [(i1+k,j1+k) for k in range(i2-i1)]
            for ii,jj in substitutions:
                r=ordered[jj]
                expected=source[ii]
                same=[q for q in templates if q['cls']==expected]
                source_distance=min(distance(r['_full'],r['_dil'],q['img'],q['dil']) for q in same)
                suspicious_source.append(dict(page=page,source_position=ii,predicted_position=jj,
                                              expected=expected,classified=r['cls'],
                                              x=r['x'],y=r['y'],distance=round(source_distance,5)))
            source_audit.append(dict(page=page,source_runes=len(source),components=len(ordered),
                                     exact_matches=exact,substitutions=len(substitutions),
                                     source_unaligned=len(source)-len(aligned)-len(substitutions)))
        for r in page_rows:
            del r['_full'],r['_dil']
        all_rows.extend(page_rows)
        page_counts.append((page,len(candidates)))
    by=Counter(x['cls'] for x in all_rows)
    anomalies=[r for r in all_rows if r['distance']>.03]
    source_leave=[]
    for t in templates:
        same=[q for q in templates if q is not t and q['cls']==t['cls']]
        if same:
            source_leave.append(min(distance(t['img'],t['dil'],q['img'],q['dil']) for q in same))
    return dict(templates=len(templates),classes=len(by),candidate_components=len(all_rows),
                morphology_matches=len(all_rows)-len(anomalies),morphology_outliers=len(anomalies),
                source_control_max_distance=max(source_leave),
                source_planted_min_distance=min(positive.values()),
                source_alignment=source_audit,
                source_substitutions=suspicious_source,
                per_class=[by[i] for i in range(29)],
                per_page=page_counts,exceptions=sorted(anomalies,key=lambda q:-q['distance']))


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--archive',type=Path)
    ap.add_argument('--corpus',type=Path,default=ROOT/'resources'/'liber-primus'/'lp2-corpus.json')
    args=ap.parse_args()
    z=ZipFile(args.archive) if args.archive else None
    def load(page):
        name=f'{page+17:02}.jpg'
        if z:
            data=z.read(f'liber-primus-jpegs/{name}')
            return cv2.imdecode(np.frombuffer(data,np.uint8),cv2.IMREAD_GRAYSCALE)
        return np.asarray(Image.open(ROOT/'resources'/'liber-primus'/name).convert('L'))
    corpus=json.loads(args.corpus.read_text(encoding='utf-8')) if args.corpus.is_file() else None
    originals=[p['indices'] for p in corpus['pages']] if corpus else None
    result=audit(load,originals)
    assert result['templates']==163 and result['classes']==29
    assert result['candidate_components']==13083 and result['morphology_matches']==12963
    print(json.dumps(result,indent=2,ensure_ascii=False))
    if z:z.close()

if __name__=='__main__':main()
