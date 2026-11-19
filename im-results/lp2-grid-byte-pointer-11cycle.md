# The original 256-byte grid as a self-indexing 11-cycle

**Classification:** original-source deterministic traversal plus scoped source-fixed negatives for the 32-fragment × 8-direction interpretation and the direct whole-terminal 180-known-rune additive consumer. **No original LP2 ciphertext has been decrypted**, and the authors' intended traversal is unproved.

## A minimal human-executable interpretation

The original LP2 pp49–51 table contains 256 printed two-character tokens in **32 rows of eight**, conventionally read as **bytes 0…255** under a 60-digit alphabet. Every decoded byte can therefore act as an address of another cell in the *same table*, requiring no hidden key or invented numeral width. Start at the original **upper-left cell, row-major index 0**, and follow the byte found in the current cell as the next 0-based index.

Under the printed forward row-major base-60 order this produces the exact, complete directed orbit:

`0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247 → 192 → 0`.

**The first cell is part of an 11-cycle with no transient prefix.** The 11 intermediate addresses are all distinct, and the cycle returns precisely to its starting position. A contemporary solver could perform this operation using only the printed tokens and normal indexed arithmetic; it is a specific proposed reading instruction, rather than a cipher model fitted to language.

The full directed functional graph has exactly two attractor cycles: the above **11-cycle has a basin of 252 cells**, while a separate **249↔158** 2-cycle has a basin of four. Those basin sizes are determined by the actual 256 byte values, without searching for a favorable sequence.

**ROAD source numbers now provide a conditional entry to state0 (Agent8, 19 November).** The frozen source vector `[12,5,1,4]`, read as zero-based row/column pairs on the original 32×8 table, selects addresses101 and12. Their ordinary byte-pointer paths are `101→229=00` and `12→247→192=00`; cells229 and192 are the table's only literal `00` tokens, and either zero token emits byte0 on the next step. Across the existing 23-scalar p28/HERE/DH family, all three canonical pairings and both coordinate origins, the only successful source-value set is `{1,4,5,12}`, resolving to the same two starts and zero endpoints. This removes the earlier need to choose state0 merely because it is the upper-left cell, conditional on the ROAD branch and the byte-as-address interpretation. [ROAD direction gate](lp2-road-source-numbers-zero-bracket-direction.md).

A separate authenticated-word selector sends `EPIPHANY ... DEVOTED` to physical p32, whose 121 runes give side length11. The same byte-pointer operation sharpens that selector: `121→237→32` and `102→32`, then `32→115` enters this 11-cycle at a source-selected phase115. Re-running the bounded whole-p32 additive family at that phase gives a best IoC of **0.04049586776859504** and no readable output. The source therefore selects both the p32 receiver and a cycle phase, while the cycle-to-square readout remains missing. [p32 selector](lp2-epiphany-devoted-p32-selector.md).

## Separate manuscript clues that may make 11 relevant

### Independent 2014 filenames select an 11-prime stride and address229

The preserved [Stage10 February 2014 acknowledgement](../resources/external/2014-stage10-post-square-response.html), original Git blob d71303af76016c8e88ed5dcc8a18b08e6276a437, displays exactly three filenames **107.jpg, 167.jpg, 229.jpg**. These are the **28th, 39th, 50th consecutive primes**, so the historical ordinal differences are **11 and 11**. All three files are exact known LP1 images 14–16. The 2013 CicadaOS prime_echo script made the ordered prime sequence accessible to a contemporary player, though no signed instruction assigns those filenames an LP2 use.

The last historically chosen number, **229**, is a direct legal zero-based address in the original 256-cell LP2 table: **B[229]=0**, then the preexisting length-11 pointer cycle follows. Other two historical file names 107 and167 also index original cells; their pointer walks enter that same cycle after **16 and18** transient steps. The 252/256 main-basin size makes their convergence normal. The original 2014 HTML never instructs its recipient to interpret file names as later LP2 table addresses. These historical alignments are post-selected relative to the already known 11-cycle; their numerical match is a possible clue, without a verified cipher consumer.

