# Previous-cipher-word GP-prime → p50 consecutive table-key inverse

**11 November 2026, Agent45. Negative direct plaintext attempt, not an authenticated LP2 mechanism.** The original 2016 signed sentence says “Its words are the map, their meaning is the road, and their numbers are the direction.” Original LP2 pp49–51 print a 32×8 number table, provisionally interpretable as 256 bytes. A natural *causal and reversible* receiver can let the previous word's Gematria prime sum address that table and read consecutive key values for the next ciphertext word.

## Complete fixed operation

Inputs: canonical **2,896** GP29 words and **12,956** unsolved GP29 runes, with words continuous across physical line/page breaks; original **256** table bytes in printed row-major order; signed 2016 source; first source seed **3301**.

Set initial key address `A₀=3301 mod256=229`. For word `i≥1`, `Aᵢ = sum(GP primes of ciphertext word i−1) mod256`. For within-word rune `j`, take `bᵢⱼ = B[(Aᵢ+j) mod256]`. Fixed GP29 projections: `b mod29` or `floor(29b/256)`. Decrypt `Pᵢⱼ=(Cᵢⱼ ± projectedByte) mod29`. The inverse reencrypts each word using its previous *ciphertext* word's prime sum, so it is causal even with a secret-free printed table. Two projections and two signs give **four** interpretations, no offsets, random seeds, rotations or heuristic fitted parameters.

These operators add a source-table keystream **within words**, unlike the already-negative previous-word uniform/progressive Caesar checks or the p50 word-address byte-only diagnostic. The previous-word premise itself is speculative: the signed sentence does not command it, nor does it command one of the two byte projections.

## Source-original results

A GP29 Gibran trigram model trained only on its first 40,000 symbols has held-out native mean **−2.19096**; the raw original LP2 ciphertext scores **−4.222996**. Mean conditional-log scores (higher is more English-like):

| Byte projection | Decrypt `C−K` | Decrypt `C+K` |
| --- | ---: | ---: |
| `b mod29` | **−4.217693** | **−4.239975** |
| `floor(29b/256)` | **−4.239577** | **−4.244938** |

All four have full-text index of coincidence near **0.03446** (the random GP29 baseline is **1/29≈0.03448**), and their first 130 runes and final 76 runes are unintelligible. None materially approaches native prose. Every variation exactly reencrypts **all 12,956 original GP29 runes**, and independent native Gibran plaintext planted into the original 2,896 word-length layout encrypts and decrypts exactly using the same previous-cipher-word state. The inverse is therefore mathematically correct; the original outputs give no actual LP2 plaintext.

## Reproduction and conclusion

Exact original-input script: [`sims/lp2_previous_word_p50_consecutive_key_sft.cjs`](../sims/lp2_previous_word_p50_consecutive_key_sft.cjs) (`node sims/lp2_previous_word_p50_consecutive_key_sft.cjs`), **[manual GitHub Actions CI 43109551193 succeeded](https://github.com/FlareZ123/liber-primus/actions/runs/43109551193)**, including complete original reencryption and planted native GP29 inverse. Input 256 printed table values are conditional on the base60 interpretation; no empirical key was selected by score.

**Decision:** retire this one four-branch direct prior-word-address / consecutive-byte p50 GP29 stream mechanism. Do not infer that all word-directed keys fail, or iterate arbitrary state/reset/key maps without an independent human-visible selector.
