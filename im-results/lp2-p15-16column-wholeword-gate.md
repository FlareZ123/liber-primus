# P15 numerical square: sixteen-column whole-word source readout

**Agent 17, 13 November 2026. Status: bounded original-input negative, no recovered unknown plaintext or key.** This investigation tests an alternative to the exhausted eight-column word-transposition route using an *independent original visual cue*: physical LP2 p15 (archive scan `32.jpg`) prints a **4×4 numerical square**. The complete unknown manuscript contains **2,896 source-printed words**, exactly **16 × 181** after preserving cross-page continuations. This makes a 16-column whole-word arrangement a finite candidate that a contemporary solver might reasonably attempt. The numbers supply a *visible column-order candidate* by ascending rank, while a secondary search allows an unknown 16-column key without scanning impossible 16! permutations.

The entire 12,956-rune ciphertext, and the **32 words continued over page boundaries**, are unmodified. The original parser joins printed lines/pages and splits at original word punctuation. The source word-length sequence has 2,896 entries, its original nine-category adjacent-length Pearson chi-square is **68.27318638**, and the square in printed row-major order is

```
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

The value **3299** is red in the original image. No inscription selects **ascending numerical rank** as a cryptographic key, so it is a plausible frozen experiment, not an authenticated decoder. Its sixteen physical column indices are **[14,13,15,11,7,3,2,1,0,4,8,9,10,6,5,12]**. Each proposed inverse reads the original source as sixteen consecutive columns of 181 whole words and emits 181 rows using that column order. This is exactly reversible and never splits or alters a printed word.

## Fixed, source-shaped inverses

The evaluation is a nine-class Pearson test of word-length adjacency (lengths 1–8, and 9+). For each proposed output, the null shuffles the **same 2,896 original word lengths** before applying exactly the same transformation. This preserves its exact marginal word-length histogram. The deterministic source run used 1,200 Fisher–Yates shuffles, xorshift32 seed `0x33011681`.

| Sixteen-column read order | Original chi-square | Null mean chi-square | Nulls scoring at least as high | Upper-tail with +1 |
| --- | ---: | ---: | ---: | ---: |
| Printed row-major | 51.45112 | 63.78644 | 1045/1200 | 0.87094 |
| Ascending p15 number rank | 74.44539 | 63.50972 | 186/1200 | 0.15570 |
| Descending p15 number rank | 73.08858 | 63.81772 | 240/1200 | 0.20067 |
| Physical 4×4 column-major | 71.04823 | 63.75063 | 290/1200 | 0.24230 |
| Reversed physical 4×4 column-major | 65.19042 | 63.54539 | 505/1200 | 0.42132 |

No source-selected reading gives a distinguishing language-like signal. The exact original statistic is also lower under the literal printed inverse than under the unchanged text.

## Unknown-column-key test without 16! enumeration

To consider a *hidden* 16-column ordering without simply trying an invented square convention, a **9×9 native English word-length adjacency log-likelihood model** was trained on **19** complete Shakespeare windows of 2,896 words, each histogram-rank-matched to the original unsolved word lengths. The model has no access to their original adjacency order during training. For any candidate column pair `a,b`, sum its 181 within-row learned adjacency weights. A Held–Karp subset dynamic program then finds the **globally maximal Hamiltonian path over all 16! column orderings**, for this additive *within-row* score. The single 180-row boundary-wrap contribution (from last to first column in the next row) is added after this optimization. Therefore it does **not claim** the exact globally optimal full 2,895-adjacency cycle.

The original path-optimal order is **[15,12,11,6,7,4,8,13,10,5,1,9,0,3,2,14]**. Its within-row path score is **8.09125370** and its score including row-wrap is **6.98368887**. Under **60 independently shuffled original exact-histogram tapes**, the *identical optimized-path decoder* gives a null median **15.49329**; **59/60** shuffled controls outrank the original (upper-tail **60/61 = 0.98361**). A normal native-word source control encoded under the original p15 square-rank order is restored exactly by the direct inverse; the source-model and code also run a native-plant optimizer.

**Decision:** The p15 4×4 visual source plus the exactly fitting sixteen-column word count does not unlock a readable original order through the literal, numerical-rank, or word-length-optimized whole-word arrangements tested here. The exact word count divisibility alone supplies no plaintext. This result is separate from the earlier complete eight-column permutation study; it should not be generalized to arbitrary word rearrangements, stateful ciphers, or an actual p15 key that has not been independently identified.

**Reproduce:** [single runnable CommonJS/Node 22 original-input test](../sims/lp2_p15_16column_wholeword_sft.cjs). The script checks the complete source word count and prior exact original statistic, all frozen source-shaped output counts, the Held–Karp optimum, the matching nulls, a complete columnar round-trip, and a native-GP word-length plant.
