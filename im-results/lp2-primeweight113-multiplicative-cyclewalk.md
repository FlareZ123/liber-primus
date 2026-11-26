# GP prime-weight multiplicative first-return receiver in F113

**Decision (Agent 5, 26 November 2026): retire the specified prime-minus-one multiplicative first-return cipher. No unknown LP2 plaintext or key recovered.** This is an independent group action relative to the [additive first-return receiver](lp2-primeweight113-cyclewalk.md), not a repetition of its addition on field elements. The broader quadratic-character invariant supplies a finite historical-donor exclusion, but does not exclude arbitrary native-language plaintext.

## Frozen mechanism and source choices

The original GP chart supplies the first 29 primes, 2..109. The known p56 inverse supplies the consecutive-prime-minus-one clock, with literal-F transparency. The authenticated 2013 teaching DH example supplies generator 5 in modulus 23. Choose 113 as the next prime after the largest GP weight (as in the prior additive walk), and **conditionally** transfer generator 5 to its multiplicative group. It has exact order 112 in F113*. Neither source authenticates this cross-field transfer, F113 as the intended field, or first-return walking.

For ordinal j, let k=(prime[j]-1) mod112 and T_j(x)=5^k x mod113. For a GP weight x, repeatedly apply T_j until a member of the 29-weight set is encountered, including a return to x. Every orbit returns within 112 steps. This induces a bijection on the subset, with inverse the first return under T_j^{-1}; all 3,248 forward/inverse table entries were checked. A consuming rune advances j. Literal-F mode emits F without consuming j when the plaintext is F; otherwise it uses the induced permutation. Visible F can therefore have a consuming or non-consuming history.

Reuse the exact spacing-free Viterbi state (next consuming prime ordinal, last two physical F-hold flags) of Agent43's earlier additive receiver, changing the action and excluding the numeric WISDOM register from the native-prose model. Search all 3,301 origins independently in the nine established black-body chapter spans. The fixed interpolation weights are add-one unigram and bigram/trigram backoff10. Fit on the first physical page's body; freeze the state for all continuation pages. Also report the retrospective full-body optimum. No beam, language-score cutoff, or word-boundary assumption.

## Exact original inverse

| Start page | Body length | F-hold max legal prefix / surviving end ordinals | F-hold full best score | F-hold held score | Ordinary full best | Ordinary held score |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 716 | 716 / 2 | -5.0071 | none | -4.7910 | -5.0019 |
| 3 | 1129 | 404 / 0 | none | none | -4.8938 | -5.1241 |
| 8 | 1717 | 462 / 0 | none | none | -4.9198 | -5.0484 |
| 15 | 1883 | 354 / 0 | none | none | -4.9078 | -5.1905 |
| 23 | 1005 | 547 / 0 | none | none | -4.8950 | -5.0479 |
| 27 | 1414 | 508 / 0 | none | none | -4.8422 | -5.0840 |
| 33 | 1670 | 624 / 0 | none | none | -4.9093 | -5.1000 |
| 40 | 3000 | 353 / 0 | none | none | -4.9422 | -5.0726 |
| 54 | 299 | 299 / 6 | -4.8973 | -5.0922 | -4.6696 | -5.1925 |

Scores are mean natural-log probabilities per rune (higher is better). Seven chapter bodies have no legal literal-F history at any tested origin. The two full survivors are nonprose; p0's frozen prefix-selected path cannot continue. The ordinary receiver is always bijective, but all held continuations score below -5.0018 versus held native controls -2.70785..-2.03126.

Eight target-excluded native-prose sections, each planted in both modes at the frozen origin 1033+137j, recover all 16 origins, 2,807/2,816 fit runes, and **2,828/2,828 held runes**. The nine errors are on the F-hold p57 fit, illustrating real path ambiguity despite correct origin and complete heldout recovery. Every returned candidate round-trips the exact input. This is a planted-receiver calibration and inverse invariant, not key authentication. The authentic p56 and p57 controls reproduce 85/85 and 95/95 under their actual mechanisms.

## Generalized quadratic-character gate

For any j>0, prime[j] is odd, so k is even and 5^k is a quadratic residue. Every step and first-return therefore preserves the quadratic character of the GP weight. A literal-F hold also preserves it. Only the j=0 prime 2 can induce a different character, at most once per chapter in the frozen monotone clock. The original class tape must thus equal the candidate plaintext class tape up to at most one flipped bit per chapter. This necessary condition extends to **arbitrary** position-varying quadratic-residue multipliers, even if the actual key and clock are unknown (allowing one exceptional odd multiplier per body). It is independent of printed boundaries.

Class 0 (residue) GP indices: 0,3,4,5,10,12,15,17,22,24,28. Class 1 contains the other 18. Original bodies contain 7,909/12,833 nonresidue-class runes; the eight native sections contain 1,654/2,822. Compare exact contiguous windows in three pinned modern-English GP encodings (Gibran 62,492 runes; Shakespeare 217,106; Emerson 321,327), plus native sections wherever long enough. At most one mismatched bit means at least one of two nonoverlapping halves matches exactly. Enumerate every exact occurrence of each half and verify full Hamming distance; this is exhaustive without materializing the complete Cartesian product. All three 300-bit controls with one deliberately flipped bit recover the true offset uniquely.

**Zero of 5,369,853 literary windows and zero of 1,282 authentic-section windows** match any of the nine original body masks with Hamming distance <=1. This rules out the tested exact donor transfers under arbitrary class-preserving maps, not novel prose.

To check whether the mask itself resembles native language, train a fixed order-five binary Markov model (Laplace1) on the eight authentic sections, then score every matching-length held literary window and each original body. Grant the original an exact best single-bit repair, scoring only the six affected conditional terms. The result is **not a language rejection**: all original scores lie within the held literary ranges, and several are at their high-probability edge. For example p40 repaired score -0.684407 lies inside all three held ranges. No claim that a high binary score authenticates plaintext is warranted; the class imbalance alone can generate high scores. No justified original key, class-to-rune inverse, or additional source-selected layer follows.

For unrestricted class-preserving multipliers the bit constraint is also sufficient for per-position reachability: for any two weights x,y in the same class, choose multiplier y/x, so the first step directly reaches y. Thus arbitrary secret multipliers do not identify a unique plaintext. The experiment retires the fixed generator/clock mechanism and tested exact donor transfers. Do not expand the field, generator, or exponent menu absent independent source evidence.

## Reproduction and files

- [Exact inverse SFT](../sims/lp2_primeweight113_multiplicative_cyclewalk_sft.cjs) and [full original/control output](lp2-primeweight113-multiplicative-cyclewalk-output.json).
- [Quadratic-character SFT](../sims/lp2_gpprime113_quadratic_character_gate_sft.cjs) and [held donor raw output](lp2-gpprime113-quadratic-character-output.json).
- Pinned corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native prose blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. Donor blob IDs preserved in raw output.
- The exact experiment cores were executed in connected V8. The standalone Node filesystem wrappers were saved but not separately executed. No CI launched. Local Git DNS unavailable; connector commits and readbacks used. A parallel Contents write conflicted; the raw output succeeded and the inverse SFT was then committed sequentially and verified.
