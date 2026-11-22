# A common page-position cipher does not explain LP2

**Classification:** original-cipher bounded negative, 21 November 2026. This does not recover plaintext, identify an authentic creator key, or exclude page-specific/word-dependent key schedules.

## Decision and mechanism

The original p0–p55 pages contain 55 rune-bearing pages and one numeric-only p50. A simple explanation for the near-flat ciphertext is reuse of a single 29-symbol, page-position-dependent substitution (or additive pad), with each page resetting its cursor at the start. Such a mechanism need not expose its secret key to be tested: any bijection at position `i` preserves the equality relation between the plaintext symbols of different pages at `i`. Native GP29 English, whether converted directly or subjected to any such shared position-dependent substitution, should therefore exhibit the same elevated cross-page collision rate.

The strongest rival is independently keyed or state-dependent encryption for different pages. The test below has no power against that rival.

## Frozen original-input test

Source: [canonical rune records](../resources/liber-primus/lp2-corpus.json), all original pages p0–p55 except numeric-only p50. A position `i` includes each physical page with at least `i+1` runes; preserve every page's original length. Sum the equal-symbol pairs at equal zero-based page-local offsets over all 29 runes and every eligible page pair, then divide by all page pairs at those offsets.

- **Observed:** 10,751 equal glyph pairs / 311,132 page-local comparisons = **0.03455447**.
- **Position-destroying matched null:** 1,000 independently drawn circular rotations of every original page, retaining its symbols, length and full within-page order. Seed: xorshift32 `0x33012026`, deterministic source-native implementation. Mean **0.03448302**, SD **0.00032683**, smoothed upper-tail probability **0.41758**.
- **Strongest apparent pair:** physical p28 and p42, 21/269 exact aligned matches, marginal-frequency-standardized z=**3.8705**. This pair was **selected after looking at all pairs**. Across the **1,035** pairs with at least 200 original runes of overlap, the maximum-z statistic has a 400-trial circular-rotation familywise smoothed upper-tail probability **0.35162** (null maximum mean 3.7209). The attractive best pair is therefore unexceptional under the charged search family.
- **Sensitivity control:** simulate a length-matched cleartext sample independently from the **original solved p57 rune frequencies**, then apply one unknown shared additive pad indexed by page-local position. This yields **0.07168340** collisions with exactly the same equality-only detector, preserving the key-blind signal. This test of instrument sensitivity is synthetic, not an independent LP2 decoding success.

All statistics reproduced on Windows/Node 22 via [successful CI run 44929024241](https://github.com/FlareZ123/liber-primus/actions/runs/44929024241). The exact [single-file runner](../sims/lp2_full_corpus_page_position_collision_sft.cjs) uses only Node built-ins and the repository's canonical original ciphertext. The test also prints and checks the original counts and strongest-pair identity, and includes no search over plaintext lexica or alternative key offsets.

## Interpretation and next decision

These results strongly disfavor a **common position-specific bijection used across all page starts** as an explanation for this ciphertext, because it would retain a native-language collision rate whereas the observed original is indistinguishable from circularly dephased ciphertext. It does not exclude page-specific keys, local reset at other original punctuation, variable-length transforms, secret nonbijective operations, or a different set of pages that happens to share a key. The pairwise results provide no calibrated reason to target p28/p42 for crib dragging.

A viable next solve path needs an **independently selected repeated reset/key interval** or a source-authored original-key source, then an exact reversible prediction on untouched ciphertext. Do not expand this negative into ad hoc page-subset searches or treat its lack of excess matches as proof of a one-time pad.
