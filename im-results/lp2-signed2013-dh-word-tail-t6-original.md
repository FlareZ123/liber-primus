# LP2 lag-six echo: a source-motivated word-tail localization

**Status (12 November 2026, Agent 7):** new *positional characterization* of the previously known T6 lag-six event, on all 12,956 authentic unsolved runes. It localizes much of the existing lag-six excess to the last two rune positions in words of length eight or more. **No plaintext, encryption key, reversible decoder or destination is recovered.** The particular tail subgroup was inspected after observing the ciphertext pattern; its significance is conditional and exploratory.

## Independent historical input and causal hypothesis

The [previously documented signed 2013 BASE29/Diffie–Hellman example](2013-signed-dh6-original-lag6-source-bridge.md) supplies source numbers 6 (private exponent), 2 (shared DH key), 8 (server public key), and the BASE29 3301 = 3QO low digit 24. Retrospectively combining 6, 2 and 24 yields the [known LP2 T6 echo](lag6-conditioned-echo.md):

\[
C_{w,j}=(24-2C_{w,j-6})\pmod{29}.
\]

The authentic source **does not instruct** a reader to combine those numbers in this way or to interpret DH public 8 as a minimum word length. A plausible targeted hypothesis is that a rule using the preceding six runes can affect the final two runes of an eight-or-more-rune word, rather than every eligible character uniformly. The source's 8 and 2 are reasons to give that possibility special attention, **not independent confirmation** of the rule.

## Original word-position measurements

The canonical parser [\`sims/lp2_word_pages.cjs\`](../sims/lp2_word_pages.cjs) preserves all 32 cross-page words, 2,896 original words and 12,956 runes. Exactly 559 words have seven or more runes and yield 1,290 T6-eligible sites. The established **80 exact T6 matches** divide as follows:

| Original position class | T6 matches / eligible | Observed fraction | Interpretation |
| --- | ---: | ---: | --- |
| Words of exactly 7 runes (only position 6 eligible) | **8 / 216** | 3.70% | Near the 1/29 baseline |
| Final 2 runes in words of length ≥8 | **52 / 686** | 7.58% | Strongest visible concentration |
| Earlier T6-eligible runes in words of length ≥8 | **20 / 388** | 5.15% | Intermediate excess |
| **Total** | **80 / 1,290** | **6.20%** | Previously known anomaly |

The first **1,448 complete words** contain respectively **5/116, 24/334 and 11/195** matches in those three fixed groups. The following **1,448 words** contain **3/100, 28/352 and 9/193**. The word-tail fraction persists in both chronological halves; neither half is entirely discovery-blind, since the original T6 transform and the inspected tail grouping were chosen after historical exposure to the data.

The 52 terminal hits spread across sections rather than forming an exact one-per-13-dot punctuation code. The complete original annotation has 28 thirteen-dot events at 26 distinct global offsets, and the observed terminal events are nonuniform over their unequal-length intervals. The numerical **52 minus approximately 24 expected = 28** coincidence must not be promoted to an authored 28-event signal.

## Constrained source-word null and positive control

The independent [reproducer](../sims/lp2_lag6_dh8_wordtail_sft.cjs) samples **2,000 exact word-multiset-preserving conditional permutations**. Each word is shuffled only among its own rune positions; a draw is accepted only if that word retains exactly its original number of immediate repeat pairs. Original complete word lengths, all rune frequencies, word and page boundaries, and the strong doublet suppression are thereby held fixed. The generator is seeded xorshift32, \`0x02013301\`.

| Group | Actual T6 hits | Conditional-null mean ± SD | Draws at least as high as actual |
| --- | ---: | ---: | ---: |
| Length-7 words | 8 | **8.0655 ± 2.7133** | 1,099 / 2,000 |
| Words length ≥8, final two runes | **52** | **24.2555 ± 4.7786** | **0 / 2,000** |
| Words length ≥8, earlier eligible runes | 20 | **13.5820 ± 3.5981** | 110 / 2,000 |

The one-sided add-one upper-tail resolution for the terminal group is **1/2,001 ≈ 0.000500** under this *specific* null. It is **not** a discovery-wide p-value: the already selected T6 transform, several historical model searches, and inspection of different possible position groupings are excluded from that multiplicity. This test demonstrates concentration given the source and grouping, while establishing neither an insertion channel nor a key.

The executable has an exact positive control: mechanically enforce T6 on both terminal positions of all ≥8-rune words and verify all **686/686** planted terminal sites are recovered by the identical classifier. This tests the grouping implementation, not the original-cipher interpretation.

## Compare the previously published collision-repair generator

The [preexisting M1 generator](lag6-sparse-collision-repair-model.md) fixes the global adjacent-collision correction probability from the 86/12,955 observed repeated-rune count as

\[
p=1-\frac{29(86)}{12955}=0.80748745658.
\]

For any corrected tentative ciphertext collision at word-local index ≥6, M1 chooses T6 of the rune six positions earlier, unless that repeats the predecessor. The word-local rule in M1 does not privilege a word's final two positions. A **4,000-book** source-word-length-exact simulation with seed \`0x01a85c6d\` yields these mean hits:

| Group | Original | M1 mean |
| --- | ---: | ---: |
| Length-7 | 8 | **13.102** |
| Length ≥8, last two | 52 | **41.31025** |
| Length ≥8, earlier eligible | 20 | **23.40375** |

The original share of T6 hits in the terminal group is 52/80 = **65%**. Only **44/4,000** M1-generated books have an equally large or larger terminal share. This is a nominal tail test on a post-inspected diagnostic and is **not a pre-registered rejection** of M1. A broader three-bin mismatch statistic is met/exceeded in **551/4,000** simulations, so the full position-count vector is not globally anomalous under that model at conventional thresholds. Separately, the earlier M1 study already established a failure on the independent lag-five S repeat signal. Do not claim the present position observation resolves or compounds that preexisting falsification.

## Research decision

**Preserve this as a conditional architecture clue.** A new *source-selected reversible* candidate may use the historic DH tuple to determine a word-length gate and one or two terminal symbol operations. However, a genuine decoder must also account for the independent lag-five excess, produce readable unknown plaintext on the unchanged original word stream, and re-encrypt exactly. The current 52 terminal matches include an expected accidental component, so there is no justified selection of 28 “true” markers or an additional secret register.

**Reproduce:** \`node sims/lp2_lag6_dh8_wordtail_sft.cjs\` from the repository using Node.js 22. The CommonJS script runs a frozen original-word test, both chronological halves, the exact planted tail control, 2,000 conditioned nulls, and 4,000 existing-model simulations. Its source inputs are the repository's canonical \`resources/lp2-transcription.txt\` and \`resources/liber-primus/lp2-corpus.json\`.
