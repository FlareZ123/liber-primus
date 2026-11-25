"""Prepare exact mapped-red8 search inputs from frozen common-cycle controls.
Run in any working directory; writes inputs there. Python 3.8+.
"""
import hashlib
import json
import random
import re
from collections import defaultdict
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
N,Q,TRAIN=29,8,49
K=(19,21,23,27,2,14,10,19)
def read_words(s):
    return [tuple(int(ch,29) for ch in w) for w in s.split()]
def enc(w):
    return ''.join('0123456789abcdefghijklmnopqrs'[p] for p in w)
def load():
    data=json.loads((ROOT/'im-results/lp2-shared-gp29-unknown-q8-controls.json').read_text())
    raw=(ROOT/'resources/control/english_wordfreq_textblob.txt').read_bytes()
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()=='140e1d22b5f8c45deddd2e8b25549d9d6307d938'
    alpha={s:i for i,s in enumerate(data['alphabet'])}
    def variants(s):
        s=s.upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')
        def walk(i):
            if i==len(s):
                yield ()
                return
            for n in (1,2,3):
                t=s[i:i+n]
                if len(t)!=n:continue
                v=alpha.get('NG') if n==3 and t=='ING' else alpha.get(t) if n<3 else None
                if v is not None:
                    for tail in walk(i+n):yield (v,)+tail
        yield from walk(0)
    words=set(read_words(data['native']))
    for line in raw.decode().splitlines():
        m=re.fullmatch(r'([a-z]+)\s+(\d+)',line)
        if m:words.update(variants(m[1]))
    assert len(words)==data['size']==38938
    by=defaultdict(list)
    for w in sorted(words):by[len(w)].append(w)
    original=read_words(data['original'])
    assert len(original)==66 and sum(map(len,original))==308 and sum(map(len,original[:TRAIN]))==222
    assert original[0]==(24,) and original[1]==K
    return data,words,by,original
def encode(w,pi,k,j):
    inv=[0]*N
    for p,x in enumerate(pi):inv[x]=p
    out=[]
    for p in w:
        if p==0:out.append(0)
        else:
            out.append(inv[(pi[p]+k[j])%N]);j=(j+1)%Q
    return tuple(out)
def decode(c,pi,k,words):
    inv=[0]*N
    for p,x in enumerate(pi):inv[x]=p
    out=set()
    def walk(i,j,w,start):
        if i==len(c):
            if w in words:
                assert encode(w,pi,k,start)==c
                out.add(w)
            return
        if c[i]==0:walk(i+1,j,w+(0,),start)
        p=inv[(pi[c[i]]-k[j])%N]
        if p:walk(i+1,(j+1)%Q,w+(p,),start)
    for j in range(Q):walk(0,j,(),j)
    return out
def prepare():
    data,words,by,original=load()
    Path('words.txt').write_text('\n'.join(enc(w) for w in sorted(words))+'\n')
    Path('original.txt').write_text('\n'.join(enc(w) for w in original)+'\n')
    for i,name in enumerate(('gibran','emerson')):
        p=data['plants'][i];truth=read_words(p['truth']);pi=read_words(p['pi'])[0]
        scale=pow(pi[K[0]],-1,N);pi=tuple(x*scale%N for x in pi)
        key=tuple(pi[x] for x in K)
        rng=random.Random([3301,20141125][i]^0x54)
        starts=[rng.randrange(Q) for w in truth]
        cipher=[encode(w,pi,key,j) for w,j in zip(truth,starts)]
        Path(name+'-red8.txt').write_text('\n'.join(enc(w) for w in cipher)+'\n')
        Path(name+'-red8-truth.json').write_text(json.dumps({'pi':pi,'k':key,'truth':[enc(w) for w in truth],'starts':starts})+'\n')
def evaluate(name,result_path):
    _,words,_,_=load()
    result=json.loads(Path(result_path).read_text())
    truth=json.loads(Path(name+'-red8-truth.json').read_text())
    c=read_words(Path(name+'-red8.txt').read_text())
    for candidate in result['winners']:
        pi=read_words(candidate)[0]
        key=tuple(pi[x] for x in K)
        dom=[decode(x,pi,key,words) for x in c]
        p=read_words(' '.join(truth['truth']))
        print(json.dumps({'case':name,'pi_exact':list(pi)==truth['pi'],'train_supported':sum(bool(x) for x in dom[2:49]),'holdout_truth':sum(w in d for w,d in zip(p[49:],dom[49:])),'holdout_unique_truth':sum(d=={w} for w,d in zip(p[49:],dom[49:]))}))
if __name__=='__main__':
    import sys
    if len(sys.argv)==1:prepare()
    else:evaluate(sys.argv[1],sys.argv[2])