A second fully fixed consumer uses **all three** historical filenames as separate numeric-table pointer seeds, which supplies an independently motivated operation: the original Cicada LP1 page-00–02 stage reconstructs a signed message by **bytewise XOR of three recovered payload shares** ([exact original 2014 source/positive control](../resources/historical/lp1-outguess-2014-source-map.md)). Advance three pointers from the source-named **107,167,229**, XOR their three returned byte values and reduce modulo29. This gives a 256-state continuous GP29 additive key with **no fitted phase, page reset or secret alphabet**. After 18 positions the XOR tape repeats every 11 cells. Applied as plus/minus cipher directly to the full original 76 p55 runes, the GP29 outputs have IoC **0.0396491228** and **0.0343859649**, respectively, with no coherent original language. An exact native-GP plant inverts all 76/76 symbols. The *same frozen key* continued through the genuine independently known **180 p56/p57 runes** yields **6/180** hits for plus and **2/180** for minus, with **0/95** clear p57 symbols preserved by either. Thus this original-input three-pointer XOR is **not a full-terminal decoder**; separate p55-only semantics would require an independent source instruction. The [same original SFT](../sims/lp2_p50_byte_lookup_graph_sft.cjs) now checks the historic source HTML, 3-pointer-XOR stream, exact p55 output, native-GP plant and authentic 180-rune rejection.

**Authenticated literal-F exclusion for this exact source-XOR key:** p55 prints F at exactly zero-based rune positions **15, 25, 41**. The genuinely solved p56 cipher allows each to bypass the key clock as plaintext F, or to be an ordinarily encrypted non-F symbol. Enumerating all eight such choices for each of the two frozen shift directions gives **16/16 impossible branches**: each forces a key-consuming input position to decode to plaintext F, violating the original literal-F passthrough rule. Without any bypass, the first forced plaintext F occurs at p55 index **36** (minus) or **27** (plus). This is an exact original-source impossibility for a freshly started p55 triple-pointer-XOR key under the authentic F-transparent GP29 architecture, independent of dictionary assumptions. Other key phases or architectures remain possible. [Exact branch certificate in the original SFT](../sims/lp2_p50_byte_lookup_graph_sft.cjs).

A bounded frozen candidate follows s(0)=229 and s(i+1)=B[s(i)] then decodes **all original 76 p55 runes** using GP29 plus/minus s(i) modulo29. Resulting index-of-coincidence values are **0.0312280702** for minus and **0.0389473684** for plus, compared with printed p55 **0.0378947368** and original clear p57 **0.0627099664**. Neither readout forms coherent source-native prose, and arithmetic roundtrips are only correctness controls. The original p56/p57 known 180-rune holdout already rejects the same source229 continuous pointer key as a complete terminal decoder. A future success requires an independently authored operand mapping or key instruction. The [existing original CJS source gate](../sims/lp2_p50_byte_lookup_graph_sft.cjs) now asserts the historical HTML Git blob, 11-step prime ordinals, all three source pointer paths and both p55 outputs.


The unsolved **physical p32 has exactly 121 runes**, supporting an 11×11 reflow; independent earlier research linked its first-row and first-column GP-prime sums **563 and 569** to the dimensions of the signed 2016 Cicada tree image. A source-derived 11-step table route could therefore supply an 11-position row/key clock for that page, though **no rule has been found that turns the eleven table addresses into an independently predictive GP29 plaintext or a unique 11×11 traversal**. Do not assume a direct p32 connection solely from the shared number.

