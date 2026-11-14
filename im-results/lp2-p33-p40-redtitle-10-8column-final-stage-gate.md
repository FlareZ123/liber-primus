# Paired chapter-start red rubrics: 10- and 8-column final-stage inversion

**Agent11, 14 November 2026. Original-source bounded negative, no recovered LP2 plaintext or key.** This note tests a new **source-fixed 10-column** inverse on physical p33–39 together with an independently tested **8-column** inverse on p40–53. The two headings and complete rectangles are established original-page data; whether they were intended as transposition keys remains a hypothesis. Both inverses fail as the manuscript's **final** column permutation after an anti-repeat rune encoder. An additional complete, exactly reversible, **two-layer** source-keyed candidate removes the predecessor-exclusion anti-repeat transport *first*, then applies these same red-heading column keys; it also fails to recover native GP plaintext.

## An unusually concrete human-solve-path premise

A solver can see p33 open with **10 red runes**, each a different GP29 symbol, and p40 open its next major chapter with **8 red runes**, again all distinct. A recognizable 2014 Cicada stage used a **keyword-ordered columnar transposition**. Here the author's red titles themselves supply complete distinct-symbol ranks, while the visually associated original chapter bodies fill whole rectangular widths with no padding, no inferred blank cells, no page-length fitting:

| Original section | Visually marked leading key | Key GP29 ordinals | Original chapter runes | Body after heading | Complete rectangle |
| --- | --- | --- | ---: | ---: | --- |
| **p33–39** | red **10**, two printed words 2/8 | **23,12,14,5,0,10,24,7,8,6** | 1,680 | **1,670** | **10×167** |
| **p40–53** | red **8**, two printed words 3/5 | **0,9,19,26,6,23,25,8** | 3,008 | **3,000** | **8×375** |

The p33 first rubric is **separate** from the later source-marked p33:91 red eight-rune 3/5 heading. This 10-column test uses the p33:0 outer rubric, not the p33:91 nested rubric. It deliberately keeps the latter embedded in the 1,670-rune body. **Strong objection:** other source-visible heading breaks are genuine section boundaries; no original author instruction says to ignore that nested break when transposing the entire outer chapter. The adjacent clean rectangle dimensions may also be chance divisibility, and a cryptographic stream need not be a transposition at all.

Ascend in GP29 source order to rank each key symbol, producing fixed, no-tie ciphertext column reading orders:

- p33 red10: **[4,3,9,7,8,5,1,2,0,6]** (zero-based physical column numbers).
- p40 red8: **[0,4,7,1,2,5,6,3]**.

Unlike selecting an arbitrary secret permutation, both candidate keys are read directly from source ink. Because the 2014 key convention can be read in either orientation, also test the exact descending inverse. The ordinary operation writes source plaintext in row-major order across each declared width and reads ciphertext columns in key-rank order. Inverse cuts the original ciphertext into equal-sized source columns and reads them row-major, with no key fitting. In both cases, the source red title is retained **as a visible key** and omitted from the cipher body. The complete body and every glyph exactly forward-reencrypt after either inverse.

## Decisive untouched-cipher input

The original manuscript is strongly anti-repeat: adjacent equal GP runes are rare within printed original sections. If one of these keyed transpositions were the *last* encryption stage after a source-natural anti-repeat encoder, undoing it should **restore** that anti-repeat structure. The original-key candidate instead destroys it:

| Section and body | Original adjacent equal pairs | Original-key ascending-column inverse | Reverse-rank-column inverse | Uniform 29-symbol adjacent baseline |
| --- | ---: | ---: | ---: | ---: |
| p33–39, 1,670 GP29 runes | **12** | **69** | **61** | 57.55 |
| p40–53, 3,000 GP29 runes | **18** | **101** | **105** | 103.41 |

All four candidate inverses restore ordinary near-uniform doublet counts, while the untouched original has substantially fewer. The source body GP29 indices of coincidence are respectively **0.03435525594** and **0.03454440369**; transposing cannot change either marginal distribution, so neither inverted stream reads as ordinary native-GP English plaintext. A bona fide final-layer columnar transpose of a pre-final source-exact **zero-doublet GP29 stream** was generated at each original length under both direct and reverse key orders, using only source heading values, and then decoded; all four planted inverses restore their complete input **exactly**, with zero doublets. The test additionally verifies both full original inverse→forward round trips **1,670/1,670** and **3,000/3,000** in both directions.

## Complete two-layer inverse: predecessor exclusion before source-keyed transposition

