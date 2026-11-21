# p50 source-selected successor map and 2+11 functional graph

**Classification:** source-motivated, computationally unique navigation structure on the original p50 base60 successor map, independently reproduced from original scans. The exact signed 2016 payload source-selects a 29-word body register after its separate `Hello.` salutation, with natural one-based body ordinals 1–29; its 13-word coda splits 11+2. Agent10 independently reproduced the corrected q/r readout in source order (11-cycle then 2-cycle): none of the fixed q/r, GP0-pair, or H-transformed vectors matches the p0 marker R13 or generated key K13. The 13 coda words' GP0 addresses all enter the 11-cycle, including the two verification words, so the 11+2 length match remains structural rather than an operational cycle selector. A separate one-to-one coda-as-pad test uses the 13 GP0(codaWord) mod29 values as a continuous key against the physical p0 red-title ciphertext C13; with the p56 C−K direction it yields rune indices [17,10,17,4,0,12,21,27,14,7,22,20,17] (BIBRFEONGIAXWOELB), not plaintext and not the independently generated K13. No unknown-page plaintext or key is recovered.

## Hypothesis

The authenticated 2016 message's "numbers are the direction" clue, together with the source-native **EPIPHANY SEEKS THE DEVOTED → p32** route, selects the forward base-60 byte-as-next-address operation on the original 32×8 p49–p51 table. The original 560-case family (40 consecutive four-word windows × seven DH-state depths × two live radices) has one hit. A stronger audit expands to seven natural GP word-number encodings (GP0, GP0 mod 256, GP1, GP1 mod 256, GP-prime sum, GP-prime sum mod 256, and rune count), zero- and one-based table addressing, and all eight obvious row/column traversals. Across 62,720 configurations there are two raw hits, but they are the same route under GP0 and GP0 mod 256 because the selected four word values are already below 256. There is exactly one distinct route: EPIPHANY SEEKS THE DEVOTED, depth p=23, base60, row-major forward, zero-based, terminal p32, whose 121 runes equal GP0(EPIPHANY). Its held-out EMPTY word occurs at step 7=g+K. The route does not use the 2+11 cycle decomposition or q/r cycle-word pairs. Thus the successor-map semantics are selected by an independent source phrase and receiver, not merely by choosing a conventional radix after noticing a functional graph.

The 2+11 cycle structure is a deterministic property of that source-selected map. A separate audit of the exact clear-signed 2016 payload selects a 29-word body register after the standalone `Hello.` salutation, followed by a 13-word coda split 11+2. The old n=29q+r word-pair readout used the first 29 of all 43 alphabetic tokens, including `Hello`, and is superseded. Agent10's corrected body-only readout is now independently reproduced in source order: the direct q/r, GP0-pair and H-transformed vectors do not match p0 R13/K13; GP0-addressing the coda words sends all 13 into the 11-cycle, including Verify/OpenPGP. The 11+2 alignment is structural, not a demonstrated body-cipher inverse. The p0 title candidate EPIPHANY SEEKS is a post-discovery cross-check, not a blind prediction.

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

## Source-selected 2016 body register and 29+11+2 structure

The exact OpenPGP clear-signed payload at `resources/historical/cicada2016-4gq25-outguess.asc` has a source-visible segmentation that was missed when the greeting was counted as a map word:

| Message unit | Exact text / structure | Alphabetic words |
|---|---|---:|
| Separate salutation | `Hello.` | 1 |
| Core paragraph 1 | `The path lies empty; epiphany seeks the devoted.` | 8 |
| Core paragraph 2 | `Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.` | 21 |
| Coda sentence 1 | `Seek and you will be found.` | 6 |
| Coda sentence 2 | `Good luck.` | 2 |
| Coda sentence 3 | `Beware false paths.` | 3 |
| Verification sentence | `Verify OpenPGP.` | 2 |
| Numeric/footer material | `3301` and key ID `7A35090F` | excluded |

The two body paragraphs between the salutation and the `Seek...` coda contain **exactly 29 words** and end at the complete sentence-final word `direction.`. The remaining prose coda contains **13 words**. It has a natural **11+2** split: `Seek and you will be found. Good luck. Beware false paths.` (11 words), followed by the distinct technical sentence `Verify OpenPGP.` (2 words). Excluding the salutation, footer and key ID, the payload therefore partitions as **29-word core + 11-word coda + 2-word verification = 42 words**; including the salutation gives the previously reported 43 alphabetic tokens.

Freeze the map register as the **29 body words from `The` through `direction`**, in natural one-based human word order (body ordinals 1–29). Thus `direction` is body word 29. A base-29 remainder \(r\in[0,28]\) must be translated to the human word ordinal \(r+1\); do not count the separate `Hello.` salutation as map entry zero. The former first-29-of-43 prefix included `Hello` and stopped at `the` inside the phrase `the direction`; it is not the source-selected core.

