from pathlib import Path
from collections import defaultdict, Counter
import cmudict, json, re, random, math, sys
M=2147483647
GP=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
MAP={v:i for i,v in enumerate(GP)}|{'ING':21,'IO':27}
TOKENS=sorted(MAP,key=lambda w:(-len(w),w))
def native(s):
 s=s.upper().replace('QU','CW').translate(str.maketrans('KQVZ','CCUS')); out=[]
 while s:
  t=next(x for x in TOKENS if s.startswith(x));out.append(MAP[t]);s=s[len(t):]
 return tuple(out)
WORDS=sorted({native(w) for w in cmudict.words() if re.fullmatch('[a-zA-Z]+',w)})
LEX=set(WORDS);BY=defaultdict(list)
for w in WORDS:BY[len(w)].append(w)

def load_source():
 root=Path(__file__).resolve().parents[1]
 corpus=root/'resources/liber-primus/lp2-corpus.json'
 if not corpus.exists():
  return json.loads(Path(__file__).with_name('source_fixture.json').read_text())
 j=json.loads(corpus.read_text(encoding='utf-8'));m={x:i for i,x in enumerate(j['runes'])}
 text=(root/'resources/liber-primus/lp2-transcription.txt').read_text(encoding='utf-8').split('%')[0]
 words=[tuple(m[x] for x in w if x in m) for w in re.split(r'[-.\s]+',re.sub(r'/\s*','',text)) if w]
 assert [v for w in words for v in w]==j['pages'][0]['indices']
 return {'p0':j['pages'][0]['indices'],'p0_lengths':[len(w) for w in words],'p57':j['pages'][57]['indices']}

def step(x):return x*16807%M
def key(x,scale):return x*29//M if scale else x%29

def transitions(c,prev,state,sign,scale):
 k=key(state,scale)
 yield (c-sign*k)%29,step(state),0
 if prev is None:return
 p=(prev-sign*k)%29
 if c==prev:
  x=step(state);s=1
  while key(x,scale)==k:
   yield p,step(x),s;x=step(x);s+=1
 else:
  x=step(state);s=1
  while key(x,scale)==k:x=step(x);s+=1
  if (p+sign*key(x,scale))%29==c:yield p,step(x),s

def paths(c,prev,state,sign,scale):
 rows=[((),state,())]
 for x in c:
  rows=[(p+(v,),n,s+(q,)) for p,st,s in rows for v,n,q in transitions(x,prev,st,sign,scale)]
  prev=x
 return rows

def replay(p,skips,state,prev,sign,scale):
 c=[]
 for v,n in zip(p,skips):
  for _ in range(n):
   assert prev is not None and (v+sign*key(state,scale))%29==prev
   state=step(state)
  x=(v+sign*key(state,scale))%29;c.append(x);prev=x;state=step(state)
 return c,state

def evaluate(c,lengths,state,prev,sign,scale,fragment=True):
 # Independently optimize matched word count and matched rune count over every skip history.
 states={state:((0,0,(),()),(0,0,(),()))};off=0;init=state;initial_prev=prev
 for wi,n in enumerate(lengths):
  out={};cs=c[off:off+n];off+=n
  complete=not(fragment and wi==len(lengths)-1)
  for st,recs in states.items():
   for p,ns,s in paths(cs,prev,st,sign,scale):
    hit=int(complete and p in LEX)
    a,b=tuple((r[0]+hit,r[1]+n*hit,r[2]+p,r[3]+s) for r in recs)
    old=out.get(ns)
    if old is None:out[ns]=(a,b)
    else:out[ns]=(max(old[0],a,key=lambda r:(r[0],r[1])),max(old[1],b,key=lambda r:(r[1],r[0])))
  states=out;prev=cs[-1]
 assert off==len(c)
 a=max((r[0] for r in states.values()),key=lambda r:(r[0],r[1]));b=max((r[1] for r in states.values()),key=lambda r:(r[1],r[0]))
 for v in (a,b):assert replay(v[2],v[3],init,initial_prev,sign,scale)[0]==c
 words=[];off=0
 for n in lengths:words.append(''.join(GP[x] for x in a[2][off:off+n]));off+=n
 return {'max_words':a[0],'max_runes':b[1],'wordmax_runes':a[1],'runemax_words':b[0],'terminal_states':len(states),'wordmax_skips':sum(a[3]),'wordmax_plain':' '.join(words)}

def encrypt(p,state,prev,sign,scale,seed):
 rng=random.Random(seed);c=[];skips=[]
 for v in p:
  q=0;x=(v+sign*key(state,scale))%29
  while prev is not None and x==prev and rng.random()>=.2:
   state=step(state);q+=1;x=(v+sign*key(state,scale))%29
  c.append(x);skips.append(q);prev=x;state=step(state)
 return c,skips

SURVIVORS=[('mod',-1,131372927,757117101,1,'NBYSTSJQ','RDJSE'),('mod',-1,166783872,1980925825,0,'PIKEUSUS','IYRUS'),('mod',-1,881531667,1670024062,0,'GBSQQUSE','YFXGS'),('mod',-1,1211452604,819450764,0,'HKSGTYJJ','EYITS'),('mod',-1,1457296463,1643085023,0,'UDTYPJS[','RYY[E'),('scale',-1,1419162270,1890129938,0,'FESKQTYJ','DFQQY')]

def main():
 src=load_source();p0=src['p0'];lengths=src['p0_lengths'];assert len(p0)==262 and lengths[:2]==[8,5] and sum(lengths)==262
 print('SOURCE p0',len(p0),'title',lengths[:2],'body',len(p0[13:]),'complete body words',len(lengths)-3,'lexicon',len(LEX))
 for projection,sign,seed,next_state,skip_count,s1,s2 in SURVIVORS:
  scale=projection=='scale';pt=tuple(ord(ch)-65 for ch in s1+s2)
  candidates=[s for p,st,s in paths(p0[:13],None,seed,sign,scale) if p==pt and st==next_state and sum(s)==skip_count]
  assert candidates and replay(pt,candidates[0],seed,None,sign,scale)==(p0[:13],next_state)
  for clock,st,prev in [('carry',next_state,p0[12]),('new_predecessor',next_state,None),('reset_seed',seed,None)]:
   print('ORIGINAL',projection,sign,seed,clock,json.dumps(evaluate(p0[13:],lengths[2:],st,prev,sign,scale)))
 p57=list(src['p57']);w57=[native(w) for w in 'PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE'.split()]
 assert list(v for w in w57 for v in w)==p57
 for sign in (1,-1):
  for scale in (False,True):
   c,s=encrypt(p57,3301,None,sign,scale,1033);assert replay(p57,s,3301,None,sign,scale)[0]==c
   r=evaluate(c,[len(w) for w in w57],3301,None,sign,scale,fragment=False)
   assert r['max_words']>=sum(w in LEX for w in w57)
   print('POSITIVE solved p57',sign,scale,'true skips',sum(s),'true lexical',sum(w in LEX for w in w57),'of',len(w57),'max',r['max_words'])
 rng=random.Random(3301);native_words=[rng.choice(BY[n]) for n in lengths[2:]];p=[v for w in native_words for v in w];assert len(p)==249
 for sign in (1,-1):
  for scale in (False,True):
   c,s=encrypt(p,3301,None,sign,scale,1033);r=evaluate(c,lengths[2:],3301,None,sign,scale);assert r['max_words']==len(lengths)-3 and r['max_runes']==248
   print('POSITIVE length-shaped',sign,scale,'true skips',sum(s),'words',r['max_words'],'runes',r['max_runes'])
if __name__=='__main__':main()
