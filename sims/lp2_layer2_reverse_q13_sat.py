"""Exact reverse two-layer reachability, compressed phase SAT; Python 3 + libz3.
Run from repo root with no arguments, or --fixture path (one six-bit char/rune).
"""
import argparse, ctypes as ct, ctypes.util, importlib.util, json, os, pathlib, re, time

ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

def load(root, fixture):
    if fixture:
        packed = pathlib.Path(fixture).read_text().strip()
        nums = [ALPHABET.index(x) for x in packed]
        return [x % 32 for x in nums], [bool(x & 32) for x in nums]
    g = json.loads((root/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    trans = (root/'resources/transcriptions/lp2-image-corrected.txt').read_text(encoding='utf-8')
    mp = dict(zip(g['runes'], range(29)))
    words = re.findall(r'[\u16a0-\u16ff]+', re.sub(r'[\s/%]', '', trans))[:2896]
    tape = [mp[r] for w in words for r in w]
    starts = [i == 0 for w in words for i in range(len(w))]
    assert tape == [r for p in g['pages'][:56] for r in p['indices']]
    c, w = tape[9640:12648], starts[9640:12648]
    w[0] = True
    return c, w

class CNF:
    def __init__(self): self.n = 0; self.clauses = set()
    def var(self): self.n += 1; return self.n
    def add(self, *args):
        lits = frozenset(args)
        if any(-x in lits for x in lits): return
        self.clauses.add(tuple(sorted(lits)))
    def one(self, arr):
        self.add(*arr)
        for i,a in enumerate(arr):
            for b in arr[i+1:]: self.add(-a,-b)
    def imply(self, conditions, result): self.add(*(-x for x in conditions),result)
    def smt(self):
        lit = lambda x: f'v{x}' if x > 0 else f'(not v{-x})'
        yield '(set-logic QF_BV)'
        for i in range(1,self.n+1): yield f'(declare-const v{i} Bool)'
        for c in sorted(self.clauses):
            yield '(assert ' + ('false' if not c else lit(c[0]) if len(c)==1 else '(or '+' '.join(map(lit,c))+')') + ')'

def build(c,w,q,anchor=None, known_key=None):
    """A block is a maximal nonzero interval (split at anchor), or a single zero.
    One-hot phase per block; one Boolean hold per zero; key and key difference one-hot.
    Every clause is an implication of exactly the forward encryption/no-repeat rules.
    """
    n=len(c); assert n and len(w)==n and w[0] and all(0<=x<29 for x in c)
    if anchor is not None: assert 0<=anchor<n
    f=CNF(); K=[[f.var() for _ in range(29)] for _ in range(q)];D=[[f.var() for _ in range(29)] for _ in range(q)]
    for j in range(q):
        f.one(K[j]); f.one(D[j]);
        for a in range(29):
            for b in range(29): f.add(-K[(j-1)%q][a],-K[j][b],D[j][(b-a)%29])
    if known_key is not None:
        for j,k in enumerate(known_key): f.add(K[j][k])
    bounds=[0];i=0
    while i<n:
        j=i+1
        if c[i]!=0:
            while j<n and c[j]!=0 and j!=anchor: j+=1
        bounds.append(j);i=j
    blocks=list(zip(bounds,bounds[1:]));P=[[f.var() for _ in range(q)] for _ in blocks];H={i:f.var() for i,x in enumerate(c) if x==0}
    for bi,(lo,hi) in enumerate(blocks):
        f.one(P[bi]);
        if lo==anchor: f.add(P[bi][0])
        hold=H.get(lo)
        # Link adjacent blocks according to consuming length or literal Fehu hold.
        if bi+1<len(blocks):
            for j in range(q):
                if hold:
                    f.imply([P[bi][j],hold],P[bi+1][j]);f.imply([P[bi][j],-hold],P[bi+1][(j+1)%q])
                else: f.imply([P[bi][j]],P[bi+1][(j+hi-lo)%q])
        for i in range(lo,hi):
            curr_hold=H.get(i);prev_hold=H.get(i-1)
            if i and not w[i] and curr_hold and prev_hold: f.add(-curr_hold,-prev_hold)
            for j in range(q):
                phase=(j+i-lo)%q; active=[P[bi][j]]+([-curr_hold] if curr_hold else [])
                f.imply(active,-K[phase][c[i]])
                if i and not w[i]:
                    f.imply(active+([-prev_hold] if prev_hold else []),-D[phase][(c[i]-c[i-1])%29])
    return f,K,P,H,blocks

def solve(f, ask, timeout_ms):
    # Native Z3 API accepts SMT-LIB; use the dedicated Boolean SAT tactic.
    libpath=os.environ.get('Z3_LIBRARY') or ctypes.util.find_library('z3')
    if not libpath:
        spec=importlib.util.find_spec('z3')
        if spec and spec.origin:
            folder=pathlib.Path(spec.origin).parent/'lib'
            for name in ('libz3.dll','libz3.so','libz3.dylib'):
                if (folder/name).exists(): libpath=str(folder/name);break
    if not libpath: raise RuntimeError('Install z3-solver or set Z3_LIBRARY to the native library path.')
    lib=ct.CDLL(libpath)
    lib.Z3_mk_config.restype=ct.c_void_p
    lib.Z3_mk_context.argtypes=[ct.c_void_p];lib.Z3_mk_context.restype=ct.c_void_p
    lib.Z3_del_config.argtypes=[ct.c_void_p];lib.Z3_del_context.argtypes=[ct.c_void_p]
    lib.Z3_eval_smtlib2_string.argtypes=[ct.c_void_p,ct.c_char_p];lib.Z3_eval_smtlib2_string.restype=ct.c_char_p
    cfg=lib.Z3_mk_config();ctx=lib.Z3_mk_context(cfg);lib.Z3_del_config(cfg)
    text='\n'.join([f'(set-option :timeout {timeout_ms})',*f.smt(),'(check-sat-using (then simplify sat))'])
    try:
        response=lib.Z3_eval_smtlib2_string(ctx,text.encode()).decode().strip()
        result=response.splitlines()[0]
        model={}
        if result=='sat':
            resp=lib.Z3_eval_smtlib2_string(ctx,('(get-value ('+' '.join(f'v{x}' for x in ask)+'))').encode()).decode()
            model={int(a):b=='true' for a,b in re.findall(r'\(v(\d+) (true|false)\)',resp)}
            assert len(model)==len(set(ask)),resp
        return result,model,response
    finally: lib.Z3_del_context(ctx)

def run(c,w,q,anchor,timeout, known_key=None):
    started=time.monotonic();f,K,P,H,blocks=build(c,w,q,anchor,known_key)
    print(json.dumps({'stage':'built','runes':len(c),'q':q,'anchor':anchor,'variables':f.n,'clauses':len(f.clauses),'seconds':time.monotonic()-started}),flush=True)
    result,m,response=solve(f,[x for row in K for x in row]+P[0]+list(H.values()),timeout)
    out={'result':result,'response':response,'q':q,'anchor':anchor,'runes':len(c),'variables':f.n,'clauses':len(f.clauses),'seconds':time.monotonic()-started}
    if result=='sat':
        key=[next(i for i,x in enumerate(row) if m[x]) for row in K];phase=next(i for i,x in enumerate(P[0]) if m[x]);p=[];j=phase
        for i,x in enumerate(c):
            if i==anchor: assert j==0
            if i in H and m[H[i]]: p.append(0)
            else:
                y=(x-key[j])%29;assert y!=0;p.append(y);j=(j+1)%q
            assert w[i] or i==0 or p[-1]!=p[-2]
        j=phase;replay=[]
        for y in p:
            if y==0:replay.append(0)
            else:replay.append((y+key[j])%29);j=(j+1)%q
        assert replay==c
        out.update(key=key,phase=phase,holds=[i for i in H if m[H[i]]],replay=True,intermediate=p)
    print(json.dumps(out),flush=True)
    return out

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--fixture');ap.add_argument('--q',type=int,default=13);ap.add_argument('--timeout',type=int,default=300000);ap.add_argument('--limit',type=int,default=3008);ap.add_argument('--control',action='store_true');ap.add_argument('--native-fixture');ap.add_argument('--known',action='store_true');a=ap.parse_args()
    c,w=load(pathlib.Path(__file__).resolve().parents[1],a.fixture);c,w=c[:a.limit],w[:a.limit]
    if a.control:
        # Lossless anti-repeat control, native GP indices transported by two nonzero deltas.
        p=[];prev=0
        if a.native_fixture:
            donor = [ord(x)-65 for sec in json.loads(pathlib.Path(a.native_fixture).read_text())['native'] for x in sec['seq']]
        else:
            root=pathlib.Path(__file__).resolve().parents[1];gp=json.loads((root/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'));mp=dict(zip(gp['runes'],range(29)))
            nt=json.loads((root/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf-8'))
            donor=[mp[x] for sec in nt['sections'] for x in sec['source_text'] if x in mp]
        for x in donor:
            for d in [x//28+1,x%28+1]:prev=(prev+d)%29;p.append(prev)
        p=p[:len(c)];key=[(7+5*j+3*j*j)%29 for j in range(a.q)];phase=3%a.q;ct=[];j=phase
        for x in p:
            if x==0:ct.append(0)
            else:ct.append((x+key[j])%29);j=(j+1)%a.q
        anchor=min(45,len(c)-1);j=(phase+sum(x!=0 for x in p[:anchor]))%a.q;truth=key[j:]+key[:j]
        print(json.dumps({'control_true_key':truth,'phase':(phase-j)%a.q}),flush=True)
        out=run(ct,w,a.q,anchor,a.timeout,truth if a.known else None)
        assert out['result']!='unsat'
        if out['result']=='sat':
            print(json.dumps({'control_key_exact':out['key']==truth,'control_intermediate_exact':out['intermediate']==p,'matched_intermediate':sum(a==b for a,b in zip(out['intermediate'],p))}),flush=True)
    else:run(c,w,a.q,45 if len(c)>45 else None,a.timeout)
if __name__=='__main__': main()
