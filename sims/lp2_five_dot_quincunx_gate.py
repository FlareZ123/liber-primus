#!/usr/bin/env python3
"""Original LP2 five-dot literal quincunx gate. Run from repository root."""
from pathlib import Path
from PIL import Image

DOTS = {
    7: [(1297,2867),(1527,2936),(797,3106),(1479,3128),(992,3167)],
    23: [(992,507),(1479,546),(797,568),(1527,738),(1297,807)],
    56: [(1104,2447),(873,2517),(1604,2687),(921,2708),(1408,2747)]
}

def cross(a,b,c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])

def hull(points):
    def half(ps):
        h=[]
        for p in ps:
            while len(h)>1 and cross(h[-2],h[-1],p)<=0:
                h.pop()
            h.append(p)
        return h
    p=sorted(points)
    return half(p)[:-1]+half(p[::-1])[:-1]

assert len(hull([(0,0),(2,0),(2,2),(0,2),(1,1)])) == 4
assert len(hull([(0,0),(2,0),(3,1),(1,3),(-1,1)])) == 5
root=Path("resources/liber-primus")
for page,windows in DOTS.items():
    im=Image.open(root/f"{page+17:02}.jpg").convert("L")
    assert im.size==(2400,3600)
    pts=[]
    for x,y in windows:
        xy=[(a,b) for a in range(x-46,x+47) for b in range(y-46,y+47)
            if im.getpixel((a,b))<95]
        assert 2500<=len(xy)<=4900
        pts.append(tuple(sum(t[i] for t in xy)/len(xy) for i in range(2)))
    h=hull(pts)
    assert len(h)==5
    margin=min(cross(h[i-2],h[i-1],h[i]) for i in range(len(h)))
    print(page,[(round(x,3),round(y,3)) for x,y in pts],
          "hull",[pts.index(t)+1 for t in h],"min turn",margin)
