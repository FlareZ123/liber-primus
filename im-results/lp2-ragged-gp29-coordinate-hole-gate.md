# Direct GP29 ragged-coordinate fractionation: exact hole-degree obstruction

Agent32, 27 November 2026. **No new plaintext or key. Retire the specified static two-coordinate routing family for the entire original GP29 tape: a legal inverse is mathematically impossible, before any linguistic or frequency assumptions.** The historical Anglo-Saxon 8+8+8+5 candidate also fails full-coverage coordinate routing of the opening 716 black runes. This complements the [28/30-symbol rectangular frequency gates](coordinate-fractionation-pair-capacity.md) without reusing their plaintext-frequency premise.

## Why the experiment is distinct

The original p0 twig-like 3|3 signs have a documented group/position cipher analogue; the [historical audit](lp2-opening-3x3-yf-cipher-rune-literature-audit.md) distinguishes an authentic Scandinavian 6:5:5 convention from the unresolved Anglo-Saxon 4×8 reconstruction. GP29 is prime-sized, so a static rectangular chart with two nontrivial coordinates necessarily has holes. GP28 or GP30 tests change the transmitted alphabet. Here all 29 original glyphs are retained. The hypothesized operation is to mix a row coordinate from one ciphertext position and a column coordinate from another, then read the resulting cell as the next GP29 symbol. A genuine prior must independently select the chart and positional routing; the p0 signs do not do this. The fixed-hole hypothesis is an exploratory extension, not a historical claim.

## Theorem: hole degree bounds any two-coordinate chart

Let the pair support record all observed ordered source glyph pairs used in the inverse, including any pair with coincident source positions. Let dR be the largest number of absent successors for any source glyph, and dC the largest number of absent predecessors. Each input row group and column group is nonempty, disjoint within its partition, and the input chart(s) and output chart each have exactly 29 occupied cells in r×c, r,c≥2. Their occupied sets and labels can differ. For every output hole (i,j), every pair from input row group R_i and input column group K_j must be absent.

Write H=rc−29>0, and let h be the number of output rows with at least one hole. For each such row, some nonempty K_j is forbidden against all of R_i, so |R_i|≤dC. In the input row chart these h rows therefore contain at least h(c−dC) holes. Conversely, for any fixed x∈R_i all disjoint column groups corresponding to output holes in row i must be absent successors; the output row has at most dR holes. Thus h(c−dC)≤H≤hdR, giving c≤dR+dC. The transposed argument gives r≤dR+dC. Consequently **29≤(dR+dC)^2** is a necessary condition for any such legal decoder, even with independent static label/occupancy charts for input rows, input columns and output. This is a counting theorem, not a statistical threshold or a key search. It does not apply to state-varying charts, a separate hole escape rule, inserted nulls or a changed alphabet.

## Exact original-input decision

Read the canonical corpus physical p0–55, skipping rune-free p50: 12,956 GP29 labels. For each pair-routing plan compute the complete ordered support over its processed positions. Test all nonredundant cyclic constant lags, plus nonwrapped lag1–3301 (generously omit initial positions). For odd rectangular Bifid period k, inverse row/column source indices are floor(i/2), floor((i+k)/2), exchanged for odd i. These are two permutations of coordinate positions in a complete k-block. Test both this routing and its inverse, leaving the final incomplete block untouched. Cyclic shifts k and N−k transpose the pair support, leaving dR+dC invariant. No source-boundary interpretation, prose donor or secret chart search enters the result.

| Routing | Variants | max(dR,dC) histogram | max dR+dC | Minimum processed runes |
|---|---:|---|---:|---:|
| Cyclic lag1–6478 | 6478 | {"0":6473,"1":5} | 2 | 12956 |
| Nonwrapped lag1–3301 | 3301 | {"0":3290,"1":11} | 2 | 9655 |
| Odd Bifid inverse3–12955 | 6477 | {"0":6306,"1":169,"2":2} | 3 | 6479 |
| Odd Bifid forward3–12955 | 6477 | {"0":35,"1":6442} | 2 | 6479 |

Even the two d=2 cases (inverse periods6591/8717) have dR+dC≤4, hence at most 16 chart cells. Every one of the 22733 routing plans is impossible for any nontrivial static 29-symbol ragged rectangle, regardless of the plaintext. This does not cover arbitrary independent resets per chapter, arbitrary nonlocal permutations or conventional square Bifid with an altered alphabet.

## Opening and actual key search boundary

The p0 source-fixed 13-red-rune prefix is excluded; the p0–2 black continuation has 716 runes. For the historical 8+8+8+5 shape with a single short row and the same secret coordinate chart in both directions, the three holes require a disjoint zero rectangle of size 5×9: the five short-row labels cannot pair with the nine labels in the three incomplete columns. Existence is sufficient for *legality* on a specified routing, not for prose. The exact DFS enumerates the smaller set with intersection pruning; 1,000 deterministic independent five-label toy checks agree with exhaustive enumeration.

Across every cyclic lag and orientation (716 cases), no such rectangle exists. Odd Bifid in both directions has 49 and 49 legal orientation/period cases out of 714 each; these all leave a very large tail unprocessed (maximum coverage 479/716 inverse, 419/716 forward). Thus no near-full or full opening receiver in that one-short-row family. The source does not independently select this shape or its use for Bifid.

A concrete local inverse attempt uses native GP order in six candidate contiguous group layouts, permitting each group's position order independently forward/reverse and both coordinate orientations. Group row renumbering has no effect on this same-chart operation. Freeze a finite lag/odd-period list (in SFT) before evaluating p0 black249 versus p1–2 black467. A fit pair must have its output and both source positions in p0; a hold pair must have all three in p1–2. Crossing pairs are omitted, favoring the hypothesis. All surviving training layouts are tested unchanged.

| Layout | Candidates | Legal fit | Legal hold | Min hold holes among legal fits |
|---|---:|---:|---:|---:|
| 10,10,9 | 768 | 6 | 0 | 6 |
| 6,6,6,6,5 | 3072 | 74 | 0 | 1 |
| 15,14 | 384 | 4 | 0 | 3 |
| 8,8,8,5 | 1536 | 24 | 0 | 6 |
| 5,5,5,5,5,4 | 6144 | 176 | 0 | 2 |
| 3,3,3,3,3,3,3,3,3,2 | 98304 | 3460 | 0 | 2 |

No contiguous candidate survives; consequently no legitimate plaintext output exists for this local search. Unrestricted secret local charts for other shapes remain possible. No language score is meaningful when the receiver itself is illegal.

## Controls and next decision

24 authentic p57-based controls across four layouts, cyclic lag13 and both odd-Bifid19 directions, with same and independently relabeled source/output charts, all reconstruct 95/95 clear native runes. For the controls only, absent native glyphs are assigned to the short row or incomplete columns to construct legal routing. These are deliberately legal forward plants, not random-key power claims. The optimized support calculation also agrees with the explicit coordinate plans on representative source and control inputs. Run `node sims/lp2_ragged_gp29_coordinate_hole_sft.cjs` ([SFT](../sims/lp2_ragged_gp29_coordinate_hole_sft.cjs), [actual output](lp2-ragged-gp29-coordinate-hole-output.json)); the connected V8 core executed; standalone Node wrapper and Windows CI were not run.

Retire direct global static ragged GP29 two-coordinate lag/Bifid routing and the tested contiguous opening receivers. A materially different source-selected varying grid, nonlocal routing, or explicit lossless hole-handling scheme would be needed. In particular, do not tune row labels, periods or language scores to repair an impossible original support graph. No unknown rune, authentic key or destination is recovered.
