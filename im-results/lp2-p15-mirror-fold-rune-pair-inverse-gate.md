# Original p15-symmetric page-pair arithmetic gate

**Evidence class:** bounded, source-motivated original-cipher inverse test; negative for direct GP29 pairing. **No unknown LP2 plaintext, authentic key or recovered destination.**

## Source-triggered hypothesis and missing premise

The original five-dot ornaments on physical p7 and p23 match under a fixed vertical mirror at native image coordinates `(x,y) → (x,3674−y)`. Their page indices satisfy `7+23=2×15`, around the authentic p15 Fibonacci-prime 4×4 diagram. This could invite a contemporary solver to fold the sixteen leaves p7–14/p16–23 and combine corresponding rune streams.

The specific, **unselected** cipher premise tested here is that paired source-order GP29 rune indices should be combined by a direct residue operation. With the mirrored right-hand page read backward, the simplest such candidate is `(A−reverse(B)) mod 29`. A parallel `+` diagnostic and two forward-reading controls bound that proposal without fitting keys, offsets, phase, or source order. The source mirror supports which *pages* to compare; it does not independently prescribe a rune alignment or modulo-29 addition/subtraction.

## Exact original contract and result

Use the pinned `resources/liber-primus/lp2-corpus.json`, physical page pairs `(7,23),(8,22),(9,21),(10,20),(11,19),(12,18),(13,17),(14,16)`. Retain each printed page's rune order. For each pair, combine corresponding rune positions up to the **shorter** page's length. Reversing a page means reversing its entire page-local rune sequence, with no fitted phase or word-boundary repair.

The eight pairwise comparison lengths are `[208,131,268,263,271,260,272,137]`, totaling **1,810 output runes**. Because both sides originally contain **3,894** runes together, a further **274 input runes** lack a partner. Even a favorable 1,810-rune result would therefore require a source-selected rule for those leftover symbols before claiming a complete lossless inverse.

| Fixed operator on paired original runes | Output GP29 IoC | All `8!` assignment tail `Pr(IoC≥observed)` |
| --- | ---: | ---: |
| `(A−reverse(B)) mod29` (primary) | 0.034508244535 | 18,461/40,320 = 0.457862 |
| `(A+reverse(B)) mod29` | 0.034335382633 | 32,696/40,320 = 0.810913 |
| `(A−B) mod29` | 0.034261473480 | 37,812/40,320 = 0.937798 |
| `(A+B) mod29` | 0.034259641021 | 39,064/40,320 = 0.968849 |

The exact enumeration fixes each of the four operators and compares the p15-symmetric partner assignment with all **40,320** bijections between the eight left and eight right pages. Every candidate's output remains near uniform-GP29 coincidence `1/29≈0.03448`; the source-selected matching is unexceptional among alternative partners. The 100-rune original primary output begins with `G OE EO W B Y NG X IA Y D...` in canonical GP transliteration, and shows no direct readable passage. A planted mirrored-pad control recovers a known synthetic 208-rune string exactly. That test validates the implementation, not a historical key.

## Decision and independently reproducible computation

**Reject direct page-local GP29 residue addition/subtraction at fixed start/end alignment as the decrypting operation selected by the p7/p23 mirror.** The source-only mirror correspondence remains authentic, but it supplies no rune-to-rune match over the 274 unmatched symbols and no author-selected algebra. This does not reject a separately instructed fold or image-space extraction; those would require new source evidence establishing the alignment and a genuine lossless readout before further calculation.

One dependency-free CommonJS SFT, [`sims/lp2_p15_fold_rune_pair_inverse_sft.cjs`](../sims/lp2_p15_fold_rune_pair_inverse_sft.cjs), recomputes all four original outputs, asserts their numerical results, enumerates every assignment, and checks a planted inverse. It uses the committed source corpus, no network, no randomness and no additional libraries. Related but distinct prior work is [the p7/p23 geometric source test and 16-page image-mirror gate](lp2-p7-p23-five-dot-mirror-page15-gate.md), which found the native five-dot reflection but did not identify a manuscript-wide cipher operation.

**Next research decision:** pursue an independent source object selecting a key/state and reversible transformation; do not enlarge this failed fold into a tuned orientation, offset, page-order or alphabet sweep merely because its original visual trigger is striking.
