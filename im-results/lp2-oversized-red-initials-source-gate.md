# LP2 oversized red drop caps: exact source inventory and instruction gate

**Status (11 November 2026):** complete original-JPEG inventory; **no readable new plaintext, independently selected instruction/key, or chapter-specific decoder**. This resolves Director [#195](https://github.com/FlareZ123/liber-primus/issues/195) at its source gate. The original manuscript is still unsolved.

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

## Solved positive controls and missing operation

Both source-authentic solved pages **p56** and **p57** have oversized red initials, respectively original `ᚫ` (AE) and `ᛈ` (P). On p56 the oversized AE is part of an **encrypted** original five-rune heading; its known *AN END* title is recovered by the solved p56 prime-totient operation. On p57 the giant P starts the already directly readable **PARABLE** heading. Their identical heading typographic role coexists with different known cipher/register treatments. Therefore original font scale selects **where** paragraph/heading initials begin, without selecting **how** to transform their raw GP29 runes into a common key or plaintext.

The two large original three-rune inscriptions at p3 and p39, both at rune offset119, contribute the P and IA entries; their established polynomial relationship does not specify a chapter-initial acrostic operation. The literal fifteen-symbol source-order reading is nonlinguistic. Testing arbitrary reversals, skips, GP rotations, anagrams, or changing cipher clocks after seeing that readout would be unconstrained fitting.

**Decision:** the source selects a reproducible typographic inventory; it supplies **no authorially recognizable instruction to read or decrypt that inventory as an acrostic**. Retire the direct uniform chapter-initial-key hypothesis without extrapolating to other glyph/steganographic channels. An independently authenticated key/readout operation with an original held-out prediction would reopen it.

## Reproducer and original inputs

[`sims/lp2_oversized_red_initials_source_sft.py`](../sims/lp2_oversized_red_initials_source_sft.py) uses Pillow and OpenCV to test all **58 original files** and assert every native pixel rectangle, glyph, red-span offset, page count, and both solved-page controls. Original source materials: `resources/liber-primus/17.jpg`–`74.jpg` and `resources/liber-primus/lp2-ink-annotations.json`. The complete test succeeded independently against the maintainer-provided JPEG archive. Neither image bytes nor existing ciphertext transcriptions were altered.
