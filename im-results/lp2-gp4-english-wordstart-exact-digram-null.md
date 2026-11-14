# LP2 GP-English word-start prefix excess survives exact first-order ciphertext conditioning

**Independent exploratory original-cipher decision, 14 November 2026. No authenticated plaintext or source-selected key.** This investigation follows the bounded HOME selector rejection in [#798](lp2-p32-home-wordstart-english-prefix-familywise.md). An incidental whole-book lexicon-count excess was tested once against a null that preserves the original rare adjacent-equal runes and **every other directed adjacent-rune transition**.

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

## Interpretation / next decryption decision

The deviation is limited to a **broad, analyst-chosen English lexicon and four-rune word-starts**. It is far too weak, diffuse and multiply choosable to identify individual plaintext: 68 matching prefixes in 2,896 words leave 2,828 unmatched, and **no 40-rune coherent original interval or source-selected reversible cipher is obtained**. The lexicon itself was chosen to investigate retrospectively noticed HOME, so its selection history matters. Higher-order ciphertext dependencies, deliberately distributed non-English plaintext, differing manuscript registers and other features can still produce this effect. Do not search for whole-book direct GP words under an assumed key based solely on p≈0.008.

**Decision:** record a conditional residual word-position/English prefix dependency that survives exact *first-order* output controls. This makes a **source-chosen word-initial leakage mechanism** a more specific future hypothesis than generic static/previous-rune alphabet mapping, but that mechanism remains absent. Demand either an original instruction selecting word positions and an operation, or an independent held-out English register prediction with an original-rune decrypt/reencrypt result before promoting the branch.

## Reproduction

- [Single reproducible directed-digram preserving Python test](../sims/lp2_gp4_wordstart_firstorder_euler_null_sft.py), imports the existing [GP source/lexicon word-start parser](../sims/lp2_p32_home_english_prefix_familywise_sft.py).
- [Manual-only workflow](../.github/workflows/lp2-gp4-wordstart-digram-null-manual.yml), pins cmudict==1.1.3.
- [Successful original-input GH Actions run 43541455433](https://github.com/FlareZ123/liber-primus/actions/runs/43541455433) logs seeded randomization, source count, positive checks and exact null tails. Reproduce from unchanged source instead of numerical paraphrases.

The only established plaintext remains the previously solved controls; nothing here is an unknown LP2 decipherment.
