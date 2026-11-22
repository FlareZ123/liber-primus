# Byte-XOR row/column/GP codeword model fails on original 180 terminal-known runes

**Original-input decision, 14 November 2026 (Agent16):** The 256 printed base60 table bytes are incompatible with an entire family of 8-bit XOR decoders that grants a separate, completely unknown byte mask to every table row, table column and GP29 plaintext rune. This remains impossible across **1,024** source-natural concentric-ring mappings, including separate orientation choices for all three inner rings and reversal of the complete 180-rune known segment. No unknown LP2 rune, key or final Cicada destination has been recovered.

## Why this operation was worth one decisive test

Physical LP2 pp49–51 contain exactly **256 printed two-character numerals in 32 rows by eight columns**. Physical p55 has **76 unknown runes**; solved p56 has **85** and clear p57 has **95** GP29 runes, also **256** positions in total. Peeling the 32×8 table yields four concentric rings with **76, 68, 60, 52** cells. The solved p57 phrase about shedding circumferences suggests examining the 180 inner positions as a possible known-plaintext diagnostic. In the genuine 2014 puzzle, combining three OutGuess-derived binary shares with **XOR** was an authentic historical operation. These three source facts motivate a conditional byte-level XOR test without presupposing a particular secret key. No first-party source explicitly says the LP2 number table encodes the terminal pages this way.

Let the original table's conventional base60 byte in printed row `r` and column `c` be `B[r,c]`, and let `P[r,c]` denote the known plaintext GP29 index assigned to a specific interior-ring position. Grant **69 wholly arbitrary eight-bit secrets**, comprising 32 row masks, eight column masks and 29 symbol codewords:

`B[r,c] = R[r] XOR C[c] XOR S[P[r,c]]`.

The rune codewords `S[p]` need not be ordered, additive, predictable or even unique. Thus this permits an **arbitrary secret GP29-to-byte alphabet**, far beyond simply reducing bytes modulo29 or fixing an affine alphabet. The test also does not infer or assume plaintext for any of the 76 unknown p55 runes.

The genuine p56 key is independently reconstructed as `(prime[k]−1) mod29`, omitting the one literal unencrypted F at local offset56 from the prime clock, yielding **85/85** solved indices. P57 contributes its original **95/95** clear runes. Reading these 180 into the three inner rings supplies an independently known target for a complete 8-bit linear system over GF(2).

## A four-cell contradiction visible in the natural clockwise ring

Use the straightforward northwest-corner clockwise peeling, keeping original table coordinates zero-based. Four known p56 plaintext positions have the following source-matched table cells:

| Known plaintext position (within p56) | Assigned GP rune | Printed table location | Original byte |
| ---: | --- | --- | ---: |
| 26 | S | row22, col6 (flattened182) | **167** |
| 28 | S | row24, col6 (flattened198) | **105** |
| 45 | I | row24, col1 (flattened193) | **155** |
| 47 | I | row22, col1 (flattened177) | **131** |

These four source cells form a **two-row × two-column rectangle**. Both source cells in column6 have the identical known plaintext rune **S**, and both in column1 have identical known plaintext **I**. If the hidden-mask formula were correct, XORing the four equations would cancel every secret: each row appears twice, each column appears twice and each rune codeword appears twice. The byte XOR must therefore be zero, regardless of which arbitrary 69 secret bytes were chosen.

The actual original values give:

`167 XOR 105 XOR 155 XOR 131 = 214`, which is **nonzero**.

That is an exact four-cell original-data falsification of the most obvious inner-ring orientation. It requires neither an English-language score nor a guessed key.

## Whole supported ring-layout family

For each of the 68-, 60- and 52-cell inner rings, independently allow four starting corners and both directions, giving **8³ = 512** layouts. Include both source-page order and its full reversal for the known p56+p57 stream, making **1,024 complete original-data configurations**. Each gives 180 byte equations with 69 independent secret-byte variables. Gaussian elimination on the shared 69-bit coefficient masks propagates **all eight byte-level right-hand sides together** by XOR.

- **0 / 1,024** orientations permits an exact solution.
- The minimum number of nonzero residual equations under the source-ordered elimination algorithm is **119**. This is a contradiction count for the stated elimination order, **not** a proved minimum number of source edits.
- The coefficient matrix has at most **57** independent rows. Every orientation therefore imposes many necessary relations among the real 180 bytes.
- The exact four-cell northwest-clockwise witness above is also asserted directly.
- A fully artificial but source-shaped **256-symbol** ciphertext plant constructed from unrestricted independent row, column and rune byte secrets passes all **180 original-shaped known equations**, and all **256** planted symbols are recovered with the supplied synthetic keys. This confirms the matrix arithmetic and full 256-position indexing.

The complete standalone CommonJS test consumes unchanged `resources/liber-primus/lp2-grid-256.json` (byte SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`) and `lp2-corpus.json`:

- [Exact SFT](../sims/lp2_grid256_terminal_inner180_xor_allsecret_sft.cjs)
- [Passing Windows Node22 CI replay with the four-cell regression witness](https://github.com/FlareZ123/liber-primus/actions/runs/43634809508)

## Why this matters for future p55 research

This exact XOR-family exclusion is separate from the existing [GF29 source-inner rank/stencil/Hill gates](lp2-terminal256-original-inner-separable-gates.md), [secret static byte→GP lookup obstruction](lp2-grid256-terminal-solved180-lookup-gate.md) and [GF29 additive source token+row+column gate](lp2-p50-known180-token-rowcol-allsecret-gate.md). Those tests do not generally cover **8-bit XOR with arbitrary secret rune codewords and masks**.

There is also a structural gap even in a hypothetical positive version of this model: the 180 known inner cells never touch the two exterior rows and two exterior columns. Their four independent masks would be unconstrained by the known control, and every unknown outer-ring cell uses at least one of them. So an authentic inversion of p55 would still need a source-specified rule producing the exterior keys or an independent additional clue. The observed original contradiction is already decisive for this specific stationary model.

**Decision:** retire row+column+rune-codeword byte-XOR on the terminal 256/ring frame. Preserve the number table, ring geometry and historical XOR precedent as separate evidence, without proposing another fitted mask, orientation or unsupported postprocessing layer. New work should seek an actual author-selected external key or decoder capable of predicting unknown original plaintext.