A separate original source relation selects **the same forward row-major base60 representation**: the p39 marked red triad and oversized Ac24 imply a double root at `X=24` of the table's GF29 coefficient polynomial. Under exactly the original base60 order, `P(24)=P'(24)=0`. This table factor and its eight-codec comparison were already established in [the numeric-codec report](lp2-grid-numeric-codec-ambiguity.md). Here the independent **byte-as-address** operation reveals a second structured source property in that same representation. The two tests concern different mathematical operations on the same 256 bytes and must not be counted as independent evidence without a calibrated joint null.

## Codec and order discrimination

The eight previously documented natural base60/base59 × row/column-major × forward/reverse interpretations have the following *first-cell* orbit properties. “Transient” is the number of steps before the orbit enters its first cycle.

| Radix | Cell order | Direction | Transient | Cycle length |
| ---: | --- | --- | ---: | ---: |
| **60** | **Row** | **Forward** | **0** | **11** |
| 60 | Row | Reverse | 24 | 5 |
| 60 | Column | Forward | 19 | 12 |
| 60 | Column | Reverse | 18 | 13 |
| 59, omitting f | Row | Forward | 25 | 1 |
| 59, omitting f | Row | Reverse | 16 | 9 |
| 59, omitting f | Column | Forward | 38 | 3 |
| 59, omitting f | Column | Reverse | 4 | 9 |

Among those eight source-recognizable readings, **only the original forward row-major base60 table starts at a closed 11-cycle**, and it is independently the only orientation with the GP29 double root at source-selected Ac24.

The page-32 eleven-runic dimension and the grid's original top-left position are natural but **not authenticated instructions** to interpret table bytes as pointers. This is therefore a prospective solve-path hypothesis, not proof that the radix is uniquely determined by the puzzle.

## Signed-3301 selector and the table's only two zero bytes

The independently signed January 2016 tree message explicitly prints the identifier **3301**. The GP alphabet contains **29** symbols, while the original numeric grid has **256=32×8** cells. These yield two natural, distinct integer projections:

1. **GP alphabet residue:** `3301 mod 29 = 24`. Taking row 24, first column (0-based) in the **32×8 original grid** selects flattened cell **24×8=192**, printed **`00`**.
2. **Byte-address residue:** `3301 mod 256 = 229`. Taking flattened cell **229 = row28, col5** selects the **other printed `00`**.

Those are **the only two zero-valued tokens in the entire 256-cell original table**, and their exact positions are `[192,229]`. With the source-first table-pointer interpretation above, the identifier starts on the short approach **`229→0`**, and the other zero is the **11-cycle's closing cell**, `192→0`. Thus one signed historical number, the 29-character rune alphabet, and the table's original dimensions each have direct roles in a precise self-indexed route. The 2016 instruction describes its words as a map and its numbers as the direction, making a byte-address reading a possible human operation. The relationship does not prove the map was deliberately planted.

The two zero locations have conditional exact probability **`1/C(256,2) = 1/32640`** under an exchangeable multiset permutation of table-byte positions. This probability treats the two cell addresses as fixed independently of the observed byte values. In reality the choice of combining mod29 with a row start and mod256 with a direct cell address was recognized after other table regularities, so this should **not** be interpreted as a discovery-wide p-value. Importantly, the printed `00` tokens retain their zero interpretation under both the published base60 and alternative f-omitting base59 codebooks. The zero pair selects original forward row-major order, while the separate jet and 11-cycle constraints distinguish the base60 reading among eight documented natural alternatives.

A related cross-source equality, previously raised on [Director Issue #18](https://github.com/FlareZ123/liber-primus/issues/18), is that `(563×569) mod29=13` and `3301 mod29=24`. These exactly give both original grid-polynomial derivative roots, **13 and 24**. The dimension factors come from p32's 11×11 GP-prime coordinate sums and the signed 2016 tree image. All of these numerical connections are *hypotheses of an intended solve path*. They require an independently indicated decoding operation and actual original plaintext before being promoted to established cryptographic results.

## A further historical 1033 seed and direct 180-symbol terminal holdout (Agent20, 15 November 2026)

The original **11-cycle and 2-cycle, their 252/4 basins, the historical 3301→zero link and the Ac24 polynomial double root were already established above**. An additional independently printed first-party number is the **1033** sum in LP1's 2014 Wisdom square and preserved 2014 OpenPuff magic-squares file. Under exactly the same zero-based byte-pointer interpretation, **1033 mod256=9**, and the original table gives **9→249→158→249**. The tiny existing second basin contains positions **9,158,227,249**. This source-number alignment does not supply an author-selected instruction to use modulo256 or the pointer graph, and no new plaintext follows.

An exploratory 100,000-shuffle Fisher–Yates null that preserves every original byte value found **772** shuffles satisfying `B[3301 mod256=229]=0`, **385** in which the 1033 seed 9 enters a nontrivial 2-cycle in exactly one jump, and **3** with both. These outcomes were connected to the historical anchors after viewing the real graph. Thus **3/100,000 is descriptive post-selection frequency, not an author-intent p-value**, and it cannot be combined as independent with the earlier 11-cycle/Ac24 shuffle test.

The decisive original-input *consumer* question is whether pointer states themselves could act as a **continuous reversible GP29 additive key** over the terminal 256-rune register: `s[0]=3301 mod256` or `1033 mod256`, `s[i+1]=B[s[i]]`, `P[i]=C[i]±(s[i] mod29)`, no hidden phase or page reset. Reserve unknown original p55 (76 runes) and test positions76–255 first, using the authenticated p56 prime-totient/F-skip plaintext (85 symbols) plus p57's 95 original clear runes. The original known-target matches are:

| Original source seed | Shift sign | p56 solved /85 | p57 unchanged /95 | Combined /180 |
| --- | --- | ---: | ---: | ---: |
| 3301 | − | 4 | 18 | **22** |
| 3301 | + | 4 | 18 | **22** |
| 1033 | − | 1 | 0 | **1** |
| 1033 | + | 5 | 0 | **5** |

The p57 requirement alone is exact: all 95 key states would have to be zero modulo29 to preserve its clear text, whereas the original 3301 orbit has **77 nonzero** states there and the 1033 orbit **95**. The same arithmetic and source lengths exactly reconstruct a planted 180-symbol native GP29 control. **This direct all-terminal additive consumer is ruled out without reading or fitting p55**. A specifically source-selected p55-only rim operation could evade the 180-position condition but is a different, currently unspecified model. Reproducer: [supplemental source-exact CJS SFT](../sims/lp2_p50_byte_lookup_graph_sft.cjs). There is no new solved unknown text or authenticated key. Future work needs an independently source-written pointer-to-plaintext operation, rather than more 3301/1033 cycle scoring.

## Conditional rare-event experiment

The exact [reproducer](../sims/lp2_grid_byte_pointer_11cycle_sft.cjs), verified by [successful Node.js 22 CI run 42941238297](https://github.com/FlareZ123/liber-primus/actions/runs/42941238297), first asserts all source arrays, first-cell hops, orbit components, and eight codec contrasts. It then shuffles the **existing 256 decoded byte values** uniformly by a deterministic Fisher–Yates process driven by xorshift32 seed `0x24a11b7d`. This preserves the complete byte multiset, including duplicate values and the number of occurrences of zero.

Across **300,000** shuffled tables:

| Frozen source event | Shuffles satisfying it |
| --- | ---: |
| Cell 0 lies on a closed cycle of exactly 11 | 1,900 |
| GP29 `P(24)=P'(24)=0` | 352 |
| **Both simultaneously** | **2** |

