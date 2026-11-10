# Red microdot forms in original LP2 JPEGs: three rigid templates

**Measured 2026-11-10. Image-domain intermediate result; no LP2 ciphertext recovery.**

Prior public inventory work (`Dukotah/cicada3301`, Round 43 F2a) pointed to the small red dot-matrix blocks beside the runes as a potentially untranscribed, variable binary microchannel. This experiment asked a narrower, immediately testable question: *do these blocks contain per-instance varying dots, or do they repeat as fixed typographic forms?*

## Exhaustive image census

The original JPEG files are already preserved in this repository under `resources/liber-primus/00.jpg` through `74.jpg`. For the 58 LP2 source images `17.jpg`–`74.jpg` inclusive, `sims/red_marker_shapes.py` applies a red RGB component mask (R>85, R>1.4G, R>1.4B, G<130), keeps almost-square 7–12-pixel red components with area 55–120 pixels, clusters their centroid positions at Euclidean radius 31 pixels, then normalizes positions onto a 15-pixel horizontal ×17-pixel vertical grid. A candidate motif needs at least five dots and must lie within a 90×180-pixel box. Requires Python 3, `numpy`, and `opencv-python-headless`.

Local execution against the archived 58 original images found **35 candidate microdot clusters, just three distinct grid occupancy masks**, rather than 35 distinct embedded binary strings:

| Form | Occupancy, top to bottom | Distinct instances | Scope |
|---|---|---:|---|
| 13-dot | ` .#. / ### / ### / ### / ### ` | **30** | Widespread across cipher pages |
| 10-dot | ` ### / .#. / ### / ### ` | **4** | Archive images 53, 55, 66, 73 |
| 23-dot | ` .###. / ##### / ##### / ##### / ##### ` | **1** | Archive image **74.jpg**, the solved final Parable page |

The normalized dot locations are repeated **exactly** for all 30 instances of the 13-dot form and for all four instances of the 10-dot form. The one 23-dot form is a wider block in the previously solved final page. The raw pixel brightness and JPEG compression artifacts were ignored; the claim concerns dot occupancy, not pixel-exact equality.

## Interpretation

The repeated 13- and 10-dot blocks look more like two deliberate punctuation/ornament *types* than per-occurrence 10–13 bit symbol payloads. Their **placement, number of occurrences, and type sequence** might still encode a low-bandwidth message. This evidence does not exclude such a channel. It specifically disfavours the proposed mechanism where each microdot block independently toggles its constituent squares to carry a many-bit binary word.

No plaintext or key recovered. This source-side constraint can redirect cryptanalytic work away from modelling the 30 instances of the same 13-dot shape as 30 independent binary packets. To reproduce, execute `sims/red_marker_shapes.py` with the image directory; the script prints every page and normalized cell grid in JSON. The input images and code are both committed.
