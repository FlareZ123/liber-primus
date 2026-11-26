# Fixed p56 prime-shift × p28 GP29 power inverse on original p27–32

**26 November 2026 — Agent31.** A constructive, exact-state, spacing-free receiver recovers all six hidden model/origin controls but no authentic LP2 plaintext. All six compositions have zero complete original paths in the stated 3,302-origin domain.

## Source motivation and exact model

The solved p56 cipher uses the prime-minus-one shift and literal plaintext Fehu bypass. The separate provisional p28 READ OUT route nominates reversible decode exponents 3 and 27; that local phrase has not been authenticated as general plaintext. Consider the smallest direct compositions of these two operations. There is no first-party instruction selecting the composition, and this does not reopen the rejected identity-offset public prime-exponent clock. Use zero-based GP29 indices. At consumed prime ordinal j let k=(prime[j]−1) mod29. For e=3 or 27, define the consuming inverse D_j(C) as one of:

- shift-power: (C−k)^e mod29;
- power-shift: C^e−k mod29;
- conjugate: (C+k)^e−k mod29.

All 29 shifts and both exponents are bijections; the forward table is the exact inverse. Plaintext F/index0 passes unchanged and does not consume a prime. A consuming inverse must produce a nonzero rune. When C=0, the decoder can hold or consume if legal; no heuristic mask clipping. The six models and all initial ordinals 0–3301 are tested, continuously over physical p27–32, with no printed word, line or page reset. The test is finite to these six compositions and this clock domain. Origin range is an exploratory 3301 bound, not an authenticated authored key range.

## Receiver and controls

Native GP tokenization uses QU→CW, V→U, K/Q→C, Z→S, with ING→NG and IO→IA and longest remaining GP tokens inside each word. Train a backoff GP trigram model (217,106 Shakespeare runes; add-0.5 unigram, interpolation strength 8). Exhaust Boolean reachability by (position,number of previous holds) for all 19,812 parameter pairs; exact maximum-sum DP over (clock,last two plaintext symbols) on every surviving first-page candidate. Select only by p27-sized first 234 runes, freeze form, origin, last two symbols and clock, and decode the next 1,199 without changing those fitted parameters. Viterbi chooses legal latent hold paths; forward re-encoding checks implementation, not authorship.

Six independent planted keys, distinct Gibran/Emerson excerpts not used for training, one per form:

| Decode exponent | Form | True/recovered origin | Fit exact | Held exact | Fit / held nats per rune |
|---:|---|---:|---:|---:|---:|
| 3 | shift-power | 17 | 234/234 | 1199/1199 | -2.552 / -2.308 |
| 3 | power-shift | 123 | 234/234 | 1199/1199 | -2.366 / -2.499 |
| 3 | conjugate | 411 | 234/234 | 1199/1199 | -2.131 / -2.246 |
| 27 | shift-power | 917 | 234/234 | 1199/1199 | -2.394 / -2.386 |
| 27 | power-shift | 1701 | 234/234 | 1199/1199 | -2.261 / -2.282 |
| 27 | conjugate | 3201 | 234/234 | 1199/1199 | -2.425 / -2.464 |

All six hidden model/origin pairs and 8,598/8,598 control runes recovered. Controls are deterministic literary plants, not authentic unknown LP2 keys or psychological blind tests.

## Original decision

Input: original canonical p27–32, 1,433 runes. The first 234 are p27; the following p28–32 constitute the model-parameter continuation. These pages have been previously examined in the project and are not a manuscript-wide fresh holdout. All 731 candidate parameter pairs legal on p27 are then subjected to **separate exact full-tape reachability** without freezing the Viterbi hold history or any language assumption.

| e | Form | Legal p27 pairs | Legal full pairs | Longest legal prefix | Full paths compatible with conditional READ OUT |
|---:|---|---:|---:|---:|---:|
| 3 | shift-power | 141 | 0 | 642/1433 | 0 |
| 3 | power-shift | 133 | 0 | 564/1433 | 0 |
| 3 | conjugate | 117 | 0 | 556/1433 | 0 |
| 27 | shift-power | 141 | 0 | 642/1433 | 0 |
| 27 | power-shift | 136 | 0 | 674/1433 | 0 |
| 27 | conjugate | 63 | 0 | 614/1433 | 0 |

The fit-selected model is power-shift, e=27, origin2732, fit −5.897 nats/rune; its frozen continuation dies after 23/1199 additional symbols. The source-only p28 coordinate for the conditional READ OUT is full-section offset368 (original [9,28,24,10,1,20]); the independent full-path check additionally tests [4,28,23,3,1,16] without imposing it in training. Because all full paths die, no such conditional crib can be compatible either. This is an exact reachability obstruction, stronger than language ranking.

Do not retune this receiver with additional exponents, arbitrary translations, offsets or resets absent independent source evidence. It supplies no plaintext, authenticated key or continuation destination. The local p28 exponent candidate and solved p56 control retain their separate evidence status.

## Reproduce

`node sims/lp2_prime_power_composite_inverse_sft.cjs` (repository root; CommonJS, built-in modules only). The connected V8 runtime executed the same attack body, including the original and six control searches; standalone Windows Node/CI was not separately run. Full output: [JSON](./lp2-p28-p56-prime-power-composite-output.json). Canonical input: [corpus](../resources/liber-primus/lp2-corpus.json). Related independent source branches: [p28 exponent gate](./lp2-p28-exponent-source-gate.md) and [prime-exponent fixed-symbol gate](./lp2-prime-clock-exponent-permutation-fixed-symbol-gate.md).
