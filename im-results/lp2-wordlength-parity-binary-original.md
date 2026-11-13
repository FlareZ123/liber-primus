# The 2,896 printed words as a binary channel: source-frozen original-input gate

**Agent 13, 13 November 2026. Supporting evidence, a negative for a precisely delimited mechanism. No hidden payload, unknown plaintext, key or source-authenticated decipherment discovered.**

## Original clue and test premise

The authenticated 2016 Cicada note says the manuscript's words are the map and their numbers are the direction. It does not instruct parity, AES, or a byte readout. The manuscript has **2,896 complete words = 181 × 16**, page 15 has a **4×4 Fibonacci-prime spiral**, pages 49–51 a **32×8** numerical table interpretable as 256 bytes, and solved p56 prints a 64-byte digest. One affordable independent test is whether the parity of each printed GP word's length conceals a binary payload that the table can decrypt.

Competing explanation: original word boundaries carry no separate message. Both the factorable count and nearly balanced odd/even numbers may occur incidentally. The specific codec has no recovered historical selector.

## Frozen original-source test and exact results

Use 55 original rune-bearing unknown pages, with physical p50 runeless. Reassemble words over typography breaks and physical page boundaries. Inputs are **12,956 untouched original runes**, **2,896 complete words**, **1,450 odd** and **1,446 even**. Odd maps to bit1, even to bit0, with bit7 first within each byte.

Source-typed paths: original book order; per-16-word rows in printed p15 spiral or inverse; per-181-word columns in identity, spiral or inverse arrangement. Each of six direct interpretations has **362 bytes**. Original book order starts in hex 5ed4f0e82728f78054d922cdc47e0fdb and has **136/362** ASCII-printable/newline bytes, with no recognizable text or file signature.

The finite decryptor consumes one of eight original 32-byte table columns or eight consecutive row-major 32-byte chunks, under AES-256 CTR/CBC/ECB. For CTR/CBC the IV is zero or the first 16 original p56 digest bytes; ECB has no IV. This produces **480 finite original-cipher interpretations**, with no unknown keys, offsets, bit shifts or search-derived passphrases. CBC/ECB consume 352 whole-block bytes; CTR consumes all 362.

| Outcome | Exact original-input evidence |
| --- | --- |
| Best AES candidate of 480 | **162/362** printable/newline bytes, **44.7514%** |
| Source presentation and cipher | 181×16 column spiral, table column 3, AES-256-CTR, p56-digest IV |
| First 16 best output bytes (hex) | 589efbc4d2c13fe6293d7404540e7131 |
| Independent positive inverse | **45/45** source-native synthetic GP-word-parity encoded message bytes, decrypted through the same bit parser and source AES key/IV |

The maximum score is compatible with random binary output, contains no coherent unknown plaintext, and lacks an identifiable file header. Successful re-encryption of a planted control establishes implementation correctness only.

## Decision and scope

The direct **word-length parity → binary bytes → table-key AES** path is negative under these explicitly limited source-typed readouts. The nearly even parity count alone does not establish the channel. Different independently sourced words-to-bits encodings, passwords and file formats remain open if original evidence selects them. No broader hidden-message exclusion follows.

Reproducer: [CommonJS original-source single-file test](../sims/lp2_wordlength_parity_binary_source_sft.cjs). Completed successful [Windows Node 22 GitHub Actions original-input run](https://github.com/FlareZ123/liber-primus/actions/runs/43516237096). Leave this as an intermediate research negative; the established-results synthesis is unchanged.
