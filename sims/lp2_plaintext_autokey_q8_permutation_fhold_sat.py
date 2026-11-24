"""Native GP29 plaintext autokey with an arbitrary feedback permutation.
All possible transparent-F interpretations are encoded exactly by conditional lag edges.
A SAT witness is an intact-dictionary inverse, not an authenticated decryption.
"""
import argparse, ctypes as C, ctypes.util, json, os, random, re, time
from pathlib import Path
from collections import defaultdict

N=29
Q=8
ALPHA='0123456789abcdefghijklmnopqrs'

class NativeZ3:
    def __init__(self):
        lib=os.environ.get('Z3_LIBRARY') or ctypes.util.find_library('z3') or 'libz3.so.4'
        self.z=C.CDLL(lib); z=self.z
        z.Z3_mk_config.restype=C.c_void_p
        z.Z3_del_config.argtypes=[C.c_void_p]
        z.Z3_mk_context.argtypes=[C.c_void_p]; z.Z3_mk_context.restype=C.c_void_p
        z.Z3_del_context.argtypes=[C.c_void_p]
        z.Z3_eval_smtlib2_string.argtypes=[C.c_void_p,C.c_char_p]; z.Z3_eval_smtlib2_string.restype=C.c_char_p
        cfg=z.Z3_mk_config(); self.ctx=z.Z3_mk_context(cfg); z.Z3_del_config(cfg)
    def eval(self,s): return self.z.Z3_eval_smtlib2_string(self.ctx,s.encode()).decode()
    def close(self): self.z.Z3_del_context(self.ctx)

def decode_words(s):return [tuple(ALPHA.index(x) for x in w) for w in s.split()]
def fnv(s):
    h=2166136261
    for c in s:h=((h^ord(c))*16777619)&0xffffffff
    return h

