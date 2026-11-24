"""Keyless equivalence formulation of permutation plaintext-autokey on zero-free source.
Uses the existing canonical loader and native Z3 interface. No original ciphertext is modified.
"""
import argparse, json, random, re, time
from lp2_plaintext_autokey_q8_permutation_fhold_sat import (
    ALPHA, NativeZ3, load_fixture, dictionary, longest_zero_free, prefix
)

def flatten(ws): return [p for w in ws for p in w]

def encrypt(pt, primer, perm, q):
    assert 0 not in pt
    return [(p+(primer[i] if i<q else perm[pt[i-q]]))%29 for i,p in enumerate(pt)]

def plant(source,q):
    ws,_=longest_zero_free(source);pt=flatten(ws);rng=random.Random(3301)
    for trial in range(200000):
        perm=list(range(29));rng.shuffle(perm);primer=[rng.randrange(29) for _ in range(q)]
        ct=encrypt(pt,primer,perm,q)
        if 0 not in ct:
            off=0;out=[]
            for w in ws:
                out.append(tuple(ct[off:off+len(w)]));off+=len(w)
            return out,pt,primer,perm,trial+1
    raise RuntimeError('plant not found')

def bv(v,n=5):return f'(_ bv{v} {n})'
def OR(xs):return 'false' if not xs else xs[0] if len(xs)==1 else '(or '+' '.join(xs)+')'
def concat(xs):
    if len(xs)==1:return xs[0]
    mid=len(xs)//2;return f'(concat {concat(xs[:mid])} {concat(xs[mid:])})'
def packed(w):
    v=0
    for x in w:v=(v<<5)|x
    return v

def solve(ws,ds,q,timeout,mode,known=None,model='pair'):
    ct=flatten(ws);n=len(ct);assert 0 not in ct
    f=[f'(set-option :timeout {timeout})','(set-option :produce-models true)']
    p=[f'p{i}' for i in range(n)];k=[f'k{i}' for i in range(29)]
    for v in (p+k if model=='map' else p):f.append(f'(declare-const {v} (_ BitVec 5))')
    def add(s):f.append(f'(assert {s})')
    if model=='map':
        for v in k:add(f'(bvult {v} {bv(29)})')
        for i in range(29):
            for j in range(i):add(f'(not (= {k[i]} {k[j]}))')
        if known is not None:
            for i,v in enumerate(known):add(f'(= {k[i]} {bv(v)})')
    else:assert known is None
    off=0;domains=[]
    for w in ws:
        cand=ds.get(len(w),[]);domains.append(len(cand));s=concat(p[off:off+len(w)])
        add(OR([f'(= {s} {bv(packed(v),5*len(w))})' for v in cand]));off+=len(w)
    for i in range(q,n):
        c=bv(ct[i]);a=p[i];v=f's{i}'
        # Five-bit modular arithmetic is exact here: both branches' intended results lie in 0..28.
        f.append(f'(define-fun {v} () (_ BitVec 5) (ite (bvule {a} {c}) (bvsub {c} {a}) (bvsub (bvadd {c} {bv(29)}) {a})))')
        if model=='map':
            for x in range(1,29):add(f'(=> (= {p[i-q]} {bv(x)}) (= {k[x]} {v}))')
        else:
            for j in range(q,i):add(f'(= (= {p[i-q]} {p[j-q]}) (= {v} s{j}))')
    script='\n'.join(f);z=NativeZ3();start=time.monotonic()
    try:
        status=z.eval(script+'\n'+('(check-sat-using (then simplify propagate-values solve-eqs bit-blast sat))' if mode=='sat' else '(check-sat)')).strip()
        out={'status':status,'seconds':round(time.monotonic()-start,3),'runes':n,'words':len(ws),'dictionary_candidates':sum(domains),'smt_chars':len(script)}
        if status=='unknown':out['reason']=z.eval('(get-info :reason-unknown)').strip()
        if status=='sat':
            vals=z.eval('(get-value ('+' '.join(p+k if model=='map' else p)+'))')
            parsed={name:int(value,2) for name,value in re.findall(r'\(([pk]\d+) #b([01]+)\)',vals)}
            assert len(parsed)==n+(29 if model=='map' else 0),vals[:500]
            pt=[parsed[x] for x in p]
            if model=='map':mp=[parsed[x] for x in k]
            else:
                partial={pt[i-q]:(ct[i]-pt[i])%29 for i in range(q,n)}
                free=iter(sorted(set(range(29))-set(partial.values())))
                mp=[partial[i] if i in partial else next(free) for i in range(29)]
            primer=[(c-x)%29 for c,x in zip(ct[:q],pt[:q])]
            assert sorted(mp)==list(range(29)) and encrypt(pt,primer,mp,q)==ct
            off=0;out_words=[]
            for w in ws:
                v=tuple(pt[off:off+len(w)]);assert v in ds[len(w)]
                out_words.append(''.join(ALPHA[x] for x in v));off+=len(w)
            out.update(pt=' '.join(out_words),primer=primer,map=mp,replay=True)
        return out
    finally:z.close()

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--target',choices=['original','control','control-known'],default='original')
    ap.add_argument('--q',type=int,default=8)
    ap.add_argument('--freq',type=int,default=100)
    ap.add_argument('--timeout',type=int,default=20000)
    ap.add_argument('--mode',choices=['sat','default'],default='sat')
    ap.add_argument('--model',choices=['map','pair'],default='pair')
    ap.add_argument('--fit',type=int,default=0)
    args=ap.parse_args()
    originals,native,translit,lines=load_fixture(None,None)
    control=native['jpg107-167'];parable=native['p57_parable']
    ds={n:[w for w in vs if 0 not in w] for n,vs in dictionary({'control':control,'parable':parable},translit,lines,args.freq).items()}
    if args.freq==100:assert sum(map(len,ds.values()))==1394
    if args.freq==0:assert sum(map(len,ds.values()))==35078
    ws,start=longest_zero_free(originals['p54'])
    assert start==70 and sum(map(len,ws))==123 and len(ws)==28
    truth=perm=None;trial=None
    if args.target.startswith('control'):ws,truth,primer,perm,trial=plant(control,args.q)
    print(json.dumps({'target':args.target,'q':args.q,'freq':args.freq,'lexicon_no_F':sum(map(len,ds.values())),'source_start':start if truth is None else None,'plant_trials':trial,'runes':sum(map(len,ws)),'words':len(ws)}),flush=True)
    fullws=ws
    if args.fit:ws=prefix(ws,args.fit)
    out=solve(ws,ds,args.q,args.timeout,args.mode,perm if args.target=='control-known' else None,args.model)
    if truth is not None and out['status']=='sat':
        pt=[ALPHA.index(x) for x in out['pt'] if x!=' ']
        out['truth_matches']=sum(x==y for x,y in zip(pt,truth))
        used=set(pt[:-args.q])
        out['observed_map_matches']=sum(out['map'][i]==perm[i] for i in used)
        out['observed_map_count']=len(used)
        if args.fit:
            ct=flatten(fullws);candidate=pt.copy()
            for i in range(len(pt),len(ct)):
                x=candidate[i-args.q]
                if x not in used:break
                y=(ct[i]-out['map'][x])%29
                if y==0:break
                candidate.append(y)
            out.update(fit_runes=len(pt),holdout_runes=len(ct)-len(pt),holdout_predicted=len(candidate)-len(pt),holdout_matches=sum(x==y for x,y in zip(candidate[len(pt):],truth[len(pt):])))
    print(json.dumps(out),flush=True)

if __name__=='__main__':main()
