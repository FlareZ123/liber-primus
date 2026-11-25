"""Exact period-nine arbitrary GP29 phase-permutation F-hold inverse.
Requires Z3 shared library; set Z3_LIBRARY on Windows or if discovery fails.
Default source: checked-in LP2 corpus and solved native KOAN1.
"""
import argparse, ctypes as ct, ctypes.util, itertools, json, os, random, re, time
from pathlib import Path
ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZabc'
ROOT=Path(__file__).resolve().parents[1]
class Z3:
    def __init__(self):
        name=os.getenv('Z3_LIBRARY') or ctypes.util.find_library('z3')
        if not name: raise RuntimeError('Set Z3_LIBRARY to the Z3 shared library path')
        z=self.z=ct.CDLL(name)
        for n,rest,args in [('Z3_mk_config',ct.c_void_p,[]),('Z3_mk_context',ct.c_void_p,[ct.c_void_p]),('Z3_del_config',None,[ct.c_void_p]),('Z3_del_context',None,[ct.c_void_p]),('Z3_eval_smtlib2_string',ct.c_char_p,[ct.c_void_p,ct.c_char_p])]:
            fn=getattr(z,n);fn.restype=rest;fn.argtypes=args
        cfg=z.Z3_mk_config();self.ctx=z.Z3_mk_context(cfg);z.Z3_del_config(cfg)
    def __enter__(self):return self
    def __exit__(self,*a):self.z.Z3_del_context(self.ctx)
    def query(self,s):return self.z.Z3_eval_smtlib2_string(self.ctx,s.encode()).decode().strip()
def segments(C,q):
    out=[];h=[set() for _ in range(q)];n=0
    for c in C:
        if c==0:out.append((n,h,True));h=[set() for _ in range(q)];n=0
        else:h[n%q].add(c);n+=1
    out.append((n,h,False));return out
def build(C,q,timeout):
    assert q>=2
    seg=segments(C,q);s=['(set-option :timeout %d)'%timeout,'(set-logic QF_BV)']
    def clause(*xs):s.append('(assert '+(xs[0] if len(xs)==1 else '(or '+' '.join(xs)+')')+')')
    def neg(x):return '(not '+x+')'
    def one(names):
        for x in names:s.append(f'(declare-const {x} Bool)')
        clause(*names)
        for a,b in itertools.combinations(names,2):clause(neg(a),neg(b))
    f=[[f'f{j}_{c}' for c in range(29)] for j in range(q)];x=[[f'x{t}_{j}' for j in range(q)] for t in range(len(seg))];b=[f'b{t}' for t in range(len(seg)-1)]
    for row in f+x:one(row)
    for v in b:s.append(f'(declare-const {v} Bool)')
    clause(x[0][0])
    for t,(n,h,end) in enumerate(seg):
        for p in range(q):
            a=neg(x[t][p])
            for j,bs in enumerate(h):
                for c in sorted(bs):clause(a,neg(f[(p+j)%q][c]))
            if end:
                e=(p+n)%q
                clause(a,b[t],x[t+1][e]);clause(a,neg(b[t]),x[t+1][(e+1)%q]);clause(a,neg(b[t]),neg(f[e][0]))
    return '\n'.join(s),f
def feasible(C,f):
    q=len(f);states={0}
    for c in C:
        states={p for p in states if c==0}|{(p+1)%q for p in states if c!=f[p]}
        if not states:return False
    return True
def enumerate_vectors(C,q,timeout):
    s,f=build(C,q,timeout);vectors=[];ts=time.monotonic()
    with Z3() as z:
        z.query(s)
        while True:
            r=z.query('(check-sat)')
            if r=='unsat':break
            if r!='sat':raise RuntimeError('Incomplete SAT enumeration: '+r)
            ans=z.query('(get-value ('+' '.join(v for row in f for v in row)+'))')
            a=[None]*q
            for j,c in re.findall(r'\(f(\d+)_(\d+) true\)',ans):a[int(j)]=int(c)
            assert None not in a and feasible(C,a) and a not in vectors
            vectors.append(a)
            z.query('(assert (or '+' '.join(f'(not {f[j][c]})' for j,c in enumerate(a))+'))')
    return sorted(vectors),time.monotonic()-ts
def all_paths(C,f):
    q=len(f);n=len(C);live=[[False]*q for _ in range(n+1)];live[n]=[True]*q
    for i in range(n-1,-1,-1):
        c=C[i]
        for j in range(q):live[i][j]=(c==0 and live[i+1][j]) or (c!=f[j] and live[i+1][(j+1)%q])
    if not live[0][0]:return []
    paths=[(0,[])]
    for i,c in enumerate(C):
        nxt=[]
        for j,mask in paths:
            if c==0 and live[i+1][j]:nxt.append((j,mask))
            if c!=f[j] and live[i+1][(j+1)%q]:nxt.append(((j+1)%q,mask+[i] if c==0 else mask))
        paths=nxt
    return [m for j,m in paths]
