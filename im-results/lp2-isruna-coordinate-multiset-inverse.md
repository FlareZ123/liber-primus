# Opening English coordinate-rune charts: exact coordinate-multiset receiver

**Agent38, 27 November 2026.** Negative for the specified historical-chart fractionation family; no unknown LP2 plaintext or key.

The [English coordinate-rune source audit](lp2-anglosaxon-isruna28-gp29-gate.md) gives two independent historical readings of the p0 3|3 stave as E. Test all five insertions of Ior into the Salzburg fourth group and all three documented candidate Domitian partitions. Non-GP symbols leave vacant cells. The natural Hackness row order restricted to GP29 is represented by Salzburg+Ior slot5. The source does not establish fractionation as an opcode.

For a fixed chart S, each rune has coordinates (r,c). Independent positional permutations of the row and column tapes preserve their respective histograms. For equal-length P,C, equality of both histograms is also sufficient for *some* independent coordinate permutations: bijectively match occurrences of each row and column from P to C. The resulting cells are all legal because they are the observed C. Inverting the positional permutations restores P. This strictly relaxes any fixed routing rule with valid hole handling, including cyclewalking, provided it preserves both coordinate multisets within each group. It grants arbitrary separate routing keys to each group; the existence of a witness is not a recovered key.

Index 33,704 normalized GP forms from pinned TextBlob (two spelling conventions plus exact p57 forms). Every surviving original group's top-frequency candidate gets an explicit forward/inverse permutation witness. Canonical tape equals all 12,956 indices and 2,896 printed groups. Opening black p0–2 = 716 runes, 156 groups.

| Chart | Opening groups with empty domains | Whole book empty domains | p57 true candidate ranked first |
|---|---:|---:|---:|
| Salzburg+Ior slot1 | 122 | 2088 | 17/20 |
| slot2 | 120 | 2100 | 17/20 |
| slot3 | 118 | 2093 | 17/20 |
| slot4 | 112 | 2080 | 17/20 |
| slot5 | 118 | 2088 | 17/20 |
| Domitian 8+8+17 | 127 | 2223 | 18/20 |
| Domitian 8+8+12+5 | 127 | 2223 | 18/20 |
| Domitian 8+8+8+9 | 117 | 2081 | 18/20 |

Even the most favorable chart requires 112/156 opening or 2080/2896 whole-book groups outside the lexicon. Isolated candidates do not constitute readable text. Positive plants apply an actual involution swapping adjacent column coordinates only when both output cells exist; 68–74 of 95 solved p57 runes change, all 20 true groups remain candidates and exact witness replay/inversion passes for every chart. Since the lexicon includes the known p57 forms, this is receiver correctness calibration, not blind recovery.

**Boundary-independent extension.** Drop all printed groups. Arbitrary independent coordinate permutations over the whole opening/book still preserve both coordinate marginals. Compare these with every same-length contiguous normalized window in seven pinned texts: Gibran, three Book of Law chapters, Blake Marriage, Emerson Self-Reliance, LP1 reference. Zero exact matches across 157,341 opening windows and 98,084 whole-book windows per chart. Smallest concatenated L1 discrepancy 238 for the opening (Domitian 8+8+8+9/Gibran), 5568 for whole book (Domitian 8+8+12+5/Emerson). This excludes exact reuse of those finite source windows independently of printed boundaries, not general unknown natural language.

**Decision:** retire same-historical-chart coordinate-permutation receivers under the declared lexical/donor assumptions. This extends direct cyclic-lag/odd-Bifid hole legality to arbitrary valid coordinate-only routing. Different input/output charts were initially unexcluded; the Haigh/GP29 pair below has since been tested. Coordinate-value changes, other chart pairs and out-of-register prose remain unexcluded. No authentic opcode or new plaintext. Do not repeat chart/routing sweeps without new evidence.

[Executable SFT](../sims/lp2_isruna_coordinate_multiset_inverse_sft.cjs) · [Raw output and source blob IDs](lp2-isruna-coordinate-multiset-inverse.json). Core executed in connected V8; standalone Node wrapper not independently run. Code/output commit 495c9519f751baa631620e64edae7b514cf632c4.

## Distinct receiver: literal binary digit planes

The historical four-row/eight-position charts naturally encode each group as a two-bit digit and each position as a three-bit digit. Rather than recombine coordinates into runes, take one coordinate tape in original order, concatenate fixed-width binary values, and read bytes. Use the five Salzburg Ior insertions and Domitian's 8+8+8+9 GP29 projection (six charts; the other Domitian layouts have more than eight GP position values and are outside this binary model). Opening black716 gives 179 complete group bytes or 268 complete position bytes and four trailing bits. No independent instruction establishes byte packing as the opcode.

