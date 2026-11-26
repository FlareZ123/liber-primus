import numpy as np
from collections import Counter
from pathlib import Path
q=29; alphabet='0123456789ABCDEFGHIJKLMNOPQRS'
def dec(s):return [alphabet.index(c) for c in s]
keys={};groups=[];native={}
for line in Path(__file__).with_name('fixture.txt').read_text().splitlines():
 if not line or line.startswith('#'): continue
 a=line.split()
 if a[0]=='N':native[int(a[1])]=[dec(s) for s in a[2:]]
 elif len(a)==2:keys[int(a[0])]=dec(a[1])
 else:groups.append((int(a[0]),int(a[1]),dec(a[2])))
def null(A):
 A=np.array(A,dtype=np.int64)%q; R,C=A.shape;r=0;p=[]
 for j in range(C):
  opts=np.flatnonzero(A[r:,j]);
  if len(opts)==0:continue
  k=opts[0]+r;A[[r,k]]=A[[k,r]];A[r]=(A[r]*pow(int(A[r,j]),-1,q))%q
  for i in range(R):
   if i!=r:A[i]=(A[i]-A[i,j]*A[r])%q
  p.append(j);r+=1
  if r==R:break
 out=[]
 for j in range(C):
  if j in p:continue
  v=np.zeros(C,dtype=np.int64);v[j]=1
  for i,k in enumerate(p):v[k]=-A[i,j]%q
  out.append(v)
 return out

def matrix(p,L,o):
 a=np.zeros((L,L),dtype=np.int64)
 for i in range(L):
  for j,x in enumerate(keys[p]): a[i,(i+o*j)%L]+=x
 return a%q

def eqs(p,s,o):
 out=[]
 for z in null(matrix(p,len(s),o).T):
  v=np.zeros(q,dtype=np.int64)
  for i,x in enumerate(s):v[x]+=z[i]
  assert sum(v)%q==0
  out.append(v%q)
 return out

if __name__=='__main__':
 print('groups',len(groups),Counter(len(g[2]) for g in groups))
 print('equations',sum(len(eqs(p,s,-1)) for _,p,s in groups))
 for i,p,s in groups[:2]: print(i,[[ ''.join(alphabet[x] for x in v) for v in eqs(p,s,o)] for o in (-1,1)])

def make_case(case,seed,fit_only=True):
 rng=np.random.default_rng(seed)
 perm=rng.permutation(q)
 # Fix affine gauge for reference only; preserve actual cipher labels.
 gauge=((perm-perm[0])*pow(int((perm[1]-perm[0])%q),-1,q))%q
 invperm=np.argsort(perm)
 out=[]
 for idx,p,seq in groups:
  if fit_only and p>39:continue
  if case=='plant':
   L=len(seq);o=(-1,1)[int(rng.integers(2))];plain=np.array(native[L][int(rng.integers(len(native[L])))],dtype=np.int64)
   enc=(matrix(p,L,o)@plain+int(rng.integers(q)))%q
   enc=np.roll(enc,int(rng.integers(L)))
   seq=invperm[enc].tolist()
  opts=[eqs(p,seq,o) for o in (-1,1)]
  if case=='plant':assert all(int(v@gauge)%q==0 for v in opts[(o+1)//2])
  out.append((idx,p,seq,opts))
 return out,gauge if case=='plant' else None

def write_case(path,case,seed,fit_only=True):
 records,truth=make_case(case,seed,fit_only)
 with open(path,'w') as f:
  print(len(records),file=f)
  for idx,p,s,opts in records:
   print(idx,p,len(opts[0]),len(opts[1]),file=f)
   for op in opts:
    for row in op: print(''.join(alphabet[x] for x in row),file=f)
  print(''.join(alphabet[x] for x in truth) if truth is not None else '-',file=f)
 return records,truth

if __name__=='__main__':
 base=Path(__file__).parent
 for case,seed in [('original',0),('plant',3301),('plant',1033)]:
  rows,t=write_case(base/f'{case}-{seed}.txt',case,seed)
  print(case,seed,len(rows),t)
