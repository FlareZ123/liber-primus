"""Exact q8 shared-cycle matched-profile control; no original ciphertext scored.
Requires Python 3 and z3-solver, or native libz3 on Linux.
"""
import argparse, ctypes as C, ctypes.util, json, re, time
from pathlib import Path
from functools import lru_cache
N,Q,B=29,8,3
S='0123456789abcdefghijklmnopqrs'
A='F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()

def register(raw):
    spell=dict(zip(A,S));spell['ING']=S[21]
    @lru_cache(None)
    def walk(s):
        if not s:return ('',)
        return tuple(spell[s[:n]]+w for n in range(1,min(3,len(s))+1) if s[:n] in spell for w in walk(s[n:]))
    words=set()
    for line in raw.splitlines():
        m=re.fullmatch(r'([a-z]+)\s+[0-9]+',line.strip())
        if m:
            s=m[1].upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')
            words.update(walk(s))
    by={n:sorted(w for w in words if len(w)==n) for n in set(map(len,words))}
    assert len(words)==38910,len(words)
    return words,by

class RNG:
    def __init__(self,seed):self.state=seed
    def __call__(self,n):
        s=self.state;s=(s^(s<<13))&0xffffffff;s^=s>>17;s=(s^(s<<5))&0xffffffff;self.state=s;return s%n

def inverse(c,pi,key):
    ip=[pi.index(v) for v in range(N)]
    def rec(i,j,p):
        if i==len(c):yield p;return
        x=S.index(c[i])
        if not x:yield from rec(i+1,j,p+'0')
        y=ip[(pi[x]-key[j])%N]
        if y:yield from rec(i+1,(j+1)%Q,p+S[y])
    return {p for j in range(Q) for p in rec(0,j,'')}

def plant(by,words,profile,seed,mode):
    rng=RNG(seed);lengths=list(map(len,profile['p54']['body_groups'][:47]));assert sum(lengths)==213
    if mode=='long':lengths=[18,18,17,16,16,16,15,15,15,15]+lengths[10:]
    order=sorted(range(47),key=lambda i:(-lengths[i],i));om=[order[0],order[-8]]
    truth=[by[n][rng(len(by[n]))] for n in lengths]
    def random_word(n):return ''.join(S[rng(N)] for _ in range(n))
    for i in om:
        while True:
            truth[i]=random_word(lengths[i])
            if truth[i] not in words:break
    prefix={w[:10] for w in by[11]}
    while True:
        carry=random_word(11)
        if carry[:10] not in prefix and carry not in words:break
    held=[by[len(w)][rng(len(by[len(w)]))] for w in profile['p55']['groups'][1:]]
    pi=list(range(N))
    for i in range(N-1,1,-1):
        j=1+rng(i);pi[i],pi[j]=pi[j],pi[i]
    key=[rng(N) for _ in range(Q)];key[0]=1;key[4]=2;key[3]=0
    ip=[pi.index(v) for v in range(N)]
    def encode(w,j):
        out=''
        for s in w:
            x=S.index(s)
            if not x:out+='0';continue
            out+=S[ip[(pi[x]+key[j])%N]];j=(j+1)%Q
        return out
    c=[encode(w,rng(Q)) for w in truth];cc=encode(carry,rng(Q));hc=[encode(w,rng(Q)) for w in held]
    miss=[i for i,w in enumerate(c) if not inverse(w,pi,key)&words];assert 0<len(miss)<=B
    return c,dict(pi=pi,key=key,truth=truth,miss=miss,om=om,carry=carry,cc=cc,held=held,hc=hc,old_prefix_support=bool(inverse(cc[:10],pi,key)&prefix))

