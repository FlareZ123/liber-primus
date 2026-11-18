# p50 HMAC-SHA256-to-28-successor chain: original-cipher negative

**Decision, 18 November 2026, Director #1451.** The one frozen, whole-table HMAC-SHA256/28-successor GP29 chain returns ciphertext-like output on original p0 and independent p54–55. **No unknown plaintext, creator key, or final destination recovered.** This rejects precisely the construction below and does not exclude other source-table KDFs or changing-state mechanisms.

## Premise and source

The original p49–51 grid has 256 two-character numerical cells. Conventional base60 reads them as 256 bytes, SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. The same-page unknown ciphertext has 86 equal adjacent pairs in 12,901 links, an unusually sparse repeat rate. A predecessor-dependent output rule with a reserved repeat might explain that structure. The rival is a different cipher with unrelated grid content.

**There is no author instruction selecting HMAC, the EA repeat sentinel, or a global book clock.** They are experimental frozen conventions, not historically verified key material. This differs from prior AES-column, repeating-table and source-binary PRF studies.

## Complete frozen operation

- **Original input:** canonical 'resources/liber-primus/lp2-grid-256.json' bytes in printed p49–51 row-major order; no fitted key.
- **KDF:** HMAC-SHA256 using all 256 bytes as key and 4-byte big-endian counter, starting at zero. Take digest bytes less than 252 and map each byte modulo 28 to obtain k_i in 0..27. Reject all bytes 252..255. No salt, IV, skip or rotation.
- **Clock:** one global stream from the first p0 rune through all 55 rune-bearing unsolved pages, omitting runeless p50, without word/page reset.
- **Alphabet:** 29 canonical GP rune indices 0..28. The last rune EA has index28.
- **Forward:** C0 = (P0+k0) mod29. At every later rune if P_i=28 set C_i=C_(i−1), else C_i=(C_(i−1)+1+((P_i+k_i) mod28)) mod29.
- **Inverse:** P0=(C0−k0) mod29. Let d=(C_i−C_(i−1)) mod29. If d=0 set P_i=28; otherwise P_i=(d−1−k_i) mod28. This uniquely inverts all 29 possible inputs at each step.
- **Comparator:** same table byte multiset shuffled by a deterministic Fisher–Yates swap chosen using SHA256 of a fixed diagnostic label plus the loop counter. It is a negative control, not another fitted cipher.

## Reproduction and original-cipher outcome

The complete self-contained Windows Node22 SFT is [lp2_p50_hmac28_chain_source_sft.cjs](../sims/lp2_p50_hmac28_chain_source_sft.cjs). [Final original-data run 44280125805](https://github.com/FlareZ123/liber-primus/actions/runs/44280125805) **passed**, demonstrating exact 12,956-rune original round-trip, native English planted recovery and wrong-source-key rejection. [Initial run 44279937908](https://github.com/FlareZ123/liber-primus/actions/runs/44279937908) also passed, but its LP1 positive-control snippet accidentally included editorial header text; the final run fixes that. Original output metrics are unchanged.

Native-GP English reference: the first two-thirds of the pinned Gibran text train a smoothed trigram model; nonoverlapping windows in the final third provide independent controls. Normalized IoC multiplies by 29, so random GP29 is near 1. Scores are mean natural log probabilities, where higher is better.

| Input | Runes | GP29 normalized IoC | Trigram score | Worst comparable English | Native windows at/below |
|---|---:|---:|---:|---:|---:|
| p0 source | 262 | 1.022901 | −11.671871 | −9.047118 | 0/79 |
| p54–55 untouched | 308 | 1.011485 | −11.535809 | −8.993346 | 0/67 |
| p0 shuffled-table | 262 | 1.046650 | −11.733687 | −9.047118 | 0/79 |
| p54–55 shuffled-table | 308 | 1.017619 | −11.609117 | −8.993346 | 0/67 |
| LP1 source-solved control | 262 | 1.770992 | −8.196556 | −9.047118 | 50/79 |
| p57 source-clear control | 95 | 1.818589 | −8.123034 | −9.303546 | 144/219 |

The entire 12,956-rune original inverse has normalized IoC **1.023246**. The 86 inverse EA symbols equal the 86 original book-global doublets **by the model's definition**, so this agreement is circular, not key evidence. P0 starts ALINGEOYSEOAJCODJLTHAHEMTTATHNINGIBXAECXMMWUUCF...; p54–55 starts LHIHAEAEEOOEPHUXYRRUWUCEABOGOEGYNGPHFAPOEU...; neither is coherent English.

## Decision

**Retire this exact HMAC-SHA256, reject>=252, EA-sentinel, single-global-clock family.** The authentic original inverse is statistically inconsistent with the native English controls and similar to a permutation of the same source table. Exact reencryption is an invariant of every bijective candidate and provides no historical authentication. Do not retune alternative hashes, salts, clocks or exceptional glyphs absent a new independent source-selected instruction. The source grid remains an unresolved possible key or payload under other mechanisms.
