"""Exact GP29 four-tape affine inverse with lexical OOV budget, via Z3 SAT.
Run from the repository root. Set Z3_LIBRARY to the local Z3 shared library
(e.g. libz3.dll on Windows) if not discoverable. Tested locally with 4.13.3.0.
All source data come from the committed, pinned portable bridge and word list.
"""
import argparse
import ctypes as ct
import ctypes.util
import hashlib
import json
import os
import re
import time
from collections import defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BRIDGE=ROOT/'im-results/lp2-four-tape-affine-native-solver-bridge.json'
Q=29
CORES={0:[[11,31,45,59],[30,31,45,59],[12,31,45,59],[11,12,30,45,59],[1,17,19,39,64],[0,1,17,37,63],[1,17,37,38,63]],2:[[5,6,25,26,43,60],[5,24,25,26,43,60],[6,24,25,26,43,60],[5,6,24,26,43,60],[3,4,6,25,26,43,60],[3,4,6,24,26,43,60],[13,32,47,65],[13,33,47,64,65],[1,19,39,40,41,55,57],[1,19,20,41,57]]}

def fnv(words):
 h=2166136261
 for c in '\n'.join(sorted(words)):h=((h^ord(c))*16777619)&0xffffffff
 return f'{h:08x}'

def prepare(k,control=None):
 B=json.loads(BRIDGE.read_text(encoding='utf8'));alphabet=B['alphabet']
 tokens=sorted(zip(alphabet,range(Q)),key=lambda x:-len(x[0]))
 def spell(w,alt):
  w=w.upper().replace('QU','CW').replace('V','U');w=re.sub('[KQ]','C',w).replace('Z','S');p=[]
  while w:
   if alt and w.startswith('ING'):t,i='ING',21
   elif alt and w.startswith('IO'):t,i='IO',27
   else:t,i=next((t,i) for t,i in tokens if w.startswith(t))
   p.append(chr(65+i));w=w[len(t):]
  return ''.join(p)
 b=(ROOT/'resources/control/english_wordfreq_textblob.txt').read_bytes()
 assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()=='140e1d22b5f8c45deddd2e8b25549d9d6307d938'
 vocab=set(chr(65+i) for i in range(Q))
 for line in b.decode().splitlines():
  m=re.fullmatch(r'([a-z]+) (\d+)',line)
  if m:
   for alt in [False,True]:
    w=spell(m[1],alt)
    if 0<len(w)<=24:vocab.add(w)
 assert len(vocab)==B['baseCount']==33373
 last='';extra=[]
 for t in ' '.join(B['chunks']).split():
  last=last[:int(t[0],36)]+t[1:];extra.append(last)
 assert len(extra)==B['extraCount']==2571 and fnv(extra)==B['extraHash']=='5b62a9bb'
 vocab.update(extra)
 assert len(vocab)==B['fullCount']==35944 and fnv(vocab)==B['hash']=='0fd738ae'
 h=2166136261
 for c in json.dumps([B['original'],B['spans'],B['alphabet']],separators=(',',':')):h=((h^ord(c))*16777619)&0xffffffff
 assert h==0xa6ac68b2
 ctape=B['original'] if control is None else control['ciphertext']
 spans=B['spans'] if control is None else control['spans']
 bylen=defaultdict(list)
 for w in sorted(vocab):bylen[len(w)].append(w)
 rest=list(range(34,234))+list(range(28));i=list(range(76))
 M=([rest[:76],rest[76:152],rest[152:]] if k==0 else [rest[j::3] for j in range(3)] if k==1 else [[78*j+c+1 for c in i] for j in range(3)] if k==2 else [[3*(c+1)+j for c in i] for j in range(3)])+[i]
 used=[set(sum(M[:3],[])),set(M[3])];pos={};columns=[];variables=[]
 for j,idxs in enumerate(M):
  p=int(j==3)
  for i,posi in enumerate(idxs):pos[(p,posi)]=j*76+i
 for p in range(2):
  for S in spans[p]:
   a,b,carry=S['start'],S['end'],S['carry'];active=[i for i in range(a,b) if i in used[p]]
   if not active:continue
   if carry:
    for i in active:variables.append({'p':p,'start':i,'end':i+1,'free':True,'sites':[pos[p,i]],'words':[]})
   else:
    words={''.join(w[i-a] for i in active) for w in bylen[b-a]}
    variables.append({'p':p,'start':a,'end':b,'free':False,'sites':[pos[p,i] for i in active],'words':sorted(words)})
 for i in range(76):columns.append([ctape[int(j==3)][M[j][i]] for j in range(4)])
 P={'layout':k,'variables':variables,'columns':columns,'maps':M,'vocabFNV':fnv(vocab),'vocabSize':len(vocab),'original':control is None}
 if control is None and k in [0,2]:
  assert len(variables)==(69 if k==0 else 70)
  assert sum(len(v['words']) if not v['free'] else 29 for v in variables)==(137527 if k==0 else 135740)
 return P

