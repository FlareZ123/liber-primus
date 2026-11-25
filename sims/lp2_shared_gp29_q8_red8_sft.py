#!/usr/bin/env python3
"""Blind controls and original p54 test for the red-eight GP29 heading key.

Variants:
  direct: k_j = GP29_index(K_j)
  prime:  k_j = prime(K_j) mod 29
  mapped: k_j = pi(K_j)

The C++ receiver sees only the p54 body training groups and finite dictionary
domains. p55 is scored only after a candidate action is returned.
"""
import argparse, json, pathlib, random, re, subprocess, tempfile
import lp2_shared_gp29_q8_smt as s
import lp2_shared_gp29_q8_affine_sft as a

ROOT=a.ROOT
RED8=s.words('jlnr2eaj')[0]

def rotate(v):
    return min(tuple(v[i:]+v[:i]) for i in range(8))

def encrypt_all(T,pi,k,phases):
    return [s.encode(t,pi,k,j) for t,j in zip(T,phases)]

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--variant',choices=['direct','prime','mapped'],required=True)
    p.add_argument('--plant',choices=['0','1','original'],default='0')
    p.add_argument('--oov',type=int,default=3)
    p.add_argument('--corrupt',action='store_true')
    p.add_argument('--seconds',type=int,default=900)
    p.add_argument('--threads',type=int,default=4)
    p.add_argument('--shard',type=int,default=0)
    p.add_argument('--shards',type=int,default=1)
    p.add_argument('--compiler',default='g++')
    p.add_argument('--lex',type=pathlib.Path,default=ROOT/'resources/control/english_wordfreq_textblob.txt')
    args=p.parse_args()

    term=json.loads((a.RESULTS/'lp2-shared-gp29-q8-terminal-corrected-fixtures.json').read_text())
    corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text())
    D=s.load_dictionary(args.lex,term['added'])
    assert len(D)==38938

    prime_key=tuple(corpus['prime'][x]%29 for x in RED8)
    assert a.compact(prime_key)=='dl2k5i2d'
    source_key=rotate(RED8)
    if args.variant=='direct':
        key=source_key; model='numeric'
    elif args.variant=='prime':
        key=rotate(prime_key); model='numeric'
    else:
        key=source_key; model='mapped'
    key_text=a.compact(key)
    assert len(key)==8 and any(key[j]!=key[j+4] for j in range(4))

    T=None; pi=None; k=None
    if args.plant=='original':
        assert not args.corrupt
        C=s.words(a.TERMINAL_BODY)
        H=s.words(a.TERMINAL_HOLDOUT)
    else:
        plant=int(args.plant)
        pl=term['plants'][plant]
        T=s.words(pl['truth'])
        pi=list(pl['pi'])
        if model=='mapped':
            scale=pow(pi[1],-1,29)
            pi=[(x*scale)%29 for x in pi]
            k=[pi[x] for x in key]
        else:
            k=list(key)
        rng=random.Random([7213301,7212014][plant]+{'direct':0,'prime':100,'mapped':200}[args.variant])
        phases=[rng.randrange(8) for _ in T]
        C=encrypt_all(T,pi,k,phases)
        assert all(t in s.decode(c,pi,k,D) for t,c in zip(T,C))
        if args.corrupt:
            rng=random.Random(2713001+plant+{'direct':0,'prime':100,'mapped':200}[args.variant])
            bad=sorted(range(48),key=lambda j:(-len(C[j]),j))[:args.oov]
            for g in bad:
                while True:
                    w=tuple(rng.randrange(29) for _ in T[g])
                    cipher=s.encode(w,pi,k,phases[g])
                    if not s.decode(cipher,pi,k,D):
                        T[g]=w; C[g]=cipher; break
        assert len(C)==len(T)==65
        assert sum(map(len,C[:48]))==223 and sum(map(len,C[48:]))==76

    assert len(C)>=48 and sum(map(len,C[:48]))==223
    if args.plant=='original':
        assert len(C)==48 and len(H)==17 and sum(map(len,H))==76

    with tempfile.TemporaryDirectory() as tmp:
        inp=pathlib.Path(tmp)/'input.txt'
        keyfile=pathlib.Path(tmp)/'keys.txt'
        exe=pathlib.Path(tmp)/'solver'
        a.write_input(inp,C[:48],D)
        keyfile.write_text(key_text+'\n')
        cpp='lp2_shared_gp29_q8_numeric_pool.cpp' if model=='numeric' else 'lp2_shared_gp29_q8_affine_oov.cpp'
        flags=['-O3','-fopenmp','-std=c++17']+(['-mavx2'] if model=='mapped' else [])
        subprocess.run([args.compiler,*flags,str(ROOT/'sims'/cpp),'-o',str(exe)],check=True)
        if model=='numeric':
            cmd=[str(exe),str(inp),str(keyfile),str(args.seconds),str(args.threads),
                 str(args.oov),str(args.shard),str(args.shards)]
        else:
            cmd=[str(exe),str(inp),str(args.seconds),str(args.threads),
                 str(args.shard),str(args.shards),'info',str(args.oov),str(keyfile)]
        run=subprocess.run(cmd,check=True,text=True,capture_output=True)
        print(run.stdout,end='')

    m=re.search(r'^KEY pi (.*)$',run.stdout,re.M)
    n=re.search(r'^KEY k (.*)$',run.stdout,re.M)
    if not (m and n):
        print(json.dumps({'status':'no candidate returned','variant':args.variant,
                          'plant':args.plant,'key':key_text,'oov_budget':args.oov},indent=2))
        return
    pp=list(map(int,m[1].split())); kk=list(map(int,n[1].split()))
    dec=[s.decode(c,pp,kk,D) for c in C]
    out={'status':'candidate returned','variant':args.variant,'model':model,
         'plant':args.plant,'key':key_text,'training_groups':48,'training_runes':223,
         'oov_budget':args.oov,'training_supported':sum(map(bool,dec[:48])),
         'training_unique':sum(len(x)==1 for x in dec[:48]),
         'training_oov':sum(not x for x in dec[:48]),'pi':pp,'k':kk}
    if T is not None:
        out.update(exact_action=s.same_action(pp,kk,pi,k),
                   training_truth=sum(T[i] in dec[i] for i in range(48)),
                   holdout_truth=sum(T[i] in dec[i] for i in range(48,65)),
                   holdout_unique=sum(dec[i]=={T[i]} for i in range(48,65)),
                   holdout_supported=sum(bool(dec[i]) for i in range(48,65)))
    else:
        hd=[s.decode(c,pp,kk,D) for c in H]
        out.update(body_omitted=sum(not x for x in dec[:48]),
                   p55_supported=sum(bool(x) for x in hd),
                   p55_unique=sum(len(x)==1 for x in hd),
                   body_unique_words=[a.compact(next(iter(x))) if len(x)==1 else None for x in dec[:48]],
                   p55_unique_words=[a.compact(next(iter(x))) if len(x)==1 else None for x in hd])
    print(json.dumps(out,indent=2))

if __name__=='__main__':
    main()
