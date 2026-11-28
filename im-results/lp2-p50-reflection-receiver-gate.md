# Original p50 horizontal reflection: bounded receiver tests

**Agent7, 20 November 2026. Classification: source-constrained negative; no unknown LP2 plaintext, authentic key, complete cipher or destination recovered.**

## Why this reflection was worth one test

The original p50 artwork has two horizontally mirrored tree forms. The separate [tree-reflection selector](lp2-p50-tree-reflection-selector.md) establishes the natural table involution **c → 7−c**; it does not supply a start cell, arithmetic combiner or payload receiver. The original pp49–51 object is a continuous 32×8 table in left-to-right, top-to-bottom order, as established by the [row-major source-layout gate](lp2-p49-p51-rowmajor-source-layout-gate.md). Solved p57's instruction to “shed our own circumferences” independently motivates removing its one-cell perimeter, leaving 180 interior cells and 76 perimeter cells ([source partition](lp2-p50-76-perimeter-180-interior-source-partition.md)).

Two initial concrete receivers were tested without opening a permutation search:

1. The reflected 30×6 interior is a stationary token-to-GP29 codebook, calibrated only by the independently solved p56 plaintext (85 runes) followed by clear p57 (95 runes).
2. The reflected 76-cell outer ring supplies the signed-2016 “numbers are the direction” compass stream through p32's 11×11 rune map, beginning at the candidate H in the source-visible p32 fragment HOMEX, then serves as a 76-rune key for p55 under the independently solved p56 transparent-F additive convention. This is a bounded extension of the prior [unreflected p32 compass receiver](lp2-p50-outer76-p32-compass-p55-original-gate.md).

The second chain remains conditional: the original source does not authenticate the p32 H start, the base60 byte interpretation, the low-three-bit compass / high-five-bit distance split, or the transfer of p56's cipher to p55. Those assumptions were frozen to test one historically motivated receiver, not inferred from its output.

## Test A — reflected inner180 as a stationary codebook

Reflect each of the 32 printed rows, then remove the one-cell border. Read the remaining 30×6 cells in ordinary row-major order. Pair them with the exact 180 known GP29 symbols: p56 plaintext recovered with the prime-totient key from prime 2 and its sole transparent plaintext F at local offset 56, followed by p57's 95 clear symbols.

Allow the most permissive stationary mapping possible: every distinct printed two-character token may map to any one of the 29 GP symbols, with no injectivity requirement and no guessed mapping. For each repeated token, all its known occurrences must still map to the same plaintext rune. This exact maximum-match bound is independent of whether the token values are later interpreted in base60 or another injective radix.

| Original-source register | Unique tokens | Best possible matches | Forced mismatches |
|---|---:|---:|---:|
| Reflected 30×6 interior | 127 | **134/180** | **46** |
| Unreflected row-major interior control | 127 | 133/180 | 47 |

The reflected order improves the upper bound by only one symbol. **37 token classes** conflict with the known plaintext; no stationary token-to-GP29 map can satisfy the source. A source-shaped positive plant made with a genuine stationary token map recovers 180/180 under the same bound. Moreover, **34 distinct tokens on the reflected outer ring do not occur in the known interior**, so the interior could not label the complete p55 receiver even if its equations were consistent.

This rejects the exact reflected stationary-codebook receiver, not arbitrary stateful or nonlinear table use.

## Test B — reflected outer76 as a p32 compass key for p55

Reflect the original 32×8 byte table horizontally, then read its 76-cell perimeter clockwise from the reflected top-left. Interpret each base60 byte b using the frozen compass convention:

- direction = b mod 8 in N, NE, E, SE, S, SW, W, NW order;
- distance = floor(b/8);
- start at p32 cell 33, the H in the conditional HOMEX marker;
- wrap both coordinates on the 11×11 p32 map.

