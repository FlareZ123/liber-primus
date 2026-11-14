# Fibonacci-selected pages: GP29 checksum coincidences and a direct polynomial inverse

**Agent33, 14 November 2026. Status: exploratory source-conditioned arithmetic observation and a bounded negative for a literal GF29 checksum/quotient reading. No unknown original plaintext, authenticated key, cipher mechanism, or destination recovered.** The exact [CJS reproducer](../sims/lp2_fibonacci_gp29_fivepage_checksum_sft.cjs) uses only original rune indices.

## Original clue and narrow, motivated question

The original p15 square encodes primes at Fibonacci indices. A separate exploratory interpretation of the signed 2016 material singles out physical LP2 pages p13, p21, p34 and p55 as successive Fibonacci-indexed steps; p8 is the preceding page in that series. This route is documented at [signed2016-fibonacci-page-route.md](signed2016-fibonacci-page-route.md) and remains a *hypothesis about intended page selection*. GP29 additive arithmetic is authentic in solved Cicada stages; asking whether these pages share short additive checksums is a legitimate low-cost operation before inventing secret keys.

For each untouched physical page, sum its original zero-based GP rune ordinals (0–28) modulo 29, with no changed boundaries or rune substitutions. The five source-selected page totals are:

| Physical page | Original GP runes | Full ordinal sum | Sum modulo 29 |
| ---: | ---: | ---: | ---: |
| p8 | 255 | 3,520 | **11** |
| p13 | 272 | 3,867 | **10** |
| p21 | 273 | 3,838 | **10** |
| p34 | 261 | 3,626 | **1** |
| p55 | 76 | 1,016 | **1** |

Thus p13 and p21 have identical residues, p34 and p55 likewise, and the earlier p8 residue is **10+1 = 11 mod29**. The p13/p21 *full* ordinal sums differ by exactly 29. These are original-source equalities, with no fitted variable values. They are **not** independently predicted by the signed message or the numerical square. The relation was noticed retrospectively after considering the five pages, so ordinary conditional probabilities do not establish intentional design.

## Exact finite contextual check

A chapter-constrained *alternative page-allocation diagnostic* makes the coincidence interpretable at its fixed original-page positions without inventing random runes. Select two different pages for the p8 and p13 slots from original pp8–14 (seven times six choices), one for the p21 slot from pp15–22 (eight), one for p34 from pp33–39 (seven), and one for p55 from pp54–55 (two). Keep every source page's checksum unchanged. Exactly **4,704** ordered allocations result.

- **18/4,704** satisfy *both* pairwise checksum equalities.
- **2/4,704** also satisfy the preceding-page additive equality. The two assignments are **[8,11,21,34,55]** and the actual **[8,13,21,34,55]**.

The **2/4,704 = 0.00042517** conditional fraction pertains strictly to this identified five-page, three-equation relation. It does not correct for the extensive prior searches over arbitrary page selections, modular operations, weights and relationships. p11 sharing the same total as p13 supplies a real alternative, reducing any temptation to treat p13 as uniquely selected by the checksum alone. GP prime-weight sums, the other historically meaningful representation, do *not* show the same pair equality for these selected pages.

## Direct reversible operation implied by equal checksums

View GP29 rune sequences as polynomial coefficients over GF(29) in their displayed order. For p13 and p21, pad the shorter list with one zero at the start or end, and subtract coefficientwise. Do the same for p34 and p55, padding the shorter to 261 coefficients. Equal GP29 sums imply the difference polynomial is divisible by **X−1**. Synthetic division is exact; it reduces each pair's difference by one rune and forward multiplication recovers every original difference coefficient.

| Pair | Alignment | Quotient GP runes | Remainder at X=1 | Quotient IoC |
| --- | --- | ---: | ---: | ---: |
| p13−p21 | start | 272 | 0 | 0.03489255 |
| p13−p21 | end | 272 | 0 | 0.03456696 |
| p34−p55 | start | 260 | 0 | 0.03365013 |
| p34−p55 | end | 260 | 0 | 0.03525394 |

All four quotients remain near the 29-way random baseline **1/29 = 0.03448276**. Each first-80-rune transliteration in the reproducer is nonlinguistic. Neither direct polynomial quotient is a native-GP plaintext recovery. **The zero remainder is already mathematically forced by the selected equal sums** and supplies no independent confirmation. The original red p39 quadratic has root 24, not root 1; neither pairwise difference has that additional root in either alignment. The exact single-file reproducer asserts an original solved-p57 **95/95-rune** constructed quotient/multiplication positive.

## Decision

The selected pages exhibit a bounded, previously unindexed checksum coincidence; direct GF29 pair-subtraction and X−1 division produce no readable original register. No original page says to interpret its complete rune stream as polynomial coefficients or to apply that divisor. Therefore **do not promote the checksum to a decipherment method, and do not chase more fitted interpolation degrees or roots**. Reopen only if an independently authenticated source instruction connects this Fibonacci route to pagewise checksums, secret-sharing, or a defined reversible consumer that can predict withheld original runes.
