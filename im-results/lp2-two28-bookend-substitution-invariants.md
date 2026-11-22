# Two-block bookend and 14-phase GP29 substitution invariants

**Classification:** exact key-independent exclusions for narrowly specified static bijective substitution families in the tested ordinary GP-native English register. No unknown plaintext or key was recovered.

## Why these models were tested

The existing source census records one exact six-rune cross-page repeat in the 12,956-rune unknown LP2 stream: the sequence `[23,11,1,17,18,10]` occurs at physical p27 local offset 28 and p55 local offset 70. These are corresponding final pages of the two 28-page halves, and both offsets are phase zero modulo 14. The repeat itself is already documented in [the p27/p55 shared-pad report](lp2-bookend-6395-sharedpad-gate.md) and [the all-directed seam census](../sims/lp2_p55_p56_p27_seam7_sft.cjs); this investigation does not claim to rediscover it.

That geometry motivates two small, testable static-substitution hypotheses:

1. **Two-block page-pair key reuse:** one arbitrary GP29 bijection is reused across each corresponding physical pair `(p,p+28)`, independently for all 28 pairs.
2. **Fourteen-phase tableau:** fourteen arbitrary GP29 bijections are shared across the unknown text, with phase `local rune offset mod 14`, resetting either at each physical page or at each of the nine visual chapters.

The earlier Cicada 14-column transposition is only contextual motivation; neither tested model is a columnar transposition.

## Exact invariant

A bijection preserves symbol equality. Therefore:

- Under the page-pair model, each pair's same-symbol ordered-pair count and coincidence index are invariant under its arbitrary secret permutation. The 28 independent keys cannot alter the pooled within-pair statistic.
- Under the 14-phase model, each phase's same-symbol pair count and coincidence index are invariant under its arbitrary secret permutation. No key search or language optimizer is needed.

A model that changes the alphabet independently at every page, uses non-bijective/homophonic output, changes state within a page, or uses a different plaintext register is outside this test.

## Source and controls

Input is the canonical original `resources/liber-primus/lp2-corpus.json`: physical p0–55, 56 page slots, 55 rune-bearing pages, p50 runeless, 12,956 runes. The page-pair partition is exactly `(0,28), (1,29), …, (27,55)`. The chapter-reset control uses the nine source chapter lengths `[729,1145,1729,1903,1021,1433,1680,3008,308]`.

Native-English controls use the same GP29 source-orthographic encoder as the repository's source-control SFTs (including the published GP digraphs and the established single-rune ING/IO spellings). The test takes **16 non-overlapping 12,956-rune windows** from `shakespeare_first300k.txt` and **4 non-overlapping windows** from `gibran_prophet_58585.txt`. Each window is cut into the original page lengths, then the same page-pair or chapter reset geometry is applied. These are descriptive reference-class controls, not independent random samples and not a discovery-wide p-value.

## Results

### One arbitrary substitution per corresponding page pair

The original has **213,438 equal-symbol pairs in 6,226,846 within-pair comparisons**, pooled coincidence index **0.03427706**. The 28 individual page-pair indices range from **0.03311044 to 0.03581914**.

Across 20 matched native-English windows (560 pair segments), the individual pair-segment coincidence indices range from **0.05092752 to 0.07228046**. Window-pooled pair indices range from **0.05877133 to 0.06139770** for Shakespeare and **0.06046528 to 0.06123485** for Gibran. Thus every original pair's index is below every matched native-English pair segment in this control set.

Because all 28 pair-specific permutations preserve these counts exactly, no choice of those keys can make the paired pages ordinary GP-native English under this unchanged-segmentation model.

### Fourteen shared substitutions with page or chapter reset

| Reset convention | Original mean of 14 phase ICs | Original phase range | Native-control mean | Native-control range |
|---|---:|---:|---:|---:|
| Physical page | 0.03440392 | 0.03372184–0.03526597 | 0.05982494 | 0.05430153–0.06578624 |
| Visual chapter | 0.03439981 | 0.03407494–0.03468597 | 0.05981194 | 0.05319761–0.06546962 |

Again, every secret phase permutation preserves the observed phase-specific equality counts. No shared fourteen-row tableau can bridge the gap to the native-English controls under either reset convention.

The continuous-book 14-phase case is included only as a consistency check (mean phase IC **0.03460659**); the existing [phase coincidence invariant SFT](../sims/phase_coincidence_invariant.cjs) already scans continuous periods 2 through 1,600, so this is not claimed as a new continuous-period exclusion.

### The motivating echo remains an observation

The exact repeated six-rune block occurs only at p27 offset 28 and p55 offset 70 among the 55 rune-bearing unknown pages; it is the only cross-page six-rune overlap in that census. Both positions have page-local phase zero modulo 14, but their continuous-book phases differ (3 and 0). This explains why a page-reset hypothesis was worth testing; it does **not** prove that the repeated ciphertext has a known plaintext, that the 28-page pairing is an authored key schedule, or that a 14-column transposition is involved.

## Decision and scope

Retire only:

- a static arbitrary monoalphabetic GP29 substitution reused across each corresponding page pair `(p,p+28)); and
- fourteen shared static GP29 substitutions with physical-page or visual-chapter phase resets.

Do **not** extend these failed families by adding unselected page offsets or more key rows. The result does not exclude a 14-column transposition, independent per-page substitutions, independent page-specific phase offsets, within-page evolving state, non-bijective/homophonic mappings, nonlinear or feedback ciphers, key-skip rules, or a different plaintext language/orthography.

**Next useful question:** what source-selected reversible operation explains the p27/p55 echo or changes the near-uniform rune values? The repeated block remains a clue to interpret, not a key. No unknown plaintext, authentic key, or Cicada continuation destination follows from these exclusions.

## Reproduction

Run from the repository root with Node.js 22:

```sh
node sims/lp2_two28_bookend_substitution_invariant_sft.cjs
```

The script reads only the canonical LP2 corpus and the two committed native-English control texts. It emits exact original counts, all 28 pair indices, all 14 phase indices for each reset convention, the 20 matched control windows, and deterministic random-permutation positive sanity checks.
