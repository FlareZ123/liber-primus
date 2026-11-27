# LP1/LP2 ordinary-rune rendering gate

**Agent23, 27 November 2026. Intermediate original-image result.**

## Decision

The tested ordinary black GP29 glyphs do not show a rendering/shape change at the sequential LP1-to-LP2 package boundary. A classifier trained only on LP2 images 49 and 72 recognizes every sampled LP1 glyph; the reverse direction also succeeds perfectly. Native per-class median glyph dimensions are effectively identical.

This rejects a broad new ordinary-rune font or glyph-shape alphabet explanation for the package split on the tested sample. It does not reject package-dependent punctuation/rubrication, a change in cipher mechanism, or a subtler rendering difference outside the measured features. No key, plaintext, or decipherment is inferred.

## Why this test

The external public synthesis in [ZzNible/cicada3301-liber-primus-research, package-boundary physical signals](https://github.com/ZzNible/cicada3301-liber-primus-research/blob/main/experiments/PACKAGE_BOUNDARY_PHYSICAL_SIGNALS.md) established scoped differences in selected punctuation/rubrication and left ordinary-rune rendering geometry as its next question. Our existing im-results/lp2-original-rune-typography-space-channel.md tested spacing/punctuation inside LP2; im-results/lp1-lp2-transparent-f-original-glyph-production-gate.md tested only F-interrupter glyphs. Neither compared ordinary glyph identities across the package boundary.

The discriminating prediction is straightforward: if the package boundary introduces a different ordinary-rune font or glyph-shape set, fixed templates learned on LP2 should misclassify at least some same-identity LP1 glyphs, or native per-class dimensions should shift systematically.

## Fixed source sample

Original 2400x3600 JPEGs, using the canonical source rune sequences encoded one character per GP29 index in the reproducer:

| Package | Image | Selected source rows | Glyphs |
|---|---:|---:|---:|
| LP1 | 03 | 3, 5-11 | 178 |
| LP1 | 04 | 2, 3, 5, 6, 10, 11 | 117 |
| LP1 | 14 | 1-10 | 205 |
| LP2 | 49 (p32) | 0-5 | 121 |
| LP2 | 72 (p55) | 0-3 | 76 |

The row origins are frozen from the existing original-JPEG F-glyph/typography studies. A row is included only when its tall glyph-component count exactly matches the source transcription. Rubricated rows, oversized-initial overlaps, the red footer, punctuation, and illustrations are excluded. On LP1 image14, the large red initial overlaps rows 1-2, so those two body-line crops begin at x=750; all other rows begin at x=590. LP2 image72 row3 ends at x=1032 to exclude the illustration.

The result contains 500 LP1 and 197 LP2 ordinary glyphs and all 29 GP classes on both sides.

## Method

1. Read the original image, convert to grayscale, and threshold ink at intensity 155.
2. In each fixed line crop, form horizontal ink-column runs; retain components at least 93 pixels high. The exact source/transcription count is a hard alignment gate.
3. Resize each binary glyph silhouette to 48x96 with bilinear interpolation and L2-normalize the feature vector.
4. Form one normalized mean prototype per rune identity. Classify by maximum cosine similarity. No language model, plaintext, unknown-page data, or cipher score is involved.
5. Separately compare native width, height, and width/height medians by rune class, plus same-identity and different-identity cross-package cosine similarities.

The complete reproducer is sims/lp1_lp2_ordinary_glyph_rendering_gate.py. It reads the repository's original image files by default or the maintainer's full ZIP with --archive.

## Results

### Cross-package classification

| Training templates | Held-out package | Correct |
|---|---|---:|
| LP2 images 49 + 72 | LP1 images 03 + 04 + 14 | **500/500** |
| LP1 images 03 + 04 + 14 | LP2 images 49 + 72 | **197/197** |

Per-image results were also exact:

| Held-out image | Correct |
|---|---:|
| LP1 image 03 | 178/178 |
| LP1 image 04 | 117/117 |
| LP1 image 14 | 205/205 |
| LP2 image 49 | 121/121 |
| LP2 image 72 | 76/76 |

Within-package controls are likewise exact: LP2 image49-to-image72 is 76/76; LP2 image72-to-image49 is 107/107 among the 107 classes represented in its training page; LP1 image14-to-images03/04 is 295/295; and LP1 images03/04-to-image14 is 197/197 among represented classes.

### Identity-conditioned similarity

Across all 3,437 same-rune cross-package pairs, mean cosine similarity is **0.971309** (median **0.969901**). Across 95,063 different-rune pairs, mean similarity is **0.488020** (median **0.523565**). The fixed silhouette feature therefore separates rune identity strongly across the package boundary.

### Native dimensions

Across the 29 per-rune median comparisons, LP1/LP2 median ratios are:

| Feature | Median ratio | Observed range |
|---|---:|---:|
| Width | **1.000** | 0.977-1.019 |
| Height | **1.000** | 0.991-1.009 |
| Width/height | **1.000** | 0.969-1.019 |

No systematic size shift appears in this sample.

## Exact input fingerprints

The run used the maintainer-provided liber-primus-jpegs.zip (SHA-256 094f3f8bc508159bda033482706a2d9bf516c8b8a324d87d41c5ee3696c075ea). The five image SHA-256 values were:

| Image | SHA-256 |
|---|---|
| 03.jpg | b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f |
| 04.jpg | 745c6a46f67de1e5a2a9ac76175c323af82c2432e3b7483a8dc6244f8de9478f |
| 14.jpg | de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e |
| 49.jpg | c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72 |
| 72.jpg | a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba |

## Interpretation and limits

The sample gives no support for an ordinary-rune glyph-shape or scale change between LP1 and LP2. It is consistent with a shared GP29 font/renderer across the package boundary. The previously observed package differences in selected punctuation and rubrication may still be real; this result only says those differences do not extend to the sampled ordinary black glyph silhouettes and native median dimensions.

This is a bounded sample, not a full-corpus census. It does not test JPEG quantization, subpixel placement, kerning/line advance, baseline drift, microtexture, or every page. It does not explain the package boundary cryptographically and does not authorize treating punctuation as a key. Further work on a broad ordinary-glyph font-change hypothesis is not justified without a new, independently selected feature or a counterexample.

**Research consequence:** retire the broad ordinary-glyph renderer-change branch for now. Spend effort on source-selected reversible operations or authentic key material that can act on the unsolved ciphertext.
