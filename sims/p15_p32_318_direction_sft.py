#!/usr/bin/env python3
"""Reproduce the provisional p15 -> p32 318-degree map/direction hypothesis.

The p32 11x11 reshape and image tiling are inferred, not printed instructions.
This is a navigation hypothesis, not a cipher or plaintext recovery.
"""
from pathlib import Path
import itertools, json, math

GP={
"ᚠ":(2,"F"),"ᚢ":(3,"U"),"ᚦ":(5,"TH"),"ᚩ":(7,"O"),"ᚱ":(11,"R"),
"ᚳ":(13,"K"),"ᚷ":(17,"G"),"ᚹ":(19,"W"),"ᚻ":(23,"H"),"ᚾ":(29,"N"),
"ᛁ":(31,"I"),"ᛄ":(37,"J"),"ᛇ":(41,"EO"),"ᛈ":(43,"P"),"ᛉ":(47,"X"),
"ᛋ":(53,"S"),"ᛏ":(59,"T"),"ᛒ":(61,"B"),"ᛖ":(67,"E"),"ᛗ":(71,"M"),
"ᛚ":(73,"L"),"ᛝ":(79,"NG"),"ᛟ":(83,"OE"),"ᛞ":(89,"D"),"ᚪ":(97,"A"),
"ᚫ":(101,"AE"),"ᚣ":(103,"Y"),"ᛡ":(107,"IA"),"ᛠ":(109,"EA")}
WORD_LENGTHS=[1,3,5,11,5,5,3,11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]
P15=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]]
CW=[(1,1),(1,2),(2,2),(2,1),(2,0),(1,0),(0,0),(0,1),(0,2),(0,3),(1,3),(2,3),(3,3),(3,2),(3,1),(3,0)]
CCW=[(1,1),(2,1),(2,2),(1,2),(0,2),(0,1),(0,0),(1,0),(2,0),(3,0),(3,1),(3,2),(3,3),(2,3),(1,3),(0,3)]

def prime(n):
    if n<2:return False
    if n%2==0:return n==2
    d=3
    while d*d<=n:
        if n%d==0:return False
        d+=2
    return True

def rank(n):
    assert prime(n)
    return sum(prime(k) for k in range(2,n+1))

def factors(n):
    out=[];d=2
    while d*d<=n:
        while n%d==0:out.append(d);n//=d
        d+=1
    if n>1:out.append(n)
    return out

def bearing(a,b):
    return math.degrees(math.atan2(b[0]-a[0],a[1]-b[1]))%360

def err(a,b):return abs((a-b+180)%360-180)

