# Signed-2016 FOLD and the source-derived T6 relation across mirrored LP2 pages

**Classification (Agent 12, 11 November 2026): exploratory source-constrained original-ciphertext relation with bounded language-model exclusion. No new plaintext, authenticated key, cipher, or final destination has been recovered.**

## A human-visible reason to pair these sources

The verified January 2016 signed message says the words of Liber Primus are the map and their numbers the direction. In the previously established, unproven [GP-prime-sum/base58 word map](lp2-2016-signed-message-base58-word-map.md), the source word THE (GP sum 72) addresses original physical LP2 p14, word1, which spells **FOLD** literally in the canonical ciphertext. Folding the complete *58 original physical page positions* p with 57−p gives 29 mirrored page pairs, the cardinality of the GP alphabet. This is a plausible operation a human could try from the artifact, although neither the signed message nor LP2 explicitly instructs the 58-page fold. The independent [folded original-equality study](signed2016-fold58-pair-keyless.md) already tested shared identical-symbol keys and obtained weak conditional enrichment.

The original signed 2016 image has 563×569 dimensions. [Earlier independent research](2016-image-dimensions-lag6-source-derivation.md) associates its difference of six, two particular source numeric-table byte values and a p53–55 Ac offset with the affine source hypothesis **T6(x)=24−2x mod29**. The exact source derivation is recorded there and remains conjectural as a cipher instruction. The present test applies that *previously fixed* map directly to folded ciphertext rune pairs. It deliberately introduces no fitted affine coefficients.

## Full 58-slot fold, original ciphertext and a permutation null

The authentic 58 physical pages comprise 56 unknown ciphertext pages p0–55 (one number-only page p50) and two already solved pages p56–57. Original unknown/unknown mirror pairs are p2/p55 through p28/p29, excluding p7/p50, giving **26 pairs** and **5,402** rune comparisons if each paired page is truncated at its shorter original length. For each left rune x and paired right rune y, count the exact relation **y=T6(x)** under four natural placements: the two paired pages aligned at their starts or ends, with the right-page rune order either forward or reversed. No cipher key is inferred by this equality test.

| Original 58-slot page alignment | T6-equal positions | Matched positions |
| --- | ---: | ---: |
| Prefix-prefix, right forward | 168 | 5,402 |
| Suffix-suffix, right forward | 182 | 5,402 |
| Prefix-prefix, right reversed | 198 | 5,402 |
| **Suffix-suffix, right reversed** | **220** | **5,402** |

The leading source result is 220/5,402 = **4.07257%** vs 1/29 = 3.44828% under independent uniform symbols. A fixed-hypothesis 5,000-trial permutation test shuffles *whole existing right-side pages* over the 26 pairs (so every original page and its byte/rune multiset remain unchanged), rescoring the same geometry. Random seed **0x330158** yields **51/5,000** at least as high under the best observed orientation, a plus-one upper tail of **52/5001 = 0.01040**. Taking the maximum standardized score across *all four orientations anew on each shuffle* gives **189/5,000** at least the original family maximum, plus-one **190/5001 = 0.03799**.

These are **conditional model-specific** rates, not discovery-wide significance: both the FOLD clue and T6 interpretation were recognized after many related source and ciphertext searches. The two are not independently cryptographically authenticated operations, and the four modes are merely the simplest possible placements.

## Necessary shared-key GP-English condition fails

A meaningful structural use of T6 would be that both mirrored passages encrypt *independent ordinary GP-English texts* under a common hidden GP29 key K, with one side running through an affine output map, for example C_left=P_left+K and C_right=T6(P_right+K). If that architecture is true, the secret cancels exactly:

`14×(C_right−T6(C_left)) mod29 = P_right−P_left mod29.`

The left-hand residual over all **5,402 source positions** has 220 zero differences. A source-independent 160,000-rune native-GP Shakespeare training sample predicts roughly **326.926** equal-runic pairs over the same length. More importantly, the *complete 29-bin residual distribution* scores **−105.959352 nats** in GP-English difference log likelihood relative to uniform. A separate native-GP source plant of two independent GP-English passages, length-matched and encrypted under a seeded secret shared affine key, exactly inverts and reencrpyts; the recovered residual scores **+109.226073 nats** using the same frozen language reference. Thus the original residual is far from the model's ordinary GP-English distribution, even though the single T6 equality bin is elevated against a uniform null.

**Decision:** the full source-mirror equality enrichment does not identify a genuine shared additive/affine GP-English key or recovered text. The full independent-language fingerprint directly disfavors that complete mechanism. The isolated equality surplus may reflect multiple testing, another register, a sparse clue, or source correlations not captured by page shuffling. It would require a separate original-source rule selecting the mirrored orientation, event subset or nonlinear state to become a cryptanalytic decoder.

## Exploratory alternative: 56-unknown-page mirror

A narrower but *weaker human-justified* reading folds physical p0–55 as two 28-page halves, p with 55−p, including the rune-free p50. Under eight straightforward comparisons (mirrored/28-offset pairing, reversed/right-forward, prefix/suffix), the best is a **same-direction suffix mirror**, matching **238/5,705** runes to T6. In **3,000** whole-right-half page shuffles (seed `0x330128`), **4/3,000** attain the corresponding standardized score; taking the best of all eight models per shuffle gives **64/3,000**, plus-one **65/3001 = 0.02166**. The exact affine-cancelled native-GP-English residual again scores **−105.216085 nats**, vs a same-model 5,705-rune native plant **+110.844455 nats**. The full 58-slot fold above is better grounded in the original 2014 0..57 image count, and the 56-fold is postselected in the broader test family. These conditional p-values cannot be combined as independent confirmations.

## Reproduction and interpretation limit

[One-file CommonJS original-source SFT](../sims/lp2_2016_fold_t6_mirror_sft.cjs) reads original rune indices, literal printed-word FOLD/SB/END anchor, authenticated signed text, and GP-native Shakespeare controls. It asserts the complete fold pair counts, both permutation seeds, source residuals and genuine reversible shared-key plant. The manual [GitHub Actions Windows/Node22 run 42960888036](https://github.com/FlareZ123/liber-primus/actions/runs/42960888036) **passed**. The on-demand workflow is [lp2-fold-t6-source-manual.yml](../.github/workflows/lp2-fold-t6-source-manual.yml); it never runs on normal pushes.

**Follow-up threshold:** a new source-backed operation must successfully transform **unseen original LP2 ciphertext** into a distinguishable language-like plaintext, recovered key or authenticated continuation. Optimizing fold geometry or affine constants against the observed 220 hits would not establish a mechanism. The full-GP-English shared-key candidate tested here should be deprioritized.
