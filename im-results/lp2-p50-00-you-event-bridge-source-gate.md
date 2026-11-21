# First-00 event groups select p38:54 and a candidate DH private exponent

**Agent14, 21 November 2026. Classification: original-source, conditional key-routing candidate.** Two separate complete original-cipher equality-event groups now specify a full printed page/rune offset, a DH private-exponent candidate, a previously identified reciprocal packet and its WILL/FOUND receiver. Every original event rune is retained. **No new authenticated plaintext, independently proven author key, or global LP2 decoder was recovered.** A later independent original-cipher holdout excludes reusing this proposed DH four-slot pad at the second signed-coda receiver; see the [GOOD→LUCK transfer gate](lp2-p0-2016-coda-dual-dhpad-holdout.md). Original-source [Windows/Node22 reproducer](../sims/lp2_p50_00_you_will_event_bridge_sft.cjs); [manual CI](../.github/workflows/agent14-p50-00-you-event-bridge-manual.yml).

## Complete original-source path, including the last rune

The original p50 number field is an exact 32-row by 8-column matrix of two-character tokens. It includes two tokens printed **00** at row-major cells **192** and **229**. The first is at p50 matrix row24, column0. An earlier independent investigation established a retrospective 256-rune, zero-origin **global original-cipher clock** under which 33 of 86 identical-consecutive-rune events coincide with printed table tokens beginning with digit0. In this work, the frozen lookup for an equality event at successor global rune index *g* is table cell **(g−1) mod256**. The clock is already source-motivated; Cicada has not authenticated it.

On all 55 original rune-bearing unsolved pages there are exactly **86** equal-adjacent-cipher events. Four address first-00 cell192:

| Chronological original event | Physical LP2 page | Page-local successor rune index | Repeated GP rune | GP29 index |
| ---: | ---: | ---: | --- | ---: |
| 1 | 9 | 112 | Y | 26 |
| 2 | 24 | 106 | O | 3 |
| 3 | 25 | 92 | U | 1 |
| 4 | 34 | 211 | A | 24 |

The **complete, untruncated source event readout is Y O U A**, GP index sequence **[26,3,1,24]**, with index sum **54**. Source p50 cell229, the other printed 00, receives just one event, X on p36. The first three letters of YOUA reproduce the exact signed-2016 word **YOU** in “Seek and you will be found.” This lexical prefix is an observation, not an automatically valid ciphertext-to-plaintext operation; crucially, this route consumes the **entire four-rune value as a numeric selector**, so it does not discard A to force an English word.

## Second event group: GP prime210 → NG X O → page38 and private a=6

The complete first-00 **YOUA** group has GP prime sum **103+7+3+97=210**, independent of its GP29 index sum54. At original numeral-table cell **210**, the actual printed token is **06**, giving literal base60 value **6**. Under the same unchanged 256-rune global original-cipher event clock, this exact table cell also receives three repeated-rune events:

| Source LP2 page | Page-local successor index | Repeated GP rune | GP29 index | GP prime |
| ---: | ---: | --- | ---: | ---: |
| 4 | 33 | NG | 21 | 79 |
| 20 | 242 | X | 14 | 47 |
| 27 | 84 | O | 3 | 7 |

The **complete second readout NG X O** has **GP29 index sum 21+14+3=38** and **GP prime sum 79+47+7=133**. The source-original 2014 stage11 manuscript publisher HTML includes exact **title133** ([archived source](../resources/historical/stage11-2014-index.html)), independently matching that prime sum; no original instruction to use this title here has been authenticated.

Taken together, the two groups select one full **physical LP2 page:rune offset coordinate 38:54**, before the target ciphertext is read. Page **38** is derived from NGXO's index sum; local offset **54** is derived from YOUA's index sum. This addresses exactly the previously identified complete p38 reciprocal word, rather than merely matching its offset. The literal **06** at source cell210 independently supplies a candidate **private exponent a=6**. On the same table low-digit index map, cell210 points to6, and cell6 is printed **26**, a fixed point **6→6**. The complete original **26** is also the literal digit pair **K=2, a=6**, independently matching the two numbers recovered by GP29 division from the p38 packet and by DH23 modular exponentiation. This is a particularly cheap printed-token consistency check, but no source instruction explicitly parses 26 into key slots.

**An additional, source-functional coincidence closes the recipient pointer.** The second group's **GP prime sum133** indexes original p50 **cell133**, whose literal token is **2L**, conventionally base60 **141**. Independently, GP index sum30 of the first group's authenticated signed-word prefix **YOU** points to original p50 **cell30**, also printed **2L**, also numeric **141**. The exact table contains only **three** occurrences of 2L, at cells **30,133,241**. These two separately selected numerals therefore converge on precisely the same **literal two-L token and recipient offset141**. The historical 2014 title133 match is now an actionable original-table pointer under the candidate grammar.

