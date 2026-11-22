# P0 red heading → 32-row table → prime 151: a closed arithmetic clue candidate

**17 November 2026, Agent 9. Classification: exact original-source cross-artifact arithmetic with one completed original-cipher inverse and one early source-authenticated inverse obstruction. Neither an LP2 decipherment nor an authenticated key or creator instruction.** The numerical selector is reconstructed retrospectively; evidence of the operation's historical intent remains absent.

## Original human-visible route and independent operands

The original Liber Primus second-release physical page 0 (2014 archive \`17.jpg\`) begins with **two red printed words** (lengths **8** and **5** GP runes), an ordinary small red dot between them, and a large **13-dot** red punctuation mark after the complete 13-rune heading. The uncolored black body begins immediately afterwards. Source: [ink annotations](../resources/liber-primus/lp2-ink-annotations.json), [complete original GP29 index corpus](../resources/liber-primus/lp2-corpus.json), and [printed-word transcription](../resources/liber-primus/lp2-transcription.txt). The source-corrected word division is essential: an earlier incorrect interpretation located the large 13-dot marker after only eight red runes and must not be restored.

In the alphabet's original order, the two red printed words have these prime-weight sums:

| Red word | Exact GP index sequence | Rune count | GP-prime sum |
| --- | --- | ---: | ---: |
| First, \`S H E O G M IA F\` | \`[15,8,18,3,6,19,27,0]\` | 8 | **347** |
| Second, \`S Y E NG C\` | \`[15,26,18,21,5]\` | 5 | **315** |

The two separate sums yield both **347−315=32** and **(347+315)/2=331**. The second number is already known prior art: the contemporary original 2014 LP2 delivery index contained \`<div id="331">\`, and the historical Cicada 7×7 magic square has center **331**. Their alignment and limitations were documented in [the earlier 133/331 historical report](onion7-html-red331-source-inversion.md); this investigation does not rediscover that relationship.

The new cross-artifact relation is with the **32-row × 8-column**, 256-cell printed LP2 number table on physical pp49–51 (archive \`66.jpg\`–\`68.jpg\`). Applying a word's GP-prime sum **modulo 32**, both red words independently select the **same zero-based row 27**: \`347 mod32 = 315 mod32 = 27\`. The complete original row has tokens

\`\`\`text
2M  3d  2S  0x  0w  0q  0p  2V
\`\`\`

and, under the published but provisional conventional base60 reading, bytes

\`\`\`text
142 219 148  59  58  52  51 151
\`\`\`

The **eighth/final cell is byte 151**, which occurs **exactly once** in the entire 256-byte table, at physical p51, zero-based global row27/column7. The eight-rune length of the first red word makes final column7 a natural, though still inferred, candidate selector. The earlier solved LP1 \`Some Wisdom\` 5×5 number square independently contains literal **151** at a corner and explicitly states that **primes and the totient function are sacred**. Because 151 is prime, \`φ(151)=150\`, yielding the exact additional equality

\`\`\`text
347 + 315 = 662 = 2*256 + φ(table[row27][column7])
                      = 2*256 + φ(151) = 512+150.
\`\`\`

The table's row27, prime151 and \`φ(151)\` are fixed by unchanged original artifacts. The **rules** “take the modulo-32 row,” “take column7,” and “subtract twice the table size” were inferred after seeing the source values, and no Cicada-authored plaintext or key instruction independently specifies those operations. The arithmetic should therefore be treated as one **retrospective crosslink** whose coincidences are interdependent, not several independent discoveries or probabilities.


### A discriminating rival: radix 59 versus conventional radix 60

The printed two-character cells can be parsed with two exact rival alphabets: full \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\` (60 symbols), or the same alphabet omitting unused lowercase \`f\` (59 symbols). Both parse *all 256 original printed cells* into bytes 0–255 and neither has a standalone uniform-byte-likelihood advantage; see [the original radix ambiguity SFT](../sims/base60_base59_source_ambiguity.cjs).

For the **same row27/last-column source token \`2V\`**, the two readings make distinct numerical predictions **without changing the observed title or table-cell location**:

| Source byte reading | Decoded \`2V\` | Totient | Claimed reconstructible total \`512+φ(value)\` | Actual red-heading sum |
| --- | ---: | ---: | ---: | ---: |
| Conventional radix60 | **151** | **150** | **662** | **662**, exact |
| Omit lowercase f / radix59 | **149** | **148** | **660** | **662**, miss by 2 |

This is a *conditionally discriminating* observation. If an independently authenticated clue fixed the particular row/column/twice-256/totient reconstruction, the original p0 heading would select **radix60** over the otherwise valid radix59 grid parse. Since the reconstruction was discovered retrospectively, it is not yet independent evidence of the author's numeral radix or a decoded payload; the two-point difference alone must not be promoted into proof of intended base60.

## Independent solved-text selector: p57 FIND=151, and two incompatible source-table locations (17 November 2026)

The prior red-heading arithmetic selected an already visible numeric **151** in the grid by a postulated row/column rule. There is now a different, independently author-visible *text* route to exactly that value: the **original solved physical p57** says **“FIND THE DIVINITY WITHIN AND EMERGE.”** Its standalone original printed word **FIND** consists of GP runes `F I N D`, indices `[0,10,9,23]`, with prime weights **2+31+29+89=151**. All four runes and the word boundary occur verbatim in the unchanged [master transcription](../resources/liber-primus/lp2-transcription.txt). The 2013 Cicada audio ID3 metadata already supplied the later `PARABLE` text, which makes the proposed cross-artifact notice historically plausible without establishing an intentional table coordinate.

The original 256-cell printed table uses no lowercase `f`. Both the documented **base60** alphabet and the equally parseable **base59 without lowercase f** contain all its original printed symbols and produce integer cells fitting within 0..255. The word-sum **151** selects a **single different cell under each interpretation**, as computed from all 256 unmodified tokens:

| Possible source numeral system | Unique cell of value 151 | Zero-based position | Relationship to 32×8 geometry |
| --- | --- | --- | --- |
| Conventional base60 | Token **2V**, row27/col7 | **223** | **Outer ring**, length76 |
| f-omitting base59 | Token **2X**, row18/col6 | **150** | **Second ring**, length68 |

**Exact self-address under base59:** FIND's source prime-sum **151** also names the *151st printed table cell in row-major, one-based indexing*. That cell is precisely token **2X** at zero-based index150, and that same token decodes as **151** under base59. The alternative base60 interpretation breaks the self-reference: token2X decodes to **153** there, while its only value151 lies at one-based cell224. The table does contain other self-index matches, so the source's self-address is a focused, post-discovery crosslink rather than proof of intended numeral base. Nevertheless, it permits a realistic player operation with no fitted coordinate: **FIND → GP prime151 → 151st table cell → 2X → base59 value151**.

The base59's unique151 interior cell is **row18/column6**, immediately inside the right-hand perimeter. The **single perpendicular step outward** specified conditionally by “EMERGE” reaches **row18/column7**, zero-based cell **151**, without any coordinate search. That adjacent original table token is **39**, which evaluates to **3×59+9 = 186** under base59. The independently printed p57 word **MUST**, from “WE MUST SHED OUR OWN CIRCUMFERENCES,” has GP-prime sum **71+3+53+59 = 186** for runes M U S T. Thus **two unaltered words and two horizontally adjacent source cells** give a compact paired route: **FIND→151→151st cell 2X=151 (inner ring); one step outward→next cell 39=186←MUST**. **Direct visual source cross-check:** The original archive **67.jpg** (physical p50) visibly prints the two tokens at the very end of a single eight-item line, **`23 3U 1W 2r 46 2s 2X 39`**. Thus their horizontal adjacency and the final-column exit are first-party visual facts, with no reconstructed spreadsheet layout required. The concentric 32×8 rings remain a *solver-reconstructed virtual geometry* joining table rows across three separately printed pages; their circumferential interpretation is an additional hypothesis. Under base60 the corresponding adjacent tokens instead evaluate to **153 and 189**. Base59 contains value186 at only two positions, one of them this identified outer neighbor. This paired equality makes the source-first base59 reading a more specific hypothesis, but the word-to-cell/radix and emerging-step rules are still inferred, so treating its naive permutation probability as a discovery-wide p-value would be misleading. An independent whole-p57 vocabulary check uses **all 14 printed body-word occurrences with GP sums 1–255 (12 distinct values)**, instead of selecting only FIND/MUST. Across all **472** physically edge-adjacent table-cell pairs, base59 gives **exactly one** pair whose two values are both among those twelve original word sums: **FIND151→MUST186** at cells150→151. However, this count is not enriched under a multiset-preserving null: **16/256** base59 cells carry one of the twelve values, so a uniform permutation of the exact 256-cell value multiset has expected adjacency count `472 × (16/256) × (15/255) = 1.7353`, versus **one observed**. Under base60, **15/256** cells are marked, the corresponding expectation is **1.5184**, and **two** different pairs are observed (WITHIN115↔LICE184 and WE86↔WE86). Thus the FIND→MUST adjacency is not independent statistical corroboration for base59. This is an expectation under position randomization, not a calibrated p-value; the source value multiplicities are preserved. The exact FIND self-index remains a real source relation, but it is one post-discovery hit among the 12 possible word-sum addresses and two admissible radices; the author-selected word subset, radix, and index operation remain unproven. No authenticated GP29 decoding operator follows.

The source words “shed our own circumferences” and “find … within” motivate examining concentric perimeters and make the **interior base59 location** a potentially meaningful candidate. However, the conventional base60 value at the **outer-ring** boundary also supports a natural start-outer-then-shed route. These are incompatible readings; the plaintext does not explicitly select a radix, ring direction, byte map, or successor. The p0-derived **φ151=150** and p57-derived **FIND=151** each use first-party inputs, but neither source independently commands the other's arithmetic. Treat their convergence as a better clue candidate, rather than as recovered ciphertext key material.

### Complete original terminal cipher consumers and independent positives

The table's exact concentric ring lengths are **[76,68,60,52]**. The outer length76 matches unknown ciphertext p55 exactly; the three inner lengths sum **180**, matching the **85 independently solved p56 plaintext GP runes** plus **95 original clear p57 runes**. This 76+180 geometry and unsuccessful all-secret *fixed byte→rune* codebook tests were previously established independently in [the terminal256 structural gate](lp2-grid256-terminal-solved180-lookup-gate.md). The additional operation here uses the new **source-word-specified 151 entrance cell**, continuous physically adjacent spirals and exact candidate numeric keystreams. It supplies a distinct, affordable decision on the known 180-runed plaintext without guessing unknown p55 text.

Freeze the unique151 cell in each radix as the path's **first cell**. Spiral completely around the containing ring clockwise or counterclockwise; then step one adjacent cell inward and continue the next ring without re-choosing a start or direction. For base60, remove the 76 first-ring positions after completing all four rings to retain the 180 inside positions. For base59, the 151 starts on the second ring and the entire inward path already has 180 positions. The sequence of known p56 plaintext is independently reconstructed with the source-authenticated successive-prime-totient cipher and the lone literal-F key skip at p56 offset56; append the source's clear p57. Score the source table values as raw bytes or φ(bytes) modulo29 under either additive sign, without fitting a phase:

- **16 intact known-terminal trials** (two radices, two directions, raw/φ, ±): direct byte-residue-to-plaintext agreement is **at most 11/180**; agreement with the *actual historical p56 key differences* is **at most 6/85**. The transformed 180-rune text remains near-uniform, IoC **0.03197–0.03749**, without an authentic 180-rune prose/key readout.
- **Eight direct outer-ring key consumers** (conventional base60, both directions, raw/φ, ±) against **all original 76 p55 cipher runes** yield transformed IoC **0.03053–0.03790**, nonprose. Thus the newly available exact starting cell does not rescue an additive 76-rune p55 inverse.
- **Eight independently specified base59 EMERGE consumers** start from the physically adjacent outer cell151 reached from interior FIND=151, winding clockwise or counterclockwise with raw/φ and ± GP29. Their original p55 candidate IoCs are **0.02947–0.03825**, still ciphertext-like; no GP plaintext. All eight exact source-native positive plants round-trip to clear p57 text.
- The implementation verifies real p56 prime/totient decryption and runs complete **source-native exact forward/backward plants** for each candidate keystream, which recover the original clear terminal text; the null original result does not come from an invalid inverse.

The source-exact ring and outward-emergence variant passed the [Windows Node.js 22 manual original SFT run 44078492803](https://github.com/FlareZ123/liber-primus/actions/runs/44078492803), commit `7f61372`. The later same-file addition of the p55 first-prime151/F-transparent obstruction has source-level original-input calculations and exact native plants; its distinct [complete Windows job 44079347619](https://github.com/FlareZ123/liber-primus/actions/runs/44079347619) was still queued as of 12:13 UTC, so do not count that extension as CI-passed yet.

The [read-only Node22 single-file original SFT](../sims/lp2_p57_find151_rival_radix_ring_original_sft.cjs) asserts original physical glyphs, source GP-prime sum151, unique addresses in both radices, all 256 ring positions, 85+95 genuine known terminal runes, 16 exact readouts, eight perimeter and eight base59-outward p55 source inverses and source-native round trips. The frozen start is new and independently source-motivated, but the numeric-to-GP key law remains a *hypothesis*. There is no recovered unknown plaintext or authentic cipher key.

### Exact authentic p56 prime-totient continuation using FIND=151

The second, historically source-selected operation is **the actual cipher of solved p56**: successive ordinary primes' totients modulo29, with an unencrypted, non-key-consuming plaintext GP `F`. This supplies an unusually narrow actual decipherment attempt: use the independent p57 **FIND=151** as the **first prime**, then decode the adjacent original p55 76-rune perimeter. The ordinary-prime rank is fixed: **151 is the 36th prime**; no phase, key period, page offset or mask is fitted. The full legal inverse branches at ciphertext F, preserving the literal-F and key-consuming non-F possibilities. Both arithmetic signs are considered with independent source-native exact controls.

**The genuine p56 encryption direction is impossible at p55 rune offset14, before the first ambiguous ciphertext F at offset15**. The 15th scheduled prime after 151 is **229**, whose totient residue is `228 mod29 = 25`; the original p55 ciphertext at rune14 is **GP AE, index25**. Its forced decrypted symbol would be **GP F, index0**, which must have been transmitted literally as ciphertext0 under the historical rule. The source rune is AE, so no secret F history, future plaintext choice or language model can repair the contradiction.

The opposite, historically unselected encryption sign survives only two full paths: literal-F offsets **[15,25]** or **[15,41]**, with respective source-output IoCs **0.03754** and **0.03579**, and no readable GP prose. Exact positive plants of 76 authentic clear p57 runes correctly encrypted with a prime151 starting schedule are recovered under the same inverse enumerator; the actual p56 85-rune cipher is also independently recovered from its authentic prime2 starting schedule. This is a deterministic original-input rejection of the **named historical decryptor from the newly source-word-selected prime151**, not a broad statement about other cipher operations or keys.

**New decision:** Preserve `p57 FIND → 151 → one of two physically different table cells` as a concrete historical human-clue candidate alongside the red-heading/row27 route. The direct table-key and historically authenticated prime151/F-transparent consumers fail on the original p55. No source-backed operation distinguishes base59 from base60 or supplies a correct p55 inverse. Do not promote the base59 interior reading to an author-confirmed radix, or iterate arbitrary spiral starts/radix variants merely to raise language scores.

## Exhaustive within-manuscript specificity check

The [self-contained source-exact test](../sims/lp2_p0_red331_row27_totient_sft.cjs) re-parses the canonical 55 rune-bearing unknown pages, validating **2,896 complete printed words**, **12,956 original ciphertext runes**, and all word carries against the independent corpus. There are **2,895 consecutive printed-word pairs**; exactly **19** have the source heading's 8-rune followed by 5-rune word lengths.

For each original adjacent pair \`(left,right)\`, compute its two *original ciphertext* GP-prime sums \`A,B\`, select row \`r=A mod32\`, take the row's final byte \`t=T[8r+7]\`, and require simultaneously

\`\`\`text
A−B=32
A+B=512+φ(t).
\`\`\`

Across all **2,895 source-word pairs**, **exactly one** satisfies both conditions: the red opening pair \`(A,B)=(347,315)\` with row27, \`t=151\`, \`φ(t)=150\`. This is an exact enumeration of a **postselected** grammar, with no unrestricted mutation, red title exceptions, or selection on the subsequent black plaintext. It is stronger than simply restating the numerical equality, but does not establish a discovery-wide significance level: selecting the formula after seeing the target pair and among many previously examined source relationships invalidates an ordinary naive random-hit p-value.

A falsification of this observation would be a corrected original word transcription, a re-adjudicated table glyph that changes row27/col7, an inconsistent original GP-prime alphabet, or another qualifying pair under the fixed grammar. None is observed in the canonical source snapshots.

## Two exact, frozen original-cipher consumers

The first decoder requires no external key: use the eight selected original table bytes as a repeating additive GP29 key **starting immediately after the large 13-dot heading mark**, on the remaining **249** p0 black-body runes. Test the two conventional signs \`P_i=(C_i±T[27][i mod8]) mod29\`. The source GP-index coincidence results are **0.03423370902966706** (subtraction), **0.03345640627024226** (addition). Both are essentially the uniform GP29 register, with no readable opening or full-page English. The inverses exactly re-encrypt all 249 source runes, confirming arithmetic but not a true key. No arbitrary phase, different key layout, hidden IV, word reset, or extra layer is fit to the negative output.

Second, the row's unique terminal **151** itself provides a concrete *prime-valued* key cursor. The genuinely solved LP2 p56 uses **consecutive-prime totients with transparent plaintext GP F**. Test the especially direct continuation of that historically authenticated method on p0's first black-body runes, with **151 as the first prime**. Original p0 black-body ciphertext starts \`TH J G AE\`, indices \`[2,11,6,25]\`:

1. First key \`φ(151)=150 mod29=5\`; \`2−5 mod29=26\` gives plaintext \`Y\`, a legal first non-F rune.
2. The next prime is **157**; its \`φ(157)=156 mod29=11\`. The second glyph therefore forces \`11−11=0\`, or plaintext GP \`F\`. But in the source-authenticated p56 transparent-F rule, an F must be printed **literally as ciphertext F** and must not spend the key. The original second black glyph is **J**, not F.

**The p56-style prime151 direct inverse is therefore impossible already at black-body rune index1**, irrespective of later language-model choice. A nontransparent or differently initialized rule would be a distinct hypothetical decoder requiring a separate source instruction. This second test is a true exact structural rejection of the frozen p56 continuation.




## A sharply constrained source numeral stencil: 1-step and 7-step in row27

The selected row has a **second internally structured carrier**, independent of the terminal byte151. Its four consecutive printed tokens at zero-based columns3–6 are

\`\`\`text
0x  0w  0q  0p    (four original printed cells)
59  58  52  51    (canonical radix60 byte values)
\`\`\`

They form an exact 2×2 arithmetic stencil

\`\`\`text
59   58      horizontal decrement 1
52   51      vertical decrement 7
\`\`\`

The pairwise source facts are \`59−58=52−51=1\` and \`59−52=58−51=7\`. This **stride7** has an independently authenticated historical operation: Cicada's 2014 Stage05 used an explicit *seven-position transposition*. The actual source-exact Stage05 inverse is \`[0,6,2,5,1,4,3]\`, as recorded in [its authenticated original-cipher regression](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md). There is no instruction applying Stage05 to the LP2 grid or specific pages. The stencil is a concrete hypothesis for an authored width/direction hint, not an identified cipher.

This structure is unusually localized in the fixed source corpus:

- Among **all 253 consecutive four-byte windows** in the 256-cell original table, the *only* window satisfying \`[v,v−1,v−7,v−8]\` begins at byte **219**, which is **row27/column3**.
- Among all **32 complete eight-cell rows**, row27 is the **only row with two descending-by-one adjacent pairs**. The other two such pairs in the entire table occur singly at row4/col0 and row19/col6.
- **The second descending pair also sums to 103:** \`52+51=103\`. Across all 32 original rows, **the only same-row adjacent byte pair with total103** is row27's column5+6 pair, beginning at global cell221. The **103rd one-based printed table cell** has original token \`0W\` and gives the decimal byte **32**.

The number103 is independently singled out by another exact manuscript source: immediately **after the repeated six-rune marker on p27**, the first complete printed word \`AE.F\` at p27 offsets34–35 has original GP-prime sum **103**. Earlier [p27→table103→p32 navigation work](lp2-p55-p27-table103-p32-tree-navigation.md) noticed that one-based cell103 gives **physical-page-shaped numeral32**, pointing to p32's blurred tree, which has an independently confirmed visual correspondence to p55's tree. The new *row27* pair \`52+51\` yields **the very same address103** *before* the p27 word is even consulted. This supplies two physically separate original operands for the already investigated p27→p32 candidate hop. It still does not authenticate the rule that a neighboring-byte pair should be summed or that the table-cell's byte should be read as a page number.

This also makes the radix rivalry more discriminating. Under the genuinely valid **radix59** reading, the four tokens become \`[58,57,51,50]\`; the **1×7 stencil survives**, but the final pair's total is **101**, so it no longer matches the original p27 word total103 or one-based cell103=32. Together with the separately identified terminal-\`2V\` totient equation, **two distinct, source-backed numerical equalities conditionally prefer radix60**, while the 1×7 stencil is radix-invariant. These equalities are analyst-selected and must not be treated as proof that Cicada intended either the arithmetic route or that radix59 is mathematically excluded.

### A deliberately narrow shuffle calibration

The [reproducer](../sims/lp2_p0_red331_row27_totient_sft.cjs) gives a fully exact *conditional* rarity calculation using the original 256-byte multiset. With all byte frequencies preserved and byte positions uniformly permuted, the count of admissible **ordered four-position tuples** of the prespecified form \`[v,v−1,v−7,v−8]\` is exactly **276** among

\`\`\`text
256 × 255 × 254 × 253 = 4,195,023,360
\`\`\`

possible ordered draws. Each specified four-cell window has exact chance **6.5792243884 × 10⁻⁸**. The expected number in all **253** sliding windows is **1.6645437703 × 10⁻⁵**; by Markov's inequality, this also bounds the chance of at least one such fixed-form stencil under that particular random-permutation null.

**This is not a discovery-wide p-value.** The horizontal1, vertical7 geometry was recognized after examining the source row, and the grid may have cryptographic/typographic dependence that violates the shuffle null. Existing pre-2014 **seven-column** operations and the independently selected source row27 make the pattern motivated enough to preserve as an unexplained possible authored marker, yet they do not retroactively make an exploratory motif search preregistered.

### Literal original Stage05 readout on the uniquely aligned seven-rune bookends

The p27 repeated fragment begins at **p27 local offset28 = 4×7**. The terminal copy begins at **p55 local offset70 = 10×7** and extends to exactly seven runes by adjoining the first authentic ciphertext GP rune of solved p56. This yields a **77-rune p55+p56 seam = 11×7**, naturally divided into complete seven-rune blocks. Crucially the source copies align at corresponding **seven-block boundaries without any fitted phase**.

Apply the *exact historical* Stage05 inverse \`[0,6,2,5,1,4,3]\` separately to p27's complete 7-rune blocks (234 rune page, last three untouched) and to the canonical p55+p56 77-rune seam. The duplicated ciphertext seven-block \`[23,11,1,17,18,10,25]\` maps to the *same* permuted seven-symbol block \`[23,25,1,10,11,18,17]\` at both locations. In source-native GP spelling this is \`D AE U I J E B\`, an uninterpretable fragment. The beginning of p27 after the complete fixed transposition reads \`M A Y O P S L AE M L I H EO E L...\`, and the terminal seam begins \`NG B M S AE W I X TH S D M G EO...\`; there is no authentic readable prose. This is a **specific original-input negative**, rather than an argument against all seven-column ciphers or a second layer. Prior Stage05 tests on other section clocks also failed; the seven-rune seam alignment here is the new source-selected case.

The most productive next discriminator would be a **creator-authenticated instruction specifying how the 1×7 stencil supplies a key schedule or table traversal**. A complete original sentence on p27, p32, or p55 would substantiate the route. Further arbitrary 7-column permutations, pad offsets, or page hops chosen after reading results would erase the clue constraint.

## Independent destination clue: source row 27 identifies the first of two repeated bookend pages

There is a materially separate *navigation* interpretation of the same source-selected zero-based **row27**. It also names **physical LP2 page27**, the last page of the first 28-page half of the 56 unsolved physical-page slots. The corresponding page in the second half is **p55**, the final unsolved page immediately preceding the solved p56.

Earlier researchers, independently of the current p0/table arithmetic, established that the entire **12,956-rune original unknown cipher** has **exactly one cross-page identical six-rune sequence**. It occurs at **p27 local offsets28–33** and **p55 local offsets70–75**, has GP indices \`[23,11,1,17,18,10]\`, and is the literal last six runes of p55. The p27 occurrence has a seventh following GP index **25**; the corresponding seventh rune after p55 is the **first rune of solved p56**, also GP index25. Thus the seven-rune continuation reads identically when one crosses the real p55/p56 boundary. See [original cross-page echo report](bookend-repeat-lag6395.md) and [terminal seven-rune seam study](lp2-2013-parable-rsa-cyclewalk-original-gate.md). The present SFT independently enumerates all within-page six-rune windows across the 55 rune-bearing unknown pages and obtains exactly that one cross-page match.

This supplies a specific **potential human navigation chain** whose independent source objects were not adjusted to make it work:

\`\`\`text
p0 two red GP word sums 347,315
  → both select row27 in the 32×8 table
  → table row27 is prime-151/totient-linked to the red-title total
  → row number27 also identifies LP2 physical page27
  → p27 contains the unique cross-page six-rune echo
  → its other occurrence closes p55
  → the seventh shared rune reaches the already-solved p56 AN END
\`\`\`

**A separate, earlier recorded backward coordinate converges at p27.** The duplicated p55 footer is not an arbitrary six-rune block: it comprises two complete printed words \`D.J.U\` and \`B.E.I\` of original GP-prime sums **129** and **159**. Before the p0/table link was noticed, the [p55→p27 word-pair analysis](lp2-p55-p27-wordpair-table-route.md) and [first table navigation report](lp2-p55-p27-table103-p32-tree-navigation.md) had recorded the conditional arithmetic \`(129+159) mod29 = 27\` and \`(129−159) mod29=28\`, which names **exactly p27 local offset28**, the actual copied footer. That backward p55→p27 address used the published **29-rune alphabet** as modulus, whereas the new forward p0→row27 address uses the independently printed **32 table rows**. Their convergence on the same p27 page is a specific cross-source observation, but each *operation* was hypothesized after the target was visible. They must not be multiplied into a probability or represented as authenticated creator directions.

The 2016 signed Cicada wording about words, numbers and direction gives contextual motivation for *navigation*, but **does not authenticate this route**, the table-to-page identification, or what to do after following the ciphertext echo. The page27/55 six-rune repeat was a known ciphertext observation and **is not a recovered plaintext phrase**; independent cryptanalysis rejects interpreting its displacement as a simple globally repeated additive key. The row27/page27 relationship could still be a retrospective coincidence.

As a literal next-key alternative, apply the selected eight row27 bytes with position-zero GP29 additive clock to **p27 (234 runes)** and **p55 (76 runes)** independently. The exact original-source IoCs under subtraction/addition are **0.0335644327 / 0.0360588386** on p27 and **0.0421052632 / 0.0291228070** on p55. These are not native-GP language. Their original rune previews are nonlinguistic and their round-trip arithmetic is exact. This rejects the simplest row27-as-GP29-key consumer on the indicated bookend pages, without rejecting a source-instructed page navigation or another ciphertext relation.

**Missing decisive operation:** an authentic source instruction must say whether to treat row27 as a page address, how to read or transform the two 6/7-rune markers, or how to reach genuine plaintext. Additional coincidental page positions should not be chained until an independently supplied operation predicts a complete original word or message.

## Historically motivated RSA consumer: p=151, q=331, e=13

A stronger alternative to using a single GP29 additive row is to treat the two independent **prime-valued original source references** as a textbook RSA factor pair: **p=151** from the unique row27 terminal cell/earlier LP1 square and **q=331** from the original 2014 7×7 magic-square center (and archived HTML index). The red opening contains exactly **13 runes** and ends in a **13-dot** mark, motivating **e=13** as one candidate public exponent. RSA itself has genuine prior Cicada puzzle precedent, unlike a newly invented algorithm; see [original historical RSA source survey](grid-rsa-factor-test.md). The assignment of these primes and 13 as an RSA key remains conjectural because the manuscript supplies no such instruction.

This yields a fully defined public/private key without guessing any unknown plaintext:

\`\`\`text
p=151, q=331, N=pq=49,981
φ(N)=(151−1)(331−1)=49,500
e=13, gcd(e,φ(N))=1
d=e^(−1) mod φ(N)=38,077
\`\`\`

There are two simple **packet-domain obstructions** on unmodified original source data.

* A conventional **two-byte big-endian RSA ciphertext packet** from the printed 256-byte table must be an integer less than 49,981. Among the complete **128 original 16-bit byte pairs**, **32 have value ≥49,981**; the very first equals **52,199**. Such pairs cannot all be textbook RSA ciphertext residues under this modulus, regardless of the exponent or plaintext.
* The original p0 black body contains **249 = 83×3** GP29 runes after its red title; grouping from that original title terminator gives exactly **83 complete three-rune base29 packets**. Their integers all fit \`29³=24,389\`, which is below the RSA modulus. However the private exponent applied directly to them produces **46/83 recovered values ≥24,389**, and hence those outputs cannot fit the original **three-GP-rune plaintext block size**. The first original black triplet has packed integer **2,007**, whose RSA private inverse is **28,814**, already out of range. This rejects the literal fixed-width three-rune textbook RSA inverse with unchanged output length.

A natural conventional workaround is **RSA cycle-walking**, repeatedly applying RSA until the result returns to the representable \`[0,29³)\` packet domain. This creates an exactly invertible *hypothetical* three-rune format-preserving transformation over any original ciphertext, so it is worth one direct original plaintext screen. With the source key frozen above, apply both the public (13) and private (38,077) exponents, and either a book-continuous three-rune packet clock or physical-page-local three-rune packet resets; copy trailing one/two runes unchanged. Preserve all **12,956 original LP2 unknown runes**, with no fitted phase, block size, alphabet or unprescribed subkey. The original-input outcomes are:

| Cyclewalk exponent | Packet clock | Full original output GP29 IoC |
| --- | --- | ---: |
| 13 | Book continuous | **0.0344670302323** |
| 13 | Physical page reset | **0.0344917196809** |
| 38,077 | Book continuous | **0.0344992981023** |
| 38,077 | Physical page reset | **0.0344840101861** |

The original unsolved cipher has \`IoC = 0.0344783978645\`; original clear p57 has \`IoC = 0.0627099664054\`. All four transformed outputs remain near-uniform GP29 with nonlinguistic first-page previews. The exact inverse of each candidate recovers all 12,956 unchanged original cipher runes. **Critic implementation correction (17 November):** an earlier version of the page-reset SFT mistakenly read each source page's original `indices` instead of slicing the supplied input at those page lengths. The reset-mode *forward outputs and all four quoted IoCs* were already computed from the original correctly; its claimed inverse assertion, however, could not have passed on the old implementation. The repaired function now consumes its actual input, preserving original physical page boundaries. An independent source-corpus calculation yields **0/12,956 mismatches** for all four inverse pairs. The old reset path would have yielded **12,437** mismatches for the `e=13` forward / `d=38,077` reverse case and **12,439** for the opposite pair. This repair supplies implementation correctness only; the negative original-language decision is unchanged. An independent **93-rune native clear p57** positive sample is encrypted with e=13 cyclewalk and decrypted with d=38,077, recovering the exact 93-runic sample; this validates the implementation's packet mapping, **not** the historical key. No unknown LP2 plaintext emerges.

**Decision:** this specific cross-source **RSA(151×331,e=13)** as a literal table-16-bit packet, unchanged-length direct GP29 triple, or direct GP29 triple cyclewalk is a **bounded negative**. There is no reason to iterate over new exponents, larger packets, padding formats or hidden clock adjustments without an independently authenticated RSA instruction. The arithmetic p0/table crosslink remains independent of these failed consumers.

## Research decision

The original p0 red word-pair → row27 → unique151 → φ150 route is a **concrete, internally consistent numerical cross-artifact candidate**. It may be a puzzle-maker checksum, a clue pointing at the table/prime, or a retrospective numerical construction. The evidence does not yet tell those apart. The complete table-row direct GP29 consumer and the source-numbered RSA cyclewalk are nonlinguistic; literal RSA packet formats are algebraically contradicted; the simplest p56-verified prime151/F-transparent direct transfer fails immediately. **No previously unknown LP2 plaintext, genuine key, or continuation has been recovered.**

The weakest premise is the unspoken **word-sum-to-row address plus eighth-cell selector**. A meaningful successor would find an independently dated author-visible instruction linking **32 rows**, **151**, and a decipherment *operation*, or use a predeclared row-derived transformation to recover substantial original plaintext on withheld positions. Avoid searching additional moduli, row offsets, cipher families or GP clocks merely to accommodate this arithmetic.

**Reproduction:** [read-only, single-file Node.js 22 CJS original-source test](../sims/lp2_p0_red331_row27_totient_sft.cjs). The original operands, word-pair enumeration and proposed inverses were independently evaluated against fetched exact repository sources inside this invocation; the source-committed SFT is not yet represented as having passed CI.
