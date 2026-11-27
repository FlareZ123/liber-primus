"""Read-only alternative to PDF XObject extraction for the 2024 guide repost.
Use native p27 crop and the same 30-inlier/full-span gate as the PDF test.
"""
import argparse
import json
import hashlib
from pathlib import Path
import cv2
import numpy as np
from lp2_p27_cicadamania_guide import source_crop, sift_match


def scan(ref, img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Suppress chromatic ink while retaining black/grey veins.
    chroma = img.max(axis=2).astype(int) - img.min(axis=2).astype(int)
    masked = gray.copy()
    masked[chroma >= 35] = 255
    results = []
    for name, frame in [('gray', gray), ('no_color', masked)]:
        for scale in (1, 2, 4):
            up = cv2.resize(frame, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            for reflect in (False, True):
                for rot in (0, 2):
                    test = np.rot90(up, rot).copy()
                    if reflect:
                        test = test[:, ::-1].copy()
                    results.append(dict(mask=name, scale=scale, reflected=reflect,
                                        rotation=rot*90, **sift_match(ref, test)))
    return max(results, key=lambda x: (x['eligible'], x['inliers']))


def control(ref):
    small = cv2.resize(ref, (375, 128), interpolation=cv2.INTER_AREA)
    canvas = np.full((390, 530, 3), 255, np.uint8)
    canvas[100:228, 40:415] = cv2.cvtColor(small, cv2.COLOR_GRAY2BGR)
    cv2.polylines(canvas, [np.array([[140, 110], [188, 190], [220, 121], [275, 207], [310, 117]])], False, (255, 180, 0), 4)
    cv2.putText(canvas, 'WING GUIDE', (20, 55), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
    neg = canvas.copy()
    neg[90:240] = 255
    for x in range(45, 415, 28):
        cv2.line(neg, (x, 100), (x+12, 225), (0, 0, 0), 2)
    for y in range(100, 225, 24):
        cv2.line(neg, (45, y), (415, y), (0, 0, 0), 2)
    out = {'positive': scan(ref, canvas), 'negative': scan(ref, neg)}
    assert out['positive']['eligible'] and not out['negative']['eligible'], out
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--original', required=True, type=Path)
    p.add_argument('images', nargs='*', type=Path)
    p.add_argument('--selftest', action='store_true')
    a = p.parse_args()
    ref = source_crop(a.original.read_bytes())
    out = {'controls': control(ref)} if a.selftest else {}
    out['candidates'] = []
    for path in a.images:
        raw = path.read_bytes()
        img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError(f'Unreadable image: {path}')
        out['candidates'].append({'path': str(path), 'sha256': hashlib.sha256(raw).hexdigest(),
                                  'best': scan(ref, img)})
    print(json.dumps(out, indent=2))


if __name__ == '__main__':
    main()
