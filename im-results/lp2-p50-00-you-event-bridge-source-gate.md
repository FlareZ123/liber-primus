# First-00 equality-event word selects a unique p50 diagonal cycle and the p38 state packet

**Agent14, 21 November 2026. Classification: original-source, conditional key-routing candidate.** The complete original-cipher four-rune event readout, including its previously unexplained fourth rune, selects a unique reversible two-cycle in the original printed table. That two-cycle addresses a preexisting p38 ciphertext packet and its previously proposed p0 WILL/FOUND inverses. **No new plaintext, author-authenticated cipher key, or general LP2 inverse was recovered.** Original-source [Windows/Node22 reproducer](../sims/lp2_p50_00_you_will_event_bridge_sft.cjs); [manual CI](../.github/workflows/agent14-p50-00-you-event-bridge-manual.yml).

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

## The source-unique reciprocal diagonal selector

Define the simplest source legible index operation on the original 256 tokens: given cell index *i*, take **the numeric value of the second printed base60 character** of that cell, giving f(i) in 0..59. Both the radix60 reading and this low-character operand were already investigated in p38 packet work; neither is specified by an original signed cipher instruction. Enumerating **all 256 original table cells**, without selecting phases from ciphertext, gives:

- Only nontrivial directed two-cycle: **54 → 36 → 54**.
- Source tokens: **cell54 = 2a** (low digit a=36), **cell36 = 0s** (low digit s=54).
- The only self-loops are **6** and **9**.
- Both members of the unique two-cycle lie on the printed matrix main diagonal: cell **36=(row4,col4)** and cell **54=(row6,col6)** (zero-based rows and columns).

Therefore the **sum54 of the entire YOUA four-rune source readout** directly selects one end of the sole nontrivial reciprocal two-cycle, and its first hop is **36**. The readout contains no fitted numeric coefficient, bit order, skipped symbol, or hand-chosen table shift.

A separate 2016-derived p38 receiver had already identified a **unique complete three-rune word** in physical p38 at page-local offsets **54–56**, ciphertext **[5,12,19]**, whose sum is **36**. That earlier receiver checked *both* original low-digit relations **low(p50[54])=36**, **low(p50[36])=54**, across the full set of addressable printed words. Thus the event readout's sum picks out precisely the **position54** of an independently selected reciprocal p38 packet, which itself has GP sum36, closing the cycle in the actual original cipher.

The preexisting source hypothesis types the three packet runes as **[g,K·a,B]=[5,12,19]** with independent p28 DH23 state **(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)**. It derives candidate p0 key **[K·a,a,H(A,B)]=[12,6,18,27]**, with H(A,B)=[A−B,A+B] modulo29.

## Original-p0 recipient and conditional decryptions

The first three event letters coincide with authenticated signed-word **YOU**. GP0(YOU)=**30** addresses original p50 token **2L**, which in its conventional base60 value is **141**. The signed successor word **WILL** contains two L glyphs. The existing p0-local receiver points to one complete four-rune printed ciphertext word at offsets141–144, **[19,16,9,18]**. The previously derived packet key gives

    [19,16,9,18] − [12,6,18,27] mod29
      = [7,10,20,20] = WILL.

From GP0(WILL)=**57**, the previously established state K=2 follows two original table base60 hops **57→118→35**, with endpoint35 equal to GP0(BE), the authenticated next signed word. The intermediate118 lies in complete p0 ciphertext offsets117–121 **[12,2,11,10,2]**, whose prior packet-derived candidate key **[12,28,10,1,8]** gives **[0,3,1,9,23] = FOUND**. Exact forward reencryption recovers both printed cipher words. **Both WILL and FOUND readings predate this work, and remain conditional on the unverified packet key grammar and receiver rule.** This contribution supplies a newly observed source-to-key routing candidate; it has not decrypted any new original LP2 runes.

## Independent-original controls and the research decision

The 86 original event identities occupy five table-clock phase groups with at least three observations: phases **138, 140, 188, 192, 210**, having **3,3,3,4,3** events and full GP-index sums **15,47,19,54,38** respectively. Among all source phases with events, **only phase192** has a complete event-group sum of **54**. Restricting the search to all **31 distinct GP-length≥3 words** of the authenticated signed 2016 source (43 occurrences), the **only** contiguous signed word anywhere in those five groups is **YOU** at phase192, first three events.

Two earlier fixed 50,000-trial event-glyph randomization controls preserve the original 86 event sites, their complete 256-phase event occupancy, and the exact GP29 glyph multiset. Exchanging all 86 event values yields **31/50,000** occurrences of any matching signed-source word, a descriptive add-one tail **0.000640**. Exchanging glyph identities only inside their nine original illustrated chapters yields **56/50,000**, descriptive tail **0.001140**.

For a sharper exact fully original-constrained comparison, **keep the four cell192 event coordinates and their observed chapter identities** (chapter p8–14, two distinct event occurrences in chapter p23–26, and chapter p33–39). Enumerate the four labels using the *actual fixed identity inventories* of those chapters, without replacement in the middle two positions: **9 × 11 × 10 × 12 = 11,880** possible ordered four-glyph assignments. Of these, **440** have GP-index sum equal to either member of the preexisting table two-cycle (36 or54); **12** contain any of the 31 signed-word GP sequences as a contiguous length≥3 window; **exactly one** satisfies **both** constraints. It is the observed **YOUA**, sum54. This enumeration is exact conditional combinatorics. It does not claim uniform chapter-rune sequences are a real cryptographic null or that this was a preregistered decoding hypothesis.

**The strongest unsolved causal assumptions remain** the choice of table clock and first-00 event consumer, the use of GP sum as the next-cell index, and the independent p28/p38 packet's plaintext key grammar. Thousands of prior LP2 investigations included numerical coincidences, p50 event-phase hotspots, original-source vocabularies and p38 packets; these nominal chance tails are **retrospective within-hypothesis descriptions, not discovery-wide significance**. The original signed 2016 message does not expressly authorize this mapping.

**Decision:** preserve the complete source-typed route **first printed 00 → original event readout YOUA → GP0 54 → sole diagonal 54↔36 table two-cycle → p38 offset54 packet GP0 36 → candidate p0 WILL/FOUND key** as a practical, concrete, independently reproducible **candidate key recovery route**. It is more informative than the previously recognized three-letter coincidence because **the fourth rune now has a coherent bounded role**. Do not promote it to solved plaintext or unbounded key searching. A real advancement requires an independent original instruction fixing the first-00/event-sum consumer or a *new, withheld* 150-rune original-cipher plaintext produced by one reusable reversible decoder.

The [single-file original-source SFT](../sims/lp2_p50_00_you_will_event_bridge_sft.cjs) asserts the exact 12,956 original runes and 86 equality sites, first-00 event values, unique p50 two-cycle and diagonal geometry, exact source-chapter assignments, previous p38 packet and p0 candidate original inverses. A known planted positive ensures the signed-word detector is functional.
