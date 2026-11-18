# LP2 p50 32×8 printed byte table: direct binary linear-generator gate

**Status, 18 November 2026: narrow original-source negative, no plaintext or creator key.** The authentic table in \`resources/liber-primus/lp2-grid-256.json\` contains 256 base60-decoded bytes in printed row order. If those printed bytes are consecutive, unmasked output bits from a binary linear feedback register, their 2048-bit serialization must satisfy a GF(2) linear recurrence no longer than that generator's linear state dimension. This hypothesis is an economical candidate for producing more key bits from an otherwise finite 256-byte source, but the manuscript does **not** instruct solvers to use an LFSR. The experiment tests the prerequisite before any unknown-page plaintext key search.

## Exact original-input observations

Use the complete, unchanged 256 bytes, keeping the 32×8 printed geometry. The exact Berlekamp–Massey shortest GF(2) recurrence degrees are:

| Bit readout of authentic table | Number of observed bits | Minimum binary linear recurrence order |
|---|---:|---:|
| Printed row-major, high bit first per byte | 2048 | 1024 |
| Printed row-major, low bit first per byte | 2048 | 1024 |
| Printed column-major, high bit first per byte | 2048 | 1022 |
| Printed column-major, low bit first per byte | 2048 | 1025 |
| Printed row-major, each bit position sampled once per byte (LSB→MSB) | 256 each | 128, 130, 129, 128, 128, 128, 128, 128 |

For any readout, a deterministic *direct, bit-per-clock* GF(2)-linear output stream with fewer state bits than its listed degree cannot produce the authentic 2048 observations. Independently for a one-byte-per-clock GF(2)-linear state machine with each of the eight output bits a fixed linear state projection, the per-plane degrees rule out **state dimension below 130** under printed byte order. This includes direct low-eight-bit xorshift32/64 outputs, without nonlinear scramblers, offsets or skipping. A 32-bit source-sized linear recurrence with seed \`0x3301\` and feedback \`b[n] = b[n−7] XOR b[n−32]\` supplies a positive test: its 2048-bit serial BM complexity is 30, and every one of eight decimated bit planes has complexity at most32.

These are the expected near-half-length complexity values of a pseudorandom-looking bit string. They supply **no cryptographic proof of unpredictability**. The sample is consistent with sufficiently large linear generators, nonlinear PRNGs, block-cipher output, keyed whitening, a byte-order/format transformation not tested here, or arbitrary ciphertext. Likewise there is no authenticated claim that the numerical table is a keystream sample at all.

## Research decision

Do not invest in a 32/64-bit *unscrambled GF(2)-linear* state recovery from the literal p50 byte stream, or use that model to extrapolate a supposed 12,956-rune book keystream. It is algebraically incompatible with the original. Future table attacks need an original-authored value-changing receiver or a different, independently motivated generator model; this finite gate is **not** an argument against the broader original-cipher inversion frontier.

The independent, read-only, source-native CommonJS SFT is [\`sims/lp2_p50_grid_gf2_linear_complexity_sft.cjs\`](../sims/lp2_p50_grid_gf2_linear_complexity_sft.cjs). Its deterministic assertions pin the original 256-byte prefix, both natural table traversals, both within-byte orientations, eight bit planes, and an exactly computable positive. No ciphertext plaintext recovery is claimed.
