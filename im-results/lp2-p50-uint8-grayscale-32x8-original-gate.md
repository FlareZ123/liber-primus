# Source-native 32×8 byte table as a literal eight-bit grayscale image

**Agent32, 17 November 2026. Classification: one fixed, reversible original numerical-to-image negative.** No legible image, identifiable symbol, author-selected key, original unknown GP29 plaintext or destination is recovered.

## Historical cue and consumer

The original LP2 physical pp49–51 print **256** two-character numeric tokens in exactly **32 rows ×8 columns** (original source JPEGs `66.jpg`, `67.jpg`, `68.jpg`). A conventional interpretation of the established, still **provisional** sexagesimal reading `value = 60×firstDigit + secondDigit` yields **256 bytes**, whose original row-major table is pinned in [the source-certified grid](../resources/liber-primus/base60-grid.json) and [original value record](../resources/liber-primus/lp2-grid-256.json). The visible eight printed columns are an independent reason to preserve this shape.

One simple period-available visual consumer is the canonical **8-bit grayscale pixel**: take each original numeric byte as its unsigned 0–255 intensity, print exactly the original 32×8 matrix as an image with **0=black and 255=white**, with no clipping, histogram stretching, adaptive thresholds, color palette, coordinate transposition, rotation or reordered rows. This requires no invented bit slicing or key. Although byte-valued grayscale is a standard image encoding, **nothing in the 2014 source names grayscale** or validates the underlying base60-to-byte interpretation. It is a conditional experiment, not an author-certified interpretation.

Earlier table bitmap work [here](lp2-grid-bitplane-order.md) tested 32×64 *binary bitplane* interpretation and single-bit parity; this test addresses a different, direct **one intensity per printed original cell** reading. The original table-as-PRNG, byte-key and grid successor-path reports do not test this exact grayscale readout.

## Exact image and source-fixed local continuity diagnostic

On the original intact 32×8 pixel array, compute the sum of the absolute differences between adjacent unsigned byte intensities in the source's two printed directions. This is 32×7=224 horizontal neighbors and 31×8=248 vertical neighbors; no edge wraps across opposite sides.

| Source/readout | Horizontal absolute sum | Vertical absolute sum | Total | Normalized mean per edge |
| --- | ---: | ---: | ---: | ---: |
| Original grayscale 32×8 | **19,240** | **19,052** | **38,292** | **81.127119** |
| 20,000 whole-table permutations (mean) | 18,698.70515 | 20,703.12885 | 39,401.83400 | 83.478462 |
| 20,000 within-source-printed-row permutations (mean) | 18,891.14175 | 20,231.12640 | 39,122.26815 | 82.886161 |

A low absolute difference would indicate an ordinary locally smooth grayscale image. Two *different* frozen permutation nulls preserve all **256 original bytes**: a Fisher–Yates scramble of the whole 256-cell multiset, and independent scrambles of the eight original byte values **within each original printed row**. The latter preserves all row-specific bright/dark inventories and between-page row distributions. Exactly 20,000 fixed-seed controls are drawn per null (`0x3301`), and each test measures the same originally selected image-geometry metric with no tuning.

| Null / lower tail inclusive of ties | Horizontal | Vertical | Combined |
| --- | ---: | ---: | ---: |
| Entire table shuffled | 15,074/20,001 = **0.75366** | 477/20,001 = **0.02385** | 3,312/20,001 = **0.16559** |
| Each printed row shuffled | 13,822/20,001 = **0.69107** | 1,408/20,001 = **0.07040** | 4,293/20,001 = **0.21464** |

The lower vertical difference is weak in an unconditional comparison and **does not survive as a strong signal** once original per-row inventories are frozen; horizontal local smoothness is worse than most shuffled controls. Crucially, the source fixed **32×8 grayscale image does not display a recognizable text glyph, logo, coordinate, URL, image or other typed decoder instruction** on its direct readout. As an exact example of the raster, its first four rows, binned only for this plain-text *preview* into ten ordinal brightness bands, are:

```text
#@*#-@=#
-@*%@ #%
=# .-+:-
=#* +:++
```

The measurement itself operates on full original 0–255 values with no brightness bins. The report makes no claim that a high-contrast emblem must necessarily have smoothly varying grayscale intensity: a sparse/high-frequency, halftoned or encoded graphic could fail this diagnostic. More significantly, choosing threshold, bitplane, bit orientation, palette, row permutation or different decoding radix after seeing the first image would introduce unselected operations rather than reveal a missing source instruction.

**Positive implementation control:** an independent planted 32×8 8-bit grayscale image whose pixel intensity increases by exactly 32 per column, identical across 32 rows, has horizontal total **7,168** and vertical **0**, versus original 19,240/19,052; it triggers the frozen continuity discriminator.

## Decision

This bounded test **retires direct row-major unsigned-byte grayscale as a self-explanatory graphical key or plaintext carrier**. The authentic 2014 source exposes an ordered 32×8 numeral table, but does not supply any further conversion grammar that specifies a useful graphical readout. Neither the limited vertical-neighbor tendency nor the image preview authorizes an arbitrary enhanced contrast, division-by-29 glyph palette or rotated 16×16 reshaping. If an independently sourced image convention is later found, it would be a separate, testable operation rather than a reason to optimize the present negative.

**Reproduce:** `node sims/lp2_p50_uint8_grayscale_original_sft.cjs`. Standalone read-only Node.js 22 CommonJS, original fixed 256 bytes and 32×8 shape, all exact absolute-distance statistics, two 20,000-draw source-controlled permutation nulls, source-native positive image plant and text preview. The entire GitHub-committed script was independently run on authentic source JSON with a V8 Node builtin adapter and **all source assertions passed**. No native CI job is claimed.
