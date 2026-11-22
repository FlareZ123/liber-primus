"""Read-only original-image compositor atlas. Requires Pillow and NumPy."""
from __future__ import annotations
import argparse
from collections import Counter, defaultdict
import hashlib
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
import numpy as np
from PIL import Image

SOURCE_SHA='cdda41395a52761be5d00c52ec4a2c1c769f9a9f756974a7ec62d4bbf4156dc1'

def read_source(archive: Path | None) -> list[bytes]:
    if archive:
        with ZipFile(archive) as z:
            data=[z.read(f'liber-primus-jpegs/{i:02}.jpg') for i in range(75)]
    else:
        root=Path(__file__).resolve().parents[1]/'resources'/'liber-primus'
        data=[(root/f'{i:02}.jpg').read_bytes() for i in range(75)]
    h=hashlib.sha256(b''.join(data)).hexdigest()
    assert h==SOURCE_SHA,(h,SOURCE_SHA)
    print('Original combined 75-JPEG SHA256:',h)
    return data

def decode(data: list[bytes], p: int) -> np.ndarray:
    with Image.open(BytesIO(data[p+17])) as im:
        a=np.asarray(im.convert('RGB'))
    assert a.shape==(3600,2400,3),(p,a.shape)
    return a

def tile_graph(data: list[bytes]) -> Counter[tuple[int,int]]:
    index: dict[bytes,set[int]]=defaultdict(set)
    retained=0
    for p in range(58):
        a=np.asarray(Image.fromarray(decode(data,p)).convert('L'))
        for y in range(0,3600-96+1,96):
            for x in range(0,2400-96+1,96):
                t=a[y:y+96,x:x+96]
                if np.count_nonzero(t<190)<60:
                    continue
                retained+=1
                index[hashlib.blake2b(t.tobytes(),digest_size=12).digest()].add(p)
    edges: Counter[tuple[int,int]]=Counter()
    for pages in index.values():
        pages=sorted(pages)
        for i, p in enumerate(pages):
            for q in pages[i+1:]:
                edges[(p,q)]+=1
    print('Ink-bearing tiles:',retained,'cross-page tile patterns:',
          sum(len(p)>1 for p in index.values()))
    expected={(1,2):84,(4,5):102,(9,11):50,(10,12):57,
              (24,26):63,(34,35):21,(40,55):169,(27,54):3}
    for pair, value in expected.items():
        assert edges[pair]==value,(pair,edges[pair],value)
        print('Exact 96px pair',pair,value)
    return edges

def check_stencils(data: list[bytes]) -> None:
    groups=[
      ('cross p1-p2',[1,2],[(0,900,450,2650)]),
      ('scrolls p4-p7',[4,5,6,7],
       [(0,850,560,2600),(1800,850,2400,2600)]),
      ('right saplings p9/11/13',[9,11,13],[(1850,600,2400,2900)]),
      ('left saplings p10/12/14',[10,12,14],[(0,600,550,2900)]),
      ('bilateral insects p24/26',[24,26],
       [(0,1000,520,2600),(1800,1000,2400,2600)]),
      ('cuneiform header p34-p39',[34,35,36,37,38,39],
       [(900,250,1450,670)]),
      ('floral frames p40-p55',list(range(40,56)),
       [(0,650,550,2950),(1850,650,2400,2950)]),
    ]
    for name, pages, rois in groups:
        ref=decode(data,pages[0])
        for p in pages[1:]:
            check=decode(data,p)
            for x0,y0,x1,y1 in rois:
                assert np.array_equal(ref[y0:y1,x0:x1],check[y0:y1,x0:x1]),(name,p)
        total=sum((x1-x0)*(y1-y0) for x0,y0,x1,y1 in rois)
        print('PASS literal RGB stencil:',name,'pixels=',total)
    # The p33 footer carries the same illustrated numeral block as the
    # p34-p39 header, displaced vertically. This registration was inspected,
    # then the following fixed rectangles were measured on source pixels.
    footer=decode(data,33)[3136:3448,1021:1399].astype(np.float64)
    header=decode(data,34)[242:554,1021:1399].astype(np.float64)
    corr=float(np.corrcoef(footer.ravel(),header.ravel())[0,1])
    assert .96<corr<.98,corr
    print('p33 footer / p34 header fixed-crop RGB NCC:',round(corr,6))

def iou_shift(a: np.ndarray,b: np.ndarray,r: tuple[int,int,int,int],
              dx: int,dy: int) -> float:
    x0,y0,x1,y1=r
    a=a[y0:y1,x0:x1].min(axis=2)<200
    b=b[y0:y1,x0:x1].min(axis=2)<200
    h,w=a.shape
    xa=slice(max(0,-dx),min(w,w-dx));xb=slice(max(0,dx),min(w,w+dx))
    ya=slice(max(0,-dy),min(h,h-dy));yb=slice(max(0,dy),min(h,h+dy))
    a,b=a[ya,xa],b[yb,xb]
    return float(np.count_nonzero(a&b)/np.count_nonzero(a|b))

def check_p25(data: list[bytes]) -> None:
    a,b=decode(data,24),decode(data,25)
    for name,r in [('left',(0,1000,520,2600)),
                   ('right',(1800,1000,2400,2600))]:
        same=iou_shift(a,b,r,0,0)
        shifted=iou_shift(a,b,r,-1,-1)
        assert shifted>.89 and shifted>same+.08,(name,same,shifted)
        print('p25',name,'ink IoU raw',round(same,6),
              'shift(-1,-1)',round(shifted,6))

def main() -> None:
    ap=argparse.ArgumentParser()
    ap.add_argument('--archive',type=Path)
    data=read_source(ap.parse_args().archive)
    graph=tile_graph(data)
    check_stencils(data)
    check_p25(data)
    cross=sorted((p,q,n) for (p,q),n in graph.items()
                 if p<40<=q and n>=3)
    assert cross==[(27,54,3)],cross
    print('Only cross-range 96px >=3:',cross)
    print('PASS. No independent cipher opcode or unknown plaintext recovered.')

if __name__=='__main__':
    main()
