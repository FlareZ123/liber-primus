# Original LP2 word-boundary predecessor constraint

**23 November 2026, Agent1. Classification:** exact source-glyph observation and a conditional randomization diagnostic, **not** a recovered ciphertext inverse, key, or plaintext. It adds a cross-word boundary test to previously established within-word repeat counts. All 56 unknown LP2 physical pages p0–55 remain undeciphered.

## Source-faithful question

A word-reset cipher could transform the first rune of each printed word independently of the preceding ciphertext word. Does the unusually low original adjacent-identical-rune rate recover at such printed boundaries, where the previous ciphertext rune should cease to matter under a simple independent reset model?

Read the complete unchanged `resources/liber-primus/lp2-transcription.txt` and independently assert all 13,136 glyphs against `resources/liber-primus/lp2-corpus.json`. Restrict the statistic to the **12,901 adjacent rune pairs within the 55 rune-bearing unknown physical pages** (p50 has no runes). Treat physical `-` and `.` in the canonical transcription as original printed word separators, and `/` as a line-wrap continuation, not a plaintext delimiter. This explicitly excludes the 32 genuine cross-physical-page word carries from the word-boundary comparison rather than silently breaking those words.

| Genuine source register | Adjacent rune pairs | Equal adjacent glyphs | Equal rate |
|---|---:|---:|---:|
| Inside a printed word, on one physical page | **10,028** | **63** | **0.6282%** |
| Across a printed word separator, on one physical page | **2,873** | **23** | **0.8006%** |
| Both classes combined, inside physical pages | **12,901** | **86** | **0.6666%** |

The complete already-solved GP29 native reference (`resources/external/relikd-solved-gp29-native-v1.json`, nine independent source sections) has **24 equal first/last-rune word-seam pairs among 726** genuine word boundaries (**3.3058%**). Its original-language orthography, passage selection, and text lengths differ from the encrypted corpus, so this is an illustrative native-GP baseline rather than a complete conditional null.

## Page-conditioned independence calibration

For every physical unknown page independently, collect the exactly observed **terminal rune** immediately before each printed word seam and the exactly observed **initial rune** immediately after that seam. Hold the terminal vector, initial-rune multiset and number of printed boundaries fixed. Consider **every uniform random permutation of initial runes within the same original page**. The number of equal seam pairs is a permutation-statistic with an exact expected value and variance computable directly from the observed two symbol histograms on each page. Sum those independent page-stratified moments.

| Statistic | Original-data result |
|---|---:|
| Observed equal printed-seam pairs | **23 / 2,873** |
| Expected under original-page-conditioned start-rune permutation | **100.779909950741** |
| Exact variance under this permutation ensemble | **95.470222804075** |
| Observed standardized residual | **−7.960373916** |

For a page with `n` seams, previous-terminal histogram `a[v]`, next-initial histogram `b[v]`, define `T=Σ_v a[v]b[v]`. Then `E[X]=T/n`. Under a uniform permutation of the `n` successors, the second factorial moment is
`E[X(X−1)] = (T² − Σ_v a[v]b[v]² − Σ_v a[v](a[v]−1)b[v])/[n(n−1)]`, and `Var(X)=E[X(X−1)]+E[X]−E[X]²`. Single- and zero-boundary pages contribute zero variance. Summing the page-specific means/variances gives the values above without Monte Carlo approximations. The reproducer also checks a two-symbol exhaustive positive control.

**Implication:** an idealized model in which printed word beginnings are assigned independently of the preceding word's terminating rune, subject to preserved per-page marginal inventories, strongly mispredicts the original first/last rune matches. The cross-word suppression is nearly as conspicuous as suppression inside complete words. A purported independent word-local cipher that fully loses preceding-ciphertext information at each printed seam must explain this dependence by some *other* input coupling, selection, language register, state, or output constraint. A continuous predecessor-excluding code is one explanation, but its actual inverse, key, exceptions and side information remain unrecovered. This diagnostic **does not exclude all word-local ciphers** and cannot prove a true cryptographic cross-word clock. A uniform permutation of word starts also destroys any legitimate plaintext-level lexical dependencies, which are an important alternative.

## Research decision and relationship to prior work

This count is complementary to the established **63 within-word doubles in 62 complete printed words**, the GP27 and GP28 side-information capacity studies and #2273's actively investigated state/escape models. It closes only the narrow analytical claim that source word breaks are visibly independent GP29 rune-restart points under a page-conditioned uncorrelated start-rune model. Do not use the standardized statistic as an unconditional `p` value for authorial intent, promote a generic rank28 coding scheme, or begin an uninstructed password/key sweep. For any proposed *source-selected* word reset, require a predicted distribution of first and last runes at the 2,873 unmodified seams, alongside its direct invertibility and native-language original holdout.

**Reproduction:** [read-only Windows Node.js 22 SFT](../sims/lp2_word_boundary_antirepeat_carry_sft.cjs), [original-source Windows PASS 45188297987](https://github.com/FlareZ123/liber-primus/actions/runs/45188297987). This asserts every original page's rune sequence and all exact counts and moments, without rewriting source data or fitting cipher parameters.
