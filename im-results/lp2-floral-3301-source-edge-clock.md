# Floral p40–55: a source-local 3,301-edge original-cipher receiver

**Classification:** exact original structural count with a reversible derived ciphertext transport; **no authenticated decipherment, key, author-selected clock or plaintext**. This is an intermediate candidate for future source-led work, not an established LP2 solution.

## Source and physically motivated range

The 16 consecutive illustrated terminal pages p40–p55 are independently delimited by the manuscript's floral frames. Unlike the adjacent prose pages, physical p50 contains the central 32×8 numeral panel and **zero GP29 runes**. The authoritative `resources/liber-primus/lp2-corpus.json` keeps p50 in physical position, preserving the distinction between page number and text-segment index.

The original GP29 rune counts by physical page p40→p55 are:

```text
page:   40  41  42  43  44  45  46  47  48  49  50  51  52  53  54  55
runes: 231 273 272 274 273 270 270 274 271  66   0  92 263 179 232  76
edges: 230 272 271 273 272 269 269 273 270  65   0  91 262 178 231  75
```

Totals: **3,316 original runes; 15 rune-bearing pages; 3,301 within-page directed adjacent-rune edges**. One page has no original rune, so simply counting 16 physical pages and subtracting 16 would be incorrect.

This range is the **only** contiguous physical page interval among the `56 × 57 / 2 = 1,596` p0–p55 intervals with exactly 3,301 within-page edges. It was selected visually by the book's floral plates, prior to examining the count. Multiplicity within this particular finite family does **not** measure the number of possible human-chosen quantities, page subsets or cryptographic interpretations.

## Exact reversible register

For a nonempty physical page with GP29 indices `c[0..n−1]`, retain the first original rune `c[0]`, then form `d[i] = (c[i] − c[i−1]) mod 29` for `i=1..n−1`. The p40–55 collection yields **15 first-rune indices plus exactly 3,301 difference indices**. Every original rune is recovered uniquely by `c[i] = (c[i−1] + d[i]) mod 29`, with a reset and retained head at each of the 15 nonempty physical pages. Original p50 is retained as an empty page.

On this 3,301-entry authentic stream, exactly **21** edges have difference zero. Across the 812 possible distinct ordered GP29 predecessor→successor pairs, counts range from zero to fourteen, with eleven unseen ordered pairs. This contradicts a literal repeated complete 812-edge Euler/de Bruijn cycle; it does not distinguish a keyed anti-repeat operation from an unconstrained artificial/noisy original ciphertext generator.

## Plausible relevance, competing explanation and stop rule

**Historical clue:** Cicada repeatedly used integer **3301**, including the source-period 2014 3301-sum magic square and the 2013 BASE29 example. A solver could therefore notice a full 3301-step physically segmented register in a clearly separated 16-page chapter, particularly next to the standalone numeric panel p50.

**Critical missing link:** Neither source currently instructs a solver to use **within-page GP29 differences**, transfer the 2014 square to this 16-page chapter, treat the 15 page initial runes as IVs, or derive 3,301 consecutive key symbols. Subtracting one rune per nonempty page is our own operand choice; the number coincidence alone cannot authenticate it. There is no known original plaintext result.

Advance only if a genuinely independent first-party clue fixes a *specific* operation and key/state for this exact 3,301-entry stream **before** looking at language scores. Require successful original contiguous p40 input, a separately untouched p52–55 prediction, solved-original plus nonnative controls, and exact ciphertext reconstruction. A bijective round-trip without authentic plaintext is an invariant, not evidence of key correctness.

## Reproduction

- Source: `resources/liber-primus/lp2-corpus.json`.
- Read-only Node22/CommonJS exact source test: [`sims/lp2_floral_3301_transition_sft.cjs`](../sims/lp2_floral_3301_transition_sft.cjs), verifying all sixteen page counts, 15-head/3301-delta original round-trip, interval census and edge multiplicities.
- [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45262446071).
- [Nonclaiming coordination handoff to the current constrained-cipher Issue #2273](https://github.com/FlareZ123/liber-primus/issues/2273#issuecomment-7113449096).
