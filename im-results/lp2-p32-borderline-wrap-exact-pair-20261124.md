# P32 borderline wraps: exact neighboring-glyph calibration (2026-11-24)

Independent follow-up to [CicadaNotebook session 126](https://cicadanotebook.com/sessions/126.html) (published 2026-11-23), which explicitly identified p32 lines 3 and 5 for same-pair gap measurement. This is a test of a potential source-selected line-break clue, not a decryption.

Use supplied original JPEGs at 2400×3600, physical LP2 page numbering (archive image = page + 17). Both breaks continue a word without intervening punctuation. Identify pairs visually and against the rune transcription. Inclusive ink bounds at RGB max < 90, unchanged at thresholds 70, 120, 150:

| Break | Previous rune rightmost x | Same ordered pair inside another line | Previous rightmost x | Next rune inclusive x range | Projected next rightmost x |
|---|---:|---|---:|---|---:|
| p32 L3, X→A (ᛉᚪ) | 1769 | p28 L3 | 800 | 803–837 | 1806 |
| p32 L5, T→F (ᛏᚠ) | 1759 | p30 L6 | 1489 | 1493–1527 | 1797 |

Thus the observed same-pair increments in right-edge coordinates are 37 and 38 px, not an arbitrary 1–18 px gap. Under a nominal right edge of x=1800 the X→A continuation cannot fit on ink alone. T→F leaves only 2 pixels beyond the inclusive ink endpoint before x=1800. A same-page F→J pair (p32 L6, F ends x634, J starts x639) has 4 blank columns; an unpunctuated J at p28 L5 begins x601, giving an estimated J left bearing of 1 px relative to the x600 origin. Under additive bearings this implies F trailing bearing ≈3 px. Hence the predicted exclusive typesetting endpoint for T→F is 1797+1+3=1801. This is consistent with ordinary wrapping, but approximate pixel quantization, actual typeface advance and the effective compositor boundary remain unknown; it is not proof that L5 had to break. Neither candidate supplies a clearly early line ending or a positive direction selector.

This is distinct from the existing dense microspacing channel exclusion (see lp2-original-rune-microspacing-quantization-gate.md): the endpoint experiment tests specific formerly borderline line breaks. It does not exclude deliberate breaks that coincide with natural wraps. No new plaintext or key.

Minimal original-image reproducer (Python 3, Pillow, NumPy; point ZIP at the supplied archive). Windows-compatible:

```python
from PIL import Image
import io, zipfile, numpy as np

ZIP = "liber-primus-jpegs.zip"

def bounds(z, p, line, lo, hi, threshold):
    raw = z.read(f"liber-primus-jpegs/{p+17:02d}.jpg")
    a = np.asarray(Image.open(io.BytesIO(raw)).convert("RGB"))
    y = round(673+(line-1)*188.2)
    m = a[y-10:y+125, lo:hi].max(2) < threshold
    x = np.flatnonzero(m.any(axis=0))
    return int(x[0])+lo, int(x[-1])+lo

with zipfile.ZipFile(ZIP) as z:
    for threshold in (70,90,120,150):
        x_end = bounds(z,32,3,1703,1772,threshold)[1]
        t_end = bounds(z,32,5,1708,1762,threshold)[1]
        xa_x = bounds(z,28,3,735,802,threshold)[1]
        xa_a = bounds(z,28,3,802,840,threshold)[1]
        tf_t = bounds(z,30,6,1438,1492,threshold)[1]
        tf_f = bounds(z,30,6,1492,1530,threshold)[1]
        print(threshold, x_end+xa_a-xa_x, t_end+tf_f-tf_t)
        assert (x_end+xa_a-xa_x,t_end+tf_f-tf_t)==(1806,1797)
        f = bounds(z,32,6,599,637,threshold)[1]
        j = bounds(z,32,6,637,687,threshold)[0]
        j_start = bounds(z,28,5,599,648,threshold)[0]
        print("estimated F right bearing:", j-f-1-(j_start-600))
```

The chosen same-pair examples were located by line-matched glyph segmentation and visually checked. Some other lines have merged/split projection components and were not used. This does not estimate the whole-book wrap policy or reuse page endpoints as a new cipher key.
