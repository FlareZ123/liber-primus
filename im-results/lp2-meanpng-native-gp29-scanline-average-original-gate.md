# Meanpng as literal PNG Average filter on original GP29 manuscript scanlines

**Agent14, 23 November 2026. Classification: distinct source-motivated reversible original-cipher negative; no new authenticated plaintext or key.** All 56 unknown physical LP2 pages remain unresolved.

## Why this is a decipherment candidate

The previously source-derived p49–51 missing-L fifth-column secp256k1 scalar yields the conditional P2PKH vanity address beginning **`1Meanpng`** ([numeric-table derivation](lp2-p50-missing-l-secp256k1-address.md)). The literal term `png`, together with `Mean`, gives a period-available and **exactly specified** operation: the PNG *Average* filter, filter-type **3**, whose predictor is `floor((left + above)/2)`. A handwritten 29-rune manuscript has physically printed lines; a 2014 human who noticed the address could attempt this predictor directly on the original GP29 rune-value raster.

This is **a different potential receiver** from the existing Agent2/Agent29 tests that apply PNG Average to the **32×8 numerical grid** and then attempt to use transformed grid bytes as a keystream or 180-solved-rune recipient ([separate grid-level test](lp2-p50-meanpng-png-average-original-gate.md)). Those prior results failed. This report instead applies the exact operator to *original paragraph ciphertext runes*, preserving the source's printed row breaks. The Bitcoin address interpretation and the choice of textual recipient are still hypotheses, without a signed instruction.

## Source-locked reversible operations

Use the canonical [LP2 rune/GP29 corpus](../resources/liber-primus/lp2-corpus.json) aligned **rune-for-rune** to each physical page's `/` separated rows in the [unchanged source transcription](../resources/liber-primus/lp2-transcription.txt). This supplies **604 nonempty printed rune scanlines**, **12,956 unknown runes** on p0–55, plus **85+95 solved runes** on p56–57; p50 is an image-only physical page with no runes and no fabricated data row.

Each source rune is one logical grayscale pixel with value 0..28. At column j within one original source row, `left` is the previous rune of the same scanline and `above` is the same rune column in the immediately preceding printed scanline on the same physical page; nonexistent neighbors are 0. The first scanline of every physical page resets `above`. Retain every source rune in original order and the original printed row lengths, including the 32 cross-page words.

Freeze the only two directions implied by the standard PNG Average operator, transferring native byte arithmetic into the actual cipher alphabet mod29:

- **Actual PNG filter orientation:** `P_i = (C_i − floor((C_left + C_above)/2)) mod 29`, i.e. assume source ciphertext is raw scanline input and seek residual plaintext.
- **Actual PNG inverse (unfilter) orientation:** `P_i = (C_i + floor((P_left + P_above)/2)) mod 29`, i.e. assume source ciphertext is filter residual and reconstruct original pixel/plaintext values. This direction uses the already reconstructed P pixels for both its left and above predictor.

These are complete, lossless reversible map pairs, with no unknown key, fitted row shape, changed transcript, word dictionary, secret glyph relabeling or phase search. GP29 modular transfer is a conditional assumption, so the result excludes these specific forms only.

## Exact original input readout

| Original untouched source interval | Source GP29 IoC | Filtered GP29 IoC | Unfiltered GP29 IoC |
| --- | ---: | ---: | ---: |
| Physical p0–5, 1,470 runes | 0.03445817 | 0.03453689 | 0.03457209 |
| Physical p16–21, 1,613 runes | 0.03454947 | 0.03467561 | 0.03432102 |
| Physical p40–53, 3,008 runes | 0.03454263 | 0.03453025 | 0.03449575 |

The output in each independent original interval remains very close to random GP29 two-letter coincidence `1/29≈0.03448` in both directions. Neither direction exposes native, coherent language across a complete original page or any withheld source interval. The results are incompatible with a direct ordinary-English plaintext readout under this exact framing, subject to the usual warning that IoC is a screening statistic rather than proof against every underlying language.

**Native positive controls:** On the *genuinely solved physical p57 95-rune* GP29 source, the same forward and inverse PNG Average functions round-trip the complete original runes exactly in **both orientations (95/95)** using the original source line layout. Input row and corpus checks also recompose **13,136/13,136** runes, including the 180 solved, from the printed transcript with the image-only p50 exception.

**Reproduce:** [single read-only Windows Node22 CommonJS SFT](../sims/lp2_meanpng_gp29_original_scanline_average_sft.cjs), [Windows Node22 source-original PASS run 45253666748](https://github.com/FlareZ123/liber-primus/actions/runs/45253666748).

## Decision

Retire **direct, source-line-aligned GP29 PNG Average filter3 and inverse** as a plaintext decoder on the original unknown LP2 pages under physical-page resets. This leaves first-party image averaging, JPEG PNG conversion, transformed grid bytes, externally supplied bit/byte keys and independently specified alternate recipients outside scope. A source-selected operation on a new recipient, with unambiguous row/byte semantics and withheld-page plaintext, is needed before advancing the `Meanpng` hypothesis. No additional generic predictor menus are justified by this test.
