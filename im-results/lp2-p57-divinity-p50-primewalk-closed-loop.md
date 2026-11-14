# Solved p57 words locate a p50 within-word byte checksum and the zero/F boundary

**Agent12, 14 November 2026. Classification: source-exact numerical/navigation hypothesis, with no recovered unknown LP2 plaintext, source-selected complete cryptographic key, independently instructed decoder, or destination.** The strongest p57 observation remains two *within-word* byte equalities selected by original solved text. Agent1's full 45-word scan of the authenticated signed-2016 message adds a separate p56/p50 alignment: THEIR/MEANING select the known p56 span END WITHIN THE DEEP, while LIES selects the rune-free p50 page and its 193/00 marker. These are candidate navigation clues, not an unknown-page decryption. The original p57/p50 SFT had a passing Windows CI run (#43638766952); this update extends it with the full-message/p56 assertions, which were executed against the original source inputs in this invocation but are not covered by that earlier CI run.

## Original instructions and fixed source inputs

The actual solved **p57 PARABLE** says: “LIKE THE INSTAR TUNNELING TO THE SURFACE. WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.” Its Latinized GP29 rune spellings use **TUNNELNG** for TUNNELING and **DIUINITY** for DIVINITY. Both phrases point naturally to removing the outside of a word and attending to its interior. **DIVINITY** is also the known, previously solved LP1 Vigenère keyword. The prime weights of all 29 GP runes are historically established.

Separately, the original numeric pages **p49–51** print **256 two-character conventional base60 bytes** in a 32×8 joined grid, with 80 tokens on p49, 104 on p50 and 72 on p51. The source numeric decoding was independently matched at 256/256 tokens to an external original-stream reference [in the existing corpus work](lp2-p50-directional-functional-graph-prime-ordinal-starts.md). Treating a complete word's GP-prime sum **modulo 256** as a **one-based table address** is our proposed navigation convention, not an author-signed operation.

The original **2016 authenticated signed message** says “The path lies empty; epiphany seeks the devoted” and “Its words are the map, their meaning is the road, and their numbers are the direction.” The full-message GP29 scan below now yields a specific p56/p50 alignment under the candidate 58-page address rule. The source still does not explicitly state GP-prime summation, modulo58, quotient-as-word-index, keypad orientation or recursive use; those remain hypotheses.

## Two separate p57 words obey a within-word table equation

Define for each original solved GP rune word W:

\[
S(W)=\sum_{\text{runes }r\in W}\operatorname{GPprime}(r),\quad
a(W)=1+((S(W)-1)\bmod256),\quad
I(W)=\sum_{\text{runes excluding first/last}}\operatorname{GPprime}(r).
\]