The 76 moves end at p32 cell 61 (X) and visit 50 distinct p32 cells. Apply the authentic p56 transparent-F inverse to p55. Its three ciphertext-F positions are 15, 25 and 41. Exhausting all eight possible bypass masks leaves **exactly one legal path**: all three positions pass transparently, 73 key symbols are consumed, and the candidate GP29 plaintext is:

<escape>PITGXMINGYLXEAWTXFAYNHGRJIANGFHEORCLINGCPOAHMUNGFGLHUSIALSGCLRAGBRIOEOEAEROMOACMODAEEAGJO</escape>

The corresponding unreflected perimeter candidate has no legal transparent-F path and dies at p55 offset 4. Reflection therefore repairs that exact algebraic contradiction, but it does not produce readable text.

| Diagnostic | Reflected candidate | Original p55 |
|---|---:|---:|
| GP29 index of coincidence | **0.0340351** | 0.0378947 |
| GP29 trigram log score | **−10.82491** | −10.78578 |

The fixed GP29 trigram model is trained on the repository's solved LP1/p56/p57 plaintext reference, with paragraph boundaries retained and additive smoothing 0.1. The candidate scores below **all 1,752** contiguous 76-rune windows of known plaintext; the worst native window scores −8.06134. The original p55 ciphertext itself also scores below those windows. A planted 76-rune p57 plaintext encrypted under the reflected key is recovered by the same transparent-F inverse, so the inverse and its bypass handling pass a source-native positive control.

This is a unique legal inverse under the frozen candidate, **not** a plaintext recovery. Its rune distribution is at least as unpromising as the original ciphertext, and its language score is decisively outside the known-plaintext window range.

## Test C — all-secret stationary mirror-pair decoder of the printed p56 digest (Agent6, 27 November)

The artwork fixes the horizontal pairing, and 128 unordered pairs exactly match the length of the solved p56 hexadecimal digest. The [2014 three-onion XOR precedent](../resources/external/2014-stage05-three-onion-hex-blocks.txt) gives one historically plausible combiner; there is no authored instruction that the table encodes the digest. Unlike the prior [64-byte all-partition XOR gate](lp2-p50-p56-xor-allpartition-original-gate.md), this test treats one mirror pair as one hexadecimal character or nibble, allowing **any symmetric stationary combiner on the literal tokens**, including arbitrary secret byte relabeling followed by XOR.

With zero-based continuous rows and columns, the single repeated unordered pair is `{2L,3I}`: row 3 columns 1/6 (p49), row 30 columns 1/6 (p51). Printed left-to-right orientations are reversed. In ordinary outer-to-inner pair order, its pair indices are 13 and 121, but the authentic digest characters are `8` and `2`. No deterministic symmetric pair function can produce both. Reversing pair order, row order, or both also conflicts:

| Row order | Pair order | Digest positions | Characters |
|---|---|---|---|
| forward | outer→inner | 13,121 | 8,2 |
| forward | inner→outer | 14,122 | 3,c |
| reverse | outer→inner | 113,5 | f,7 |
| reverse | inner→outer | 114,6 | b,6 |

This is radix-independent, including upper/lowercase ASCII or numeric nibble output. If each row independently permutes its four pairs, the reversed-row digest blocks `9fb4` and `7763` have disjoint alphabets, so **every** such reversed-row ordering fails. Forward-row blocks `783c` and `32c2` share 3 and c, so the arbitrary symmetric-function relaxation survives exactly those two equal-character placements of the repeated edge; it does not identify a decoder.

The undirected literal-token multigraph has 161 vertices, 128 edges, 127 distinct unordered edges, no self-edges, 34 components. The largest has 29 vertices, 29 multiedges and 28 distinct edges; all other components are trees. There is one cycle in the multigraph, namely the parallel duplicate edge. Even allowing any edge order and any four-bit target, **injective relabeling followed by nibble XOR** is impossible: all labels in a connected component must share their high four bits, giving at most 16 distinct byte labels. The largest component has 29. This is not an exclusion of arbitrary nonlinear symmetric functions under arbitrary ordering, or of noninjective relabeling under arbitrary ordering. An injective byte-label plant on the actual graph passes, a one-bit change to one duplicate output fails, and a 16-vertex injective nibble plant passes.

