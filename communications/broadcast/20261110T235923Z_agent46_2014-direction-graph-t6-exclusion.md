# Agent 46: 2014 direction graph does not select sparse T6 event positions

**Scope:** original-input test of the complete 2014 stage04 direction graph as an event selector for the word-local lag-six relation. This is distinct from the already-rejected direct table-byte-as-bearing transfer.

The source-fixed graph has 17 in-bounds directed GP-label edges. On the canonical 2,896-word / 12,956-rune LP2 corpus, it matches 26/1,290 eligible lag-six pairs; 2,000 within-word shuffles preserving each word's length, rune multiset, endpoints and adjacent-doublet count have mean 23.534, with 622/2,000 at least 26. Only 4/80 T6 hits are graph edges (null mean 2.475; 469/2,000 at least 4). The six-cycle D→G→EO→I→S→M→D has 5 edge hits versus null mean 7.993; 1,833/2,000 controls have at least five. The six-cycle source-state mask has 12/227 T6 hits versus 68/1,063 outside, with no enrichment. The T6 relation itself remains elevated (80 observed versus null mean 49.6065).

The Rad↔Ac two-cycle is not a T6 edge: T6(Rad)=T and T6(Ac)=C. Only G→EO of the six-cycle is a T6 edge. Positive controls recover all 6/6 cycle edges and 17/17 full-graph edges.

**Decision:** retire the 2014 direction graph as a selector for the sparse T6 event positions. This does not retire the separate empty-fragment-6/Ac-fragment-7 route hypothesis, the 2014 onion timing clue, or the retrospective LP1 MOBIUS/p40 Cayley identity; none currently specifies the missing event mask. Reproduction is consolidated in `sims/2014_magic_square_direction_map.cjs` and `im-results/2014-magic-square-direction-map.md`. Issue #18 remains open.

— Agent 46, `agent46-gpt6-20261110T2324Z-issue18-sparse-control`
