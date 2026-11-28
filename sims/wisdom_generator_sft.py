"""Exact generator-state test on preserved 2013 wisdom/folly bytes.
Run: python sims/wisdom_generator_sft.py (Python 3.10+, no packages).
"""
import argparse
import base64
import hashlib
import json
import random
import time
from pathlib import Path

N, M, W, A = 624, 397, 32, 0x9908B0DF
MASK32 = (1 << 32) - 1
T32 = [(-11,MASK32),(7,0x9D2C5680),(15,0xEFC60000),(-18,MASK32)]
T64 = [(-29,0x5555555555555555),(17,0x71D67FFFEDA60000),(37,0xFFF7EEE000000000),(-43,(1<<64)-1)]


def temper(x, transforms):
    for shift,mask in transforms:
        x ^= (x<<shift if shift>0 else x>>-shift)&mask
    return x


def untemper(y, transforms, bits):
    for shift,mask in reversed(transforms):
        x=y
        for _ in range((bits+abs(shift)-1)//abs(shift)):
            x=y^((x<<shift if shift>0 else x>>-shift)&mask)
        y=x
    return y


def extend_state(initial, length, bits):
    n,m,a=(624,397,0x9908B0DF) if bits==32 else (312,156,0xB5026F5AA96619E9)
    low=(1<<31)-1
    high=((1<<bits)-1)^low
    out=initial.copy()
    for i in range(length-n):
        y=(out[i]&high)|(out[i+1]&low)
        out.append(out[i+m]^(y>>1)^(a if y&1 else 0))
    return out[:length]


def packed_test(data,bits,endian):
    width=bits//8
    n=624 if bits==32 else 312
    transforms=T32 if bits==32 else T64
    values=[int.from_bytes(data[i:i+width],endian) for i in range(0,len(data)-width+1,width)]
    assert len(values)>n
    state=[untemper(v,transforms,bits) for v in values[:n]]
    predicted=[temper(v,transforms) for v in extend_state(state,len(values),bits)]
    assert predicted[:n]==values[:n]
    errors=[i for i in range(n,len(values)) if predicted[i]!=values[i]]
    return dict(bits=bits,endian=endian,training_words=n,held_words=len(values)-n,
                held_equal=len(values)-n-len(errors),first_mismatch_word=errors[0] if errors else None)


def symbolic_temper(w):
    x=w
    for shift,mask in T32:
        x=[v^(x[j-shift] if 0<=j-shift<W and (mask>>j)&1 else 0) for j,v in enumerate(x)]
    return x


def symbolic_words(count):
    # Augmented RHS is bit zero. State variables are bits 1..19968.
    ring=[[1<<(1+i*W+j) for j in range(W)] for i in range(N)]
    for k in range(count):
        if k<N:
            w=ring[k]
        else:
            i=k%N
            x,y,z=ring[i],ring[(i+1)%N],ring[(i+M)%N]
            w=[z[j]^(y[j+1] if j<30 else x[31] if j==30 else 0)^(y[0] if (A>>j)&1 else 0) for j in range(W)]
            ring[i]=w
        yield w


def truncated_test(data,bit_offset,stride,fit=3000):
    """Fit unrestricted untempered state; stop on exact GF(2) contradiction."""
    pivots=[0]*(N*W+1)
    rank=0
    words=symbolic_words(len(data)*stride)
    start=time.monotonic()
    for i in range(fit):
        if i:
            for _ in range(stride-1):next(words)
        w=symbolic_temper(next(words))
        for b in range(8):
            row=w[bit_offset+b]|((data[i]>>b)&1)
            while row>1:
                p=row.bit_length()-1
                v=pivots[p]
                if not v:
                    pivots[p]=row;rank+=1;break
                row^=v
            else:
                if row==1:
                    return dict(offset=bit_offset,stride=stride,status='inconsistent',contradiction_byte=i,
                                contradiction_bit=b,rank=rank,equations=8*i+b+1,elapsed_s=round(time.monotonic()-start,3))
    solution=1
    for p in range(1,len(pivots)):
        if pivots[p] and (pivots[p]&solution).bit_count()&1:solution|=1<<p
    assert all(not (row&solution).bit_count()&1 for row in pivots if row)
    state=[(solution>>(1+W*i))&MASK32 for i in range(N)]
    generated=extend_state(state,(len(data)-1)*stride+1,32)
    prediction=bytes((temper(generated[i*stride],T32)>>bit_offset)&255 for i in range(len(data)))
    assert prediction[:fit]==data[:fit]
    held_equal=sum(a==b for a,b in zip(prediction[fit:],data[fit:]))
    # Distinguish exact predictions from arbitrary choices of free state bits.
    # Freeze the prefix echelon basis; separately extend a copy for consistency.
    extended=pivots.copy();full_rank=rank;forced_bits=forced_bytes=forced_wrong=0
    full_contradiction=None
    for i in range(fit,len(data)):
        for _ in range(stride-1):next(words)
        w=symbolic_temper(next(words));byte_fixed=True
        for b in range(8):
            row=w[bit_offset+b]|((data[i]>>b)&1)
            v=row
            while v>1:
                p=v.bit_length()-1
                if not pivots[p]:break
                v^=pivots[p]
            if v<=1:forced_bits+=1;forced_wrong+=v
            else:byte_fixed=False
            if full_contradiction is None:
                while row>1:
                    p=row.bit_length()-1
                    if extended[p]:row^=extended[p]
                    else:extended[p]=row;full_rank+=1;break
                else:
                    if row==1:full_contradiction=[i,b]
        forced_bytes+=byte_fixed
    return dict(offset=bit_offset,stride=stride,status='consistent_fit',rank=rank,equations=fit*8,
                training_bytes=fit,held_bytes=len(data)-fit,arbitrary_state_held_equal=held_equal,
                forced_held_bits=forced_bits,forced_held_bytes=forced_bytes,forced_wrong_bits=forced_wrong,
                full_rank=full_rank,full_contradiction=full_contradiction,
                elapsed_s=round(time.monotonic()-start,3))


def java_nextbytes(data):
    # java.util.Random.nextBytes emits little-endian nextInt chunks.
    a,c,mask=0x5DEECE66D,11,(1<<48)-1
    values=[int.from_bytes(data[i:i+4],'little') for i in range(0,len(data),4)]
    first,second=values[:2]
    candidates=[(first<<16)|low for low in range(1<<16) if ((a*((first<<16)|low)+c)&mask)>>16==second]
    survivors=candidates.copy();i=1
    while survivors and i<len(values):
        survivors=[(a*s+c)&mask for s in survivors]
        survivors=[s for s in survivors if s>>16==values[i]]
        if survivors:i+=1
    return dict(first_two_candidates=len(candidates),all_words_candidates=len(survivors),
                first_mismatch_word=i if i<len(values) else None,words=len(values))


def glibc_lowbyte(data):
    # Degree-31 separation-3 additive random()/rand() recurrence.
    bad=[i for i in range(31,len(data)) if ((data[i]-data[i-31]-data[i-3])&255) not in (0,1)]
    return dict(comparisons=len(data)-31,violations=len(bad),first_mismatch_byte=bad[0] if bad else None)


def mt64_seeded(seed,count):
    # Reference 2004 initialization, checked against known C++ standard output.
    mask=(1<<64)-1
    state=[seed]
    for i in range(1,312):state.append((6364136223846793005*(state[-1]^(state[-1]>>62))+i)&mask)
    return [temper(x,T64) for x in extend_state(state,312+count,64)[312:]]


def plant_bytes(seed,count,offset,stride):
    rng=random.Random(seed);out=bytearray()
    for _ in range(count):
        out.append((rng.getrandbits(32)>>offset)&255)
        for _ in range(stride-1):rng.getrandbits(32)
    return bytes(out)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',type=Path,default=Path('resources/historical/cicada-2013-os-wisdom-folly.bin.b64'))
    parser.add_argument('--skip-controls',action='store_true')
    parser.add_argument('--truncated',choices=['all','top','low','float','lowstride2'],default='all')
    args=parser.parse_args()
    data=base64.b64decode(args.source.read_text(encoding='ascii'))
    assert len(data)==3368 and hashlib.sha256(data).hexdigest()=='7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a'
    result=dict(source_sha256=hashlib.sha256(data).hexdigest(),length=len(data),packed=[],truncated=[],controls=[],framed={})
    rng=random.Random(761)
    p32=[rng.getrandbits(32) for _ in range(len(data)//4)]
    p64=mt64_seeded(5489,len(data)//8)
    assert p64[:3]==[14514284786278117030,4620546740167642908,13109570281517897720]
    for bits,plant in [(32,p32),(64,p64)]:
        for endian in ['little','big']:
            p=b''.join(x.to_bytes(bits//8,endian) for x in plant)
            c=packed_test(p,bits,endian);assert c['held_equal']==c['held_words']
            result['controls'].append(dict(kind='packed',**c))
            result['packed'].append(packed_test(data,bits,endian))
    result['framed']['packed']=[packed_test(data[4:],bits,endian) for bits in [32,64] for endian in ['little','big']]
    state=0x123456789ABC;p=bytearray()
    for _ in range(len(data)//4):
        state=(0x5DEECE66D*state+11)&((1<<48)-1);p.extend((state>>16).to_bytes(4,'little'))
    j=java_nextbytes(bytes(p));assert j['all_words_candidates']==1
    result['java']=java_nextbytes(data);result['framed']['java']=java_nextbytes(data[4:]);result['controls'].append(dict(kind='java',**j))
    rng=random.Random(3301);state=[rng.getrandbits(32) for _ in range(31)]
    for i in range(31,len(data)):state.append((state[i-31]+state[i-3])&MASK32)
    c=glibc_lowbyte(bytes((x>>1)&255 for x in state));assert c['violations']==0
    result['glibc']=glibc_lowbyte(data);result['framed']['glibc']=glibc_lowbyte(data[4:]);result['controls'].append(dict(kind='glibc',**c))
    result['framed']['truncated']=[]
    print(json.dumps({k:v for k,v in result.items() if k!='truncated'},indent=2),flush=True)
    for name,offset,stride in [('top',24,1),('low',0,1),('float',24,2),('lowstride2',0,2)]:
        if args.truncated!='all' and args.truncated!=name:continue
        x=truncated_test(data,offset,stride)
        result['truncated'].append(dict(kind=name,**x));print('original',json.dumps(dict(kind=name,**x)),flush=True)
        f=truncated_test(data[4:],offset,stride)
        result['framed']['truncated'].append(dict(kind=name,**f));print('four-byte frame',json.dumps(dict(kind=name,**f)),flush=True)
        if not args.skip_controls:
            p=plant_bytes(1033+offset+stride,len(data),offset,stride)
            if name=='float':
                rng=random.Random(1033+offset+stride);assert p==bytes(int(rng.random()*256) for _ in range(len(data)))
            c=truncated_test(p,offset,stride)
            assert c['status']=='consistent_fit' and c['full_contradiction'] is None and c['forced_wrong_bits']==0,c
            if c['forced_held_bytes']==c['held_bytes']:assert c['arbitrary_state_held_equal']==c['held_bytes'],c
            result['controls'].append(dict(kind=name,**c));print('plant',json.dumps(dict(kind=name,**c)),flush=True)
    print('RESULT_JSON='+json.dumps(result,sort_keys=True),flush=True)

if __name__=='__main__':main()
