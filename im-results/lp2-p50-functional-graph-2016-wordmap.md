# p50 source-selected successor map and 2+11 functional graph

**Classification:** source-motivated, computationally unique navigation structure on the original p50 base60 successor map, independently reproduced from original scans. The 2+11 graph is a reproducible structural feature; the 13-node q/r word-pair readout remains conditional because the 2016 source does not fix its 29-word cutoff or zero-based word-index origin. Neither is unknown-page plaintext or a key.

## Hypothesis

The authenticated 2016 message's "numbers are the direction" clue, together with the source-native **EPIPHANY SEEKS THE DEVOTED → p32** route, selects the forward base-60 byte-as-next-address operation on the original 32×8 p49–p51 table. The original 560-case family (40 consecutive four-word windows × seven DH-state depths × two live radices) has one hit. A stronger audit expands to seven natural GP word-number encodings (GP0, GP0 mod 256, GP1, GP1 mod 256, GP-prime sum, GP-prime sum mod 256, and rune count), zero- and one-based table addressing, and all eight obvious row/column traversals. Across 62,720 configurations there are two raw hits, but they are the same route under GP0 and GP0 mod 256 because the selected four word values are already below 256. There is exactly one distinct route: EPIPHANY SEEKS THE DEVOTED, depth p=23, base60, row-major forward, zero-based, terminal p32, whose 121 runes equal GP0(EPIPHANY). Its held-out EMPTY word occurs at step 7=g+K. The route does not use the 2+11 cycle decomposition or q/r cycle-word pairs. Thus the successor-map semantics are selected by an independent source phrase and receiver, not merely by choosing a conventional radix after noticing a functional graph.

The 2+11 cycle structure is a deterministic property of that source-selected map. The additional n=29q+r decomposition of cycle nodes into a candidate first-29-word prefix is a conditional second-layer readout: the signed 2016 message does not explicitly select that cutoff or zero-based word indexing. The 13 word-pairs are not recovered LP plaintext and have no demonstrated body-cipher inverse. The p0 title candidate EPIPHANY SEEKS is a post-discovery cross-check, not a blind prediction.

## Reproducible graph

Using an independent 32×8 visual transcription from original scans 66.jpg (p49), 67.jpg (p50), and 68.jpg (p51), frozen before comparison with the canonical JSON:

| Cycle | Nodes in successor order | Basin |
|---|---|---:|
| 11-cycle | 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247 → 192 → 0 | 252 |
| 2-cycle | 249 → 158 → 249 | 4 |

There are exactly two cycles. Their lengths sum to 13 and multiply to 22; the small basin has size 4. These numbers are suggestive against the p0 marker's 13 dots and the 2013 DH register's group order p−1=22=2×11, with q=4. This is a cross-source alignment, not proof that the table was designed as a functional graph.

### Original-scan audit of the 256-cell table and 13 cycle cells

The 13 printed tokens used by the two cycles were also checked visually against the original 2400×3600 scans 66.jpg–68.jpg supplied with this run. Coordinates below are zero-based within each page's 8-column table; the base-60 byte is the successor index.

| Cell index | LP2 page / scan | Row | Col | Printed token | Byte / successor |
|---:|---|---:|---:|:---:|---:|
| 158 | 50 / 67.jpg | 9 | 6 | 49 | 249 |
| 249 | 51 / 68.jpg | 8 | 1 | 2c | 158 |
| 115 | 50 / 67.jpg | 4 | 3 | 47 | 247 |
| 247 | 51 / 68.jpg | 7 | 7 | 3C | 192 |
| 192 | 51 / 68.jpg | 1 | 0 | 00 | 0 |
| 0 | 49 / 66.jpg | 0 | 0 | 3N | 203 |
| 203 | 51 / 68.jpg | 2 | 3 | 18 | 68 |
| 68 | 49 / 66.jpg | 8 | 4 | 3J | 199 |
| 199 | 51 / 68.jpg | 1 | 7 | 0l | 47 |
| 47 | 49 / 66.jpg | 5 | 7 | 1G | 76 |
| 76 | 49 / 66.jpg | 9 | 4 | 1s | 114 |
| 114 | 50 / 67.jpg | 4 | 2 | 3H | 197 |
| 197 | 51 / 68.jpg | 1 | 5 | 1t | 115 |

