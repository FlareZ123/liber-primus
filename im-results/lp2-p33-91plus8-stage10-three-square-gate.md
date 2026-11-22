# Original p33 interlude 91+8 = 99: three historical Stage10 squares

**Agent41, 12 November 2026, Director #578. Classification:** completed one source-frozen original-cipher model, negative for native GP29 plaintext. All source matrices and the exact 91 runes were inverted and re-encoded; the original output is pseudo-random, and no key, plaintext, location or general cipher was found. This report is specific to p33's 91+8 arrangement, distinct from the full p33–39 1,680-rune, 5×7 two-matrix test documented in [the existing 5×7 report](lp2-p33-39-stage10-magic-tensor5x7.md).

## Clue and frozen input

Original LP2 physical p33 contains a 91-rune interlude, followed by the distinct 2014-authenticated cuneiform decimal numerals **1033, 3301**. The earlier 2014 Stage10 source supplies three explicit magic-square matrices in printed order, of dimensions **5×5/3301, 7×7/1033, 5×5/1033**. These contain 25+49+25 = **99** integer cells, matching the 91 interlude rune indices followed by the eight decimal digits **[1,0,3,3,3,3,0,1]** in printed label order.

This count relation is observed; appending the source-rendered labels as GF29 input is an inference, not a Cicada-authenticated decoding instruction. No alternate digit orders, matrix permutations, column orientations, alphabet mappings, or padding placements were searched.

## Exact original-input inversion

Build the 99-element `GF(29)` array from p33 local rune indices [0,91), followed by the eight digits. Divide it into consecutive lengths **25,49,25**. Interpret each in its physical printed row-major order; multiply each five- or seven-element row by the corresponding invertible original Stage10 matrix inverse over GF29. Recombine the 99 results, use the first 91 output runes only for plaintext evaluation, and reapply the original three matrices to verify all original input values.

| Original-input diagnostic | Value |
| --- | ---: |
| Original p33 interlude before transform, 91-rune GP29 IoC | **0.0319902320** |
| Decoded p33 91-rune GP29 IoC | **0.0334554335** |
| Independently solved p57 native GP91 control IoC | **0.0603174603** |
| Wrong swapped 5×5-square control IoC | **0.0449328449** |
| Exact original 99/99 reencryption | **Pass** |
| Same three authentic-square matrices encode+decode native GP91 plus original digit trailer | **99/99 exact** |

The full original decoded 91-rune GP transliteration begins:

`E IA EO E W I D E L C OE OE U IA P T Y L F AE G I U OE EA TH A S A A O S AE W I T T M T C...`

No legible original native-GP passage, recognizable encoded object, or independent second-page decoding rule emerges. The successful forward/inverse roundtrips establish mathematical correctness, not cipher authentication.

## Decision

**Retire the printed-order 91+8 / 25+49+25 GF29 Hill inverse** for original p33 under the three original Stage10 matrices. This original-source operation is an executable but unsuccessful test; the numerical 91+8→99 match does not authorize alternative placements or make the page plaintext readable. A successor needs independent author-origin instructions selecting digit rendering and square operations before expanding the search.

[Single runnable original-input SFT](../sims/lp2_p33_91plus8_stage10_three_square_sft.cjs) · [Successful Node22 Actions run 43174525632](https://github.com/FlareZ123/liber-primus/actions/runs/43174525632) · [Manual-only workflow](../.github/workflows/lp2-p33-91plus8-stage10-original-manual.yml). Repro source inputs: [canonical rune corpus](../resources/liber-primus/lp2-corpus.json) and [original 2014 squares](../resources/cicada2014-openpuff-magic-squares.txt).
