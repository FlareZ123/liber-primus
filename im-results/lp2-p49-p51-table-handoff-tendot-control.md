# LP2 pp49–51 table handoff: the original ten-dot mark cannot by itself select a cipher reset

**Original-input decision, Agent50, 15 November 2026; Director #1084.** No previously unknown LP2 plaintext, authentic key, or source-authored reversible table consumer was found. This report separates a falsifiable punctuation-clock claim from the unsolved table-mediated transition.

## The actual before/table/after interface

Original scans \`66.jpg\`, \`67.jpg\`, \`68.jpg\` (physical LP2 pp49–51) present, in author-published order:

| Segment | Visible original evidence | Cipher relevance |
| --- | --- | --- |
| p49 before grid | **66** runes, three printed rune lines; the last word is \`OE-EO-W-J-P-D\` followed by a **red ten-dot glyph**, at rune-local offset 66 | The ten-dot mark is a genuine *pre-table* separator. p48's last eight rune glyphs join p49's first rune into a single printed word, so the p49 opening is not a new chapter/key start. |
| Table | **256** two-character numeral tokens in exactly **32×8** positions; **10 rows p49 + 13 p50 + 9 p51**, no printed heading at the internal page boundaries | The supplied conditional base60 readout gives 256 values 0–255, with **161 distinct byte values** (repeats prevent the displayed bytes from being a permutation/S-box). The original image supplies neither a source-authored byte-to-GP29 conversion nor a table state-update opcode. |
| p51 after grid | **92** runes, four printed rune lines beginning \`W-W-P\`, without an introductory red rune heading or new large mark | Its last three rune glyphs join p52's first rune into a single printed word, so any state after the table must remain consistent into p52. |

Exact 66/0/92 physical page counts, source ten-dot positions, table row lengths, and first postgrid word are assertions in the [SFT](../sims/lp2_table_handoff_tendot_sft.cjs). Source inputs are [canonical GP29 corpus](../resources/liber-primus/lp2-corpus.json), [256-cell original-derived table](../resources/liber-primus/lp2-grid-256.json), [ink annotations](../resources/liber-primus/lp2-ink-annotations.json) and [original scans](../resources/liber-primus/). The 256-cell byte reading is **conditional** on base60, not a cipher rule.

## Authenticated solved-page control: ten-dot does not require reset

The **same red ten-dot form** occurs in authentically solved LP2 p56 at rune offset **45**, immediately **after the words that decode to `...PAGE THAT HASHES TO` and before the 128-hex digest**. A non-rune five-line hexadecimal block follows the mark; rune prose resumes after that block with `IT IS THE DUTY OF EVERY PILGRIM...` and no new red heading. This is a particularly close source-visible parallel to p49's ten-dot-before-256-number-table and p51's unheaded return to rune prose. The strongest fresh interpretation is that these ten-dot marks can **introduce typed non-rune data fields into an ongoing paragraph**, whose meaning is determined by the preceding plaintext. This is a testable reading-order clue, **not proof** that the p49 grid is a hash or that both uses have the same syntax. The mark also occurs on pp36 and 38 at source-internal divisions, so it cannot be equated globally with a numeric-payload introduction. The first-party p56 inverse is ciphertext minus consecutive-prime-minus-one modulo29, with the single literal-F key skip at local offset56. It continues its prime counter **across** the red ten-dot. If a rule instead restarts that counter at the ten-dot, its immediate 13-rune output becomes:

\`R-NG-AE-O-B-G-P-L-EO-OE-O-F-E-EA\`

The uninterrupted authenticated reading is:

\`I-T-I-S-TH-E-D-U-T-Y-O-F-E\`

Across all **40** runes after p56's ten-dot, the forced-reset register accidentally agrees at only **3** positions. This is an exact known-cipher positive versus a specific rejected reset rule. It does **not** exclude a cipher change caused by the intervening *table itself* on unknown p49–51, but **the ten-dot glyph alone cannot be treated as a mandatory GP29 prime-clock reset**.

As a distinct, deliberately narrow original input check, starting a fresh p56-style prime-minus-one key at the first p51 rune converts its complete initial ciphertext word \`W-W-P\` to \`G-C-N\`. No original source selects that restart and the output is not a source-native prose anchor; this three-rune check is **not** a general exclusion of table consumers. The authentic p56 literal-F ambiguity cannot affect that initial three-rune readout because there is no F in it.

## Decision and next causal dependency

The **closest actual solved-page analogy** is p56's `HASHES TO [literal 128-hex digest]` construction: a ten-dot separates an explanatory rune clause from a non-rune data object, then unheaded rune prose resumes. This materially raises the priority of **decrypting the preceding p40–49 clause to identify the table's intended data type and consumer**. It remains a structural inference: the p49 preceding clause is unknown, whereas the p56 one is independently solved. Other live possibilities are that the grid is a standalone encoded object or changes the postgrid cipher state. The scans distinguish the physical insertion and separator but do **not** distinguish among these semantics. The **missing source-selected operand** is a rule mapping a table cell or sequence of cells, with defined traversal, radix and role, into a reversible GP29 transition *and* specifying where that transition starts and ends. Neither the 256-byte array nor the red ten-dot supplies an initial state, an encoder or a plaintext receiver.

The strongest justified follow-up is to obtain a separately authenticated GP29 decoder/instruction for the **earlier p40–49 text**, or a period-original signed explanation of what the numeral table represents. Such an input could specify whether the table encodes key bytes, a payload, instructions or an in-band state change. Only then freeze a single inverse, test the final untouched p49 phrase and first untouched p51 phrase, and predict a withheld p52 word/paragraph without tuning the same ciphertext. Do not turn the table's numerical size, source punctuation or self-round-tripping into a key by fiat.

**Scope:** a new exact solved-p56 punctuation-reset counterexample and source-layout handoff decision. No claim that the table has no encryption role or that all table-mediated ciphers are excluded. Existing byte-codebook, ring, Josephus, RC4 and arithmetic consumers remain bounded by their own reports rather than being rerun here.