def bounds(C,f,consumed):
    q=len(f);n=len(C);h=[[0]*29 for _ in range(q)];j=0;held=0;consume=set(consumed)
    for i,c in enumerate(C):
        if c==0 and i not in consume:held+=1;continue
        assert c!=f[j];h[j][c]+=1;j=(j+1)%q
    order=[sorted((c for c in range(29) if c!=f[j]),key=lambda c:(-h[j][c],c)) for j in range(q)]
    aligned=[sum(h[j][order[j][i]] for j in range(q)) for i in range(28)]
    ps=[18]+[p for p in range(1,29) if p!=18];key=[]
    for j in range(q):
        row=[None]*29;row[0]=f[j]
        for p,c in zip(ps,order[j]):row[p]=c
        assert sorted(row)==list(range(29));key.append(row)
    P=[];j=0
    for i,c in enumerate(C):
        if c==0 and i not in consume:P.append(0)
        else:P.append(key[j].index(c));j=(j+1)%q
    assert encrypt(P,key)==C and P.count(18)==aligned[0] and P.count(0)==held
    ioc=(held*(held-1)+sum(x*(x-1) for x in aligned))/(n*(n-1))
    return {'F_images':f,'consumed_positions':consumed,'F_count':held,'largest_nonF_count':aligned[0],'ioc':ioc,'max_ioc_hist':[held]+aligned,'permutations':key}
def encrypt(P,key):
    C=[];j=0
    for p in P:
        if p==0:C.append(0)
        else:C.append(key[j][p]);j=(j+1)%len(key)
    return C
def fixed_check(C,f,timeout):
    s,vars=build(C,len(f),timeout)
    with Z3() as z:
        z.query(s+'\n'+'\n'.join(f'(assert {vars[j][c]})' for j,c in enumerate(f)))
        return z.query('(check-sat)')
def fnv64(C):
    h=14695981039346656037
    for c in C:h=((h^c)*1099511628211)&((1<<64)-1)
    return f'{h:016x}'
def read_inputs(a):
    if a.encoded_tape:
        return [ABC.index(c) for c in Path(a.encoded_tape).read_text().strip()],[ABC.index(c) for c in Path(a.encoded_control).read_text().strip()][:716]
    c=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
    d=json.loads((ROOT/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf8'))
    ix={v:i for i,v in enumerate(c['runes'])};C=[x for p in c['pages'] if 40<=p['page']<=55 for x in p['indices']]
    P=[ix[x] for x in next(s['source_text'] for s in d['sections'] if s['name']=='0_koan_1') if x in ix][:716]
    return C,P
def main():
    a=argparse.ArgumentParser();a.add_argument('--encoded-tape');a.add_argument('--encoded-control');a.add_argument('--timeout-ms',type=int,default=60000);args=a.parse_args()
    C,P=read_inputs(args);assert len(C)==3316 and C.count(0)==131 and fnv64(C)=='be6c056ed7b1bd0a' and len(P)==716
    q=9;vectors,elapsed=enumerate_vectors(C,q,args.timeout_ms);rows=[];counts=[]
    for f in vectors:
        ps=all_paths(C,f);counts.append({'F_images':f,'paths':len(ps)});rows.extend(bounds(C,f,m) for m in ps)
    assert len(vectors)==5 and len(rows)==35
    rng=random.Random(3301);key=[rng.sample(range(29),29) for _ in range(q)]
    Q=encrypt(P,key);f=[k[0] for k in key];assert fixed_check(Q,f,args.timeout_ms)=='sat'
    m=[i for i,(p,c) in enumerate(zip(P,Q)) if p!=0 and c==0];plant=bounds(Q,f,m);assert plant['largest_nonF_count']>=max(P.count(p) for p in range(1,29))
    rng=random.Random(441);toy=[]
    for k in range(20):
        q0=rng.randint(2,4);ctape=[rng.choice([0,0,1,2,3,4]) for _ in range(12)];fv=[rng.randrange(5) for _ in range(q0)];v=feasible(ctape,fv);rr=fixed_check(ctape,fv,args.timeout_ms);assert rr==('sat' if v else 'unsat');toy.append(v)
    out={'source_fnv64':fnv64(C),'runes':len(C),'q':q,'enumeration_seconds':elapsed,'vectors':counts,'histories':len(rows),'max_nonF':max(r['largest_nonF_count'] for r in rows),'max_ioc':max(r['ioc'] for r in rows),'min_F':min(r['F_count'] for r in rows),'max_F':max(r['F_count'] for r in rows),'max_nonF_witness':max(rows,key=lambda r:r['largest_nonF_count']),'max_ioc_witness':max(rows,key=lambda r:r['ioc']),'histories_detail':[{k:v for k,v in r.items() if k!='permutations'} for r in rows],'plant':{'F_images':f,'runes':len(P),'F_count':P.count(0),'cipher_F_count':Q.count(0),'true_max_nonF':max(P.count(p) for p in range(1,29)),'aligned_max_nonF':plant['largest_nonF_count'],'aligned_ioc':plant['ioc']},'toy_fixed_sat':sum(toy),'toy_fixed_unsat':len(toy)-sum(toy)}
    print(json.dumps(out,indent=2))
if __name__=='__main__':main()
