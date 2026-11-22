# Unmodified eight-column AES-256 keys from the LP2 numeric grid: direct original-cipher gate

**Agent 30, 11 November 2026. Result: bounded negative.** No unknown LP2 plaintext, authenticated key, cipher mechanism, or destination was recovered.

## Source-led decoding question

The original LP2 physical pages 49–51 print exactly 256 base-60-encoded byte values as **32 rows × eight columns**. Each physical column naturally yields one 32-byte AES-256 key. The unsolved rune stream is also separated by source punctuation into **eight nonempty text sections under either source-adjacent attachment of the 9-rune p15 interlude**. Joining that interlude with the preceding body gives section lengths **729, 1145, 1738, 1894, 1021, 1524, 1589, 3316**; joining it with the following body gives **729, 1145, 1729, 1903, 1021, 1524, 1589, 3316**. Both preserve the exact **12,956 original runes**. If the grid explicitly supplied eight encryption keys, one could expect one independent key per printed section. The equally source-natural alternative is to take eight consecutive 32-byte blocks in row-major table order.

The **assumption** is that the grid's raw 32-byte objects are actual AES-256-CTR keys. No Cicada-authenticated instruction specifies AES, CTR, the IV, section-key matching, or any rune/byte conversion. The experiment therefore freezes the two adjacent section interpretations, two raw table layouts and the zero-IV/zero-phase direct consumer, avoiding guessed key derivation and fitted offsets.

The canonical 256-byte grid's SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The source GP29 corpus and source section boundaries are asserted exactly.

## Exact candidate inverses

For every one of the eight sections, generate bytes from **AES-256-CTR(key=the corresponding original 32-byte object, IV=16 zero bytes)**. Run all **16** combinations of:

- **P15 boundary:** attach its nine runes to the immediately preceding or immediately following eight-way section.
- **Key layout:** eight printed 32-byte columns; or eight consecutive row-major 32-byte blocks.
- **GP29 additive inverse:** `P_i=(C_i ± (stream_i mod29)) mod29`.
- **GP28 differential inverse:** let `d_i=(C_i-C_(i-1)) mod29`, section predecessor zero, and `15` a primitive root modulo29. If `d_i=0`, output GP index28; otherwise output `(log_15(d_i) ± (stream_i mod28)) mod28`. Both signs of each consumer are applied, with no key search.

The test verifies the exact original 12,956-runic input and AES grid digest, exact inversion of authentic-source English planted plaintext for all 16 source key/section/decoder combinations, and complete forward reconstruction of the original GP28 differential ciphertext. It uses the previously shared Shakespeare-trained GP trigram model solely to distinguish readable candidates, never to derive keys.

## Executed original result

[Successful expanded manual GitHub Actions run 43125543947](https://github.com/FlareZ123/liber-primus/actions/runs/43125543947), Node.js 22, executed the entire source-frozen test and every assertion.

| Stream | Pooled GP IoC | GP trigram mean log score |
| --- | ---: | ---: |
| Native Shakespeare GP reference | **0.05950071** | **−2.24588166** |
| Original unresolved LP2 input | 0.03447840 | −6.29656948 |
| Best of 16 originals (nine-with-previous, column-key, GP29, minus) | **0.03448605** | **−6.27544473** |
| Highest pooled IoC of 16 originals (nine-with-previous, row-major, GP28, plus) | **0.03529205** | −6.27688628 |

All 16 outputs are ciphertext-like under this measure, and their initial runes give no recognizable English. For example, the best trigram score begins `NXWIDGSOIOEAFAEWJBWMUTLYOEANCOLXMOSEUOEUOPWRWGOBNGSLUONHEA`. None comes close to the model's English-like GP score. The original candidate is not retrospectively rescored across key permutations, altered IVs, or phases.

The positive controls recovered genuine English encoded under the proposed GP ciphers, confirming implementation-level invertibility only. The native reference comparison does not mathematically exclude all other plaintext registers or encryption layers.

## Structural AES-256 key-schedule check (12 November 2026, Agent30)

A second, materially distinct way to use the original **256 bytes** is to interpret one source-adjacent 240-byte interval as the **fully expanded AES-256 round-key schedule**, leaving sixteen bytes for a nonce or unrelated object. This would reveal an authentic 32-byte AES key *immediately*, if the printed table had intentionally recorded an entire expansion. It is a cheap structural decision independent of English language scoring, unknown ciphertext, and IV guessing. The strongest objection is that the author never identifies the table as an AES schedule; its 256-byte size alone is not an AES key indicator.

Using the **conditional base60 byte interpretation** with exact source SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, compare the natural printed row-major and alternative column-major serializations. For each, test a 240-byte schedule at offset 0 (16 trailing bytes) and offset 16 (16 leading bytes). Recover its apparent 32-byte root key from the start and deterministically expand it by the standard AES-256 round-key recurrence. A correct schedule would predict the next **208 bytes, 52 complete four-byte words**, exactly.

| Original serialization | 240-byte offset | Matching of 208 predicted bytes | Full predicted four-byte words |
| --- | ---: | ---: | ---: |
| Printed row-major | 0 | **1** | **0/52** |
| Printed row-major | 16 | **1** | **0/52** |
| Column-major alternative | 0 | **2** | **0/52** |
| Column-major alternative | 16 | **0** | **0/52** |

All four candidate schedules fail on their **first predicted word**, before any decryption attempt. The standalone reproducer checks the authentic **FIPS-197 AES-256 Appendix A.3 key-expansion vector**, including expanded words `9ba35411 8e6925af a51a8b5f 2067fcde`. A planted full 240-byte schedule derived from the original table's first 32 bytes passes **208/208** predicted bytes and **52/52** complete words; the original layouts remain structurally false. The source's alternative base59 interpretation, a key schedule with an unprinted transformation, rearranged bytes, or an external key is outside the test.

**Decision:** the printed 256-byte object is not directly a 240-byte *unmodified* AES-256 expanded schedule plus one 16-byte remainder in either of the two natural table orders. This eliminates a concrete route that could have recovered an authentic AES root key; it yields no plaintext or source-selected algorithm.

**Reproducer:** [FIPS197-checked CJS all-four-layout gate](../sims/p50_aes256_expanded_schedule_sft.cjs). The core SHA-pinned arithmetic was executed against canonical table bytes; the standalone Node file has not been dispatched through CI.

## Decision and next action

**Retire precisely the direct eight-original-AES256-key, eight-natural-section, fixed-zero-IV, phase-zero GP29/GP28 interpretations.** The correct keys might still require a source-prescribed reordering, nonce, KDF, different cipher, or external input; no evidence currently selects one. Do not multiply AES guesses simply to improve a language statistic. A consequential successor must find a new independent original image, signed instruction, or historically authenticated operation that fixes the missing cipher parameters and enables a held-out plaintext test.

**Reproducer:** [single runnable CJS SFT](../sims/p50_eight_columns_aes256_original_sft.cjs); [manual-only GitHub workflow](../.github/workflows/p50-eight-columns-aes256-manual.yml). This is a bounded intermediate negative, not an established decipherment or change to the book-wide synthesis.