The observed conjunction has an empirical frequency of **2/300,000 ≈ 0.00000667** under this *conditional fixed-hypothesis shuffle null*. This is a useful discriminator against accidental satisfaction of these **two precisely stated rules** within the same source model. It is **not a global puzzle-design p-value**: the byte-pointer interpretation was noticed after other source properties were known, several model families have been explored, the shared byte source introduces dependencies, and the experiment does not account for this broad selection process. The joint result alone cannot establish maker intent.

## The signed 2016 "lies" word selects a pointer approach, not a decoder

The unchanged 2016-message GP-prime/base58 address rule (page = sum mod 58, zero-based word = floor(sum/58)) gives **"lies" = 224 = 58×3+50**, selecting numerical physical p50 token3 **3D**, decoded as byte **193** in the already chosen forward row-major base60 representation. Page49 has 80 table cells, so the selected token is full-table index **83**. Following table values as addresses is the existing unproved source hypothesis.

The exact selected orbit is:

83 → 193 → 155 → 112 → 73 → 79 → 82 → 201 → 74 → 205 → 76 → 114 → 197 → 115 → 247 → 192 → 0 → 203 → 68 → 199 → 47 → 76.

The first **10** positions form a transient prefix; the rest is a rotation of the original **11-cycle**. At its sixth jump the path reaches position **82**, directly before the selected cell83, which holds byte **201**. The two copies of193 occur at **83 and127** inside the table's unique reversed neighboring pair 201/193 (indices82–83) and 193/201 (127–128). Starting at the other193 cell127 does **not** return to neighboring128, so a symmetric return rule fails.

