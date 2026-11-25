"""Label-blind original-image text-margin census, issue #2847.
Usage: python lp2_margin_address_gate.py original.zip output.json
Coordinates are source pixels, 0-based. No rune labels or extracted text.
"""
import sys, json, cv2, numpy as np
from zipfile import ZipFile
from collections import Counter
cv2.setNumThreads(1)
# Layout panels chosen from the original plates, before coordinate measurement.
PANELS={'LP1_scroll':[6,7,8,9], 'LP1_elephants':[10,11,12,13], 'LP1_corpse':[14,15,16], 'LP2_cross':[17,18,19], 'LP2_spiral':[20,21,22,23,24], 'LP2_tree':[25,26,27,28,29,30,31], 'LP2_plain':[33,34,35,36,37,38,45,46,47,48], 'LP2_mayfly':[41,42,43], 'LP2_vine':[57,58,59,60,61,62,63,64,65,66,69,70,71,72], 'LP2_solved':[73,74]}

def rows(im):
    # Ordinary upright glyph dimensions from Agent37's component gate.
    # Restrict to central text column, keep both black and red dark ink.
    x0,y0,x1,y1=590,440,1810,3250
    _,_,s,_=cv2.connectedComponentsWithStats((im[y0:y1,x0:x1]<160).astype('uint8'),8)
    bs=sorted([(int(x+x0),int(y+y0),int(w),int(h),int(a)) for x,y,w,h,a in s[1:] if 7<=w<=110 and 80<=h<=122 and a>200],key=lambda b:b[1])
    groups=[]
    for b in bs:
        if not groups or b[1]-groups[-1][0][1]>12: groups.append([])
        groups[-1].append(b)
    out=[]
    for g in groups:
        if len(g)<8: continue
        g.sort()
        # Coordinate-only bounding-box census; no rune identity is read.
        top=int(np.median([b[1] for b in g])); yy,xx=np.where(im[top-12:top+123,590:1810]<160)
        out.append({'top':top,'ink_left':int(590+xx.min()),'ink_right':int(591+xx.max()),'left':g[0][0],'right':max(b[0]+b[2] for b in g),'n':len(g),'widths':[b[2] for b in g],'center_gap':min(abs((b[0]+(b[2]-1)/2)-1200) for b in g)})
    return out

def main():
    z=ZipFile(sys.argv[1]); pages={}
    for i in range(75):
        im=cv2.imdecode(np.frombuffer(z.read(f'liber-primus-jpegs/{i:02}.jpg'),np.uint8),0)
        assert im.shape==(3600,2400)
        pages[i]=rows(im)
    result={'panels':{},'pages':pages,'shift_controls':[]}
    for i in (14,33,45,73,74):
        im=cv2.imdecode(np.frombuffer(z.read(f'liber-primus-jpegs/{i:02}.jpg'),np.uint8),0)
        row=next(r for r in pages[i] if r['ink_left'] in (600,601) and r['left'] in (600,601))
        y=row['top']; shifted=im.copy(); shifted[y-12:y+123,590:1810]=255
        shifted[y-12:y+123,622:1810]=im[y-12:y+123,590:1778]
        r2=min(rows(shifted),key=lambda r:abs(r['top']-y))
        result['shift_controls'].append([i,y,row['ink_left'],r2['ink_left']]); assert r2['top']==y and r2['ink_left']==row['ink_left']+32
    for name,ids in PANELS.items():
        a=[r for i in ids for r in pages[i]]
        if not a:continue
        result['panels'][name]={'n':len(a),'left':dict(Counter(r['left'] for r in a).most_common(12)),'normal_left_595_620':sum(595<=r['left']<=620 for r in a),'ink_left':dict(Counter(r['ink_left'] for r in a).most_common(12)),'ink_normal_left_595_620':sum(595<=r['ink_left']<=620 for r in a),'right_range':[min(r['right'] for r in a),max(r['right'] for r in a)],'width_range':[min(w for r in a for w in r['widths']),max(w for r in a for w in r['widths'])],'center_gap_range':[min(r['center_gap'] for r in a),max(r['center_gap'] for r in a)]}
    with open(sys.argv[2],'w') as f:json.dump(result,f,indent=2)
    print(json.dumps(result['panels'],indent=2));print('all rows',sum(map(len,pages.values())));print('shift controls',result['shift_controls'])
if __name__=='__main__':main()
