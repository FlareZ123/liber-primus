from pathlib import Path
import cmudict
import re
import hashlib
GP = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
MAP = {v:i for i,v in enumerate(GP)} | {'ING':21,'IO':27}
TOKENS = sorted(MAP,key=lambda w:(-len(w),w))
def native(s):
    s=s.upper().replace('QU','CW').translate(str.maketrans('KQVZ','CCUS'))
    out=[]
    while s:
        token=next((t for t in TOKENS if s.startswith(t)),None)
        if token is None: raise ValueError(s)
        out.append(MAP[token]);s=s[len(token):]
    return tuple(out)
words=sorted({w.upper() for w in cmudict.words() if re.fullmatch('[a-zA-Z]+',w)})
by={}
for w in words:
    t=native(w)
    if len(t) in (5,8): by.setdefault(t,w)
path=Path(__file__).with_name('title_lexicon.tsv')
path.write_text(''.join(''.join(chr(65+i) for i in t)+'\t'+w+'\n' for t,w in sorted(by.items())),encoding='ascii',newline='\n')
print('CMUdict',cmudict.__version__,'unique Latin',len(words),'GP lengths', {n:sum(len(t)==n for t in by) for n in (5,8)})
print('lexicon SHA256',hashlib.sha256(path.read_bytes()).hexdigest())
print('crib',native('EPIPHANY'),native('SEEKS'))

variants={t:(w,0) for t,w in by.items()}
for t,w in sorted(by.items()):
    for i in range(len(t)-1):
        if t[i]==t[i+1]: continue
        q=t[:i]+(t[i+1],t[i])+t[i+2:]
        variants.setdefault(q,(w,1))
path=Path(__file__).with_name('title_lexicon_swap.tsv')
path.write_text(''.join(''.join(chr(65+i) for i in t)+'\t'+w+'\t'+str(e)+'\n' for t,(w,e) in sorted(variants.items())),encoding='ascii',newline='\n')
print('swap variants',{(n,e):sum(len(t)==n and v[1]==e for t,v in variants.items()) for n in (5,8) for e in (0,1)})
print('swap SHA256',hashlib.sha256(path.read_bytes()).hexdigest())
