"""Incremental exact GP29 q8 lexical constraint generation on synthetic controls.
The dictionary oracle returns sound minimal-conflict clauses, not plaintext scores.
"""
from q8_smt import *
from itertools import combinations

def base(c,by):
    lines=['(set-logic QF_BV)'];p=[f'p{i}' for i in range(N)];k=[f'k{i}' for i in range(Q)]
    for x in p+k:lines.extend([f'(declare-const {x} (_ BitVec 5))',f'(assert (bvult {x} {bv(N)}))'])
    lines += ['(assert (= p0 '+bv(0)+'))','(assert (= k0 '+bv(1)+'))','(assert (distinct '+' '.join(p)+'))','(assert '+disj([f'(not (= k{i} k{i+4}))' for i in range(4)])+')']
    lines+=['(define-fun add29 ((a (_ BitVec 5)) (b (_ BitVec 5))) (_ BitVec 5) (let ((s (bvadd ((_ zero_extend 1) a) ((_ zero_extend 1) b)))) ((_ extract 4 0) (ite (bvuge s (_ bv29 6)) (bvsub s (_ bv29 6)) s))))']
    def lookup(name,vals,bits):
        expr=vals[-1]
        for i in range(len(vals)-2,-1,-1):expr=f'(ite (= a (_ bv{i} {bits})) {vals[i]} {expr})'
        lines.append(f'(define-fun {name} ((a (_ BitVec {bits}))) (_ BitVec 5) {expr})')
    lookup('coord',p,5)
    for x in range(N):
        vals=[f'm{j}_{x}' for j in range(Q)]
        for j,m in enumerate(vals):
            lines.extend([f'(declare-const {m} (_ BitVec 5))',f'(assert (bvult {m} {bv(N)}))',f'(assert (= p{x} (add29 (coord {m}) k{j})))'])
        lookup(f'dec{x}',vals,3)
    variables=[];ds=[]
    for g,w in enumerate(c):
        n=len(w);ps=[f'w{g}_{i}' for i in range(n)];js=[f'j{g}_{i}' for i in range(n)];variables.append(ps)
        lines.append(f'(declare-const miss{g} Bool)')
        valid=[v for v in by[n] if all(y!='0' or x=='0' for x,y in zip(w,v))]
        masks=[[0]*N for _ in w]
        for idx,v in enumerate(valid):
            for i,x in enumerate(v):masks[i][S.index(x)]|=1<<idx
        ds.append((set(valid),masks,(1<<len(valid))-1))
        for i,x in enumerate(w):
            a,b=ps[i],js[i];lines.extend([f'(declare-const {a} (_ BitVec 5))',f'(declare-const {b} (_ BitVec 3))',f'(assert (bvult {a} {bv(N)}))'])
            hold=f'(= {a} {bv(0)})';consume=f'(= {a} (dec{S.index(x)} {b}))';cond=f'(ite {hold} {str(x=="0").lower()} {consume})'
            lines.append(f'(assert (or miss{g} {cond}))')
            lines.append(f'(assert (or miss{g} {disj([f"(= {a} {bv(v)})" for v,m in enumerate(masks[i]) if m])}))')
        for i in range(n-1):lines.append(f'(assert (= {js[i+1]} (ite (= {ps[i]} {bv(0)}) {js[i]} (bvadd {js[i]} (_ bv1 3)))))')
    nums=[f'(ite miss{i} (_ bv1 6) (_ bv0 6))' for i in range(len(c))]
    lines.append('(assert (bvule (bvadd '+' '.join(nums)+f') (_ bv{B} 6)))')
    return '\n'.join(lines),variables,ds

def conflicts(g,vals,ps,masks,full):
    # Find inclusion-minimal conflicting coordinate set, prioritizing rare values.
    order=sorted(range(len(vals)),key=lambda i:masks[i][vals[i]].bit_count())
    def intersection(ix):
        z=full
        for i in ix:z&=masks[i][vals[i]]
        return z
    chosen=[];m=full
    for i in order:
        chosen.append(i);m&=masks[i][vals[i]]
        if not m:break
    assert not m
    for i in chosen[:]:
        trial=[j for j in chosen if j!=i]
        if not intersection(trial):chosen=trial
    out=[]
    for pivot in chosen:
        others=[i for i in chosen if i!=pivot];z=intersection(others)
        allowed=[f'(= {ps[pivot]} {bv(v)})' for v in range(N) if z&masks[pivot][v]]
        assert allowed and vals[pivot] not in [v for v in range(N) if z&masks[pivot][v]]
        out.append('(assert '+disj([f'miss{g}']+[f'(not (= {ps[i]} {bv(vals[i])}))' for i in others]+allowed)+')')
    return out,len(chosen)

