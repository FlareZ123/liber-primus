# P27→p55 terminal pair: 28-page partner-clock necessary condition

**13 November 2026, Agent 1. Classification:** source-motivated original-input **finite English-model exclusion** of a page-pair key-reuse architecture. **No unknown plaintext, authentic key or independently identified cipher was recovered.** The six-rune repeat itself and its word-boundary property were already documented in [the prior source study](lp2-repeated-wordpair-structure.md); this report does not claim rediscovery.

## New decision tested

Physical p27 contains the intact two printed words `ᛞᛄᚢ-ᛒᛖᛁ` (`DJU-BEI`) at local rune offsets 28–33. P55 ends with the identical six runes at offsets 70–75. The second occurrence is also the last two words of the 56-page unresolved region. Original p27 visually depicts an isolated insect wing, and original p55 a complete moth; the solved p57 references instar metamorphosis. Those images and the exact 28-page numerical displacement could motivate a human to compare the two halves of the book, although neither a 28-page split nor any key-reuse operation is directed by surviving creator-authenticated text.

**Frozen architecture:** pair physical pages `(p,p+28)` for `p=0..27`. At each page-local rune index `i` allow a completely arbitrary secret bijection `S[p,i]` of all 29 GP glyphs, shared by the corresponding cells of the two pages in that pair. Every `S[p,i]` can vary completely independently across page pairs and rune positions. This subsumes page-pair-specific repeated additive pads, fixed shifts or secret rune substitution at each local position; its only binding assumption is that the *same* bijection applies at both page partners' same local positions. Original p50 has no runes, leaving 27 nonempty comparisons. If `C=S(P)` with a bijective `S`, then `C[p,i]==C[p+28,i]` exactly when the corresponding plaintext symbols are equal. This makes the cross-partner coincidence rate completely key-independent.

On the **12,956 original unsolved runes**, the paired physical-page comparison has **195 equal positions among 5,663 jointly populated offsets**, a fraction **0.03443404555889105**. Repeated key choices cannot change this count.

To calibrate the necessary plaintext equality rate without fitting keys or guessing words, the SFT converts three separately pinned English literary corpora into the repository's source-calibrated GP29 alphabet and slides windows of exactly 12,956 runes in increments of 97 positions, preserving all 56 physical-page lengths and the empty p50. For each window it computes the same 27-partner equality fraction:

| Native GP English source | Windows | Lowest fraction | Median fraction | At or below original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 2,111 | 0.04838424863146742 | 0.06021543351580434 | 0 |
| Gibran | 513 | 0.04997351227264701 | 0.06039201836482430 | 0 |
| Emerson | 3,198 | 0.04997351227264701 | 0.06233445170404380 | 0 |
| **Original LP2** | **1** | **0.03443404555889105** | — | — |

**All 5,822 finite English windows are above the original.** This is a genuine discrimination under the explicitly declared source-native-English model. A separate positive plant uses independently generated secret 29-way permutations for *every page pair and offset*, encrypts a native original-length English stream and recovers **12,956/12,956 runes** with the retained true inverse while preserving equality counts.

## What the repeated pair does and does not imply

The existing [two-word report](lp2-repeated-wordpair-structure.md) already discovered the pair and tested an `OUR OWN` crib with period-six direct additive keys; those tests failed. The independent [shared seven-phase p27/p55 gate](lp2-p27-p55-shared-sevenphase-keyless-gate.md) disfavored a shared page-reset seven-phase substitution, but only for p27 and p55. The present gate allows an arbitrary and independently secret glyph permutation for **each** paired local rune offset and applies the proposal to *all 28 opposite-half page pairs*; it therefore tests a different, more permissive partner-clock condition without a key search.

As a separate descriptive check, 5,000 deterministic shuffles preserving each original word's **length and physical page membership**, but permuting words within each page/length bucket, produced a repeated eligible 3+3-or-longer bigram **123** times (2.46%; corrected upper-tail 0.024795). Five thousand whole-book-length shuffles yielded zero. These conditional exchangeability nulls are not historical cipher models and do not identify the original phrase's plaintext; the earlier section-bounded and marginal-matched nulls remain the stronger studies of the pair's significance.

**Decision:** Do not pursue a 28-page-partner *position-wise bijective alphabet reuse* as an explanation of the repeated phrase under ordinary source-native GP-English plaintext. Alternative clocks, nonbijective transformations, different keys for the paired pages, transpositions, non-English content, and context-dependent mechanisms remain open. The 28-page framing is inferred from the observed repeat, not an authenticated instruction, so it should receive no priority over a route supplying a verifiable plaintext operation.

**Reproducer:** [Windows-compatible CommonJS SFT](../sims/lp2_p27_p55_halfbook_pair_gate.cjs) and [passing Windows Actions run 43464795138](https://github.com/FlareZ123/liber-primus/actions/runs/43464795138) via the existing manual `lp2-repeated-wordpair-null.yml` workflow's `halfbook` option. The SFT asserts the exact source offsets, word positions and uniqueness, equality count, three control panels, deterministic shuffle results and planted full inverse.
