# Opening cross motif: exact antiparallel shared-pad inverse

The original p0–2 scans share opposing 180° rotational triple-bar cross artwork. The [forward shared-pad gate](lp2-p0-p2-orthodox-cross-source-plate-gate.md) compares same-start pads. This experiment tests a distinct executable consequence of opposite orientation: a page starts consuming a common additive pad at its opposite physical end. The illustration alone does not establish pad reuse.

For each pair, align oriented page starts, with A forward/B reversed and vice versa. If C_A=P_A+K and C_B=P_B+K in GF29, P_A-P_B=C_A-C_B. The inverse considers every pad without enumerating 29^n possibilities. Whole printed words from the two oriented pages become interval variables; each lexical candidate implies an exact key substring. A wildcard costs one OOV and permits arbitrary key symbols. Page-edge fragments and overlap-cut words impose no constraint.

**Constructive exact algorithm:** the overlap graph of the two disjoint-interval families is a forest. Sweeping from left to right, every overlap edge introduced at a word start joins a previously unseen interval to at most one active opposite interval; simultaneous starts form a new component. Hence no cycle. For each vertex, compute a minimum-cost subtree assignment for every lexical key substring and wildcard. For every child, index candidates by the substring on its shared interval. A fixed parent candidate uses the cheapest identical substring or child wildcard; a wildcard parent can independently select each child's cheapest candidate because its child overlap intervals are disjoint. The parent overlap is also disjoint from all child overlaps. This proves the optimum over the entire finite dictionary plus unconstrained OOV options. A backtrace constructs actual common pads and plaintexts; every witness re-encrypts both streams and independently recounts its exact OOV cost. This replaces the slower per-rune product-trie enumeration; the initial full product-trie run timed out without results. Three independent 29^2 exhaustive tiny controls agree with the forest solver.

| Physical pages | Directions | Aligned runes | Complete scored words | Original min OOV | Four common-pad plants | Four independent-pad plants |
|---|---|---:|---:|---:|---|---|
| 0/1 | FR | 262 | 58+61 | 16 | 1, 2, 3, 3 | 12, 16, 15, 14 |
| 0/1 | RF | 262 | 58+60 | 13 | 0, 3, 1, 2 | 12, 15, 12, 12 |
| 0/2 | FR | 201 | 45+37 | 13 | 3, 2, 3, 0 | 12, 12, 16, 13 |
| 0/2 | RF | 201 | 45+37 | 14 | 4, 2, 2, 1 | 15, 16, 17, 15 |
| 1/2 | FR | 201 | 45+37 | 16 | 2, 1, 3, 1 | 16, 16, 14, 14 |
| 1/2 | RF | 201 | 47+37 | 14 | 3, 4, 2, 1 | 13, 14, 14, 14 |

All six original alignments require more lexical exceptions than every corresponding matched common-pad control. This weighs against the antiparallel common-pad model within this register; it is not a universal cipher exclusion. The 24 common-pad and 24 independent-pad controls sample Gibran words by original lengths, falling back to lexicon forms for unavailable lengths. They are layout-matched plants, not continuous literary prose. Their true OOV count is checked as an upper bound on the inverse optimum. No language-model score or uncharged search over positions is used. Corrected source punctuation and 29061 distinct GP29 forms. The [raw output](lp2-p0-p2-antiparallel-sharedpad-output.json) pins the input blobs, exact scores, forest sizes, and arbitrary optimum witnesses; those witnesses are not authenticated plaintext.

Neither opposite-sign pad, independent offsets, F-hold drift nor arbitrary segmentation is tested. No unknown plaintext or authentic key established. Do not extend the phase family without independent source evidence. The forest method can be reused for exact partial-word overlap inverse problems with two internally disjoint interval families.

Reproduce: `node sims/lp2_p0_p2_antiparallel_sharedpad_sft.cjs` from repository root. Core executed in connector V8; native Node wrapper not independently run.
