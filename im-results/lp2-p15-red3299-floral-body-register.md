# P15 red 3299 as a title-stripped floral-register size

**New exact cross-artifact alignment, not yet a decipherment.** The one red numerical cell in p15's original 4×4 Fibonacci-prime spiral is **3299**. Physical LP2 pp40–55 share identical botanical borders across sixteen consecutive pages (including rune-free p50) and contain **3316 original GP29 ciphertext runes**. Two independently visible opening rubrics, **p40 red8** and **p54 red9**, contain **17 runes**. Excluding only those two headings gives **3299 original ciphertext runes**, exactly matching p15's red cell. Red p53's 51-rune terminal text is retained as body.

## Source-bounded scope

The sixteen original page lengths, in source order, are `[231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76]`, totaling 3316. The 3299 result is **unique among the 41 contiguous sixteen-page windows** in unknown physical pp0–55 when source-visible *page-start* red rubrics are excluded by the same rule; the next closest is 3463 (pp39–54). It is an exact original-source relation with a caveat: p53 ends with red13 and p54 begins a new red title. Thus original source-visible *chapter* boundaries split these sixteen framed pages in two. Joining them depends on their common border, a possible human clue with no explicit authored consumer. The previously documented **3316 = 3301+15** relation, and earlier exploratory 16-p15-cell ↔16-floral-page mapping, are related arithmetic observations, not independent proofs of intent.

Original p15 spiral, established as `|3301 − prime(F+1)|` for sixteen distinct Fibonacci indices:

```text
3299 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820  708 1206 4516
```

## Frozen original-cipher tests

Use exactly the 3299 titleless runes in original page/rune order. With zero-based positional addressing, the sixteen source values reduced modulo3299 select:

```text
0 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820 708 1206 1217
```

These original GP29 runes transliterate **`A-I-B-J-EA-E-EO-Y-O-J-TH-X-U-F-TH-F`**. No readable instruction or plaintext appears from this direct source-number pointer. The original image does not explicitly prescribe that addressing rule.

An independently motivated *complete* permutation uses two facts: **3299 is prime**, and **2 has multiplicative order 3298 modulo3299**. Specifically, 3298 factors as 2×17×97, and `2^(3298/q) mod3299` equals 3298, 1355, 83 for q=2,17,97 respectively. So `[0,1,2,4,...,2^3297 mod3299]` visits all 3299 rune positions exactly once; position0 is handled separately. The initial p15 Fibonacci-indexed prime is 2, and the p15 infinity ornament makes modular cycling a source-plausible exploration. The operation is **hypothetical**, and its inverse provides no historical validation.

Original source-order 3299-runic body has **21 adjacent equal-rune pairs, 814 distinct digraphs, mutual information 0.146249 nats**. The fixed primitive-root permutation has **124 equal pairs, 824 distinct digraphs, MI 0.129298 nats**. Against 3000 deterministic exact-inventory reshuffles, the transformed sequence has **MI upper-tail p=0.368877**, and equal-pair upper-tail **p=0.164945**. This full positional read is ordinary against the matched null and preserves the original near-uniform rune inventory. No native-GP plaintext was recovered.

## Decision

Retain **red3299 ↔ floral body minus two independently visible headings** as a possible original scope/key-length selector. Reject only the tested direct 16-address read and the source-motivated primitive-root transposition as plaintext-producing operations. Further work requires a source-selected **rune-identity-changing** inverse or a genuine original plaintext prediction. Avoid unsourced modulus-multiplier, phase, or stream-key shopping.

**Exact single runnable test file:** [`sims/lp2_p15_red3299_floral_register_sft.cjs`](../sims/lp2_p15_red3299_floral_register_sft.cjs). It reads `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-ink-annotations.json`, rederives 3299 uniqueness, checks the full p15 mathematical formula, proves exact permutation, reproduces direct readout and 3000 null draws.

Earlier distinct results: [original p15 formula](../results/lp2-p15-fibonacci-prime-spiral.md), [16 p15 pagewise prime-totient keys negative](lp2-p15-16value-to-floral16-prime-totient-gate.md), [source-visible chapter boundary atlas](lp2-global-original-visual-section-map.md).