All 13 cycle tokens are legible in the original scans and agree with the canonical grid at the listed positions. Agent1's fresh Python implementation, `sims/lp2_p50_agent1_independent_repro.py`, transcribes all **256** tokens directly from those original scans without loading the canonical JSON or the existing SFT. The frozen row-major token serialization has SHA-256 `463c57a3949a941027c416522d1b0463a196efb2faa3550377ba15829dcdf6c4`; the decoded base60 byte vector has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Only after freezing was the vector compared with `resources/liber-primus/lp2-grid-256.json`; all 256 values match. The original scans' SHA-256s are p32 scan49 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`, p49 scan66 `aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335`, p50 scan67 `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776`, and p51 scan68 `2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b`. The same script independently counts p32's original scan49: 4-connected components in grayscale crop x=550..1849/y=600..1799, threshold `<128`, yield 121 large rune components (area ≥500), with line counts `[25,23,23,21,22,7]`; the other 39 punctuation/marker components have maximum area 481, while the smallest rune component has area 1026. It enumerates the complete `40×7×2×7×2×8 = 62,720` family and returns exactly two raw hits (GP0 and GP0 mod 256), collapsing to one distinct route: zero-based word window 5–8 `EPIPHANY / SEEKS / THE / DEVOTED`, depth `p=23`, base60, row-major forward, zero-based addressing, path `71→108→14→183→81→58→146→92→236→238→129→179→175→18→15→212→70→169→228→144→125→20→102→32`. The held-out `EMPTY` word independently maps to 92 at step 7. The seven DH candidate depths are used as documented in the existing source reconstruction; this implementation independently tests their use but does not reauthenticate the 2013 source message. The signed 2016 body source is Git blob `a0d8bd2d73613e01cd8a2103d5721b2b998ee482`; the GP29 order/prime source is Git blob `12aae534f524962e5e3215b7a377ef587604fa8f`. The separate full-font audit still supplies repeated controls for 509/512 glyphs; the three singleton labels are R, i, and h. Cell199 remains one of the eleven separately adjudicated disputed positions.

## Historical 2014 byte-witness negative control: cell 199 is decisive

The archived 2014 byte stream has cycles of lengths **2 and 21**, not 2 and 11. Its 21-cycle is:

0 → 203 → 68 → 199 → 21 → 137 → 129 → 179 → 175 → 44 → 230 → 117 → 171 → 54 → 156 → 52 → 86 → 111 → 115 → 247 → 192 → 0.

The 2-cycle [249,158] is unchanged. The old 21-cycle's q-mode is 6 (four occurrences), but its r-mode is tied among 0, 1, 15, 21, 25 and 28; it does not have the source-correct 11-cycle's unique r-mode 18 = MAP.

A one-at-a-time correction experiment isolates the historical disagreement that matters. Of the ten indices where the 2014 binary differs from the original printed table, correcting only index **199**—from old value **21** (alternative uppercase-L token 0L) to original value **47** (printed lowercase-l token 0l)—restores the exact same 2-cycle and 11-cycle node sets and basin sizes (4 and 252) as the current table. Correcting any of the other nine indices individually does not restore an 11-cycle: eight leave the 21-cycle unchanged, while correcting index 175 alone produces a 23-cycle.

Cell 199 is one of the eleven disputed glyphs independently adjudicated against the original JPEG. The image audit measures the lowercase l at 7×73 pixels, while the uppercase L control has a broad foot and width 26 pixels. The 2014 variant's error at this one cell breaks the 11-cycle; the original scan's reading restores it. The other nine historical differences are not needed for this cycle restoration.

Thus the 2+11 cycle signature is absent from the old participant byte stream and is restored by the single original-image-supported correction at cell 199. This does not prove that the successor-map interpretation was intended, but it materially strengthens the connection between the original printed table and the cycle structure.

## Conditional cycle phase and base-29 word-pair readout

Write each cycle node n as n=29q+r. GP29 has 29 symbols. The authenticated 2016 body contains 43 alphabetic tokens when the numeric footer `3301` and mixed PGP key ID `7A35090F` are excluded. The first 29 end at `the`; `direction` is word index 29, followed by 13 further alphabetic tokens. This makes the prefix a plausible candidate register, but the signed message does not instruct the solver to take the first 29 words, mark that boundary, specify zero-based word indexing, or assign the remaining 14 words a separate role. The q/r output is therefore conditional, not an authenticated source-selected register.

The cycles can be oriented using source values rather than arbitrary rotation:

- Start the 2-cycle at node 158 because its base-29 quotient is 5, matching the 2013 DH generator g=5. Its successor is 249, whose quotient is 8, matching the published public value A=8.
- Fix the 11-cycle phase at node 115 from the independent p32 route: the 23-step source-selected route terminates at state32, and the next p50 pointer is T[32]=115. The same phase is reached by the consistency path GP0(THE)=20 → 102 → 32 → 115; its entry quotient3 matches DH e=3. The THE path alone is not selective because the 11-cycle basin contains 252 of 256 nodes.

Under the candidate first-29, zero-based register only, the following 13 pairs result; the cutoff and index origin are not fixed by the signed source:

| Cycle node | Base-29 pair | Selected words |
|---:|---:|---|
| 158 | (5, 13) | EPIPHANY / WAY |
| 249 | (8, 17) | DEVOTED / THE |
| 115 | (3, 28) | LIES / THE |
| 247 | (8, 15) | DEVOTED / WORDS |
| 192 | (6, 18) | SEEKS / MAP |
| 0 | (0, 0) | HELLO / HELLO |
| 203 | (7, 0) | THE / HELLO |
| 68 | (2, 10) | PATH / PRIMUS |
| 199 | (6, 25) | SEEKS / THEIR |
| 47 | (1, 18) | THE / MAP |
| 76 | (2, 18) | PATH / MAP |
| 114 | (3, 27) | LIES / ARE |
| 197 | (6, 23) | SEEKS / ROAD |

The 11-cycle has unique marginal modes q=6 and r=18, each occurring three times: SEEKS and MAP. It also contains the exact pair (6,18), SEEKS / MAP. The source-oriented first 2-cycle node yields (5,13), EPIPHANY / WAY; the second yields (8,17), DEVOTED / THE.

Under the conditional quotient-first, zero-based register interpretation, the graph yields the word anchors EPIPHANY, SEEKS, WAY, and MAP. EPIPHANY SEEKS matches the p0 title candidate already recovered through a separate route, but that match was known before this audit and is not counted as a blind prediction. The 13 cycle nodes match the p0 13-dot marker count. The 2-cycle remainders 13 and 17 additionally coincide with the Cicada 13/17-year period numbers, though that association remains cautious.

The 11-cycle's base-29 nodes also contain several 2013 DH values: 247 = 8×29+15 (A=8, b=15), 197 = 6×29+23 (a=6, p=23), 115 = 3×29+28 (e=3), and 68 = 2×29+10 (K=2). The 2-cycle basin size 4 matches q=4, and 249 mod 23 = 19 matches B=19. This is an intriguing numerical convergence; it does not yet provide a single extraction rule for the entire DH tuple or the p0 additive key.

## Source-selector family audit (Agent5, 21 November)

The initial family was frozen around the source-available choices: forward versus inverse pointer direction; the two possible 2-cycle starts; the 11-cycle phase; quotient/remainder order; and zero- versus one-based word indexing. The route itself is now tested against a broader, explicit family.

**Pointer and address semantics.** The source-native route selects the forward successor operation. The inverse relation is not a function: 95 nodes have no predecessor, 92 have one, 49 have two, 14 have three, and 6 have four. The forward map is the only total deterministic traversal. The expanded audit charges both zero-based state x→T[x] and one-based state x→T[x−1]+1.

**Full route family.** The reproducer enumerates:
- all 40 consecutive four-word windows in the authenticated 43-word signed message;
- all seven DH-state values as candidate depths: p,g,a,b,A,B,K;
- base59 and base60;
- seven natural word-number encodings: GP0 sum, GP0 mod256, GP1 sum, GP1 mod256, GP-prime sum, GP-prime sum mod256, and rune count;
- zero- and one-based pointer addressing;
- all eight obvious row/column traversals of the original 32×8 table, with independent major/minor reversal.

This is 62,720 deterministic configurations. Two raw hits occur: GP0 and GP0 mod256 both find the same window and route because EPIPHANY, SEEKS, THE and DEVOTED have GP0 values [121,71,20,102], all already below 256. After deduplicating this exact equivalence there is **one distinct route**:

- source window: EPIPHANY / SEEKS / THE / DEVOTED (word indices 5–8);
- start: GP0(SEEKS)=71;
- depth: p=23;
- radix/layout/addressing: base60, row-major forward, zero-based;
- final two preterminal states: 20=GP0(THE), 102=GP0(DEVOTED);
- terminal state/page: 32;
- independent receiver feature: p32 contains 121 runes = GP0(EPIPHANY);
- held-out check: the preceding EMPTY word has GP0=92 at step 7=g+K.

The route is selected without consulting the p0 title candidate, the 2+11 cycle decomposition, or the q/r readout. It is therefore a genuine source-side navigation result, not a plaintext recovery.

**Cycle orientation and phase.** The 2-cycle is 158→249→158. Starting at 158 is selected by q=5=g; its successor 249 has q=8=A. Starting at 249 reverses the independently sourced DH order. The p32 route ends at 32 and T[32]=115, fixing the 11-cycle entry phase at 115. The separate THE path 20→102→32→115 corroborates the same phase.

**q/r word-map family (conditional).** For n=29q+r, quotient-first is the ordinary base-29 decomposition. The first 29 words are a plausible register because GP29 has 29 symbols and `DIRECTION` follows at index 29, but neither the cutoff nor zero-based word indexing is selected by the signed source. Under that provisional register, the 2-cycle nodes [158,249] decompose to (5,13),(8,17), reading **EPIPHANY/WAY** and **DEVOTED/THE**; the q-channel [5,8] matches the independent DH order [g,A]. On the 11-cycle beginning at the independently selected phase 115, the q-mode is 6=SEEKS and the r-mode is 18=MAP. Swapping q/r moves the g/A matches out of the q-channel and reverses SEEKS/MAP. The one-based cyclic alternative (q−1,r−1 mod29) shifts the 2-cycle q values to [4,7] and the entry q to 2, losing g/A/e alignment. Reversing the 2-cycle start likewise gives A→g. These are fit comparisons under a conditional register, not source selection. The 13 ordered word-pairs remain an intermediate cross-source readout, not a sentence, recovered plaintext, or key.

**Independent DH-label caveat.** Do not assign DH fields to cycle count, common cycle length, cycle-node total, maximum tail depth, or basin sizes. The separate conservative topology-label audit found 18 equally simple provenance aliases for the exact tuple and 161 DH-valid numeric tuples / 1,736 source-expression assignments across its broader global-simple family. The authenticated signed-word-position source independently reconstructs the DH tuple; it does not resolve those topology-label aliases. See lp2-signed2016-graph-dh-label-family-gate.md and lp2-signed2016-word-position-dh.md.

**Original-image anchor and scope.** The 2+11 decomposition depends on cell199 being base60 token 0l=47. The original scan shows lowercase l; the earlier 2014 decimal witness's value21 would instead create a 2+21 cycle. This authenticates the critical image transcription. The p32 route independently selects the same forward base60 table without using its cycle decomposition. The conditional 100,000-shuffle graph-signature null remains conditional, not a discovery-adjusted global p-value.

## Direct p0 13-atom consumer gate (Agent10, 20 November)

The previous next-step question—whether the conditional 13 word-pairs specify a simple operation on the p0 13-atom key—has now been tested against the fixed p0 marker serializer. The source-oriented node order remains the report's two-cycle `[158,249]` followed by the 11-cycle beginning at its independently selected entry `115`; each node is decomposed as `n=29q+r) into the candidate first 29 2016 words under the conditional register.

