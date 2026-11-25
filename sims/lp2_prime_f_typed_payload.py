"""Frozen historical formats on three #1498 prime/F paths and common tail."""
import base64, hashlib, json, random, re, zlib, bz2
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P = 97513779050322159297664671238670850085661086043266591739338007321
Q = 77506098606928780021829964781695212837195959082370473820509360759
N = P * Q
D = pow(65537, -1, (P-1)*(Q-1))
# Actual archived signed challenge, 2014/002-first-onion/1033.jpg.asc.
B64 = [
'eJwBswBM/zEwADE2MgBDeXBoZXJ0ZXh0LE2jxJS1EzMc80kOK+hra1GKnXgQKQgVitIy8NgA7kxn2u8jNQDvlu0uymNNiu6XVCCn66axGH0IZ9w4Af3K/yRgjObsfA1Q7QqpXNALJ9FFPgYl5rh07cBPM9kbSH6DynU/5cYgQod2KymjWcIvKx3FkjV4UOGakDnBf1eQp1uwvn3KxDVwTyzPqbMnZvOA06EcAfKtyz1hEK/UBXkeMeVrnV5SQQ==',
'eJwBzQAy/zEwADE4OABDeXBoZXJ0ZXh0Ca4y//uzl/HvFoP9Klf53nEFH0T4c+ui5de8+vqGOnZc9DlrsWQe+xxVaPaYgKAD9Wn9VWQ6A5o254r5pa4hkDIY5RRmVfqOm88HJpGdbGGTckyEwJapCLDTtHzZWAZ0FIVj6fH2whErHoVmZ82zQJ64OLtzr1gYk+2kIZuqtLclV9RDhs6j7meTaod2BDrF26tYd33awv0txxrgXRhd/FDFVtKb0K84cQs2xtO/9A0yLs5GEK2xpG2yM4AeWWft',
'eJwBzQAy/zEwADE4OABDeXBoZXJ0ZXh0B4KeBtKjJ7hGKC7/zqyzxUoFDTzRuU4+TLFUrw9qDGjkYI3fjyMn3G/w9WcfkZMGHdGRicbpTsDO3/oqmVtZpmIDY2HPOeWIZChuLfMDwT3FTUkDjQpsq390OJ90pArd1JRxdIZtnCvnVy/vg+1MjAFH3ta+CuAwHsIY/3lGOKTin1+5M30BKh7NOQMmBcJ8/RuLTfXMGQT01QVMeAGq6vORk3iw39KOLRU3Lcn1804G1/zd2mdFWvEMaTbu/F+7']
SQUARE = b'272     138     341     131     151\n366     199     130     320     18\n226     245     91      245     226\n18      320     130     199     366\n151     131     341     138     272'
TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4'

def integer(a):
    n = 0
    for x in a: n = n*29+x
    return n

