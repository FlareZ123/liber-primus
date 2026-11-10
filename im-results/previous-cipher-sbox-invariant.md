# Arbitrary finite-context substitution feedback: collision invariants

**Agent 16 · 2026-11-10 · reproduced negative under declared English-GP models.** This analysis recovers **no plaintext, key, or confirmed LP2 cipher mechanism**.

## The cryptanalytic question

Can a deterministic substitution table indexed by a short history of **previous ciphertext runes** hide an otherwise ordinary English-like GP plaintext? Instead of restricting the table to affine or quadratic expressions, allow every conditional alphabet to be **any permutation** of the 29 rune values, with 29! possible rows.

For memory length k, the model is

\`\`\`text
C[p,t] = S[(C[p,t-k],...,C[p,t-1])][P[p,t]]
\`\`\`

with an arbitrary 29-rune permutation for each history. We test three increasingly large families:

1. **k=1, page-specific:** every one of the 55 pages has its own, otherwise unconstrained, 29×29 set of substitution rows.
2. **k=2, book-wide:** the same arbitrary row is reused wherever a two-rune ciphertext history recurs, across all pages. There are 841 possible row indices.
3. **k=3, book-wide:** the same arbitrary row is reused wherever a three-rune ciphertext history recurs, across all pages. There are 24,389 possible row indices.

No algebraic constraint, cyclic alphabet relation, or recoverable table parameter is assumed. The book-wide qualification is necessary for k=2 and k=3 because individual pages are too short to observe many repeated two- or three-symbol contexts.

### An exact label-invariant necessary condition

For each applicable (page, history) group, let n[g,b] be the number of ciphertext transitions in that group whose next rune equals b. Let N[g]=sum_b n[g,b]. Define

\`\`\`text
R = sum[g,b] n[g,b]*(n[g,b]-1)
    / sum[g] N[g]*(N[g]-1).
\`\`\`

This is the fraction of pairs of transitions with matching output runes among all transition pairs sharing their conditioning history. A **bijective** row transformation preserves every equality and inequality between outputs in that row. Therefore its collision count is *exactly unchanged* by an arbitrary S-box choice, regardless of how difficult it is to search for the S-box.

This is a mathematical identity, and is not itself an English-language assumption. The assumption enters when testing whether the unobserved plaintexts *conditional on the observed ciphertext histories* should retain English-GP-like output concentration. Such conditionals cannot be inferred from a plaintext marginal alone. The simulated models below calibrate that dependence explicitly.

## Input, source language, and controls

The observed corpus is \`resources/liber-primus/lp2-corpus.json\`, unsolved LP2 pages 0–55 excluding runeless page 50: **55 rune-bearing pages, 12,956 runes, 12,901 within-page adjacent transitions, and 86 immediate repeats**. Ciphertext context is reset at each physical page for score calculation. An actual word may cross a page boundary, but this experiment models physical-page resets as a declared cipher assumption and never counts cross-page transitions.

The English source is \`resources/control/shakespeare_first300k.txt\`: 300,000 characters encoded as **218,800 GP runes**, applying \`QU→CW, V→U, K→C, Z→S\` and greedily matching the double-letter GP labels. It has marginal GP symbol collision probability **0.0599699857**.

For each planted manuscript, draw one **random contiguous** source segment for every page, of precisely the page's actual rune length. Each symbolic row permutation is independently drawn by Fisher–Yates, and reused whenever its context recurs within the declared family. Start each page with randomly sampled initialization runes. If a candidate output equals the immediately previous ciphertext rune, reroute it with probability **0.81** to one of the other 28 runes uniformly. This explicit anti-doublet repair *can violate bijectivity at those individual occurrences*, making the planted model harder to recover through equality invariants.

The negative null uses a 29-state Markov chain on the same page lengths, remaining at the previous rune with probability **0.00667**, and otherwise choosing uniformly among the other 28 outputs. It reproduces near-uniformity and the ciphertext's principal adjacent-repeat suppression, without purporting to reproduce every empirical dependence. All chosen and planted controls use the identical invariant scorer.

## Observed and controlled results

| Family | LP2 matching output pairs / eligible context-matched pairs | LP2 ratio | Anti-repeat null mean ± SD | English-GP plant mean ± SD | Smallest plant |
| --- | ---: | ---: | ---: | ---: | ---: |
| k=1, **independent page S-boxes** | 1,919 / 54,009 | **0.0355311** | 0.0352827 ± 0.0007656 (200 trials) | **0.0652798 ± 0.0014188** (200 trials) | 0.0611940 |
| k=2, **global S-boxes** | 3,511 / 100,584 | **0.0349061** | 0.0352810 ± 0.0005758 (300 trials) | **0.0624031 ± 0.0010397** (300 trials) | 0.0590365 |
| k=3, **global S-boxes** | 124 / 3,473 | **0.0357040** | 0.0355104 ± 0.0029342 (200 trials) | **0.0620439 ± 0.0043955** (200 trials) | 0.0506329 |

The null upper-tail probabilities for LP2, respectively, are **0.3433**, **0.7475**, and **0.5075**. All 200, 300, and 200 English-GP planted manuscripts, respectively, score above the actual LP2 ciphertext. Thus plant-side empirical lower-tail probability resolutions are at most 1/201, 1/301, and 1/201 for the fixed generators. The much larger separation in collision ratios than these Monte Carlo bounds captures the practical effect size.

**The three-history case is already rather sparse:** only 9,860 of 24,389 histories occur, leaving just 3,473 eligible transition pairs. Its planted control is nevertheless consistently detectable under the particular model. This does not extrapolate to longer or hidden histories.

### Per-page family-wise check for k=1

A single atypical page could be obscured by book-level pooling. Select the largest page-specific k=1 collision ratio from all 55 pages and compare to the same maximum of each of 1,000 simulated anti-repeat manuscripts. The real maximum is **0.0502732 on page 27**, whereas the null maximum has mean **0.0581297**, 95th percentile **0.0819672**, and upper-tail **p = 0.7453**. For an additional descriptive power measure, no real page exceeds ratio 0.055; **82.605%** of 55,000 individually planted English-S-box pages exceed 0.055.

The 0.055 threshold is a qualitative plant-detection indicator, not an independently specified significance threshold. The empirical 55-page maximum calibration is the family-wise check.

## What this says about solving LP2

If an ordinary English-GP rune stream were encrypted by one of the specific deterministic, short-ciphertext-context-indexed substitution families, then the symbol probabilities in rows should remain comparatively concentrated. The observed ciphertext is instead nearly indistinguishable from the self-avoiding uniform null in these conditioned collision tests. The gap against model-matched positive controls is large and reproducible.

**Supported negative:** reject these direct English-like plaintext + short ciphertext-history bijective S-box models under the simulated anti-repeat policy and respective page/global row sharing. This generalizes beyond finite exhaustive affine/quadratic key searches to unenumerably large-permutation-search families without attempting to infer a row.

**Limits:** A short input history does not imply that plaintext, conditional on a particular ciphertext history, has its usual unconditional English rune distribution. Highly atypical conditional distributions could evade this test. Likewise it is powerless against a hidden keystream, position-varying substitution, longer history with too few context repeats, a different plaintext register, homophonic/redundant output, non-bijective symbol maps, multi-rune output encoding, mixed external plaintext sources, or a different repair policy that substantially flattens rows.

A further arbitrary S-box enumeration has very low expected value unless a clue supplies a more restrictive externally predictable state or a mechanism defeating the collision invariant. Substantive decipherment likely requires locating an independent key source, recoverable generator, or cross-page structural relation.

## Reproduction

- k=1, independent page tables: \`node sims/previous_cipher_sbox_invariant.cjs\`. Fixed seeds **0x1629edab** (200 null/plant manuscripts) and **0x1631cafe** (1,000 page-max nulls plus 1,000 page-by-page positive controls). No packages.
- k=2,3, global tables: \`node sims/context_sbox_invariant.cjs\`. Fixed seeds **0x1602aa6b** (300 null/plant for k=2) and **0x1603babe** (200 each for k=3). No packages.
- Both programs read the checked-in LP2 corpus and Shakespeare sample, assert corpus sizes, score identical context statistics for actual and simulated texts, and print exact JSON including observations, null distributions, planted controls, fixed seeds and empirical p-values.
- The exact checked-in script bodies were retrieved through GitHub and executed against the checked-in source data in this invocation's JavaScript runtime, after the source files were committed. Both experiments were verified through their complete output JSON. No scheduled or per-commit GitHub Actions workflow exists for these programs.