def load_fixture(path,lexpath):
    if path:
        fixture=json.loads(Path(path).read_text())
        native={s['name']:decode_words(s['words']) for s in fixture['native']}
        original={k:decode_words(fixture[k]) for k in ('p0','p54')}
        translit=fixture['translit']
    else:
        root=Path(__file__).resolve().parent.parent
        gp=json.loads((root/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
        src=json.loads((root/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf8'))
        rune={x:i for i,x in enumerate(gp['runes'])}
        def parse(s):return [tuple(rune[c] for c in w) for w in re.findall(r'[\u16a0-\u16ff]+',s)]
        all_words=parse(re.sub(r'[\s/%]','',(root/'resources/lp2-transcription.txt').read_text(encoding='utf8')))[:2896]
        assert [p for w in all_words for p in w]==[p for page in gp['pages'][:56] for p in page['indices']]
        original={'p0':all_words[:158],'p54':all_words[-66:]}
        native={s['name']:parse(s['source_text']) for s in src['sections']}
        translit=gp['translit']; lexpath=lexpath or root/'resources/control/english_wordfreq_textblob.txt'
    assert [sum(map(len,original[k])) for k in ('p0','p54')]==[729,308]
    assert len(translit)==29
    lines=[(m[1],int(m[2])) for l in Path(lexpath).read_text(encoding='utf8').splitlines() if (m:=re.fullmatch(r'([a-z]+)\s+(\d+)',l))]
    assert len(lines)==29157 and fnv('\n'.join(f'{w} {n}' for w,n in lines))==3351310445,'lexical fixture differs'
    return original,native,translit,lines

def dictionary(native,translit,lines,min_freq=0):
    out=defaultdict(set); alpha={x:i for i,x in enumerate(translit)}
    def variants(w):
        s=w.upper().replace('QU','CW').replace('V','U').replace('K','C').replace('Q','C').replace('Z','S')
        def rec(i,p):
            if i==len(s):
                if p and len(p)<40:out[len(p)].add(tuple(p))
                return
            for ln in (1,2,3):
                a=s[i:i+ln]
                if len(a)!=ln:continue
                v=(21 if a=='ING' else None) if ln==3 else alpha.get(a)
                if v is not None:rec(i+ln,p+[v])
        rec(0,[])
    for w,n in lines:
        if len(w)>=2 and n>=min_freq:variants(w)
    for w in ('A','I','O'):variants(w)
    for words in native.values():
        for w in words:out[len(w)].add(w)
    return {k:sorted(v) for k,v in out.items()}

def prefix(words,n):
    out=[];count=0
    for w in words:
        if count>=n:break
        out.append(w);count+=len(w)
    return out

def longest_zero_free(words):
    best=[];run=[];offset=0;start=0;best_start=0
    for w in words:
        if 0 in w:run=[];start=offset+len(w)
        else:
            run.append(w)
            if sum(map(len,run))>sum(map(len,best)):best=run.copy();best_start=start
        offset+=len(w)
    return best,best_start

def encrypt(words,primer,table):
    q=list(primer);out=[]
    for w in words:
        cw=[]
        for p in w:
            if p==0:cw.append(0)
            else:cw.append((p+q.pop(0))%N);q.append(table[p])
        out.append(tuple(cw))
    return out

def formula(words,dicts,timeout_ms,known_map=None,known_plain=None):
    ct=[x for w in words for x in w];n=len(ct)
    opts=[f'(set-option :timeout {timeout_ms})','(set-option :produce-models true)']
    decl=[];clauses=[];pnames={};knames=[];pdom=[];wordvars=0;edge_n=0;imp_n=0
    def declare(x):decl.append(f'(declare-const {x} Bool)');return x
    def add(s):clauses.append(f'(assert {s})')
    def OR(xs):return 'false' if not xs else xs[0] if len(xs)==1 else '(or '+' '.join(xs)+')'
    def AND(xs):return 'true' if not xs else xs[0] if len(xs)==1 else '(and '+' '.join(xs)+')'
    def neg(x):return f'(not {x})'
    def atmost(xs,k):return 'true' if k>=len(xs) else f'((_ at-most {k}) '+ ' '.join(xs)+')'
    def atleast(xs,k):return 'true' if k==0 else f'((_ at-least {k}) '+' '.join(xs)+')'
    def exone(xs):add(OR(xs));add(atmost(xs,1))
    # Construct all exact intact-word candidate domains before declaring p variables.
    wi=0
    for w in words:
        candidates=[p for p in dicts[len(w)] if all(x==0 or y!=0 for x,y in zip(w,p))]
        if not candidates:return None,{'status':'unsat','reason':'empty word domain','wordOffset':wi}
        supports=[defaultdict(list) for _ in w];wv=[]
        for k,p in enumerate(candidates):
            name=declare(f'w{wi}_{k}');wv.append(name)
            for j,x in enumerate(p):supports[j][x].append(name)
        add(OR(wv));wordvars+=len(wv)
        for j,support in enumerate(supports):
            d=sorted(support);pdom.append(d);names=[]
            for x in d:
                pn=declare(f'p{wi+j}_{x}');pnames[wi+j,x]=pn;names.append(pn)
                ss=support[x]
                # Equivalence to set of candidate words with this symbol.
                add(OR([neg(pn),*ss]))
                for wn in ss:add(OR([neg(wn),pn]))
            exone(names)
        wi+=len(w)
    for x in range(1,N):
        row=[declare(f'k{x}_{v}') for v in range(N)];knames+=row;exone(row)
    for v in range(N):add(atmost([f'k{x}_{v}' for x in range(1,N)],1))
    if known_map is not None:
        for x in range(1,N):add(f'k{x}_{known_map[x]}')
    if known_plain is not None:
        for i,x in enumerate(known_plain):add(pnames[i,x])
    # A consuming position j supplies the shift at i iff q-1 positions
    # strictly between j and i consume. The actual hold mask is represented
    # by the native F plaintext literals p_z_0, not assumed from ciphertext F.
    for i in range(Q,n):
        for j in range(i-Q,-1,-1):
            holds=i-j-Q
            optional=[pnames[z,0] for z in range(j+1,i) if (z,0) in pnames]
            if holds>len(optional):break
            if not optional:g='true'
            else:
                g=declare(f'g{j}_{i}')
                if holds==0:expr=AND([neg(z) for z in optional])
                elif holds==len(optional):expr=AND(optional)
                else:expr=AND([atmost(optional,holds),atleast(optional,holds)])
                add(f'(= {g} {expr})')
            edge_n+=1
            for x in pdom[j]:
                if not x:continue
                for y in pdom[i]:
                    if not y:continue
                    v=(ct[i]-y)%N
                    add(OR(([neg(g)] if g!='true' else [])+[neg(pnames[j,x]),neg(pnames[i,y]),f'k{x}_{v}']))
                    imp_n+=1
                # Add converse support on each shift value, including impossible
                # outputs, to improve unit propagation without changing semantics.
                gate=([neg(g)] if g!='true' else [])+[neg(pnames[j,x])]
                if (i,0) in pnames:gate.append(pnames[i,0])
                for v in range(N):
                    y=(ct[i]-v)%N
                    add(OR(gate+[neg(f'k{x}_{v}')]+([pnames[i,y]] if y and (i,y) in pnames else [])))
    stats={'n':n,'words':len(words),'visibleFs':ct.count(0),'wordvars':wordvars,'variables':len(decl),'assertions':len(clauses),'edges':edge_n,'lag_implications':imp_n}
    return '\n'.join(opts+decl+clauses),stats

def solve(words,dicts,timeout_ms,known_map=None,known_plain=None):
    start=time.monotonic();script,stats=formula(words,dicts,timeout_ms,known_map,known_plain)
    if script is None:return stats
    solver=NativeZ3()
    try:
        status=solver.eval(script+'\n(check-sat-using sat)').strip();stats.update(status=status,seconds=round(time.monotonic()-start,3))
        if status=='sat':
            pn=re.findall(r'\(declare-const (p\d+_\d+) Bool\)',script);kn=re.findall(r'\(declare-const (k\d+_\d+) Bool\)',script)
            vals=solver.eval('(get-value ('+' '.join(pn+kn)+'))')
            pt=[None]*stats['n'];mp=[None]*N
            for i,x in re.findall(r'\(p(\d+)_(\d+) true\)',vals):pt[int(i)]=int(x)
            for x,v in re.findall(r'\(k(\d+)_(\d+) true\)',vals):mp[int(x)]=int(v)
            mp[0]=next(x for x in range(N) if x not in mp)
            assert None not in pt and sorted(mp)==list(range(N))
            ct=[x for w in words for x in w];cons=[(x,c) for x,c in zip(pt,ct) if x];key=[(c-x)%N for x,c in cons[:Q]];key+=(Q-len(key))*[0]
            ws=[];j=0
            for w in words:ws.append(tuple(pt[j:j+len(w)]));j+=len(w)
            assert all(w in dicts[len(w)] for w in ws)
            assert encrypt(ws,key,mp)==words,'exact forward replay'
            stats.update(key=key,map=mp,plaintext=' '.join(''.join(ALPHA[x] for x in w) for w in ws),hold_count=pt.count(0))
        elif status=='unknown':
            stats['reason']=solver.eval('(get-info :reason-unknown)').strip()
        return stats
    finally:solver.close()

def main():
    p=argparse.ArgumentParser();p.add_argument('--fixture');p.add_argument('--lex');p.add_argument('--target',choices=['p0','p54','control','control-known'],default='p54');p.add_argument('--scope',choices=['prefix','zero-free','full'],default='zero-free');p.add_argument('--timeout',type=int,default=30000);p.add_argument('--min-freq',type=int,default=0);p.add_argument('--prefix',type=int,default=200);a=p.parse_args()
    originals,native,translit,lines=load_fixture(a.fixture,a.lex);ds=dictionary(native,translit,lines,a.min_freq)
    if not a.min_freq:assert sum(map(len,ds.values()))==38920
    print(json.dumps({'lexicon':sum(map(len,ds.values())),'target':a.target,'scope':a.scope,'timeout_ms':a.timeout}),flush=True)
    truth=None;known=None;start=0
    if a.target.startswith('control'):
        truth=native['0_loss_of_divinity'];rng=random.Random(0x3301);table=list(range(N));rng.shuffle(table);key=[rng.randrange(N) for _ in range(Q)];words=encrypt(truth,key,table)
        if a.target=='control-known':known=table
    else:words=originals[a.target]
    if a.scope=='prefix':words=prefix(words,a.prefix)
    elif a.scope=='zero-free':words,start=longest_zero_free(words)
    res=solve(words,ds,a.timeout,known)
    res['source_start']=start
    if truth is not None and res['status']=='sat':
        t=[x for w in truth for x in w][start:start+res['n']];p=[x for w in decode_words(res['plaintext']) for x in w];res['true_matches']=sum(x==y for x,y in zip(t,p));res['map_matches']=sum(x==y for x,y in zip(res['map'],table))
    print(json.dumps(res),flush=True)
if __name__=='__main__':main()
