"""Exact all-key support of prime-residue permutation with transparent F.
Run from repo root: python sims/lp2_prime_residue_permutation_fhold_sat.py
Z3 shared library required; optionally set Z3_LIBRARY to its path.
No plaintext language assumptions. SAT witnesses are not decipherments.
"""
import argparse
import ctypes as C
import ctypes.util
import json
import os
import re
import time
from pathlib import Path

N = 29

def primes(n):
    out = []
    x = 2
    while len(out) < n:
        if all(x % p for p in out if p*p <= x):
            out.append(x)
        x += 1
    return out

def prime_shifts(n):
    return [(p-1) % N for p in primes(n)]

def encrypt(pt, key, shifts):
    j = 0
    out = []
    for p in pt:
        if p == 0:
            out.append(0)
        else:
            out.append((p+key[shifts[j]]) % N)
            j += 1
    return out

def build_formula(ct, timeout_ms, known_key=None):
    shifts = prime_shifts(len(ct))
    zeros = [i for i,c in enumerate(ct) if c == 0]
    bounds = [-1]+zeros+[len(ct)]
    keynames = [f'k{r}_{v}' for r in range(N) for v in range(N)]
    states = [[f's{e}_{h}' for h in range(e+1)] for e in range(len(zeros)+1)]
    clauses = [f'(set-option :timeout {timeout_ms})']
    clauses += [f'(declare-const {a} Bool)' for a in keynames]
    clauses += [f'(declare-const {a} Bool)' for row in states for a in row]
    def exactly_one(names):
        if len(names) == 1:
            clauses.append(f'(assert {names[0]})')
        else:
            seq = ' '.join(names)
            clauses.extend([f'(assert (or {seq}))', f'(assert ((_ at-most 1) {seq}))'])
    for r in range(N):
        exactly_one([f'k{r}_{v}' for v in range(N)])
    for v in range(N):
        exactly_one([f'k{r}_{v}' for r in range(N)])
    for row in states:
        exactly_one(row)
    if known_key is not None:
        clauses.extend(f'(assert k{r}_{v})' for r,v in enumerate(known_key))
    forbidden_edges = 0
    for e,row in enumerate(states):
        lo,hi = bounds[e]+1,bounds[e+1]
        for h,s in enumerate(row):
            forbidden = sorted({(shifts[i-h],ct[i]) for i in range(lo,hi)})
            forbidden_edges += len(forbidden)
            clauses.extend(f'(assert (or (not {s}) (not k{r}_{v})))' for r,v in forbidden)
            if e < len(zeros):
                stay,hold = states[e+1][h:h+2]
                clauses.append(f'(assert (or (not {s}) {stay} {hold}))')
                clauses.append(f'(assert (or (not {s}) (not {stay}) (not k{shifts[hi-h]}_0)))')
    return '\n'.join(clauses), keynames, states, shifts, forbidden_edges

class NativeZ3:
    def __init__(self):
        lib = os.environ.get('Z3_LIBRARY') or ctypes.util.find_library('z3') or 'libz3.so.4'
        self.z = C.CDLL(lib)
        z = self.z
        z.Z3_mk_config.restype = C.c_void_p
        z.Z3_del_config.argtypes = [C.c_void_p]
        z.Z3_mk_context.argtypes = [C.c_void_p]
        z.Z3_mk_context.restype = C.c_void_p
        z.Z3_del_context.argtypes = [C.c_void_p]
        z.Z3_eval_smtlib2_string.argtypes = [C.c_void_p, C.c_char_p]
        z.Z3_eval_smtlib2_string.restype = C.c_char_p
        cfg = z.Z3_mk_config()
        self.ctx = z.Z3_mk_context(cfg)
        z.Z3_del_config(cfg)
    def eval(self, script):
        return self.z.Z3_eval_smtlib2_string(self.ctx, script.encode('utf8')).decode('utf8')
    def close(self):
        self.z.Z3_del_context(self.ctx)

def solve(ct, timeout_ms=15000, known_key=None):
    script,keys,states,shifts,forbidden = build_formula(ct,timeout_ms,known_key)
    start = time.monotonic()
    solver = NativeZ3()
    try:
        status = solver.eval(script+'\n(check-sat-using sat)').strip()
        elapsed = time.monotonic()-start
        result = dict(n=len(ct),zeros=ct.count(0),states=sum(map(len,states)),forbidden_edges=forbidden,status=status,seconds=round(elapsed,3))
        if status == 'sat':
            key_values = solver.eval('(get-value ('+' '.join(keys)+'))')
            key = [None]*N
            for r,v in re.findall(r'\(k(\d+)_(\d+) true\)',key_values):
                key[int(r)] = int(v)
            assert sorted(key) == list(range(N)),key
            state_values = solver.eval('(get-value ('+' '.join(a for row in states for a in row)+'))')
            hs = [None]*len(states)
            for e,h in re.findall(r'\(s(\d+)_(\d+) true\)',state_values):
                hs[int(e)] = int(h)
            assert hs[0] == 0 and all(x is not None for x in hs)
            pt=[]
            j=e=0
            for c in ct:
                if c==0:
                    h=hs[e+1]-hs[e]
                    e+=1
                    assert h in (0,1)
                    if h:
                        pt.append(0)
                        continue
                p=(c-key[shifts[j]])%N
                assert p != 0
                pt.append(p)
                j+=1
            assert encrypt(pt,key,shifts)==ct
            result.update(key=key,holds=hs[-1],replay=True,plain=''.join('0123456789abcdefghijklmnopqrs'[p] for p in pt))
        return result
    finally:
        solver.close()

