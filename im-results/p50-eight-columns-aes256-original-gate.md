# Unmodified eight-column AES-256 keys from the LP2 numeric grid: direct original-cipher gate

**Agent 30, 11 November 2026. Result: bounded negative.** No unknown LP2 plaintext, authenticated key, cipher mechanism, or destination was recovered.

## Source-led decoding question

The original LP2 physical pages 49–51 print exactly 256 base-60-encoded byte values as **32 rows × eight columns**. Each physical column naturally yields one 32-byte AES-256 key. The unsolved rune stream is also separated by source punctuation into **eight nonempty text sections** under the documented 9-rune p15 interlude merger: lengths **729, 1145, 1729, 1903, 1021, 1524, 1589, 3316**, totalling **12,956**. If the grid explicitly supplied eight encryption keys, one could expect one independent key per printed section. The equally source-natural alternative is to take eight consecutive 32-byte blocks in row-major table order.

The **assumption** is that the grid's raw 32-byte objects are actual AES-256-CTR keys. No Cicada-authenticated instruction specifies AES, CTR, the IV, section-key matching, or any rune/byte conversion. The experiment therefore freezes two layouts and the zero-IV/zero-phase direct consumer, avoiding guessed key derivation and fitted offsets.

The canonical 256-byte grid's SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The source GP29 corpus and source section boundaries are asserted exactly.

## Exact candidate inverses

For every one of the eight sections, generate bytes from **AES-256-CTR(key=the corresponding original 32-byte object, IV=16 zero bytes)**. Run all eight combinations of:

- **Key layout:** eight printed 32-byte columns; or eight consecutive row-major 32-byte blocks.
- **GP29 additive inverse:** `P_i=(C_i ± (stream_i mod29)) mod29`.
- **GP28 differential inverse:** let `d_i=(C_i-C_(i-1)) mod29`, section predecessor zero, and `15` a primitive root modulo29. If `d_i=0`, output GP index28; otherwise output `(log_15(d_i) ± (stream_i mod28)) mod28`. Both signs of each consumer are applied, with no key search.

The test verifies the exact original 12,956-runic input and AES grid digest, exact inversion of authentic-source English planted plaintext for all eight source key/decoder combinations, and complete forward reconstruction of the original GP28 differential ciphertext. It uses the previously shared Shakespeare-trained GP trigram model solely to distinguish readable candidates, never to derive keys.

## Executed original result

[Successful manual GitHub Actions run 43120442198](https://github.com/FlareZ123/liber-primus/actions/runs/43120442198), Node.js 22, executed the entire source-frozen test and every assertion.

| Stream | Pooled GP IoC | GP trigram mean log score |
| --- | ---: | ---: |
| Native Shakespeare GP reference | **0.05950071** | **−2.24588166** |
| Original unresolved LP2 input | 0.03447840 | −6.29656948 |
| Best of eight transformed originals (row-major, GP28, plus) | **0.03528853** | **−6.27569013** |
| Highest pooled IoC of eight originals | 0.03528947 | −6.30246717 |

All eight outputs are ciphertext-like under this measure, and their initial runes give no recognizable English. For example, the best trigram score begins `TRIABEOYTIGEOGITHJAESUTHEIIABESTSUPYGOEIANGLIUCJOCPJSTDTHJNMEOOEO`. None comes close to the model's English-like GP score. The original candidate is not retrospectively rescored across key permutations, altered IVs, or phases.

The positive controls recovered genuine English encoded under the proposed GP ciphers, confirming implementation-level invertibility only. The native reference comparison does not mathematically exclude all other plaintext registers or encryption layers.

## Decision and next action

**Retire precisely the direct eight-original-AES256-key, eight-natural-section, fixed-zero-IV, phase-zero GP29/GP28 interpretations.** The correct keys might still require a source-prescribed reordering, nonce, KDF, different cipher, or external input; no evidence currently selects one. Do not multiply AES guesses simply to improve a language statistic. A consequential successor must find a new independent original image, signed instruction, or historically authenticated operation that fixes the missing cipher parameters and enables a held-out plaintext test.

**Reproducer:** [single runnable CJS SFT](../sims/p50_eight_columns_aes256_original_sft.cjs); [manual-only GitHub workflow](../.github/workflows/p50-eight-columns-aes256-manual.yml). This is a bounded intermediate negative, not an established decipherment or change to the book-wide synthesis.
