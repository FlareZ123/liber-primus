"""Run the GF29 affine solver from frozen blind or original anchor fixtures.

Build with g++ -O3 -mavx2 -fopenmp -std=c++17 (x86 AVX2).
The subprocess gets only ciphertext and dictionary domains. Keys and
holdouts are used only for scoring after the solver returns.
"""
import argparse, collections, json, pathlib, subprocess, tempfile, re
import lp2_shared_gp29_q8_smt as s

ROOT=pathlib.Path(__file__).resolve().parents[1]
RESULTS=ROOT/'im-results'
PAGE_GROUPS=json.loads((ROOT/'resources/liber-primus/lp2-page-groups-54-55-derived.json').read_text())
TERMINAL_ORIGINAL=' '.join(PAGE_GROUPS['p54']['all_visual_groups'])
TERMINAL_BODY=' '.join(PAGE_GROUPS['p54']['body_groups'])
TERMINAL_HOLDOUT=' '.join(PAGE_GROUPS['p55']['groups'])

def compact(w): return ''.join(s.SYM[x] for x in w)

def write_input(path,C,D):
    by=collections.defaultdict(list)
    for w in sorted(D): by[len(w)].append(w)
    with open(path,'w',encoding='ascii') as f:
        print(len(C),file=f)
        for c in C:
            domain=[w for w in by[len(c)] if s.candidate(w,c)]
            print(compact(c),len(domain),file=f)
            for w in domain: print(compact(w),file=f)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--profile',choices=['terminal','long'],default='long')
    p.add_argument('--plant',choices=['0','1','original'],default='0')
    p.add_argument('--seconds',type=int,default=180)
    p.add_argument('--threads',type=int,default=1)
    p.add_argument('--shard',type=int,default=0)
    p.add_argument('--shards',type=int,default=1)
    p.add_argument('--lex',type=pathlib.Path,default=ROOT/'resources/control/english_wordfreq_textblob.txt')
    p.add_argument('--compiler',default='g++')
    p.add_argument('--input-only',type=pathlib.Path)
    a=p.parse_args()
    term=json.loads((RESULTS/'lp2-shared-gp29-q8-terminal-corrected-fixtures.json').read_text())
    long=json.loads((RESULTS/'lp2-shared-gp29-q8-affine-long-fixtures.json').read_text())
    D=s.load_dictionary(a.lex,term['added'])
    assert len(D)==38938
    h=1469598103934665603
    for c in '\n'.join(sorted(map(compact,D))): h=((h^ord(c))*1099511628211)&((1<<64)-1)
    assert h==0xb39eeb2d0de511c4,hex(h)
    f,n=(term,48) if a.profile=='terminal' else (long,24)
    pl=None if a.plant=='original' else f['plants'][int(a.plant)]
    C=s.words((TERMINAL_BODY if a.profile=='terminal' else long['originalTrain']) if pl is None else pl['cipher'])
    assert len(C)>=n and sum(map(len,C[:n]))==(223 if n==48 else 261)
    if a.profile=='terminal' and pl is not None:
        assert len(C)==65 and sum(map(len,C[48:]))==76
    if a.input_only:
        write_input(a.input_only,C[:n],D)
        return
    with tempfile.TemporaryDirectory() as tmp:
        inp=pathlib.Path(tmp)/'input.txt'
        exe=pathlib.Path(tmp)/'solver'
        write_input(inp,C[:n],D)
        subprocess.run([a.compiler,'-O3','-mavx2','-fopenmp','-std=c++17',str(ROOT/'sims/lp2_shared_gp29_q8_affine.cpp'),'-o',str(exe)],check=True)
        r=subprocess.run([str(exe),str(inp),str(a.seconds),str(a.threads),str(a.shard),str(a.shards),'info'],check=True,text=True,capture_output=True)
        print(r.stdout,end='')
    pi=re.search(r'^KEY pi (.*)$',r.stdout,re.M)
    k=re.search(r'^KEY k (.*)$',r.stdout,re.M)
    if pi and k:
        pi=list(map(int,pi[1].split()));k=list(map(int,k[1].split()))
        decoded=[s.decode(c,pi,k,D) for c in C]
        assert all(decoded[:n])
        out={'training_supported':sum(map(bool,decoded[:n])),'pi':pi,'k':k}
        if pl:
            T=s.words(pl['truth'])
            out.update(exact=s.same_action(pi,k,pl['pi'],pl['k']),
                       train_truth=sum(T[i] in decoded[i] for i in range(n)),
                       holdout_truth=sum(T[i] in decoded[i] for i in range(n,len(C))),
                       holdout_unique=sum(decoded[i]=={T[i]} for i in range(n,len(C))))
        print(json.dumps(out,indent=2))

if __name__=='__main__':main()
