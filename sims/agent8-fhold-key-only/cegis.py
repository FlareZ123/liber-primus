"""Conflict-learning key-only exact receiver for the same F-held law.
C++ helper uses an over-approximate finite-state inverse for partial permutations.
Z3 only sees keys and learned necessary clauses; full replay decides SAT witnesses.
"""
import ctypes as c, itertools, json, pathlib, random, sys, time, collections
from prefix_sat import api,z,P,S,mk_config,mk_context,del_context,del_config,set_param,version,short_nogoods,deltas
D=c.CDLL(str(pathlib.Path(__file__).with_name('conflict.so')))
D.init.argtypes=[c.c_int,c.POINTER(c.c_int),c.POINTER(c.c_int),c.c_int,c.c_int]
D.clauses.argtypes=[c.POINTER(c.c_int),c.POINTER(c.c_uint32),c.POINTER(c.c_int),c.c_int,c.c_int];D.clauses.restype=c.c_int
D.full_fail_count.argtypes=[c.POINTER(c.c_int)];D.full_fail_count.restype=c.c_int
D.nsegments.restype=c.c_int
mk_solver_for_logic=api('Z3_mk_solver_for_logic',[P,P],P)
mk_string_symbol=api('Z3_mk_string_symbol',[P,S],P)
solver_inc=api('Z3_solver_inc_ref',[P,P],None)
solver_dec=api('Z3_solver_dec_ref',[P,P],None)
solver_from=api('Z3_solver_from_string',[P,P,S],None)
solver_check=api('Z3_solver_check',[P,P],c.c_int)
solver_model=api('Z3_solver_get_model',[P,P],P)
model_inc=api('Z3_model_inc_ref',[P,P],None)
model_dec=api('Z3_model_dec_ref',[P,P],None)
model_eval=api('Z3_model_eval',[P,P,P,c.c_bool,c.POINTER(P)],c.c_bool)
get_numeral_uint=api('Z3_get_numeral_uint',[P,P,c.POINTER(c.c_uint)],c.c_bool)
mk_bv_sort=api('Z3_mk_bv_sort',[P,c.c_uint],P)
mk_const=api('Z3_mk_const',[P,P,P],P)
mk_unsigned=api('Z3_mk_unsigned_int',[P,c.c_uint,P],P)
mk_eq=api('Z3_mk_eq',[P,P,P],P)
mk_not=api('Z3_mk_not',[P,P],P)
mk_or=api('Z3_mk_or',[P,c.c_uint,c.POINTER(P)],P)
mk_false=api('Z3_mk_false',[P],P)
solver_assert=api('Z3_solver_assert',[P,P,P],None)
solver_reason=api('Z3_solver_get_reason_unknown',[P,P],S)
mk_params=api('Z3_mk_params',[P],P)
params_inc=api('Z3_params_inc_ref',[P,P],None)
params_dec=api('Z3_params_dec_ref',[P,P],None)
params_uint=api('Z3_params_set_uint',[P,P,P,c.c_uint],None)
solver_set_params=api('Z3_solver_set_params',[P,P,P],None)

class KeySolver:
 def __init__(self,n,k0,timeout_ms):
  cfg=mk_config();self.ctx=mk_context(cfg);del_config(cfg);ctx=self.ctx
  self.n=n;self.k0=k0;self.solver=mk_solver_for_logic(ctx,mk_string_symbol(ctx,b'QF_BV'));solver_inc(ctx,self.solver)
  p=mk_params(ctx);params_inc(ctx,p);params_uint(ctx,p,mk_string_symbol(ctx,b'timeout'),timeout_ms);solver_set_params(ctx,self.solver,p);params_dec(ctx,p)
  w=(n-1).bit_length();self.sort=mk_bv_sort(ctx,w);B=f'(_ BitVec {w})';b=lambda x:f'(_ bv{x} {w})'
  self.key=[mk_const(ctx,mk_string_symbol(ctx,f'k{i}'.encode()),self.sort) for i in range(n)]
  self.values=[mk_unsigned(ctx,i,self.sort) for i in range(n)]
  self.lit=[[mk_not(ctx,mk_eq(ctx,x,y)) for y in self.values] for x in self.key]
  s=[]
  for i in range(n):s.extend([f'(declare-fun k{i} () {B})',f'(assert (bvule k{i} {b(n-1)}))'])
  s.append('(assert (distinct '+' '.join(f'k{i}' for i in range(n))+'))');s.append(f'(assert (= k0 {b(k0)}))')
  solver_from(ctx,self.solver,'\n'.join(s).encode());self.seen=set();self.hist=collections.Counter()
 def add(self,no):
  no=tuple((q,v) for q,v in no if q);assert all(q>0 for q,v in no)
  if no in self.seen:return False
  self.seen.add(no);self.hist[len(no)]+=1;ctx=self.ctx;A=(P*len(no))(*(self.lit[q][v] for q,v in no))
  e=mk_or(ctx,len(no),A) if no else mk_false(ctx);solver_assert(ctx,self.solver,e);return True
 def check(self):
  r=solver_check(self.ctx,self.solver)
  if r==0:return 'unknown',solver_reason(self.ctx,self.solver).decode()
  if r==-1:return 'unsat',None
  m=solver_model(self.ctx,self.solver);model_inc(self.ctx,m);vals=[]
  for x in self.key:
   res=P();v=c.c_uint();assert model_eval(self.ctx,m,x,True,c.byref(res));assert get_numeral_uint(self.ctx,res,c.byref(v));vals.append(v.value)
  model_dec(self.ctx,m);assert sorted(vals)==list(range(self.n)) and vals[0]==self.k0
  return 'sat',vals
 def close(self):solver_dec(self.ctx,self.solver);del_context(self.ctx)

