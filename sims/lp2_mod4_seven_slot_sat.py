"""Seven-slot projection of the surviving unequal mod4 destination charts.
Run: python lp2_mod4_seven_slot_sat.py <12956-rune base29 tape file>
Uses libz3.so.4 (ctypes), with local 30s solver timeouts.
Every full sender path maps to this relaxation: outside bucket sizes/order and the
forbidden plaintext-F rank are discarded, but exact central slot history,
outer-left membership, literal F holds, and A/I markers are retained.
"""
import ctypes as C
import sys,time,json
from pathlib import Path
from random import Random
L=C.CDLL('libz3.so.4'); P=C.c_void_p
for name,rest,args in [('Z3_mk_config',P,[]),('Z3_mk_context',P,[P]),('Z3_del_config',None,[P]),('Z3_del_context',None,[P]),('Z3_eval_smtlib2_string',C.c_char_p,[P,C.c_char_p])]:
 f=getattr(L,name); f.restype=rest; f.argtypes=args
CAT=[0,2,1,2,2,1,1,2,2,1,2,1,1,2,2,1,2,1,2,2,1,2,2,1,1,1,2,2,1]
MARKS={176,244,350,530,644,792,967,1025,1062,1250,1316,1545,1814,2148,2375,2428,2476,2566,2659,3002,3095,3222,3275,3347,3738,3783,3881,4006,4142,4148,4176,4217,4233,4358,4474,4633,4699,4751,4794,5253,5319,5336,5635,5699,5976,5991,6256,6563,6793,6924,6990,6994,7132,7185,7311,7480,7522,7683,7781,8098,8278,8327,8559,8678,9072,9246,9402,9555,9776,9946,10851,10972,10995,11086,11526,11647,11802,11951,12165,12233,12254,12648,12770}
def bv(n):return f'(_ bv{n} 5)'
def solve(tape,marks,start,end,timeout=30000):
 s=[f'(set-option :timeout {timeout})','(set-logic QF_BV)'];add=s.append
 prev=[None]+[f'w0_{j}' for j in range(1,8)];last=[start-1]*29;ev={};lz='l0'
 for p in prev[1:]:add(f'(declare-const {p} (_ BitVec 5))');add(f'(assert (bvule {p} {bv(28)}))')
 add('(assert (distinct '+' '.join(prev[1:])+'))')
 for c in range(29):
  l=f'l{c}_init';add(f'(declare-const {l} Bool)');add(f'(assert (=> {l} (and '+ ' '.join(f'(not (= {w} {bv(c)}))' for w in prev[1:])+')))')
 lz='l0_init'
 for t in range(start,end):
  c=tape[t]; cv=bv(c); d=5 if CAT[c]==1 else 2;n=t-start+1;j=f'j{n}';h=f'h{n}';optional=c==0 and t not in marks
  add(f'(declare-const {j} (_ BitVec 5))');add(f'(assert (bvule {j} {bv(8)}))')
  if t in marks:add(f'(assert (or (= {j} {bv(1)}) (= {j} {bv(7)})))')
  for r in range(1,8):add(f'(assert (= (= {j} {bv(r)}) (= {prev[r]} {cv})))')
  if c==0:left=lz
  else:
   terms=[f'l{c}_init'] if last[c]<start else []
   terms += [f'(= {ev[i]} {cv})' for i in range(max(start,last[c]+1),t)]
   left='false' if not terms else '(or '+' '.join(terms)+')' if len(terms)>1 else terms[0]
  add(f'(assert (= (= {j} {bv(0)}) {left}))')
  if optional:add(f'(declare-const {h} Bool)')
  else:h='false'
  e=f'e{n}';ev[t]=e;add(f'(define-fun {e} () (_ BitVec 5) (ite (and (not {h}) (= {j} {bv(0)})) {prev[1]} {bv(31)}))')
  lnew=f'z{n}';add(f'(define-fun {lnew} () Bool (or (= {e} {bv(0)}) '+(f'(and {lz} {h})' if c==0 else lz)+'))');lz=lnew
  out=[None]
  for r in range(1,8):
   p=f'w{n}_{r}';out.append(p);add(f'(declare-const {p} (_ BitVec 5))')
   if r==d:e2=cv
   elif r<d:e2=f'(ite (bvule {j} {bv(r)}) {prev[r+1]} {prev[r]})'
   else:e2=f'(ite (bvuge {j} {bv(r)}) {prev[r-1]} {prev[r]})'
   if optional:e2=f'(ite {h} {prev[r]} {e2})'
   add(f'(assert (= {p} {e2}))')
  prev=out
  if c:last[c]=t
 add('(check-sat)'); data='\n'.join(s).encode();cfg=L.Z3_mk_config();ctx=L.Z3_mk_context(cfg);L.Z3_del_config(cfg);t=time.monotonic();res=L.Z3_eval_smtlib2_string(ctx,data).decode().strip();L.Z3_del_context(ctx)
 return dict(start=start,end=end,markers=len([m for m in marks if start<=m<end]),bytes=len(data),result=res,seconds=round(time.monotonic()-t,3))
def controls():
 r=Random(3301)
 for z,(a,n) in enumerate([(1,350),(3,500),(9,650),(19,500),(22,350)]):
  d=[a,a+3,a];p,q=a-1,a+5;f=r.choice([x for x in range(29) if x not in (p,q)])
  S=list(range(29));S.remove(p);S.remove(q);S.remove(f);r.shuffle(S);S.insert(0,f);S.insert(10,p);S.insert(24,q)
  assert len(S)==29 and S[0]==f and S[10]==p and S[24]==q
  A=list(range(29));r.shuffle(A);T=[];M=set()
  for i in range(n):
   x=r.randrange(29);c=0 if x==0 else A[S[x]];T.append(c)
   if x in (10,24):M.add(i)
   if x:A.pop(S[x]);A.insert(d[CAT[c]],c)
  rec=solve(T,M,0,n,30000);rec.update(trial=z,a=a,forbidden=f,held_zero=sum(1 for x in T if x==0));print(json.dumps(rec),flush=True)
  assert rec['result']!='unsat'
if __name__=='__main__':
 raw=''.join(Path(sys.argv[1]).read_text().split())
 h=2166136261
 for c in raw:h=((h^ord(c))*16777619)&0xffffffff
 assert len(raw)==12956 and h==0x75f0ccfa
 tape=[int(x,29) for x in raw]
 controls()
 for st,en in [(0,800),(4000,4800)]:print(json.dumps(solve(tape,MARKS,st,en,30000)),flush=True)