def bv(n):return f'(_ bv{n} 5)'
def disj(xs):return '(or '+' '.join(xs)+')' if xs else 'false'
def conj(xs):return '(and '+' '.join(xs)+')' if xs else 'true'
def build(c,by):
    lines=['(set-logic QF_BV)'];p=[f'p{i}' for i in range(N)];k=[f'k{i}' for i in range(Q)]
    for x in p+k:lines.extend([f'(declare-const {x} (_ BitVec 5))',f'(assert (bvult {x} {bv(N)}))'])
    lines += ['(assert (= p0 '+bv(0)+'))','(assert (= k0 '+bv(1)+'))','(assert (distinct '+' '.join(p)+'))','(assert '+disj([f'(not (= k{i} k{i+4}))' for i in range(4)])+')']
    lines+=['(define-fun add29 ((a (_ BitVec 5)) (b (_ BitVec 5))) (_ BitVec 5) (let ((s (bvadd ((_ zero_extend 1) a) ((_ zero_extend 1) b)))) ((_ extract 4 0) (ite (bvuge s (_ bv29 6)) (bvsub s (_ bv29 6)) s))))']
    # One finite selector for the alphabet and one for the phase.
    def lookup(name,vals,bits):
        expr=vals[-1]
        for i in range(len(vals)-2,-1,-1):expr=f'(ite (= a (_ bv{i} {bits})) {vals[i]} {expr})'
        lines.append(f'(define-fun {name} ((a (_ BitVec {bits}))) (_ BitVec 5) {expr})')
    lookup('coord',p,5)
    # Share each inverse-map entry across every occurrence of its phase/cipher symbol.
    for x in range(N):
        vals=[f'm{j}_{x}' for j in range(Q)]
        for j,m in enumerate(vals):
            lines.extend([f'(declare-const {m} (_ BitVec 5))',f'(assert (bvult {m} {bv(N)}))',f'(assert (= p{x} (add29 (coord {m}) k{j})))'])
        lookup(f'dec{x}',vals,3)
    @lru_cache(None)
    def diagram(n,zero_positions):
        # Each interned node is the exact union of its labelled suffixes.
        nodes=[];intern={}
        def rec(ws,depth):
            if depth==n:return -1
            children={}
            for w in ws:children.setdefault(w[depth],[]).append(w)
            sig=(depth,tuple((S.index(x),rec(ww,depth+1)) for x,ww in sorted(children.items())))
            if sig not in intern:intern[sig]=len(nodes);nodes.append(sig)
            return intern[sig]
        root=rec([w for w in by[n] if all(x!="0" or i in zero_positions for i,x in enumerate(w))],0)
        return nodes,root
    sizes=[];edges=0
    for g,w in enumerate(c):
        n=len(w);nodes,root=diagram(n,tuple(i for i,x in enumerate(w) if x=="0"));sizes.append(len(nodes));edges+=sum(len(ch) for _,ch in nodes)
        ps=[f'w{g}_{i}' for i in range(n)];js=[f'j{g}_{i}' for i in range(n)]
        lines.append(f'(declare-const miss{g} Bool)')
        for i,x in enumerate(w):
            a,b=ps[i],js[i];lines.extend([f'(declare-const {a} (_ BitVec 5))',f'(declare-const {b} (_ BitVec 3))',f'(assert (bvult {a} {bv(N)}))'])
            hold=f'(= {a} {bv(0)})'
            consume=f'(= {a} (dec{S.index(x)} {b}))'
            cond=f'(ite {hold} {str(x=="0").lower()} {consume})'
            lines.append(f'(assert (or miss{g} {cond}))')
        for i in range(n-1):lines.append(f'(assert (= {js[i+1]} (ite (= {ps[i]} {bv(0)}) {js[i]} (bvadd {js[i]} (_ bv1 3)))))')
        for j,(depth,ch) in enumerate(nodes):
            name=f'd{g}_{j}'
            parts=[conj([f'(= {ps[depth]} {bv(x)})',f'd{g}_{child}' if child>=0 else 'true']) for x,child in ch]
            lines.extend([f'(declare-const {name} Bool)',f'(assert (=> {name} {disj(parts)}))'])
        lines.append(f'(assert (or miss{g} d{g}_{root}))')
    nums=[f'(ite miss{i} (_ bv1 6) (_ bv0 6))' for i in range(len(c))]
    lines.append('(assert (bvule (bvadd '+' '.join(nums)+f') (_ bv{B} 6)))')
    return '\n'.join(lines),sizes,edges

