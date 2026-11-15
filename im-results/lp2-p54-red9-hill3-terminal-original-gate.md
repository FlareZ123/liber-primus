# P54 red-nine 3×3 Hill inverse on the terminal source interval

**Agent 15, 15 November 2026. Research status: one source-frozen candidate rejected on original ciphertext.** No unknown Liber Primus prose, original author key or solved continuation was recovered. The 3×3 Hill rule is an explicit provisional decoding hypothesis; its exact key symbols and source interval are original facts.

## Why this mechanism was selected

Physical LP2 p54 (`71.jpg`) begins with **nine red GP29 runes** `A M NG D IA TH X I M`, immediately followed by the original 13-dot red punctuation. A conventional 3×3 Hill matrix is a short, period-available reversible cipher whose *nine* matrix entries can be read directly from that original distinctive header, without guessing plaintext or optimizing a key. The nine source GP29 indices, in visual reading order, are:

```text
24 19 21
23 27  2
14 10 19
```

This matrix has determinant **953 ≡ 25 (mod 29)** and inverse:

```text
 0 16  9
 8  3  0
 8  8 27
```

Original p54 has 232 runes, nine in the red header; original p55 (`72.jpg`) has 76. The continuous source interval following the red p54 header to the final red 13-dot p55 punctuation is **223+76=299** runes. It crosses the physical page seam *inside one printed word*: p55's initial NG completes a word from p54. P55 then has sixteen complete printed words. The chosen Hill trial reads ordinary original rune order and retains every original word/page delimiter only as display metadata. The authentic 2014 source does **not** explicitly instruct the reader to use a Hill matrix or specify how to encode an incomplete final block.

## Frozen reversible test

Let `K` be the displayed original GF(29) matrix, and `C` the first **297** source runes of the contiguous 299-rune post-header interval. Test conventional Hill column-vector `P=K⁻¹C (mod29)` on successive three-rune blocks, and separately the plain row-vector convention `P=C K⁻¹ (mod29)`. Both are independently standard matrix-orientation conventions; there are no cipher-fitted offsets, key phases, plaintext cribs, learned alphabets or orientation searches.

**Important partial-block boundary:** 299 is congruent to **2 mod 3**. Neither Hill orientation defines an inverse for the terminal two runes without extra authored padding or ciphertext stealing. Preserve the two original runes as an *undecoded source tail*, rather than manufacturing a padding rune or falsely asserting a complete 299-rune historical decoder. The 297-symbol core is enough to reject this literal route if it does not reveal original prose.

| Frozen model | Original 297-rune core IoC | Decrypted 297-rune IoC | Original reencryption | Source-known controls |
|---|---:|---:|---|---|
| Column-vector Hill3 | 0.03348971 | **0.03494871** | Exact 297/297 | Exact solved-page plants |
| Row-vector Hill3 | 0.03348971 | **0.03346726** | Exact 297/297 | Exact solved-page plants |

The column-vector output begins in GP rune names:

```text
NG A Y NG Y B P B OE O D EA TH I S S EA M A EA J W S I EA H I E H L M W
```

The row-vector output begins:

```text
IA AE X G E U M E I B G F J A R EA AE EA X IA M X W T J R W W M X A
```

Neither output contains coherent contiguous source-native English. Their GP frequency concentration remains near the 29-rune uniform baseline. The test's exact encoder maps the recovered original core back to all 297 unchanged original ciphertext signs. Two separate *planted* controls, one using p56's 85 known original ciphertext runes as a source-shaped deterministic vector and another using p57's 95 directly clear runes, each encrypts and then decrypts its full triplet prefix exactly. This establishes correct Hill arithmetic while offering no historical key identification from synthetic plants. No original plaintext is assumed in the p54/p55 test.

## Decision

This retires **the literal, source-red-nine Hill3 inverse of the 297 complete original terminal triples**, under its two standard matrix orientations and no additional state or padding. The absence of authentic GP prose is the actual failure, with terminal tail ambiguity an independent missing input. It does not exclude ciphertext stealing, encrypted-key material, different segmentation, nonlinear operations, or a distinct GP cipher; none is independently selected by the red nine alone.

This is a separate hypothesis from the older [p54 red-nine 3×3 *valid convolution* gate](lp2-p54-nine-rune-valid-convolution-gate.md), which applies a nine-cell kernel to the original p50 table and rejects that distinct all-secret linear operator on independently solved p56/p57. Neither should be rescued by cycling new unselected algebraic conventions.

Reproduce on exact checked-in source files with [the standalone read-only CommonJS SFT](../sims/lp2_p54_red9_hill3_terminal_sft.cjs). The SFT asserts the red nine and both 13-dot source boundary marks, exact original page rune counts, inverse matrix, source-native positive plants and 297/297 inverse identity for both orientations. It prints all output prefixes and keeps the final two original runes explicitly separate.
