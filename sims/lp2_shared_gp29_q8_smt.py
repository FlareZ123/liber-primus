"""Exact QF_BV common-cycle q8 receiver; Python 3 + shared libz3.

python sims/lp2_shared_gp29_q8_smt.py --plant 0 --ms 90000
python sims/lp2_shared_gp29_q8_smt.py --plant 1 --ms 90000
python sims/lp2_shared_gp29_q8_smt.py --plant 0 --oracle --ms 30000

The receiver's model receives only 48 encrypted training groups and a fixed
lexicon. Oracle mode supplies the key solely for an implementation control.
The separately frozen 17 groups are decoded after the SAT check.
"""
import argparse, ctypes, ctypes.util, json, pathlib, re, time, collections, functools

ROOT = pathlib.Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json'
ALPHA = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
A = {v:i for i,v in enumerate(ALPHA)}
SYM = '0123456789abcdefghijklmnopqrs'

def words(s):
    return [tuple(SYM.index(x) for x in w) for w in s.split()]

def variants(s):
    s=s.upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')
    @functools.lru_cache(None)
    def rec(i):
        if i==len(s): return ((),)
        out=[]
        for n in range(1,4):
            t=s[i:i+n]
            if len(t)!=n: continue
            v=A.get(t) if n!=3 else A['NG'] if t=='ING' else None
            if v is not None: out.extend((v,)+w for w in rec(i+n))
        return tuple(out)
    return rec(0)

def load_dictionary(p, additions):
    s=pathlib.Path(p).read_text(encoding='utf-8')
    D={w for m in re.finditer(r'^([a-z]+)\s+(\d+)$',s,re.M) for w in variants(m[1])}
    print('base',len(D),flush=True)
    assert len(D)==38910
    D.update(words(additions))
    return D

def candidate(w,c):
    # Clock offset relative to unknown word start. Every phase is a
    # bijection and a nonzero translation has no fixed points.
    j=0; maps=[{} for _ in range(8)]; rev=[{} for _ in range(8)]; fixed=[None]*8
    for p,x in zip(w,c):
        if p==0:
            if x!=0: return False
            continue
        same=p==x
        if (p in maps[j] and maps[j][p]!=x) or (x in rev[j] and rev[j][x]!=p) or (fixed[j] is not None and fixed[j]!=same): return False
        maps[j][p]=x;rev[j][x]=p;fixed[j]=same;j=(j+1)%8
    return True

def encode(w,pi,k,start):
    inv=[pi.index(x) for x in range(29)]; c=[];j=start
    for p in w:
        if p==0:c.append(0)
        else:
            c.append(inv[(pi[p]+k[j])%29]);j=(j+1)%8
    return tuple(c)

def decode(c,pi,k,D):
    inv=[pi.index(x) for x in range(29)];result=set()
    def walk(i,j,w,start):
        if i==len(c):
            if w in D:
                assert encode(w,pi,k,start)==c
                result.add(w)
            return
        if c[i]==0: walk(i+1,j,w+(0,),start)
        p=inv[(pi[c[i]]-k[j])%29]
        if p: walk(i+1,(j+1)%8,w+(p,),start)
    for start in range(8): walk(0,start,(),start)
    return result

def same_action(pi,k,p,q):
    def m(pi,k):
        inv=[pi.index(x) for x in range(29)]
        return [[inv[(pi[c]-v)%29] for c in range(29)] for v in k]
    x,y=m(pi,k),m(p,q)
    return any(x==y[j:]+y[:j] for j in range(8))

def bv(x,n=5): return f'(_ bv{x} {n})'
def OR(xs):
    xs=list(xs); return 'false' if not xs else xs[0] if len(xs)==1 else '(or '+' '.join(xs)+')'
def AND(xs):
    xs=list(xs);return 'true' if not xs else xs[0] if len(xs)==1 else '(and '+' '.join(xs)+')'
def eq(a,b):return f'(= {a} {b})'