def solve(smt,timeout):
    try:
        import z3
        solver=z3.SolverFor('QF_BV');solver.set(timeout=timeout);solver.from_string(smt);r=solver.check()
        return str(r),str(solver.model()) if r==z3.sat else solver.reason_unknown() if r==z3.unknown else ''
    except ImportError:pass
    lib=C.CDLL(ctypes.util.find_library('z3') or 'libz3.so.4');P=C.c_void_p
    def api(name,restype,*argtypes):
        f=getattr(lib,'Z3_'+name);f.restype=restype;f.argtypes=argtypes;return f
    cfg=api('mk_config',P)();api('set_param_value',None,P,C.c_char_p,C.c_char_p)(cfg,b'timeout',str(timeout).encode())
    ctx=api('mk_context',P,P)(cfg);api('del_config',None,P)(cfg)
    try:
        sym=api('mk_string_symbol',P,P,C.c_char_p)(ctx,b'QF_BV')
        sol=api('mk_solver_for_logic',P,P,P)(ctx,sym);api('solver_inc_ref',None,P,P)(ctx,sol)
        api('solver_from_string',None,P,P,C.c_char_p)(ctx,sol,smt.encode())
        result=api('solver_check',C.c_int,P,P)(ctx,sol)
        if result==1:
            model=api('solver_get_model',P,P,P)(ctx,sol);s=api('model_to_string',C.c_char_p,P,P)(ctx,model).decode();return 'sat',s
        return ('unsat','') if result==-1 else ('unknown',api('solver_get_reason_unknown',C.c_char_p,P,P)(ctx,sol).decode())
    finally:api('del_context',None,P)(ctx)

def evaluate(model,t):
    def get(n):
        for pat,base in [(rf'\b{n}\s*->\s*#b([01]+)',2),(rf'\b{n}\s*=\s*(\d+)',10),(rf'\b{n}\s*->\s*#x([0-9a-f]+)',16)]:
            a=re.search(pat,model)
            if a:return int(a[1],base)
        raise ValueError('missing '+n+' '+model[:200])
    p=[get(f'p{i}') for i in range(N)];k=[get(f'k{i}') for i in range(Q)]
    def maps(p,k):return [[p.index((x-v)%N) for x in p] for v in k]
    m=maps(p,k);tm=maps(t['pi'],t['key']);eq=any(m==tm[r:]+tm[:r] for r in range(Q))
    return dict(pi=p,key=k,exact_action=eq,holdout_correct=sum(w in inverse(c,p,k) for c,w in zip(t['hc'],t['held'])),holdout_total=len(t['held']),carry_correct=t['carry'] in inverse(t['cc'],p,k))

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--register',type=Path,default=Path('resources/control/english_wordfreq_textblob.txt'));ap.add_argument('--profile',type=Path,default=Path('resources/liber-primus/lp2-page-groups-54-55-derived.json'));ap.add_argument('--timeout',type=int,default=60);ap.add_argument('--mode',choices=['long','matched'],default='matched');ap.add_argument('--seed',type=lambda s:int(s,0));ap.add_argument('--out',type=Path);ap.add_argument('--pin-truth',action='store_true');a=ap.parse_args()
    seed=a.seed if a.seed is not None else (0x71d56291 if a.mode=='long' else 0x59d2a638)
    words,by=register(a.register.read_text());c,t=plant(by,words,json.loads(a.profile.read_text()),seed,a.mode);start=time.monotonic();smt,counts,edges=build(c,by)
    if a.pin_truth:
        smt+='\n'+'\n'.join(f'(assert (= {name} {bv(value)}))' for name,value in zip([f'p{i}' for i in range(N)]+[f'k{i}' for i in range(Q)],t['pi']+t['key']))+'\n'+'\n'.join(f'(assert (= m{j}_{x} {bv(t["pi"].index((t["pi"][x]-t["key"][j])%N))}))' for j in range(Q) for x in range(N))
    report=dict(mode=a.mode,pin_truth=a.pin_truth,seed=seed,register=len(words),groups=len(c),runes=sum(map(len,c)),actual_miss=t['miss'],old_prefix_support=t['old_prefix_support'],mdd_nodes_per_group=counts,mdd_edges=edges,smt_bytes=len(smt),build_seconds=time.monotonic()-start)
    print(json.dumps(report),flush=True);start=time.monotonic();result,model=solve(smt,a.timeout*1000);report.update(status=result,solve_seconds=time.monotonic()-start)
    if result=='sat':report.update(evaluate(model,t))
    elif result=='unknown':report['reason']=model
    print(json.dumps(report,indent=2),flush=True)
    if a.out:a.out.write_text(json.dumps(report,indent=2)+'\n')
if __name__=='__main__':main()
