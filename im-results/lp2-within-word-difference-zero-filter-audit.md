# Within-word difference audit: the apparent step signal is the doublet filter

## Decision

The canonical LP2 ciphertext has a strong within-word adjacent-difference anomaly, but the anomaly is concentrated at **difference 0**, the already-known adjacent-equal deficit. After conditioning on nonzero differences, there is no statistically strong residual step distribution. This matters because a deconvolution of the full difference histogram against English can manufacture a seemingly nonuniform key-step distribution by absorbing the collision-repair deficit.

## Original-input measurement

The source parser is the canonical `resources/liber-primus/lp2-transcription.txt` with `resources/liber-primus/lp2-corpus.json`. It reconstructs exactly **2,896 words and 12,956 runes** over physical p0–55, so the audit uses the same word segmentation as the shared corpus.

There are **10,060 within-word transitions**. Their difference counts (mod 29) are:

`[63,356,373,354,338,349,325,372,328,397,377,362,343,381,369,365,333,313,349,368,373,366,334,390,371,352,349,380,330]`.

Under a uniform 29-symbol stream, difference 0 would occur **346.90** times. Only **63** are observed. The retained zero-transition fraction is therefore **0.18161**, i.e. an inferred **0.81839 suppression**. This is the same order as the established anti-repeat/collision-filter anomaly.

Now remove difference 0 and test the remaining 28 bins against the natural equal-mass collision-repair expectation. There are **9,997 nonzero transitions**, giving **357.04 expected observations per nonzero difference**. The Pearson statistic is **33.5568 on 27 df**, with chi-square survival probability about **0.179**. The largest standardized deviation is difference 17 at **−2.33σ**. No nonzero difference is remotely comparable to the zero deficit.

## Consequence for the proposed K_STEP route

A recent external analysis proposed deconvolving the within-word difference distribution against an English transition distribution to infer a nonuniform keystream-step law. The canonical source data do not support treating that inference as a new key-generator signal without a collision-aware model. A uniform key-value stream followed by a rule that suppresses a fraction of equal adjacent ciphertext symbols naturally produces exactly this shape: a deep hole at difference 0 and approximately equal mass in the 28 nonzero bins if replacements are spread across nonzero symbols.

The correct conclusion is therefore narrower and more useful:

1. **The zero-difference deficit is real and already explained by the anti-repeat filter family.**
2. **The nonzero difference bins do not provide a strong new key-step fingerprint.**
3. **Any full-histogram Fourier/EM deconvolution that ignores the filter is confounded and should not be used to select a keystream family.**
4. A future step-distribution attack would need to model the collision/rejection mechanism first and then demonstrate a residual nonzero-step structure that survives a held-out null.

This closes the apparent “nonuniform K_STEP” shortcut as a causal route to plaintext. It does not solve or independently prove the anti-repeat mechanism; it simply prevents the difference histogram from being misused as a key-generator oracle.

## Reproduction

Run `node sims/lp2_within_word_difference_zero_filter_audit.cjs`. The script uses only the checked-in canonical transcription and rune corpus and emits the exact counts above. It performs no key search and no language-model fitting.
