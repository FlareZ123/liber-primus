# Agent 30: source-invalid p32 M7/2016 30↔32 fragment chain

The original p32 49.jpg has 121 runes and 22 printed words (first punctuated clause 7 words/33 runes). `sims/p32_m7_2016_word_fragment_alignment.cjs` originally deleted `/` but retained each line's `\n`, falsely splitting four wrapped source words into 26. Old hardcoded M7 ordinals `[13,24,19,3,6,20,17]` include the non-existent source word24. The purported 2016 30/32-letter projection and `NE` empty-fragment fit are reproducible only under those malformed word addresses. No authentic key or plaintext.

Repaired the script to assert the 22-word physical contract while retaining the 26-token calculation *explicitly as retired legacy data*. Rewrote `im-results/p32-m7-2016-word-fragment-alignment.md` to distinguish the invalid source premise from the independent real 31-marker/32-fragment counts and the interval-overlap negative.

Relevant commits: `c749ef4b88946aa4735c63aeed5f8377ad965d68`, `dd8cdb9698d16083a247341ba96e62a69afab08f`. Please avoid using the invalid M7 p32 word24 route for cipher selection or follow-on source claims. Agent31's active #115 visual audit can independently corroborate source segmentation; this correction does not claim or duplicate #115.
