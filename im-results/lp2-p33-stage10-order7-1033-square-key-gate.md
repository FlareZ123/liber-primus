# p33 and the 2014 Stage7/Stage10 square reference

**Consolidated through 22 November 2026 (Agents21/25/23/26). Decision:** The p33 artwork and 49 page-local black word starts support a historical 7×7/1033-word-cell lead. **The 49th word is incomplete on p33:** its final printed rune `ᛒ` joins the two initial p34 runes `ᛗᛒ` before a word delimiter. Therefore p33 contains 196 black runes in 49 printed fragments, whereas the **49 complete black words span 198 runes** across p33→p34. Previous 196-rune whole-page tests remain correctly scoped; their 49th word operand was truncated. A carry-correct 49-word changing-state autokey has now been tested with 200 untouched p34 runes and produces no native-GP plaintext. Earlier direct 49-word shifts, stable ranks, 7×7 Hill variants, 99-pair arithmetic and full source-derived historical-knownplaintext pad reuse also remain nonprose. **Even all 29 unknown stationary rune values cannot turn the 49 complete source words into the authentic 7×7 square's cellwise GP-prime-sum residues.** The new 198=2×99 and 198=10+188 source-size interfaces supply no independently licensed LP2 cipher opcode and fail exact whole-text tests. The 49 cells and red split of 21+28 are genuine, but the original page prints five upper and six lower lines, so seven seven-word rows are inferred. Neither the historical Stage10 form nor the source page selects a word-to-square key update, rune cipher, reset/clock or cross-page handoff. Retain the original square navigation and bounded negative decisions. No unknown LP2 plaintext, authentic key or destination has been recovered.

## Corrected 198-rune / historic 99-number receiver: two genuinely different known-plaintext attacks (Agent16, 22 November)

**Current decision:** the completed 49 black p33→p34 source words supply exactly **198 GP29 runes**, while the authenticated 2014 Stage7 OpenPuff output has **99 integers** arranged in three consecutive matrices of 25, 49 and 25 cells. Two independent natural typings of that source coincidence were tested at **full original length with disjoint original p34–39 holdouts**. Both fail actual native-GP plaintext recovery. Neither the Stage7 signed material nor p33 artwork tells the player to interpret these words as the historical three-square payload, so these are explicitly source-motivated **hypotheses**, not decoded instructions or authenticated keys. Full reports of the prior 7×7/1033 square selection and the distinct 91-rune prelude remain operative.

### Pairwise 99-cell base841 receiver, including all-secret lookup bound

One candidate uses one **pair of GP29 runes per historical 2014 number**, taking the 49 complete black words, including word49's two p34 runes, as one 99-pair register with no extra reordering. The authentic 99 numbers contain **50 different integers**, while the 99 original two-rune base841 pairs contain **94 distinct values**. Source equality alone yields a key-independent obstruction to every *stationary, arbitrary secret* numeric-value→ciphertext-pair lookup: **47/50 historic numerical classes assign more than one incompatible GP pair**, and at least **49/99** original pairs must be mismatched under any such single-valued map. For instance, the same historical 434 at square cells0 and24 would need ciphertext pair codes370 and268. This is a fixed-codebook exclusion with no candidate-key fitting.

The weaker conventional source-number receiver was nevertheless tested directly. Convert original GP rune pairs to base841, apply each original historic number modulo841 in both GP-rune endian orders under ± sign, then convert back; also test the simpler literal source value modulo29 shifting each pair's two GP symbols equally. All **six** authentic full198-rune outputs are nonprose, **IoC 0.03302–0.03881**, with 6/6 exact original reencryptions and **6/6 198-rune solved-p57 native-GP positive plants**. Importantly, several historical 2014 square entries exceed 840, making any literal two-GP encoding of the original unbounded values lossy; modulo841 is a specified test assumption and cannot be silently promoted to an authorial convention.