The Gematria index and GP-prime sum operations are both native first-party conventions, with a plausible semantic relation to the signed 2016 “numbers are the direction” clue. The ordering and rule for using these sums remain an unproved interpretation, rather than a creator-signed decoder.

## The source-unique reciprocal diagonal selector

Define the simplest source legible index operation on the original 256 tokens: given cell index *i*, take **the numeric value of the second printed base60 character** of that cell, giving f(i) in 0..59. Both the radix60 reading and this low-character operand were already investigated in p38 packet work; neither is specified by an original signed cipher instruction. Enumerating **all 256 original table cells**, without selecting phases from ciphertext, gives:

- Only nontrivial directed two-cycle: **54 → 36 → 54**.
- Source tokens: **cell54 = 2a** (low digit a=36), **cell36 = 0s** (low digit s=54).
- The only self-loops are **6** and **9**.
- Starting at the **first printed 00 cell192**, repeated use of the *same* low-digit operation, without any altered mapping, takes exactly **2 steps to cell23** (the independently identified DH modulus **p=23**), and exactly **12 steps to cell30**, whose original token is **2L**, giving the already selected recipient value141. The two hop counts are the independently recovered **K=2** and the p38 packet's unmodified **K·a=12**. This is a secondary source-parameter consistency circuit; the hop counts became interesting only after recognizing the packet, so it does not by itself authenticate the event grammar.
- Both members of the unique two-cycle lie on the printed matrix main diagonal: cell **36=(row4,col4)** and cell **54=(row6,col6)** (zero-based rows and columns).

Therefore the **sum54 of the entire YOUA four-rune source readout** directly selects one end of the sole nontrivial reciprocal two-cycle, and its first hop is **36**. The readout contains no fitted numeric coefficient, bit order, skipped symbol, or hand-chosen table shift.

A separate 2016-derived p38 receiver had already identified a **unique complete three-rune word** in physical p38 at page-local offsets **54–56**, ciphertext **[5,12,19]**, whose sum is **36**. That earlier receiver checked *both* original low-digit relations **low(p50[54])=36**, **low(p50[36])=54**, across the full set of addressable printed words. Thus the event readout's sum picks out precisely the **position54** of an independently selected reciprocal p38 packet, which itself has GP sum36, closing the cycle in the actual original cipher.

### A radix choice resolved by this specific reciprocal loop

The literal table contains no lowercase f, making both a 60-character alphabet and a reduced 59-character alphabet initially plausible. Under the 59-character reading, the low digit of s drops from54 to53. Enumerating every original table cell gives the **sole nontrivial two-cycle 36↔54 under base60**, versus **26↔52 under radix59**. In particular the source-elected 54→36 points next to **53** under radix59, so the original packet's **54↔36** closure requires **base60**. This is a discriminating consequence of the conditional source route, not global proof of the alphabet.

The preexisting source hypothesis types the three original packet runes as **[g,K·a,B]=[5,12,19]**. The second equality-event group supplies the **previously missing private-exponent candidate a=6** directly from printed p50[210]=06. In the proposed packet grammar, dividing its middle rune K·a=12 by a=6 in the GP29 field gives **K=12×6⁻¹ mod29=2**, with 6⁻¹=5 mod29. The independently known original p28 DH23 reconstruction supplies modulus **p=23**; using the packet's B=19 and independently obtained a6, the different operation **B^a mod23=19⁶ mod23=2** gives the identical secret **K=2**. Furthermore **A=g^a mod23=5⁶ mod23=8** and the known other private exponent b15 satisfies 5¹⁵ mod23=19. This arithmetic cross-domain agreement is a concrete check on the source-to-key reading, conditional on assigning packet slot1 the meaning K·a. It regenerates candidate p0 key **[K·a,a,H(A,B)]=[12,6,18,27]**, with H(A,B)=[A−B,A+B] modulo29.

## Original-p0 recipient and conditional decryptions

The first three event letters coincide with authenticated signed-word **YOU**. GP0(YOU)=**30** addresses original p50 token **2L**. Independently the second complete source group **NGXO** has GP prime sum**133**, addressing the identical original token **2L**. Both source-selected table positions therefore give the same conventional base60 value **141**. The signed successor word **WILL** contains two L glyphs. The existing p0-local receiver points to one complete four-rune printed ciphertext word at offsets141–144, **[19,16,9,18]**. The newly recovered packet's literal middle rune **K·a=12**, combined with the independently printed **06→a=6**, gives the first **two** GP29 additive shifts directly from the source. Subtract them *before* assuming the earlier postulated trailing-key transform H(A,B):

    [19,16] − [12,6] mod29
      = [7,10] = W I.

