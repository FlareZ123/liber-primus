# LP1 MOBIUS and the LP2 page-40 red heading: a source-selected Cayley bridge to the lag-six echo

**Classification (10 November 2026): exact cross-artifact algebra with an observed ciphertext match; authorial intent remains unproven. No unknown LP2 plaintext, real key, complete cipher, or destination is recovered.** This links the [previously established LP1 Möbius square](../sims/lp1_mobius_corner_power6.cjs) and [previously established p40 red-heading / T6 observation](red-prime-gap-affine-echo.md) through a new exact operator identity. The source material and the lag-six echo were already known before the link was derived; the comparison is therefore *retrospective*, not an independent pre-registered significance result.

## Human-visible source path

Three independently printed features motivate a limited operation:

1. LP1 original scan 05 has a 5×5 Gematria-prime magic square containing the word **MOBIUS**. Its symmetric opposite-corner 2×2 matrix, reduced modulo the 29-rune GP alphabet, is
   \[
   A=\begin{pmatrix}272&151\\151&272\end{pmatrix}
     \equiv\begin{pmatrix}11&6\\6&11\end{pmatrix}\pmod{29}.
   \]
   The corresponding p16 corner matrix from the second LP1 square is projectively the sixth power: `M16 = 21 A^6 (mod29)`. This is an existing exact source relationship, not a new key. It offers an **independent six-step interval** to compare with the original word-local lag-six anomaly; connecting those two meanings of six is still an interpretation, rather than an authorial instruction.
2. LP2 physical page 40 begins with the actual eight red runes `ᚠᚾᛗᚣᚷᛞᚫᚻ`. Their original GP prime weights sum to **435 = 29×15**, and their last rune **ᚻ** has zero-based GP index **8**. Both are read from `resources/liber-primus/lp2-ink-annotations.json` and `lp2-corpus.json`, without choosing ciphertext-dependent values.
3. The canonical `MOBIUS` diagonalizing coordinate for this symmetric matrix is the projective Cayley transform `(x−1)/(x+1)`. Center it on the independently printed page-40 final-rune index 8:
   \[
   h(x)=8+\frac{x-1}{x+1}=\frac{9x+7}{x+1},
   \quad
   H=\begin{pmatrix}9&7\\1&1\end{pmatrix}.
   \]
   Here the point `x=−1` maps to projective infinity; the identity is interpreted on the complete 30-point projective line `P¹(F29)`.

## A second independent arithmetic reading of the same red heading

The eight p40 rune **indices** are `[0,9,19,26,6,23,25,8]`, whose sum is **116 = 4×29**, while their corresponding original GP **prime weights** are `[2,29,71,103,17,89,101,23]`, summing to **435 = 15×29**. Among all **18** red spans recorded in the original-image annotation, p40 is the **only span** for which **both** raw index sum and assigned-prime sum are divisible by 29. Three spans have prime-weight sums divisible by 29: p15 (638), p40 (435), and p53 (2262); only p40 has the companion index-sum property. The complete double-divisibility assertion is now tested automatically in the same original-source SFT.

The ordered quotients `(4,15)` are source measurements independent of the ciphertext. Their meaning as a checksum, key pair or instruction has **not been established**; interpreting either quotient as a cipher parameter without another clue would be speculative.

## Exact derived map, no fitted coefficient

Over `F29`, the LP1 matrix satisfies `h(Ax)−8 = 2(h(x)−8)`. Applying it the **15** times specified by the LP2 red prime quotient gives `2^15 ≡ −2 (mod29)`, hence

\[
\boxed{h(A^{15}x)=8-2(h(x)-8)=24-2h(x)\pmod{29}.}
\]

The full matrix certificate is

\[
 A^{15}=\begin{pmatrix}23&18\\18&23\end{pmatrix},\qquad
 H A^{15} H^{-1}=\begin{pmatrix}5&27\\0&12\end{pmatrix}
 =12\begin{pmatrix}27&24\\0&1\end{pmatrix}\pmod{29}.
\]

Thus the source-determined affine map is **`T(x)=27x+24=24−2x (mod29)`**. Its unique finite fixed point solves `3x=24`, yielding **8**, the *same p40 final red rune*. This is exactly the previously observed word-local six-back map, derived here from a separate earlier puzzle artifact. The source p05 `MOBIUS` prime-sum cell `226` also supplies a finite seed: `h(226 mod29)=21`. Starting at 21, repeated `T` visits **all 28 non-8 GP field symbols exactly once** and returns to 21; 8 is fixed.

These facts give a source-constrained, fully specified 28-cycle and a genuine algebraic bridge. They do **not** specify that the cipher actually uses this cycle as a pad, alphabet, state or plaintext-marker encoder.

## Original-ciphertext comparison and competing original red spans