This is a positive source-structure result: the 29-word core aligns with GP29's 29 symbols; the 13-word coda aligns with p0's red13 mark and the p50 graph's 13 cycle vertices; and the coda's 11+2 split aligns with the graph's 11- and 2-cycles. Agent10 has now reproduced the fixed source-order 11+2 alignment and corrected q/r consumer. The direct q/r/GP0/H family has no p0 R13/K13 match, and GP0-addressing the coda words does not select the 2-cycle. The earlier 13-pair table and direct p0 consumer test below use the superseded first-29-of-43 register; the corrected table and finite negative are in the section below.

The sentence `Its words are the map` refers grammatically to Liber Primus, not literally to the signed message itself. The 29-word signed-message core is therefore a source-visible indexing scaffold for the navigation hypothesis, not LP plaintext and not proof that the message's own words are the intended map.

The exact segmentation is reproduced by [the signed-message register SFT](../sims/lp2_2016_signed_message_29_11_2_register_sft.cjs). No graph traversal, word permutation or new p50 address search was run for this source gate.

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

**q/r word-map family (corrected body-only register; Agent10, 21 November; bounded negative).** The exact signed payload selects the 29-word body core and natural one-based ordinals 1–29. The source-order node list is the 11-cycle beginning at 115 (fixed by T[32]=115), followed by the 2-cycle 158→249 (the q=5=g phase). For each node n=29q+r, q and r address body words at ordinals q+1 and r+1. The corrected 13-pair table and all fixed direct consumers are reproduced below; the old first-29-of-43 register including `Hello` is obsolete. The 11+2 coda split is tested as an ordering hypothesis, not assumed as a cipher.

**Independent DH-label caveat.** Do not assign DH fields to cycle count, common cycle length, cycle-node total, maximum tail depth, or basin sizes. The separate conservative topology-label audit found 18 equally simple provenance aliases for the exact tuple and 161 DH-valid numeric tuples / 1,736 source-expression assignments across its broader global-simple family. The authenticated signed-word-position source independently reconstructs the DH tuple; it does not resolve those topology-label aliases. See lp2-signed2016-graph-dh-label-family-gate.md and lp2-signed2016-word-position-dh.md.

**Original-image anchor and scope.** The 2+11 decomposition depends on cell199 being base60 token 0l=47. The original scan shows lowercase l; the earlier 2014 decimal witness's value21 would instead create a 2+21 cycle. This authenticates the critical image transcription. The p32 route independently selects the same forward base60 table without using its cycle decomposition. The conditional 100,000-shuffle graph-signature null remains conditional, not a discovery-adjusted global p-value.

## Historical direct p0 13-atom consumer gate on superseded register (Agent10, 20 November)

**Scope warning:** the vectors and negative result below use the obsolete first-29-of-43 register that counted `Hello` as entry zero. They preserve the previous experiment but do not test the source-selected body-only ordinals 1–29. Do not use this result to reject a corrected q/r-to-p0 consumer.

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


## Corrected body-only q/r readout and coda test (Agent10, 21 November)

The fixed node order is the 11-cycle beginning at 115, followed by the 2-cycle beginning at 158. This preserves the independently selected 11-cycle phase T[32]=115 and the q=5=g orientation of the 2-cycle. The signed-message coda is aligned in source order as 11 words followed by the two-word Verify/OpenPGP verification sentence. This is a single fixed alignment; no cycle rotation or permutation is searched.

For each node n, write n=29q+r with q,r∈[0,28]. The digits select one-based body ordinals q+1 and r+1 in the exact 29-word core:

| Cycle | Node | q,r | Body ordinals | q/r words | GP0(q), GP0(r) mod29 | Coda position |
|---|---:|---:|---:|---|---:|---|
| 11 | 115 | 3,28 | 4,29 | empty / direction | 5,11 | Seek |
| 11 | 247 | 8,15 | 9,16 | Liber / are | 11,17 | and |
| 11 | 192 | 6,18 | 7,19 | the / their | 20,5 | you |
| 11 | 0 | 0,0 | 1,1 | The / The | 20,20 | will |
| 11 | 203 | 7,0 | 8,1 | devoted / The | 15,20 | be |
| 11 | 68 | 2,10 | 3,11 | lies / is | 5,25 | found |
| 11 | 199 | 6,25 | 7,26 | the / numbers | 20,25 | Good |
| 11 | 47 | 1,18 | 2,19 | path / their | 10,5 | luck |
| 11 | 76 | 2,18 | 3,19 | lies / their | 5,5 | Beware |
| 11 | 114 | 3,27 | 4,28 | empty / the | 5,20 | false |
| 11 | 197 | 6,23 | 7,24 | the / and | 20,27 | paths |
| 2 | 158 | 5,13 | 6,14 | seeks / Its | 13,12 | Verify |
| 2 | 249 | 8,17 | 9,18 | Liber / map | 11,27 | OpenPGP |

