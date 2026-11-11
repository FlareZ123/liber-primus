#!/usr/bin/env python3
"""Reproduce the p57 stipple -> p32 prime-index -> GF(29^2) period-pair lead.

Run: python sims/cicada_stipple_p32_gf841_period_pair_sft.py
Requires numpy and opencv-python-headless. Inputs are local repository files.
"""
from __future__ import annotations
import json, math, re
from pathlib import Path
import cv2
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
MOD=29
P32_FIRST_CLAUSE_RUNES=33
PARABLE_OPENING_WORDS=7

def readj(p): return json.loads((ROOT/p).read_text(encoding="utf-8"))
def isprime(n):
    if n<2:return False
    if n%2==0:return n==2
    d=3
    while d*d<=n:
        if n%d==0:return False
        d+=2
    return True
def primepi(n):
    assert isprime(n)
    return sum(isprime(k) for k in range(2,n+1))
def add(x,y): return ((x[0]+y[0])%MOD,(x[1]+y[1])%MOD)
def sub(x,y): return ((x[0]-y[0])%MOD,(x[1]-y[1])%MOD)
def mul(x,y):
    a,b=x;c,d=y
    return ((a*c+8*b*d)%MOD,(a*d+b*c+3*b*d)%MOD)
def power(x,n):
    out,base=(1,0),x
    while n:
        if n&1:out=mul(out,base)
        base=mul(base,base);n>>=1
    return out
def order(x):
    v=(1,0)
    for k in range(1,MOD*MOD):
        v=mul(v,x)
        if v==(1,0):return k
    raise AssertionError("nonzero element has no finite order")
def quotient_pairs(data):
    assert len(data)==256
    w=[int(x)%MOD for x in data];q=[]
    for i in range(254):
        x=w[i];q.append(x)
        w[i+1]=(w[i+1]-10*x)%MOD
        w[i+2]=(w[i+2]-25*x)%MOD
    assert w[254:]==[0,0]
    return [(q[2*j],q[2*j+1]) for j in range(127)]
def native_gp(text,translit):
    tokens=sorted(enumerate(translit),key=lambda z:len(z[1]),reverse=True)
    text=(text.upper().replace("QU","CW").replace("V","U")
          .replace("K","C").replace("Z","S").replace("ING","NG"))
    out=[]
    for word in re.findall(r"[A-Z]+",text):
        parsed=[];pos=0
        while pos<len(word):
            hit=next(((i,t) for i,t in tokens if word.startswith(t,pos)),None)
            if hit is None:parsed=[];break
            i,t=hit;parsed.append(i);pos+=len(t)
        out.extend(parsed)
    return out
def ioc(a):
    h=[0]*MOD
    for x in a:h[x]+=1
    n=len(a)
    return sum(x*(x-1) for x in h)/(n*(n-1))
def train(a):
    h={}
    for i in range(len(a)-2):
        k=a[i]*841+a[i+1]*29+a[i+2];h[k]=h.get(k,0)+1
    return h,len(a)-2
def score(a,m):
    h,n=m;d=n+0.1*MOD**3;s=0.0
    for i in range(len(a)-2):
        k=a[i]*841+a[i+1]*29+a[i+2]
        s+=math.log((h.get(k,0)+0.1)/d)
    return s/(len(a)-2)
