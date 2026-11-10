# LP2 lag-five ᛋ echo: exact marginal bound on memoryless English-S passthrough

**Evidence class (2026-11-10): reproducible, source-conditioned mechanism constraint.** No recovered unknown LP2 plaintext, cipher key or destination. The previously established within-word lag-five `ᛋ` excess has a strong new testable implication: it cannot easily arise by *independently* passing through a fraction of the source text's English S runes while still matching the observed ciphertext S frequency. A pair-aware preservation channel can reproduce it in a planted control.

## Fixed original signal and independent source

The canonical 55 unsolved rune-bearing page segments contain **12,956 runes** and **2,896 whole rune words**, retaining words crossing line and page wraps. Original LP2 ciphertext has exactly **434** GP `ᛋ` (index 15), **3.349799%** of symbols, including **11** pairs of `ᛋ` separated by exactly five positions *inside one word*. Previous [lag-five inventory and corrected permutation evidence](lag5-rune-specific-echo.md) established the original excess across 29 rune symbols; the present attack asks what sort of English-letter leakage could produce it. It does not relabel the selected rune or lag after seeing the result.

Encode the first 300,000 characters of the independently sourced Shakespeare control into Gematria Primus (including the same letter normalization and digraph collapsing used in the existing [English GP probe](../sims/relative_key_english_probe.cjs)). The corpus produces 55,407 GP words. For every original LP2 word of length L, sample an independent source word of exactly L GP symbols from this Shakespeare corpus. All LP2 observed word-length categories have available source examples. The resulting exact, word-length-conditioned source moments are:

| Feature in 12,956 hypothetical source runes | Expected count |
| --- | ---: |
| GP S occurrences | **927.650968** (7.160011%) |
| Within-word distance-five pairs with S at both ends | **17.227398** |
| Within-word distance-five pairs with S at exactly one end | **396.883782** |
| Within-word distance-five pairs with S at neither end | **1,690.888820** |

These disjoint pair categories total 2,105, matching the original number of eligible word-internal distance-five comparisons.

## Parameter-free upper bound after fixing the observed S marginal

Let `r = Pr(cipher S | source S)` denote independently retained source S, and `f = Pr(cipher S | source is not S)` denote independent false-S generation. Here `r` and `f` are *fixed, memoryless* channel probabilities shared across all words and positions, with independently sampled output status conditional on each source symbol.

Matching the manuscript's exact observed ciphertext S marginal in expectation requires

```
r*(927.650968/12956) + f*(1-927.650968/12956) = 434/12956.
```

With valid probabilities `0 ≤ r,f ≤ 1`, the feasible retention interval is `0 ≤ r ≤ 0.4678483772`, with `f = (434/12956 - r*(927.650968/12956))/(1-927.650968/12956)`. The expected number of lag-five S pairs is therefore exactly

```
E[N_S5] = 17.227398*r*r
        + 396.883782*r*f
        + 1690.888820*f*f.
```

This quadratic's constrained maximum over the **entire feasible parameter range** is **3.77076917 pairs**, achieved at `r = 0.4678483772`, `f = 0`. The minimum-retention endpoint has expectation 2.2013164. Against the maximum, the **11** original LP2 pairs are about 2.92 times as numerous as the model expectation. This is a conditional model failure, not an independent unconditional p-value for every source register or alternative cipher process.

## Fixed-S-count Monte Carlo and a pair-aware positive

Under the favorable `f=0` endpoint, draw 2,896 independently sampled Shakespeare words with *exactly the original word lengths* in each trial. Select exactly **434 source-S sites uniformly without replacement**, and output S at precisely those sites. This conditions on the **actual total S count**, rather than allowing random marginal variation. Across **12,000 deterministic replicates**, seed `0x51ca5e55`:

| Outcome | Value |
| --- | ---: |
| Average distance-five S-pairs | **3.77125** |
| Standard deviation | **1.91588** |
| Draws with at least original 11 pairs | **26 / 12,000** |
| Endpoint conditional upper-tail estimate | **27 / 12,001 = 0.00224981** |
| Largest simulated count | **15** |

The model-matched positive explicitly **protects both S endpoints of every source S-at-distance-five pair** while selecting additional source S sites to maintain exactly the same 434-site ciphertext budget. In its deterministic held-out plant it preserves 15 distance-five S-pairs with only 434 emitted S; it demonstrates how *dependent* transmission of paired source positions can produce the target phenomenon. This is a construction demonstrating feasibility, not evidence the manuscript used it or an actual source/key recovery.

## Implication, scope and reproducibility

A fixed, per-rune passthrough process for English-like S, independent across positions and calibrated to the source's rune marginal, faces a strong quantitative obstacle at precisely the observed lag-five pair statistic. This changes the mechanism shortlist: preserving *relationships* at distance five, history-dependent transformation, a different plaintext register, or other encoding rules remain possible. An ordinary fixed-fraction letter leakage model cannot be promoted on the strength of the 11 pair coincidences alone. Any stronger cipher proposal must predict a reversible key/state and independently authenticate unknown plaintext.

Code: [`sims/lag5_S_passthrough_channel.cjs`](../sims/lag5_S_passthrough_channel.cjs) uses the committed English reference and original LP2 transcription, imports the existing GP encoder/word parser, asserts 434 original S and 11 original distance-five pairs, calculates the exact quadratic maximum, simulates the fixed-count null, and checks the pair-aware synthetic positive. [Manual-only successful CI run 42767338930](https://github.com/FlareZ123/liber-primus/actions/runs/42767338930) (Node.js 22), source SHA-256 `8a73136f699d7ed17260b916b0797fafdfe6213bbbcf1914ba5327134b7c863e`. The experiment is finite and completed. This report complements the earlier [29-rune/174-hypothesis word-shuffle test](lag5-rune-specific-echo.md), which answers a different conditional question and is not superseded.
