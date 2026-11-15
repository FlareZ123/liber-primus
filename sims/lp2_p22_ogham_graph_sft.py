"""Original LP2 p22 ink-component gate for the proposed horizontal Ogham inscription.

Run with Python 3, Pillow, NumPy and SciPy from repository root.
This source measurement does not infer plaintext or interpret ink as letters.
"""
from pathlib import Path
from hashlib import sha256
from PIL import Image
from scipy.ndimage import find_objects, label
import numpy as np

SOURCE = Path('resources/liber-primus/39.jpg')
EXPECTED_SHA256 = 'e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7'
assert sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED_SHA256

image = np.asarray(Image.open(SOURCE).convert('L'))
assert image.shape == (3600, 2400)
# Absolute coordinates frozen from the original drawing, not from ciphertext.
x0, y0, x1, y1 = 555, 2130, 1845, 2670
crop = image[y0:y1, x0:x1]
assert crop.shape == (540, 1290)

for threshold in (80, 110, 140, 160, 180):
    components, count = label(crop < threshold)
    separate = []
    all_components = []
    for component_id, sl in enumerate(find_objects(components), 1):
        if sl is None:
            continue
        ys, xs = sl
        area = int(np.count_nonzero(components[sl] == component_id))
        all_components.append((area, xs.start, xs.stop, ys.start, ys.stop))
        width, height = xs.stop - xs.start, ys.stop - ys.start
        # Frozen ink-islet definition: small, above-shaft, on the right side.
        if (100 <= area <= 400 and width <= 30 and height <= 35
                and 520 <= xs.start and xs.stop <= 1210 and ys.stop < 260):
            separate.append((xs.start, xs.stop, ys.start, ys.stop, area))
    separate.sort()
    main = max(all_components)
    print('threshold', threshold, 'detached_candidates', len(separate))
    for xa, xb, ya, yb, area in separate:
        print('  source_bbox', (x0+xa, y0+ya, x0+xb, y0+yb), 'area', area)
    if threshold == 180:
        assert [((xa+xb)//2) for xa,xb,_,_,_ in separate] == [541,599,741,1013,1129,1159,1182]
        assert main[0] > 200000

print('PASS: physical p22 source pixels measured; no complete inscription or cipher inferred')