def windows(a,m,size,count=300):
    end=len(a)-size
    v=[score(a[int(i*end/(count-1)):int(i*end/(count-1))+size],m)
       for i in range(count)]
    v.sort()
    return {"length":len(a),"windows":count,"min":v[0],
            "median":v[count//2],"max":v[-1]}
def image_counts():
    path=ROOT/"resources/liber-primus/74.jpg"
    gray=cv2.imread(str(path),cv2.IMREAD_GRAYSCALE)
    assert gray is not None and gray.shape[0]>=3450 and gray.shape[1]>=2050
    crop=gray[1900:3450,350:2050];out=[];ref=None
    for threshold in (40,80,120,160,200):
        n,_labels,stats,centers=cv2.connectedComponentsWithStats(
            (crop<=threshold).astype(np.uint8),8)
        areas=stats[1:,cv2.CC_STAT_AREA];assert n-1==574
        big=np.argsort(areas)[-2:];keep=np.ones(len(areas),dtype=bool);keep[big]=False
        x=centers[1:,0]+350;y=centers[1:,1]+1900
        left=int(np.sum(keep&(x<1200)));right=int(np.sum(keep&(x>=1200)))
        large=sorted([{"area":int(areas[i]),"x":round(float(x[i]),3),
                       "y":round(float(y[i]),3)} for i in big],
                     key=lambda z:z["area"])
        out.append({"threshold":threshold,"components":n-1,
                    "small_left":left,"small_right":right,"largest":large})
        ref=(left,right,[z["area"] for z in large])
    assert ref==(241,331,[1027,12821])
    assert all((x["small_left"],x["small_right"],
                [z["area"] for z in x["largest"]])==ref for x in out)
    return out
def decode(data,states,sign):
    out=[]
    for i,s in enumerate(states):
        c=(data[2*i],data[2*i+1]);p=sub(c,s) if sign==-1 else add(c,s)
        out.extend(p)
    return out
def encode(data,states,sign):
    out=[]
    for i,s in enumerate(states):
        p=(data[2*i],data[2*i+1]);c=add(p,s) if sign==-1 else sub(p,s)
        out.extend(c)
    return out

def main():
    corpus=readj("resources/liber-primus/lp2-corpus.json")
    ink=readj("resources/liber-primus/lp2-ink-annotations.json")
    grid=readj("resources/liber-primus/lp2-grid-256.json")
    pages={p["page"]:p["indices"] for p in corpus["pages"]}
    ann={p["page"]:p for p in ink["pages"]}
    prime=corpus["prime"]
    img=image_counts()

    left,right=241,331
    assert primepi(left)==53 and primepi(right)==67
    p32=pages[32];assert len(p32)==121
    p32p=[prime[x] for x in p32];a,b=p32p[53],p32p[67]
    assert (a,b)==(101,11) and abs(a-b)==right-left==90
    assert (53+67,67-53)==(120,14)
    assert (53//11,53%11,67//11,67%11)==(4,9,6,1)
    assert (4+6,9+1)==(10,10)
    one_based=(p32p[52],p32p[66])
    assert one_based==(29,53) and abs(one_based[0]-one_based[1])==24

    splits=[]
    for l in range(2,572):
        r=572-l
        if l<=r and isprime(l) and isprime(r):
            x,y=primepi(l),primepi(r)
            splits.append({"left":l,"right":r,"ord_left":x,"ord_right":y,
                           "ord_sum":x+y,"ord_gap":y-x})
    selected=[x for x in splits if x["ord_sum"]==120 and x["ord_gap"]==14]
    assert len(splits)==11 and selected==[
        {"left":241,"right":331,"ord_left":53,"ord_right":67,
         "ord_sum":120,"ord_gap":14}]
    antipodal=[{"i":i,"j":120-i,"prime_i":p32p[i],
                "prime_j":p32p[120-i],
                "difference":abs(p32p[i]-p32p[120-i])} for i in range(60)]
    antipodal90=[x for x in antipodal if x["difference"]==90]
    assert len(antipodal90)==3 and any(x["i"]==53 and x["j"]==67 for x in antipodal90)
    hits=sum(abs(p32p[i]-p32p[j])==90 for i in range(121) for j in range(i+1,121))
    assert (hits,121*120//2)==(78,7260)

    p3s=next(s for s in ann[3]["red_spans"] if s["start"]==119 and s["length"]==3)
    p3v=[prime[x] for x in pages[3][p3s["start"]:p3s["start"]+3]]
    assert p3v==[13,23,2]
    inv2=pow(2,-1,MOD);u2=((-13*inv2)%MOD,(-23*inv2)%MOD)
    assert u2==(8,3)
    u=(0,1);assert order(u)==840
    z84=(a%MOD,b%MOD);z10=(b%MOD,a%MOD)
    assert z84==(14,11) and z10==(11,14)
    assert power(u,50)==z84 and order(z84)==84
    assert power(u,588)==z10 and order(z10)==10
    assert power(z84,3)==(2,0) and power(z84,42)==(28,0)
    assert power(z10,5)==(28,0)
    product_order=order(mul(z84,z10))
    assert product_order==math.lcm(84,10)==420

    p53s=next(s for s in ann[53]["red_spans"] if s["start"]==128 and s["length"]==51)
    p57s=next(s for s in ann[57]["red_spans"] if s["start"]==0 and s["length"]==7)
    parable=[prime[x] for x in pages[57][:7]]
    assert parable==[43,97,11,97,61,73,67]
    dots13=ink["counts"]["red13"]+ink["counts"]["black13"]
    ten_marks=[m for p in ink["pages"] for m in p.get("large_punctuation",[]) if m[1]==10]
    assert dots13==31 and len(ten_marks)==4
    assert p53s["length"]+dots13==82
    assert PARABLE_OPENING_WORDS*82==574
    assert p53s["length"]+P32_FIRST_CLAUSE_RUNES==84
    assert 84+parable[0]==127 and p57s["length"]==7

    all_cipher=[x for p in sorted(
        [p for p in corpus["pages"] if p["page"]<=55],key=lambda p:p["page"])
        for x in p["indices"]]
    payload=all_cipher[2:]
    assert len(all_cipher)==12956 and all_cipher[:2]==[15,8]
    assert len(payload)==12954==51*127*2
    red=pages[53][128:179];assert len(red)==51
    bytes_=[x for p in grid["pages"] for x in p["bytes"]]
    q=quotient_pairs(bytes_);assert len(q)==127

    direct=[]
    for r in range(51):
        row=power(z84,red[r])
        for j in range(127):
            direct.append(mul(mul(row,power(z10,j)),q[j]))
    feedback={}
    for update in (-1,1):
        states=[]
        for r in range(51):
            s=power(z84,red[r])
            for j in range(127):
                states.append(s);v=mul(z10,s)
                s=add(v,q[j]) if update==1 else sub(v,q[j])
        feedback[update]=states

    controls=ROOT/"resources/control"
    sh=native_gp((controls/"shakespeare_first300k.txt").read_text(encoding="utf-8"),corpus["translit"])
    gi=native_gp((controls/"gibran_prophet_58585.txt").read_text(encoding="utf-8"),corpus["translit"])
    em=native_gp((controls/"emerson_essays_2944.txt").read_text(encoding="utf-8"),corpus["translit"])
    model=train(sh);plant=sh[:len(payload)]
    assert len(plant)==len(payload)
    raw={"ioc":ioc(payload),"trigram":score(payload,model)}
    native={"shakespeare":windows(sh,model,len(payload)),
            "gibran":windows(gi,model,len(payload)),
            "emerson":windows(em,model,len(payload))}
    variants=[]
    for sign in (-1,1):
        p=decode(payload,direct,sign)
        assert encode(p,direct,sign)==payload
        assert decode(encode(plant,direct,sign),direct,sign)==plant
        variants.append({"family":"direct mask","output":"C-S" if sign==-1 else "C+S",
                         "ioc":ioc(p),"trigram":score(p,model),
                         "original_roundtrip":True,"plant_recovered":len(plant)})
    for update,states in feedback.items():
        for sign in (-1,1):
            p=decode(payload,states,sign)
            assert encode(p,states,sign)==payload
            assert decode(encode(plant,states,sign),states,sign)==plant
            variants.append({"family":"row-reset feedback",
                "update":"z10*S+Q" if update==1 else "z10*S-Q",
                "output":"C-S" if sign==-1 else "C+S",
                "ioc":ioc(p),"trigram":score(p,model),
                "original_roundtrip":True,"plant_recovered":len(plant)})
    best=max(variants,key=lambda x:x["trigram"])
    worst_native=min(x["min"] for x in native.values())
    print(json.dumps({
        "image_thresholds":img,
        "stipple":{"all":574,"large_areas":[1027,12821],"small":572,
                   "left":241,"right":331,"prime_ordinals":[53,67]},
        "p32":{"runes":121,"zero_based_offsets":[53,67],"cells":[[4,9],[6,1]],
               "center":[5,5],"prime_weights":[a,b],"gap":90,
               "one_based_comparator":list(one_based),
               "prime_splits_of_572":splits,"selected_split":selected,
               "antipodal_gap90":antipodal90,
               "random_permutation_diagnostic":{"hits":hits,"pairs":7260,
                                                  "probability":hits/7260}},
        "field":{"p3_red_polynomial":p3v,"u_squared":[8,3],"order_u":840,
                 "left_to_right":{"element":list(z84),"log_u":50,"order":84,
                                  "cube":list(power(z84,3)),
                                  "42nd_power":list(power(z84,42))},
                 "right_to_left":{"element":list(z10),"log_u":588,"order":10,
                                  "5th_power":list(power(z10,5))},
                 "product_order":product_order,"lcm":420,"period_product":840},
        "source_arithmetic":{"p53_red":51,"p32_first_clause":33,
             "p57_PARABLE_first_prime":parable[0],"ten_dot_size":10,
             "thirteen_dot_marks":dots13,"opening_words":PARABLE_OPENING_WORDS,
             "51_plus_31":82,"7_times_82":574,"51_plus_33":84,"84_plus_43":127},
        "register":{"payload_runes":len(payload),"rows":51,"columns":127,
                    "raw":raw,"native_windows":native,"variants":variants,
                    "best":best,"gap_below_worst_native_min":worst_native-best["trigram"]},
        "interpretation":"Exact source-derived selector candidate; the tested fixed mask and feedback variants invert native-GP plants and re-encrypt the original, but remain nonlinguistic on the original. No plaintext or authentic key recovered."
    },indent=2))

if __name__=="__main__":main()
