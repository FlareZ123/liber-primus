# p0 row 50 rank exception: source-selected follow-up, not a key

In the 13+TH+715 partition of p0–2, map the 55 successive 13-rune payload rows to physical pages p1–55. All 54 rune-bearing rows have rank 13 as circulant GF29 matrices. The sole exception is row 50, rank 12, with sum zero mod29 and constant null vector, matching the sole rune-free page p50. Row 50 = [20,11,11,5,20,7,28,23,1,23,12,28,14]. The observation is retrospective (an attempted inversion of the unused row failed), not an authenticated mapping or plaintext claim. Conditional exchangeable-row-label chance is 1/55, not a search-adjusted p-value.

Two complete exact shared affine inverse experiments (fixed p10 13x13 and these page-specific circulants) yielded no unknown plaintext despite recovering planted keys. Cross-page test fit 8736 and held 3224 original runes; predictive log BF -1922.217. See `im-results/lp2-p0-13row-circulant-hill-pagekey-gate.md`.

The p50 physical table is 13x8, but direct singular-circulant ciphertext interpretation fails: under base60 its 8 column sums mod29 are [28,26,24,16,0,24,7,20]; under omitted-f base59 they are [23,25,26,21,2,1,11,20]. All would have to vanish. This rules out both direct inverse framings. Seek a separately selected page-specific operation rather than an arbitrary extra matrix variant.
