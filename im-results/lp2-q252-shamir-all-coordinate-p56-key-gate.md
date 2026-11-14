# Original Q252 three-share to authentic p56 key: all GF29 coordinates fail

**Decision, 14 November 2026:** the original 256-cell table's source-factor quotient Q252 does **not** encode the independently authenticated p56 prime-totient key as a fourth evaluation of one common quadratic Shamir sharing rule, under either natural three-share layout or either full coefficient orientation. The result is stronger than a simple no-exact-key negative: **even an unrestricted secret stationary output function** over the 29 possible predicted residues cannot fit all 84 known key positions. This rejects this finite direct handoff, not arbitrary secret-sharing systems or every possible use of the table. No unknown-page plaintext or key was recovered.

## Source-to-key proposal and its falsifiable prediction

The original LP2 physical pp49–51 contain 256 two-character numeral cells. With the existing conditional base60 normalization, their exact byte stream has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The *independent, prior-source* operands are the 2013 signed BASE29 `3301 = 3QO` digits `H=[3,26,24]` and the original p39 red triad `G=[27,5,15]`, both interpreted as ascending GF29 polynomial coefficients. Their product divides the 256 original table residue slots exactly. Descending long division leaves a **252-slot quotient, including its first zero**. The required zero remainder is checked against the unchanged table.

An exact potential next step is to read those 252 slots as **three shares at each of 84 positions**, and evaluate the unique degree-at-most-two polynomial through share coordinates `x=1,2,3` at a fourth fixed coordinate. The 84 count is independently fixed: original solved p56 has 85 ciphertext runes with one literal plaintext-F bypass at local offset 56, and therefore consumes **84 consecutive-prime totient residues** from prime 2 through prime **433**. This is the authentic key against which the hypothetical fourth share can be compared. The test never uses unknown p0–55 plaintext for parameter selection.

This premise is **not** an author-specified decoder. An original source demonstrates a BASE29 operation; no surviving instruction specifies that the Q252 quotient is a Shamir share bundle or that the points are at 1,2,3. The alignment `252=3×84` is suggestive but post-noticed. The purpose of the test is to reject this *complete, cheap, recognizable* handoff before anyone optimizes it.

## Finite exhaustive test

Keep both natural 84-position layouts: three consecutive blocks of 84 coefficients, or 84 adjacent triples. Also allow the coefficient stream in printed division order or completely reversed. For each of those four source layouts, evaluate the same quadratic at **all 29 field coordinates** `x=0..28`, including the original three share coordinates: **116 complete predicted 84-symbol keys**. No free offset, cyclic phase, prime skip, per-position evaluation point or secret coefficients are fitted.

For each predicted key `S[i]`, compare it against the true p56 key `K[i]=(prime[i]-1) mod29` in two ways:

1. Literal rune-residue equality, requiring all 84 matches for an authentic direct-key handoff.
2. A stronger key-independent constraint allowing *any* fixed output function `f: GF29→GF29`, with no injectivity requirement. The tight maximum over all such functions is `sum over v of max_w count(S[i]=v and K[i]=w)`. An arbitrary secret 29! alphabet permutation is a subset of this much larger family. If even one predicted symbol v requires distinct key values at different positions, a deterministic f cannot fit.

| Verified original-input outcome | Result |
| --- | ---: |
| Source table cells / GF29 quotient slots | 256 / 252 |
| Quotient remainder by H×G | `[0,0,0,0]` |
| Independently solved key positions | 84 |
| Original-input complete candidate models | **116** |
| Largest direct coordinate/key equality count | **8 / 84** |
| Largest count even with arbitrary fixed f | **36 / 84** |
| Fewest conflicting input-symbol groups in any model | **17** |
| Complete matches under literal or any fixed secret f | **0 / 116** |

The best unrestricted-function upper bound is 36/84, attained by two variants: forward adjacent triples evaluated at `x=3`, and reversed adjacent triples at `x=22`. Both have many contradictory repeated-symbol constraints. Across the 116 direct comparisons, the maximum exact equality count is eight, consistent with an unrelated 29-symbol stream. No significance estimate is needed to reject these deterministic *exact-recovery* contracts, because the original key is already known.

## Controls, conclusion and next decision

The standalone CommonJS source test `sims/lp2_q252_shamir_allx_p56_key_sft.cjs` asserts the original 256-byte SHA-256, both historical polynomial factors, exact zero remainder, 252-coefficient quotient, 84th prime 433 and the full established p56 GP transliteration. It independently reconstructs all 85 original p56 ciphertext symbols from the known plaintext/totient key with the one F bypass. A separately constructed 84-position quadratic three-share positive control uses a hidden full-field bijection `f(v)=7v+3 mod29`; evaluation at `x=4` recovers **84/84** source-native planted key positions, with **zero** contradictory output-function groups. Thus the exclusion criterion recognizes a genuine complete secret-alphabet fourth share when one exists.

**Inference:** the source-constrained three-share geometry does not provide the p56 known key under any fixed GF29 evaluation coordinate or fixed output-symbol relabeling in the four natural layouts. A future proposal would need a newly sourced different share-placement rule, nonstationary state, or independently authenticated next operation. Do not merely search more x values, symbol permutations, or prime phases in this rejected family.

**Reproducer:** [original-source single-file test](../sims/lp2_q252_shamir_allx_p56_key_sft.cjs). Related, distinct narrower tests: [dual-factor source study](2013-base29-gf29-grid-factor.md) and earlier direct x=0/3-share p56 comparisons in the [#41 discussion](https://github.com/FlareZ123/liber-primus/issues/41). Both the original share rule and this all-coordinate extension remain exploratory hypotheses about the creator's design, not established evidence of the historical encryption mechanism.
