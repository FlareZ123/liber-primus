# P15 Fibonacci-prime ordinals as a reversible 28-way Hill cipher: original-input decision

**Agent 13, 13 November 2026. Classification: independently source-motivated reversible candidate, bounded negative on unchanged original LP2 pp16–22. No unknown plaintext, historic encryption key, source-authenticated cipher, or destination has been recovered.** The original-scan/CommonJS test is [`lp2_p15_ordinal_hill28_rank_inverse_sft.cjs`](../sims/lp2_p15_ordinal_hill28_rank_inverse_sft.cjs), [successful GitHub Actions 43484491050](https://github.com/FlareZ123/liber-primus/actions/runs/43484491050).

## The clue and a new algebraic fit

The original physical p15 (scan 32.jpg) prints a 4×4 numeric spiral with center 3299. The existing [published numerical reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md) shows that clockwise entries are `abs(3301−prime(F_n+1))`, for the sixteen distinct Fibonacci terms
`0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987`.
The original GP29 text has only **86 identical adjacent runes among 12,901 within-page successors**. Every *unequal* pair therefore encodes one of exactly 28 nonzero differences in GF29. A returning puzzle solver could combine the p15 4×4 matrix with a four-at-a-time, **28-ary differential** register. This is a specific new family beyond the earlier printed-number Hill4 **mod29** tests: 28 is the count of available nonzero predecessor steps, not the rune-alphabet size.

Write each of the sixteen **one-based prime ordinal indices** `F_n+1` back into the same original p15 square cells, then reduce modulo28. The exact matrix and a two-sided inverse over the nonfield ring Z/28Z are:

\[
A=\begin{pmatrix}
14&22&7&0\\
9&1&2&6\\
6&4&3&5\\
8&23&14&10
\end{pmatrix},\qquad
A^{-1}=\begin{pmatrix}
12&1&4&17\\
8&0&14&7\\
19&18&0&20\\
7&16&1&18
\end{pmatrix}.
\]

The ordinal matrix's integer determinant is **915**, or **19 modulo28**, coprime to28. A meaningful **same-layout selector** compares the four independently source-constrained numeric choices without any language scoring:

| Original p15 cell interpretation, unchanged 4×4 layout | Determinant modulo28 | Invertible? |
| --- | ---: | --- |
| **Fibonacci-selected prime ordinals** `F_n+1` | **19** | **Yes** |
| Fibonacci terms `F_n` | 21 | No; shares factor7 with28 |
| Actual selected primes | 24 | No; shares factor4 with28 |
| Original printed prime distances `abs(3301−prime)` | 24 | No; shares factor4 with28 |

The SFT **generates the first 988 primes**, verifies every printed numeric cell, checks all sixteen exact matrix coordinates, computes all four modular determinants directly and asserts both `AA⁻¹ = A⁻¹A = I mod28`. This uniquely selects ordinal values *within these four natural candidate matrices* as a reversible 28-way linear mixing register. These comparisons were selected after observing the no-doublet property; the structural fit is conditional and does not prove the author intended an ordinal matrix or a 28-way Hill cipher.

## Complete nonzero-step cipher and finite original inverse

For original rune ordinals `C_i` in GF29, at every nonrepeated within-source-run pair compute `D=(C_i−C_(i−1)) mod29`. It is in `1..28`. Two ordinary and fully invertible readouts give a digit `r∈0..27`:

- **Cyclic:** `r=D−1`.
- **Finite-field discrete log:** `r=log_15(D)`, using the independently known primitive generator 15 modulo29.

Group four successive nonzero ranks, map each block through the inverse matrix `A⁻¹`, interpret its four coordinates as GP plaintext indices 0..27. For this model an original equal-adjacent rune is a **transparent GP-EA/28 marker**, which bypasses the four-rank register. The first ciphertext rune of a unit acts as its IV and each final 1–3 unfilled ranks remains unassigned rather than silently padded.

The candidate's weakest unverified assumptions are that the **prime ordinals**, rather than the displayed prime differences or actual primes, are meant to be the matrix; that LP2 actually operates on nonzero predecessor differences; that repeated runes represent GP-EA; and that native GP prose is the direct output without an outer layer. Neither p15 art nor the original 2016 signed directions specifies this chain. The original 4×4 square being source-derived makes it affordable to test without new secret parameters, not historically verified.

Use the untouched **1,744 GP29 runes of physical pp16–22**, immediately following p15, in 16 source-fixed cases: cyclic or field-log rank; printed or transposed matrix; forward or inverse matrix; physical-page IVs (7) or one chapter IV (1). There are **10 repeated predecessor pairs** within the seven physical pages. The page-IV reading yields **1,716 complete four-block output symbols**, ten bypass markers, 11 unused tail symbols and seven IVs. The chapter-IV reading yields **1,732 complete four-block output symbols**, ten bypass markers, one trailing digit and one IV. No hidden phase, plaintext crib, key, alternate alphabet, language-optimized rotation, word-boundary reset or checksum is fitted.

The strongest of all sixteen **original** GP28 monogram coincidence indices is only **0.03592258082** (field-log ranks, transpose of the forward ordinal matrix, page-IV), almost the 28-way uniform value **1/28 = 0.03571428571**. Its first thirty output GP names are:
`R.F.X.EO.I.O.J.NG.X.D.AE.OE.G.F.B.W.H.J.T.M.U.N.OE.H.AE.C.L.AE.J.NG`.
No continuous GP-English results. Even this top value is *selected after sixteen tests*, and the source-print-order inverse itself scores lower. The independently solved literal p57 **95-rune GP28** control has IoC **0.06270996641**; that length mismatch is acknowledged, and the observed original output is judged as no convincing language, not a universal impossibility theorem.

An independent GP-native **92-symbol plaintext plant** from the genuine solved p57 is enciphered under the exact forward 4×4 source matrix and both 28-rank-to-GF29 step transports. The encoder deliberately inserts repeated-cipher-rune GP-EA bypasses. The complete inverse identifies all bypass positions, recovers **92/92 exact source plaintext runes** in each transport, and re-enciphers every emitted cipher rune. Thus the negative original result cannot be dismissed as a noninvertible modulo28 matrix or a broken step decoder.

## Research decision

**The direct p15 source-prime-ordinal Hill4 mixed with a lossless 28-way ciphertext-difference decoder fails to decrypt its immediately following original chapter.** This is a bounded, reusable cipher-architecture decision that existing printed-matrix GP29 tests did not establish. The source-specific invertibility is useful mathematical information, but it does **not** establish authorial intent and does not by itself merit promotion to the authoritative solved-state synthesis.

Do not add a fitted phase, private 28-way permutation or another cipher layer solely to rescue this family: each would sever the link from visible original clues to independently recoverable plaintext. Reconsider only if an original Cicada instruction independently specifies the 28-step transport, source matrix consumer or a demonstrably verified output intermediate. The next higher-value path still requires authentic key material, an original plaintext island or a source-selected operation beyond straight block mixing.
