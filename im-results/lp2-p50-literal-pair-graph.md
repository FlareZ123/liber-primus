# P50 literal two-character transition graph — Director #3247

## Decision

**Bounded negative.** Reading each of the 256 printed p49–51 table tokens literally as a directed edge from its first character to its second does **not** reveal an exact walk, Euler structure, reciprocal reflection grammar, or anomalous printed ordering. The graph gate in #3247 therefore fails. Per the issue contract, no p49/p51 cipher receiver was instantiated and no key/plaintext is claimed.

This test is radix-free: it uses the exact case-sensitive characters and 32×8 printed order from `resources/liber-primus/base60-grid.json` (blob `4698c0806e6bab06a39cfbc3c3283b862de58b35`) but never converts a token to a number.

## Exact graph structure

The 256 edge occurrences use 59 literal character vertices. Only the five glyphs `0,1,2,3,4` ever occur as first characters, so only those five have nonzero out-degree; **54/59 vertices are sink-only**. Only 17/256 edges even land back in `0..4`, so a directed walk can continue only through that small subset and terminates immediately on every other character.

Tarjan decomposition has a single nontrivial SCC, **{0,4}**; all other 57 SCCs are singletons. The degree imbalances are far outside the ±1 condition for an Euler trail (source deltas are +55,+55,+63,+53,+13 for 0..4), so neither an Euler trail nor Euler cycle exists.

Repeated literal edges are ordinary duplicates rather than a traversal grammar: 92 edge types occur once, 49 twice, 14 three times, and 6 four times (161 distinct tokens total; maximum multiplicity 4).

These global facts are largely consequences of the first-character range and therefore are not authorship evidence by themselves.

## Printed-order and reflection gate

Across the 224 within-row adjacencies there are exactly **3** forward joins:

- row 1 col 6: `33 → 3W`;
- row 26 col 3: `11 → 1A`;
- row 31 col 4: `30 → 0a`.

No row contains a walk longer than two edges and no row boundary continues a forward walk. Reversing edge direction yields only one within-row join (`47,04`) and one row-boundary join (`0X | 00`). Across the 128 horizontally mirrored cell pairs there are **zero reciprocal edges** and **zero equal-token pairs**. Thus the source-visible left/right reflection does not turn any printed row into an inverse/reversed edge walk.

## Exact null and calibration

The null is a uniform permutation of the **exact observed 256 token occurrences** over the fixed 32×8 cells. It preserves the token multiset, repeated-edge classes, first/second-character marginals, and row geometry; only the printed placement is randomized.

From all 256×255 ordered distinct occurrence pairs, 833 are forward-compatible, so the exact expected number of within-row joins is

`224 × 833 / (256×255) = 2.8583333333`.

The observed value is 3. The corresponding reverse expectation is identical. Exact expectations for the 31 row boundaries are 0.3955729167 joins in either direction; reciprocal mirrored-pair expectation is 0.0156862745 and equal mirrored-pair expectation is 0.4980392157.

A deterministic 100,000-permutation calibration (xorshift32 seed `0x3247c0de`) gives two-sided randomization p-values:

| statistic | observed | exact expectation | p(two-sided) |
|---|---:|---:|---:|
| forward within-row joins | 3 | 2.85833 | 1.0000 |
| reverse within-row joins | 1 | 2.85833 | 0.37996 |
| forward row-boundary joins | 0 | 0.39557 | 1.0000 |
| reverse row-boundary joins | 1 | 0.39557 | 0.66671 |
| reciprocal mirrored pairs | 0 | 0.01569 | 1.0000 |
| equal mirrored pairs | 0 | 0.49804 | 1.0000 |

Nothing ordering-specific is exceptional, and there is no low-description-length exact structure selecting a traversal or operand.

## Reproduction and scope

Run `node sims/lp2_p50_literal_pair_graph_sft.cjs > /tmp/p50-pair-graph.json`. The frozen output is `im-results/lp2-p50-literal-pair-graph.json`.

This closes only the **literal ordered-pair graph** interpretation required by #3247. It does not alter the unresolved base59/base60 numeric ambiguity, prior polynomial/codeword observations, or other independently motivated p50 operations. It specifically rules out using the printed two-character token syntax itself as the missing directed-walk instruction unless a future first-party clue supplies a different operation not present in this model.
