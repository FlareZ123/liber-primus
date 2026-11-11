# Nine p54 red runes as a complete 3×3 valid-convolution kernel

**Agent 5, 11 November 2026. Decision:** The original page-54 nine-rune red inscription gives a literal 3×3 GP29 kernel, but applying it to the printed 32×8 number table does **not** reproduce the independently deciphered final 180-runic pages. More strongly, **every arbitrary secret linear 3×3 kernel**, with or without a global constant term, fails on the original source under this exact framing. No unknown LP2 plaintext or intended key is recovered.

## Why a human might try this

The printed table has **32 rows × 8 columns**. A **3×3 valid convolution** removes one cell border and yields **30 × 6 = 180** internal positions. Independently, the final two manuscript pages have **85 + 95 = 180** runes, and the p55 page has **76** runes, precisely the printed table's border. The p54 heading immediately preceding p55 contains **nine red runes**:

```text
GP29 indices: [24,19,21,23,27,2,14,10,19]
```

The first is an oversized Ac24. Its nine entries can form one 3×3 numerical mask. This gives a plausible direct historical operation in the same visual setting as the solved PARABLE admonition to shed circumferences. Nothing in the original pages explicitly says “convolve,” and the arrangement may be coincidence.

## Frozen original-data inverse challenge

Using the unchanged 256 printed base60-derived bytes in source row-major order, form a 32×8 matrix `B` with coefficients reduced modulo29. For every inner position `(r,c)` with `1 ≤ r ≤ 30` and `1 ≤ c ≤ 6`, define

```text
Output[r−1,c−1] =
   sum(K[dr+1,dc+1] * B[r+dr,c+dc]) mod 29
   for dr,dc ∈ {−1,0,1}.
```

Two visually fixed kernel arrangements were checked: the nine red runes in row-major order, or oversized Ac24 in the middle with the remaining eight red runes placed clockwise around it. The target is the independently established complete p56 plaintext in GP orthography followed by the directly readable p57 plaintext, comprising **exactly 180 GP runes**.

The literal source output matched **6/180** known plaintext runes for row-major red9, or **3/180** for oversized-center clockwise. Those counts are compatible with wrong GP29 content. The direct outputs also fail to match the printed p56/p57 rune stream (respectively **5/180** and **3/180**).

## Exact all-secret linear exclusion

To avoid an overly narrow red-key rejection, retain the same original table and 180 output coordinates but grant the creator **nine arbitrary unknown GF29 convolution coefficients**, and separately a **tenth unrestricted affine constant**. This creates a finite linear system `A·k = y` over GF29. An arbitrary secret key can fit the known p56/p57 plaintext only if the coefficient matrix and its augmentation have the same rank.

| Model | Unknowns | Rank(A) | Rank([A|y]) | First inconsistent prefix |
| --- | ---: | ---: | ---: | ---: |
| Arbitrary 3×3 GF29 linear kernel | 9 | **9** | **10** | **10 known outputs** |
| Same kernel plus arbitrary constant | 10 | **10** | **11** | **11 known outputs** |

This rules out *every* kernel key in this frozen geometry. The inconsistency appears in the second interior table row, before any tuning to a language score or unexamined pages. A deterministic planted true kernel passes both exact systems with the expected ranks, including the optional-bias branch.

[Source-reading and all-secret algebraic reproducer](../sims/lp2_p54_red9_valid_convolution_original_gate.cjs) runs with Node.js and only the checked-in canonical source corpus, ink annotation and original 256-byte table. It uses the independently demonstrated p56 GP plaintext from the [authentic totient regression](../sims/authentic_lp2_p56_totient_regression.cjs) and p57 original plaintext.

## What changes in the solve-path choice

The **32×8 → border 76 + interior 180** geometry and the p54 nine red runes remain original facts, while neither a direct red9 kernel nor an arbitrary stationary linear 3×3 kernel produces the known solved-page content. Any model that rescues this route requires a different independently selected register, nonlinear rule, position-dependent kernel, traversal, or original-source operation. Those are new hypotheses requiring their own source clue. An unrestricted fit to the 180 solved runes would not determine a genuine key for the 76 unsolved border positions.

The experiment eliminates this tempting local-filter mechanism with a compact exact contradiction and leaves the broader LP2 problem unsolved.
