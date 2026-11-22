# Original GP29 differential-multiplicative equality gate

**Agent 4, 12 November 2026. Classification:** a key-independent exclusion under native-Gematria-Primus English and preservation of the manuscript's printed words. It recovers no unknown-page plaintext, authentic key, decoder, or destination. The exact full-original SFT passed [manual CI run 43320404011](https://github.com/FlareZ123/liber-primus/actions/runs/43320404011).

## A fully secret nonstationary family with a rigid observable

The original 55 rune-bearing unknown LP2 physical pages have 12,956 GP29 symbols. There are exactly 86 equal-adjacent pairs among 12,901 within-page successor positions, including only **63 within the same complete printed word** and 23 at word boundaries. Of the 10,060 positions within printed words, **10,028** are also within one physical page; 32 positions lie across physical page joins and are ineligible to test a page-reset cipher. The 2,896 words and 55 source page sequences are verified against the canonical transcription and corpus by the test.

Consider **every** cipher of the form, on each page after its first symbol,

\[
C_i=C_{i-1}+k_i(P_i-P_{i-1})\pmod{29}, \quad k_i\in\{1,\ldots,28\}.
\]

The first symbol of each page is an unconstrained seed. Grant each position its own independent secret nonzero \(k_i\), chosen by *any* key schedule or history, and optionally one arbitrary fixed 29-symbol output-alphabet permutation. Because \(\mathbb{F}_{29}\) is a field, multiplication by a nonzero residue is injective, and so is an alphabet permutation. Consequently,

\[
[C_i=C_{i-1}]\quad\Longleftrightarrow\quad[P_i=P_{i-1}]
\]

at **every within-page position**, independently of all secret keys, phases, page seeds, and the fixed output permutation. The equality mask is therefore actual plaintext leakage for this entire family. A varying nonzero multiplier cannot suppress an English word's double letters.

This family is a plausible *technical* attempt because the original ciphertext strongly suppresses immediate repeats, 29 is prime, and nonzero step arithmetic has already been considered from earlier signed Cicada BASE29/DH material. The missing premise is decisive: **no original authorial clue selects this differential multiplication or requires preserving printed plaintext word boundaries**. The test assesses an explicit possible decoder architecture rather than asserting its historical use.

## Original-input comparison against three independent language controls

For each original complete printed word, independently sample with replacement from a fixed literary source's GP29-transliterated English words of **exactly the same GP rune length**. Preserve the original word's *exact within-page eligible pair positions*, omitting the 32 positions that cross physical page starts. Compute the sum \(X\) of equal-adjacent plaintext symbols at all 10,028 eligible positions. Whole-word resampling retains natural letter correlations within words; no plaintext string or key is fitted to the original ciphertext.

| Pinned source | Reference GP words | Expected \(X\) | SD | Original \(X\) | Standard score | Rigorous upper bound on \(\Pr(X\le63)\) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k | 55,407 | 330.017254 | 17.307409 | **63** | −15.43 | \(10^{-75.5042}\) |
| Gibran, *The Prophet* | 15,733 | 309.097421 | 16.741924 | **63** | −14.70 | \(10^{-67.7484}\) |
| Emerson, essays | 77,932 | 296.259289 | 16.301306 | **63** | −14.31 | \(10^{-63.4527}\) |

The probability statements are valid upper bounds under **exactly the declared independent, source-word/length-matched resampling null**, not calibrated probabilities of the manuscript having a particular historical creator or cipher. They follow directly from the whole-word doublet-count distributions: for each original group \(g\) of \(n_g\) words sharing rune length and eligible-pair mask, let \(X_g\) be the count for one uniformly selected source word. For any \(s>0\),

\[
\Pr(X\le63)\le e^{63s}\prod_g
(\mathbb{E}[e^{-s X_g}])^{n_g}.
\]

The standalone test evaluates the exact finite source-word histograms in 34 length/mask groups, optimizes this Chernoff bound over \(s>0\), and asserts the reported original and expected results. The estimates are overwhelmingly inconsistent with ordinary source-like GP-English words without invoking a hidden key.

The source word masks also have an instructive finite-corpus obstruction: **8** original GP word equality masks never occur among Shakespeare reference words of the same GP length, **9** against Gibran, and **7** against Emerson. This is strictly a finite dictionary-coverage statistic. The original manuscript may intentionally avoid repeated letters, use an unknown language/register, or contain symbols encoded before word layout was applied.

## Implementation-positive control and research decision

A native-English positive plant chooses all 2,896 whole reference words with their original rune lengths, assigns a **different nonzero GP29 multiplier at every position**, resets at the 55 page starts, and applies a nonidentity fixed 29-way affine relabeling of the output symbols. The decoder recovers **12,956/12,956** original planted symbols and tests exact equality-mask preservation at every within-page position. The report uses the unchanged original ciphertext, not a reconstructed or fitted ciphertext for its negative claim.

[Single runnable Node 22 SFT](../sims/lp2_differential_multiplicative_equality_gate_sft.cjs) · [GitHub Actions positive execution](https://github.com/FlareZ123/liber-primus/actions/runs/43320404011) · [Canonical corpus and page map](../resources/liber-primus/README.md).

**Decision:** Under direct GP29 native-English plaintext and printed-word preservation, reject this *entire all-secret differential-multiplicative family* as an explanation for the original manuscript. This is stronger than testing a few period/key choices, but its obstruction is the already-visible adjacent-equality deficit applied to this particular invariant. It **does not** exclude additive stream ciphers, any cipher with an additive offset or changeable zero-step rule, plaintext transformations that alter word boundaries or alphabet, or exceptional literary registers. In particular, it supplies no missing key for the 256 numerical table or unknown plaintext. Further tuning nonzero multipliers cannot evade the invariant; a future source clue must select a genuinely different reversible operator.