"""Run the compiled one-gap source-crib inverse. No language scoring.
Use --repo ROOT to load original canonical input and the native controls from
repository JSON; otherwise --local expects tape.txt, koan.txt, loss.txt.
"""
import argparse
import json
import math
import os
from pathlib import Path
import re
import subprocess

A='0123456789abcdefghijklmnopqrstuvwxyz'
EXPECTED=['783o4iq317837af8ifg3fg1nq8i4iof5in2ijofgi4','93g783q31o4i783o4iq317837af8ifg3fg1nq8i4i','2ijofgi4783o4iq317837af8ifg3fg1nq8i4i','783o4iq317837af8ifg3fg1nq8i4i','7i7akk93ghifg43li93168','7i5o9hik3lo9nhi4a68g']

def fnv(s):
    h=2166136261
    for c in s: h=((h^A.index(c))*16777619)&0xffffffff
    return h

def load_inputs(repo,local):
    if repo:
        c=json.loads((repo/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
        n=json.loads((repo/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf-8'))
        chart=dict(zip(c['runes'],A))
        C=''.join(A[x] for p in c['pages'] if 0<=p['page']<=55 for x in p['indices'])
        native={r['name']:[''.join(chart[ch] for ch in w) for w in re.findall(r'[\u16a0-\u16ff]+',re.sub(r'/\s*','',r['source_text']))] for r in n['sections'] if not r['name'].startswith(('p56','p57'))}
        cribs={}
        for name,W in native.items():
            for i in range(len(W)):
                for j in range(i+1,len(W)):
                    if W[i]!=W[j] or (i and W[i-1]==W[j-1]):continue
                    k=0
                    while j+k<len(W) and W[i+k]==W[j+k]:k+=1
                    p=''.join(W[i:i+k])
                    if len(p)>=20:cribs.setdefault(tuple(W[i:i+k]),(p,name))
        phrases=sorted(cribs.values(),key=lambda x:-len(x[0]))
        assert [p for p,_ in phrases]==EXPECTED
        source=[''.join(native[name]) for _,name in phrases]
    else:
        C=(local/'tape.txt').read_text().strip()
        source=[(local/('koan.txt' if i<4 else 'loss.txt')).read_text().strip() for i in range(6)]
    assert len(C)==12956 and fnv(C)==0xfe63c4ed
    assert all(fnv(s)==(0x2fbd2c9d if i<4 else 0xba80a5e8) for i,s in enumerate(source))
    return C,source

class RNG:
    def __init__(self,seed):self.x=seed&0xffffffff
    def draw(self):
        x=self.x
        x^=(x<<13)&0xffffffff;x^=x>>17;x^=(x<<5)&0xffffffff
        self.x=x&0xffffffff
        return self.x

def plant(S,N,q,ci,z):
    R=RNG(3301+100000*N+1000*q+37*ci+7919*z)
    K=[R.draw()*N//2**32 for _ in range(q)]
    E=[];j=0;last=-1
    for p in map(A.index,S):
        retry=0;c=(p+K[j])%N
        while c==last:
            j=(j+1)%q;retry+=1
            assert retry<q
            c=(p+K[j])%N
        E.append((c,j,retry));last=c;j=(j+1)%q
    keep=[c<29 if N==36 else R.draw()*36<29*2**32 for c,_,_ in E]
    C=''.join(A[c] for (c,_,_),v in zip(E,keep) if v)
    ks=''.join(A[k] for k in K);key=min(ks[i:]+ks[:i] for i in range(q))
    return C,E,keep,key

def eligibility(S,P,E,keep,q,m):
    L=len(P);truth=[]
    for a in range(len(S)-L+1):
        if S[a:a+L]!=P:continue
        count=sum(keep[a:a+L]);plain=missing=rejected=False
        for b in range(a,a+L-q+1):
            mask=keep[b:b+q]
            if any(e[2] for e in E[b+1:b+q]):continue
            plain|=all(mask)
            missing|=mask[0] and mask[-1] and sum(mask)==q-1
        for b in range(a,a+L-q+2):
            rejected|=all(keep[b:b+q-1]) and sum(e[2] for e in E[b+1:b+q-1])==1
        truth.append(dict(a=a,count=count,plain=plain,missing=missing,rejected=rejected,eligible=count>=m and (missing or rejected),union=count>=m and (plain or missing or rejected)))
    return truth

def solve(exe,N,q,P,C,m):
    return json.loads(subprocess.check_output([str(exe),str(N),str(q),P,C,str(m),'0',str(len(C))],text=True,env={**os.environ,'OMP_NUM_THREADS':os.environ.get('OMP_NUM_THREADS','4')}))

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--repo',type=Path);ap.add_argument('--local',type=Path,default=Path(__file__).parent);ap.add_argument('--exe',type=Path,required=True);ap.add_argument('--N',type=int,choices=[29,36],required=True);ap.add_argument('--q',type=int,choices=[8,13],required=True);ap.add_argument('--mode',choices=['both','original','controls'],default='both');ap.add_argument('--output',type=Path,required=True);args=ap.parse_args()
    N,q=args.N,args.q;C,S=load_inputs(args.repo,args.local);out={'N':N,'q':q,'original':[],'controls':[]}
    for i,P in enumerate(EXPECTED):
        L=len(P);m=max((3*L+3)//4,q+5)
        if L<2*q or m>L:continue
        if args.mode!='controls':
            o=solve(args.exe,N,q,P,C,m);out['original'].append({'ci':i,**o});print('original',i,o['keys'],len(o['hits']),o['seconds'],flush=True)
        if args.mode!='original':
            for z in range(12):
                T,E,keep,key=plant(S[i],N,q,i,z);truth=eligibility(S[i],P,E,keep,q,m);o=solve(args.exe,N,q,P,T,m);keys={h['key'] for h in o['hits']};matched=key in keys
                assert matched or not any(t['eligible'] for t in truth),(N,q,i,z,truth,key)
                out['controls'].append(dict(ci=i,z=z,key=key,truth=truth,matched=matched,falseKeys=sorted(keys-{key}),hitCount=len(o['hits']),**{'search':o}))
            x=[x for x in out['controls'] if x['ci']==i];print('controls',i,'eligible',sum(any(y['eligible'] for y in a['truth']) for a in x),'matched',sum(a['matched'] for a in x),'union',sum(any(y['union'] for y in a['truth']) for a in x),'false',sum(len(a['falseKeys']) for a in x),flush=True)
        args.output.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
    print('TOTAL',sum(a['keys'] for a in out['original']),sum(len(a['hits']) for a in out['original']),len(out['controls']),sum(any(y['eligible'] for y in a['truth']) for a in out['controls']),sum(a['matched'] for a in out['controls']),sum(any(y['union'] for y in a['truth']) for a in out['controls']),sum(len(a['falseKeys']) for a in out['controls']),flush=True)
if __name__=='__main__':main()
