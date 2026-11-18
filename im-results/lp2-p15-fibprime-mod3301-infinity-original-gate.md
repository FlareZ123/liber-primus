# P15 infinite Fibonacci-prime key modulo3301: one original inverse

**Agent46, 18 November 2026. Original-input finite test; negative.** This tests a structurally different continuation from the established 14-period Fibonacci-mod29 candidate: use p15's original **3301**, rather than 29, as a modulus for Fibonacci *indices* before selecting each prime. **Neither additive direction decrypts the original pp16–22.** No author-specified cipher or key is claimed.

## One new source-motivated but not authored key rule

Original LP2 physical p15 (scan `32.jpg`) contains a red 3299, a 4×4 prime/Fibonacci spiral, and an infinity sign immediately beneath the grid. The existing established source solution is the sixteen spiral values
`abs(3301 − prime(F+1))` with unique Fibonacci inputs `[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]`. The first next unprinted Fibonacci input is 1597 and the next prime is 13477, making 10176 by absolute difference. Direct indexing by 10176 and ordinary period16 and 14 source-key schemes were previously tested; none is repeated here.

An *infinite* Fibonacci-indexed-prime key cannot be computed directly for thousands of consecutive terms: Fibonacci indices grow exponentially. One simple bounded continuation is to compute Fibonacci recurrence modulo the **printed anchor 3301**, then use `prime((F mod3301)+1) mod29` as the GP29 additive pad. This is a new hypothesis, since neither the original p15 image nor historical Cicada instructions specify reducing the Fibonacci rank modulo3301. We start at the first unprinted term 1597 and apply the stream **continuously** across exactly original physical pp16–22, the 1,744 rune symbols immediately after p15. No fitted seed, rank offset, guessed English, page rephasing, F-skipping, transposition, or period search is allowed. Two additive signs are checked.

## Original outcome and controls

| Register on exact 1,744 source runes | GP29 index of coincidence |
| --- | ---: |
| Original pp16–22 ciphertext | **0.03450960** |
| Candidate `C + key mod29` | **0.03470961** |
| Candidate `C − key mod29` | **0.03463329** |
| Independent genuine clear p57 repeated to the same length, test control | logged by reproducer, above 0.045 |

The extracted original text is nonlinguistic under either direction, with the first 64 GP transliteration letters beginning `IMNGIIBAEYRAENGALUNSNGEODCAEITHSEAWXEOCP...` (plus) and `YIAIAJOEETHIDOEOEOCHAEEOIAIRNGTHEASHCMF...` (minus). Both remain at the random-cipher IoC baseline, far below the authentic clear GP register. The control encrypts/reverses the complete same-length clear-p57 template using each source-derived key and reproduces **all 1,744/1,744 source-like plaintext positions exactly**.

The [single-file original-input CommonJS reproducer](../sims/lp2_p15_fibprime_mod3301_infinity_original_sft.cjs) recomputes every printed p15 spiral cell and prime, fixes the rank clock, and asserts exact round trips. [Windows Node22 original-source CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44263806914) reports both original IoCs. The operation itself has no independent authorial support, so its negative result retires **this exact modulo3301 unprinted-prime direct additive decoding**, not any nonlinear or externally keyed p15 continuation.

**Next decision:** avoid extending the model by fitting extra ranks, clocks, periods or secret letters; seek a first-party instruction or a typed source output that fixes a distinct consumer before more p15 computation.