[Exact SFT](../sims/lp2_p50_mirror_pair_digest_allsecret_sft.cjs) · [raw certificate](lp2-p50-mirror-pair-digest-output.json). Both committed; exact run() core executed against the repository source in connected V8. Node wrapper not separately run.

## Test D — unique unicyclic 29-token mirror component as an explicit rank key (Agent6, 27 November)

The same graph yields a compact, independently reproducible candidate readout, distinct from the older byte-as-address functional graphs. Restrict to the only unicyclic component, which happens to have 29 vertices and 29 edges (including the duplicate). Assign each edge exactly one of its two incident vertices and require every vertex to be used once. Leaf elimination forces every noncycle edge to select its endpoint farther from the double edge. The two parallel edges must select different endpoints; hence there are **exactly two** bijective endpoint assignments, with no unknown labels or combinatorial search. The physical left-right orientation does not force the tree choices (17 tree edges point toward the double edge, 10 away).

Read the selected endpoints in original row-major outer-to-inner pair order, rank their distinct literal token values in ascending conventional numeral order, and obtain these two complete GP29 rank permutations (the order is unchanged by drop-f base59):

- `23,17,22,11,20,21,7,18,24,12,9,25,3,10,4,0,1,26,16,13,2,19,5,28,6,8,27,15,14`
- `23,17,22,11,14,21,7,18,24,12,9,25,3,10,4,0,1,26,16,13,2,19,5,28,6,8,27,15,20`

The 29 count is discovered after inspecting the graph, not authenticated as an alphabet instruction. Rank normalization and use as a repeating additive pad are exploratory receiver choices. The exact source-derived permutations were frozen without inspecting p55 plaintext scores. Test only the two explicit keys, both additive signs, key origin zero, either p55 alone (76 runes) or the intact p54→p55 chapter (308 runes), both authentic literal-plaintext-F hold and ordinary consuming clocks. The p56 prime-minus-one control retains the intended 85-rune native wording exactly once among 22 legal inverse paths. Every candidate path forward-reencrypts exactly, and all eight source-native p57 plants retain the true plaintext path (F-held controls have 11 or 62 legal paths, so this is reachability, not blind unique recovery).

**Original result:** all eight literal-F terminal cases have zero complete inverse paths. For either permutation, subtractive/additive p55-only receivers die at zero-based offsets 24/14; continuous p54→p55 receivers die at 25/100. Eight ordinary-consuming cases have unique bijective inverses, but their full preserved outputs are nonprose (no formal language-score exclusion is claimed). This is an actual original-cipher inverse attempt; no unknown plaintext, authentic key or intended continuation emerges. Do not use the post-discovery 29 count as evidence to select arbitrary further graph permutations, phases or cipher layers.

[Exact SFT](../sims/lp2_p50_mirror_graph29_rank_receiver_sft.cjs) · [full original inverses and control counts](lp2-p50-mirror-graph29-rank-output.json). Exact core executed on repository sources in connected V8; standalone Node wrapper not separately run. The negative is for the two exact graph-derived rank keys and tested clocks, not all graph-derived mechanisms.

## Test E — p56 first-glyph residue in the only reversed mirror-pair repeat (Agent41, 28 November)

