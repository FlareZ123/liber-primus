# Source p7 quartic: four-channel GF29 CRT direct original inverse

**Agent1, 22 November 2026.** One new **complete and reversible** mathematical consumer was tested on original LP2 runes with no key fitting. It fails as direct plaintext. This extends the p7-p8 polynomial source by using **all four quotient-ring channels at once**; the prior p7 field56 test instead multiplied *pairs* in the residual quadratic alone.

## Motivated source input and one frozen operation

The five original physical p7 terminal red complete words have GP0 products `[11,26,8,15,2]`, defining the conditional original polynomial `P(X)=11+26X+8X²+15X³+2X⁴ mod29`. Its exact fixed-point equation is

`P(X)-X = 2 (X-3)(X-4)(X²-8) mod29`.

The following physical p8 red heading has whole-word products **4,3** in that printed order. Over GF29 these are pairwise coprime factors, hence the **Chinese remainder theorem** defines a unique, invertible four-channel map from a cubic's four source coefficients to its two values at printed roots **4 and 3** and its two coefficients modulo the quadratic **X²−8**. With `C(X)=c0+c1X+c2X²+c3X³`, freeze output in source order

`[C(4), C(3), C(α)|constant, C(α)|α] = [c0+4c1+16c2+6c3, c0+3c1+9c2+27c3, c0+8c2, c1+8c3]`

where `α²=8` and all operations are modulo29. Its matrix M and exact inverse are

```text
M    = [[ 1, 4,16, 6], [ 1, 3, 9,27], [ 1, 0, 8, 0], [ 0, 1, 0, 8]]
M^-1 = [[ 3,26, 1,26], [28, 8,22,10], [25, 4, 0, 4], [11,28,19,17]]
det(M) mod29 = 21 ≠0
```

This uses the actual p7 factorization, p8 printed root order, and *every* rune within each four-rune block. No hidden key, alphabet permutation, prime-table radix or arbitrary exponent is introduced. Treat all real runes in source order, starting at each designated complete original section's first rune; preserve 1–3 trailing runes unchanged for perfect replay. Both source→CRT and CRT→source inverse orientations were tested, since the page gives no encryption direction.

## Exact original receiver results

Unaltered original GP29 indices come from `resources/liber-primus/lp2-corpus.json`. Each section retains real page-crossing rune order; no claimed plaintext word boundaries are imposed after transformation.

| Physical page section | Original runes | CRT IoC | Inverse-CRT IoC |
|---|---:|---:|---:|
| p8–14, immediately following the source title | 1729 | **0.0342603303** | **0.0344203190** |
| p16–21, independent Fibonacci chapter | 1613 | **0.0343848600** | **0.0346033084** |
| p33–39, cuneiform 840-pair chapter | 1680 | **0.0345961315** | **0.0343557673** |
| p40–53, broad independent holdout | 3008 | **0.0344230041** | **0.0344636893** |
| p54–55, terminal source | 308 | **0.0341384999** | **0.0339692880** |

The unaltered p8–14 source itself has IoC **0.0344604835**. The full CRT result opens with GP transliteration `STIBXUHAEUCYRDYIUAEHBEC...` and the inverse opens `IAPTHHDEAXHGMAEWSI...`; neither contains a continuous intelligible passage. All five untouched sections remain at near-uniform GP29 inventory in both directions. The genuine solved p57 GP text has IoC about **0.06271**; this exact family does not behave like that native solved source.

The [single-file Node22/CommonJS SFT](../sims/lp2_p7_quartic_crt_fourchannel_original_sft.cjs) checks all four matrix basis states, exact source reencryption of **every original rune** in each of the five sections, both clock directions, original full-run IoCs and an independently known **96-rune p57+p56 GP-positive** that encrypts and decrypts without error.

## Decision and important missing input

The four-factor decomposition is a mathematically *canonical consequence* of the original p7 quartic and p8 red fixed points. A source-visible operator converting encrypted four-rune blocks into four CRT coordinates would be a compact, credible human-solvable cipher step **if** the manuscript indicated this coordinate change. It presently does **not**: there is no printed original CRT instruction, four-rune block clock, source/target role assignment, or basis orientation. More importantly the most literal complete direct CRT operations already fail original language tests across five independent sections. Do **not** rescue this negative with additional arbitrary block offsets, nonlinear key schedules or tuned layer compositions.

This decision does not reject the established p7→p8 source arithmetic or a future first-party-selected more elaborate state update. **No unknown LP2 plaintext or recovered key.** Independent earlier work on the residual quadratic's 56-state pair multiplier is `im-results/lp2-p7-gf29sq-order56-original-pair-inverse-gate.md`; the already failed separate p3 GF841 discrete-log experiment is `im-results/lp2-sevenpage-840-gf841-log-inverse.md`.
