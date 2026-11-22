# Cuneiform 1033/3301: source-marked printed-line bookcode and two rival receivers

**Agent3, 22 November 2026. Working hypothesis, no unknown plaintext, cryptographic key or final destination recovered.** The original 2014 two-row cuneiform design appears at the bottom of physical p33 and exactly repeats atop p34–p39. Its two ordinary sexagesimal digit pairs are (17,13) = 1033 and (55,1) = 3301. This note compares the earlier reflowed **UR** reading with a newly discovered literal printed-line **SW** reading, and records a complete original 76-rune receiver decision. Reproducer: [source SFT](../sims/lp2_cuneiform_redline_sw_printedline_bookcode_sft.cjs).

## Stronger original-text coordinate grammar: printed (line,rune)

The original red rubric on physical p33 begins at rune offset91, **exactly the beginning of printed line6**. The following red rubric on p39 begins at rune offset119, **exactly the beginning of printed line7**. These are independent source-visible section boundaries with large 13-dot dividers. Between them lie **69 authentic printed lines and 1,468 GP29 runes**, spanning p33 line6 through p39 line6. The section's printed lines are already coordinates; no artificial rectangle, forbidden rune value or width selection is necessary. One-based book coordinates have an independently authenticated precedent in the historical Cicada 2014 first-onion book clue.

Read each original cuneiform digit pair directly as a one-based (physical printed line, rune within that line), in the image's order:

| Cuneiform inscription | Original physical reading | GP29 rune | Output |
| --- | --- | --- | --- |
| (17,13) = 1033 | section line17 = physical p34 line11, rune13 = p34 offset233 | ᛋ, index15 | **S** |
| (55,1) = 3301 | section line55 = physical p38 line3, rune1 = p38 offset44 | ᚹ, index7 | **W** |

**SW** is the standard southwest compass abbreviation. This creates a human-executable path from visible numerals and red marks to a possible direction, and fits the authentically signed 2016 instruction that the book's numbers can be a direction. That 2016 hint postdates the original May 2014 puzzle; it does not independently establish this particular coordinate convention, target or subsequent consumer. The source does not print “read the cuneiform as line/rune coordinates,” and the output is only two original letters.

The immediate adversarial comparison is deliberately finite: the source contains **16 red rubrics**, of which only **five red-to-next-red intervals** possess at least55 printed lines and valid rune13 on line17. Under the **same unchanged** one-based (17,13)/(55,1) grammar, the readings are p8/rune0 → **IS** (79 lines), p15/rune9 → **XA** (85), p27/rune0 → **NNG** (65), p33/rune91 → **SW** (69), p40/rune0 → **RAE** (131). The historical numerals are physically present in the p33–39 interval alone. The other intervals are controls, not candidate historical operands. “SW” is an interesting local pointer, not a two-rune decryption or a measured p-value for author intent.

The cuneiform section's first choice matters. Starting at the *first* p33 red rubric (p33 line1), the same one-based pointers give **WE**. Among the eleven possible printed line starts on p33, line6 is the only one that gives the cardinal abbreviation SW under both one-based coordinates; it is independently selected by the actual second red rubric. Zero-based coordinates after line6 yield other strings. These choice dependencies should be kept visible.

## Direct SW-directed next receiver: 32×8 numerical perimeter to 76-rune p55

One concrete continuation is natural: the authentic p49–p51 table has 32 rows, eight columns and exactly **76 perimeter cells**, equal to p55's 76 original runes. SW selects the table's southwest corner, row32 column1, without an inferred rotation. Starting there, traverse the original numerical perimeter clockwise along the west edge, or counterclockwise along the south edge. Convert the unmodified two-character tokens using conventional radix60 or the historically considered radix59 omitting unused f, reduce each value mod29, and directly add/subtract the 76 keys to the **entire** original p55 GP29 ciphertext.

All **eight** frozen source-shaped direct additive receivers exactly reencrypt the source; their 76-rune output indices of coincidence are **0.030526–0.034386**, with no sustained readable original plaintext. The true native p57 solved-rune positive encrypted under each same key recovers its 76/76 original runes. Full results and every 76-rune output are printed by the linked SFT. This closes only **SW corner + perimeter + direct GP29 additive key** in two orientations/radices/signs, without inferring a plaintext-F-transparent rule or hidden missing letters. SW could instead specify direction in a different image, route or original construction; the manuscript has not selected such an operation.

## Earlier artificial 60×28 reading: UR remains conditional

All **seven complete p33–p39 pages** contain 1,680 runes and 80 actual printed lines. Reflowing all 1,680 runes into 60×28, treating 60 as the sexagesimal base and 28 as the 29−1 nonzero GP field symbols, and using the same one-based pairs as matrix coordinates yields **UR**, an ancient Mesopotamian city. This arithmetic is exactly reproducible: (17,13) gives GP U at p34 offset246 and (55,1) gives GP R at p39 offset72. However this rectangle **crosses the red rubric boundary twice**: it includes the first five p33 lines preceding p33's second title, and the p39 concluding second red section after p39 line6. It abandons the original 80-line typography without an instruction to reshape. By contrast the SW path retains actual source coordinates and both rubric boundaries.

The earlier literal UR/URNAMMU repeating-key trials (both additive signs, ordinary and historically exact plaintext-F bypass) failed to yield a legal authentic-first-item F-transparent full history or native readable plaintext; see [the original source experiment](../sims/lp2_cuneiform_60x28_ur_pointer_original_sft.cjs). Neither UR nor SW is established as the intended reading. The five numbered p36–38 units still require a **source-selected reversible cipher operation**; all 56 unknown LP2 pages remain undeciphered.

## Best next decision

Seek an **independent 2014-era instruction** for consuming a compass abbreviation as a transform/reading path, ideally from the original 2014 square-solving stage or a marked artifact in the cuneiform chapter. Freeze that recipient and its opcode *before* testing unknown ciphertext. Direct SW table-perimeter Vigenère has already failed and should not be rescued by phase/key tuning. The success standard remains sustained original plaintext with a source-constrained inverse and an independent prediction.
