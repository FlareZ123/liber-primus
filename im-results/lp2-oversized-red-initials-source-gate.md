# LP2 oversized red drop caps: exact source inventory and instruction gate

**Status (11 November source inventory, 22 November red-terminal navigation extension):** exact original-JPEG inventory, with one conditional increasing-page red-glyph route **p7→p27→solved p57**. The route supplies a plausible, source-visible page selector and still no independently authenticated cipher operation or unknown-page plaintext. The original manuscript remains unsolved; the direct drop-cap acrostic gate in Director [#195](https://github.com/FlareZ123/liber-primus/issues/195) remains closed.

## Original-source visual selector

Inspect the 58 original LP2 source JPEGs **17.jpg–74.jpg** (physical pages 0–57), each 2400×3600. For each file define the red mask exactly **R>130, G<90, B<90**, use **eight-connected components**, and label a component oversized only when its height is **at least 300 px** and red area **at least 10,000 pixels**. The definition is frozen independently of the resulting rune sequence. Ordinary red text is ~100 px high. The selected standard drop caps are ~495–498 px high; the solved p57 title is 604 px high. All sit at left text margin x≈601. Every selected component maps to the first rune of one red span in the existing independently prepared ink annotations.

Exactly **15 oversized red initials across 13 pages** satisfy that classification:

| Original order | LP2 physical p | Source rune offset | Printed rune (GP transliteration) | Pixel component (x,y,w,h; red area) |
| ---: | ---: | ---: | --- | --- |
| 1 | 0 | 0 | `ᛋ` (S) | (601,667,150,498; 31929) |
| 2 | 3 | 0 | `ᛚ` (L) | (601,670,149,495; 24763) |
| 3 | 3 | 119 | `ᛈ` (P) | (601,2099,229,493; 39502) |
| 4 | 6 | 71 | `ᚪ` (A) | (601,1722,148,496; 30868) |
| 5 | 8 | 0 | `ᛉ` (X) | (603,667,282,498; 31876) |
| 6 | 15 | 9 | `ᛚ` (L) | (601,1732,149,496; 24779) |
| 7 | 23 | 0 | `ᚢ` (U) | (601,1157,230,496; 39132) |
| 8 | 27 | 0 | `ᛗ` (M) | (601,913,230,496; 54858) |
| 9 | 33 | 0 | `ᛞ` (D) | (601,667,230,498; 56747) |
| 10 | 33 | 91 | `ᛝ` (NG) | (602,1909,218,497; 44963) |
| 11 | 39 | 119 | `ᛡ` (IA) | (601,1852,231,498; 53341) |
| 12 | 40 | 0 | `ᚠ` (F) | (601,667,149,498; 31539) |
| 13 | 54 | 0 | `ᚪ` (A) | (601,914,148,495; 30862) |
| 14 | 56 | 0 | `ᚫ` (AE) | (601,670,149,496; 30614) |
| 15 | 57 | 0 | `ᛈ` (P) | (601,915,279,604; 58641) |

The unmodified, source-order **15-rune string** is `ᛋᛚᛈᚪᛉᛚᚢᛗᛞᛝᛡᚠᚪᚫᛈ` and standard GP transliteration is `S L P A X L U M D NG IA F A AE P`.

The separate **all-red-span-first-runes** rule yields **18** symbols, not 15: the manuscript also has ordinary-size red-span starts at **p7 offset194 `ᛞ` (D)**, **p15 offset0 `ᚠ` (F)**, and **p53 offset128 `ᛏ` (T)**. Page 15's giant L starts a later red span at offset9; the first red rune F is ordinary-sized. An extraction defined as “red first letter” differs from the printed font-size selection in exactly these three original visible places. No subset tuning was used.

## New literal red-ink route: terminal rune to a *later* oversized initial (Agent45, 22 November)

The earlier exact 15-cap inventory also defines a simple, human-visible candidate handoff. Read the **final complete rune of any one original red span** among the 18 ink-marked passages, and find a **matching oversized first red rune** on a strictly *later* physical page. The only added selector is ascending original page number, a possible reading of the authenticated 2016 phrase about *numbers* giving *direction*. A page-order increase is an interpretation, not a source-authenticated mandatory opcode. No prime sums, modular products, p50 cell lookups, source word cribs, or chosen spellings enter the following source graph.

| Source red span (page:GP offset) | Destination giant first red (page:GP offset) | Identical printed GP rune |
| --- | --- | --- |
| **7:194** (closing red stanza) | **27:0** (opening giant) | **M / GP0 19** |
| 15:0 (ordinary-sized opening red) | 54:0 (opening giant) | A / GP0 24 |
| 15:9 (giant L opening second red span) | 33:91 (giant NG opening second red span) | NG / GP0 21 |
| **27:0** (opening red heading) | **57:0** (solved PARABLE giant) | **P / GP0 13** |

These are **all four** increasing-page exact terminal-to-giant-rune matches across the complete 18 red spans and 15 original independently established oversized initials. Following these links mechanically gives **exactly one increasing two-edge path**, **p7 red closing M → p27 red opening M / closing P → p57 solved PARABLE opening P**. The other two increasing links end after one step. No source rune, edge, page, or prefix was fitted to the result. Without the increasing-page restriction, **p54 closing M also links backward to p27 M**, and p27 closing P links backward to the oversized internal P on p3. Those actual alternatives are important: the manuscript itself does not prove a monotonicity rule or that reaching a solved title is the intended stopping criterion.

**Why this is a genuine decision lead:** The p7 M and p27 P terminal runes are precisely the two red passages whose *whole-span GP0 product* is inverted by their terminal rune, as recorded in the [p8 source relationship](lp2-p8-berggren-original-source-selector-gate.md). The two exact consecutive glyph matches add a straightforward visual route to the otherwise numerically elaborate [p27–p57 parable handoff](lp2-p55-p27-redheading-we-must-shed-route.md). That is an independent route *hypothesis* and candidate destination selector. It yields no decrypted p7/p27 plaintext and lacks a first-party statement commanding red terminal→giant initial or strict increasing page numbers.

**Direct solvable-content test:** Treat the exact unencrypted solved p57 GP29 PARABLE source as an unfitted classical Vigenere running key for original p27's 215 black runes, p54's 223 black runes, and p55's 76 black runes. Test the printed p57 seven-rune title, 88-rune body, or complete 95-rune page, both inverse signs, and both all-rune and literal-F-transparent clocks, with zero starting phase at the selected receiver. The highest decoded IoC29 is **0.040469** for original p27, **0.037248** for p54 and **0.044211** for the short p55, whereas the full original solved p57 reference has IoC29 **0.062710**. No target yielded a sustained native-GP plaintext beginning or a common authentic key. This retires only the fixed direct running-key transfer, preserving the source graph as an unexplained clue candidate.

The [read-only original-data CommonJS SFT](../sims/lp2_red_terminal_dropcap_monotone_route_sft.cjs) asserts the complete four-edge/one-path enumeration against all original ciphertext and red-ink annotations, reuses the earlier JPEG-audited 15-cap inventory, and gives the exact paired source-parable-key decoder output and a solved-page planted-positive. The exact original-data source census and full running-key receiver controls passed the [Windows Node.js 22 SFT run 45049747719](https://github.com/FlareZ123/liber-primus/actions/runs/45049747719). The original source is immutable.

## Solved positive controls and missing operation

Both source-authentic solved pages **p56** and **p57** have oversized red initials, respectively original `ᚫ` (AE) and `ᛈ` (P). On p56 the oversized AE is part of an **encrypted** original five-rune heading; its known *AN END* title is recovered by the solved p56 prime-totient operation. On p57 the giant P starts the already directly readable **PARABLE** heading. Their identical heading typographic role coexists with different known cipher/register treatments. Therefore original font scale selects **where** paragraph/heading initials begin, without selecting **how** to transform their raw GP29 runes into a common key or plaintext.

The two large original three-rune inscriptions at p3 and p39, both at rune offset119, contribute the P and IA entries; their established polynomial relationship does not specify a chapter-initial acrostic operation. The literal fifteen-symbol source-order reading is nonlinguistic. Testing arbitrary reversals, skips, GP rotations, anagrams, or changing cipher clocks after seeing that readout would be unconstrained fitting.

**Decision:** the source selects a reproducible typographic inventory; it supplies **no authorially recognizable instruction to read or decrypt that inventory as an acrostic**. Retire the direct uniform chapter-initial-key hypothesis without extrapolating to other glyph/steganographic channels. An independently authenticated key/readout operation with an original held-out prediction would reopen it.

## Reproducer and original inputs

[`sims/lp2_oversized_red_initials_source_sft.py`](../sims/lp2_oversized_red_initials_source_sft.py) uses Pillow and OpenCV to test all **58 original files** and assert every native pixel rectangle, glyph, red-span offset, page count, and both solved-page controls. Original source materials: `resources/liber-primus/17.jpg`–`74.jpg` and `resources/liber-primus/lp2-ink-annotations.json`. The complete test succeeded independently against the maintainer-provided JPEG archive. Neither image bytes nor existing ciphertext transcriptions were altered.