To test whether the original p33 pairs might instead contain the *known historical values as plaintext* encrypted by an unknown reused 99-pair pad, **derive all 99 pad integers** from original p33 GP pairs and the 99 historic source values, for both standard Vigenere and Beaufort mod841 laws and both input digit orders. This has **zero free key guesses**. Reuse that single recovered full99-pair pad on **five separate untouched 198-rune sources**: p34 after the p33 carry and p35–p38 from local rune0. All **20 independent decodes** are nonprose with IoC **0.03276–0.03687**, original replay20/20, authentic native source-p57 planted controls4/4. The [exact pairwise source SFT](../sims/lp2_p33_stage7_99cell_pair_carry_source_sft.cjs) and the [source-knownplaintext pad SFT](../sims/lp2_p33_99square_knownplain_p34_38_reuse_sft.cjs) passed Windows Node22 [45078020783](https://github.com/FlareZ123/liber-primus/actions/runs/45078020783) and [45078451512](https://github.com/FlareZ123/liber-primus/actions/runs/45078451512). A recovered mathematical keystream under a hypothetical known plaintext is not evidence the known plaintext is correct.

### Exact no-overflow original 188-digit base29 receiver and ten-rune IV

The 99 historic integers have **canonical shortest exact base29 numeral encodings** of lengths **58,82,48 GP digits** for the historical order5/order7/order5 matrices respectively, total **188**. Unlike the pairwise modulo841 branch, this loses no source integer information. The original complete-word black region has **198=10+188** GP runes, and original p33 starts with a separate **10-rune red rubric**. That is a concrete physical size coincidence and arguably a reason a human could try a ten-rune preamble, but no original caption instructs a reader to treat the **first ten black runes** as an IV or to read the remaining 188 as encoded historical square contents. The rubric itself is not the black IV.

Freeze a source-minimal hypothesis: black runes0–9 are a ten-rune initialization, black runes10–197 are the 188-position ciphertext; the known plaintext is exactly the complete historic source numbers encoded in shortest base29 in their authentic order, with no post-selected offsets or character variants. Derive a period10 GP29 additive key from **only the first ten** aligned known cipher/plain pairs, then predict the other **178 original p33 ciphertext runes**. It predicts **7/178 exact rune matches**, versus **178/29≈6.14** under random alignment; the ten derived key values differ in **all ten positions** from the original 10-rune red heading. The textbook source-lag-10 plaintext/ciphertext autokey relations hold for only **2/178** and **10/178** subsequent positions. This rejects those fixed, short, human-plausible codecs without language modeling.

A stronger no-key restriction grants **ten entirely arbitrary secret rune enciphering codebooks**, one per original phase modulo10, mapping each known GP29 numeral digit to its observed original GP ciphertext rune. The actual source has **128** distinct (phase,known rune) input classes; **48** classes demand mutually incompatible ciphertext outputs, requiring a **minimum 58/188 original rune errors** under *every* such stationary ten-phase cipher, including all possible substitutions. No secret 29-symbol codebook can fix this exact claimed historical plaintext under its frozen positional clock.

Finally, allowing an arbitrary **188-symbol source-derived key**, recover the entire hypothetical Vigenere/Beaufort key from p33 black runes10–197 and the 188 exact historic numeral digits. Try its unmodified phase-zero reuse against **six original untouched 188-rune page segments**, p34 following the carry plus p35, p36, p37, p38, p39. All **12/12** holdout decodes are random-like (**IoC 0.03339–0.03601**) and yield no coherent native-GP plaintext; original replay12/12 and exact solved-p57 native188-runic plants2/2 pass. Therefore this more exact key-source correspondence also lacks a demonstrated transferable plaintext mechanism. [Single source-exact Windows Node22 CJS SFT](../sims/lp2_p33_stage7_188digit_iv10_source_sft.cjs) and [CI run 45078832782](https://github.com/FlareZ123/liber-primus/actions/runs/45078832782).

**Scientific boundary and next decision:** the 198↔2×99 and 198↔10+188 correspondences are arithmetic consequences of authentic historical square values and the corrected original p33 cross-page 49th word. They are **not** independently issued cipher instructions, GP-rune keys, or coherent plaintext. The direct stationary number-codebook, arbitrary ten-phase codebook, repeated-key, autokey, and source-knownplaintext full-key reuse models are specifically defeated. A serious successor requires first-party evidence selecting a different lossless payload/clock or a concrete cross-page cipher-state handoff, with whole untouched prose prediction. Do not expand this into free phase/offset/pad/permutation searches.

## Complete 49-word all-secret prime-sum checksum exclusion (Agent16, 22 November)

The corrected source gives **49 complete words / 198 GP29 runes** across the original p33→p34 carry. A materially stronger alternative to directly comparing each visible word's *existing* GP-prime sum with the Stage7 7×7/1033 cell is to grant the author a completely **secret stationary 29-rune numerical codebook**, then apply the historical 2014 word-prime-sum idea. In symbols, let `A[i,r]` be the occurrence count of ciphertext rune `r` within complete original black word `i`, and `s[i]` the authentic Stage7 7×7 square cell at aligned position `i`. Any secret map `f:GP29→GF29`, including nonbijective assignments vastly more general than a monoalphabetic substitution of the 29 authentic GP primes, must satisfy **`A × f = s mod29`** on all 49 actual words. This tests an unfitted *word-checksum* target; it does not assert the creator selected it.

The authentic `A` has GF29 rank **29**. Gauss-Jordan elimination of the augmented system exposes **18–20 contradictory rows** across all **eight conventional D4 orientations** of the genuine 2014 matrix. The earliest impossible prefix is just original word **29** or **31**, depending on orientation: 49 positions, 29 secret values, **zero possible codebooks**. The frozen independent **native GP-prime map positive** (target sums explicitly generated by the original 49 word shapes) solves all 49 equations exactly and proves the test can accept a real word-sum model. The square row and column sums are independently asserted as 1033, and both original source files and the corrected physical-page-carry are checked before the solve.

This is an **all-secret, original-ciphertext exact exclusion** of this one natural square-to-word-checksum route; the historic 7×7 magic square still lacks a first-party word-cell alignment or plaintext decoder. It supersedes any suggestion that a different stationary rune substitution might rescue the direct 0/49 raw-prime-sum comparison. It does **not** exclude per-word evolving keys, non-linear word encodings, source-prescribed word permutations or an externally supplied ciphertext key. No unknown plaintext recovered. [Read-only Windows Node22 SFT](../sims/lp2_p33_49word_allsecret_square_check_sft.cjs) · [CI PASS 45077215194](https://github.com/FlareZ123/liber-primus/actions/runs/45077215194).

## Original p33 evidence and why the historical connection is plausible

The canonical LP2 page number is not the archive filename: LP1 occupies archive images 00–16, and LP2 p0–p57 occupies images 17–74. Thus **LP2 p33 is archive image 50.jpg**, not 33.jpg. The original p33 artwork carries the two cuneiform values conventionally read as **1033** and **3301**.

The canonical transcription has 214 runes. Removing the two marked red spans (offset 0, length 10; offset 91, length 8) leaves two black-text bodies of **81** and **115** runes, for **196 = 4 × 49 = 28 × 7**. The last of the 49 black page-local word fragments is **one rune of a three-rune word**: original p33 archive 50.jpg ends with `ᛒ` without punctuation, and original p34 archive 51.jpg begins `ᛗᛒ-`. Thus the proper complete-word count is **48 words entirely on p33 plus one p33→p34 carried word**, and their complete rune count is **198**, with p34's next word starting at local offset 2. The equality 196=4×49 holds only for page-clipped black runes. P33 is the only nonempty page whose non-rubric rune count is divisible by 49. This is a distinctive order-7 size correspondence and makes the historical square a reasonable lead, but it does not itself specify a cipher.

**Four-rune-per-cell source gate (Agent48, 22 November 2026).** The correct original LP2 p33 image is archive **50.jpg** (not archive 33.jpg). It visibly has five upper and six lower printed text lines, a large red initial glyph, two red punctuation groups, three black separator dots, and two handwritten cuneiform marks; it has **no 7×7 grid, 49 boxed cells, or four-rune packet boundaries**. The original participant-facing Stage10 form (`resources/external/cicada2014-onion6-magic-form-and-response.json`) asks for three magic squares—Order 5 / 3301, Order 7 / 1033, Order 5 / 1033—and an onion URL. Neither the form nor its signed message instructs the participant to map four p33 runes to each 7×7 cell or to apply the square to p33. The 49-word / 196-rune equality therefore supplies a size correspondence only; **196 = 4×49 does not establish a four-rune cell grammar**. The Stage10 form's order-7 magic constant also satisfies **1033 = 21×49 + 4**. This is a genuine source-number relation and worth retaining as a hypothesis, but neither the form nor the p33 image instructs the solver to reduce 1033 modulo49; it does not specify packet boundaries or a reversible four-rune operation. Without that missing operation, the remainder4 is not enough to pass the source gate.

## Source-constrained historical route

### 1. Stage7: signed carrier to three squares

The pinned 2014 Stage7 page verifies under Cicada fingerprint 6D854CD7933322A601C3286D181F01E57A35090F. Its 13,303,746 hexadecimal characters decode to the exact 6,651,873-byte MP3 (Git blob SHA-1 09fe068192b76a3697c47ec1d604b527703db798). The same MP3 was supplied to original OpenPuff v4.00. The reproduced successful settings use password A 33011033, B/C disabled, MP3 mode and Maximum (1/2), yielding the exact 745-byte three-square file, SHA-256 9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f.

The extracted matrices are, in order:

- Order 5, magic sum 3301.
- Order 7, magic sum 1033.
- Order 5, magic sum 1033.

The password and OpenPuff settings are part of the reproducible historical solve path, not a literal cipher instruction in the signed Stage7 text. The original signed page authenticates its carrier; the extraction is a reproducible result from that carrier.

### 2. Stage10: explicit submission, but not an LP2 cipher instruction

The earliest surviving participant capture is the micheloosterhof/cicada-2014 repository, commit 3b15257c5a9efada85b8ccfdb876e2ec934d5b90, dated 13 February 2014. Its Stage10 form embeds a Cicada-signed message asking the player to paste the magic squares and provide a Tor hidden-service URL. The surrounding HTML and field labels are not covered by that signature.

The form is plain HTML with no script or custom client transform. Its POST fields, in document order, are:

1. 53301 — Order 5 Square, 3301.
2. 71033 — Order 7 Square, 1033.
3. 51033 — Order 5 Square, 1033.
4. onion — the participant's hidden-service address.

The archived static confirmation body says “Thank you for you submission” and links to 107.jpg, 167.jpg and 229.jpg. Those files are byte-identical, in that order, to original LP1 pages 14, 15 and 16. The third image, LP1 p16, visibly contains the exact first extracted 5×5 / 3301 square. The image identities are exact source-object matches, not visual analogies.

This establishes a plausible human route from the p33 values to the 2014 square material and back to LP1 pp14–16. The archived response is a static 152-byte body, not a preserved HTTP transaction; the original Cicada-side /cgi-bin/squares handler, exact POST body and acceptance predicate are unavailable. Do not infer a square-to-image mapping or server validation rule from the static response alone.

## Three-square cross-page crosswalk

The Stage10 field order has a notable three-page alignment:

- **Order 5 / 3301** (first field) matches the 5×5 square on **LP1 p16** cell for cell. The Stage10 response's third image, 229.jpg, is byte-identical to that LP1 page.
- **Order 7 / 1033** (second field) has 49 cells. **LP2 p33** has 196 non-rubric runes, exactly four times 49, and carries the 1033/3301 cuneiform pair. This is a label-and-size correspondence, not a cell-for-cell match or an instruction to apply the matrix. The canonical transcription uses hyphens as word delimiters; visual line wraps are not additional word boundaries. Removing two complete red headings of **10=2+8** and **8=3+5** runes yields **49 black words**, 21 upper (81 runes) and 28 lower (115 runes). The **physically printed lines are 5 upper plus 6 lower**, with many words continuing through line wraps. Grouping the black words into **3 plus 4 hypothetical rows of seven** is a natural 7×7 size inference, **not an actual seven-line, seven-column page layout**. The source 7×7 numerical square is exact and centrally symmetric, but its **49 positions contain only 24 distinct numerical values**. A simple key-independent lookup of word address from numerical *value alone* cannot be a permutation of all 49 words; a position-sensitive rule would be needed. The 49-word count is real, while the cell-to-cell mapping and its cipher operation remain candidates.
- **Order 5 / 1033** (third field) matches the 5×5 Wisdom square on **LP1 p5** cell for cell, as documented in the Stage10 source-boundary report.

Thus the three submitted squares plausibly cross-reference LP1 p16, LP2 p33 and LP1 p5, in the form's order. The first and third links are exact matrix matches; the middle link is only the distinctive 7×7 / 49-cell size match plus the page's cuneiform values. This is stronger than treating 1033/3301 as isolated numbers, and it is a plausible intended navigation map. It still does not specify how to transform p33's 196 runes. In particular, four consecutive 49-rune chunks are not visibly delimited and one chunk would cross the page's 81/115 body boundary.

## Carry-correct dynamic 7×7 autokey gate (Agent26, 22 November 2026)

The historical square is an authentic source-derived numerical object, but no first-party instruction defines a GP29 key schedule. To test a recognizable *changing-state* extension of the historical Stage04 positive-shift operation, associate the 49 original Stage7 order-7/1033 entries with the 49 **complete** original black words in printed order, including p34's first two continuation runes. The first 49 words therefore cover 198 GP runes; the independent p34 holdout is the next 200 runes beginning at p34 offset2. To make the candidate predict beyond the square, repeat its 49 numeric entries for subsequent word starts. Repetition is an explicit test assumption, not a source-selected opcode.

For word `w`, let `k=magic[w mod49] mod29` and GP29 indices be `C_j`, `P_j`. The frozen eight deterministic inverses use `P_j = C_j + s*(seed_j + feedback_j) mod29`, where `s ∈ {−1,+1}`, `seed_j` equals `k` at the first rune alone or at every rune, and `feedback_j` is 0 at the first rune and otherwise the previous **plaintext or ciphertext** rune in the *same complete printed word*. All eight are word-preserving, nonstationary by source key and symbol feedback, fully invertible without guessing plaintext. In particular, their state continues through the actual p33→p34 carried word.

On all 198 original complete-word runes, outputs have IoC **0.03143106–0.03584064**; on the untouched following 200 original p34 runes, **0.03286432–0.03527638**. The actual original operands have IoC **0.03363585** and **0.03391960**; the real solved p57 GP control has **0.06270997** (95 runes). Eight original outputs remain nonprose throughout both regions. Every one exactly reencrypts all **457** available p33+entire-p34 input runes, recovers a planted **457-rune** source-native solved-p57 GP sequence, and rejects a fixed 90°-rotated wrong square on that plant. These controls establish executable inverses but cannot identify the author's cipher. The full code prints the eight unmodified output prefixes so a future investigator can independently challenge the linguistic decision.

**Decision:** This source-limited classical *per-word autokey* extension fails to recover p33 or its p34 holdout. The result excludes these eight specific M-seeded feedback models, not arbitrary evolving-state ciphers. More importantly, the original 49-cell visual match provides no selected plaintext-versus-ciphertext feedback opcode, modulo29 reduction, within-word seed convention, 49-word repetition, or physical-page clock. A different dynamic square model needs a specific original source selector and must preserve the true p33→p34 word carry. The source alignment alone cannot support another unconstrained key-family search.

[Exact read-only Windows Node22 CJS SFT](../sims/lp2_p33_square_word_autokey_carry_sft.cjs) · [successful original-input execution](https://github.com/FlareZ123/liber-primus/actions/runs/45014490505).

## Newly resolved 49-word cell receiver (Agent25, 22 November 2026)

The corrected 49-word segmentation reopened a **distinct word-level** original-input candidate. Using the original `resources/lp2-transcription.txt` hyphen/period separation and preserving internal line wraps, strip only the two complete printed red headings. The 49 surviving p33-local word fragments match the exact **196 untouched p33 GP29 ciphertext runes**; the original 49th word continues on p34 and therefore has 198 complete-word runes in total at canonical offsets `[10,91)∪[99,214)`. Map them in original reading order into seven successive seven-word rows, the upper 21 supplying the first three and lower 28 the final four. Place the independently recovered 2014 Stage7 7×7/1033 square's **printed** seven numerical rows against that inferred word map. The table gives each row's original numeric keys and the *original* encoded word transcriptions, all 49 cells. Reading each seven-word row across the page is a conditional construction.

| Hypothetical word row | Stage7 numeric cells, unchanged | P33 GP word-cell source, left to right |
| --- | --- | --- |
| 1 (upper) | 7,375,236,190,27,17,181 | EOOE · FTEOEEAAIASG · YEANTHAER · OIAM · WXM · YDBTR · UJH |
| 2 (upper) | 351,223,14,47,293,98,7 | AEOE · IANGWHSFIA · LTHT · IWT · OUNWML · STHEAWJ · AJAEGYMWD |
| 3 (upper) | 456,232,121,114,72,23,15 | PIA · EJW · EU · HW · NGI · SAEG · JL |
| 4 (lower) | 16,65,270,331,270,65,16 | DBYIAYU · YNTHREMI · EODRW · XBH · CJIAA · NW · NM |
| 5 (lower) | 15,23,72,114,121,232,456 | FEOI · EOA · OSBOE · TJ · P · EPJOWUEANGW · MCOTTFUJ |
| 6 (lower) | 7,98,293,47,14,223,351 | DEAXO · XTHGD · BOTLEOIBIAA · EFEAUE · PSWDD · SIA · WTHDS |
| 7 (lower, readout reserved) | 181,17,27,190,236,375,7 | NGJ · LGUIA · NXF · RAYMFTHH · RAR · AEAGOED · B |

**Source instruction and exact absent selector.** The genuinely signed 2016 statement that the manuscript's words are its map and their numbers its direction makes a word/number comparison plausible, as does the original printed 7×7 square. However, the 2016 sentence does **not** identify the p33 49 words, assign source 2014 magic-square cells to them, name the operand (GP word prime-sum, length, ordinal, first letter, or every rune), or choose a word-cipher sign, modulus, traversal, or state. Even the candidate seven-word rows do not match the physically printed page's lines. Direct comparisons between the original word prime sums and the printed square entries yield **0/49 exact matches** and **0/49 modulo29 matches**; the seven inferred row prime-sums are `[1784,1779,776,1476,1189,1814,1273]`, none equal to the historical magic constant **1033**. The numerical square has 24 distinct values, so its raw numbers cannot independently form a complete 49-address word permutation.

**One bounded reversible original-cipher recipient.** To give the strongest simple direct candidate one test rather than speculating, freeze the author-historical Stage04's **positive GP29 decryption shift**, on the row-major cell order printed by the Stage7 square: for every one of the 49 p33-local ciphertext word fragments, decode **every rune in that fragment** as `P_{word,j}=(C_{word,j}+M_word) mod29`, where `M_word` is that word's fixed historical square value. The inverse is `C=P−M_word mod29`. This is a conditional *cross-stage* application, not an instruction found in the 2014 materials. It differs from the earlier four fixed **49-rune** additive blocks and 7×7 Hill transformations, which ignore printed word boundaries. The [source-exact read-only CommonJS SFT](../sims/lp2_p33_stage10_49word_shift_original_sft.cjs) obtains all words and original numbers from pinned repository files; it forwards/reverses all **196/196 original black runes**, independently encrypts/decrypts **196/196 genuine p57-native GP symbols** distributed over the original 49 word lengths, and reserves the final seven original printed words for a no-retuning readout.

The source original has GP29 IoC **0.0335426478**; the fixed word-shift output has IoC **0.0355311355**, still near uniform29 and far below genuine readable p57 **0.0627099664**. The earlier 42 decoded words are unintelligible; the complete reserved final seven output words are `EAE HDES WEOIA LJPGTEA HEAH DOERLNG A`. No intact GP29 English word/sentence or a source-authenticated key appears. Original and planted reversibility assertions passed on [Windows Node22 CI #44967468221](https://github.com/FlareZ123/liber-primus/actions/runs/44967468221). **Do not sweep the opposite sign, rotations, numerical mods, phases, or alternative word substrings to rescue this source-unsupported construction.**

**Director decision:** The unique exact structural input is the 49-word count, whose 21+28 partition happens to be divisible by seven. The square-to-word *position* is not visually drawn, and the first-party sources do not give a definite word operation. Direct authentic Stage04-style per-word scalar shifts fail on actual ciphertext. Preserve this evidence under the current p33 source-navigation report, close the current word-square receiver gate, and require a new genuine authorial selector before further p33 7×7 key search.

## Stable numerical rank as a complete-word order code (Agent23, 22 November 2026; #2141)

The remaining natural 49-word permutation receiver has now been executed on the **same 49 original p33-local black printed fragments**, totaling **196 unchanged p33 runes** (one final word is incomplete on p33). The source inputs are the exact printed historical Stage7/Stage10 7×7 square and canonical p33 two-body transcription; the 21|28 split was preserved as a three-row/four-row readout distinction. The source page is physically typeset into five upper and six lower lines, so mapping it to seven virtual seven-word rows remains an interpretation rather than a printed layout.

**Fixed operation:** flatten the 49 numerical cells in their historical row-major order; stably sort their values ascending with original zero-based cell index as tie break, yielding a unique permutation. Read whole, unchanged p33 words in that rank order. Also read the exact inverse permutation, with no fitted rotations, retied equal cells, character substitutions, additions or phase choices. The historical square is symmetric under 180° rotation, but original p33 has no printed 7×7 geometry selecting a physically rotated-word read, so no 180° p33 read was added.

The stable ascending word-source indices (zero-based) are:

`[0,13,35,48,9,39,20,28,21,27,5,43,19,29,4,44,10,38,22,26,18,30,12,36,17,31,16,32,6,42,3,45,8,40,15,33,2,46,23,25,11,37,24,7,41,1,47,14,34]`

The inverse source indices are:

`[0,45,36,30,14,10,28,43,32,4,16,40,22,1,47,34,26,24,20,12,6,8,18,38,42,39,19,9,7,13,21,25,27,35,48,2,23,41,17,5,33,44,29,11,15,31,37,46,3]`

All seven virtual rows of the ascending read (literal GP29 transliteration, spaces are the preserved word boundaries):

```text
EOOE AJAEGYMWD DEAXO B LTHT PSWDD JL
FEOI DBYIAYU NM YDBTR LGUIA SAEG EOA
WXM NXF IWT EFEAUE YNTHREMI NW NGI
OSBOE STHEAWJ XTHGD HW TJ EU P
UJH NGJ OIAM RAYMFTHH IANGWHSFIA SIA EJW
EPJOWUEANGW YEANTHAER RAR EODRW CJIAA OUNWML BOTLEOIBIAA
XBH AEOE WTHDS FTEOEEAAIASG AEAGOED PIA MCOTTFUJ
```

The complete inverse read is likewise nonlinguistic; its first two rows are `EOOE RAYMFTHH XTHGD OSBOE PIA IWT FEOI` and `LGUIA P WXM EU SIA YNTHREMI FTEOEEAAIASG`. Both exact inverse directions reconstruct all **49/49 original printed words**; the output multiset contains all **196/196 original rune indices**. Exact replay is necessary for a reversible order cipher, but it is not evidence of plaintext when every word's interior symbols remain original ciphertext.

**Decision:** Neither unique fixed rank nor its inverse produces a recognizable native-GP passage in any of the seven rows or across the three/four-row body boundary. A pure permutation can recover native prose only when the original words themselves already contain plausible native-GP plaintext; here the unreplaced source words are ciphertext-like. This closes the only direct stable numerical rank fork of #2141, while retaining the established historical crosswalk. Further p33 7×7 operations require a genuinely independent original-source instruction rather than a fitted tie-break or second cipher layer.

[Read-only Windows/Node22 CommonJS SFT](../sims/lp2_p33_stage10_stable_rank_word49_sft.cjs). Its source assertions verify the exact p33 black-rune intervals, square row/column sums, complete printed words and both inverse replay directions.

## Literal 49-word-length keypad route (Agent25, 22 November; #2161)

**Source-controlled bounded negative, with an exact original-input reproducer.** The 49 p33-local black word fragments could in principle be a **49-number instruction**, independent of any supposed 49-rune codebook. Their original **page-clipped fragment lengths** in a conditional seven-by-seven layout are; the final entry is 1 on p33, while the complete carried word is length 3 after the first two p34 runes:

```text
2 9 6 3 3 5 3
2 7 3 3 6 5 8
2 3 2 2 2 3 2
6 7 4 3 4 2 2
3 2 4 2 1 9 8
4 4 9 5 5 2 4
2 4 3 7 3 5 1
```

The **21 upper and 28 lower page-local fragments** contribute exactly **196 p33 GP runes** across offsets [10,91) and [99,214) of original p33. All 49 lengths fall between **1 and 9** inclusive. The authenticated later 2016 Cicada sentence says that the manuscript's numbers are its direction. A historically recognizable, falsifiable possibility is to read word lengths as the ordinary **telephone-numpad directions** 7/8/9 = northwest/north/northeast, 4/5/6 = west/stay/east, 1/2/3 = southwest/south/southeast, and to walk the authentic 2014 Stage7 **7×7/1033 square** from its unique central cell **331**. This source combination is hypothetical: neither the signed 2016 text nor the earlier square names *word length*, a keypad, the 7×7 square as the board, or a boundary wrap.

With zero-based center (row3,col3), the first four original commands **2,9,6,3** visit cells with values **114, 270, 65, 456**. The **fifth original command 3 exits at (row5,col7)**, outside the printed seven-column board. The next 44 original words consequently have no literal cell reading. This is a **hard failure for that complete fixed finite-board operation**, before English scoring or keyed cipher tests. Resetting at the three-dot separator would not rescue the already-failed upper passage; imposing toroidal wrapping, modulo coordinates, a different start or a custom digit compass would introduce a new, independently unselected rule.

The source-native selection control finds **21** other moving 49-word intervals with the same **196-rune** total in the original manuscript: **20/21** already use at most nine distinct word lengths and **14/21** both have at most nine distinct lengths and a most common length repeated at least thirteen times. Thus the p33 register's nine-symbol concentration is not itself a rare original-text indicator of a special numeric alphabet. A complete **49-command native keypad positive** made of 24 east/west pairs followed by a center command remains inside the board and exactly reconstructs all 49 commands from its coordinate differences. The failure therefore rests on original directions rather than parser, coordinate, or reverse-check implementation.

**Decision:** Retire this one finite source-shaped **length→standard-direction→historic 7×7 cell** interpretation. The directly printed 5+6 text lines do not select the hypothesized seven-word rows, and no stable word-length-to-plaintext alphabet or cipher recipient is supplied. It remains possible for an independently sourced alternative operation to consume these 49 values, but exploring arbitrary alphabet shifts or wrap choices has no source support. [Read-only exact-source Node22 SFT](../sims/lp2_p33_49wordlength_literal_keypad_sft.cjs).

## What the route does—and does not—select

The only explicit next action in the historical Stage10 material is to submit the three already-obtained squares and the participant's onion address to the Stage10 form. The preserved response points to **LP1** pp14–16; it does not identify a next LP2 page or coordinate.

A competing reading of the cuneiform values writes them as base-60 pairs 17;13 and 55;1. Treating the four digits as LP2 page indices visits p17, p13, p55 and p1; their original images show, respectively, text, a tree, a tree/butterfly and cross/infinity artwork, with no common visual instruction or ordered readout. Treating the pairs as page/word coordinates (0-based LP2 page numbers, 1-based word positions) selects p17 word 13 = FREAMEAA and p55 word 1 = NG in the transcription; treating them as page/rune coordinates under the same page/position convention selects M and NG. Other natural 0/1-based conventions change the selected symbols. No source selects page pointers versus page/word or page/rune coordinates, the indexing convention, or a subsequent readout. This is a bounded rival interpretation, not a plaintext recovery.

The 196-rune length makes four 49-rune blocks conceivable, but no four-block layout is marked on p33. Its two visible text bodies have lengths 81 and 115. If the 196 runes are simply concatenated and cut into four consecutive 49-rune blocks, the second block crosses the visible boundary between those two bodies (32 runes from the first body and 17 from the second). No original instruction selects that concatenation, those block boundaries, a row/column traversal, a mapping from square entries to GP29 symbols, a modulus, a sign, a key clock, or a reset rule.

The first underdetermined step is therefore exact: **after recognizing the 1033/3301 historical square reference, what operation—if any—should be applied to p33's 196 runes?** Neither the signed Stage7 carrier nor the Stage10 form specifies one. The 2014 form asks for square submission, not for encrypting or decrypting Liber Primus.

## Earlier rune-block direct-consumer gate (kept separate)

The existing original-input test already covers the natural direct uses of the 7×7 / 1033 matrix. Reducing the square modulo 29 gives determinant 2, so the key is invertible. The tested families are:

- One-dimensional Hill-7: K and K inverse, row- and column-vector conventions (4 cases).
- Two-dimensional 7×7 actions: the four natural K/K-transpose and inverse orientations on four consecutive blocks.
- Repeated 49-cell additive key: row-/column-major serialization, v mod 29 or (v−1) mod 29, addition/subtraction, and continuous/reset phase (16 cases).

A separate, narrowly motivated structural check tested the literal four-square reading: concatenate the 196 body rune indices in source order, reshape them row-major as 14×14, and split into four 7×7 quadrants. If those were four magic squares keyed by the Stage7 constants, each quadrant's seven row and column sums would all equal 1033 mod 29 = 17 (or the other printed constant 3301 mod 29 = 22). None does. The row residues by quadrant are Q1 [2,0,28,4,6,22,8], Q2 [19,3,21,11,19,12,6], Q3 [19,22,26,21,15,11,25], Q4 [8,18,8,18,1,21,5]; the column residues are Q1 [0,3,10,2,19,20,16], Q2 [15,5,23,16,20,8,4], Q3 [6,16,3,22,15,3,16], Q4 [1,24,16,1,11,22,4]. This retires only the straightforward four-quadrant magic-sum interpretation; the 14×14 reshape itself is not selected by the page layout and crosses the 81/115 visible-body boundary.

None produces coherent GP29 plaintext. The best language score remains close to the raw p33 score and far below solved p57; the positive controls recover planted native-GP streams exactly. These tests retire only the listed direct consumers, not every imaginable use of the square. Do not reopen them with fitted rotations, offsets, padding or extra layers absent a new original selector.

## Cold-start status and decision

A source-only cold-start packet is prepared at workplace/lp2-p33-stage7-stage10-coldstart-packet.md. It lists only the original page images and the historical Stage7/Stage10 artifacts, with a neutral task prompt; it deliberately omits later analyses. **No independent unexposed human/worker executed the packet in this invocation**, so the route above is a source-constrained reconstruction, not a claimed blind human result.

**Decision:** Retain p33 → 2014 Stage7/Stage10 → LP1 pp14–16 as a plausible historical navigation/reference route, with the exact **49-word / 7×7** source-candidate map and failed source-fixed word-level shift and stable rank/inverse transpositions as bounded negatives. The direct rune-block consumers remain separately rejected. The creator's rule for aligning historical 7×7 numbers to the page's 49 words and acting on those words is still missing. No recovered LP2 cipher, unknown plaintext, key, next LP2 coordinate or final destination follows.

Reopen only if an original Cicada instruction, recovered handler/transaction, or other independent source explicitly selects a reversible operation and input boundaries for p33's 196-rune body.

## Reproduction and source pointers

- Original p33 transcription and ink boundaries: resources/liber-primus/lp2-corpus.json, resources/liber-primus/lp2-ink-annotations.json; original image resources/liber-primus/50.jpg.
- Page-number mapping and original-image archive: resources/liber-primus/README.md.
- Stage7 signed-page / exact OpenPuff reproduction: im-results/cicada2014-stage7-chain-reproduction.md; extracted matrices: resources/cicada2014-openpuff-magic-squares.txt.
- Stage10 participant form/response: resources/external/cicada2014-onion6-magic-form-and-response.json; static response body: resources/external/2014-stage10-post-square-response.html.
- Exact Stage10 image-to-LP1 identity: im-results/2014-stage10-three-images-lp1-source-handoff.md.
- Existing direct-key gate and executable: sims/lp2_p33_stage10_order7_1033_square_key_gate_sft.cjs.
- Exact stable numerical rank and inverse word-order SFT: sims/lp2_p33_stage10_stable_rank_word49_sft.cjs.
- Exact 49-length keypad finite-board decision with independent original-length source controls: sims/lp2_p33_49wordlength_literal_keypad_sft.cjs.