def solve_joint(tapes,timeout_ms=15000):
    formulas=[]; states_all=[]; shifts_all=[]; sizes=[]
    for idx,ct in enumerate(tapes):
        formula,keys,states,shifts,forbidden=build_formula(ct,timeout_ms)
        new_states=[[f'R{idx}_{s}' for s in row] for row in states]
        formula=re.sub(r'\bs\d+_\d+\b',lambda m:f'R{idx}_{m.group()}',formula)
        if idx:
            formula='\n'.join(line for line in formula.splitlines() if not line.startswith(('(declare-const k','(set-option ')))
        formulas.append(formula);states_all.append(new_states);shifts_all.append(shifts);sizes.append((len(ct),ct.count(0),sum(map(len,states)),forbidden))
    solver=NativeZ3();start=time.monotonic()
    try:
        status=solver.eval('\n'.join(formulas)+'\n(check-sat-using sat)').strip()
        r=dict(status=status,seconds=round(time.monotonic()-start,3),sizes=sizes)
        if status=='sat':
            key_values=solver.eval('(get-value ('+' '.join(keys)+'))');key=[None]*29
            for a,b in re.findall(r'\(k(\d+)_(\d+) true\)',key_values):key[int(a)]=int(b)
            assert sorted(key)==list(range(29))
            r['key']=key;r['regions']=[]
            for idx,(ct,states,shifts) in enumerate(zip(tapes,states_all,shifts_all)):
                values=solver.eval('(get-value ('+' '.join(s for row in states for s in row)+'))');hs=[None]*len(states)
                for a,b in re.findall(r'\(R\d+_s(\d+)_(\d+) true\)',values):hs[int(a)]=int(b)
                assert hs[0]==0 and all(x is not None for x in hs)
                pt=[];j=e=0
                for c in ct:
                    if c==0:
                        h=hs[e+1]-hs[e];e+=1;assert h in (0,1)
                        if h:pt.append(0);continue
                    p=(c-key[shifts[j]])%29;assert p!=0;pt.append(p);j+=1
                assert encrypt(pt,key,shifts)==ct
                r['regions'].append(dict(holds=hs[-1],replay=True,plain=''.join('0123456789abcdefghijklmnopqrs'[p] for p in pt)))
        return r
    finally:solver.close()

def title_gate(ct):
    hypotheses = {
        'EPIPHANY SEEKS':[18,13,10,13,8,24,9,26,15,18,18,5,15],
        'SECUENDI RATIO':[15,18,5,1,18,9,23,10,4,24,16,10,3],
    }
    pp = primes(5013)
    out = {}
    for name,pt in hypotheses.items():
        assert 0 not in pt
        shifts = [(c-p)%29 for c,p in zip(ct[:13],pt)]
        hits = []
        for s in range(5000):
            pairs = list(zip([(p-1)%29 for p in pp[s:s+13]], shifts))
            if all((a==c)==(b==d) for a,b in pairs for c,d in pairs):
                hits.append(s)
        out[name] = dict(implied_shifts=shifts,compatible_starts=hits)
    return out

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--corpus',default='resources/liber-primus/lp2-corpus.json')
    ap.add_argument('--timeout-ms',type=int,default=15000)
    ap.add_argument('--output',default='prime_residue_sat_output.json')
    args=ap.parse_args()
    corpus=json.loads(Path(args.corpus).read_text(encoding='utf8'))
    tapes={f'p{p}-{q}':[x for page in corpus['pages'][p:q+1] for x in page['indices']] for p,q in [(0,2),(15,22),(23,26),(40,53)]}
    known=list(reversed(range(N)))
    plant=[0,1,2,3,4,5,6,7,0,9,10]*4
    test=solve(encrypt(plant,known,prime_shifts(len(plant))),args.timeout_ms,known)
    assert test['status']=='sat' and test['replay']
    results={'plant':test,'titles':title_gate(tapes['p0-2'])}
    for name,ct in tapes.items():
        print('Start',name,len(ct),ct.count(0),flush=True)
        result=solve(ct,args.timeout_ms)
        results[name]=result
        Path(args.output).write_text(json.dumps(results,indent=2)+'\n',encoding='utf8')
        print(name,{k:v for k,v in result.items() if k!='plain'},flush=True)
    results['joint']=solve_joint([tapes[n] for n in ('p0-2','p15-22','p23-26')],args.timeout_ms)
    Path(args.output).write_text(json.dumps(results,indent=2)+'\n',encoding='utf8')
    print('Joint',results['joint']['status'],flush=True)

if __name__=='__main__':main()