**New bounded original-input observation, not an authenticated decoder or an LP2 plaintext recovery.** The existing Test C identified exactly one repeated *literal-token* unordered mirror edge in the entire 32×8 source table: \`{2L,3I}\`. Its two occurrences have **opposite left/right orientation** and lie in the original *outer* pages p49 and p51 (row3, column pair1/6: \`3I | 2L\`; row30, pair1/6: \`2L | 3I\`). The original trees independently fix horizontal pairing; choosing to interpret token values modulo the 29-rune alphabet is an additional candidate operation, **not** a printed instruction.

Under the original conventional **base60** digit reading, \`3I=198≡24\` and \`2L=141≡25 (mod29)\`. These are exactly **A=24 and AE=25**, the known plaintext/ciphertext indices of the *first rune* of independently decrypted p56: \`AE=25\` minus \`φ(2)=1\` gives \`A=24\`. The two source edges present those residues in both directions. Under the competing **drop-f base59** reading, \`3I=195≡21\` and \`2L=139≡23\`, so the first-glyph match disappears. When all 85 actually solved p56 ciphertext/plaintext pairs are checked without changing the interpretation, the source pair matches **only offset0 under base60** and **none under base59**.

The matched pair is unusual under a narrow, exactly stated physical-allocation null. Hold fixed **all 256 literal source tokens and their multiplicities**, shuffle their 256 physical positions uniformly, then pair opposite columns in each row. Let \`f_t\` be the exact frequency of literal token \`t\`. Among token classes with base60 residue24, \`Σ binom(f_t,2)=5\`; among classes with residue25, the corresponding sum is11. Therefore the exact expected number of *two-edge identical literal-token collisions* having residue pair \`{24,25}\` in a random pairing is

\[
E = \frac{2\cdot5\cdot11}{255\cdot253}=0.001705029838.
\]

Restrict the two edge locations to one in the **40** p49 edge slots and one in the **36** p51 edge slots, with their token orientations reversed. Their conditional allocation factor is \`2·40·36/(128·127) × 1/2\`, giving an exact expected event count **0.000151036108** and, by Markov, that same upper bound on the event probability under *this fixed-multiset null*. A seeded **100,000**-shuffle replay observed **169** target-residue repeated-edge events, **97** oppositely oriented, **14** spanning p49/p51, and **8** of those 14 with no other repeated pair. These numbers agree in scale with the exact bound. They are **not discovery-adjusted probabilities**: this residue-pair relation, radix comparison and page-region event were recognized after inspecting the same artifact, amid many other reported numerical matches.

**Decisive attempt to extend it:** Starting at either original duplicate edge, the very next mirror-pair in natural printed order does **not** match p56's known second ciphertext/plaintext pair, under either left/right orientation. Nor does the grid exhibit an unordered p56 mapping: only **23/85** solved p56 glyph pairs appear *anywhere* among its 128 base60 mirror edges when treating pairs as unordered mod29. In the same 100,000 token-preserving shuffles the expected number is **22.98961/85**, and **54,146** trials achieve at least23. Hence the candidate p56-first-glyph residue correspondence **does not extend beyond the first rune** or yield an independently predictive 85-rune codebook. It cannot promote base60, a mirror-graph key, or any unknown-page plaintext to an established result.

The result is preserved only as a precisely defined *possible initialization clue*, whose downstream extension has already failed under the natural complete-known-text receiver. A justified new inverse would need a separate author-selected traversal/state law that predicts more known glyphs before testing p55. No reset, new radix, secret key or extra layer is inferred from the coincidence.

**Reproducer:** [single-file original-corpus Node22 SFT](../sims/lp2_p50_mirror_p56_initialpair_sft.cjs), including the historical p56 totient/F-hold reconstruction, exact multiset combinatorics, fixed-source full solved-p56 comparator and seeded null; [independent Windows read-only runner](https://github.com/FlareZ123/liber-primus/actions/runs/46087337250).


## Test F — ordered, role-private affine byte-chart receiver (Agent47, 28 November)

Test C rules out symmetric stationary combiners but not ordered ones: the one repeated unordered pair reverses direction. The signed 2016 direction language and the physical horizontal mirror suggest considering ordered operands; the exact 128-character solved p56 digest is a candidate receiver, not an author-authenticated assignment. A direction-dependent affine byte combiner is a minimal extension of the historical additive and XOR operations. Test it without selecting a radix or fitting a chart.

Let `D_i = a L(t_left) + b R(t_right) + c (mod 256)`, where `a,b,c` are arbitrary bytes, `L` is any injective assignment of literal tokens to bytes, and `R` can be any assignment (even noninjective). This includes two independently secret byte permutations, subtraction, arbitrary units/nonunits, and both nibble-valued and lowercase-ASCII digest outputs. There is no restriction that the charts equal the base59/60 numeric reading.

Two exact witnesses eliminate the entire family:

- If a is odd, multiplication by a is invertible modulo 256. Same right token and same output on two edges force equal left labels, violating injectivity for distinct literal left tokens.
- If a is even, output parity depends solely on the right token and the global bias. Same right token and opposite output parities are impossible for every b,c and every choice of right chart.

In each of the four existing fixed orientations, **both witnesses occur**, for both target encodings. Pair indices below are zero-based physical row-major, outer-to-inner (the target orientation changes, not the source edges).

| Target row order | Target pair order | Encoding | Odd-a contradiction | Even-a contradiction |
| --- | --- | --- | --- | --- |
| forward | outer→inner | nibble | 2L: 13/66 (left 3I/1Q, output 8) | 2D: 12/17 (outputs 7/10) |
| forward | outer→inner | ascii | 2L: 13/66 (left 3I/1Q, output 56) | 0W: 49/53 (outputs 49/54) |
| forward | inner→outer | nibble | 33: 0/5 (left 3N/49, output 6) | 2D: 12/17 (outputs 12/15) |
| forward | inner→outer | ascii | 33: 0/5 (left 3N/49, output 54) | 2D: 12/17 (outputs 99/102) |
| reverse | outer→inner | nibble | 0Z: 44/57 (left 3V/2N, output 13) | 2D: 12/17 (outputs 9/6) |
| reverse | outer→inner | ascii | 0Z: 44/57 (left 3V/2N, output 100) | 33: 0/5 (outputs 97/50) |
| reverse | inner→outer | nibble | 0k: 37/70 (left 1J/3r, output 14) | 3J: 21/35 (outputs 8/5) |
| reverse | inner→outer | ascii | 0k: 37/70 (left 1J/3r, output 101) | 33: 0/5 (outputs 52/99) |

This also excludes every ordered Latin-square/quasigroup combiner whose fixed-right map is injective, with separate injective left/right byte charts and a direct digest output: the equal-output witnesses alone suffice. That statement does not extend to truncated/many-to-one output projections. The even-a parity proof is specific to affine arithmetic modulo 256. The test does not exclude arbitrary asymmetric noninjective lookup tables, per-edge state, independently permuted rows, or additional layers. There is no authentic unknown key or plaintext. Retire this exact ordered transfer alongside Test C; do not fit a chart to the target by adding exceptions.

[Standalone SFT](../sims/lp2_p50_ordered_affine_digest_sft.cjs) · [exact witnesses and twenty source-geometry planted controls](lp2-p50-ordered-affine-digest-output.json). The core was executed against the repository grid and p56 digest in connected V8; standalone Node wrapper was not separately run. All 20 plants with independent injective left/right charts pass the appropriate parity-class necessary condition. The witnesses are algebraic contradictions, not a language-score negative. The full 256³ coefficient space is eliminated by the two parity cases, without coefficient enumeration or knowledge of any label values.

### Stronger boundary: arbitrary integer-polynomial right-conditioned affine coefficients

The Test F argument extends beyond constant coefficients. Consider `D = f(R) L + g(R) mod256`, with L injective, R arbitrary, and f,g arbitrary integer polynomials (no degree bound). More generally, require only that each coefficient's parity depend solely on R's parity. If f has constant parity, the original Test F odd/even contradictions apply unchanged. Otherwise f's parity is a bijective Boolean function of the right-label bit. Writing z=f(R) mod2, there are bits s,u such that g(R) mod2=s z+u. Hence

`D mod2 = (L mod2 + s) z + u mod2`.

For each fixed right token with equal output for different left tokens, z must be zero (an odd f would be invertible modulo256), so that output has parity u. Any edge with output parity opposite u forces both shifted endpoint bits to one. An edge of parity u whose two endpoint bits are already forced to one is then impossible. This is an exact necessary-condition test for each of the only two values of u. It eliminates both in all eight fixed source/target configurations, with no coefficient or chart search.

| Target rows | Target pairs | Encoding | u=0 contradiction | u=1 contradiction |
| --- | --- | --- | --- | --- |
| forward | outer→inner | nibble | product 18/26/58 | equal-output 13/66 |
| forward | outer→inner | ascii | equal-output 45/122 | equal-output 13/66 |
| forward | inner→outer | nibble | equal-output 72/125 | equal-output 0/5 |
| forward | inner→outer | ascii | product 86/109/28 | equal-output 0/5 |
| reverse | outer→inner | nibble | equal-output 44/57 | equal-output 15/106 |
| reverse | outer→inner | ascii | equal-output 76/80 | equal-output 44/57 |
| reverse | inner→outer | nibble | product 42/58/64 | equal-output 37/70 |
| reverse | inner→outer | ascii | equal-output 37/70 | equal-output 18/124 |

The product witness indices are (edge forcing left bit, edge forcing right bit, contradictory edge). For natural-order nibble output, edges 18 and 26 force the bits of left token 3H and right token 2p respectively, yet edge 58 joins them with even output. For u=1, the same-right equal-output witness independently forces u=0. The other seven cases have similarly short recorded witnesses. This proves the exclusion for every ordered bi-affine byte combiner `A L R + B L + C R + E mod256` (all 256⁴ coefficients), and the larger stated polynomial class. It does not exclude non-parity-preserving right-conditioned coefficients, nonlinear left dependence, truncation, dynamic state or another target. The digest assignment remains a hypothesis; no original unknown plaintext follows.

[Polynomial SFT](../sims/lp2_p50_ordered_polynomial_digest_sft.cjs) · [all sixteen contradiction certificates and 72 valid plants](lp2-p50-ordered-polynomial-digest-output.json). Executed the exact function core in connected V8 against canonical inputs. The 64 bi-affine and eight cubic/quadratic coefficient plants all retain their true u. Standalone Node wrapper not separately run.

## Decision

Retire these exact receivers:

- horizontal p50 reflection + shed interior + stationary token-to-GP29 codebook;
- horizontal p50 reflection + clockwise reflected outer76 + base60 compass split + p32 H/cell33 + p56 transparent-F additive inverse to p55;
- the stationary symmetric mirror-pair digest receiver in the four fixed orders, every injective nibble-XOR receiver on the same graph, and the ordered role-private affine and integer-polynomial right-conditioned affine byte receivers of Test F (all coefficients and both direct digest encodings);
- the two exact unicyclic-component rank keys with the tested terminal additive clocks.

The sole repeated mirror edge happens to reduce to the known first p56 ciphertext/plaintext pair under base60, but its full-known-page extension and source-conditioned null do not establish a receiver; this does not change the negative decipherment decision.

Do not rescue them by changing the radix, compass permutation, start cell, ring rotation, key phase, or cipher family after seeing the output. The original p50 reflection remains a source-supported permutation clue, but these tests do not identify what it operates on or how it contributes to a full decipherment.

**No unknown LP2 plaintext, authentic key, complete encryption mechanism, or Cicada destination was recovered.**

Reproduction: node sims/lp2_p50_reflection_receiver_gate_sft.cjs. The read-only Node 22 SFT uses only the canonical original-derived p50 grid, canonical LP2 corpus, and solved plaintext reference; it includes exact source assertions and planted positive controls.
