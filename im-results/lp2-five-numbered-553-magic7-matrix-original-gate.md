# Five originally numbered LP2 units as a 7×79 historical-square matrix

**Agent22, 23 November 2026. Classification: bounded original-cipher negative, no authentic plaintext.** The five numbered units inside original physical LP2 pp36–38 contain exactly 553 GP29 runes. Since 553 = 7×79, there is a complete rectangular input for the **authentic 2014 Cicada 7×7 magic square of row/column sum 1033**. The 2014 square and the chapter's printed 1033/3301 cuneiform motivate a concrete reversible matrix operation. Neither a 7×79 layout nor GF(29) multiplication is explicitly instructed by the original manuscript; their selection remains conjectural.

## Exact source register and fixed transformation

Input is the canonical physical rune tape `resources/liber-primus/lp2-corpus.json`, with the five originally red-numbered units in their literal order. Original ten-dot marks delimit the interval, independent of any language score:

| Unit | Physical original offset range | Rune count |
|---|---|---:|
| 1 | p36 [99,238) | 139 |
| 2 | p37 [0,91) | 91 |
| 3 | p37 [91,189) | 98 |
| 4 | p37 [189,228) and p38 [0,57) | 96 |
| 5 | p38 [57,186) | 129 |
| Entire tape | p36 offset99 through p38 offset186, original order | **553** |

Use the complete historical **seven-by-seven** matrix from `resources/cicada2014-openpuff-magic-squares.txt`, reduce its entries modulo 29 and invert over GF(29). It is invertible. There are exactly **two** literal orientations of the 553-runic tape tested: 79 consecutive columns of length 7, or 7 consecutive rows of length 79, acting on each seven-value column. Apply the original matrix either as the decoder or as the encoder, testing both directions. All positions, unit lengths and printed original word boundaries are retained, with no fitted key, shift, transposition search, arbitrary F-skip or inferred padding. The output is always all 553 original positions, and the forward map restores all original runes.

This differs from the published [source-square page-row repeated additive gate](lp2-seven-cuneiform-magic7-rowkey-gate.md), the p33 prelude 49-word square transfer and the [five-lane variable-active **5×5** square](lp2-five-numbered-variable-active-five-square-full-553-source-gate.md). This investigation tests the literal historical **7×7 Hill-type mixing of only the complete 553-rune numbered register**. It does not subsume those other scoped experiments.

## Whole-source observations

| Original consumer | Decoder output IoC | First 12 GP29 tokens |
|---|---:|---|
| 7 consecutive ciphertext runes as one vector, inverse square | **0.034390806405** | Y L L IA D M M IA TH M R A |
| 7 consecutive ciphertext runes as one vector, direct square | **0.034495636449** | W E IA H E G M P F AE J P |
| 7 rows ×79, per-column inverse square | **0.034259768850** | N J H A B L T S T D I S |
| 7 rows ×79, per-column direct square | **0.035144272348** | C NG G IA F H TH B C B AE AE |

The untouched original register has **IoC 0.034233561339**. Every recovered 553-rune tape remains close to the GP29 near-uniform baseline **1/29 ≈ 0.03448**, with no coherent native-English GP runic output. Each of the four decoders exactly re-encrypts the authentic 553 runes. Independently, native plaintext formed by repeating the authentic **solved LP2 p57** runic text through 553 positions, separately encrypting under each specified matrix layout and direction, is recovered **553/553**, so the tested inverse is operational. Such positive control cannot validate the historical use of a decoder.

**Decision:** This four-choice, source-motivated historical-square matrix transfer does **not** decrypt any of the five original units. The exact divisibility 553=7×79 by itself supplies no author-selected instruction to rotate, mix, or remap text. Retire this specific decoder family; continue only if an independent original clue selects a different typed operation or authentic key.

**Reproducer:** [Read-only Node22/CommonJS SFT](../sims/lp2_numbered553_magic7_matrix_original_sft.cjs). It parses original GP29 source data at runtime, checks all unit offsets and square line totals, applies exact GF(29) Gauss–Jordan inversion, checks all 553 original rerendered runes and 553 native planted symbols per variant, asserts all four reported IoCs, and logs output prefix glyph tokens.