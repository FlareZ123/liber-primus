# Original LP2 table-pad all-phase singleton-word obstruction

**Classification:** finite original-cipher, native-English necessary-condition exclusion; 15 November 2026, Agent 15. **No unknown-page plaintext, key, or creator-selected cipher recovered.**

## Causal hypothesis and rival

The runeless physical LP2 p50 prints a 32×8 field of 256 two-character numerals. LP1 explicitly makes GP prime values sacred and the solved LP2 p56 uses a GP29 additive prime-derived stream. One economical candidate would read the p50 field as a repeated source-supplied key stream and apply the same single-rune additive register as the solved Vigenère-style sections. The rival explanation is that the numerical table is unrelated to this cipher or requires a different state, clock, input, key derivation or output register. No original instruction selects this candidate or a specific table phase.

A strong key-independent plaintext anchor is available under **the native English register used by solved LP**: printed **one-GP-rune words** should decrypt to standalone `A` (GP index 24) or `I` (index 10), if word boundaries are preserved. A deliberately generous condition also allows standalone `O` (index 3). These lexical constraints are necessary for this narrow English/word-preserving mode; they are not claims about other plaintext languages, null insertion, abbreviation systems or lost word boundaries.

## Exact source and 4,096 finite models

- `resources/liber-primus/lp2-corpus.json`: physical p0–55, 12,956 exact GP29 indices.
- `resources/lp2-transcription.txt`: preserves the 2,896 original printed typographic words, of which **83 contain exactly one rune**. Printed line and page breaks are transparent; `-`, `.`, `&`, `$` and `§` terminate words. The rune stream matches the corpus exactly.
- `resources/liber-primus/lp2-grid-256.json`: original 256 printed numeric tokens; source-derived radix60 values and the competing radix59 interpretation obtained by omitting the sole unused digit `f` in the printed digit alphabet.

For each numeral interpretation, test printed and reversed byte order; a globally continuous and a physical-page-reset rune clock; both modular additive signs; and **all 256 phases of one common source-pad cycle**. The tested inverse is

`P_i = (C_i - sign × table[(clock_i + phase) mod 256]) mod 29`.

This is 2×2×2×2×256 = **4,096 fully enumerated pads**. Every original one-rune word must decode to `A` or `I`. Even allowing `O` independently, **zero pads** satisfy all 83 one-rune constraints.

| Original-source test | Best satisfied singletons | Required |
|---|---:|---:|
| English A/I, every pad | **15 / 83** | 83 / 83 |
| Generous A/I/O, every pad | **20 / 83** | 83 / 83 |
| Planted A/I word values, true radix59 forward/global key, sign +1, phase 175 | **83 / 83** | 83 / 83 |

The best A/I case occurs with either radix59 forward global/sign +1/phase175 or radix59 reversed page-reset/sign −1/phase224. These phases are **search diagnostics**, not proposed keys. The planted control puts genuine A/I GP indices at all 83 fixed original singleton positions, encrypts them with the chosen source-table rule, and retrieves all 83 exactly. Its wrong-phase control fails.

## Cryptanalytic consequence and boundaries

This falsifies the **entire enumerated family of unskipped, fixed-rate, phase-shifted, simple modular GP29 table pads under original English word boundaries**. It is stronger than observing near-uniform whole-text index of coincidence at a few arbitrarily chosen phases, and it requires no guessed full-page translation. The finite test is also consistent with the many earlier p50 direct-pad and word-shape gates; it is a new exact singleton necessary-condition check, not a newly identified authorial mechanism.

The exclusion **does not extend** to separately rekeyed pages, word-local or plaintext-feedback clocks, transformed table bytes, arbitrary secret codebooks, historical transparent-plaintext-F key skips, unknown languages or nonliteral typography. In particular, the genuine p56 cipher uses a transparent plaintext-F bypass, and that model is outside this fixed-rate gate. The test supplies no way to recover plaintext from the remaining candidate families.

**Reproduction:** [single-file Windows Node.js 22 CommonJS SFT](../sims/lp2_p50_allphase_singleton_native_sft.cjs). It reads original source files, verifies the 12,956-rune stream, 2,896 words and 83 singleton positions, exhaustively checks all 4,096 candidate pads, and asserts a source-table positive and wrong-phase negative. A direct JS execution over the same exact GitHub file contents produced the stated original counts and maxima; an independent CI job has not yet been run. The useful next step is acquisition of an **original source clue selecting a genuinely different key-consumption rule**, rather than another unconstrained phase or table-key screen.
