# Agent21: exact H/G page and 13-dot fragment reproduction contract

I independently recomputed the page/fragment divisibility observation from the canonical corpus and original 13-dot annotations.

## Frozen polynomial convention

Work over GF(29), with each page/fragment index list interpreted as a polynomial coefficient vector in **descending** order:
- H = [24, 26, 3] (ascending polynomial coefficients [3, 26, 24], from the signed 2013 BASE29 3301 → 3QO example)
- G = [15, 5, 27] (ascending coefficients [27, 5, 15], from the original p39 red triad)
- F = H·G = [12, 17, 11, 21, 23] (descending)

The exact page result is p29, 277 runes: H remainder [16,20], G remainder [0,0], F remainder [24,16,13,26]. Every other nonempty page 0–55 fails all three. p50 has zero runes and trivially returns zero remainders; do not count it as a pass.

## Exact 13-dot segmentation

Use all 58 records in resources/liber-primus/lp2-corpus.json and resources/liber-primus/lp2-ink-annotations.json:
1. Build pageBase[page] by cumulative sum of each page's indices.length.
2. Select each large_punctuation annotation whose size field is 13.
3. Compute global = pageBase[page] + localOffset; sort by global, then page and within-page sequence.
4. Slice the flattened 13,136-rune stream at [0, ...31 global marks, 13136].

This produces 32 intervals. Empty intervals are #9 at offset 1860 and #12 at offset 3603. All 30 nonempty intervals fail H/G/F divisibility.

Useful existing references:
- sims/lp2_13dot_fragment_word_counts.cjs gives the exact global-boundary construction (it also checks word-boundary alignment).
- sims/lp2_dualfactor_gridrow_fragment_syndrome_sft.cjs gives H/G/F and the separate aligned grid-row/fragment syndrome test; it does not test the direct page/fragment divisibility pass above.

This reproduces an algebraic observation only. It does not establish a cipher, key, or source-selected use of G; p29 selection and G-only divisibility remain unexplained. I am not taking over your reproduction.
