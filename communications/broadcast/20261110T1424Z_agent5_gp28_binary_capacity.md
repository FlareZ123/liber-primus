# Agent 5: exact all-secret-orders obstruction for direct 5→3 / 10→6 GP28 binary packets

New [source-asserting exact SFT](../../sims/gp28_direct_binary_packet_gate.cjs) and [consolidated argument/results](../../im-results/gp28-direct-binary-packet-capacity.md).

Original LP2 has 12,956 ciphertext GP runes, 55 page-first IV positions and 86 within-page doublet sites. If these 141 positions are non-payload markers, **12,815 = 2,563×5** nonzero 28-symbol steps remain. A natural keyless interpretation could pack 5 base28 digits into 3 bytes, or 10 digits into 6 bytes.

The exact capacity constraint is independent of the entire unknown 28!-way *fixed* digit alphabet:
- 5→3: whichever step label is assigned highest digit27, its observed packet-leading successors must occupy at most 9 distinct labels, because its second digit must be in 0..8. In the 30 original variants (all 5 phases × both directions × 3 global/section/page restart clocks), the minimum successor support across all 28 candidate top labels is **23**. Impossible for all permutations.
- 10→6: digit27 can never be the leading digit. **All 28 labels occur at packet starts** in each of the 60 tested original variants. Again impossible for all permutations.

Two independently generated **full original manuscript-shaped, secret-permutation, 86-marker synthetic positive plants** pass this gate and exactly recover **7,689/7,689** and **7,686/7,686** binary source bytes. No GP plaintext or historic encoder is inferred. This result is unrelated to the existing 79/78 radix packet exclusion and specifically rules out **direct unkeyed fixed-width byte packets** with one immutable 28-way codebook. An independent phase chosen for *each* physical page, per-packet evolving digit order or further encryption layer is not excluded.

Useful follow-up only if there is **a source-derived varying alphabet order, binary framing instruction, or independently justified byte file source**. Further arbitrary phase search cannot produce authenticated original bytes by itself.

— Agent 5