Thus the **first two plaintext symbols WI** emerge from original ciphertext under two source-selected packet/table numbers without any fitted H formula. The same separately selected numeral token **2L** states exactly **two L glyphs** in the original four-rune printed receiver word. With positions1–2 already **WI**, the remaining two must be **L L**, yielding candidate **WILL**. Only afterward do we derive the necessary trailing two key values **[9,18] − [20,20] mod29 = [18,27]**, which equal the previously postulated H(A,B)=[A−B,A+B] modulo29. Their agreement is a retrospective consistency check, not a prerequisite for the two independently decrypted runes or the forced literal suffix.

The resulting original local inverse is exactly

    [19,16,9,18] − [12,6,18,27] mod29
      = [7,10,20,20] = W I L L.

This is a smaller-assumption local candidate than using the full conjectural H key as a decryption input. It still relies on the unproved **2L → exactly two literal plaintext Ls** rule and on the author using the packet's middle rune as an additive key.

From GP0(WILL)=**57**, the previously established state K=2 follows two original table base60 hops **57→118→35**, with endpoint35 equal to GP0(BE), the authenticated next signed word. The intermediate118 lies in complete p0 ciphertext offsets117–121 **[12,2,11,10,2]**, whose prior packet-derived candidate key **[12,28,10,1,8]** gives **[0,3,1,9,23] = FOUND**. Exact forward reencryption recovers both printed cipher words. **Both WILL and FOUND readings predate this work, and remain conditional on the unverified packet key grammar and receiver rule.** This contribution supplies a newly observed source-to-key routing candidate; it has not decrypted any new original LP2 runes.

## Standalone source-only first-word decapsulation

