"""Original LP2 oversized red-initial ambiguity test (Python 3.12, Pillow, NumPy, OpenCV).

Extract red shapes from original JPEG pixels before using the canonical labels.
The two solved final pages p56/p57 provide authentic readout controls.
Read-only; run in the repository with resources/liber-primus/17.jpg through 74.jpg.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

SOURCE = Path(__file__).resolve().parent.parent / 'resources' / 'liber-primus'
# (physical page, zero-based text line, source-image top y, first ordinary glyph x)
SITES = (
    (0, 0, 673, 772), (3, 0, 673, 761), (3, 6, 2102, 838),
    (6, 4, 1725, 765), (8, 0, 673, 894), (15, 1, 1736, 761),
    (23, 0, 1160, 848), (27, 0, 917, 858), (33, 0, 673, 858),
    (33, 5, 1914, 841), (39, 6, 1858, 851), (40, 0, 673, 765),
    (54, 0, 917, 781), (56, 0, 673, 770), (57, 0, 917, 890),
)
# Post-extraction display only: these labels never choose coordinates/masks/thresholds.
CANONICAL = ('S', 'L', 'P', 'A', 'X', 'L', 'U', 'M', 'D',
             'NG', 'IA', 'F', 'A', 'AE', 'P')


def mask_at(site):
    page, line, top, first_regular_x = site
    image = np.asarray(Image.open(SOURCE / f'{page + 17:02d}.jpg').convert('RGB'),
                       dtype=np.int16)
    assert image.shape == (3600, 2400, 3)
    window = image[top - 80:top + 160, 590:first_regular_x - 6]
    red = ((window[:, :, 0] > 100)
           & (window[:, :, 0] > 2 * window[:, :, 1])
           & (window[:, :, 0] > 2 * window[:, :, 2]))
    y, x = np.nonzero(red)
    assert len(x) > 6000, (page, line, len(x))
    return np.ascontiguousarray(red[y.min():y.max() + 1,
                                  x.min():x.max() + 1].astype(np.uint8))


def normalized_iou(a, b):
    a = cv2.resize(a, (256, 192), interpolation=cv2.INTER_NEAREST)
    b = cv2.resize(b, (256, 192), interpolation=cv2.INTER_NEAREST)
    return float(np.count_nonzero(a & b) / np.count_nonzero(a | b))


def main():
    original = [mask_at(site) for site in SITES]
    assert len(original) == 15
    assert all((100 <= m.shape[0] <= 240 and 120 <= m.shape[1] <= 290)
               for m in original)
    comparisons = ((1, 13), (1, 5), (1, 6), (6, 13), (2, 14), (3, 12))
    scores = {(a, b): normalized_iou(original[a], original[b])
              for a, b in comparisons}
    for a, b in comparisons:
        print(f'p{SITES[a][0]}/line{SITES[a][1]} and '
              f'p{SITES[b][0]}/line{SITES[b][1]}: '
              f'{scores[a, b]:.8f} normalized red-mask IoU '
              f'(canonical {CANONICAL[a]} versus {CANONICAL[b]})')
    assert original[1].shape == original[13].shape == (165, 139)
    assert np.array_equal(original[1], original[13])
    assert abs(scores[1, 13] - 1.0) < 1e-12
    assert .98 < scores[1, 5] < .995
    assert .95 < scores[1, 6] < .98
    assert .95 < scores[6, 13] < .98
    assert .58 < scores[2, 14] < .67
    assert .69 < scores[3, 12] < .75
    print('PASS: exact source red silhouette identity: unknown p3 L / solved p56 AE')
    print('PASS: unknown p23 U near-identical to the same source silhouette')
    print('PASS: thirteen unknown ornamental initials remain explicit erasures;'
          ' no rune correction, key or plaintext inferred')


if __name__ == '__main__':
    main()