The finite direct-consumer family is fixed: q and r columns; q−r and q+r; GP0(q), GP0(r), their difference and sum, and the reversed difference; then the existing p0 outside-in H transform applied to each vector. The p0 controls are the original-image 4|5|4 marker-column packet R13=[25,28,11,25,4,8,19,8,4,7,13,20,28] and its generated additive key K13=H(R13)=[26,24,8,19,27,24,18,3,0,8,0,16,19]; R13 is not the physical red-title ciphertext. No vector or H(vector) equals either target. The exact arrays and assertions are emitted by [the corrected q/r SFT](../sims/lp2_p50_body_register_qr_coda_repro_sft.cjs), which passed manual GitHub Actions run 44895139764 (including the coda-as-pad negative).

A separate direct test applies the same GP0-to-base60-forward-successor operation to each of the 13 coda words. The one-to-one coda GP0 C−K pad against the physical p0 red-title ciphertext is also negative: its key vector is [27,27,1,28,6,7,6,2,1,19,25,1,17], which is not K13, and the recovered runes are BIBRFEONGIAXWOELB. A second fixed consumer treats each coda word's GP0 sum as a one-based prime ordinal, selects that prime from the original 2013 464-prime stream, and uses phi(p)=p−1 mod29 as the p0 red13 C−K pad. This yields key [1,1,25,7,3,5,3,10,21,11,18,15,1] and plaintext rune indices [14,7,22,25,3,14,24,19,23,15,0,6,4] (XWOEAEOXAMDSFGR), not the p0 title or K13. Retire the direct coda GP0 and prime-rank/totient pad readings. All 13 addresses enter the 11-cycle. In particular, Verify and OpenPGP enter at nodes 76 and 114, not the 2-cycle. Since the 11-cycle basin contains 252 of 256 states, the first eleven words entering it is unsurprising; the two verification words failing to enter the 2-cycle rejects this simple coda-as-cycle-selector reading. The 11+2 count alignment remains structural only.

This closes the corrected q/r reproduction and the direct coda-address split test. It does not decrypt p0, does not provide a plaintext/key for any unknown page, and does not justify searching additional q/r permutations, rotations, or nonlinear consumers. Retain the p50 graph as a navigation structure only.

## Conditional permutation null for graph structure (legacy word-pair labels)

A fixed-multiset null was run by uniformly shuffling the observed 256 byte values among the 256 cell positions, preserving the table's byte-frequency distribution. With seed 0x20261120 and 100,000 permutations. The cycle/basin statistics remain a graph-structure control; any word labels attached to q/r pairs in the former first-29-of-43 register are legacy only and do not test the corrected body register:

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
5. The 2016 phrase's pronoun "Its" refers to Liber Primus, not literally to the signed message's own words. The signed message nevertheless supplies a source-visible 29-word body index scaffold; using it as the q/r register remains a secondary navigation interpretation, not a direct statement that the signed message's own words are LP plaintext.
6. Direct use of the 13 cycle-node residues, their obvious H/H-inverse transforms, and the p56 prime/totient transform did not reproduce the existing p0 13-atom additive key.

## Best next decision

The forward base60 row-major successor map remains a source-selected **navigation mechanism**: one distinct EPIPHANY / SEEKS / THE / DEVOTED → p32 route survives the 62,720 source-plausible configurations, and the original scan independently confirms the critical 0l cell. The signed 2016 payload now also selects the body-only 29-word register (one-based ordinals 1–29) and a 13-word coda split 11+2. The 11+2 coda aligns with the graph's 11- and 2-cycles and the total 13 aligns with p0's red13 mark.

The corrected q/r reproduction is complete. It uses the frozen body-only register, source-order 11-cycle then 2-cycle, and one-based body ordinals q+1,r+1. The direct q/r/GP0/H family does not match the p0 R13/K13 controls, and the 13 coda words' GP0 addresses all enter the 11-cycle, including Verify/OpenPGP. Do not expand this branch into more graph, radix, rotation, permutation, or nonlinear-consumer families.

Keep the evidential layers separate:
- **Established:** original table transcription at the critical cells; deterministic base60 successor map; 2+11 cycles and basin sizes; the unique source-window-to-p32 navigation route under the stated family; exact 29-word body and 13-word coda segmentation in the authenticated 2016 payload.
- **Intermediate interpretation:** the corrected q/r-to-body-word pair table is now independently reproduced, but it is not plaintext and does not recover the p0 marker/key. The 11+2 coda/cycle alignment remains structural; direct GP0 addressing of the coda does not select the 2-cycle.
- **Not established:** an LP2 body-cipher inverse, plaintext, authentic encryption key, or final destination. The signed-message register is an index scaffold, not a decryption.

No unknown LP2 plaintext, authentic encryption key, or final destination is recovered. Do not repeat the old first-29-of-43 q/r output, and do not broaden beyond the completed corrected body-only reproduction.
