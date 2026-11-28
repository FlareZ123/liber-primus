"""Spacing-free q8 strict-repeat silent mod36 key/crib inversion.
Requires Python 3 and C++17/OpenMP (CXX environment variable).
Original full search is expensive (~15–30 min on four CPU threads).
Run --mode controls or --mode original; original supports a half-open
start interval for resumable batches. The default original scans all starts.
"""
import argparse
import json
import os
import pathlib
import random
import re
import subprocess
import tempfile

A='0123456789abcdefghijklmnopqrstuvwxyz'
EXPECTED=[
 '783o4iq317837af8ifg3fg1nq8i4iof5in2ijofgi4',
 '93g783q31o4i783o4iq317837af8ifg3fg1nq8i4i',
 '2ijofgi4783o4iq317837af8ifg3fg1nq8i4i',
 '783o4iq317837af8ifg3fg1nq8i4i',
 '7i7akk93ghifg43li93168',
 '7i5o9hik3lo9nhi4a68g',
]
SEARCHES=[(3,13),(4,14),(5,12)]

def read_inputs(root):
    c=json.loads((root/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    n=json.loads((root/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf-8'))
    chart=dict(zip(c['runes'],A))
    native={}
    for r in n['sections']:
        if r['name'].startswith(('p56','p57')):continue
        native[r['name']]=[''.join(chart[ch] for ch in w) for w in re.findall(r'[\u16a0-\u16ff]+',re.sub(r'/\s*','',r['source_text']))]
    cribs={}
    for name,W in native.items():
        for i in range(len(W)):
            for j in range(i+1,len(W)):
                if W[i]!=W[j] or (i and W[i-1]==W[j-1]):continue
                k=0
                while j+k<len(W) and W[i+k]==W[j+k]:k+=1
                words=tuple(W[i:i+k]);P=''.join(words)
                if len(P)>=20:cribs.setdefault(words,(name,i,j,P))
    ordered=sorted(cribs.values(),key=lambda x:-len(x[-1]))
    assert [x[-1] for x in ordered]==EXPECTED
    C=''.join(A[x] for p in c['pages'] if 0<=p['page']<=55 for x in p['indices'])
    assert len(C)==12956
    return C,native,ordered

def plant(P,seed):
    R=random.Random(seed);K=[R.randrange(36) for _ in range(8)]
    j=0;last=36;C=[];pos=[];phase=[]
    for ch in P:
        pos.append(len(C));p=A.index(ch)
        while (c:=(p+K[j])%36)==last:j=(j+1)%8
        phase.append(j);last=c;j=(j+1)%8
        if c<29:C.append(A[c])
    pos.append(len(C))
    return ''.join(C),K,pos,phase

def control_truth(P,crib,K,pos,phase,m):
    truth=set()
    for i in range(len(P)-len(crib)+1):
        if P[i:i+len(crib)]!=crib:continue
        h=pos[i+len(crib)]-pos[i];q=phase[i]
        if h>=m:truth.add((pos[i],h,''.join(A[x] for x in K[q:]+K[:q])))
    return truth

def run(exe,P,C,m,a,b):
    r=subprocess.run([str(exe),P,C,str(m),str(a),str(b)],check=True,capture_output=True,text=True)
    lines=r.stdout.splitlines()
    hits={(int(s),int(h),k) for s,h,k in (l.split() for l in lines[1:])}
    return r.stdout,hits

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--mode',choices=['controls','original','terminal'],default='original')
    ap.add_argument('--start',type=int,default=0)
    ap.add_argument('--end',type=int,default=12956)
    ap.add_argument('--batch',type=int,default=500)
    ap.add_argument('--crib',type=int,choices=[3,4,5])
    args=ap.parse_args()
    here=pathlib.Path(__file__).resolve().parent
    C,native,ordered=read_inputs(here.parent)
    with tempfile.TemporaryDirectory() as tmp:
        exe=pathlib.Path(tmp)/('crib.exe' if os.name=='nt' else 'crib')
        subprocess.run([os.environ.get('CXX','g++'),'-O3','-std=c++17','-fopenmp',str(here/'lp2_alt36_q8_spacingfree_crib.cpp'),'-o',str(exe)],check=True)
        if args.mode=='controls':
            for ix,m in SEARCHES:
                name,seed=('0_koan_1',20261128) if ix==3 else ('0_loss_of_divinity',910133)
                P=''.join(native[name]);c,K,pos,phase=plant(P,seed)
                q=ordered[ix][-1];truth=control_truth(P,q,K,pos,phase,m)
                output,hits=run(exe,q,c,m,0,len(c)-m+1)
                assert truth and truth<=hits
                print(json.dumps({'crib':ix,'truth':sorted(truth),'hits':sorted(hits),'output':output}),flush=True)
        elif args.mode=='terminal':
            c=C[-308:][9:]
            for ix,q in enumerate(EXPECTED):
                m=(3*len(q)+4)//5
                output,hits=run(exe,q,c,m,0,len(c)-m+1)
                print(json.dumps({'crib':ix,'min':m,'output':output}),flush=True)
        else:
            for ix,m in SEARCHES:
                if args.crib is not None and args.crib!=ix:continue
                q=ordered[ix][-1];end=min(args.end,len(C)-m+1)
                for a in range(args.start,end,args.batch):
                    b=min(a+args.batch,end);output,hits=run(exe,q,C,m,a,b)
                    print(json.dumps({'crib':ix,'min':m,'start':a,'end':b,'output':output}),flush=True)
if __name__=='__main__':
    main()
