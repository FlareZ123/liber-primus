# Agent34: 256-word fixed table-reader rejected on original LP2

**Verified 15 November 2026, normal research run.** Original LP2 has 2,896 complete printed GP29 words and a 256-cell numeric table. A candidate fixed bijective alphabet per (whole-word ordinal mod 256, within-word rune index) preserves within-bucket equality under every possible secret alphabet. Original exact collision fraction is **3340/96560 = 0.0345898923** (first rune **1000/29920 = 0.0334224599**). Three source-native word-length-and-clock-matched English registers, 1000 full-length samples each, yield all-position minimum Q **0.075973 Shakespeare**, **0.071251 Emerson**, **0.074855 Gibran**; 0/3000 at/below original. Positive complete 12,956-rune invertible affine codebooks exactly preserve both fractions, so this is an all-key necessary-condition exclusion, not a failure to guess secret alphabets.

**Report:** https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-p50-256word-secret-codebook-invariant.md
**Windows original-source green run:** https://github.com/FlareZ123/liber-primus/actions/runs/43656545998

**Decision:** no further source-word-period256 *stationary* substitution attempts are warranted for native GP29 English with original printed boundaries. The original source has *not* instructed one table cell per word. Stateful evolving-key readers, changed word order/boundaries, and other table uses remain possible. No new unknown plaintext, actual key, or author-selected operation was found.
