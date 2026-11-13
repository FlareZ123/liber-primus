# Exact 16-fold Kautz-edge capacity fails on original LP2

**Classification (Agent 18, 13 November 2026):** source-exact, key-independent exclusion of **one specific balanced predecessor-exclusion construction**, with a matching-length positive plant. **No unknown plaintext, key, decipherment, or destination recovered.**

## Clue and candidate mechanism

Physical LP2 pp0–55 contain **12,956** GP29 rune symbols on **55 rune-bearing pages**. Of their **12,901 within-page adjacent transitions**, only **86** repeat a rune. Such a strong no-repeat bias makes an Eulerian/Kautz construction on the complete directed graph of the 29 GP rune states a plausible *mechanism to test*: each state has the other 28 symbols as outgoing targets, for exactly **29 × 28 = 812 nonself directed edges**.

A particularly economical, reversible-capacity proposal is **16 visits to each nonself directed edge**, traversed in an unknown, potentially keyed Eulerian order. Its full continuous trail has **812 × 16 + 1 = 12,993** rune positions, close to the original 12,956-symbol budget. We grant arbitrary cropping, any secret global rune-alphabet bijection, and any number of inserted **self-loop holds** (duplicating the immediately preceding rune). A hold can explain one of the 86 adjacent repeats without changing the off-diagonal edge multiset. Neither the integer 16 nor this cipher family is selected by a recovered Cicada instruction; the proximity of the length totals is a motivation for an explicit test, not authorship evidence.

## Exact invariant against the original ciphertext

In any such 16-fold balanced walk, **every particular nonself rune pair can occur at most 16 times**, regardless of the traversal order. Cropping a segment cannot increase a count. Inserting duplicate-previous-symbol holds adds a diagonal pair without adding any nonself pair. A secret stationary 29-symbol permutation merely relabels the 812 edge-count slots, preserving their frequency multiset and maximum. This argument requires no hypothesized plaintext register or language model.

The original **within-page** directed-pair inventory alone contradicts the bound:

| Source-exact measurement | Original unknown LP2 | Strict 16-fold balanced model |
| --- | ---: | ---: |
| Rune positions | 12,956 | Arbitrary excerpt / hold extension; plant matches 12,956 |
| Physical rune-bearing pages | 55 | Plant matches 55 page lengths |
| Within-page transitions | 12,901 | Plant matches 12,901 |
| Within-page repeated pairs | 86 | Plant matches 86 |
| Off-diagonal pairs | 12,815 | Capacity invariant |
| Distinct directed nonself edge types | 812 possible | 812 possible |
| **Largest multiplicity of one off-diagonal pair** | **29** | **≤16** |
| **Number of distinct edges exceeding multiplicity 16** | **339** | **0** |
| Smallest multiplicity of an off-diagonal pair | **5** | No required lower bound after cropping |

Two independently observed top-multiplicity pairs are GP indices **(2,0)**, `TH → F`, and **(6,20)**, `G → L`, each occurring **29 times** within original physical pages. More than 40% of the 812 possible directed nonself pair types exceed the proposed 16-visit capacity. Because all counts exclude page-bridging transitions, the exclusion does not assume that the text is continuous across the runeless p50 numeric-table page.

## Matched positive control and reproducibility

The [CommonJS single-file test](../sims/lp2_balanced_kautz_edge_capacity_sft.cjs) builds a deterministic 812-edge Euler circuit on the 29-state loop-free complete digraph, concatenates **16** copies, crops a 12,870-symbol source prefix, and inserts **86** duplicate-previous-symbol holds at deterministically spaced locations that avoid physical page boundaries. This gives **exactly 12,956 symbols**, the original **55 page lengths**, **12,901 within-page pairs**, **86 within-page repeats**, **maximum 16 nonself-pair occurrences**, and **zero edges over capacity**. It asserts both the plant and all source counts and prints the original witness pairs and complete count histogram. Run `node sims/lp2_balanced_kautz_edge_capacity_sft.cjs` under Node.js 20+ from the repository root. The original input is the committed [LP2 GP29 corpus](../resources/liber-primus/lp2-corpus.json); no glyphs or page boundaries are changed.

The existing [bigram-preserving Eulerian null](../sims/bigram_eulerian_null.cjs) randomizes *the observed* directed-edge inventory to test longer recurrences; this test instead rules out an *equal-multiplicity input edge inventory*. They answer different conditional questions. The 86 original doublets and near-uniform off-diagonal frequencies remain consistent with multiple distinct stateful processes; this exact exclusion does not identify any one of them.

## Decision boundary

**Retire the literal 16-fold edge-balanced GP29 trail with optional predecessor-copy holds and a globally fixed secret rune relabeling.** Arbitrarily keying its edge visitation order cannot fix the **339** original overcapacity pairs. This does **not** exclude a nonbalanced no-self-loop random walk, adaptive or position-varying codebooks, separate full edge budgets after unobserved resets, arbitrary stateful ciphers, or a recovered external key. In particular the original rare doublets plus ordinary off-diagonal variability do not identify a decipherment rule.

The next causally meaningful breakthrough would be an original-source instruction that specifies the plaintext/key/edge-selection process and predicts an untouched ciphertext interval. Further tuning of balanced-edge counts to this corpus would only make the mechanism unconstrained.
