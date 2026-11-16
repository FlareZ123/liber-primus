# Original printed-line initials are width-selected, not an authenticated acrostic

**16 November 2026, Agent22. Source-level typographic finding; no plaintext/key recovered.**

## Decision

The 594 first runes of the original 55 rune-bearing unknown LP2 physical pages are unusually unequal in their GP29 frequencies. The strongest independent predictor of those counts is already present in the original image resource: the physical width of each of the 29 printed glyphs. A fixed, unfitted **frequency × independently measured glyph-ink-width** sampling model reduces the apparent line-initial departure from the full-cipher distribution from χ² **78.656 (28 df; p≈1.06×10⁻⁶)** to **36.580 (28 df; p≈0.128)**. The Pearson correlation between physical source widths and first-line glyph enrichment is **+0.76248**, p≈1.53×10⁻⁶ across the 29 rune identities.

This offers an inexpensive causal alternative to any reading that treats the line-initial statistical anomaly as a separately authored letter channel: the ordinary fixed-width line geometry is more likely to place wide glyphs at the start of the *next* printed row. It does **not** mathematically rule out a deliberately superimposed acrostic, and the independent image data are a first contiguous black-ink-run proxy rather than validated typesetting advance widths. Treat a proposed line-initial cipher as requiring value-changing text, an independently authored selector, and a typed full plaintext prediction after accounting for width.

## Original inputs and non-fitted test

- Complete unknown GP29 source stream: `resources/liber-primus/lp2-corpus.json`, 12,956 indices, original physical p0–55, omitting runeless p50. Original printed physical line wraps: `resources/liber-primus/lp2-transcription.txt`. Its **594** unknown-page rune-bearing lines flatten *exactly*, rune-for-rune, to all 12,956 indices. The solved p56 and clear p57 add a separate ten lines and are excluded.
- Independent original-JPEG-derived widths: `resources/liber-primus/lp2-line-start-ink-widths.json`, 29 modal source foreground-ink-run widths in pixels, measured by `sims/physical_line_start_ink_modes.py`; images are `resources/liber-primus/17.jpg` through `74.jpg`. This vector was not fitted to line-initial frequencies by the present test.
- For each GP rune identity `r`, let `N_r` be total original 12,956-cipher runes, `A_r` its 594 printed-line first-rune count, and `w_r` the original image's first-glyph ink-run mode. Compare `E0_r=594*N_r/12956` with `Ew_r=594*N_r*w_r/(ΣN_j*w_j)`. The second model has **zero freely fitted parameters** in this test.

| Statistic | Original value |
| --- | ---: |
| Whole unknown-cipher GP29 IoC | 0.034478398 |
| 594 printed-line initials GP29 IoC | **0.037587795** |
| 594 printed-line finals GP29 IoC | 0.034402485 |
| Line-initial χ² vs whole-text GP frequency | 78.656033 |
| Line-initial χ² vs fixed ink-width weighted frequency | **36.580044** |
| Line-final χ² vs whole-text GP frequency | **24.216561** (p≈0.670) |
| Width versus line-initial relative enrichment | **Pearson +0.762477** |
| First rune EA (index 28), measured width | **38/594**, 86 px; full-text expected 21.09; width-weighted expected 41.79 |
| First rune R (index 4), measured width | **6/594**, 34 px; full-text expected 19.44; width-weighted expected 15.23 |
| First rune I (index 10), measured width | **9/594**, 9 px; full-text expected 21.59; width-weighted expected 4.48 |

To preserve original page lengths and observed glyph multiset while disrupting selected start sites, shift each physical page's ciphertext **cyclically by an independent random offset** and leave its exact printed-line-start offsets fixed. In 20,000 deterministic page rotations, **0** reproductions attain the observed line-first IoC (reported plus-one upper tail ≤0.000050). This demonstrates a page-conditioned line-placement effect; it does *not* establish a cipher because physical glyph widths already explain the overall directional bias.

## Cryptanalytic consequence and next gate

A first-rune-only acrostic or printed-line-reset key should not be inferred from the strong original-start frequency skew alone. The observed enrichment follows independently image-measured glyph widths remarkably closely. Investigate an *authored* first-line semantic operation, or a width-conditioned **residual** that predicts a holdout chapter, before treating source lines as secret cipher clocks. In particular, a candidate decoder must recover meaningful, source-clocked unknown GP29 plaintext and independently re-encrypt it; the present finding is about typesetting and supplies no candidate unknown-page letters or key.

**Reproducer**: [`sims/lp2_line_initial_glyph_width_source_sft.cjs`](../sims/lp2_line_initial_glyph_width_source_sft.cjs), read-only CJS SFT for Windows Node.js 22. It asserts the original rune-for-rune flattening and runs the page-offset, independently uniform-within-line and width-weighted source nulls with a fixed random seed. Source counts, widths, each χ² and every simulation result print on execution.
