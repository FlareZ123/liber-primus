# LP2 p50 base-60 functional graph: p0/p8 size match and receiver audit

**Status:** intermediate structural observation; no plaintext recovered. Do not promote this branch to an established decryption.

## Question

Does the canonical base-60 reading of the 32×8 pp.49–51 table define a directed functional graph whose cycles/trees explain the p0 red heading and p8 black body, and can a source-selected graph operation decrypt p8?

The hypothesis is motivated by three independent source features:

- The 2016 signed Cicada message says that the manuscript's words are a map and its numbers a direction (see the existing historical/source analysis).
- p57 says “SHED YOUR CIRCUMFERENCES”; the pp.49–51 panel has tree imagery. The already-established geometric reading of that instruction is the 76-cell perimeter / 180-cell interior. This graph-theoretic reading is a separate alternative, not a replacement for that better source-grounded partition.
- The p0 red heading has 13 runes; p8 has 243 black-body runes; the p50 panel has 256 cells.

## Exact graph observation

Let f(i) be the canonical base-60 value in row-major cell i, for i=0..255. Since every decoded value is in 0..255, this defines a functional digraph without reduction or clipping.

Its complete cycle decomposition is:

- 11-cycle: 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247 → 192 → 0
- 2-cycle: 158 ↔ 249

Thus there are **13 cyclic vertices** and **243 noncyclic vertices**. Their two basins have sizes **252** and **4** respectively. Removing the cyclic vertices leaves 243 vertices in 15 rooted in-trees.

This gives an exact count alignment:

- p0 red heading: 13 runes;
- p8 black body: 243 runes;
- p50 table: 256 cells = 13 + 243.

The p0 heading's two printed words both begin with the same GP29 rune (index 15). A possible, but unverified, assignment is to map those two initials to the 2-cycle and the remaining 11 heading runes to the 11-cycle. The unique zero edge on the 11-cycle is 192 → 0; p0 has a zero-valued rune at the end of its first word, which supplies a possible rotation selector. These alignments are hypotheses, not independent proof that the graph is the intended cipher.

## How surprising is the cycle structure?

A C++17 null simulation generated one million row-wise random maps by sampling eight distinct destinations uniformly from 0..255 for each of the 32 rows. This preserves the observed within-row no-duplicate property.

| Event | Count | Estimated probability |
|---|---:|---:|
| Exactly two cycles of lengths 2 and 11 | 1,645 / 1,000,000 | 0.001645 |
| Exactly two cycles of lengths 2 and 11, with basin sizes 4 and 252 | 128 / 1,000,000 | 0.000128 |
| Exactly 13 cyclic vertices, regardless of cycle partition | 36,766 / 1,000,000 | 0.036766 |

The 2+11 cycle partition and 4+252 basin split are unusual under this particular null, but the null is not a proof of design intent and does not account for every property of the table. These are post-discovery descriptive frequencies, not familywise-adjusted p-values. The 13-vertex count alone is not especially rare.

## Competing radix reading

The printed tokens contain **zero occurrences of lowercase f**. Under the 59-symbol alphabet obtained by omitting that unused digit, the same table defines a different map with one self-loop at node 189. Its rooted tree has exact subtrees of sizes 121 at node 58 and 76 at node 244, matching the p32 and p55 rune counts already documented in the existing base-59 research. The printed tape does not independently select base 59 or base 60; the base-59 subtree correspondence remains a stronger competing structure than the untested base-60 count match.

Removing the 13 base-60 cycle vertices from the base-59 parent tree leaves 243 nodes in 11 rooted components, with sizes [1, 1, 4, 5, 6, 14, 16, 16, 23, 36, 121]. This dual-radix construction is reproducible, but its existence alone does not select a cipher.

## Receiver tests

The exact 243-node complement was aligned with p8's 243 black-body runes in original address order. A GP29 trigram screen was trained on the first two-thirds of the solved native sections and evaluated on held-out 243-rune windows (28 controls). The weakest held-out native window scored **−8.584**; p8's untransformed body scored approximately **−10.58**.

The following source-motivated, finite families did not produce language:

1. **Forest transposition:** BFS, preorder and postorder; roots ordered by address, reverse address, cycle order or reverse cycle order; children ascending/descending; both mapping directions. Best score: **−10.507**.
2. **13-period cycle key:** cycle-node labels, parent labels or edge differences, with rotations, reversal, both additive signs, and F-hold/F-consume clocks. Best score: **−10.402**.
3. **Graph path-difference:** assign p0's 13 red runes to the 13 base-60 cycle vertices (the two repeated word initials to the 2-cycle; the other 11 to the 11-cycle, with the zero-edge alignment), assign p8's 243 runes to the remaining vertices, and invert C[i] = P[i] + C[parent(i)] by P[i] = C[i] − C[parent(i)] (mod 29). The p8 output remains nonlinguistic (about **−10.59**).
4. **Dual-radix path-difference:** use the base-60 cycle vertices as the 13 special positions and the base-59 map as the parent relation on the remaining 243. The p8 output remains nonlinguistic (about **−10.53**).
5. **Subtree-sum inverse:** the direct base-60 noncycle forest with p8 values assigned in address order also fails the native-text screen.

These scores are screening evidence, not a proof that no more elaborate or independently selected graph receiver exists. They do retire the tested direct transposition and elementary additive/tree-difference readings; do not repeat them with cosmetic parameter changes.

## Decision

Preserve the 13/243 functional-graph partition as a potentially meaningful structural clue. It is not a decryption and should not displace the base-59 p32/p55 subtree route or the unresolved radix question. The base-60 branch should be reopened only if a new source clue selects a different, reversible receiver or independently fixes the mapping from p0/p8 symbols to graph vertices. Further generic traversal, additive-pad or period-13 sweeps are not justified.

## Reproduction

From the repository root:

    node sims/lp2_p50_base60_cycle_partition_sft.cjs
    g++ -O3 -std=c++17 sims/lp2_p50_base60_cycle_null.cpp -o /tmp/lp50-null
    /tmp/lp50-null 1000000

Inputs are the repository's base60-grid.json, lp2-corpus.json, and relikd-solved-gp29-native-v1.json. The C++ null uses fixed seed 20261125; counts reproduce exactly for the stated sample size and implementation.

Related current synthesis: results/README.md, section “C. p49–51 numeric panel and historical squares/BASE29”; existing competing base-59 analysis: im-results/lp2-p50-base59-p32-p55-nested-subtree-source-gate.md; existing base-60 direct-pad audit: im-results/lp2-p50-base60-subtree-bytepad-sft.md.