A stronger interpretation observes that the original GP29 ciphertext already suppresses adjacent repeats, so its **outermost** layer might be a reversible predecessor-exclusion cipher. Test the simplest such rule, now **before** undoing title-ranked columnar transposition, with no plaintext fitting:

1. Set the initial predecessor to the **last original rune of the corresponding red heading**, GP ordinal **6** for p33 and **8** for p40. The source supplies both rather than requiring a fitted IV.
2. At each ciphertext rune, output plaintext-index **28** if it equals its preceding ciphertext symbol; otherwise output its rank among the other **28** GP symbols in ascending order. Advance the predecessor to the observed ciphertext rune. This is a complete reversible 29-output channel; the predecessor-equal case consumes the final 29th symbol, with no dropped exception or extra sidecar.
3. Apply the original heading-ranked **10- or 8-column** inverse above to the resulting GP29 symbol stream, using both predefined reading orientations.

The outer predecessor inverse on the original p33 body contains exactly **12** rank symbol28 instances, and p40 contains **18**, matching each section's original doublet count by construction. This does **not** authenticate GP symbol28/EA as a reserved plaintext letter; the earlier [full-book reserved-symbol word-edge analysis](lp2-reserved-ea-repeat-transport-original-gate.md) actually challenges the direct GP-prose interpretation of such a reserved rune.

| Original section | Outer predecessor inverse GP29 IoC | Rank-exclusion → red-title columns GP29 IoC (ascending and descending) | Deciphered GP prose? |
| --- | ---: | ---: | --- |
| p33–39 body 1,670 | **0.03533113521** | **0.03533113521** | No |
| p40–53 body 3,000 | **0.03545870846** | **0.03545870846** | No |

A transposition preserves the exact histogram, so these paired scores must agree; this is a useful implementation invariant rather than fresh evidence. Original output retains near-uniform 29-rune marginal counts and no coherent phrase. All four exact source-size positive controls start with an original-solved-p57 GP-prose plant, apply the **historical source-ordered columnar cipher**, then apply the **29-way predecessor exclusion with the frozen last-heading-rune IV**. The complete inverse recovers **every planted symbol** in all four cases. On the unedited original ciphertext, every intermediate GP29 rank and cipher symbol forward-reconstructs exactly, with no fitted secret or skipped rune.

**Decision:** Even this two-layer, fixed source-constrained construction does not recover original plaintext. A reserved-rune model with altered word boundaries, an additional secret key, different symbol ordering, or another originally specified anti-repeat transport remains open but is **not justified** by this negative to pursue extra rank or phase searches. Updated [SFT and successful Windows Node22 run 43587845316](../sims/lp2_p33_p40_redtitle_rectangle_inversion_sft.cjs) ([CI proof](https://github.com/FlareZ123/liber-primus/actions/runs/43587845316)).

These results reject the frozen **last-stage** title-ranked column inversion as an explanation for anti-repeat ciphertext under both plausible reading orientations. They do not reject a historical columnar operation occurring *before* the terminal anti-repeat transform, a non-GP intermediate, a changing key, another cipher layer, or the shared-source red119 prime-ordinal navigation hypothesis. The earlier [literal historical period-seven transposition on p33–39](historical-period7-p33-p39-transposition-gate.md) already failed (it used the **historical** 7-column key, not this new source-red10 key); p40's earlier [red8 plus p50 grid inverse](lp2-p40-red8-grid32-columnar-inverse.md) was independently negative. Do not re-search key ranks or shifts after these source-fixed failures.

**Exact reproducer:** [single-file original-sourced Node.js 22 CommonJS SFT](../sims/lp2_p33_p40_redtitle_rectangle_inversion_sft.cjs), with original 58-page `lp2-corpus.json`, independently recorded red-ink `lp2-ink-annotations.json`, exact source keys, ciphertext, inverse, forward replay and deterministic positive anti-repeat plants. **Successful expanded Windows Node22 [CI run 43587845316](https://github.com/FlareZ123/liber-primus/actions/runs/43587845316)**; original single-layer positive [run 43587409060](https://github.com/FlareZ123/liber-primus/actions/runs/43587409060).

## What would actually advance decoding

The salient remaining potential is a source-selected **layer order** or additional key/state rule, not a new column permutation. Because the script demonstrates that the original *already* exhibits anti-repeat behavior before inversion, one plausible surviving route is that a columnar operation occurs before the last anti-repeat encoder and cannot be directly undone from the published rune stream. Neither heading nor the 2014 precedent currently identifies how to invert that outer anti-repeat layer. A future original-source instruction that does so could make the red10 and red8 rectangular source keys useful. This report claims **no** plaintext, key or new destination.