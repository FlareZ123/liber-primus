"""Native image layout order test, Director #2452.
Python 3 + Pillow + numpy + scipy. Run from repository root:
python sims/lp2_layout_order_sft.py resources/liber-primus
Original archive image numbers 06,11,73,74; no OCR or language scoring.
"""
import sys
from pathlib import Path
from collections import defaultdict
from statistics import median
from PIL import Image
import numpy as np
from scipy.ndimage import label

A='ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
N=dict(zip(A,'F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()))
P57=['ᛈᚪᚱᚪᛒᛚᛖ.ᛚᛁᚳᛖ-ᚦᛖ-ᛁᚾᛋᛏᚪᚱ-ᛏ','ᚢᚾᚾᛖᛚᛝ-ᛏᚩ-ᚦᛖ-ᛋᚢᚱᚠᚪᚳᛖ.','ᚹᛖ-ᛗᚢᛋᛏ-ᛋᚻᛖᛞ-ᚩᚢᚱ-ᚩᚹᚾ-ᚳ','ᛁᚱᚳᚢᛗᚠᛖᚱᛖᚾᚳᛖᛋ.ᚠᛁᚾᛞ-ᚦ','ᛖ-ᛞᛁᚢᛁᚾᛁᛏᚣ-ᚹᛁᚦᛁᚾ-ᚪᚾᛞ-ᛖᛗᛖᚱᚷᛖ.']
C56=['ᚫᛄ-ᛟᛋᚱ.ᛗᚣᛚᚩᚻ-ᚩᚫ-ᚳᚦᚷᚹ-ᚹᛚᚫ.ᛉ','ᚩᚪᛈ-ᛗᛞᛞᚢᚷᚹ-ᛚ-ᛞᚾᚣᛄ-ᚳᚠᛡ-ᚫᛏ','ᛈᛇᚪᚦ-ᚳᚫ.','ᚳᛞ-ᚠᚾ-ᛡᛖ-ᚠᚾᚳᛝ-ᚱᚠ-ᚫᛁᚱᛞᛖ-ᛋᚣᛄᛠᚢ','ᛝᚹ-ᛉᚩ-ᛗᛠᚹᚠ-ᚱᚷᛡ-ᛝᚱᛒ-ᚫᚾᚢᛋ.']
PLAIN56='ᚪᚾᛖᚾᛞᚹᛁᚦᛁᚾᚦᛖᛞᛖᛖᛈᚹᛖᛒᚦᛖᚱᛖᛖᛉᛁᛋᛏᛋᚪᛈᚪᚷᛖᚦᚪᛏᚻᚪᛋᚻᛖᛋᛏᚩᛁᛏᛁᛋᚦᛖᛞᚢᛏᚣᚩᚠᛖᚢᛖᚱᚣᛈᛁᛚᚷᚱᛁᛗᛏᚩᛋᛖᛖᚳᚩᚢᛏᚦᛁᛋᛈᚪᚷᛖ'
C6=['ᚹ-ᚣᛠᚹᛟ.ᚹ-ᛇᚹᛟ-ᚻᛈᚣᛝᚻᛈᚻ-ᛋᛠ-','ᚫᛠ-ᚹᛟᚻ-ᛏᛋᚢᚻᚳ-ᚪᛝᚠ-ᚹ-ᛇᚹᛏᛋᛈ','ᛡ.ᛞᛈ-ᚪᛈᛟᛋ-ᛋᛠ-ᚠᛈ-ᚻᛠᛠᛡ-','ᛠᚦ-ᚠᛈ-ᛇᚹᛏᛋᛈᛡ.ᚪᛞᛠ-ᚹᛡᛈ-ᚳᛠ','ᚢ-ᚪᛞᛠ-ᚪᛝᛏᛞᛈᛏ-ᛋᛠ-ᛏᛋᚢᚻᚳ-ᛞᛈᛡ','ᛈ-ᚹᛏᚣᛈᚻ-ᚠᛈ-ᛇᚹᛏᛋᛈᛡ.ᚠᛈ-ᛏᛋᚢᛈ','ᛟᛋ-ᛋᛠᛄᚻ-ᚠᛈ-ᛇᚹᛏᛋᛈᛡ-ᛞᛝᛏ-ᛟᚹᛇᛈ.','ᚠᚹᛋ-ᛝᛏ-ᛟᛠᛋ-ᚪᛞᛠ-ᚳᛠᚢ-ᚹᛡᛈ-ᚠᚹ','ᛋ-ᛝᛏ-ᛠᛟᛄᚳ-ᚪᛞᚹᛋ-ᚳᛠᚢ-ᚹᛡᛈ-ᚣᚹᛄ','ᛄᛈᚻ.ᚪᛞᛠ-ᚹᛡᛈ-ᚳᛠᚢ-ᚪᛞᛠ-ᚪᛝᛏᛞ','ᛈᛏ-ᛋᛠ-ᛏᛋᚢᚻᚳ-ᛞᛈᛡᛈ-ᛞᛈ-ᚹᛏᚣᛈ']
ROOT=Path(sys.argv[1] if len(sys.argv)>1 else 'resources/liber-primus')
MASK={p:np.min(np.asarray(Image.open(ROOT/f'{p:02d}.jpg').convert('RGB')),axis=2)<100 for p in [6,11,73,74]}
def runs(page,y0,y1,x0,x1):
    labs,n=label(MASK[page][y0:y1,x0:x1].sum(0)>2)
    return [(x0+int(np.flatnonzero(labs==i)[0]),x0+int(np.flatnonzero(labs==i)[-1])) for i in range(1,n+1)]
R57=[runs(74,y0,y1,x0,1850) for (y0,y1),x0 in zip([(910,1040),(1100,1230),(1340,1480),(1530,1670),(1720,1850)],[885]*4+[595])]
R56=[runs(73,y0,y1,x0,1850) for (y0,y1),x0 in zip([(665,800),(855,990),(1040,1175),(1880,2020),(2070,2200)],[765]*3+[590]*2)]
R6=[runs(6,y0,y1,x0,1792) for (y0,y1),x0 in zip([(674,787),(861,975),(1050,1164),(1238,1352),(1462,1576),(1650,1764),(1874,1988),(2062,2177),(2286,2401),(2474,2589),(2663,2778)],[750]*3+[600]*8)]
adv=defaultdict(list)
for j,seq in enumerate(P57):
    if j==0: seq=seq[1:] # large ornamental P is separate
    rr=R57[j]; starts=[]; k=0
    for c in seq:
        starts.append(rr[k][0])
        k+=({0:3,1:3,3:3,4:5}[j] if c=='.' else 1)
    assert k==len(rr),(j,k,len(rr))
    for c,a,b in zip(seq,starts,starts[1:]): adv[c].append(b-a)
# Small P absent from p57 body: use clear LP1 preservation heading.
r11=runs(11,1950,2064,600,1780)
assert [x for x,_ in r11[:5]]==[601,615,630,645,700]
adv['ᛈ']=[r11[4][0]-r11[3][0]]
print('Independent training advances (min/median/max pixels):')
for c,vals in adv.items():print(N.get(c,c),len(vals),min(vals),median(vals),max(vals))
assert min(adv['ᛁ'])==14 and max(adv['ᛖ'])==61
it=iter(PLAIN56)
P56=[''.join(next(it) if c in A else c for c in l) for l in C56]
assert next(it,None) is None and len(PLAIN56)==85
# Solved LP1 first koan's shifted reverse alphabet.
P6=[''.join(A[(2-A.index(c))%29] if c in A else c for c in l) for l in C6]

def report(name,lines,rr,selected):
    # Only selected body rows lower-bound the right edge; avoid frame pixels.
    maxright=max(rr[j][-1][1] for j in selected)
    if name.startswith('LP2'): maxright=max(maxright,rr[1][-1][1])
    print(f'\n{name}: observed rightmost selected ink {maxright}')
    envelopes=[]; c_intervals=[]
    for j in selected:
        p=lines[j]; nxt=lines[j+1][0]; assert all(c in adv for c in p+nxt)
        left=rr[j][0][0]; end=rr[j][-1][1]
        lower=left+sum(min(adv[c]) for c in p)
        upper=left+sum(max(adv[c]) for c in p+nxt)
        med=left+sum(median(adv[c]) for c in p+nxt)
        a,b=rr[j+1][0]; nextwidth=b-a+1
        next_right=[end+g+nextwidth for g in (3,5,7)]
        envelopes.append((lower,upper)); c_intervals.append((end,next_right[1]))
        print(f'line {j+1} -> {j+2}: plain next={N.get(nxt,nxt)}, next-ink upper={upper}, median={med}, plain threshold envelope=[{lower},{upper}], ciphertext end={end}, next width={nextwidth}, projected next right={next_right}, slack={maxright-upper}')
    print('Plaintext common threshold envelope:',max(a for a,b in envelopes),min(b for a,b in envelopes))
    print('Ciphertext common threshold nominal:',maxright,min(b for a,b in c_intervals))
    return maxright,envelopes,c_intervals
a=report('LP2 p56 (archive73)',P56,R56,[3])
b=report('LP1 p6 (archive06)',P6,R6,[1,4,8,9])
assert a[0]-a[1][0][1]>=50
assert b[0]-b[1][2][1]>=140
assert b[0]-b[1][3][1]>=140
assert max(x for x,y in b[1])>min(y for x,y in b[1])
assert max(a[0],max(x for x,y in a[2]))<min(y for x,y in a[2])
assert max(b[0],max(x for x,y in b[2]))<min(y for x,y in b[2])
print('\nPASS: ordinary proportional plaintext-first greedy wrap is contradicted; ciphertext-first greedy threshold is feasible on selected source transitions.')
