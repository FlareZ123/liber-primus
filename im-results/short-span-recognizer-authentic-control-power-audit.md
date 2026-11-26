# Short-span recognizer: authentic-control and family-wise power audit

**Decision (Director #2970 and corrected #2971):** the frozen GP29 trigram score is useful for a single candidate, but short islands are effectively non-discriminating under the actual archived p0 affine selection family. The decisive obstruction is not shortage of negative trials: every one of 512 independently generated matched null families contains a legal anchor-selected state with an exceptionally high short-window score. A conservative necessary familywise threshold eliminates every held-out title window and all but two of 10,360 held-out body windows. No original candidate rescore or new fragment/key search is licensed.

## Why the external C2 baseline is not an authentic Cicada calibration

The external [C2 challenge specification](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/CHALLENGES.md) reports a quadgram baseline near 0.408 TPR at 1% single-window FPR. Its checker samples uniformly from three development files: an unparsed PGP/hex-containing file, Emerson's *Self-Reliance*, and a 41-word thematic keyword list. The genuine trailing plaintext contributes at most 143/9,294 alphabetic characters of the first file, about 0.51% of the total positive sampling distribution. This remains an invalid authentic-register calibration. C2's Latin quadgram score and the GP29 scorer below are distinct, so their single-window TPRs are not an apples-to-apples leaderboard comparison.

## Corrected genuine positive corpus

The pinned [native solved GP29 source](../resources/external/relikd-solved-gp29-native-v1.json) contains nine source sections and the [adjudicated 19 headings](lp2-solved-title-body-exact-grammar-output.json). The previous audit incorrectly identified p57 as 112 runes and omitted p56 prose. The actual p57 is **95 runes = 7 title + 88 body**; p56 is **85 runes = 5 title + 80 prose** with a separate non-rune hash. Both are included. The two mixed numeric diagram bodies are excluded from held-out prose windows; p56's hash is not crossed. Whole original source sections, including all their headings and bodies, are held out from their fitted scorer. Training otherwise uses the archived scorer's native sections, retaining its original text concatenation and smoothing. No unknown original plaintext is assumed.

The former FPR confidence calculation applied a zero-false-positive bound to counts of **positive** windows, which is invalid. The negative trial count, not positive sample size, determines uncertainty of FPR. The old script `sims/short_span_recognizer_power_audit.py` remains a historical audit artifact, not the present quantitative decision.

## The actual frozen affine family

The [archived affine search](../sims/lp2_p0_short_affine_offset_spacingfree_sft.cjs) is not a direct 1,816 short-fragment trial. Its 1,816 bank fragments are **14 runes**. It enumerates candidate multiplier/carry states by matching these anchors at every offset d=13..248 of p0's 262 physical runes. It fits 249 body digits and reports 27,812 distinct candidate states, scored on full-body mean native trigram likelihood. The original [archived output](lp2-p0-short-affine-offset-spacingfree-output.json) contains no complete list of 27,812 short-window candidates. Multiplying a single-window FPR by either count is not the correct dependency-aware calibration.

Moreover, the 13 low radix digits (title) are not fixed by a fitted multiplier/carry. The archived best multiplier/carry permits `b=0..2804634207102689142`, an interval containing 2,804,634,207,102,689,143 integer offsets, **27.334%** of the entire 29^13 domain. Since the width exceeds 29^12, every possible low-12-rune title prefix, and hence every contiguous window wholly within those 12 digits, can be realized without changing the reported high body. A title-like island in those positions is a free offset choice, not evidence for this family. This is an exact radix consequence, no linguistic approximation.

## Exact-state family-max lower bound, with held-out authentic positives

The [SFT](../sims/agent19_short_span_family_power_sft.cjs) reuses the original exact BigInt lattice enumerator verbatim and the exact native trigram scoring formula (add-0.5 unigram smoothing and strength-8 bigram/trigram backoff). It does not rerun an original candidate search.

For each of nine whole-section holdouts and lengths 6, 8, 10, 12, select the four highest-scoring 14-rune bank anchors measured by their best contained short window. This subset uses **only native fragments already present in the frozen original bank**, removing the held-out section in addition to the two original bank exclusions. Lexical-bank additions are omitted, conservatively. Selection is fixed before null sampling. Generate 512 independent seeded nonprose p0-length families with the same 262-rune inventory and exactly two adjacent equalities, starting from random shuffles, repairing equality count, then proposing 8,192 constraint-preserving swaps. The sampler is not asserted uniform over all constrained sequences.

For each family, scan the **actual allowed offsets and unit multipliers**, using the archived lattice constraints and exact carry verification, until one of the four ordered anchors has a legal state. The score of its best contained short window is a certified lower bound on that family's true maximum. This is an exact subset of the original receiver, preserving its search-induced dependencies; it is not a count of independent candidate trials or a Bonferroni approximation to the candidate family. The 36 fitted fold/length combinations share the same synthetic families and are not independent. For every one of the 36 combinations, all 512 null families contain an anchor at the reported maximum lower bound. The empirical 99th-percentile lower bound is therefore that score. At any strict threshold below it, all observed null families cross.

The one-sided exact 95% binomial lower bound for 512/512 crossings is 0.994166; Bonferroni simultaneous lower bound across 36 combinations is 0.987232 (conditional on the seeded family generator, not a universal authentic-cipher FPR). The true 1% familywise threshold cannot be below this bound in the sampled family model. We need not enumerate the remaining states, because a still-higher exact maximum can only reduce power. The following **familywise TPR upper bounds** use strict score superiority; exact whole-family TPR could be lower. The single-window comparator uses a separate random same-length window from each matched null matrix per fold/length, with empirical 99th-percentile threshold.

| Length | Title windows | Title single TPR | Title familywise TPR upper bound | Body windows | Body single TPR | Body familywise TPR upper bound |
|---:|---:|---:|---:|---:|---:|---:|
| 6 | 74 | 74.32% | 0/74 | 2,644 | 66.53% | 1/2,644 (0.038%) |
| 8 | 44 | 88.64% | 0/44 | 2,608 | 85.35% | 0/2,608 |
| 10 | 24 | 95.83% | 0/24 | 2,572 | 93.43% | 1/2,572 (0.039%) |
| 12 | 9 | 100% | 0/9 | 2,536 | 95.74% | 0/2,536 |

Overlapping windows are correlated; these are descriptive held-out window rates, **not independent binomial positive observations**. Report section variation instead: eligible title sections 7/5/5/4, all with zero familywise survivors. For body, nine held-out sections at every length; only one source section has any 6-rune survival (maximum section rate 0.152%), only one any 10-rune survival (maximum 0.328%), and none for 8/12. The small nine-section population does not support a universal TPR claim, but the fixed authentic controls are demonstrably unpowered for this receiver. Raw [per-fold thresholds, 512 negative-family bounds and positive counts](short-span-recognizer-family-power-output.json) preserve the complete measurement.

## Consequence for the research frontier

Correcting the corpus and FPR logic does **not** rescue sub-13-rune recognition under the actual affine family. The decisive cause is that the search explicitly manufactures 14-rune native-bank anchors in every null family; a strong-looking contained short window is consequently ubiquitous. No direct evaluation of the archived original short islands is justified by this test. The original long-body score/held-out continuation is a different statistic and is not invalidated by this short-window power failure.

Use independently specified complete source cribs or long untouched body continuation rather than promoting an English-looking island selected within the fitting span. This result applies to the exact archived affine selection structure and scorer; it does not establish that every source-constrained short rubric is impossible to authenticate.

Reproduce: `node sims/agent19_short_span_family_power_sft.cjs`. The same function was executed against the pinned repository inputs in a JavaScript tool runtime; the standalone Node filesystem wrapper was not separately executed. The saved source references the existing affine SFT to reuse its lattice exactly.