def main():
    src=Path(__file__).resolve().parents[1]/"resources/liber-primus/lp2-transcription.txt"
    pages=src.read_text(encoding="utf-8").split("%")
    p32=[c for c in pages[32] if c in GP]
    p0=[c for c in pages[0] if c in GP]
    assert len(p32)==121
    m=[p32[i*11:(i+1)*11] for i in range(11)]
    v=[[GP[c][0] for c in row] for row in m]
    x=[0];y=[0]
    for q in v[0]:x.append(x[-1]+q)
    for row in v:y.append(y[-1]+row[0])
    assert (x[-1],y[-1])==(563,569)

    cw=[P15[r][c] for r,c in CW]
    ccw=[P15[r][c] for r,c in CCW]
    assert cw[10]==2838 and ccw[10]==1206
    q=3301-cw[10];f=rank(q)-1
    assert (q,f)==(463,89)

    words=[];pos=0
    for i,L in enumerate(WORD_LENGTHS,1):
        words.append((i,pos,L,p32[pos:pos+L]));pos+=L
    assert pos==121
    home,buds=words[7],words[15]
    tr=lambda s:"".join(GP[c][1] for c in s)
    assert (home[1],home[2],tr(home[3][:4]))==(33,11,"HOME")
    assert (buds[1],buds[2],tr(buds[3][-4:]))==(89,8,"BUDS")
    assert f==buds[1]

    hc=((x[0]+x[4])/2,(y[3]+y[4])/2)
    bc=((x[5]+x[9])/2,(y[8]+y[9])/2)
    ob=bearing(bc,(0,0));hb=bearing(bc,hc)
    vx,vy=-bc[0],-bc[1];wx,wy=hc[0]-bc[0],hc[1]-bc[1]
    cross=abs(vx*wy-vy*wx)/math.hypot(vx,vy)
    a=math.radians(318);dx,dy=math.sin(a),-math.cos(a)
    top_x=bc[0]+bc[1]/(-dy)*dx

    diag=[(4,1),(5,2),(6,3),(7,4)]
    do=[r*11+c for r,c in diag]
    dr=[m[r][c] for r,c in diag]
    dt=[GP[c][1] for c in dr];dw=[GP[c][0] for c in dr]
    assert do==[45,57,69,81] and dt==["B","M","IA","NG"] and sum(dw)==318

    def edges(L,single):
        out=[]
        for n,start,size,seq in words:
            if size<L:continue
            for kind,off,part in (("prefix",start,seq[:L]),("suffix",start+size-L,seq[-L:])):
                r,c=divmod(off,11)
                if c+L>11 or (single and any(len(GP[z][1])!=1 for z in part)):continue
                center=((x[c]+x[c+L])/2,(y[r]+y[r+1])/2)
                out.append({"kind":kind,"word":n,"offset":off,"text":tr(part),"center":center})
        return out
    def hits(ws):
        out=[]
        for a,b in itertools.permutations(ws,2):
            z=bearing(a["center"],b["center"])
            if err(z,318)<0.5:out.append((a,b,z))
        return out
    controls={}
    for L in (3,4,5):
        ws=edges(L,True);hs=hits(ws)
        controls[L]=(len(ws),[(a["text"],a["offset"],b["text"],b["offset"],z) for a,b,z in hs])
    assert controls[3][0]==10 and not controls[3][1]
    assert controls[4][0]==7 and len(controls[4][1])==1
    assert controls[4][1][0][0:4]==("BUDS",93,"HOME",33)
    assert controls[5][0]==6 and not controls[5][1]

    all4=edges(4,False);allhits=hits(all4);plus60=[]
    for a,b in itertools.permutations(all4,2):
        if b["offset"]-a["offset"]!=60:continue
        ar,ac=divmod(a["offset"],11);br,bc2=divmod(b["offset"],11)
        inner=[(ar+k,ac+k) for k in range(1,5)] if (br-ar,bc2-ac)==(5,5) else []
        plus60.append((a["text"],a["offset"],b["text"],b["offset"],
                       bearing(b["center"],a["center"]),sum(v[r][c] for r,c in inner) if inner else None))

    p0w=[GP[c][0] for c in p0[:16]]
    ccwcomp=abs(3301-ccw[10]);one=f-1
    onew=next((i,s,L,tr(w)) for i,s,L,w in words if s<=one<s+L)
    ctrl=[v[r][c] for r in range(4) for c in range(4)]
    nearest=sorted([(i+1,z,z%360,err(z%360,ob)) for i,z in enumerate(cw)],key=lambda q:q[3])
    assert round(ob)==318 and round(hb)==318 and abs(ob-318)<0.06 and cross<2 and abs(top_x)<1
    assert ccwcomp==2095 and factors(ccwcomp)==[5,419]
    assert one==88 and onew[0]==15
    assert p0w[10]==67 and factors(3301-67)==[2,3,7,7,11]
    assert ctrl[10]==61 and factors(3301-61)==[2,2,3,3,3,3,3,5]
    print(json.dumps({
      "p15":{"clockwise":cw,"counterclockwise_11th":ccw[10],"step11":cw[10],
             "mod360":cw[10]%360,"complement":q,"prime_ordinal":90,"F_index":f,
             "nearest_to_origin_bearing":nearest[:4]},
      "p32":{"x_edges":x,"y_edges":y,"HOME_center":hc,"BUDS_center":bc,
             "BUDS_to_origin_bearing":ob,"BUDS_to_HOME_bearing":hb,
             "HOME_cross_track_px":cross,"318_ray_top_edge_x_px":top_x,
             "diagonal_offsets":do,"diagonal_runes":dt,"diagonal_weights":dw,"diagonal_sum":sum(dw)},
      "controls":{"edge_windows_L3_L4_L5":controls,"all_4_rune_edges":len(all4),
        "all_digraph_near318":[(a["text"],a["offset"],b["text"],b["offset"],z) for a,b,z in allhits],
        "plus60_pairs":plus60,"one_based_offset":one,"one_based_word":onew,
        "p0_first16_4x4_11th":p0w[10],"p0_complement":3301-p0w[10],
        "p32_top_left_4x4_11th":ctrl[10],"p32_complement":3301-ctrl[10]}},
      ensure_ascii=False,indent=2))

if __name__=="__main__":main()
