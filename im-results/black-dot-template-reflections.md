# Repeated LP2 five-dot stencil under exact reflections

**Classification:** directly measured original-image structure, with reproducible point fitting and pixel-mask confirmation. **No LP2 plaintext, key, or destination recovered.** Agent 28, 2026-11-10.

## Source and scope

The 58 original LP2 JPEG images `resources/liber-primus/17.jpg`–`74.jpg` were scanned at native 2400×3600 resolution, using grayscale pixels below 70 and connected dark components with 60–80 px bounding boxes, 2,900–3,800 dark pixels, and a minimum 0.55 occupied fraction. These predeclared shape/size gates isolate the large near-circular black decorative dots. They do not attempt to classify the much smaller red dot-matrix punctuation marks or all artistic elements.

Exactly four source images contain these components:

| Original JPEG | LP2 page | Detected large black dots | Placement |
| --- | ---: | ---: | --- |
| `24.jpg` | 7 | 5 | Below the symmetrical scrollwork and cipher text |
| `40.jpg` | 23 | 5 | Above the heading and cipher text |
| `50.jpg` | 33 | 3 | Collinear horizontal dots; a different motif |
| `73.jpg` | 56, previously solved | 5 | Below the closing-page text |

**Prior art:** the five-dot and three-dot motifs themselves have been noted in public Liber Primus page-decoration inventories. The new contribution of this report is measuring **subpixel-exact reuse of the same five-point pattern under two different reflections**, not claiming first discovery of the presence of black dots.

## Template alignment

Treat the five centers in `24.jpg` as coordinate pairs `(x,y)`, with origin at the top-left of the original JPEG. Fit `(x',y')=(sx*x+tx, sy*y+ty)` for all four `(sx,sy) ∈ {−1,+1}²`. For each orientation, exhaustively enumerate all 120 possible five-point correspondences and choose the translation minimizing RMS Euclidean center error. Thus the orientation and correspondence are measured rather than presumed.

| Target image | Best reflection signs `(sx,sy)` | Translation `(tx,ty)`, pixels | RMS residual | Next-best orientation RMS |
| --- | --- | --- | ---: | ---: |
| `40.jpg` | `(+1,−1)` (vertical) | `(+0.000081, +3674.018416)` | **0.036832 px** | 150.436 px |
| `73.jpg` | `(−1,+1)` (horizontal) | `(+2400.627012, −419.357683)` | **0.246264 px** | 150.361 px |

The five recovered `24.jpg` centers, sorted by x, are:

```text
(796.941,3105.773)
(992.500,3166.637)
(1296.931,2866.789)
(1479.265,3127.500)
(1527.153,2936.153)
```

The five `40.jpg` centers are at approximately the identical x positions and y values `(568.227,507.363,807.211,546.500,737.939)`; this is effectively an exact vertical mirror of the source dot pattern. In `73.jpg` the five centers, sorted by x, are `(873.267,2517.000)`, `(921.154,2708.061)`, `(1103.931,2447.221)`, `(1408.066,2747.282)`, `(1603.926,2686.500)`.

A second control compares thresholded 89×89-pixel patches centered on each corresponding dot, flipped back to the source orientation. The five Jaccard pixel-overlap scores are `1,1,1,1,0.99736` for image 40 and `0.96938,0.95626,0.97796,0.96122,0.97768` for image 73. This distinguishes a reused graphical stencil from an accidental approximate arrangement of five circles. Differences in image 73 are compatible with JPEG rasterization and minor positioning shifts.

The three dots in `50.jpg` lie at `(766.221,1743.931)`, `(1183.846,1743.939)`, `(1662.000,1743.939)`, making a separate horizontal element.

## Consequence for cryptanalysis

The five-point geometry is **reused artwork**, and the change of orientation is a concrete observable manuscript choice. Treating every five-dot coordinate as a fresh independent set of cipher parameters would be incorrect. The two single-axis reflections and the unobserved double-axis reflection supply a small, testable orientation vocabulary, but **no evidence currently identifies an encoding, associates orientations with a cryptographic key, or specifies a reading order**. Page 56 is already solved, providing a possible authentic-control location for a future key hypothesis.

This finding does not show whether the illustrations were inserted by the Cicada designer as a cipher clue or by a later layout/template operation. The strongest direct inference is one exact underlying five-dot stencil rendered in at least three orientations/positions.

## Reproduce

Run `python sims/black_dot_reflection.py` from repository root after installing `numpy` and `opencv-python-headless`. The script uses only the tracked original image bytes, reads all 58 LP2 scans, asserts the exact dot census, searches orientations and all 120 assignments, compares local binary pixel masks, and emits the full center coordinates and errors in deterministic JSON. Native image files stay unmodified.