Use all **2,896 whole LP2 unsolved rune words** and **12,956 runes**, keeping 32 page-spanning words intact. For every word-local `j≥6`, compare `C[j]` to `T(C[j−6])`. There are 1,290 eligible original pairs, of which **80 match**.

To make the observed ranking explicit, compare the same 1,290 original pairs against every invertible affine map `x↦a x+b mod29`, with `a=1..28`, `b=0..28`: **812 maps**. The derived `(a,b)=(27,24)` is the **unique maximum at 80**; the runner-up has **65**. This is a reproducible empirical rank, **not a 1/812 null p-value**. The unusual T6 count and its multiple-search calibration were independently reported before this new cross-artifact interpretation.

Of all **18** LP2 red annotation spans, exactly three have GP-prime sums divisible by 29. For a consistent source-only comparison, derive each span's Cayley exponent as `sum/29` and fixed point as its last red GP rune, giving `x↦f+2^(sum/29)(x−f)`:

| Original red span | Sum / 29 | Last rune GP index | Source-derived affine map | Original six-lag matches |
| --- | ---: | ---: | --- | ---: |
| p15 opening | 638 / 29 = 22 | 24 | `5x+20` | 58 / 1,290 |
| **p40 opening** | **435 / 29 = 15** | **8** | **`27x+24`** | **80 / 1,290** |
| p53 red block | 2262 / 29 = 78 | 9 | `5x+22` | 64 / 1,290 |

This three-way comparison is also retrospective: requiring divisibility by 29, choosing the final rune as fixed point, choosing the p05 corners, and selecting the six-back coincidence were informed by previous findings. There are other mathematical functions and page features one could have selected. The three rows are consequently a useful *bounded comparison within a concrete proposed reading*, not a measure of how unlikely the whole clue discovery was by chance.

## Exact obstruction to using the recovered 28-cycle as a direct rune substitution

The source-defined map `T(x)=8−2(x−8)` has fixed point **H = GP index 8**. Every power `T^k`, for **every independently chosen exponent `k`**, satisfies the exact equivalence

\[
 T^k(P)=8 \quad\Longleftrightarrow\quad P=8.
\]

Consequently a cipher applying `T^k` as a **direct symbol substitution** can never encrypt an original GP-English one-rune word `A` (index 24) or `I` (index 10) into the ciphertext rune **ᚻ**, regardless of its unknown key, clock, page phases or changes in `k` between symbols.

The original 2,896 canonical complete rune words contain **83** single-rune ciphertext words, including **four** consisting solely of ᚻ: whole-word ordinals **205, 398, 1688 and 2140** on physical pages **4, 7, 30 and 39**. Each of those four is algebraically impossible for the specific **direct power-of-T on ordinary GP-English with preserved word boundaries** model. The SFT checks all 28 exponents against all 29 GP source symbols, and asserts those four original physical locations.

This is an **exact original-cipher necessity failure for this narrow mechanism**. It says nothing against a keyed *differential-step* cipher using the T-cycle, extra encoding layers, another language with a genuine one-rune H word, or changed plaintext word boundaries. Earlier all-symbol passthrough and fixed-word-alphabet source gates already constrain related models; this result adds the p40-specific fixed-point and the four concrete forbidden source positions.

## Decision and next discriminating step

The LP1 word **MOBIUS** makes projective diagonalization reasonable for a human solver, and the two independent p40 numbers specify a particular power and center. The resulting map unexpectedly coincides exactly with the manuscript's strongest six-back affine echo. This may narrow an intended key or marker construction, particularly one using a 28-cycle with a separate fixed rune; the earlier fixed-H multiplier-gate report already shows that **84** of 1,290 original pairs violate the most naive global nonzero-multiplier version, so that architecture cannot simply be asserted for all positions.

Only a **source-fixed, invertible forward/inverse mechanism** producing coherent unseen plaintext (or a separately visible instruction that predicts further original ciphertext structure) can promote this link to an authenticated solve. Repeatedly scanning arbitrary clocks, outer permutations or phases would not add such an instruction. The natural next question is whether an original artifact unambiguously selects *where* the 28-cycle acts, how the extra fixed-point symbol is represented, and how its state evolves across word boundaries.

**Reproduce:** [`sims/lp1_p40_cayley_t6_bridge_sft.cjs`](../sims/lp1_p40_cayley_t6_bridge_sft.cjs), Node.js 22 CommonJS, reads only the committed original-source annotations, GP tables and canonical whole-word parser. It verifies the exact projective identity on all 30 states, enumerates all 812 affine maps on the unchanged original ciphertext, and compares all three divisible red spans. Successful [manual GitHub Actions run 42923281274](https://github.com/FlareZ123/liber-primus/actions/runs/42923281274) verifies the updated dual-divisibility assertion as well as the exact source matrix identity and all original-cipher counts. No ciphertext was modified.
