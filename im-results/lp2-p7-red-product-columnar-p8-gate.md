# P7 five-red-word products as a 5-column key for p8: original-body gate

**Agent 27, 22 November 2026. Classification: bounded original-input negative.** No unknown plaintext or key was recovered. This tests the direct geometric use of p7's five red words and five dots as a key for the adjacent p8 body.

## Human-visible premise

Original p7 ends with five red printed words above five black dots. Their GP29 rune sequences and products modulo 29 are:

| Red word | GP29 runes | Product mod 29 |
|---|---|---:|
| 1 | [23,3] | 11 |
| 2 | [22,16,2,25] | 26 |
| 3 | [5,7,11] | 8 |
| 4 | [14,28] | 15 |
| 5 | [6,28,19] | 2 |

This yields the source-order key vector **[11,26,8,15,2]**. The immediately following p8 page has a 12-rune red heading and a **243-rune black body**. Its length has a natural width-five fit:

~~~text
243 = 5 × 48 + 3
~~~

A human solver could therefore use the five word products as a stable column-rank key and the five-dot marker as the column count. Columnar transposition is a recognizable classical operation; earlier Cicada rounds also used transposition. This is a direct geometric alternative to the period-5 Vigenère receiver tested separately.

## Frozen operation

Stable-rank the five product values, preserving left-to-right order for ties (there are no ties). Test ascending and descending rank, each with both natural transform directions:

- row-write into five columns, then read columns in key order;
- the exact inverse, filling columns in key order and reading rows.

For 243 symbols, the row-write rectangle has 49 rows and fixed column lengths **[49,49,49,48,48]**. No arbitrary column permutation, rotation, phase, second cipher, or word-specific reset is permitted.

## Results

The standalone Node 22 SFT is **sims/lp2_p7_red_product_columnar_p8_gate.cjs**. It derives the p7 red words from the canonical transcription and ink annotations, computes the five products, asserts the p7/p8 source spans and 243-rune target, verifies both exact transform round trips, and tests planted clear-p57 positive controls. Scoring uses the repository's source-calibrated GP29 orthography encoder and solved LP1 plaintext reference. The native-GP trigram model is compared against **710** original LP1 windows of exactly 243 runes.

| Key rank direction | Transform applied to original p8 body | IoC | Native-GP trigram mean log score |
|---|---|---:|---:|
| Unchanged body | — | 0.0340441452 | −10.7778556810 |
| Ascending stable | Inverse columnar | 0.0340441452 | −10.6755218327 |
| Ascending stable | Forward columnar | 0.0340441452 | −10.8375243695 |
| Descending stable | Inverse columnar | 0.0340441452 | −10.8160992568 |
| Descending stable | Forward columnar | 0.0340441452 | −10.8538389987 |

The 710 native-GP 243-rune windows have score range **−7.5814652309 to −6.8264385611**, with median **−7.1864324868**. The best transposition candidate remains more than **3.09** score units below even the weakest native window. IoC is unchanged, as a pure transposition must preserve symbol counts.

**Scoring limitation:** this is a native-GP English-register screen using the solved LP1 reference, not a multilingual adjudicator. It rejects these exact receivers as native-GP English candidates; it does not exclude a different language register.

## Decision

Retire the exact direct receiver **p7 red-word products [11,26,8,15,2] → stable 5-column rank order → pure columnar transposition of the 243-rune p8 black body**, for both rank directions and both transform orientations. Do not expand into arbitrary permutations or additional layers without a new first-party selector.

This does not refute other uses of the p7 five-point packet, its quartic structure, a nonperiodic key schedule, or a different cipher on p8.

Reproduce from the repository root with:

~~~sh
node sims/lp2_p7_red_product_columnar_p8_gate.cjs
~~~

Sources: **resources/liber-primus/lp2-corpus.json**; **resources/liber-primus/lp2-ink-annotations.json**; **resources/liber-primus/lp2-transcription.txt**; **resources/liber-primus/lp1-plaintext-reference.txt**; **sims/lp2_native_gp_source_orthography_sft.cjs**; p7 arithmetic is consolidated in **im-results/lp2-p7-p8-red-product-state-header-keyclock.md**.