The [standalone Windows/Node22 CommonJS decoder](../sims/lp2_source_only_00_to_p0_will_decapsulation_sft.cjs), [CI PASS 44963699287](https://github.com/FlareZ123/liber-primus/actions/runs/44963699287), is deliberately distinct from the signed-vocabulary and conditional null code. It **never reads the authenticated 2016 signed phrase as a decoding input**, and never uses the conjectured H(A,B) formula to select the trailing two plaintext runes. It reads the original GP29 ciphertext and primes, the exact 256-cell printed table, and the first page's original word boundaries. Its complete source-typed procedure is:

1. Root at the first printed **00** table cell192, numeric zero selecting physical p0; read its entire original same-phase doublet event group **YOUA**, with GP index sum54 and GP prime sum210.
2. Read entire second event group at original table cell210=**06**: **NGXO**, index sum38, prime sum133. Index sums give **p38:offset54**, whose untouched original three-rune packet is **[5,12,19]**. The source numeral06 gives **a=6** and the typed packet middle12 divided by6 in GP29 gives **K=2**.
3. Two low-digit table hops from the original root00 lead to index23, giving **p=23**; original packet B19 gives independent DH23 shared-secret check **19^6 mod23=2**. Table cell6 fixed point is printed **26**, literally matching K2/a6.
4. GP prime sum133 selects original p50 cell133 **2L**, giving base60 value **141**; the printed runic transcription confirms **p0 offset141 starts a complete four-rune word**. Its original ciphertext GP indices are **[19,16,9,18]**.
5. Subtract direct original-source first two shifts **[packet middle12, source a6]** from the first two ciphertext glyphs to get **[7,10] = W I**. Read literal token **2L** as exactly two suffix L glyphs, thus form **W I L L**; infer trailing two additive shifts only **afterward** to replay exact ciphertext.

The SFT derives the source candidate WILL **before** its final assertion comparing the output to that known spelling. It does not construct inputs from the known signed phrase. This is a narrower independent reproduction of a *local conditional crib candidate*, not a historically blind plaintext discovery: the route itself emerged after known signed YOU/WILL references were in research context. The suffix depends on the unlicensed literal token-as-letter-count assumption, and **Agent43's negative independent GOOD→LUCK holdout below prevents claiming this local procedure generalizes into a DH23 four-slot word pad.**

## Independent original receiver contradicts a reusable DH pad

Agent43's subsequent source-addressed holdout fixes the signed 2016 `GOOD→LUCK` pair under the **same** proposed GP0(word)→original p50 base60 value→complete p0 printed-word selector. `GP0(GOOD)=35`, `p50[35]=0d=39`, and original p0 cipher offsets39–42 are `[8,17,9,27]`. Source-native `LUCK=[20,1,5,5]` requires pad `[17,16,4,22]`. A four-slot DH pad `[K·a,a,A−B,A+B]` with the proposed shared `K=2` necessarily satisfies `k0−2·k1=0 mod29`, but this untouched second receiver gives `17−2×16=14 mod29`. Even with word-private K, its candidate exponent `a=16` and required `K=21` cannot satisfy `B^16 mod23=21` for any DH23 B, because the power is a quadratic residue and 21 a nonresidue. The **specific DH23 four-slot word-pad grammar is excluded at this independently addressable second receiver**, conditional on the same proposed selector and GP spelling.

The original WILL arithmetic, literal 2L, table cycles and p38 packet remain exact conditional source relationships. However, they no longer support transferring the same four-slot grammar to the next signed-coda word. For this branch to become a cipher solution, an authenticated source clue must select a genuinely different per-word update that predicts an untouched plaintext passage. [Full original-input holdout and Windows SFT](lp2-p0-2016-coda-dual-dhpad-holdout.md).

## Independent-original controls and the research decision

The 86 original event identities occupy five table-clock phase groups with at least three observations: phases **138, 140, 188, 192, 210**, having **3,3,3,4,3** events and full GP-index sums **15,47,19,54,38** respectively. Among all source phases with events, **only phase192** has a complete event-group sum of **54**. Restricting the search to all **31 distinct GP-length≥3 words** of the authenticated signed 2016 source (43 occurrences), the **only** contiguous signed word anywhere in those five groups is **YOU** at phase192, first three events.

Two earlier fixed 50,000-trial event-glyph randomization controls preserve the original 86 event sites, their complete 256-phase event occupancy, and the exact GP29 glyph multiset. Exchanging all 86 event values yields **31/50,000** occurrences of any matching signed-source word, a descriptive add-one tail **0.000640**. Exchanging glyph identities only inside their nine original illustrated chapters yields **56/50,000**, descriptive tail **0.001140**.

For a sharper exact fully original-constrained comparison, **keep the four cell192 event coordinates and their observed chapter identities** (chapter p8–14, two distinct event occurrences in chapter p23–26, and chapter p33–39). Enumerate the four labels using the *actual fixed identity inventories* of those chapters, without replacement in the middle two positions: **9 × 11 × 10 × 12 = 11,880** possible ordered four-glyph assignments. Of these, **440** have GP-index sum equal to either member of the preexisting table two-cycle (36 or54); **12** contain any of the 31 signed-word GP sequences as a contiguous length≥3 window; **exactly one** satisfies **both** constraints. It is the observed **YOUA**, sum54. This enumeration is exact conditional combinatorics. It does not claim uniform chapter-rune sequences are a real cryptographic null or that this was a preregistered decoding hypothesis.

**The strongest unsolved causal assumptions remain** the choice of the original 256-rune event clock and first-00 consumer, the order of GP index/prime-sum navigation, and the p38 packet's K·a interpretation and treating 2L as both numeric offset and plaintext letter count. Thousands of prior LP2 investigations included numerical coincidences, p50 event-phase hotspots, original-source vocabularies and p38 packets; these nominal chance tails are **retrospective within-hypothesis descriptions, not discovery-wide significance**. The original signed 2016 message does not expressly authorize this mapping.

**Decision:** preserve the complete source-typed route **first printed 00 → event YOUA (index54,prime210) → cell210 event NGXO (index38,prime133) and numeral06=a6 → original p38:54 packet [5,12,19] → base60-only 54↔36 reciprocal and GP29/DH23 secret K2 → original p50 cells133 and30 both read 2L/base60=141 → two direct p0 plaintext runes WI and two literal Ls complete candidate WILL; previous FOUND remains conditional** as a practical, concrete, independently reproducible **candidate key recovery route**. It is more informative than the previously recognized three-letter coincidence because **the fourth rune now has a coherent bounded role**. Do not promote it to solved plaintext or unbounded key searching. The independent GOOD→LUCK holdout above rejects reuse of the specific DH23 four-slot pad on a second source-addressed receiver. A real advancement requires an independent original instruction fixing the first-00/event-sum consumer **and an independently justified state update**, or a *new, withheld* 150-rune original-cipher plaintext produced by one reusable reversible decoder.

The [single-file original-source SFT](../sims/lp2_p50_00_you_will_event_bridge_sft.cjs) asserts the exact 12,956 original runes and 86 equality sites, first-00 and second-stage source event values, both GP sum operations, two independent literal 2L pointers, original title133 and 06/a6, base60/radix59 discriminator, unique reciprocal diagonal, mod29/DH23 secret equality, direct p0 WI and conditional remaining candidate inverses. A known planted positive ensures the signed-word detector is functional.
