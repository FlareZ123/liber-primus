"""Phase-zero self-encrypting eight-rune heading, mapped-key q8.

Only the heading's equality pattern, the frozen register and body ciphertext
are exposed to the search. The giant red A is interpreted as literal, so is
excluded from key and training. The seam+p55 (17 groups) remain held out.
"""
import argparse,json,pathlib,random,re,subprocess,tempfile
import lp2_shared_gp29_q8_smt as s
import lp2_shared_gp29_q8_affine_sft as a
from lp2_shared_gp29_q8_source_pool_sft import encrypt

def pattern(w): return tuple(w.index(x) for x in w)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--plant',choices=['0','1','original'],default='0')
    p.add_argument('--seconds',type=int,default=600)
    p.add_argument('--threads',type=int,default=1)
    p.add_argument('--oov',type=int,choices=[0,3],default=0)
    p.add_argument('--shard',type=int,default=0)
    p.add_argument('--shards',type=int,default=1)
    p.add_argument('--compiler',default='g++')
    p.add_argument('--lex',type=pathlib.Path,default=a.ROOT/'resources/control/english_wordfreq_textblob.txt')
    args=p.parse_args()
    term=json.loads((a.RESULTS/'lp2-shared-gp29-q8-smt-fixtures.json').read_text())
    D=s.load_dictionary(args.lex,term['added'])
    assert len(D)==38938
    h=1469598103934665603
    for c in '\n'.join(sorted(map(a.compact,D))): h=((h^ord(c))*1099511628211)&((1<<64)-1)
    assert h==0xb39eeb2d0de511c4
    orig=s.words(a.TERMINAL_ORIGINAL)
    assert orig[:2]==s.words('o jlnr2eaj')
    title=orig[1]
    pool=sorted(w for w in D if len(w)==8 and 0 not in w and pattern(w)==pattern(title))
    assert len(pool)==86
    T=None; n=47
    if args.plant=='original':
        C=orig[2:]
    else:
        i=int(args.plant)
        pl=term['plants'][i]
        rng=random.Random([272601,272602][i])
        key=rng.choice(pool)
        pi=pl['pi']; k=[pi[x] for x in key]
        title=encrypt(key,pi,k,0)
        assert pattern(title)==pattern(key) and 0 not in title
        T=s.words(pl['truth'])[2:]
        phases=[rng.randrange(8) for w in T]
        C=[encrypt(w,pi,k,j) for w,j in zip(T,phases)]
        assert all(w in s.decode(c,pi,k,D) for w,c in zip(T,C))
        idx=[]
        if args.oov:
            rng=random.Random([272611,272612][i])
            idx=sorted((g for g in range(n) if len(C[g])>=8 and 0 not in C[g]),key=lambda j:(-len(C[j]),j))[:3]
            assert len(idx)==3
            for g in idx:
                while True:
                    w=tuple(rng.randrange(1,29) for _ in T[g])
                    c=encrypt(w,pi,k,phases[g])
                    if 0 not in c and not s.decode(c,pi,k,D):break
                C[g]=c; T[g]=w
    print('title',a.compact(title),'candidate_titles',len(pool),'body_train',n,flush=True)
    with tempfile.TemporaryDirectory() as tmp:
        inp=pathlib.Path(tmp)/'input.txt'
        keys=pathlib.Path(tmp)/'keywords.txt'
        exe=pathlib.Path(tmp)/'solver'
        a.write_input(inp,C[:n],D)
        keys.write_text('\n'.join(map(a.compact,pool))+'\n')
        subprocess.run([args.compiler,'-O3','-mavx2','-fopenmp','-std=c++17',str(a.ROOT/'sims/lp2_shared_gp29_q8_affine_oov.cpp'),'-o',str(exe)],check=True)
        r=subprocess.run([str(exe),str(inp),str(args.seconds),str(args.threads),str(args.shard),str(args.shards),'info',str(args.oov),str(keys),a.compact(title)],check=True,text=True,capture_output=True)
        print(r.stdout,end='')
    pp=re.search(r'^KEY pi (.*)$',r.stdout,re.M)
    kk=re.search(r'^KEY k (.*)$',r.stdout,re.M)
    if pp and kk:
        pp=list(map(int,pp[1].split())); kk=list(map(int,kk[1].split()))
        candidate=tuple(pp.index(x) for x in kk)
        assert candidate in pool and encrypt(candidate,pp,kk,0)==title
        dec=[s.decode(c,pp,kk,D) for c in C]
        assert sum(not x for x in dec[:n])<=args.oov
        out={'pi':pp,'k':kk,'title':a.compact(candidate),'train_supported':sum(map(bool,dec[:n]))}
        if T is not None:
            out.update(exact=s.same_action(pp,kk,pi,k),true_title=a.compact(key),omitted=idx,
                       train_truth=sum(T[g] in dec[g] for g in range(n)),
                       holdout_truth=sum(T[g] in dec[g] for g in range(n,len(C))),
                       holdout_unique=sum(dec[g]=={T[g]} for g in range(n,len(C))))
        print(json.dumps(out,indent=2))

if __name__=='__main__': main()
