"""Exact fixed-source alphabet pool, free q8 shifts. See common-cycle report.
Both blind controls deliberately contain three OOV full-period anchors.
"""
import argparse, json, pathlib, random, re, subprocess, tempfile
import lp2_shared_gp29_q8_smt as s
import lp2_shared_gp29_q8_affine_sft as a
from lp2_shared_gp29_q8_source_pool_sft import encrypt

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--plant',choices=['0','1','original','heading'],default='0')
    p.add_argument('--threads',type=int,default=1)
    p.add_argument('--compiler',default='g++')
    p.add_argument('--lex',type=pathlib.Path,default=a.ROOT/'resources/control/english_wordfreq_textblob.txt')
    args=p.parse_args()
    native=json.loads((a.ROOT/'resources/external/relikd-solved-gp29-native-v1.json').read_text())
    trans={r:s.SYM[i] for i,r in enumerate(native['runes'])}
    pool=sorted(set(''.join(trans[x] for x in w) for sec in native['sections'] for w in re.findall(r'[\u16a0-\u16ff]+',sec['source_text'])))
    assert len(pool)==272
    term=json.loads((a.RESULTS/'lp2-shared-gp29-q8-smt-fixtures.json').read_text())
    D=s.load_dictionary(args.lex,term['added'])
    assert len(D)==38938
    h=1469598103934665603
    for c in '\n'.join(sorted(map(a.compact,D))): h=((h^ord(c))*1099511628211)&((1<<64)-1)
    assert h==0xb39eeb2d0de511c4
    T=None
    n=49
    if args.plant in ('original','heading'):
        C=s.words(a.TERMINAL_ORIGINAL)
        if args.plant=='heading':
            assert C[:2]==s.words('o jlnr2eaj')
            C=C[2:]; n=47
            pool=['ojlnr2eaj','jlnr2eaj']
    else:
        i=int(args.plant)
        pl=term['plants'][i]
        rng=random.Random([272501,272502][i])
        keyword=rng.choice(pool)
        order=list(dict.fromkeys([*s.words(keyword)[0],*range(29)]))
        z=order.index(0)
        pi=[(order.index(x)-z)%29 for x in range(29)]
        k=[rng.randrange(29) for _ in range(8)]
        assert k[:4]!=k[4:]
        T=s.words(pl['truth'])
        phases=[rng.randrange(8) for _ in T]
        C=[encrypt(t,pi,k,j) for t,j in zip(T,phases)]
        assert all(t in s.decode(c,pi,k,D) for t,c in zip(T,C))
        idx=sorted((g for g in range(n) if len(C[g])>=8 and 0 not in C[g]),key=lambda j:(-len(C[j]),j))[:3]
        assert len(idx)==3
        for g in idx:
            while True:
                w=tuple(rng.randrange(1,29) for _ in T[g])
                c=encrypt(w,pi,k,phases[g])
                if 0 not in c and not s.decode(c,pi,k,D): break
            C[g]=c; T[g]=w
    with tempfile.TemporaryDirectory() as tmp:
        inp=pathlib.Path(tmp)/'input.txt'
        keys=pathlib.Path(tmp)/'keywords.txt'
        exe=pathlib.Path(tmp)/'solver'
        a.write_input(inp,C[:n],D)
        keys.write_text('\n'.join(pool)+'\n')
        subprocess.run([args.compiler,'-O3','-fopenmp','-std=c++17',str(a.ROOT/'sims/lp2_shared_gp29_q8_keyed_alphabet.cpp'),'-o',str(exe)],check=True)
        r=subprocess.run([str(exe),str(inp),str(keys),'3',str(args.threads)],check=True,text=True,capture_output=True)
        print(r.stdout,end='')
    for pp,kk in zip(re.findall(r'^KEY pi (.*)$',r.stdout,re.M),re.findall(r'^KEY k (.*)$',r.stdout,re.M)):
        pp=list(map(int,pp.split()));kk=list(map(int,kk.split()))
        dec=[s.decode(c,pp,kk,D) for c in C]
        assert sum(not w for w in dec[:n])<=3
        out={'pi':pp,'k':kk,'train_supported':sum(map(bool,dec[:n]))}
        if T is not None:
            out.update(exact=s.same_action(pp,kk,pi,k),hidden_keyword=keyword,omitted=idx,
                       train_truth=sum(T[j] in dec[j] for j in range(n)),
                       holdout_truth=sum(T[j] in dec[j] for j in range(n,len(C))),
                       holdout_unique=sum(dec[j]=={T[j]} for j in range(n,len(C))))
        print(json.dumps(out,indent=2))

if __name__=='__main__':main()
