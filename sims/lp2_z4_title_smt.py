#!/usr/bin/env python3
"""Finite known-plaintext key inference for the Z4 retry receiver.
Requires libz3 (tested via the C API on Linux); reads pinned repo corpora.
Usage: python sims/lp2_z4_title_smt.py 36 13 [plant]
"""
import ctypes as ct,ctypes.util,re,sys,time,json
from pathlib import Path
z=ct.CDLL(ctypes.util.find_library('z3') or 'libz3.so.4'); ptr=ct.c_void_p
def bind(n,r,*a):
 f=getattr(z,n);f.restype=r;f.argtypes=a;return f
ctx=bind('Z3_mk_context',ptr,ptr)(bind('Z3_mk_config',ptr)())
eval_smt=bind('Z3_eval_smtlib2_string',ct.c_char_p,ptr,ct.c_char_p)
def ev(s):return eval_smt(ctx,s.encode()).decode()
ROOT=Path(__file__).resolve().parent.parent
gp=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
gold=json.loads((ROOT/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf-8'))
ix={c:i for i,c in enumerate(gp['runes'])}
P=[18,13,10,13,8,24,9,26,15,18,18,5,15]
C=[x for p in gp['pages'] if p['page']<=2 for x in p['indices']]
NATIVE=[ix[c] for c in next(s for s in gold['sections'] if s['name']=='p57_parable')['source_text'] if c in ix]
assert len(C)==729 and C[:13]==[15,8,18,3,6,19,27,0,15,26,18,21,5] and len(NATIVE)==95
def step(k,m,i,last,p,mode=0):
 if mode and p==0:return 0,i,0 if mode==2 else last
 for _ in range(2*len(k)):
  v=(p+k[i])%m;i=(i+1)%len(k)
  if v==last:continue
  last=v
  if v<29:return v,i,last
 return None
def replay(k,m,P,C=None):
 i=0;last=m;ct=[]
 for j,p in enumerate(P):
  v=step(k,m,i,last,p)
  if v is None or C is not None and v[0]!=C[j]:return None
  c,i,last=v;ct.append(c)
 return (i,last) if C is not None else ct
def reach(k,m,i,last,C,j,mode):
 states={(i,last)}
 for j in range(j,len(C)):
  nxt=set()
  for i,l in states:
   for p in range(29):
    v=step(k,m,i,l,p,mode)
    if v is not None and v[0]==C[j]:nxt.add(v[1:])
  if not nxt:return j
  states=nxt
 return len(C)
def OR(xs):return '(or '+' '.join(xs)+')' if xs else 'false'
def AND(xs):return '(and '+' '.join(xs)+')' if xs else 'true'
def EQ(a,b):return f'(= {a} {b})'
def BV(n):return f'(_ bv{n} 6)'
def constraint(P,C,m,q):
 lines=['(set-option :timeout 8000)','(set-logic QF_BV)']
 for i in range(q):lines.extend([f'(declare-const k{i} (_ BitVec 6))',f'(assert (bvult k{i} {BV(m)}))'])
 for j in range(len(P)+1):lines.extend([f'(declare-const s{j} (_ BitVec 6))',f'(assert (bvult s{j} {BV(q)}))'])
 lines.append(f'(assert {EQ("s0",BV(0))})')
 for j,p in enumerate(P):
  last=C[j-1] if j else m;goal=C[j]
  for i in range(q):
   H=OR([EQ(f'k{i}',BV((v-p)%m)) for v in range(29,m)])
   R=EQ(f'k{i}',BV((last-p)%m)) if last<m else 'false'
   E=EQ(f'k{i}',BV((goal-p)%m))
   for name,v in [('h',H),('r',R),('e',E)]:lines.append(f'(define-fun {name}{j}_{i} () Bool {v})')
  opts=[]
  for i in range(q):
   for a in range(1,(2*q if goal==last else q)+1):
    end=(i+a-1)%q;pre=[(i+x)%q for x in range(a-1)]
    tests=[EQ(f's{j}',BV(i)),EQ(f's{j+1}',BV((end+1)%q)),f'e{j}_{end}']
    tests += [OR([f'h{j}_{x}',f'r{j}_{x}']) for x in pre]
    tests += [f'(not (and h{j}_{a} r{j}_{b}))' for a,b in zip(pre,pre[1:])]
    if goal==last:tests.append(OR([f'h{j}_{x}' for x in pre]))
    opts.append(AND(tests))
  lines.append(f'(assert {OR(opts)})')
 return '\n'.join(lines)
def main():
 m=int(sys.argv[1]);q=int(sys.argv[2]);plant='plant' in sys.argv
 truth=([23,10,1,10,9,10,16,26] if q==8 else [0,10,4,0,1,19,0,18,4,18,9,0,18]) if plant else None
 pp=(NATIVE*8)[:729] if plant else P;cc=replay(truth,m,pp) if plant else C
 if plant:pp=pp[:13]
 script=constraint(pp,cc,m,q);print('constraint bytes',len(script),flush=True);out=ev(script);assert not out.strip(),out
 keys=[f'k{i}' for i in range(q)];start=time.time();n=0;best=[0]*3;survived=[0]*3;samples=[];truth_found=False
 while n<10000 and time.time()-start<10:
  out=ev('(check-sat)').strip()
  if out!='sat':break
  model=ev(f'(get-value ({" ".join(keys)}))');k=[int(v,2) for v in re.findall(r'#b([01]+)',model)]
  if not k:k=[int(v,16) for v in re.findall(r'#x([0-9a-fA-F]+)',model)]
  assert len(k)==q,(model,k)
  phase=replay(k,m,pp,cc);assert phase is not None,(k,model)
  n+=1;truth_found |= truth==k
  for mode in range(3):
   r=reach(k,m,*phase,cc,len(pp),mode);best[mode]=max(best[mode],r)
   if r==len(cc):survived[mode]+=1;samples.append({'key':k,'mode':mode,'phase':phase})
  if n<=10 or n%100==0:print('keys',n,'best',best,'survived',survived,'truth',truth_found,'seconds',round(time.time()-start,1),flush=True)
  ev('(assert (not '+AND([EQ(name,BV(v)) for name,v in zip(keys,k)])+'))')
  if plant and truth_found:out='control-found';break
 print(json.dumps(dict(m=m,q=q,plant=plant,status=out,n=n,best=best,survived=survived,truth_found=truth_found,samples=samples[:20],seconds=time.time()-start)),flush=True)
if __name__=='__main__':main()