def load(pages,n,minrun):
 a=[x for p in pages for x in p];data=(c.c_int*len(a))(*a);ls=(c.c_int*len(pages))(*map(len,pages));D.init(n,data,ls,len(pages),minrun)

def full_legal(pages,key):
 n=len(key)
 for p in pages:
  S={0}
  for a,b in zip(p,p[1:]):
   T={(b-a+key[q])%n for q in S}-{0}
   if not b:T|=S
   S=T
   if not S:return False
 return True

def prefix(pages):return [p[:next((i for i,x in enumerate(p) if i and not x),len(p))] for p in pages]

def run(pages,n,k0,wall,percheck=10000,minrun=70,depth=4,verbose=False):
 t=time.monotonic();load(pages,n,minrun);solver=KeySolver(n,k0,percheck);ng=short_nogoods(deltas(prefix(pages),n),n,k0,depth)
 for no in ng:solver.add(no)
 masks=(c.c_uint32*512)();ids=(c.c_int*512)();iterations=0;best=1000;bestkey=None;result='timeout';reason=None;last=0;dynamic=0;from_runs=0
 try:
  while time.monotonic()-t<wall:
   status,k=solver.check()
   if status!='sat':result=status;reason=k;break
   iterations+=1;K=(c.c_int*n)(*k);fails=D.full_fail_count(K)
   if fails<best:best=fails;bestkey=k
   if not fails:
    assert full_legal(pages,k);result='sat';break
   count=D.clauses(K,masks,ids,len(masks),iterations%(n-1));added=0
   for i in range(count):
    mask=masks[i];no=tuple((q,k[q]) for q in range(1,n) if mask>>q&1)
    if solver.add(no):added+=1;dynamic+=1;from_runs+=int(ids[i]>=len(pages))
   assert added>0,(k,count)
   if verbose and time.monotonic()-last>15:
    last=time.monotonic();print(json.dumps({'progress':True,'k0':k0,'models':iterations,'best_failed':best,'dynamic':dynamic,'run_clauses':from_runs,'elapsed_s':last-t,'clause_hist':dict(solver.hist)}),flush=True)
  return {'k0':k0,'result':result,'reason':reason,'models':iterations,'initial_nogoods':len(ng),'dynamic_nogoods':dynamic,'long_run_nogoods':from_runs,'best_failed_pages':best if best!=1000 else None,'best_key':bestkey,'clause_hist':dict(solver.hist),'elapsed_s':time.monotonic()-t,'segments':D.nsegments(),'z3':version().decode()}
 finally:solver.close()

def controls():
 rng=random.Random(8063045);cases=[]
 for n in [3,4,5,6,7]:
  for trial in range(12):
   k=list(range(n));rng.shuffle(k);pages=[]
   for _ in range(rng.randint(1,4)):
    p=[rng.randrange(n)];q=0
    for _ in range(rng.randint(3,15)):
     x=rng.randrange(n);p.append(0 if not x else (p[-1]+x-k[q])%n);q=x or q
    if trial%2:p=[rng.randrange(n) for _ in p]
    pages.append(p)
   for k0 in range(n):
    truth=sum(full_legal(pages,(k0,*rest)) for rest in itertools.permutations([x for x in range(n) if x!=k0]))
    ans=run(pages,n,k0,10,5000,3,3)
    assert ans['result']==('sat' if truth else 'unsat'),(n,trial,k0,truth,ans)
    cases.append((truth,ans['models'],ans['dynamic_nogoods']))
 print(json.dumps({'cases':len(cases),'sat':sum(x[0]>0 for x in cases),'unsat':sum(x[0]==0 for x in cases),'models':sum(x[1] for x in cases),'dynamic_nogoods':sum(x[2] for x in cases)}))
if __name__=='__main__':
 if sys.argv[1]=='controls':controls();sys.exit()
 file,k0,wall,percheck,minrun,depth=sys.argv[1:7];k0,wall,percheck,minrun,depth=map(int,(k0,wall,percheck,minrun,depth));pages=[[int(x,29) for x in line] for line in pathlib.Path(file).read_text().splitlines()]
 assert len(pages)==55 and sum(map(len,pages))==12956
 print(json.dumps(run(pages,29,k0,wall,percheck,minrun,depth,True)),flush=True)