For each chart, permit every permutation of the four/two-bit or eight/three-bit digit labels, each bit origin0–7 and both tape directions: 384 group and 645,120 position variants per chart. To compute the exact minimum number of bytes with the high bit set, tally each original digit at each bit place that lands at a byte high bit. For any proposed bijection, the high-bit count is the sum of these independent assignment costs. Enumerate the 4!/8! assignments on these small matrices, then directly unpack the extremal witness to confirm the optimum. This is an exact all-key ASCII gate, not a language score.

- Every group variant necessarily has high-bit bytes; the best ratio is 72/178.
- Every position variant necessarily has high-bit bytes; the best ratio is 98/267 (Salzburg slots4/5). Across six charts, **0/3,873,024** assignments/origins/directions produce all-ASCII bytes (equivalent charts counted separately).
- All 48 literal chart/dimension/orientation/scope decodes (opening or entire original book) are invalid UTF-8 and have none of the eight tested leading file/armor signatures (gzip, bzip2, ZIP, PNG, JPEG, PDF, ELF, PGP-style BEGIN armor).
- Positive controls encode the 17-byte phrase PRIMES ARE SACRED as both digit widths under a hidden reversed alphabet assignment; the true inverse recovers 17/17 bytes and the high-bit test admits a valid zero-high-bit assignment in each case. This validates the necessary condition, not unique ASCII recovery.

Reject this direct ASCII digit-plane representation for the black opening independent of language, digit permutation or byte origin. Literal binary decode did not expose an identified file header. Other packed layouts, encrypted/compressed binary or a joint coordinate receiver remain outside scope. No original payload or unknown plaintext. Do not extend with arbitrary codec sweeps absent a new source clue.

[Bitplane SFT](../sims/lp2_isruna_coordinate_bitplane_inverse_sft.cjs) · [raw output](lp2-isruna-coordinate-bitplane-inverse.json) · code/output commit be35d4cc648fc5aa9a8fede42244a8048f418872. Core executed in connected V8, standalone Node wrapper not separately run. Initial repeated full-byte scan timed out; exact assignment formulation avoids it.

## Haigh 1872 to GP29 cross-chart receiver (Director #3307, Agent8)

A newly located [1872 editorial class table](lp2-anglosaxon-isruna28-gp29-gate.md#independent-1872-editorial-coordinate-chart-director-3307-agent8) fixes a complete GP29 projection without optimizing late-cell placement. It is identical to GP29 except D/OE and IA/EA are swapped. The source does not authenticate a fractionation opcode. To test a distinct receiver not covered by the same-board result above, set different fixed plaintext and ciphertext boards (Haigh→GP and GP→Haigh), both with the same three vacant cells in the fourth row. Grant arbitrary independent permutations of the row and column position tapes. Equality of the input-board plaintext and output-board ciphertext histograms is necessary and sufficient for existence of some such legal routing. Reconstruct explicit forward and inverse permutations for the first surviving dictionary candidate of every nonempty original group. No arbitrary chart permutations, new alphabet, or tuned origin.

Frozen original scopes: p0 black through p2, absolute [13,729), 716 runes and 156 complete groups; independent first continuation p3 [729,946), 217 runes and 43 complete groups; whole unknown corpus 12,956 runes and 2,896 groups. The held p3 is disjoint; no model fitting occurs. Use the same seven finite donor texts and 33,704 normalized dictionary forms as the preceding same-board gate, retaining solved p57 forms only for calibration.

| Sender plaintext board → ciphertext board | Opening empty groups | p3 empty groups | Whole-book empty groups | Minimum donor histogram L1 (opening / p3 / book) |
|---|---:|---:|---:|---:|
| Haigh → GP | 111/156 | 34/43 | 2051/2896 | 224 / 64 / 5946 |
| GP → Haigh | 120/156 | 34/43 | 2076/2896 | 288 / 82 / 6702 |

In each direction all 157341 opening windows, 160834 continuation windows and 98084 full-book windows of the finite donor corpus have nonzero discrepancy, even with arbitrary routing across printed group cuts. Native p57 plants change 75/95 glyphs in each direction using deterministic adjacent-column exchanges when both output cells exist; all 20 true groups survive and forward/inverse witnesses reproduce every rune. This is correctness calibration, not blind key recovery. With no positional routing, direct board conversion is exactly the two swaps, changes 106/716 opening and 35/217 held glyphs, preserves the original IoC (0.0341016525 and 0.0330687831), and mechanically inverts exactly. The complete direct candidate arrays are in the raw output; no coherent plaintext was found.

**Decision:** retire these two source-motivated cross-chart coordinate-permutation consumers under the explicit finite lexicon/donor scopes. The Haigh chart remains a distinct historical reference, not an LP2 key. Other coordinate-value operations remain unselected; do not sweep them in response to this failure. No unknown plaintext or authentic key. [Executable SFT](../sims/lp2_haigh_gp_crosschart_gate_sft.cjs) · [complete output and source blob pins](lp2-haigh-gp-crosschart-gate-output.json) · code/output commit a73f150bd1f19f82dfe9cca53543c5f3f6331eea. Core executed in connected V8; standalone Node wrapper not independently run.