Across all 256 starting cells only **five** visit their immediate left neighbor within six jumps: (start,step) = (53,4), (83,6), (116,6), (157,6), (190,3). The six-jump cutoff and neighbor property were selected after the observed path, so 5/256 is a **conditional graph census, not a puzzle-design p-value**. The attraction to the 11-cycle is weak evidence by itself because **252/256** starting cells reach it. The historical 2013 prime-gap ordinal 201 remains an unproved interpretation of byte201 at index82.

This establishes a deterministic signed-word → numeric-cell → 11-cycle route using the original bytes, but no source-written stopping rule, transformation into p32's 11×11 coordinates, key or recovered plaintext. Do not extend this with arbitrary modulo reductions or a repeating pad. The [focused source reproducer](../sims/lp2_2016_lies_pointer_route_sft.cjs) asserts the complete path, source address, neighbor comparison and graph basin.

## Original p32 11×11: frozen direct consumers of the 11-cycle (Agent23, 13 November 2026)

The original p50 pointer orbit is an **11-address** cycle and physical p32 is exactly **121=11×11** GP29 runes. This source-visible match motivates one bounded, reversible operation that avoids a guessed key or phase. Using exactly the original byte pointers `[0,203,68,199,47,76,114,197,115,247,192]`, derive four 11-value GP29 shift sequences: the pointer address `s mod29`, the printed successor byte `T[s] mod29`, the table's printed row `floor(s/8) mod29`, or its printed column `s mod8`. For each, shift either the rows or columns of the literal 11×11 p32 matrix, apply either sign, and read the source matrix directly or transposed. This declares **32 total models**, with no input-selected phase, dictionary, symbol replacement or adjustable coefficient.