class Context:
    def __init__(self):
        lib=C.CDLL(ctypes.util.find_library('z3') or 'libz3.so.4');P=C.c_void_p
        def api(name,restype,*argtypes):
            f=getattr(lib,'Z3_'+name);f.restype=restype;f.argtypes=argtypes;return f
        cfg=api('mk_config',P)();self.ctx=api('mk_context',P,P)(cfg);api('del_config',None,P)(cfg)
        self.eval_fn=api('eval_smtlib2_string',C.c_char_p,P,C.c_char_p);self.del_fn=api('del_context',None,P)
    def run(self,s):return self.eval_fn(self.ctx,s.encode()).decode()
    def close(self):self.del_fn(self.ctx)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--register',type=Path,default=Path('resources/control/english_wordfreq_textblob.txt'));ap.add_argument('--profile',type=Path,default=Path('resources/liber-primus/lp2-page-groups-54-55-derived.json'));ap.add_argument('--timeout',type=int,default=60);ap.add_argument('--seed',type=lambda s:int(s,0),default=0x59d2a638);ap.add_argument('--out',type=Path);ap.add_argument('--pin-truth',action='store_true');a=ap.parse_args()
    words,by=register(a.register.read_text());c,t=plant(by,words,json.loads(a.profile.read_text()),a.seed,'matched');smt,variables,ds=base(c,by)
    if a.pin_truth:
        smt+='\n'+'\n'.join(f'(assert (= {name} {bv(value)}))' for name,value in zip([f'p{i}' for i in range(N)]+[f'k{i}' for i in range(Q)],t['pi']+t['key']))+'\n'+'\n'.join(f'(assert (= m{j}_{x} {bv(t["pi"].index((t["pi"][x]-t["key"][j])%N))}))' for j in range(Q) for x in range(N))
    report=dict(seed=a.seed,pin_truth=a.pin_truth,register=len(words),groups=len(c),runes=sum(map(len,c)),actual_miss=t['miss'],old_prefix_support=t['old_prefix_support'],base_bytes=len(smt),iterations=0,clauses=0,conflict_sizes={},best_valid_selected=0)
    ctx=Context();start=time.monotonic();ctx.run(smt);deadline=start+a.timeout
    print(json.dumps(report),flush=True)
    names=[f'p{i}' for i in range(N)]+[f'k{i}' for i in range(Q)]+[f'miss{i}' for i in range(len(c))]+[p for ps in variables for p in ps]
    value_cmd='(get-value ('+' '.join(names)+'))'
    try:
        while time.monotonic()<deadline:
            ms=max(1,int((deadline-time.monotonic())*1000));status=ctx.run(f'(set-option :timeout {ms}) (check-sat)').strip();report['iterations']+=1
            if status!='sat':report['status']=status;break
            raw=ctx.run(value_cmd);v={n:(int(x[2:],2) if x.startswith('#b') else int(x[2:],16) if x.startswith('#x') else x=='true') for n,x in re.findall(r'\((\w+)\s+(#b[01]+|#x[0-9a-f]+|true|false)\)',raw)}
            assert len(v)==len(names),(len(v),len(names),raw[:200])
            clauses=[];valid=0;om=0
            for g,ps in enumerate(variables):
                if v[f'miss{g}']:om+=1;continue
                vals=[v[p] for p in ps];w=''.join(S[x] for x in vals);dictionary,masks,full=ds[g]
                if w in dictionary:valid+=1;continue
                cs,n=conflicts(g,vals,ps,masks,full);clauses+=cs;report['conflict_sizes'][n]=report['conflict_sizes'].get(n,0)+1
            report['best_valid_selected']=max(report['best_valid_selected'],valid)
            if not clauses:
                p=[v[f'p{i}'] for i in range(N)];k=[v[f'k{i}'] for i in range(Q)]
                actual=sum(bool(inverse(x,p,k)&words) for x in c);assert actual>=len(c)-B
                model='\n'.join(f'{name} = {v[name]}' for name in names[:N+Q]);report.update(status='sat',actual_fit_support=actual,**evaluate(model,t));break
            report['clauses']+=len(clauses);ctx.run('\n'.join(clauses))
            if report['iterations']%10==0:print(json.dumps(report),flush=True)
        else:report['status']='deadline'
    finally:ctx.close()
    report['elapsed_seconds']=time.monotonic()-start
    print(json.dumps(report,indent=2),flush=True)
    if a.out:a.out.write_text(json.dumps(report,indent=2)+'\n')
if __name__=='__main__':main()