Our observation is that **for two solved p57 words** the original table byte at address \`a(W)\` equals precisely the word's **interior** prime sum.

| Original solved p57 word | Whole GP-prime sum | 1-based source address | Original printed token and byte | Interior GP-prime sum |
| --- | ---: | ---: | --- | ---: |
| **TUNNELNG** (TUNNELING) | **339** | **83** | \`3L\` = **201** | **201**, stripping T and NG |
| **DIUINITY** (DIVINITY) | **376** | **120** | \`34\` = **184** | **184**, stripping D and Y |

The complete eight GP primes of DIUINITY are **89+31+3+31+29+31+59+103=376**. Its interior **I U I N I T** sums **31+3+31+29+31+59=184**. TUNNELNG's interior **U N N E L** sums **3+29+29+67+73=201**. Both byte values happen to have \`floor(B/29)=6\`, so under the pre-existing q+1 keypad they point northwest. That last shared direction is a consequence of the two byte equalities, not an independent discriminator.

**Original full-word census:** exactly **2 of the 20 p57 words** satisfy this unchanged equation: word indices 4 (TUNNELNG) and 16 (DIUINITY). Their locations make the selection more interesting than arbitrary strings because p57 itself speaks of tunneling, shedding circumferences, and finding DIVINITY within. The other 18 original complete words do not match.

The same equation applied to all **2,896 complete original unknown p0–55 ciphertext words** (12,956 source runes; page50 rune-free) finds only **six exact matches**, at sequential whole-word indices **161, 360, 953, 973, 986, 2013**, distributed over physical pages p3, p6, p17, p18 (twice) and p37. These are opaque ciphertext words, not a discovered translation or general cipher-law. The absence of a universal match sharply restricts the proposal to a possible **selective navigation marker**; a decryption model would still need a rule for all the remaining original runes. As a separate context check, the LP1 canonical runic corpus has three within-word matches at word indices 407,418,557, all **the same previously known DIVINITY word repeated**; repeated use is not independent confirmation.

The table's bytes \`201\` and \`184\` each occur twice in its 256 entries, and no input data were altered to make the two selected sites match. This is a post-discovery observation from inspecting a large body of earlier unsuccessful routes, so it cannot alone authenticate design.

## Existing p50 GEM cycle gained a new solved-source entry

The pre-existing graph decomposes each canonical byte as \`B=29q+r\`: GP rune \`r\` is read and \`q+1\` chooses the standard numeric keypad move (1=SW, 2=S, 3=SE; 4=W, 5=stay, 6=E; 7=NW, 8=N, 9=NE). Stop before entering an already visited cell; no grid wrapping. The mapping and unique **GEM** three-cycle at cells119→127→128 were reported *before* this p57 word discovery. The keypad remains conjectural as an author operation.

**DIUINITY's independent solved-source whole-sum address, 120**, follows that unchanged graph:

| 1-based cell | Original token | Base60 byte | \`q,r\` | GP rune / prime | Move |
| ---: | --- | ---: | --- | --- | --- |
| 120 | \`34\` | 184 | 6,10 | I /31 | NW →111 |
| 111 | \`0W\` | 32 | 1,3 | O /7 | S →119 |
| 119 | \`0Z\` | 35 | 1,6 | G /17 | S →127 |
| 127 | \`2h\` | 163 | 5,18 | E /67 | E →128 |
| 128 | \`3D\` | 193 | 6,19 | M /71 | NW →119 |

This yields **I O G E M**, then repeats **G E M**. The already identified **signed-2016 image's prime-width ordinal start103** follows 103→111→119→127→128, readout **O O G E M**. The **two independently sourced starts meet at original cell111**, although their address derivations and graph interpretation are choices; they are not proof of an author-selected key.

The new five-node readout also has this exact **post hoc** closure:

\[
\operatorname{GPprimeSum}(\text{I O G E M})
=31+7+17+67+71=\mathbf{193}
=\operatorname{byte}(\text{terminal cell128}).
\]

If, as a *separate hypothetical* next step, the complete-route prime sum is another **one-based table address**, original **cell193** contains literal **\`00\`**, base60 value **zero**, GP rune **F**. Its quotient \`q=0\` would move SW and exit the 32×8 grid immediately from its left edge (row25,col1). This is an appealing finite **zero/F exit**, with parallels to known historical plaintext-F transparency and p57's word “EMERGE.” These parallels supply no direct plaintext decryption rule.

The **TUNNELNG** address83 instead enters its own two-cycle: cell83 \`3L\`=201, rune IA / NW → cell74 \`1J\`=79, rune NG / SE → cell83. It does not reach the GEM cycle. Therefore the two *within-word checksums* coexist with genuinely different graph destinations; they are not falsely presented as a single long keystream.

## Signed-2016 word map and p57 title converge on p56 and p50 cell193

**Agent1 full-message cross-check (14 November 2026).** I applied the candidate word-address rule to the complete original authenticated 2016 signed cleartext, not a hand-picked subset. All **45** alphabetic message words encode under the source-native GP29 orthography already used by the independently solved LP1/p56 lexical control (including the established QU→CW, V→U, K→C, Z→S, ING→NG and IO→IA normalizations). For each word W, let S(W) be the sum of its GP prime weights, then tentatively address physical page S(W) mod 58 and zero-based local word index floor(S(W)/58). This formula is still a hypothesis; the signed message does not explicitly state the GP-prime sum, modulus or quotient convention.

The unique adjacent **non-identical** message-word pair that maps to the same page at different local indices is **THEIR → MEANING**:
- THEIR: 5+67+31+11 = **114 = 58×1+56**, so p56, word index1.
- MEANING (source spelling MEANNG): 71+109+29+79 = **288 = 58×4+56**, so p56, word index4.
- Their difference is **174 = 3×58**, so the selected p56 positions are exactly three word steps apart. The repeated later **THEIR** maps back to p56 index1.

The independently solved p56 plaintext is **AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE**. Its word indices1 and4 are **END** and **DEEP**, with **WITHIN THE** between them: the mapped span is exactly **END WITHIN THE DEEP**. Thus the signed phrase **“their meaning is the road”** selects the two endpoints and the intervening road on the known p56 text. The original p56 ciphertext words at those positions are OESR and CTHGW; their plaintext is independently established by the existing [known-key, original-cipher p56 lexical Viterbi SFT](../sims/lp2_ftransparent_original_lexical_viterbi_sft.cjs). This is a cross-round source alignment, not new p56 decryption.

The same complete-message census finds **LIES** as the **only** word that maps to p50: L73+I31+E67+S53=**224 = 58×3+50**, hence physical p50, local token index3. P50 is the unique rune-free physical page (numeric_grid_only); its fourth original token is **3D**, global joined-grid cell84, canonical base60 value **193**. The source phrase “The path lies empty” therefore has a plausible page-level referent. This original byte is also the existing candidate pointer to global **cell193**, whose token is literal **00** and whose value is zero.

The full-message census is more constraining than the isolated LIES coincidence, but it does **not** authenticate the address formula: the message says “words are the map” and “numbers are the direction”, not “sum GP primes, divide by 58, use quotient as word index.” The THEIR/MEANING p56 alignment is an exact, reproducible navigation hypothesis and a plausible human-visible clue, not a cipher law or recovered unknown plaintext.

A **new candidate, literal byte-to-next-cell continuation** yields

\[
\text{signed source LIES}\to(p50,\text{local token 3})\to
\text{global cell84}\,[3D=193]\to
\text{global cell193}\,[00=0].
\]

This resolves the signed source's word **“lies”** into an *empty/zero* terminal, but the exact algorithm was assembled from separately available operations and **not given as an instruction by 3301**. There are exactly two occurrences of byte193 in the original table, at cells84 and128; one appears in this signed-word route, the other as terminal of the DIUINITY GEM route.

**A concrete interval consequence, already independently documented:** the two \`3D\` byte193 markers at one-based **cells84 and128** enclose exactly **43 unchanged original base60 bytes**, positions85–127. This is the same interval previously proposed for comparison with **p55's 43 strict word-interior runes**, with direct additive source-order and alternative square-based methods already found nonlinguistic in [the existing 2014/2016/p50/p55 selector gate](lp2-2016-p50-p55-43unit-source-selector-gate.md). The present p57 clue-derived path supplies a **different source motive for reaching the second marker**: the word DIUINITY, which the solved PARABLE explicitly commands the solver to find within, terminates at cell128 without tuning the old keypad. The signed 2016 word LIES supplies the first marker at cell84. Thus this source-linked pair of endpoints could independently identify **which 43 table bytes** to examine; it still supplies **no reversible mapping to the 43 ciphertext interiors**. The exact source-order 43-byte to 43-rune additive consumer is already negative. A new exhaustive **841-parameter globally affine GP29** extension on this same source-fixed alignment is also nonlinguistic, far below 2,000 exact-word-shape native GP English controls; see [the integrated original-cipher exclusion and passing Windows test](lp2-2016-p50-p55-43unit-source-selector-gate.md#full-affine-gp29-key-family-on-the-source-selected-p50-43-byte-interval-new-bounded-negative-agent12). Pure 43-rune permutations retain the exceptionally low ciphertext IoC, so they remain excluded for ordinary GP English. Further arbitrary key sweeps on this alignment lack independent operator evidence.

**Another p57 source-exact entrance into the same cell193** arises from its first printed/title word **PARABLE**. The seven original GP runes of PARABLE have prime sum **449**, and \`449 mod256=193\`; directly interpreting this as a one-based table address points to **literal \`00\` at cell193**, with no keypad or intermediate text needed. Thus **signed-2016 LIES**, **solved p57 PARABLE**, and the **candidate DIUINITY graph-path checksum** converge on the same original zero-value cell through numerically distinct conventions. Because these conventions were explored after observing the sources, the convergence is a **composite hypothesis**, not three independent pre-registered validations.

Original table cell193 is the only one of the two literal zero bytes located on its leftmost column: the other original \`00\` is at cell230. The finite exit is a real spatial feature, conditional on the q/keypad convention.

## Finite original-source tests and limits

The [SFT](../sims/lp2_p57_divinity_p50_primewalk_sft.cjs) asserts all the cited **actual original rune strings, word sums, title sum, table tokens/bytes, full 45-word signed-2016 GP29 map, unique adjacent THEIR/MEANING p56 pair, original p56 ciphertext positions and known plaintext span, LIES→p50 token3 arithmetic, full original graph paths, 2-of-20 p57 word check, and 6-of-2,896 unknown-ciphertext control**.

Its independent all-256-start graph census finds exactly **two** starts [120,123] with complete un-repeated GP-prime path sum equal to the byte of their last visited cell; exactly **four** starts [66,120,180,247] whose path sum indexes a zero byte; **only 120 satisfies both**. Exactly **one** of the original 20 p57 word-sum addresses enters the unique GEM three-cycle, the DIUINITY seed120. These are exact finite source properties.

For *conditional* shuffle calibration only, the SFT holds source start120, all graph and readout operations fixed and shuffles the **entire 256-byte multiset** 100,000 times using Fisher–Yates with deterministic xorshift32 seed \`0x12010357\`. It records 538 path-sum-equals-last-byte, 675 path-sum-to-zero, **two joint**, and zero joint with the original five-node cyclic path. **These are not confirmatory p-values:** operators, endpoints, and related numerological readouts were identified during extensive searches. The test does not correct search multiplicity or establish that a deliberate creator selected the proposed steps.

**Direct all-word message gate:** with the same frozen GP-prime-sum modulo256 addresses and q/r keypad, independently start a traversal at **each of all 20 original p57 words in printed order**, concatenating each route's first-visit GP readout. The exact sequence is \`F|D|NGA|FUB|IANG|DUJAE|NGA|IAW|EAR|JMIXTH|UOEU|SRAEDAC|JOE|XTH|HSSW|NGA|IOGEM|DC|MNG|SEAOE\`. It is nonlinguistic under the direct readout and supplies no self-contained message. The same [source SFT](../sims/lp2_p57_divinity_p50_primewalk_sft.cjs) asserts the complete, unmodified 20-word output. This rules out the simplest *universal* PARABLE-word→table-graph→plaintext reading without inventing word-selection and decoding rules.

**Research decision:** the solved author's vocabulary now gives more specific motivation to explore within-word GP-prime sums and numerical page addresses. The **two word-interior byte matches** remain the most economical p57 facts. The complete signed-2016 map adds a separate, exact cross-round alignment: THEIR/MEANING select END WITHIN THE DEEP on p56, while LIES selects the rune-free p50 token 3D and cell193 00; the p57 PARABLE→00 route converges there. This raises the navigation hypothesis above an isolated numerical coincidence, but it still supplies no key, unknown plaintext or reversible cipher. **No unknown LP2 ciphertext rune was decrypted.**

The next genuinely advancing experiment needs an independent original instruction or a fixed, simple reversible consumer for the table byte **184/201**, terminal zero/F, or their source-selected addresses, which can predict **previously unknown** page runes and re-encode them. Do not rerun generic GEM OutGuess passwords, entire 256-byte table as periodic key, divinity period-eight GP29 additive cipher, arbitrary keypad orientations or previously failed p50/p55 direct consumers. They have documented negatives independent of the present navigation coincidences.
