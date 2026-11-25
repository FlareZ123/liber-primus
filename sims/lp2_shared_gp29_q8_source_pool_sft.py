"""Blind terminal-profile source-word pool experiment for shared-cycle q8.

Run from repository root with Python 3 and g++ (AVX2 required for mapped).
Only the 49 training groups, finite word domains and source key pool reach C++.
The 17 holdout groups and hidden action are used only to score returned keys.
"""
import argparse, json, pathlib, random, re, subprocess, tempfile
import lp2_shared_gp29_q8_smt as s
import lp2_shared_gp29_q8_affine_sft as a

ROOT=a.ROOT
SOURCE='fg4166ki akk1fr9f naf531i4 4skagaif q314fik0 j314901k 53901fin o9f7i4in a98ohagl na1a9agq hi8o1r4f ni5idgr9 d4ifi41i d4ifi41l oggo58in d4ido4in fg1ni9gf'.split()

def encrypt(t,pi,k,j):
    inv=[pi.index(x) for x in range(29)]
    w=[]
    for p in t:
        if p==0: w.append(0)
        else:
            w.append(inv[(pi[p]+k[j])%29])
            j=(j+1)%8
    return tuple(w)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--model',choices=['mapped','numeric'],default='numeric')
    p.add_argument('--plant',choices=['0','1','original'],default='0')
    p.add_argument('--oov',type=int,default=0)
    p.add_argument('--corrupt',action='store_true')
    p.add_argument('--seconds',type=int,default=900)
    p.add_argument('--threads',type=int,default=1)
    p.add_argument('--shard',type=int,default=0)
    p.add_argument('--shards',type=int,default=1)
    p.add_argument('--compiler',default='g++')
    p.add_argument('--lex',type=pathlib.Path,default=ROOT/'resources/control/english_wordfreq_textblob.txt')
    args=p.parse_args()
    source=SOURCE if args.model=='numeric' else [w for w in SOURCE if w!='na1a9agq']
    keys=sorted(set(min(w[j:]+w[:j] for j in range(8)) for w in source))
    term=json.loads((a.RESULTS/'lp2-shared-gp29-q8-smt-fixtures.json').read_text())
    D=s.load_dictionary(args.lex,term['added'])
    assert len(D)==38938
    h=1469598103934665603
    for c in '\n'.join(sorted(map(a.compact,D))): h=((h^ord(c))*1099511628211)&((1<<64)-1)
    assert h==0xb39eeb2d0de511c4
    T=None
    if args.plant=='original':
        C=s.words(a.TERMINAL_ORIGINAL)
        assert not args.corrupt
    else:
        i=int(args.plant)
        pl=term['plants'][i]
        rng=random.Random([7213301,7212014][i])
        key=rng.choice(keys)
        pi=pl['pi']
        k=[pi[x] for x in s.words(key)[0]] if args.model=='mapped' else list(s.words(key)[0])
        T=s.words(pl['truth'])
        phases=[rng.randrange(8) for w in T]
        C=[encrypt(t,pi,k,j) for t,j in zip(T,phases)]
        assert all(t in s.decode(c,pi,k,D) for t,c in zip(T,C))
        if args.corrupt:
            rng=random.Random(2713001+i)
            idx=sorted(range(49),key=lambda j:(-len(C[j]),j))[:args.oov]
            for g in idx:
                while True:
                    w=tuple(rng.randrange(29) for _ in T[g])
                    cipher=encrypt(w,pi,k,phases[g])
                    if not s.decode(cipher,pi,k,D): break
                T[g]=w; C[g]=cipher
    assert len(C)>=49 and sum(map(len,C[:49]))==222
    with tempfile.TemporaryDirectory() as tmp:
        inp=pathlib.Path(tmp)/'input.txt'
        pool=pathlib.Path(tmp)/'keys.txt'
        exe=pathlib.Path(tmp)/'solver'
        a.write_input(inp,C[:49],D)
        pool.write_text('\n'.join(keys)+'\n')
        cpp='lp2_shared_gp29_q8_numeric_pool.cpp' if args.model=='numeric' else 'lp2_shared_gp29_q8_affine_oov.cpp'
        flags=['-O3','-fopenmp','-std=c++17']+(['-mavx2'] if args.model=='mapped' else [])
        subprocess.run([args.compiler,*flags,str(ROOT/'sims'/cpp),'-o',str(exe)],check=True)
        if args.model=='numeric':
            cmd=[str(exe),str(inp),str(pool),str(args.seconds),str(args.threads),str(args.oov),str(args.shard),str(args.shards)]
        else:
            cmd=[str(exe),str(inp),str(args.seconds),str(args.threads),str(args.shard),str(args.shards),'info',str(args.oov),str(pool)]
        r=subprocess.run(cmd,check=True,text=True,capture_output=True)
        print(r.stdout,end='')
    m=re.search(r'^KEY pi (.*)$',r.stdout,re.M)
    n=re.search(r'^KEY k (.*)$',r.stdout,re.M)
    if m and n:
        pp=list(map(int,m[1].split()));kk=list(map(int,n[1].split()))
        dec=[s.decode(c,pp,kk,D) for c in C]
        assert sum(not w for w in dec[:49])<=args.oov
        out={'pi':pp,'k':kk,'train_supported':sum(map(bool,dec[:49]))}
        if T is not None:
            out.update(exact=s.same_action(pp,kk,pi,k),hidden_key=key,
                       train_truth=sum(T[i] in dec[i] for i in range(49)),
                       holdout_truth=sum(T[i] in dec[i] for i in range(49,len(C))),
                       holdout_unique=sum(dec[i]=={T[i]} for i in range(49,len(C))))
        print(json.dumps(out,indent=2))

if __name__=='__main__': main()