def window(P,start,end,exclude=()):
 n=len(P['columns']);new_n=end-start;selected=set(range(start,end));vs=[]
 for i,V in enumerate(P['variables']):
  active=[k for k,x in enumerate(V['sites']) if x%n in selected]
  if not active or V['free'] or i in exclude:continue
  sites=[(V['sites'][k]//n)*new_n+(V['sites'][k]%n-start) for k in active]
  words=sorted({''.join(w[k] for k in active) for w in V['words']})
  vs.append(dict(V,sites=sites,words=words,sourceVar=i))
 return dict(P,variables=vs,columns=P['columns'][start:end],original=False,start=start,end=end)

def mdd(words):
 """Reduced ordered lexical decision diagram; terminal id zero."""
 root={};length=len(words[0]);assert all(len(w)==length for w in words)
 for w in words:
  n=root
  for ch in w:n=n.setdefault(ord(ch)-65,{})
 nodes=[(length,())];cache={}
 def reduce(n,d):
  if not n:assert d==length;return 0
  edges=tuple(sorted((ch,reduce(k,d+1)) for ch,k in n.items()));key=(d,edges)
  if key not in cache:cache[key]=len(nodes);nodes.append(key)
  return cache[key]
 start=reduce(root,0);return nodes,start

def atom(i,s):return f'x{i}_{s}'

def form(P,budget,core=True,encoding='mdd',timeout=600,seed=1):
 decl=[];clauses=[];stats=defaultdict(int)
 def declare(name):decl.append(f'(declare-const {name} Bool)');return name
 def assertion(s):clauses.append(f'(assert {s})')
 def Or(x):
  x=list(x);return 'false' if not x else x[0] if len(x)==1 else '(or '+' '.join(x)+')'
 def neg(x):return '(not '+x+')'
 ncols=len(P['columns'])
 for i in range(4*ncols):
  xs=[declare(atom(i,s)) for s in range(Q)];assertion(Or(xs));assertion('((_ at-most 1) '+' '.join(xs)+')')
 for i,C in enumerate(P['columns']):
  ids=[i+ncols*j for j in range(4)];a=0;b=next((j for j in range(1,4) if C[j]!=C[a]),None)
  if b is None:
   for j in range(1,4):
    for s in range(Q):assertion(f'(= {atom(ids[0],s)} {atom(ids[j],s)})')
   continue
  ys=[];supports=[[[] for _ in range(Q)] for _ in range(4)];lambdas=[(c-C[a])*pow((C[b]-C[a])%Q,-1,Q)%Q for c in C]
  for u in range(Q):
   for v in range(Q):
    if u==v:continue
    vals=[(u+l*(v-u))%Q for l in lambdas];y=declare(f't{i}_{u}_{v}');ys.append(y)
    for j,val in enumerate(vals):supports[j][val].append(y);assertion(f'(or (not {y}) {atom(ids[j],val)})')
  assertion(Or(ys))
  for j in range(4):
   for val in range(Q):assertion(Or([neg(atom(ids[j],val)),*supports[j][val]]))
  stats['affineSelectors']+=len(ys)
 oov={}
 for j,V in enumerate(P['variables']):
  if V['free']:continue
  sites=V['sites'];words=V['words'];o=declare(f'o{j}');oov[j]=o
  if not words:assertion(o);continue
  if encoding=='mdd':
   nodes,root=mdd(words);names=['true']+[declare(f'w{j}_{k}') for k in range(1,len(nodes))];stats['mddNodes']+=len(nodes)-1
   for k,(d,edges) in enumerate(nodes[1:],1):
    xs=[]
    for s,child in edges:
     x=atom(sites[d],s);xs.append(x if child==0 else f'(and {x} {names[child]})')
    assertion(f'(= {names[k]} {Or(xs)})')
   assertion(f'(or {o} {names[root]})')
  else:
   ys=[];supports=[[[] for _ in range(Q)] for _ in sites]
   for k,w in enumerate(words):
    y=declare(f'w{j}_{k}');ys.append(y)
    for z,c in enumerate(w):
     s=ord(c)-65;supports[z][s].append(y);assertion(f'(or (not {y}) {atom(sites[z],s)})')
   assertion(Or([o,*ys]))
   for z,i in enumerate(sites):
    for s in range(Q):assertion(Or([neg(atom(i,s)),o,*supports[z][s]]))
   stats['wordSelectors']+=len(ys)
 assertion(f'((_ at-most {budget}) '+ ' '.join(oov.values())+')')
 if core and P.get('original',True):
  for c in CORES.get(P['layout'],[]):assertion(Or(oov[v] for v in c))
 script='\n'.join(['(set-option :timeout '+str(int(timeout*1000))+')',f'(set-option :sat.random_seed {seed})','(set-logic QF_FD)',*decl,*clauses,'(check-sat)'])
 return script,oov,dict(stats,decls=len(decl),assertions=len(clauses),bytes=len(script))

def z3eval():
 library=os.environ.get('Z3_LIBRARY') or ctypes.util.find_library('z3') or ('libz3.dll' if os.name=='nt' else 'libz3.so.4')
 lib=ct.CDLL(library);P=ct.c_void_p;S=ct.c_char_p
 def fn(n,r,*a):f=getattr(lib,n);f.restype=r;f.argtypes=a;return f
 cfg=fn('Z3_mk_config',P)();ctx=fn('Z3_mk_context',P,P)(cfg);fn('Z3_del_config',None,P)(cfg);e=fn('Z3_eval_smtlib2_string',S,P,S)
 def execute(s):return e(ctx,s.encode()).decode()
 return execute,lambda:fn('Z3_del_context',None,P)(ctx)

def verify(P,plain,budget):
 for i,C in enumerate(P['columns']):
  p=[plain[j*len(P['columns'])+i] for j in range(4)]
  assert any(all((a*c+b)%Q==v for c,v in zip(C,p)) for a in range(1,Q) for b in range(Q))
 bad=[];reconstructed=[]
 for v,V in enumerate(P['variables']):
  w=''.join(chr(65+plain[i]) for i in V['sites']);good=V['free'] or w in set(V['words']);reconstructed.append((v,w,good))
  if not good:bad.append(v)
 assert len(bad)<=budget
 return bad,reconstructed

def solve(P,budget,timeout,seed,encoding,block=True):
 start=time.time();script,oov,stats=form(P,budget,encoding=encoding,timeout=timeout,seed=seed)
 print(json.dumps({'phase':'encoded','layout':P['layout'],'budget':budget,'seconds':time.time()-start,'stats':stats}),flush=True)
 e,close=z3eval();result={'layout':P['layout'],'budget':budget,'timeout':timeout,'seed':seed,'encoding':encoding,'stats':stats}
 try:
  print('solving...',flush=True);t=time.time();status=e(script).strip();result.update(status=status,solveSeconds=time.time()-t);print(json.dumps(result),flush=True)
  if status=='sat':
   n=len(P['columns']);variables=[atom(i,s) for i in range(4*n) for s in range(Q)];out=e('(get-value ('+' '.join(variables)+'))');matches=re.findall(r'\(x(\d+)_(\d+) true\)',out);assert len(matches)==4*n,len(matches);plain=[-1]*(4*n)
   for i,s in matches:plain[int(i)]=int(s)
   bad,words=verify(P,plain,budget);result.update(plaintext=plain,oovWords=bad,wordValues=words);print('Verified SAT model, OOV:',bad,flush=True)
   if block:
    t=time.time();other=e('(assert (or '+' '.join(f'(not {atom(i,plain[i])})' for i in range(3*n,4*n))+')) (check-sat)').strip();result.update(blockedP55Status=other,blockedSeconds=time.time()-t);print('Blocked p55:',other,flush=True)
  elif status=='unknown':result['reason']=e('(get-info :reason-unknown)').strip()
  result['elapsed']=time.time()-start;return result
 finally:close()

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('layout',type=int);p.add_argument('--budget',type=int,default=3);p.add_argument('--timeout',type=int,default=600);p.add_argument('--seed',type=int,default=1);p.add_argument('--encoding',choices=['mdd','selectors'],default='mdd');p.add_argument('--no-block',action='store_true');p.add_argument('--window',nargs=2,type=int);p.add_argument('--exclude',nargs='*',type=int,default=[]);p.add_argument('--control');a=p.parse_args()
 P=prepare(a.layout,None if a.control is None else json.loads(Path(a.control).read_text()))
 if a.window:P=window(P,*a.window,a.exclude)
 result=solve(P,a.budget,a.timeout,a.seed,a.encoding,not a.no_block)
 if a.window:result.update(sourceVars=[x['sourceVar'] for x in P['variables']],interval=a.window,excluded=a.exclude)
 print(json.dumps(result,indent=2))
