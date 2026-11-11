# Original LP2 grid: radix-60 versus omitted-f radix-59 via the p39 red-root identity

**Classification (11 November 2026): exact source arithmetic and a conditional encoding discriminator.** The independently printed p39 three-rune inscription supplies a double-root equation, which the 256 printed grid values satisfy under original base 60 but fail under the proposed compressed base 59. This selects a natural grid interpretation **conditional on the cross-page polynomial relationship being intended**. It does not yield a cryptographic key, unknown plaintext or complete cipher.

## Source-defined route and the competing inputs

The red p39 inscription consists of exactly three GP symbols with zero-based indices **[27, 5, 15]**, representing the polynomial

\[
R(X)=27+5X+15X^2=15(X-24)^2\pmod{29}.
\]

The first oversized red letter on physical p54 is `A`, GP index **24**, an independently visible marker. Neither the zero at 24 nor the twofold multiplicity needs to be chosen from an inspection of the numerical grid.

The 32×8 table on original pp49–51 contains exactly **256** two-glyph digit pairs in the 60-symbol ordered alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. The glyph `f` is unused in this particular table, motivating a rival **59-glyph** compressed alphabet. Both readings start from the same published 256 original glyph pairs. The canonical base-60 interpretation occupies the byte range **0–255**; compressed base 59 occupies **0–251**.

Let `H_i` and `L_i` be the first and second digit ordinal of the ith printed cell. Use the **first printed cell as the leading coefficient**, with original row-major order, and define

\[
P_b(X)=\sum_{i=0}^{255}(b H_i+L_i)X^{255-i}\pmod{29}.
\]

This defines the naturally byte-valued polynomial when `b=60`. The omitted-`f` compressed base-59 convention changes digit ordinals for all later alphabet letters; it is evaluated separately rather than conflated with changing the radix alone.

## Exact computed discriminator

| Original-source reading | \(P(24)\) | \(P'(24)\) | Double root at 24? |
|---|---:|---:|---|
| **Base 60; full 60-character ordinals** | **0** | **0** | **Yes** |
| Base 59; compressed alphabet omitting `f` | 20 | 12 | No |
| Base 59; unchanged 60-character digit ordinals | 20 | 5 | No |

The last row permits a useful **closed-form uniqueness check**. Because each printed token has two digits, holding digit ordinals fixed makes both polynomial evaluations linear in the radix. Exact Horner evaluation gives

\[
P_b(24)=9(b-60),\qquad P'_b(24)=24(b-60)\pmod{29}.
\]

Both equations vanish **if and only if** `b=60 mod29`. Thus among the two historically plausible choices **59 and 60**, only 60 preserves the source-marked factor. The direct test checks all 29 radix residue classes, the original-byte SHA-256, the p39 inscription against the canonical GP corpus, and the source marker on p54.

## What the selector establishes

This conditional finding materially narrows the unresolved radix fork: a solver who follows the *visible* red p39 quadratic and p54 oversized Ac into the row-major printed-number polynomial would choose **radix 60**, avoiding the 59-character omission fork. The 256-byte range reinforces the byte-table reading.

It remains an **if-premise**: earlier discovery of the shared factor was retrospective, and the mere occurrence of the factor does not prove an author intended polynomial division as the route to plaintext. Modulo-29 factorization on source tables is vulnerable to multiplicity and choice of orientation. The already tested quotient/direct-pad alternatives did not recover language. No decoding update, plaintext, final destination, or crypto mechanism follows from the radix result alone.

**Single-file reproducibility:** [`sims/lp2_grid_radix59_60_double_root_source_sft.cjs`](../sims/lp2_grid_radix59_60_double_root_source_sft.cjs). Inputs: [canonical grid](../resources/liber-primus/base60-grid.json), [original color annotations](../resources/liber-primus/lp2-ink-annotations.json) and [GP corpus](../resources/liber-primus/lp2-corpus.json). Pure Node.js 22 CommonJS, no writes or floating-point fitting.