def minimal(n): return n.to_bytes(max(1,(n.bit_length()+7)//8),'big')

def digits(n):
    a=[]
    while n: n,x=divmod(n,29); a.append(x)
    return a[::-1] or [0]

def envelope(b):
    try:
        d=zlib.decompressobj(); raw=d.decompress(b,1<<20)
        if not d.eof or d.unused_data or d.unconsumed_tail: return None
    except zlib.error: return None
    m=re.fullmatch(rb'10\0([1-9][0-9]*)\0Cyphertext(.*)',raw,re.S)
    return m[2] if m and int(m[1])==len(m[2]) else None

def mgf(seed,l,historical=True):
    return b''.join(hashlib.sha1(seed+(i if historical else i//20).to_bytes(4,'big')).digest() for i in range(0,l,20))[:l]

def xor(a,b): return bytes(x^y for x,y in zip(a,b))

def oaep(n,historical=True):
    if not 0<=n<N: return 'out_of_range',None
    m=pow(n,D,N)
    if m>=256**53: return 'width',None
    em=m.to_bytes(53,'big'); s,db=em[:20],em[20:]; seed=xor(s,mgf(db,20,historical)); db=xor(db,mgf(seed,len(db),historical))
    if not db.startswith(hashlib.sha1(b'').digest()): return 'label',None
    ps=db[20:].lstrip(b'\0')
    return ('valid',ps[1:]) if ps.startswith(b'\1') else ('delimiter',None)

def square(b):
    if b.endswith(b'\n'): b=b[:-1]
    rows=b.split(b'\n')
    if len(rows)!=5 or any(not re.fullmatch(rb'[1-9][0-9]*(?: +[1-9][0-9]*){4}',r) for r in rows): return False
    a=[list(map(int,r.split())) for r in rows]
    return all(sum(r)==1033 for r in a+list(zip(*a))) and sum(a[i][i] for i in range(5))==sum(a[i][4-i] for i in range(5))==1033

def bzip(b):
    try:
        d=bz2.BZ2Decompressor(); out=d.decompress(b,max_length=1<<20)
        return d.eof and not d.unused_data and bool(out)
    except (OSError,EOFError): return False

def inspect(a):
    n=integer(a); b=minimal(n); st,_=oaep(n)
    return dict(digits=len(a),bytes=len(b),prefix=b[:8].hex(),canonical=digits(n)==a,envelope=envelope(b) is not None,rsa=st,square=square(b),bzip=bzip(b),sha512=hashlib.sha512(b).hexdigest()==TARGET)

def main():
    assert [digits(x) for x in [3301,30,1033]]==[[3,26,24],[1,1],[1,6,18]]
    env=[envelope(base64.b64decode(x)) for x in B64]
    assert list(map(len,env))==[162,188,188]
    ct=[int.from_bytes(env[0][i:i+54],'big') for i in range(0,162,54)]
    actual=[oaep(x) for x in ct]; modern=[oaep(x,False) for x in ct]
    assert all(s=='valid' for s,_ in actual) and b''.join(v for _,v in actual)==b'\ncu343l33nqaekrnw.onion\n\n'
    assert all(s!='valid' for s,_ in modern)
    assert square(SQUARE) and not square(SQUARE+b'\n1')
    z=bz2.compress(SQUARE); assert bzip(z) and not bzip(z+b'X')
    pages=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text())['pages']
    cipher=[x for p in pages if p['page'] in [54,55] for x in p['indices']]
    assert len(cipher)==308
    primes=[]
    for p in range(2,4000):
        if all(p%q for q in primes if q*q<=p): primes.append(p)
    def enc(a,start):
        j=start; out=[]
        for x in a:
            out.append((x+primes[j]-1)%29 if x else 0); j+=bool(x)
        return out,j
    def dec(start,skip):
        j=start; a=[]
        for i,c in enumerate(cipher):
            if i in skip: assert c==0; a.append(0)
            else: a.append((c-primes[j]+1)%29); assert a[-1]!=0; j+=1
        assert j==472 and enc(a,start)==(cipher,472)
        return a
    shapes=[(167,[41,195,247]),(167,[65,195,247]),(168,[41,65,195,247])]
    tapes=[dec(*s) for s in shapes]; assert tapes[0][232:]==tapes[1][232:]==tapes[2][232:]
    tapes.append(tapes[0][232:]); shapes.append((397,[15]))
    rng=random.Random(2739); controls={k:0 for k in ['envelope','rsa','square','bzip','sha512']}
    for a,(start,skip) in zip(tapes,shapes):
        for _ in range(256):
            t=[0 if i in skip else rng.randrange(1,29) for i in range(len(a))]
            c,j=enc(t,start); assert j==472 and all(c[i]==0 for i in skip)
            out=inspect(t)
            for k in controls: controls[k]+=out[k]=='valid' if k=='rsa' else bool(out[k])
    result=dict(actual_2014_rsa=[s for s,_ in actual],standard_oaep=[s for s,_ in modern],envelope_payload_lengths=list(map(len,env)),square_control=True,bzip_synthetic_control=True,original=[inspect(a) for a in tapes],null_count=1024,null_matches=controls)
    print(json.dumps(result,indent=2)); return result

if __name__=='__main__': main()
