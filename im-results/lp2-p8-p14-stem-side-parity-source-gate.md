# Original p8–p14 botanical stems: page-parity templates, no independent key tape

**Source-image decision, Agent44, 22 November 2026, [Director #2294](https://github.com/FlareZ123/liber-primus/issues/2294).** Original LP2 physical p8–p14 (archive JPEG `25.jpg` through `31.jpg`) show the **same botanical stem** alternating on the left and right according to physical page parity. The p9–p13 proposed changing-stem binary/ternary state thus adds no information beyond the already known page numbers. No unknown plaintext, original-cipher inverse, or author-selected key is recovered.

The [original-JPEG reproducible test](../sims/lp2_p8_p14_stem_side_parity_original_sft.py) reads all seven 2400×3600 source images using Pillow and NumPy, thresholding gray values below170 within fixed margin crops: left x=0..599, right x=1800..2399, y=600..2969. It neither derives glyph values from plaintext nor alters the genuine p8→p9 carried word.

| Source page | Stem | Left dark pixels | Right dark pixels |
|---|---|---:|---:|
| p8 | left | 55,074 | 0 |
| p9 | right | 0 | 54,837 |
| p10 | left | 54,868 | 0 |
| p11 | right | 0 | 54,837 |
| p12 | left | 54,868 | 0 |
| p13 | right | 0 | 54,837 |
| p14 | left | 54,868 | 181 |

The 181 p14 right-margin pixels are below the 5,000-pixel stem-presence threshold. **Exact equality:** the p10/p12/p14 source foreground masks match byte-for-byte; p9/p11/p13 right masks match byte-for-byte. After a fixed 16-pixel horizontal translation, the unmirrored p9 right illustration has a Jaccard foreground overlap with p10's left illustration **greater than 0.97**. P8's same-side print uses a slightly different raster alignment; original foreground masks agree within a two-pixel dilation, with at most two unmatched pixels.

**Interpretation and missing operand:** The p9–p13 sequence is `R L R L R`, exactly page parity. No distinct branch, encoded direction choice, marker or author-provided state update is carried by the repeated art. A solver can always arbitrarily map `L` or `R` to a GP29 operation, but the source cannot choose its sign, initial state, alphabet, running key or how the authentic p8→p9 whole-word continuation is consumed. Such a fitted mapping would lack a prospective receiver and fail to establish a genuine plaintext solution.

**Scope:** Retire *independent changing-stem-side key/state* as a p9–p13 route. This does not exclude a cipher that uses known page parity, another source-selected operation, or p7's separately studied GF3/242-state p8 carry. A new authored opcode with specified reversible receiver would be necessary before investing in a five-page inverse. The manuscript's 56 unknown pages remain undeciphered.
