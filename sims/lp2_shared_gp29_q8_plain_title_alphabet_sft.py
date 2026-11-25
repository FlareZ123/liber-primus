"""Exact terminal title-derived alphabet, no p55 fitting.

Interpret the enlarged initial A as literal. The unknown 8-rune title
plaintext seeds the mixed alphabet alone or with the initial A prepended.
The zero-free encrypted title fixes all eight shifts; body starts are free.
Two blind controls have three deliberately out-of-register body anchors.
"""
import argparse,json,random,time
from pathlib import Path
import lp2_shared_gp29_q8_smt as s
import lp2_shared_gp29_q8_affine_sft as a
from lp2_shared_gp29_q8_source_pool_sft import encrypt

def alphabet(p,full):
    order=list(dict.fromkeys(([24] if full else [])+list(p)+list(range(29))))
    z=order.index(0)
    return [(order.index(x)-z)%29 for x in range(29)]

def search(title,C,budget,D,W):
    t=time.monotonic();survivors=[];trials=0;periodReject=0;anchorMax=0;anchorReject=0
    anchors=sorted([i for i,c in enumerate(C) if len(c)>=8 and 0 not in c],key=lambda i:(-len(C[i]),i))
    order=anchors+sorted([i for i in range(len(C)) if i not in anchors],key=lambda i:(-len(C[i]),i))
    need=len(anchors)-budget
    for full in (False,True):
        for p in W:
            pi=alphabet(p,full)
            k=[(pi[c]-pi[v])%29 for c,v in zip(title,p)]
            if k[:4]==k[4:]:periodReject+=1;continue
            trials+=1
            inv=[pi.index(x) for x in range(29)]
            maps=[[inv[(pi[c]-v)%29] for c in range(29)] for v in k]
            def support(c):
                if 0 not in c:
                    for start in range(8):
                        w=tuple(maps[(start+j)%8][v] for j,v in enumerate(c))
                        if w in D and 0 not in w:return True
                    return False
                return bool(s.decode(c,pi,k,D))
            n=sum(support(C[i]) for i in anchors);anchorMax=max(anchorMax,n)
            if n<need:anchorReject+=1;continue
            bad=len(anchors)-n
            for i in order[len(anchors):]:
                if not support(C[i]):bad+=1
                if bad>budget:break
            if bad<=budget:
                assert encrypt(p,pi,k,0)==title
                survivors.append({'full':full,'title':a.compact(p),'pi':pi,'k':k,'bodySupported':len(C)-bad})
    return {'trials':trials,'periodReject':periodReject,'anchorReject':anchorReject,'anchors':len(anchors),'requiredAnchorSupport':need,'maxAnchorSupport':anchorMax,'survivors':survivors,'seconds':time.monotonic()-t}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--lex',type=Path,default=a.ROOT/'resources/control/english_wordfreq_textblob.txt')
    p.add_argument('--output',type=Path)
    args=p.parse_args()
    term=json.loads((a.RESULTS/'lp2-shared-gp29-q8-smt-fixtures.json').read_text())
    D=s.load_dictionary(args.lex,term['added'])
    assert len(D)==38938
    h=1469598103934665603
    for c in '\n'.join(sorted(map(a.compact,D))):h=((h^ord(c))*1099511628211)&((1<<64)-1)
    assert h==0xb39eeb2d0de511c4
    orig=s.words(a.TERMINAL_ORIGINAL)
    assert orig[:2]==s.words('o jlnr2eaj')
    W=sorted(w for w in D if len(w)==8 and 0 not in w)
    assert len(W)==5416
    result={'dictionary':len(D),'titleDomain':len(W),'plants':[]}
    for i,pl in enumerate(term['plants']):
        rng=random.Random([272701,272702][i])
        p=rng.choice(W);full=bool(i);pi=alphabet(p,full)
        while True:
            k=[rng.randrange(29) for _ in range(8)]
            title=encrypt(p,pi,k,0)
            if k[:4]!=k[4:] and 0 not in title:break
        T=s.words(pl['truth'])[2:]
        phases=[rng.randrange(8) for w in T]
        C=[encrypt(w,pi,k,j) for w,j in zip(T,phases)]
        assert all(w in s.decode(c,pi,k,D) for w,c in zip(T,C))
        idx=sorted((g for g in range(47) if len(C[g])>=8 and 0 not in C[g]),key=lambda j:(-len(C[j]),j))[:3]
        assert len(idx)==3
        for g in idx:
            while True:
                w=tuple(rng.randrange(1,29) for _ in T[g])
                c=encrypt(w,pi,k,phases[g])
                if 0 not in c and not s.decode(c,pi,k,D):break
            C[g]=c;T[g]=w
        r=search(title,C[:47],3,D,W)
        r.update(plant=i,seed=[272701,272702][i],trueTitle=a.compact(p),cipherTitle=a.compact(title),full=full,omitted=idx,hiddenPi=pi,hiddenK=k,cipher=' '.join(map(a.compact,C)),truth=' '.join(map(a.compact,T)))
        for x in r['survivors']:
            dec=[s.decode(c,x['pi'],x['k'],D) for c in C]
            x.update(exact=s.same_action(x['pi'],x['k'],pi,k),holdout=sum(T[g] in dec[g] for g in range(47,64)),unique=sum(dec[g]=={T[g]} for g in range(47,64)))
        assert len(r['survivors'])==1 and r['survivors'][0]['exact']
        result['plants'].append(r)
    result['original']=search(orig[1],orig[2:],3,D,W)
    print(json.dumps(result,indent=2))
    if args.output:args.output.write_text(json.dumps(result,indent=2)+'\n')

if __name__=='__main__':main()
