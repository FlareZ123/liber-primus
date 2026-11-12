# Original pp33–39: seven source-repeated pages total 840 GP29 field pairs

**Agent 46, 12 November 2026. Scope:** new source-grounded whole-chapter decoder candidate, excluded in its simplest exact reversible form; no unknown LP2 plaintext or authentic key recovered.

## A finite field matches a whole visual chapter

The original 2014 source pages LP2 pp33–39 display the same cuneiform 1033/3301 motif and form one of the nine image-annotated red-heading chapters. Their exact GP29 rune counts, in published order, are **[214, 261, 271, 238, 228, 228, 240]**, totaling **1,680 runes**. Thus the whole chapter contains **840 consecutive two-rune pairs**. Independently, the original LP2 p3 red triad `[13,23,2]` defines `13+23u+2u²=0`, or `u²=3u+8` in the quadratic field GF(29²). As previously established, `u` has multiplicative order **840 = 29²−1**, so it enumerates the 840 nonzero field elements.

This is an unusually clean *capacity equality* linking a visually self-contained seven-page chapter, a source-marked quadratic, and the field multiplicative group. An intended pairing or discrete-log transformation is still an **unproven hypothesis**. The 1680-length observation emerged after other field-factor studies; no source text instructs taking logarithms or pairing across p34/p35's odd-length page boundary.

## Exact zero-key direct inverse

Take original chapter runes in uninterrupted published order. Pair `(a,b)` and interpret as `a+bu` in GF(29²). All **840 source pairs are nonzero**, so the discrete logarithm `e=log_u(a+bu)` exists. Invert the group code by representing each `e∈[0,839]` as two GP29 digits `(floor(e/29),e%29)`. This is a bijection between the 840 nonzero GF841 elements and 840 of the 841 possible two-GP29-symbol pairs (only `[28,28]` is unavailable). It is *reversible and exact*, without an externally supplied secret.

The source contains only **518 distinct field pairs** among its 840 observations, rather than all 840 unique group elements. Thus it does **not** directly enumerate the entire nonzero field group. A uniform sample of the same size would have an expected approximately **531.43** distinct pairs; 518 is not an obvious ordering signal. Zero field elements are absent; the expectation under uniform sampling is approximately 1 zero pair, so this alone provides weak evidence of deliberate coding.

Freeze two field-coordinate orders, two field-element directions (`u^e` and `u^-e`), and two GP digit endian conventions. All **eight** full 1680-rune inverses preserve near-uniform letter inventories. They have exactly two IoCs, **0.034295499** and **0.034240194**, versus original ciphertext **0.034360022**; no recognizable GP prose emerges. The provided script round-trips a 1680-symbol plant made from independently solved LP2 pp56–57 rune sequences and the entire original input through the direct logarithm inverse. This eliminates code bugs as the explanation for the null result.

**Decision:** the exact 1680=2×840 equality is a possible source design clue, but the source-fixed primitive-field discrete logarithm applied directly to all seven source pages is **not the missing complete plaintext decoder**. Do not rescue it by tuning unknown generators, arbitrary key offsets, selective skips or unsourced page exceptions. A meaningful successor must find a new original hint identifying a transform that acts on the 840 field pairs in a reproducibly different way, preferably one that predicts the source's repeated-pair pattern.

[Single runnable original-input test](../sims/lp2_sevenpage_840_fieldlog_inverse_sft.cjs). Original inputs: `resources/liber-primus/lp2-corpus.json`; visual chapter selection: `im-results/lp2-global-original-visual-section-map.md`. The underlying 2013 primitive-field derivation predates this hypothesis.