The paired word indices and raw GP0 sums are:

```text
q index:  [5,8,3,8,6,0,7,2,6,1,2,3,6]
r index:  [13,17,28,15,18,0,0,10,25,18,18,27,23]

GP0(q):   [121,102,63,102,71,69,20,39,71,20,39,63,71]
GP0(r):   [57,20,20,52,56,69,69,62,34,56,56,46,54]
```

The finite direct-consumer family was fixed before reading the comparison: raw q/r columns; directed index differences and index sums modulo 29; GP0-value differences and sums modulo 29; and the existing p0 outside-in transform (H(x,y)=(x-y,x+y)\bmod29) applied to each 13-vector. The p0 targets are the frozen marker input `R13=[25,28,11,25,4,8,19,8,4,7,13,20,28]` and generated key `K13=[26,24,8,19,27,24,18,3,0,8,0,16,19]`, with the positive control `H(R13)=K13).

The four central pair reductions are:

```text
q-r mod29:       [21,20,4,22,17,0,7,21,10,12,13,5,12]
q+r mod29:       [18,25,2,23,24,0,7,12,2,19,20,1,0]
GP0(q)-GP0(r):   [6,24,14,21,15,0,9,6,8,22,12,17,17]
GP0(q)+GP0(r):   [4,6,25,9,11,22,2,14,18,18,8,22,9]
```

None equals `K13` or `R13). Applying (H) to those vectors also gives no match:

