"""Compare seven original LP2 p33-39 cuneiform stamp masks, without rescaling.
Run: python lp2_cuneiform_stamp_gate.py liber-primus-jpegs.zip
Requires Pillow, NumPy and OpenCV.
"""
import sys
import hashlib
from zipfile import ZipFile
from io import BytesIO
import cv2
import numpy as np
from PIL import Image

with ZipFile(sys.argv[1]) as z:
    masks = []
    header_crops = []
    for p in range(33, 40):
        image = np.asarray(Image.open(BytesIO(z.read(f'liber-primus-jpegs/{p+17:02}.jpg'))).convert('L'))
        y0,y1 = (3000,3460) if p == 33 else (100,560)
        x0,x1 = 980,1450
        crop = image[y0:y1,x0:x1]
        if p >= 34:
            header_crops.append(crop)
        print(f'p{p} grayscale crop sha256={hashlib.sha256(crop.tobytes()).hexdigest()}')
        for threshold in (64,128,192):
            mask = (crop < threshold).astype(np.uint8)
            y,x = np.nonzero(mask)
            bbox = (x0+x.min(), y0+y.min(), x0+x.max()+1, y0+y.max()+1)
            trimmed = mask[y.min():y.max()+1,x.min():x.max()+1]
            if threshold == 128:
                n, _, stats, _ = cv2.connectedComponentsWithStats(mask)
                comps = [(int(x0+a),int(y0+b),int(w),int(h),int(area)) for a,b,w,h,area in stats[1:] if area>=50]
                print(f'p{p}: bbox={bbox}, components={comps}')
            masks.append((p,threshold,bbox,trimmed))
    assert all(np.array_equal(header_crops[0], x) for x in header_crops[1:])
    print("p34–39 grayscale crop identity: PASS (6/6)")
    for threshold in (64,128,192):
        base=next(m for p,t,b,m in masks if p==33 and t==threshold)
        template=np.pad(base,8)
        print(f'threshold={threshold}')
        for p,t,b,m in masks:
            if t!=threshold: continue
            # Translation only, no rotation, scaling or elastic alignment.
            canv=np.zeros((max(template.shape[0],m.shape[0]+16),max(template.shape[1],m.shape[1]+16)),dtype=np.uint8)
            canv[8:8+m.shape[0],8:8+m.shape[1]]=m
            ref=np.zeros_like(canv);ref[:template.shape[0],:template.shape[1]]=template
            best=(-1,None)
            for dx in range(-4,5):
                for dy in range(-4,5):
                    s=np.roll(canv,(dy,dx),(0,1)); inter=np.count_nonzero(ref&s);union=np.count_nonzero(ref|s)
                    j=inter/union
                    if j>best[0]:best=(j,(dx,dy))
            print(f'p{p} {b} IoU={best[0]:.6f} shift={best[1]}')
