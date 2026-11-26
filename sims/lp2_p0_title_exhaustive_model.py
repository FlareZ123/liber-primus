"""Build the exact weighted-word GP trigram model and original/plant inputs."""
import pathlib, numpy as np, re, hashlib, sys, json, struct
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else pathlib.Path('title-exhaustive-output')
OUT.mkdir(parents=True,exist_ok=True)
TOKENS=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
ORDER=sorted(enumerate(TOKENS),key=lambda x:-len(x[1]))
def encode(w):
 w=w.upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S'); a=[]
 while w:
  if w.startswith('ING'): a.append(21);w=w[3:];continue
  if w.startswith('IO'): a.append(27);w=w[2:];continue
  for i,t in ORDER:
   if w.startswith(t): a.append(i);w=w[len(t):];break
  else:return []
 return a
p=ROOT/'resources/control/english_wordfreq_textblob.txt'
u=np.ones(29);b=np.zeros((30,29));t=np.zeros((30,30,29));first=np.zeros(29);last=np.zeros(29);single=np.zeros(29);prefix=np.zeros((29,29));suffix=np.zeros((29,29));W=0;rows=0
for line in p.read_text(encoding='utf8').splitlines():
 m=re.fullmatch(r'([a-z]+) (\d+)',line)
 if not m:continue
 a=encode(m[1]);w=int(m[2])
 if not a:continue
 W+=w;rows+=1;first[a[0]]+=w;last[a[-1]]+=w
 for x in a:u[x]+=w
 for x,y in zip(a,a[1:]):b[x,y]+=w
 for x,y,z in zip(a,a[1:],a[2:]):t[x,y,z]+=w
 if len(a)==1:single[a[0]]+=w
 else:prefix[a[0],a[1]]+=w;suffix[a[-2],a[-1]]+=w
assert (rows,W)==(29157,1105285)
b[:29]+=np.einsum('i,j->ij',last,first)/W
b[29]=first
t[:29,:29]+=np.einsum('ij,k->ijk',suffix,first)/W+np.einsum('i,jk->ijk',last,prefix)/W+np.einsum('i,j,k->ijk',last,single,first)/W**2
p1=u/u.sum();p2=(b+20*p1)/(b.sum(axis=1)[:,None]+20);p3=(t+20*p2[None,:,:])/(t.sum(axis=2)[:,:,None]+20)
np.log(p3).astype('<f4').tofile(OUT/'model.bin')
g=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
assert g['translit']==TOKENS
C=[x for p in g['pages'][:3] for x in p['indices']][13:]
assert len(C)==716 and hashlib.sha256(bytes(C)).hexdigest()=='3e6191f2f5ab96359d9dbc27b223bd17d565f0e2978254e4b63041b61b2ed689'
def csv(name,a): (OUT/name).write_text(','.join(map(str,a)),encoding='ascii')
csv('original.txt',C)
lit=(ROOT/'resources/control/gibran_prophet_58585.txt').read_text(encoding='utf8')
P=[x for w in re.findall(r'[a-z]+',lit[lit.index('|Almustafa,'):],re.I) for x in encode(w)][:716]
assert len(P)==716
csv('plant_plain.txt',P)
k=[0,15,18,27,19,21,18,26,6,3,15,8,5];j=4;plant=[]
for x in P:
 if x==0:plant.append(0)
 else:plant.append((x+k[j%13])%29);j+=1
csv('plant_fhold.txt',plant)
csv('plant_nohold.txt',[(x+k[(4+i)%13])%29 for i,x in enumerate(P)])
v=0
for x in k[1:]:v=(v<<5)|x
(OUT/'plant_key.bin').write_bytes(struct.pack('<Q',v))
print('rows',rows,'word count',W,'model SHA256',hashlib.sha256((OUT/'model.bin').read_bytes()).hexdigest())
