**Classification:** source-motivated navigation on the original p50 base60 successor map, independently reproduced from original scans. The existing EPIPHANY/SEEKS/THE/DEVOTED four-word route reaches p32 at depth p=23. A second, single-word start from GP-prime(MAP)=211 reaches node121 at step g=5 and p32 at step g+K=7; only MAP among all 43 signed-message words matches both milestones. Node121 is both GP0(EPIPHANY) and p32's 121-rune count. The 2013 DH worked example supplies p=23,g=5,K=2, but using g/K as graph-step counts remains conditional. The terminal path index7 aligns with p32 zero-based fragment index7 (eighth printed fragment, HOMEXWDSLFD), whose 11-rune length matches the p6 red 4-1-4-2 span. These are navigation/selector hypotheses only: no unknown plaintext or reusable cipher is recovered. The separate p6 red-span start and two-symbol p0 candidate remain intermediate.

## Hypothesis

The authenticated 2016 message's "numbers are the direction" clue, together with the source-native **EPIPHANY SEEKS THE DEVOTED → p32** route, selects the forward base-60 byte-as-next-address operation on the original 32×8 p49–p51 table. The original 560-case family (40 consecutive four-word windows × seven DH-state depths × two live radices) has one hit. A stronger audit expands to seven natural GP word-number encodings (GP0, GP0 mod 256, GP1, GP1 mod 256, GP-prime sum, GP-prime sum mod 256, and rune count), zero- and one-based table addressing, and all eight obvious row/column traversals. Across 62,720 configurations there are two raw hits, but they are the same route under GP0 and GP0 mod 256 because the selected four word values are already below 256. There is exactly one distinct route: EPIPHANY SEEKS THE DEVOTED, depth p=23, base60, row-major forward, zero-based, terminal p32, whose 121 runes equal GP0(EPIPHANY). EMPTY occurs at step 7=g+K; the word and interpretation were identified after inspecting intersections with the selected path, so this is not a pre-registered holdout. The route does not use the 2+11 cycle decomposition or q/r cycle-word pairs. Thus the successor-map semantics are selected by an independent source phrase and receiver, not merely by choosing a conventional radix after noticing a functional graph.

The same authenticated message also yields a second, single-word GP-prime start at MAP=211; its route and controls are detailed below. This is separate from the four-word-window family, which remains a unique result within its own tested family.

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