The **maximum original result** is the 11-pointer-address key, GP29 subtraction, row clock and direct source reading: IoC **0.03746556473829201**, barely above the original p32 IoC **0.03415977961432507**, versus **0.0627099664** on known clear-GP p57. Its decoded prefix is `LTHAEWAEUPIACWNGHWBMSOEEIIAOEWNGIAWBDGNGMMOENGE...`, without English word structure. No other fixed readout improves it. All 32 original transformations re-encrypt the 121 original ciphertext symbols exactly. As a source-native positive plant, the 81 authentically solved GP runes of LP1 p5 followed by 40 clear p57 runes recover and re-encrypt **121/121** symbols under each of the 32 models. [Single-file test](../sims/lp2_p32_p50_pointer11_wordfree_gate_sft.cjs) and [passing manual CI run 43407430488](https://github.com/FlareZ123/liber-primus/actions/runs/43407430488).

**Decision:** the first direct human-executable 11-cycle-as-11×11-additive-key consumer does not decrypt the original p32. This leaves the historical purpose of the source table and its 11-cycle open. Do not widen the phase or invented key-mapping search without an independent source instruction fixing a different consumer and an unfitted plaintext prediction. No new LP2 plaintext, key or destination emerged.

## Source-11-cycle as a full 11×11 Hill key (Agent43, 13 November 2026)

The original byte-pointer graph provides **eleven distinct state addresses** without a fitted period, and physical p32 provides exactly **121 runes in an 11×11 array**. This permits a different natural consumer from the previously tested 11-symbol additive row/column key: construct a **circulant 11×11 Hill matrix over GF29** from the original eleven cell-address values reduced modulo29. Reading the printed successor byte at each orbit cell merely cyclically rotates these eleven values. The original source does not explicitly instruct Hill encryption, so this is a bounded classical-cipher candidate, with no claim that the creator selected it.

The two input sequences from cell 0 are addresses [0,203,68,199,47,76,114,197,115,247,192] and their corresponding successor bytes [203,68,199,47,76,114,197,115,247,192,0]. Both produce invertible circulant keys, and right/left circulant orientation, row/column block axis and row/column plaintext readout define exactly **16** original-input inverses. The keys, clock, dimensions and starting cell are fixed before using any original ciphertext. Every inverse re-encrypts the complete original p32 input exactly, and an independent plant formed from **95 known original p57 GP runes plus 26 recycled known runes** decrypts **121/121** symbols for each of the 16 settings.

**Original outcome:** the unmodified p32 IoC is **0.0341597796**. Every Hill-circulant candidate has IoC between **0.0333333333** and **0.0381542700**. The best begins G- C- EO- E- EO- O- W- R- AE- TH... under original Gematria Primus transliteration, and its entire output is ciphertext-like. None yields independently readable prose or a credible decoded instruction. Reproducer: [source-fixed, read-only, self-testing CJS Hill-11 inverse](../sims/lp2_p32_pointer11_circulant_hill_sft.cjs). The source CJS was executed against the complete canonical original corpus and grid via a Node-compatible CommonJS harness, passing every ciphertext roundtrip and synthetic positive control.

**Decision:** Retire these exact circulant Hill-11 consumers as a direct decoding route for p32. Preserve the original 11-cycle and the p32 image-dimension linkage as meaningful source facts with unresolved puzzle intent. A different matrix construction or an additional cryptographic layer would require an independent clue rather than a new fitted key or selected plaintext.

## 32-fragment × 8-direction state graph: the 2016-word alignment fails

A natural non-additive reading of the 32×8 grid is a state table: row = one of the **32 full-text intervals** cut by the 31 original 13-dot marks, column = one of **eight compass directions**, and each cell value = the next state index. A state index s is therefore (floor(s/8), s mod 8). This uses the table's native 256-state address space without inventing a cipher.

The 2016 signed sentence “Its words are the map, their meaning is the road, and their numbers are the direction” supplies a concrete test. Its preceding word **“lies”** selects full-table cell **83** under the provisional GP-prime/base58 map. Follow the existing pointer function from 83; the **16 destination states** after that start are the natural candidates for the 16 words in the signed sentence. Independently map each signed word to its LP2 page/word position by the same base58 rule, locate that word in the original 13-dot interval partition, and compare its fragment row with the pointer state's row. For the direction coordinate, compare the pointer column against (a) the signed word's GP-prime sum mod 8 and (b) the mapped LP2 word's GP-prime sum mod 8. These are the two literal readings of “their numbers”; no rotation, phase, row reversal or fitted offset is allowed.

**Result: no alignment.**

- Pointer destination rows: `[24,19,14,9,9,10,25,9,25,9,14,24,14,30,24,0]`.
- 2016-word mapped fragment rows: `[17,5,1,10,22,28,18,16,10,18,25,28,5,1,10,25]`.
- Row matches: **0/16**.
- Pointer destination direction indices: `[1,3,0,1,7,2,1,2,5,4,2,5,3,7,0,0]`.
- Signed-word prime-sum mod-8 directions: `[7,3,7,0,3,2,7,4,0,4,7,2,7,7,0,1]` — **5/16** matches.
- Mapped-LP2-word prime-sum mod-8 directions: `[6,5,0,3,2,3,5,0,3,4,0,3,6,5,3,1]` — **2/16** matches.
- Exact row+direction state matches: **0/16**.

The one-step alternative (label each word with the state *before* rather than *after* its transition) also gives **0/16** row matches, **2/16** signed-word direction matches and **0/16** mapped-word direction matches. The 11-cycle begins at route index **10**, not at the start of the sentence's 11-word suffix (word index 5); the cycle-to-suffix comparison gives 0/11 row matches, 0/11 signed-word direction matches and 2/11 mapped-word direction matches. Thus the 16-edge path to zero and 11-cycle lengths do not establish a word-aligned 16/11 route.

This rejects the **direct fragment-row / compass-column pointer-state registration** against the signed 2016 word map. It does not disprove the deterministic 11-cycle as a property of the table, nor every possible navigation interpretation. The 2016 base58 word map and the pointer traversal remain provisional hypotheses; no plaintext or reversible cipher follows. Do not rescue this branch with arbitrary compass rotations, fragment offsets, or alternate modulo conventions. Reopen only if an original source fixes a different row/column selector and predicts a withheld fragment/direction pair.

**Reproducer:** [source-fixed 2016 pointer / fragment / direction alignment SFT](../sims/lp2_2016_pointer_fragment_direction_alignment_sft.cjs). It reads the authenticated signed-message text, canonical LP2 transcription/corpus, original 13-dot annotations and full 32×8 base60 grid; it asserts the 16-word mapping, fragment IDs, pointer route and all reported match counts.

## Source-directed 43-word compass walk: HOME to X (provisional)

The signed 2016 instruction says that the book's words are the map and their numbers are the direction. The independently established signed-message/base58 word-address rule selects the p50 numeric token 3D at the original table's position83; cells82–83 and127–128 form the unique reversed byte pair **201,193 / 193,201**. The **43** strictly intervening byte positions84–126 equal the number of natural words in the original signed message after excluding the key fingerprint. This interval fixes a source-readable, 43-step numerical sequence; its 43 signed-word meanings are not yet an authenticated cipher key.

The printed table's already accepted byte register has **32 rows and eight columns**. Thus every byte is uniquely **8 × quotient + remainder**, with quotient0–31 and remainder0–7. Interpret each quotient as a distance and each remainder as a standard eight-way compass direction (0 North, 1 NE, 2 East, 3 SE, 4 South, 5 SW, 6 West, 7 NW). Treat the original p32 121-rune, row-major **11×11** square as a torus. These compass and wrap conventions are natural but conjectural.

Start at p32 row3 column0, the **H** of the original complete 11-rune source word beginning **HOMEX**. Applying all 43 source bytes in printed order gives exact raw displacement **(+110 rows, −117 columns)**, hence **(0,+4) modulo11**, finishing at **p32 row3 column4**, precisely the **X immediately after HOME**. The route visits **35 distinct rune positions**. A parallel numerical feature of the already established table 11-cycle is that its **only node among the 29 GP prime values is 47**, which is the prime assigned to rune X. These are two convergent source-grounded routes to **X**, but the 11-cycle and compass path share the same original grid and both were retrospectively interpreted.

The corresponding signed-word first GP rune matches a visited p32 glyph at precisely four 0-based word positions: **0 Hello→H, 9 Liber→L, 38 Beware→B and 39 false→F**. Eight signed words begin punctuated sentences at positions0,1,9,14,30,36,38,41; among them three first-rune matches occur at0,9,38. Under **100,000** deterministic shuffles of the original p32 rune multiset retaining the dimension-defining top row/left column and the HOMEX anchor (**96 movable cells**), **4,709** controls reached at least four all-word matches, **371** reached at least three sentence-start matches, and **241** met both. This is a conditional fixed-test diagnostic with no correction for prior hypothesis selection and is not proof of intended plaintext.

**Decisive limitation:** toroidal translations commute. Every permutation of the same 43 source byte-vectors ends at the exact same X, so the endpoint does not determine a unique reading order or demonstrate encryption. Across the source's **214** contiguous 43-byte windows, four starts **84,95,102,128** also produce the exact vector endpoint; the 43-word block uniquely selects start84 only if the reversed-pair delimiter rule is accepted. The 43 visited rune glyphs in order are not recognizable prose. Replacing grid bytes with the signed words' direct GP-prime sums modulo256 gives a different terminal position (row1,column7). There is still **no recovered unknown LP2 plaintext, authenticated reversible cipher, source-written stopping rule or key**.

The [reproduction script](../sims/lp2_2016_43word_compass_sft.cjs) freezes the 43 signed words, exact mirrored table positions, original p32 HOMEX source word and dimensions, compass and torus orientation, original terminal glyph, full original first-letter checks, and seed-reproduced conditional p32 shuffle. A useful continuation must derive an independent instruction to read the intermediate glyphs or a reproducible cipher/key that decrypts original material. Varying compass orientations or using this sequence as another additive pad would be unmotivated.

## Cryptanalytic next decision

The actionable development is a **deterministic 11-state address schedule derived entirely from the original printed table**. An intended route would need a second human-visible operation specifying how addresses, their 32×8 coordinates, or their eleven order ranks interact with p32's 11×11 runes, a key, or a source-defined readout. Freeze that operation before evaluating original ciphertext. The known closed-cycle nodes in traversal order are:

`[0,203,68,199,47,76,114,197,115,247,192]`.

Simply reducing them modulo29, using them as a repeating additive pad, or permuting p32 text without an independent instruction would revive already exhausted direct-GP and transposition families. A plausible decoder must produce independently recognizable original plaintext, including an explicit reversible encryption model. The table's authentic purpose and the 11-cycle's historical intentionality remain unknown.
