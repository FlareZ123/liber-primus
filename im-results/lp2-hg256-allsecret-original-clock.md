# Original LP2 H/G 256-block code: secret-alphabet hypothesis is algebraically impossible

**Agent 29, 11 November 2026. Evidence class:** exact source-constrained negative for a specified shared-substitution architecture. This analysis recovers **no unknown plaintext, cipher key, or destination**.

## Motivation and frozen model

The original p50 32×8 byte table is an exact codeword of the independently source-linked GF(29) generator

\[
F(X)=H(X)G(X)=X^4+28X^3+13X^2+9X+14.
\]

Here H comes from the signed 2013 BASE29/3301 artifact; G comes from the original marked p39 triad. The table is 256 cells, and the code is the established [256,252,3] linear code over GF(29), as reproduced by [the code-theoretic SFT](../sims/lp2_grid_hg_code_structure_sft.cjs). That specific 256-symbol source-native code makes one previously untested original-cipher family worth an inexpensive exact decision:

> Split the 12,956 original GP29 ciphertext runes into consecutive length-256 blocks. There is one unknown, global, arbitrary 29-symbol bijection f. Applying f to every rune turns **each** 256-rune block into a codeword of F. Allow any of the 256 starting phases so an unmarked book offset cannot save the hypothesis.

A substitution may be any of 29! alphabet permutations; no additive, affine, sorted-alphabet, English, or source-key assumption is made. This model does require every eight consecutive original blocks to share the *same* f and the p50 polynomial to apply directly to that block representation. Neither requirement is already authenticated as an intended LP2 cipher instruction.

## An exact rejection without key search

The four components of \(\operatorname{rem}(A(X),F)\) are four *linear* equations in the 29 unknown values \(f(0),\ldots,f(28)\) when each block's original 256 ciphertext symbols are fixed. Construct their 4×29 coefficient matrix by adding the coefficient vector \(\operatorname{rem}(X^{255-i},F)\) into the column of the rune seen at original position i. Eight blocks supply 32 equations. If this matrix has rank 29 over GF(29), the only solution is the all-zero function, which is never a permutation. This rejects **every** bijection simultaneously.

Applied to the **unchanged** original 12,956-rune stream, at *all 256 starting phases*, the prefix rank progresses:

| Number of 256-rune blocks | Distribution of GF29 matrix ranks across 256 phases |
|---:|---|
| 1 | rank 4: 256 |
| 2 | rank 8: 256 |
| 3 | rank 12: 256 |
| 4 | rank 16: 256 |
| 5 | rank 20: 256 |
| 6 | rank 24: 256 |
| 7 | rank 27: 1; rank 28: 255 |
| **8** | **rank 29: all 256** |

The initial eight original blocks alone suffice to make the model impossible for *every* tested phase. No original 256-rune block in this 256-phase × eight-block gate already has a zero H/G syndrome even before relabeling. The remaining original runes need no language scoring or tuning to decide this family.

A positive-control plant constructs eight independent valid codewords by taking 252 pseudo-random GP29 symbols per block and solving the final four parity symbols from the **same authentic generator**. Each codeword is then disguised by the inverse of the bijection \(f(c)=5c+11\bmod 29\). All eight planted codewords satisfy the true mapping exactly, and their original-symbol coefficient matrix has rank **28**, hence a surviving nonzero null vector as required. The original matrix's rank29 verdict is therefore a genuine distinguishing observation, rather than an inevitable artifact of the linear constraints.

## Decision

**Retire this direct 256-rune H/G codeword architecture under one arbitrary fixed substitution key**, including every 256-rune phase. Searching different GP29 alphabets, 29! permutations or additive keys within this identical family cannot fix its algebraic contradiction.

What remains open is a changing substitution per codeword, a nonlinear or stateful transform before applying H/G, an independently marked clock with gaps or interleaving, and the possibility that the p50 code protects **only its own table** rather than the GP29 manuscript. No original image currently specifies a direct link between the table parity and consecutive ciphertext blocks, so the model is an exploratory source-constrained hypothesis.

**Exact standalone reproducer:** [sims/lp2_hg256_allsecret_substitution_sft.cjs](../sims/lp2_hg256_allsecret_substitution_sft.cjs). It reads the canonical original corpus and p50 table, asserts their unchanged original dimensions and source checksum, computes rank over GF(29), tests all 256 phases without optimizing any model on original English-like output, and performs the eight-block secret-alphabet positive control.
