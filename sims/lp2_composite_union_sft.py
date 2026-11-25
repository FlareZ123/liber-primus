"""Original-size GP29 composite audit; p56 templates, held-out p57 and LP1.
Requires OpenCV and NumPy. Default inputs are repository JPEGs and transcript.
python sims/lp2_composite_union_sft.py --images /path/to/75/jpeg/files
"""
import argparse
import json
from collections import Counter
from pathlib import Path

import cv2
import numpy as np

GP = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
LINES = [
    'ᚫᛄᛟᛋᚱᛗᚣᛚᚩᚻᚩᚫᚳᚦᚷᚹᚹᛚᚫᛉ',
    'ᚩᚪᛈᛗᛞᛞᚢᚷᚹᛚᛞᚾᚣᛄᚳᚠᛡᚫᛏ',
    'ᛈᛇᚪᚦᚳᚫ',
    'ᚳᛞᚠᚾᛡᛖᚠᚾᚳᛝᚱᚠᚫᛁᚱᛞᛖᛋᚣᛄᛠᚢ',
    'ᛝᚹᛉᚩᛗᛠᚹᚠᚱᚷᛡᛝᚱᛒᚫᚾᚢᛋ',
]
ROWS = [(669,786),(861,976),(1050,1165),(1889,2005),(2077,2193)]
K = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
H, W = 126, 184
LIMIT = .03


def canvas(mask):
    h,w = mask.shape
    out = np.zeros((H,W), np.uint8)
    out[4:4+h,4:4+w] = mask
    return out


def distance(a,b,ad,bd):
    return (np.count_nonzero(a & ~bd)+np.count_nonzero(b & ~ad))/(a.sum()+b.sum())


def feature(a):
    return cv2.resize(a.astype(np.float32),(46,32),interpolation=cv2.INTER_AREA).ravel()


def templates(load):
    im = load(56)
    out = {c:[] for c in GP}
    for i,(y0,y1) in enumerate(ROWS):
        mask = (im[y0:y1,220:2050]<160).astype(np.uint8)
        _,_,stats,_ = cv2.connectedComponentsWithStats(mask,8)
        boxes = sorted(tuple(map(int,b)) for b in stats[1:] if b[3]>80 and b[4]>200)
        seq = LINES[i]
        # Exclude the oversized initial and its portions on lower rows.
        if i in (0,1,2): boxes = boxes[1:]
        if i == 0: seq = seq[1:]
        assert len(boxes)==len(seq),(i,boxes,seq)
        for ch,(x,y,w,h,area) in zip(seq,boxes):
            if 7<=w<=110 and h<=122:
                out[ch].append((mask[y:y+h,x:x+w].copy(),(56,x+220,y+y0,w,h,area)))
    assert all(out.values()) and sum(map(len,out.values()))==84
    return out


def source_lines(path):
    pages = {}
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        if line.startswith('%') and line[1:].strip().isdigit():
            p = int(line[1:]); pages[p] = []
        elif pages:
            runes = ''.join(c for c in line if c in GP)
            if runes: pages[p].append(runes)
    return pages


def locate(context, lines):
    i,j = context.index('('),context.index(')')
    pair = context[i+1:j]
    seq = context.replace('(','').replace(')','')
    # Find the position solely from surrounding glyphs, excluding the pair.
    matches=[]
    for line_no,line in enumerate(lines):
        for start in range(len(line)-len(seq)+1):
            if all(seq[q]==line[start+q] for q in range(len(seq)) if q not in (i,i+1)):
                matches.append((line_no,start+i,line[start+i:start+i+2]))
    assert len(matches)==1 and matches[0][2]==pair,(context,matches)
    return matches[0]