```text
H(q-r):          [9,4,15,25,20,17,10,5,7,27,8,21,7]
H(q+r):          [18,18,24,26,11,22,4,13,22,26,17,12,7]
H(GP0(q)-GP0(r)):[18,23,7,12,2,26,28,14,7,23,23,6,9]
H(GP0(q)+GP0(r)):[24,13,13,28,17,4,20,27,22,0,8,7,2]
```

This closes the obvious direct pair-to-key readings, not every imaginable permutation or nonlinear map. Do not expand into fitted permutations or extra cipher layers: the p50 graph remains a provisional navigation/anchor observation, not a p0 decryption, unless another independent artifact selects a typed consumer. The [single-file SFT](../sims/lp2_p50_cycle_wordpair_p0_key_consumer_sft.cjs) reconstructs the 13 pairs from the original table and signed message, verifies the p0 H positive control, and asserts the negative result.

## Conditional permutation null

A fixed-multiset null was run by uniformly shuffling the observed 256 byte values among the 256 cell positions, preserving the table's byte-frequency distribution. With seed 0x20261120 and 100,000 permutations:

- Exactly two cycles of lengths 2 and 11 with basin sizes 4 and 252 occurred 11 times (0.011%).
- The exact 2-cycle base-29 pairs (5,13) and (8,17) occurred 3 times.
- An 11-cycle with unique modes q=6 and r=18 and containing node 192 occurred 35 times.
- The joint signature—exactly two cycles, the 2-cycle pairs, and the 11-cycle mode signature—occurred 0 times. The approximate 95% upper bound for this conditional null is 3/100000.

