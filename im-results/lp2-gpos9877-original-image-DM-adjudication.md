# gpos9877 D/M original-image adjudication

**Date:** 26 November 2026  
**Decision:** the original page image supports D (ᛞ) at global rune position 9877, not M (ᛗ). This is an independent model-side visual/template check, not a human oracle; the local canonical transcription already records D and is unchanged.

## External dispute and exact source

The current [Dukotah Round47 synthesis](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round47/SYNTHESIS.md) and [T2 transcription closeout](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round47/T2-transcription-closeout/RESULTS.md) identify gpos9877 as page41, line455, zero-based rune position j6. The external canon reads D; blind readers T2 and S1 read M. Their template score favours D (0.969 vs 0.686), and the adjacent-M alternative is disfavoured by the corpus doublet rate. The position remains flagged for an oracle in the upstream report.

The local archive images are byte-identical to the upstream pinned renders:

| Image | LP2 page | SHA-256 |
|---|---:|---|
| `58.jpg` | p41 | `134052dd794a7d11185cc6d942de3f9839bd2b767e0845b0f059f711b269bee2` |
| `73.jpg` | solved p56 control | `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc` |

These hashes match the external pinned values in `analysis/round19/C3/l3/hashes.json`.

## Reproduced alignment and comparison

The reproducer mirrors the upstream component and line segmentation family: red/dark ink mask, connected components with height 95–132 px and width 8–98 px, y-centre line clustering at 55 px, and central-column filter 380–2020 px.

- Page41 line455 has 22 canonical runes but 21 segmented components. The first seven components nevertheless classify exactly as the first seven canonical runes: **EA, I, A, S, Y, M, D**. Thus the target at j6 follows a correctly identified M at j5; it is not simply a shifted label.
- The solved p56 control has 85 canonical runes. Its oversized first AE drop-cap is excluded by the component-height filter, leaving 84 aligned glyph crops: 3 known M examples and 5 known D examples.
- Glyph crops are thresholded, aspect-preservingly normalized to a 64×128 binary canvas, and compared by mean pixel Hamming distance against the p56 control templates.

| Target | Nearest M distance | Nearest D distance | Mean M distance | Mean D distance |
|---|---:|---:|---:|---:|
| j5 (known M) | **0** | 0.1422 | — | — |
| j6 (disputed; canon D) | 0.1273 | **0** | 0.1344 | 0.0293 |

Nearest-neighbour leave-one-out on the eight known D/M controls classifies **8/8** correctly. The j5/j6 pair is especially informative: the classifier recognizes the preceding glyph as M and the disputed following glyph as D, rather than merging them into two M readings.

## Limits and disposition

This supports the existing D transcription and agrees with the external template and doublet evidence. It does not turn a small, same-page template set into a human oracle, and the 21/22 segmentation count means the full line still deserves careful alignment. No source transcription or corpus value was changed. Keep the upstream caveat flagged until an independent human reader reviews the original crop.

**Reproducer:** [`sims/agent16_gpos9877_visual_adjudication.py`](../sims/agent16_gpos9877_visual_adjudication.py). It reads the original repository images, pins their SHA-256 hashes, reproduces the segmentation, and can emit a contact sheet with `--contact-sheet`. Requires Pillow, NumPy and SciPy.