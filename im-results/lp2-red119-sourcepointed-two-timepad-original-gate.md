# Red119 prime-page pointers: source-fixed two-time-pad inverse is negative

**Agent23, 13 November 2026. Director #785 completed by a pair-specific, original-cipher source-native test.** No previously unknown GP29 plaintext, shared source key, reversible full page decipherment, historical endpoint or continuation is recovered. The pointer equality remains a new exact *candidate* clue.

## Independently printed source link, and the missing assumption

The two complete source-visible 3-rune red spans, both at local offset **119**, have GP prime sums:

- Original physical **p3** red triad `PDTH`, GP primes summing **137**. The 1-based original page is **4**, and **137−4=133**. Separately, **137 is prime #33**, pointing by ordinal to original physical p33.
- Original physical **p39** red triad `IACS`, GP primes summing **173**. Its 1-based page is **40**, and **173−40=133**. Separately, **173 is prime #40**, pointing to original physical p40.

Both index positions 33 and40 begin source-visible chapters. The repeated **133** is the originally archived 2014 Stage11 HTML title number, as reported in [Agent37's original observation](../communications/broadcast/20261113T2308Z_agent37_red119-chapterprime-133.md). The prime-ordinal/page arithmetic uses printed runes and historical GP weights, with no fitted original cipher text. **Neither the prime-ordinal pointer nor the separate idea of reusing an unknown GP29 pad is specified by any surviving author instruction.** The same arithmetic could arise accidentally or refer to navigation or transport instead.

## Frozen key-cancelling decoder

For either red-pointed pair and each of two original-visible alignments (p3/p39 local offset0 to the pointed chapter's offset0, or red119 position to the pointed chapter's offset0), suppose both ciphertext runes satisfy `C^A_i=(P^A_i+K_i) mod29` and `C^B_i=(P^B_i+K_i) mod29`, with *any unrestricted and unknown shared key* `K_i`. The key cancels exactly:

`(C^A_i−C^B_i) mod29=(P^A_i−P^B_i) mod29`.

This is an actual all-secret necessary condition, independent of assumptions about key randomness or its material source. If both P registers contain source-calibrated GP-native English, their rune difference has characteristic distribution `q[d]=sum_x f[x] f[(x−d) mod29]`, with f learned from **100,000** completely independent Shakespeare GP-native training runes. The log-likelihood ratio against a uniform 29-symbol difference, summed at all source-paired positions, is a predeclared exact decision statistic. The GP encoding module has independent **181/181 original LP1** word and **95/95 solved p57** rune controls, including original source use of ING/IO single runes.

Source-native positive controls use **250 fixed held-out English pairs each from Shakespeare, Gibran, and Emerson** for each original fragment length (750 controls per alignment, **3,000** in total). Each controlled plaintext pair is encrypted by the *same independent GP29 additive pad* `K_i=(17i+7) mod29`; subtraction exactly cancels it, and the computed evidence score matches that of the native plaintexts to numerical precision. These positives establish that the key-cancelling statistic can identify source-native English pairs for the tested lengths.

An independent, source-preserving comparison shifts each second **actual ciphertext page** cyclically at every possible position, with original first-page and original source-runic inventories unchanged. Rank 1 would mean the actual source-fixed alignment yields the best English-derived difference score. The original first-page and page-start clocks are frozen: no shift maximization is used to recover plaintext.

## Complete results: four original held-out pairs fail

[Windows/Node22 original-source run 43526160284](https://github.com/FlareZ123/liber-primus/actions/runs/43526160284) executed the exact authentic GP transcripts and all controls.

| Source-linked pair; alignment | Matched original runes | Original key-cancelled log-likelihood (nats) | Exact original shift-score rank | GP-native encrypted plant scores ≤ actual, Shakespeare / Gibran / Emerson (each /250) |
| --- | ---: | ---: | ---: | --- |
| p3:0 → p33:0 | **214** | **−4.042549** | **89 / 214** | **2 / 0 / 0** |
| p3:119 → p33:0 | **98** | **−2.905705** | **134 / 214** | **1 / 2 / 2** |
| p39:0 → p40:0 | **231** | **−6.100489** | **150 / 231** | **0 / 0 / 0** |
| p39:119 → p40:0 | **121** | **−5.115063** | **201 / 231** | **0 / 0 / 0** |

All four original differences have **negative** English-over-uniform log-likelihood while the control median scores are positive in every independent corpus. Across the 3,000 controls only **7** are as poor as or worse than the original model matched for its own length. This is a descriptive count across four already-selected source models and overlapping control windows: it is **not an unconditional sampling p-value or evidence that all possible English pairs are ruled out**. The zero-red119-to-p40 alignment is especially unfavorable to the shared English source-pair hypothesis: among **121 matched positions, zero GP rune differences are zero**, whereas native English paired runes readily produce equal symbols.

More importantly for source selection, the actual four alignments are not distinguished among rotations of the same original pointed chapter. The original shift ranks **89,134,150,201** make this *page-pointer-to-common-clock* interpretation poor on its own source. A hypothetical one-time pad fitted to both ciphertext pages always yields a common key for any guessed plaintext pair; that algebraic property cannot authenticate the guesses. No jointly readable 40-rune passage is supported and no key is proposed.

## Decision and reproducibility

**Retire these two specific red119-linked same-local-clock GP29 additive two-time-pad routes as a supported LP2 plaintext source.** They do not justify a language-model crib-drag producing arbitrary fluent guesses. The original GP-prime sums, matching historical 133 and independent chapter-index relationships remain exactly observable, and could select some *other* navigation, key, hidden-state or archive operation. A new consumer should make a concrete prediction that distinguishes it from accidental chapter pointers before searching a secret key.

[Read-only, single-file CommonJS SFT](../sims/lp2_red119_pointed_pairs_twotimepad_sft.cjs), [original corpus](../resources/liber-primus/lp2-corpus.json), and [the passing Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/43526160284) preserve every original rune count, exact model score, independent corpus, fixed control setting and planted shared-pad control. The global 56-page research status in `results/README.md` remains unchanged.
