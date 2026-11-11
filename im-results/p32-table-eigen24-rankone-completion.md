# A source-bounded rank-one completion of the p32/table eigenvalue-24 channel

**Status:** one new, completely specified original-LP2 inverse test, negative. The matrix construction is exact, and native positive controls pass. **No unknown plaintext, historical cipher, authentically selected key, or final destination has been recovered.** This experiment narrows one algebraically motivated completion only. The interpretation is conjectural.

## Why this particular operation was worth one test

The signed 2016 Cicada tree image matches the original tree on physical LP2 p32. The image's pixel dimensions **563×569** equal the sums of the Gematria Primus prime weights in the first row and column of p32's 121-rune, row-major **11×11** square. This independently selects the page, grid geometry and orientation. The ordinal-valued matrix over GF(29), denoted \(A\), has a simple eigenvalue **24**; its prime-weight-valued counterpart does not.

Independently, the original printed 256-byte table has a polynomial \(P(X)\) with a double factor \((X-24)^2\) over GF(29), the p39 red triple reads \(15(X-24)^2\), and p54 visibly starts with an oversized red **Ac**, whose GP ordinal is **24**. The original 2014 magic squares also contain 24-eigenmodes. These are exact data relations, documented in [the tree/p32 study](lp2-tree121-signed2016-source-gate.md), [the grid factorization](lp2-grid-complete-gf29-factorization.md), and [the p32 Hill gate](p32-tree-11x11-hill-original-gate.md).

A possible mathematical reading is to evaluate the 256-byte table polynomial *at* the p32 matrix, then repair its missing eigen-direction using the highlighted rune24. This is one finite, reversible candidate distinct from the previously rejected raw p32 11×11 Hill matrices and direct eigenvector-additive pads. No original puzzle text expressly instructs polynomial functional calculus or spectral repair; these are hypotheses, not source-authenticated cipher instructions.

## Exact matrix operator and reversible completion

Read the original 32×8 table in printed row-major order as the descending coefficients of

\[
P(X)=\sum_{i=0}^{255}(b_i\bmod29)X^{255-i}
\]

and evaluate \(P(A)\) by Horner's rule over GF(29). The original 11×11 ordinal matrix has the following right and left 24-eigenvectors, each normalized to last coordinate one:

\[
v=(13,3,26,3,2,8,12,3,26,21,1)^T,
\quad
w=(2,23,27,4,26,9,20,22,2,9,1)^T.
\]

Exact original-source algebra gives \(w^Tv=2\), \(\operatorname{rank}P(A)=10\), \(P(A)v=0\). Its unique rank-one 24-eigenspace projector is

\[
\Pi=vw^T/2,\qquad \Pi^2=\Pi.
\]

Choose the original prominent rune value24 as the completion coefficient, yielding the **frozen** candidate

\[
T=P(A)+24\Pi \pmod{29}.
\]

The single zero direction of \(P(A)\) is thereby filled. The resulting 11×11 \(T\) is invertible over GF(29), as verified both by an explicit Gauss-Jordan inverse and both matrix products \(TT^{-1}=T^{-1}T=I_{11}\).

Without that completion, a direct block inverse of \(P(A)\) cannot exist: rank10 means every nonempty solution fibre has 29 distinct 11-rune inputs. Recovering the missing scalar independently for every block would require further specified state/material. The single oversized p54 rune is a **constant**, not a supplied scalar per block.

## Frozen original-cipher outcome

Apply the same unmodified 11×11 \(T\) and \(T^{-1}\) to full 11-rune packets in original printed order. Two source-natural clocks were declared: book-continuous and reset on each physical rune-bearing page. The test includes forward/reverse operation only as direction controls. Incomplete final page/book packets are discarded for scoring, then accounted for exactly by the reported lengths.

| Clock | Operator | Original runes transformed | Decoded index of coincidence |
| --- | --- | ---: | ---: |
| Entire original book | \(T^{-1}\) | 12,947 | **0.03447973151208117** |
| Entire original book | \(T\) | 12,947 | **0.03452166171866762** |
| Physical-page reset | \(T^{-1}\) | 12,606 | **0.034495791436339004** |
| Physical-page reset | \(T\) | 12,606 | **0.03447616886312991** |

The unchanged original stream has IoC **0.0344783978645**. Solved p57 has IoC **0.0627099664**. None of the four transformations approaches source-native ordinary English-like GP29 frequencies or yields readable runic language. Each transformation exactly reverses on every tested original packet. As usual, that identity checks correct implementation and cannot authenticate a key.

For an independent native positive control, **88 original solved p57 rune indices** are encrypted by \(T\) then decrypted by \(T^{-1}\) with all **88/88** recovered. This is an exact implementation control and should not be mistaken for decryption of unknown pages.

[Single-file Node.js 22 CommonJS reproducer](../sims/p32_table_eigen24_rankone_completion_sft.cjs) reads the canonical original p32 indices, original table bytes, and untouched 55 rune-bearing unknown pages; it checks source eigenvectors, projector idempotence, rank, inverse, controls, round trips, four output counts and all four IoCs.

## Decision and remaining uncertainty

**Retire the proposed \(P(A)+24\Pi\) native-GP29 block decoder** under the two naturally fixed clock conventions. The original eigen24/common-root relation remains exact but does not select a cipher without an authenticated instruction that fixes the left/right eigen-direction, scalar normalization, target register and how page/word boundaries advance cipher state. More free scalar repairs, phase sweeps and alternative eigenvector pads would be post-selected model hunting rather than an intended human route.

The p32 prime-weight checksums are strong source evidence for a row-major 11×11 *picture/map*. They do not by themselves instruct solvers to use matrix eigenvectors for decryption, which is the principal missing premise of Director Issue #101. Preserve the structural relationship for a genuinely independent future instruction, without treating this negative experiment as proof that the source matrix is irrelevant to every more complex cipher.
