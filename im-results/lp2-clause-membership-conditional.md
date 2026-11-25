# Conditional clause-membership discriminator — power failure

Issue #2729; Agent 24. Tests the limited hypothesis that printed groups retain the membership of native clauses even if their order is lost. This experiment does not assume intact word order, a cipher key, or that printed groups are plaintext words.

## Inputs and scope

The corrected transcription gives 12,956 runes, 2,896 printed groups and 173 full stops. Retain only complete clauses between two stops in the same visual chapter, excluding leading and trailing fragments. The resulting 164 clauses contain 2,862 groups and 12,795 runes; the nine chapter clause counts are 8,17,26,20,8,22,21,41,1. Source hashes and panel definitions are in the raw JSON. Literary punctuation uses .?!; exact solved-GP uses ⁘. No new punctuation corrections.

## Conditional model and calibration

For a chapter's empirical length distribution p(l), let Z_n(r) be the coefficient of x^r in (sum_l p(l)x^l)^n. Conditional on n groups and r runes, the category-count expectation is n sum_{l in A} p(l) Z_{n-1}(r-l)/Z_n(r). Its second factorial moment is n(n-1) sum_{l,k in A} p(l)p(k) Z_{n-2}(r-l-k)/Z_n(r). Variance is the second factorial moment plus the mean minus the squared mean. Standardize counts for singleton, <=2, 3–4 and >=7 groups by these moments, clip at ±5 and omit degenerate variances. The eight features are the means of signed and squared residuals. This is an order-free length proxy; it does not measure lexical or semantic phrase identity.

Train a fixed linear contrast (native minus null feature means divided by null variance plus .02, then L2 normalized) on eight nonoverlapping literary panels from the first 65% of the sources (two Gibran, three Shakespeare, three Emerson). Each has 164 complete clauses and the same nine chapter clause counts; actual clause group and rune totals differ, so this is a recorded nuisance rather than a matched-length assertion. Use eight examples of each null per training panel. Chapter-wide shuffle preserves chapter length multiset and clause group counts, with realized clause rune sums supplied to the score. Conditional iid decoy sampling preserves each clause's n and r exactly. Within-clause permutation leaves all features unchanged.

Hold out nine panels from the last 35% (one Gibran, four Shakespeare, four Emerson), with 99 draws per null and an independent paired null example. The fixed gate requires >=80% native panels to pass both upper-tail p<=.05, and <=10% paired-null false positives. The exact solved-GP section corpus supplies a separate smaller native check (59 complete clauses, 588 groups, 2,343 runes).

## Results and decision

| Control | Dual-null passes |
|---|---:|
| Gibran | 1/1 |
| Shakespeare | 0/4 |
| Emerson | 3/4 |
| All held-out native | 4/9 |
| Independent paired nulls (false positives) | 0/18 |

The native power gate fails. Exact solved-GP yields shuffle p=.02 and conditional-decoy p=.06, also failing the dual gate. The original scores 1.4499196843 (chapter-shuffle mean 1.6022281843, conditional-decoy mean 1.6834823423), upper-tail p=.895 and .920 with 199 draws each. These original values are descriptive only because the native discrimination failed. No inference of actual clause membership and no cipher/lexical fit are warranted.

Retire this specific conditional length-count discriminator, not the general clause-membership hypothesis. A decoy conditional on the complete per-clause length multiset is in principle observationally indistinguishable by lengths alone from genuine words uniformly shuffled inside each clause. A useful successor needs independently motivated lexical/cryptographic evidence; tuning more versions of the same length proxy is not justified here. No unknown plaintext recovered.

## Reproduction

`node sims/lp2_clause_membership_conditional_sft.cjs` from repo root. The experiment core ran in connected V8 on fetched source; the standalone Node filesystem wrapper was not separately CI-run. Raw results: [lp2-clause-membership-conditional.json](lp2-clause-membership-conditional.json).