def scan(load, transcript=None):
    t = templates(load)
    single, reps = [], {}
    for ch,ls in t.items():
        can = [canvas(m) for m,_ in ls]
        mid = min(range(len(can)),key=lambda i:sum(np.mean(can[i]!=b) for b in can))
        reps[ch] = ls[mid][0]
        single.extend((ch,box,canvas(m)) for m,box in ls)
    pairs=[]
    for c,m in reps.items():
        for d,n in reps.items():
            for gap in range(-6,3):
                for dy in (-2,-1,0,1,2):
                    dx = m.shape[1]+gap; y1=max(0,-dy); y2=max(0,dy)
                    if dx<=0: continue
                    h=max(y1+m.shape[0],y2+n.shape[0]); w=max(m.shape[1],dx+n.shape[1])
                    z=np.zeros((h,w),np.uint8)
                    z[y1:y1+m.shape[0],:m.shape[1]] |= m
                    z[y2:y2+n.shape[0],dx:dx+n.shape[1]] |= n
                    # Retain a contact, but allow detached native strokes (Y).
                    if cv2.connectedComponents(z,connectivity=8)[0] >= cv2.connectedComponents(m,connectivity=8)[0]+cv2.connectedComponents(n,connectivity=8)[0]-1:
                        continue
                    pairs.append((c+d,gap,dy,canvas(z)))
    print('pairs',len(pairs),'classes',len(set(q[0] for q in pairs)),flush=True)

    def build(records):
        mats=np.array([q[-1] for q in records])
        fs=np.array([feature(q[-1]) for q in records])
        ds=np.array([cv2.dilate(q[-1],K) for q in records])
        widths=np.array([np.where(q[-1].any(axis=0))[0][-1]-3 for q in records])
        return mats,fs,ds,widths

    sm,sf,sd,sw=build(single); pm,pf,pd,pw=build(pairs)

    def pair_candidates(a,ad,f,w):
        ix=np.flatnonzero(abs(pw-w)<=4)
        fd=np.sum((pf[ix]-f)**2,axis=1)
        ix=ix[np.argsort(fd)[:40]]
        return sorted((distance(a,pm[j],ad,pd[j]),float(np.sum((pf[j]-f)**2)),int(j)) for j in ix)

    # An attached extra stroke in a held-out authentic C+E crop is detectable.
    p57=load(57); a=canvas((p57[917:1031,1236:1343]<160).astype(np.uint8)); a[28:50,4:49]=1
    plant = pair_candidates(a,cv2.dilate(a,K),feature(a),107)[0][0]
    assert plant>LIMIT
    print('plant residual',plant,flush=True)
    rows=[]; counts=Counter(); glyphs=[]
    for page in range(-17,58):
        im=load(page); x0,y0=440,440
        mask=(im[y0:3250,x0:2100]<160).astype(np.uint8)
        _,_,stats,_=cv2.connectedComponentsWithStats(mask,8)
        for x,y,w,h,area in stats[1:]:
            if not (80<=h<=122 and 7<=w<=174 and area>160): continue
            counts['components']+=1
            x,y,w,h,area=map(int,(x,y,w,h,area)); box=[x+x0,y+y0,w,h,area]
            # Preserve all bbox ink, especially the detached native Y stroke.
            a=canvas(mask[y:y+h,x:x+w].copy()); ad=cv2.dilate(a,K); f=feature(a)
            ix=np.flatnonzero(abs(sw-w)<=3)
            scores=[distance(a,sm[j],ad,sd[j]) for j in ix]
            best=min(scores,default=1.0)
            if best<=LIMIT:
                counts['single']+=1
                j=min(zip(scores,np.sum((sf[ix]-f)**2,axis=1),ix))[2]
                glyphs.append(dict(page=page,box=box,label=single[j][0]))
                continue
            vals=pair_candidates(a,ad,f,w)
            if vals:
                residual,_,j=vals[0]; winner=pairs[j]
                alternatives=sorted({pairs[k][0] for v,_,k in vals if v<=LIMIT})
            else:
                residual=1.; winner=('',0,0,None); alternatives=[]
            label=winner[0] if residual<=LIMIT else None
            counts['pair' if label else 'other']+=1
            if label: glyphs.append(dict(page=page,box=box,label=label))
            rows.append(dict(page=page,box=box,single=float(best),pair=label,pair_fit=float(residual),gap=winner[1],dy=winner[2],alternatives=alternatives))
    pages=source_lines(transcript) if transcript else None
    for row in rows:
        if not row['pair']: continue
        x,y,w,h,_=row['box']
        line=sorted((g for g in glyphs if g['page']==row['page'] and abs(g['box'][1]-y)<=10),key=lambda g:g['box'][0])
        idx=next(i for i,g in enumerate(line) if g['box']==row['box'])
        row['context']=''.join(g['label'] for g in line[max(0,idx-8):idx])+'('+row['pair']+')'+''.join(g['label'] for g in line[idx+1:idx+9])
        row['line']=''.join(g['label'] for g in line)
        if pages is not None and row['page']>=0:
            row['source_position']=locate(row['context'],pages[row['page']])
    lp2=[r for r in rows if r['page']>=0 and r['pair']]
    lp1=[r for r in rows if r['page']<0 and r['pair']]
    assert counts==Counter(components=15782,single=15594,pair=96,other=92),counts
    assert len(lp2)==79 and len(lp1)==17 and all(r['gap']==0 for r in lp2)
    assert len([r for r in lp2 if r['page']==57 and r['pair']=='ᚳᛖ' and r['pair_fit']==0])==2
    assert next(r for r in lp2 if r['page']==33 and r['box'][:2]==[992,1914])['pair']=='ᚳᛟ'
    print(counts)
    print('LP2 pair classes',Counter(r['pair'] for r in lp2))
    print('max LP2 pair residual',max(r['pair_fit'] for r in lp2))
    print('LP1 candidate pairs (one Latin false positive on original 02.jpg)',len(lp1))
    if pages is not None: print('all 79 LP2 pairs uniquely located by surrounding source runes')
    return dict(counts=dict(counts),plant_residual=float(plant),rows=rows)


def main():
    root=Path(__file__).resolve().parents[1]
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--images',type=Path,default=root/'resources'/'liber-primus')
    parser.add_argument('--transcript',type=Path,default=root/'resources'/'external'/'Liber Primus 57.txt')
    parser.add_argument('--output',type=Path,default=Path('composite-results.json'))
    args=parser.parse_args(); cv2.setNumThreads(1)
    def load(page):
        im=cv2.imread(str(args.images/f'{page+17:02}.jpg'),0)
        assert im is not None and im.shape==(3600,2400),(page,args.images)
        return im
    result=scan(load,args.transcript if args.transcript.is_file() else None)
    args.output.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')


if __name__=='__main__': main()
