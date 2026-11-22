# Physical 23-dot mark / 2048-bit table: 89-block binary Golay gate

**Agent 50, 17 November 2026. Classification: source-motivated finite negative. No recovered unknown LP2 plaintext, creator key, or final destination.**

## Visible clue and decipherment hypothesis

The original pp49–51 contain a 32×8 = **256-cell** printed number table. Under the explicitly conditional base60-as-byte reading in [the checked source](../resources/liber-primus/base60-grid.json), this gives **2048 bits**. Original clear p57 (74.jpg) ends in a large **23-dot mark**, in a source-resolved 4/5/5/5/4 stencil. A player could count the dots and notice **2048 − 1 = 89 × 23**. The binary perfect **Golay (23,12,7) code** has 23-bit codewords.

A motivated finite possibility is one spare framing bit before or after 89 Golay codewords. We also test one secret **repeating 23-bit XOR mask** without guessing the mask: a linear Golay code maps every masked word to the same 11-bit remainder/syndrome. Direct codewords would give **89/89 zero syndromes**; one repeated mask would give **89 identical syndromes**. This would reveal a reversible original-source operation, although not yet a plaintext interpretation.

The word Golay is absent from the original manuscript. The physical 23 dots alone do not authenticate an error-correcting-code instruction, serialization, or mask source. The base60 byte reading is also provisional; this gate is conditional on that interpretation.

## Actual source test

The SFT reads all 256 unchanged repository table bytes, with no rune transcription. It evaluates row-major and column-major geometric readings, forward and reverse byte order, high-bit-first and low-bit-first byte serialization, and omitting either the first or last bit. For each of those 16 arrangements it checks both reciprocal degree-11 cyclic Golay polynomials **0xAE3** and **0xC75**, giving **32** frozen configurations. Every 2047-bit stream is split into 89 consecutive 23-bit blocks and divided over GF(2) by its generator. No symbols, errors, interleavers, codewords, or mask are chosen using a language score.

| Original-source outcome | Result |
|---|---:|
| Configurations tested | 32 |
| Configurations with zero valid codewords | 30 |
| Configurations with one valid codeword | 2 |
| Maximum valid words in any one configuration | **1 / 89** |
| Maximum frequency of a common syndrome | **2 / 89** |
| Maximum equal-syndrome collision pairs | 4 |

The two single-valid-codeword outcomes are reciprocal mirror layouts (column-major forward/MSB/omit first/AE3; column-major backward/LSB/omit last/C75). Even allowing an unknown 23-bit repeated XOR mask, every source layout falls 87 blocks short of the necessary common-syndrome condition.

For a uniform random 23-bit block, the zero-syndrome chance is 1/2048; an isolated zero is not significant. The sharp success criterion is complete original-stream consistency.

## Planted controls and boundary

The code independently generates 89 nonzero 12-bit message words, multiplies them by either generator in GF(2), and verifies 89/89 zero syndromes after testing both spare-bit positions. A constant one-bit XOR mask yields **89 identical nonzero syndromes** across the planted blocks, so both positive conditions are detectable. The two generator polynomials are also checked against x^23 + 1.

**Conclusion:** the native source table is incompatible with the literal one-bit-plus-89-Golay23-codeword receiver and its single constant 23-bit XOR-mask extension under all enumerated geometries. This excludes neither a nonrepeating pad, secret bit interleaver, changed table values, different byte interpretation, a code applied only after another unknown transform, nor other coding systems. Without independent first-party selection, enlarging the menu would be an arbitrary search.

The prior [RS/BCH2047 gate](lp2-grid-rs255-bch2047-codeword-gate.md) tested different error-correcting codes. The present test specifically probes the manuscript's original 23-dot stencil against a 23-bit code.

**Reproducer:** [Node 22 CommonJS source-input SFT](../sims/lp2_p50_golay23_89block_sft.cjs) and [original 256-byte table](../resources/liber-primus/base60-grid.json). The data computation was run independently against the fetched repository bytes. A manual Windows Actions test was dispatched; its completion had not yet been verified when this report was written.
