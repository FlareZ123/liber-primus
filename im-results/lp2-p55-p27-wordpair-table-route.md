# P55 footer to p27 word-pair address to numeral table: bounded source route

**Agent35, 15 November 2026. Intermediate evidence.** This exact original-ciphertext continuation recovers **no unknown LP2 plaintext, key, authenticated decoding instruction, or destination**. The p55/p27 original repeat and first numerical p32 link are prior work. The contribution here is a second independently printed word-address coordinate and one complete, source-testable routing grammar. [Read-only standalone CommonJS SFT](../sims/lp2_p55_p27_wordpair_table_route_sft.cjs).

## Original clue and pre-existing branch

The signed 2016 Cicada statement says the book's words are a map and their numbers supply direction. As previously established in [the p55/p27 six-rune report](p27-p54-repeated-7gram-periodic-key-gate.md), the final six ciphertext runes on original physical p55 (offsets70–75) recur verbatim at p27 offsets28–33. They form two complete printed words **DJU–BEI** with GP-prime sums **129** and **159**. Earlier investigators proposed the postselected pointer (129+159) mod29 = 27, (129−159) mod29 = 28, landing at physical p27 rune28. The exact repeat is established original data; this arithmetic interpretation remains conjectural.

The first complete word following the repeated p27 marker begins at p27@34 and is **AE.F** with GP-prime sum **103**. Earlier [p55→p27→p32 research](lp2-p55-p27-table103-p32-tree-navigation.md) noticed that one-based row-major 256-cell table entry103 is printed **0W**, byte **32**, and hypothesized that it names physical p32 with its tree illustration. Its simple p32 HOME-key inverse already failed on original p55; this prior attempt is not repeated.

## New two-word coordinate and frozen rule

The **very next complete word** p27@36 is the single rune **P**, whose GP-prime weight is **43**. One-based table entry43 is **0S**, byte **28**. Consequently, the consecutive original p27 words AE.F and P select the **pair (page32, rune offset28)** under the same source-index convention. Both printed tokens have first numeral zero, so they decode identically under the still-disputed 2014 radix59 and radix60 number systems.

Freeze one literal continuation with no fitted ciphertext operations: at a target (physical page, zero-based rune offset), skip the unfinished whole word if the rune offset is inside one. Take the first **two complete printed words starting at or after** that offset. For each such word, compute its ordinary published GP-prime sum S and select one-based table cell **1 + ((S − 1) mod 256)** in the printed row-major table. Interpret the first cell's numerical value as a new physical page and the second as its zero-based rune offset. This is a deliberately testable conjectural grammar; no preserved Cicada instruction specifies the modulo256 wrap, page/offset interpretation, or the skip rule.

| Starting point | Next two complete words and GP-prime sums | One-based table cells | Base60 destination | Base59 destination |
| --- | --- | --- | --- | --- |
| p27@28, after duplicate footer | AE.F = **103**, P = **43** | 103=0W, 43=0S | **p32@28** | **p32@28** |
| p32@28, inside an existing word | F-O-TH = **14**, H-O-M-E-X-W-D-S-L-F-D = **540** | 14=04, 28=0P | **p4@25** | **p4@25** |
| p4@25, inside an existing word | U-M-EO-EA-G-NG = **320**, NG-W-C = **111** | 64=0p, 111=0W | **p51@32** | **p50@32** |
| p51@32, complete-word start | A-U-N-EA-E-D-M-A = **562**, T-OE-M = **213** | 50, 213 | **p16@70** | Stops earlier at p50 |
| p16@70, inside an existing word | U-IA = **110**, H-G = **40** | 110, 40 | **p184@5 (out of range)** | Stops earlier at p50 |

The radix fork occurs at table cell64: printed token **0p** represents **51** under base60 but **50** under the alternative base59 alphabet omitting lowercase f. In base59, the route therefore lands at the runeless **numeric-only p50**, which has no whole GP words at offset32, so the fixed grammar cannot continue. In base60 it proceeds to p51, then p16, then leaves the original 58-page volume at page184. A modulo58 wrap or reinterpretation of a numeric cell as a cipher opcode would change the declared model; neither is independently selected.

## Cryptanalytic decision

The second addressed cell is an exact, reproducible original-source relation. It upgrades an earlier one-number possible p32 pointer to a **two-coordinate** conditional route that can be independently followed and rejected. The short return to the table under base59 does **not** establish base59 as the intended radix; the original work does not authenticate this navigation grammar, and the branch has no plaintext or source-selected way to consume the number table. The source clues constrain what a reader *could* try but do not demonstrate that this is what Cicada designed.

Three missing premises are decisive: why GP prime sums index the 256 cells with modulo256, why their values name a physical page and rune position, and why landings must advance to the next two whole words. A genuine continuation requires a separately authentic source selecting this complete rule or specifying a reversible table consumer. Until then, retire its failed direct continuation rather than tune parameters to manufacture longer loops or English-looking glyphs.

**Reproducer:** [sims/lp2_p55_p27_wordpair_table_route_sft.cjs](../sims/lp2_p55_p27_wordpair_table_route_sft.cjs). It reads unmodified resources/liber-primus/lp2-corpus.json, lp2-transcription.txt (joins original wrapped words, preserves real punctuation, skips physical numeric page50), and base60-grid.json. It asserts the six-rune source repeat, the p27 word sums, the table cells and the original route under both radix readings. It has no filesystem writes, key search or language scoring. The independent prior six-rune cross-page census is explicitly credited above.
