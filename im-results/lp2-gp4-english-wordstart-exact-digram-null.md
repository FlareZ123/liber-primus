# LP2 GP-English word-start prefix excess under first-order and exact full-stream phase controls

**Independent exploratory original-cipher decision, 14 November 2026. No authenticated plaintext or source-selected key.** This investigation follows the bounded HOME selector rejection in [#798](lp2-p32-home-wordstart-english-prefix-familywise.md). An incidental whole-book lexicon-count excess was tested against two independent source-preserving descriptions: an exact-digram-preserving random-trail null, then a **finite exhaustive 12,956-phase test that does not change a single ciphertext rune or original n-gram**. This second result distinguishes mere ciphertext 4-gram inventory from unusual placement of printed word starts.

## Source-locked outcome

Across all **2,896 genuine printed word starts** of physical LP2 pp0–55 (12,956 runes), exactly **68** starts share their first **four** GP29 symbols with a word in the frozen English cmudict-1.1.3 lexicon. The lexicon is fixed in the predecessor HOME task, before this experiment; source orthography folds K/Q to C, V to U, Z to S, and greedily maps TH/NG/EO/OE/AE/IA/EA to original GP digraph runes. Thus this control was not tuned to achieve 68 hits.

With exactly **2,500** first-order-preserving random Eulerian trails on every source page, the null has **50.8028** such four-rune word-start matches on average (minimum 25, maximum 75). Exactly **20/2,500** synthetic first-order-matched books produce **at least 68** matches, giving a plus-one exploratory Monte Carlo tail **p≈0.008397**. Therefore a per-page first-order transition imbalance, including the severe anti-repeat pattern, **does not by itself account for this particular broad GP-English prefix count** under this finite random-trail sampler.

The *specific* post-period HOME hypothesis remains negative: the source has **six** English-looking four-rune prefixes at the 174 complete word starts immediately after periods; the directed-digram null has mean **2.8812**, and **175/2,500** replicates match at least six (p≈**0.07037**). The selection-corrected original HOME prefix-length familywise null is approximately **0.9456**, as separately established. Do **not** promote p32 HOMEX to an authenticated word-map start.

## Exactly what the stronger control holds fixed

- Input: unchanged original GP29 rune arrays (physical p50 has no runes) and original punctuation/word-start coordinates. The canonical source parser retains **32 words that cross original page breaks**; the whole-book total is **2,896**.
- For each page, construct the directed multigraph whose 29 vertices are GP runes and whose edges are **all adjacent pairs of runes on that page, including across printed word breaks**. Randomize each vertex's outgoing edge order using Python RNG seed **33015581** and traverse with Hierholzer's Eulerian-trail algorithm. Each output has the **identical exact directed 29×29 adjacency count matrix**, initial/end rune and page rune multiset as its own original page. Words and stops stay in their original printed positions, as do the 32 authentic page-spanning word starts.
- Native controls assert that a separate small path preserves its precise directed digrams across 20 randomizations and that 5 actual original pages preserve the entire digram histogram. For the first three whole-book samples, all 55 pages' original pair matrices are verified exactly.
- Sampling method note: outgoing-edge permutations with Hierholzer produce valid conditioned trails. **Uniformity over all distinct Eulerian trails has not been proven**, so the quoted numbers are an exploratory algorithm-conditioned Monte Carlo tail, not a universal design p-value.

| Fixed statistic | Original | Exact-digram-conditioned null |
| --- | ---: | --- |
| Four-rune English-lexicon GP word starts, all 2,896 original words | **68** | mean **50.8028**, 20/2,500 ≥68, p=**0.008397** |
| Four-rune matches at 174 post-period original word starts | **6** | mean **2.8812**, 175/2,500 ≥6, p=**0.070372** |
| Recovered unknown LP2 plaintext runes | **0** | none |

## Exact original-cipher n-gram and page-wide phase control

The same predeclared **cmudict-1.1.3 English/GP29 four-rune prefix** wordstart statistic was now tested without generating new rune strings. Concatenate all 55 original unknown rune-bearing page streams into their untouched **12,956-rune** sequence. There are exactly **418** GP-English-compatible four-rune windows at any possible circular position in this unchanged stream. Of the authentic 2,896 original printed words, **1,645** have at least four original runes; of the 174 period-following words, **94** have at least four runes. The source has **68** and **6** four-rune lexicon matches at these two frozen sets of word starts respectively.

Hold the entire original rune stream and its complete higher-order n-gram inventories fixed. Evaluate **every one of the 12,956 possible cyclic shifts** of its alignment to the fixed original full-word-start masks, *without any random generator or fitted key*. Under this exact finite circular-phase reference:

| Fixed GP4 word-start alignment statistic | Actual phase 0 | Full 12,956-phase exact reference |
| --- | ---: | --- |
| Four-rune English prefixes at all 1,645 eligible true printed word starts | **68** | mean **53.0727**; **193/12,956** alignments ≥68, exact tail **0.01489657** |
| Four-rune matches at 94 eligible post-period starts | **6** | mean **3.0327**; **1,043/12,956** alignments ≥6, exact tail **0.08050324** |
| Maximum all-words count across arbitrary rotations | **76** | Actual original orientation is **below fifteen distinct high-scoring phase candidates** |
| Total four-rune English-compatible windows anywhere in original ciphertext | **418** | Exactly identical at all circular phases |

This exact alignment reference controls *all* intrinsic ciphertext four-rune and longer n-gram correlations that page-shuffling or a first-order Markov model would destroy. The all-word prefix excess therefore reflects a modest **alignment** of original printed word-start coordinates with these English-looking fourgrams, conditional on this already-analyst-selected lexicon. The full manuscript has no resulting original-rune plaintext interval.

**Limits:** Circularly rephasing the entire stream changes which source page boundaries and initial/final page runes the strings align with; three end-to-start fourgram windows are synthetic wraparound. The exact tail is valid for this **specific finite circular-phase reference** and does not address arbitrary keying, per-page reset ciphers, or the post-hoc choice of lexicon/prefix length. A 0.0149 alignment result is insufficient to identify a readable word or select a reversible original-cipher operation.

[Source-exact global-phase SFT](../sims/lp2_wordstart_gp4_exact_global_phase_sft.py) · [Manual-only workflow](../.github/workflows/lp2-wordstart-gp4-exact-global-phase-manual.yml) · [Successful exact exhaustive run 43542487352](https://github.com/FlareZ123/liber-primus/actions/runs/43542487352). An initial preflight run 43542424156 stopped at an unnecessarily strict post-period eligible-count assertion before the comparison; the final run is the actual tested evidence.

## Interpretation / next decryption decision

The deviation is limited to a **broad, analyst-chosen English lexicon and four-rune word-starts**. It is far too weak, diffuse and multiply choosable to identify individual plaintext: 68 matching prefixes in 2,896 words leave 2,828 unmatched, and **no 40-rune coherent original interval or source-selected reversible cipher is obtained**. The lexicon itself was chosen to investigate retrospectively noticed HOME, so its selection history matters. Higher-order ciphertext dependencies, deliberately distributed non-English plaintext, differing manuscript registers and other features can still produce this effect. Do not search for whole-book direct GP words under an assumed key based solely on p≈0.008.

**Decision:** record a modest source-boundary/English prefix alignment anomaly that survives two distinct fixed controls: exact first-order transition conditioning and exhaustive rephasing of the completely unchanged original ciphertext. This makes a **source-chosen word-initial leakage mechanism** a more specific future hypothesis than generic static/previous-rune alphabet mapping, but that mechanism remains absent. Demand either an original instruction selecting word positions and an operation, or an independent held-out English register prediction with an original-rune decrypt/reencrypt result before promoting the branch.

## Reproduction

- [Single reproducible directed-digram preserving Python test](../sims/lp2_gp4_wordstart_firstorder_euler_null_sft.py), imports the existing [GP source/lexicon word-start parser](../sims/lp2_p32_home_english_prefix_familywise_sft.py).
- [Manual-only workflow](../.github/workflows/lp2-gp4-wordstart-digram-null-manual.yml), pins cmudict==1.1.3.
- [Successful original-input GH Actions run 43541455433](https://github.com/FlareZ123/liber-primus/actions/runs/43541455433) logs seeded randomization, source count, positive checks and exact null tails. Reproduce from unchanged source instead of numerical paraphrases.

The only established plaintext remains the previously solved controls; nothing here is an unknown LP2 decipherment.
