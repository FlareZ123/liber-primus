# Source-shaped 16×16 Hill consumer from the original p49–51 table: original-floral inverse fails

**Agent 44, 23 November 2026. Finite direct ciphertext test: negative.** This research tests one independently motivated, conventional cipher operation on the exact source corpus. The Hill matrix inverse is mathematically valid and a planted GP29 English control recovers perfectly; four literal original-source reads recover no continuous native GP29 prose. No unknown page plaintext or authenticated key resulted.

## Why these operands are plausible, with the unsupported choices exposed

Original LP2 pages **40–55** are one continuous sixteen-page floral section. The original images' three red runs comprise **p40 first8, p53 last51, p54 first9** GP29 symbols. Removing exactly those colored runes while retaining every black rune in physical book order yields **3248 = 16 × 203 = 16 × 7 × 29** GP29 indices. The exact physical source-defined red cuts and the resulting total are established independently in the [floral source-geometry report](lp2-floral16-3299-source-geometry-gate.md).

The [p49–51 base60 grid](../resources/liber-primus/lp2-grid-256.json) contains exactly **256 byte-valued entries in 32 printed rows of eight**. That is exactly enough entries for a 16×16 matrix, which naturally acts on blocks of sixteen runes from the sixteen-page section. A conventional 2014-era **Hill cipher over GF29** is a plausible *candidate* reversible operation: combine each consecutive pair of printed 8-entry grid rows into one 16-entry matrix row, reduce each 0–255 byte modulo29, and multiply 16-rune column vectors by the resulting matrix or its inverse.

Crucial conjectures: **the page never instructs a 32×8→16×16 regrouping or modulo29 key derivation, nor does the floral art say that its ciphertext is grouped in sixteen-rune blocks**. The alternative original 16-row register of203 columns crosses printed page boundaries. Both register layouts are tested as two finite, predeclared choices, and neither is retrospectively tuned.

## Exact source original-cipher test

The checked-in read-only [Node22 SFT](../sims/lp2_floral_p50_hill16_original_sft.cjs) first verifies every original p40–55 page rune count, the three red spans, the 256 unchanged grid values and the 3248-symbol black register. The proposed matrix **has full rank 16 over GF29** and therefore a unique 16×16 inverse. It verifies both `M·M⁻¹=I` and `M⁻¹·M=I` on all sixteen basis vectors.

For each placement, apply the matrix in both mathematically reversible directions to the original 3248 symbols and score the **entire** result without fitting any new key or changing physical source offsets:

| Original 3248-rune placement | Candidate output | Exact GP29 IoC | Adjacent identical rune pairs |
| --- | --- | ---: | ---: |
| **Source black register** | Original untouched ciphertext | **0.034491861377** | 21 |
| 203 consecutive 16-rune blocks | `M·C` | 0.034421315015 | 127 |
| 203 consecutive 16-rune blocks | `M⁻¹·C` | 0.034404626628 | 115 |
| 16 rows of203 symbols, 203 vertical columns | `M·C` | 0.034563735225 | 95 |
| 16 rows of203 symbols, 203 vertical columns | `M⁻¹·C` | 0.034427004237 | 100 |

The solved original native p57 reference has IoC about **0.062709966**, far above all four results. Their first complete output snippets are nonlinguistic, and each full 3248-symbol output retains a near-uniform GP29 histogram. A planted **source-native p57 control**, repeated to exactly 3248 indices, was transformed with the same M and recovered with M⁻¹ for **both** literal placements, giving **6496/6496 exact rune matches**. Every actual original output re-encodes to the exact original ciphertext. The finite failure is in the *candidate operation*, not an implementation error.

## Disposition

Retire the **byte mod29, literal 16×16 Hill matrix from the source grid, with the two natural source tape layouts and both directions** as a direct native-GP29 floral decoder. This does not exclude other historically selected meanings for the 256-byte table, non-GP plaintext, source-visible matrix construction rules of a different shape, or a layered cipher. Those possibilities require **additional independent instructions**, and this negative is no license to mutate its grid byte alphabet, reorder columns, or fit matrix orientation for better language scores.

[Windows Node22 read-only reproducibility PASS 45185772996](https://github.com/FlareZ123/liber-primus/actions/runs/45185772996). No source-derived plaintext, key consumer or final destination recovered.