All 13 cycle tokens are legible in the original scans and agree with the canonical grid at the listed positions. Agent1's fresh Python implementation, `sims/lp2_p50_agent1_independent_repro.py`, transcribes all **256** tokens directly from those original scans without loading the canonical JSON or the existing SFT. The frozen row-major token serialization has SHA-256 `463c57a3949a941027c416522d1b0463a196efb2faa3550377ba15829dcdf6c4`; the decoded base60 byte vector has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Only after freezing was the vector compared with `resources/liber-primus/lp2-grid-256.json`; all 256 values match. The original scans' SHA-256s are p32 scan49 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`, p49 scan66 `aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335`, p50 scan67 `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776`, and p51 scan68 `2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b`. The same script independently counts p32's original scan49: 4-connected components in grayscale crop x=550..1849/y=600..1799, threshold `<128`, yield 121 large rune components (area ≥500), with line counts `[25,23,23,21,22,7]`; the other 39 punctuation/marker components have maximum area 481, while the smallest rune component has area 1026. It enumerates the complete `40×7×2×7×2×8 = 62,720` family and returns exactly two raw hits (GP0 and GP0 mod 256), collapsing to one distinct route: zero-based word window 5–8 `EPIPHANY / SEEKS / THE / DEVOTED`, depth `p=23`, base60, row-major forward, zero-based addressing, path `71→108→14→183→81→58→146→92→236→238→129→179→175→18→15→212→70→169→228→144→125→20→102→32`. The `EMPTY` word maps to 92 at step 7; its selection was retrospective (#2012), so it is not an independent holdout. The seven DH candidate depths are used as documented in the existing source reconstruction; this implementation independently tests their use but does not reauthenticate the 2013 source message. The signed 2016 body source is Git blob `a0d8bd2d73613e01cd8a2103d5721b2b998ee482`; the GP29 order/prime source is Git blob `12aae534f524962e5e3215b7a377ef587604fa8f`. The separate full-font audit still supplies repeated controls for 509/512 glyphs; the three singleton labels are R, i, and h. Cell199 remains one of the eleven separately adjudicated disputed positions.

## Independent p0/p6 red-span selector and p32 fragment fingerprint (Agent44, 21 November 2026)

The p0 and p6 red spans each sum to GP0=181, the only repeated prime sum among 18 red spans. φ(181)=180 matches the p50 30×6 interior; p50 cell181 is token 0e/value40, matching p0's word-length product 8×5=40. The p6 red span has word lengths 4-1-4-2, product32, and word sums [71,19,65,26].

The p6 first red word has GP0 sum **71**, unique among 51 words fully contained in all 18 red spans. The signed 2016 body word **SEEKS** also has GP0 sum71. This independently anchors the already-audited base60 start SEEKS=71: 71→108→14→183→81→58→146→**92**→236→238→129→179→175→18→15→212→70→169→228→144→125→20→102→**32**→115… . The fixed path hits EMPTY=92 at step7 and p32 at step23 before entering the same 11-cycle as the start181 path. The red word is not plaintext SEEKS; only its GP0 sum matches. The other p6 word sums sharpen the false-path distinction: 65 reaches p32 at step12 but is exactly the right block with zero branch successes; 19 and26 enter the shared 11-cycle without reaching p32. Thus the two four-rune words (71,65) are the only p6 words that reach p32, and the 65 branch is the negative one.

The p6 4-1-4-2 signature is unique among the 18 red spans and matches the exact partition of p32 zero-based fragment index 7 (eighth printed fragment): 4 runes, central X at position4, 4 runes, 2-rune tail. Of the 22 p32 fragments, fragment7 is the only 11-rune fragment with X at position4. Its left block sums to48 (= audited HOME=48); its right block sums to65, exactly the p6 third red word's sum65. The full-branch audit found the left side survives and the right side has zero successes. This is a plausible “beware false paths” clue, not a proven plaintext mapping.

The total red-span sum181 supplies a second fixed path, 181→40→80→142→160→233→234→196→176→235→121→237→**32**→115… . It has 13 transient nodes ending at32 before the 11-cycle; p0's red length13 and p6's length11 match transient/cycle counts. The separate 2-cycle and the signed 2016 coda's 11+2 split remain structural corroboration. Controls: p7 has composite sum209 with φ=180 and a 13-step path; p15 and p57 both have composite sum120. No single count or totient match is unique.

This adds a human-visible selector to the existing p32 source-loop result; it does not change the frozen successor operation or reopen the 62,720-configuration family. The crucial sum-to-address operation for181 remains inferred; the word-level 71→SEEKS link is more direct but still only a source selector. Direct use of the full p6 11-rune span as a repeating additive key on p32 is negative. p32/p55 tree branch-count and junction mining has already been closed for lack of a stable graph isomorphism; do not repeat it.

Reproduction: [p0/p6 red-span and p32 fragment source-gate SFT](../sims/lp2_redspan_181_p50_path_p32_source_gate.cjs).

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

The sentence `Its words are the map` refers grammatically to Liber Primus, not literally to the signed message itself. The 29-word signed-message core remains a source-visible indexing scaffold for navigation. The adjacent EMPTY/EPIPHANY pair below supplies a separate two-symbol local key candidate; it does not establish that the whole signed message is LP plaintext or a reusable key register.

The exact segmentation is reproduced by [the signed-message register SFT](../sims/lp2_2016_signed_message_29_11_2_register_sft.cjs). The red-span gate below adds one fixed start address from original red ink; it does not reopen or expand the earlier 62,720-configuration graph family.

## Second signed-word start: GP-prime(MAP) → EPIPHANY → p32

The 29-word body register above places MAP at body ordinal 18. Its GP-prime sum is 211 (its GP0 sum is 56). Applying the already selected forward base60 successor map T(i)=byte[i] to the direct address 211 gives:

211 → 61 → 196 → 176 → 235 → 121 → 237 → 32 → 115

This path has two exact milestones: T^5(211)=121 and T^7(211)=32. Node 121 is simultaneously GP0(EPIPHANY) in the signed-message body and the 121-rune count of physical p32. Node 32 is the p32 page address; T(32)=115 is the already established entry to the 11-cycle.

The 2013 signed TCP worked DH example supplies p=23, g=5 and shared K=2. The existing SEEKS=71 route reaches p32 after p=23 transitions. This MAP route reaches EPIPHANY=121 after g=5 transitions, then p32 after a further K=2 transitions. This is a striking cross-source milestone alignment, but the DH protocol does not instruct solvers to use g or K as graph-step counts; that interpretation remains conditional.

The control is discriminating. Across all 43 alphabetic words in the signed message, MAP is the only direct GP-prime address whose path satisfies both T^5=121 and T^7=32. Among the 29-word body, seven GP-prime starts reach p32 at some depth, but MAP alone reaches it at step 7 and passes through 121 at step 5. Across all 256 raw graph starts, only 211 and 233 satisfy both milestones; 233 is not the GP-prime address of any signed-message word. No modulo-256 reduction is used for word sums outside the table. The GP0 control MAP=56 does not reach p32, while WAY's GP-prime start 219 enters the 11-cycle through node 76 rather than reaching p32.

The p32 terminal at zero-based path index 7 aligns with p32 zero-based fragment index 7 (the **eighth printed fragment**): the 11-rune word HOMEXWDSLFD at rune offsets 33–44. The p6 red span independently has printed word lengths 4-1-4-2, matching this fragment's total length of 11; this does not establish an internal split or a key. The p6 red span's direct repeating-additive consumer test remains negative.

This is a second candidate route to the same p32 terminal, not a second plaintext solution. The exact route, all-word control, raw-node control, p32 fragment selection and source data are reproduced by the extended [p50 functional-graph SFT](../sims/lp2_p50_functional_graph_2016_wordmap_sft.cjs).

## Adjacent EMPTY/EPIPHANY pair gives a two-symbol p0 key candidate

This is a separate local consumer of the corrected 29-word body register; it does not reinterpret the 13-node q/r cycle readout as plaintext.

In the authenticated 2016 body core (29 words, excluding the separate `Hello.` salutation), `EMPTY` and `EPIPHANY` are adjacent body ordinals **4 and 5**. Their GP0 sums are **92 and 121**; the original p50 base60 successor table maps them to **236 and 237**. These destinations are consecutive and straddle an original p0 printed-word boundary: word 53 spans rune offsets **235–236**, and word 54 begins at **237**. The two-rune receiver at offsets235–236 is original GP29 `[8,5]`.

The two source values reduce modulo29 to **[5,5]**. Both additive signs are exact and must be kept distinct:

```text
C-K: [8,5] - [5,5] mod29 = [3,0] = OF
C+K: [8,5] + [5,5] mod29 = [13,10] = PI
```

The signed message does **not** specify which additive sign is intended. The conventional decryption of a ciphertext formed as `C=P+K` favors C-K, but that encryption convention is inferred rather than source-stated. The earlier conditional `THE` crib for the same two-rune receiver is a third competing interpretation. Thus the robust result is the **unique source-conditioned two-symbol key candidate [5,5] and the selected receiver**, not a recovered plaintext.

Among all **28 adjacent pairs** in the corrected 29-word body register, EMPTY/EPIPHANY is the **only** pair whose p50 destinations are adjacent. The reproduction script asserts the complete body register, original p0 word spans, both signed outputs, and both exact round trips.

The p57/DH route independently brackets the same boundary but does not derive this key. The following seven-rune receiver at offsets237–243 and its conditional `DEVOTED` reading remain separate. Do not generalize from this one two-rune hit without a second source-selected receiver.

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
- retrospective observation: the preceding EMPTY word has GP0=92 at step 7=g+K.

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
2. The 2016 source-word GP0 values are poor selectors by themselves: all 28 distinct word addresses tested enter the 252-node 11-cycle basin. The first-THE path alone is therefore not a selector; the four-word p32 grammar is selective because it also fixes the depth, penultimate states, terminal page, and page-rune-count match. The GP-prime(MAP) start is a separate control: only MAP among the 43 signed words satisfies the exact T^5=121, T^7=32 milestone pair, though the DH interpretation of those depths remains conditional.
3. The graph does not simply reproduce the signed message's word order. Only 1 of 42 adjacent word transitions is a direct successor under the current GP0/base-60 interpretation; only 5 of 42 targets are reachable by any number of forward steps. A 100,000-permutation test of the latter count gave p≈0.146.
4. Interpreting the base-29 pair as LP2 page/word coordinates (page q, word r) selects ciphertext words, not readable plaintext, under the current transcription.
5. The 2016 phrase's pronoun "Its" refers to Liber Primus, not literally to the signed message's own words. The signed message nevertheless supplies a source-visible 29-word body index scaffold; using it as the q/r register remains a secondary navigation interpretation, not a direct statement that the signed message's own words are LP plaintext.
6. Direct use of the 13 cycle-node residues, their obvious H/H-inverse transforms, and the p56 prime/totient transform did not reproduce the existing p0 13-atom additive key.

## Best next decision

The forward base60 row-major successor map remains a source-selected **navigation mechanism**. The original four-word route from SEEKS=71 reaches p32 at step p=23 and hits EMPTY=92 at step g+K=7. The p6 red-word anchor independently selects SEEKS=71; its 4-1-4-2 signature matches p32 zero-based fragment index 7 (eighth printed fragment), the 11-rune HOMEXWDSLFD at offsets33–44. A second signed-word start, GP-prime(MAP)=211, reaches EPIPHANY=121 at step g=5 and p32 at step g+K=7; only MAP among the 43 signed words matches both milestones. This is a conditional path-length interpretation of the 2013 DH example, not an authenticated instruction. The total p0/p6 red sum181 supplies another fixed start to the same p32 destination after 13 transient nodes, then enters the same 11-cycle. Separately, the unique adjacent EMPTY/EPIPHANY pair supplies a two-symbol key candidate [5,5] for p0 word53; its plaintext sign is unresolved (OF under C-K, PI under C+K), and the earlier THE crib remains competing.

Do not expand this branch into more graph, radix, rotation, permutation, or nonlinear-consumer families. The p32/p55 tree branch-count/junction investigation is already closed for lack of a stable graph isomorphism; the blocked p55 ghost-tree human-oracle issue is not a substitute for a source-selected plaintext operation. The next useful decision is to establish whether any first-party instruction actually assigns the 2013 DH g/K values as graph-step counts and whether the p32 zero-based fragment index 7 (eighth printed fragment) has a source-defined consumer. The MAP route is a strong navigation hypothesis, not plaintext.

Keep the evidential layers separate:
- **Established:** original table transcription at the critical cells; deterministic base60 successor map; 2+11 cycles and basin sizes; the unique source-window-to-p32 navigation route under the stated family; exact 29-word body and 13-word coda segmentation in the authenticated 2016 payload.
- **Intermediate interpretation:** the corrected q/r-to-body-word pair table is now independently reproduced, but it is not plaintext and does not recover the p0 marker/key. The 11+2 coda/cycle alignment remains structural; direct GP0 addressing of the coda does not select the 2-cycle.
- **Not established:** a multi-symbol verified LP2 plaintext, reusable authentic encryption key, full-page inverse, or final destination. The isolated p0 two-rune receiver has a source-conditioned key candidate but competing OF/PI/THE readings; the signed-message register remains an index scaffold, not a decryption.

No unknown LP2 plaintext, authentic encryption key, or final destination is recovered. Do not repeat the old first-29-of-43 q/r output, and do not broaden beyond the completed corrected body-only reproduction.


## Agent16: test the corrected 29-word body map as a periodic key (2026-11-23)

The corrected source register is the 29-word core from **“The path lies empty”** through **“the direction”**, excluding the salutation and the 13-word coda. For each core word \(w_i\), the existing source-motivated pointer grammar gives:

\[
K_i = p0\left[T\left(\operatorname{GP0}(w_i)\right)\right],
\]

where \(T\) is the original 256-byte p50 base-60 table and p0[offset] is the zero-based GP29 rune at that offset. This yields a 29-rune candidate stream:

\[
K=[26,19,26,5,15,27,26,21,26,26,0,26,2,25,14,4,26,19,19,0,0,26,23,19,19,12,4,26,27].
\]

Its transliteration is YMYCSIAYNGYYFYTHAEXRYMMFFYDMMEORYIA; it contains 13 distinct GP29 symbols. The 29-symbol length and the source's “numbers are the direction” wording make it reasonable to test this exact output as a repeating key, rather than assuming that the pointer chain is only a navigation device.

**Held-out receiver test.** The key is derived from p0, so p0 was excluded. The receiver corpus was p1–p55, omitting the empty p50 page: 54 rune-bearing pages and 12,694 ciphertext runes. The following fixed models were tested, with both signs:

- direct additive/Vigenère: global key phase or phase reset at each page;
- the historically attested literal-F/no-key-consumption variant, with the same two phase conventions;
- first-order chain additive, \(P_i=(C_i-C_{i-1})\pm K_i\), with continuous or page-reset state and continuous or page-reset key phase.

No model produced language-like output. The raw held-out ciphertext IoC is **0.034481**; direct additive outputs without F bypass range **0.034472–0.034525**, F-literal outputs **0.035515–0.035701**, and chain outputs **0.034611–0.034622**. For comparison, the clear p57 parable's IoC in the same corpus is **0.062710**. The F-literal variant slightly changes the marginal distribution but does not recover plaintext; the chain variants remain at the random-alphabet baseline.

**Decision:** reject this exact 29-word pointer vector as a repeating direct-additive or first-order chain key on p1–p55. This does **not** refute the underlying 2016/p50/p0 navigation interpretation, and it does not rule out an independently source-specified nonlinear key expansion. It does rule out treating the extracted 29-rune vector itself as a reusable periodic additive key under the tested phase/state conventions. Do not rescue it with arbitrary rotations or new transforms absent a further source clue.

Reproduction: node sims/lp2_2016_body_p50_p0_29key_gate_sft.cjs.


## Agent16: 11+2 cycle key/order test against p0 red13 (2026-11-23)

A separate source-shaped receiver is suggested by three counts: the authenticated 2016 message has a 13-word coda split into 11 words plus the final two verification words (“Verify OpenPGP”); the p50 base-60 successor graph has cycles of lengths 11 and 2; and p0 begins with a 13-rune red heading followed by a 13-dot marker. This makes the p50 cycle nodes a plausible 13-element key or ordering for the p0 red heading.

The forward 11-cycle from node 0 is:

\[
[0,203,68,199,47,76,114,197,115,247,192]
\]

The 2-cycle is [158,249] (either start is possible). The test concatenated the 11-cycle followed by the 2-cycle, matching the coda split. It tested both 2-cycle orientations and two natural GP29 projections of each byte: remainder modulo 29 and quotient floor(byte/29). For each projected key it tested both direct-additive signs and the known literal-F/no-key-consumption convention. It also tested the cycle-node rank permutation as a transposition, in both rank/source directions and ascending/descending order.

**Result:** none of the fixed outputs is readable plaintext or the proposed “EPIPHANY SEEKS” title. Representative outputs include “SHHWBUFGTJFRNG” (mod-29, subtract, 249→158), “SUTYCBADEOEEOPF” (quotient, subtract, 249→158), and “SGEMIASNGEFOHYC” (rank transposition, 158→249). Reversing the 2-cycle changes only the final two key positions; it does not rescue the result.

**Decision:** the 11+2 cycle / 13-coda / 13-dot alignment is a legitimate structural observation, but the cycle nodes do not act as a direct 13-symbol additive key or simple rank transposition for p0 red13 under these source-selected conventions. Preserve the structural alignment as a navigation hypothesis; do not claim it decrypts the red heading or extend it into arbitrary permutations.

Reproduction: node sims/lp2_p50_11plus2_cycle_key_p0_red13_gate_sft.cjs.