def model(C,D,timeout,oracle=None):
    out=['(set-logic QF_BV)',f'(set-option :timeout {timeout})','(set-option :produce-models true)']; emit=out.append
    def decl(x,n):emit(f'(declare-fun {x} () (_ BitVec {n}))')
    def assertion(x):emit(f'(assert {x})')
    P=[f'a{i}' for i in range(29)];K=[f'k{i}' for i in range(8)]
    for x in P+K:
        decl(x,5);assertion(f'(bvult {x} {bv(29)})')
    assertion(eq(P[0],bv(0)));assertion('(distinct '+' '.join(P)+')');assertion(eq(K[0],bv(1)))
    assertion(OR(f'(distinct {K[i]} {K[i+4]})' for i in range(4)))
    # Five-bit wrap implements exact modular subtraction on [0,28].
    emit(f'(define-fun sub29 ((a (_ BitVec 5)) (b (_ BitVec 5))) (_ BitVec 5) (ite (bvuge a b) (bvsub a b) (bvadd (bvsub a b) {bv(29)})))')
    at=K[-1]
    for i in reversed(range(7)):at=f'(ite (= j {bv(i,3)}) {K[i]} {at})'
    emit(f'(define-fun shift ((j (_ BitVec 3))) (_ BitVec 5) {at})')
    by=collections.defaultdict(list)
    for w in sorted(D):by[len(w)].append(w)
    counts=[]
    for g,c in enumerate(C):
        j=f'j{g}_0';decl(j,3);R=[]
        for i,x in enumerate(c):
            r=f'r{g}_{i}';decl(r,5);R.append(r)
            a=f'(sub29 {P[x]} (shift {j}))';nz=f'(distinct {r} {bv(0)})'
            if x:assertion(AND([nz,eq(r,a)]))
            else:assertion(OR([eq(r,bv(0)),AND([nz,eq(r,a)])]))
            if i<len(c)-1:
                advance=f'(bvadd {j} {bv(1,3)})'
                if x:j=advance
                else:
                    j2=f'j{g}_{i+1}';decl(j2,3)
                    assertion(eq(j2,f'(ite (= {r} {bv(0)}) {j} {advance})'));j=j2
        allowed=[w for w in by[len(c)] if candidate(w,c)]
        counts.append(len(allowed))
        # Exact dictionary membership, prefix trie, no frequency cutoff.
        def trie(ws,i):
            if not ws:return 'false'
            if i==len(c):return 'true'
            groups=collections.defaultdict(list)
            for w in ws:groups[w[i]].append(w)
            return OR(AND([eq(R[i],P[x]),trie(sub,i+1)]) for x,sub in sorted(groups.items()))
        assertion(trie(allowed,0))
    if oracle:
        for x,v in zip(P+K,oracle[0]+oracle[1]):assertion(eq(x,bv(v)))
    emit('(check-sat)')
    return '\n'.join(out)+'\n',counts,P+K

def run_z3(src,names):
    lib=ctypes.CDLL(ctypes.util.find_library('z3') or 'libz3.so.4');ptr=ctypes.c_void_p
    lib.Z3_mk_config.restype=ptr;lib.Z3_mk_context.argtypes=[ptr];lib.Z3_mk_context.restype=ptr
    lib.Z3_del_config.argtypes=[ptr];lib.Z3_del_context.argtypes=[ptr]
    lib.Z3_eval_smtlib2_string.argtypes=[ptr,ctypes.c_char_p];lib.Z3_eval_smtlib2_string.restype=ctypes.c_char_p
    cfg=lib.Z3_mk_config();ctx=lib.Z3_mk_context(cfg);lib.Z3_del_config(cfg)
    t=time.monotonic();r=lib.Z3_eval_smtlib2_string(ctx,src.encode()).decode();duration=time.monotonic()-t
    print('result',r.strip(),'seconds',round(duration,3),flush=True)
    vals=None
    if r.strip()=='sat':
        s=lib.Z3_eval_smtlib2_string(ctx,('(get-value ('+' '.join(names)+'))').encode()).decode()
        pairs=re.findall(r'\((\w+) (#b[01]+|#x[0-9a-f]+)\)',s);tab={n:int(v[2:],2 if v[1]=='b' else 16) for n,v in pairs}
        vals=[tab[n] for n in names]
    elif r.strip()=='unknown':
        print(lib.Z3_eval_smtlib2_string(ctx,b'(get-info :reason-unknown)').decode(),flush=True)
    lib.Z3_del_context(ctx)
    return r.strip(),duration,vals

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--lex',default=ROOT/'resources/control/english_wordfreq_textblob.txt')
    ap.add_argument('--plant',type=int,choices=[0,1],default=0)
    ap.add_argument('--ms',type=int,default=90000);ap.add_argument('--oracle',action='store_true')
    ap.add_argument('--write');a=ap.parse_args()
    fixture=json.loads(FIXTURE.read_text(encoding='utf-8'))
    D=load_dictionary(a.lex,fixture['added']);assert len(D)==38938,len(D)
    pl=fixture['plants'][a.plant];C=words(pl['cipher']);T=words(pl['truth'])
    assert len(C)==len(T)==65 and sum(map(len,C[:48]))==223 and sum(map(len,C[48:]))==76 and sum(map(len,C))==299
    assert all(t in D for t in T)
    assert all(encode(t,pl['pi'],pl['k'],p)==c for t,c,p in zip(T,C,pl['phases']))
    assert all(t in decode(c,pl['pi'],pl['k'],D) for t,c in zip(T,C))
    print('dictionary',len(D),'training',48,'holdout',17,'plant',a.plant,'oracle',a.oracle,flush=True)
    src,counts,names=model(C[:48],D,a.ms,(pl['pi'],pl['k']) if a.oracle else None)
    print('domains',counts,'total',sum(counts),'SMT bytes',len(src),flush=True)
    if a.write:pathlib.Path(a.write).write_text(src)
    stat,secs,v=run_z3(src,names)
    result={'status':stat,'seconds':secs,'domains':counts,'plant':a.plant,'oracle':a.oracle,'dictionary':len(D)}
    if v:
        pi,k=v[:29],v[29:]
        decoded=[decode(c,pi,k,D) for c in C];assert all(decoded[i] for i in range(48))
        result.update(pi=pi,k=k,exact=same_action(pi,k,pl['pi'],pl['k']),
            train_truth=sum(T[i] in decoded[i] for i in range(48)),
            holdout_truth=sum(T[i] in decoded[i] for i in range(48,65)),
            holdout_unique=sum(decoded[i]=={T[i]} for i in range(48,65)),
            holdout_supported=sum(bool(d) for d in decoded[48:]))
    print(json.dumps(result),flush=True)

if __name__=='__main__':main()