This is a conditional structural check, not a discovery-adjusted global p-value. The hypothesis was formulated after inspecting the table, and the null does not account for all alternative radices, graph interpretations, or source-register choices.

Reproduce the deterministic extraction with:

node sims/lp2_p50_functional_graph_2016_wordmap_sft.cjs

Reproduce the fixed-multiset null with:

node sims/lp2_p50_functional_graph_2016_wordmap_sft.cjs --null=100000

## Objections and negative controls

1. All 256 tokens have now been visually re-read from original scans and match the canonical grid; the eleven disputed glyphs retain their pixel-level adjudication. The base60 forward successor map is selected by the separate 560-case p32 route. What remains a second-layer interpretation is the q/r mapping of cycle nodes into signed-message words.
2. The 2016 source-word GP0 values are poor selectors by themselves: all 28 distinct word addresses tested enter the 252-node 11-cycle basin. The first-THE path alone is therefore not a selector; the four-word p32 grammar is selective because it also fixes the depth, penultimate states, terminal page, and page-rune-count match.
3. The graph does not simply reproduce the signed message's word order. Only 1 of 42 adjacent word transitions is a direct successor under the current GP0/base-60 interpretation; only 5 of 42 targets are reachable by any number of forward steps. A 100,000-permutation test of the latter count gave p≈0.146.
4. Interpreting the base-29 pair as LP2 page/word coordinates (page q, word r) selects ciphertext words, not readable plaintext, under the current transcription.
5. The 2016 phrase's pronoun "Its" refers to Liber Primus, not literally to the signed message's own words; the q/r-to-signed-message register is therefore a secondary interpretation, albeit one aligned with the independent zero-based DH word-position map.
6. Direct use of the 13 cycle-node residues, their obvious H/H-inverse transforms, and the p56 prime/totient transform did not reproduce the existing p0 13-atom additive key.

## Best next decision

The forward base60 row-major successor map is source-selected as a **navigation mechanism**: one distinct EPIPHANY / SEEKS / THE / DEVOTED → p32 route survives 62,720 source-plausible configurations, and the original scan independently confirms the critical 0l cell. The 2+11 graph is a reproducible structural feature of that selected map, with orientation/phase anchored by the route and signed-source DH order.

Keep the evidential layers separate:
- **Established:** original table transcription at the critical cells; deterministic base60 successor map; 2+11 cycles and basin sizes; the unique source-window-to-p32 navigation route under the stated family.
- **Intermediate interpretation:** the 13 q/r word-pairs. They form a source-aligned word-map readout but are not plaintext, a key, or a reversible cipher.
- **Not established:** using graph/basin/depth statistics as DH field provenance. The independent topology-label audit leaves 18 aliases for the exact tuple and 161 DH-valid tuples / 1,736 assignments. Use the authenticated signed-word-position reconstruction as the DH source, not post-hoc graph labels.

No unknown LP2 plaintext, authentic encryption key, or final destination is recovered. The next productive question is a source-selected reversible operation on the p32/p33 receiver. Do not repeat p0 cycle-key consumers, broaden arbitrary permutations, or reopen the already rejected direct q/r-to-p0 key family.
