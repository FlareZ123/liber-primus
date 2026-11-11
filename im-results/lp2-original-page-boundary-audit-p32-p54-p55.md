# Original-image word-boundary audit: p32, p54 and p55

## Finding

Independent source-first reinspection of the original scans—p32 `49.jpg`, p54 `71.jpg`, p55 `72.jpg`, with p31 `48.jpg` and p53 `70.jpg` as page-edge controls—confirms the printed word separators, line-wrap joins and page-edge carries represented in `resources/lp2-transcription.txt`. Original-pixel row projections independently locate **6, 11 and 4** text lines on p32, p54 and p55; the measured line bands and the p54 initial-glyph control are reproducible with [the original-image SFT](../sims/lp2_p54_initial_rune_shape_sft.py). This is a source-boundary audit, not a fresh glyph-by-glyph OCR of every rune. The material correction is semantic: page-local tokenization counts **segments intersecting a page**, including incoming carry fragments. Such segments are not always complete word starts.

The complete offset table is [lp2-original-page-boundary-audit-p32-p54-p55.csv](lp2-original-page-boundary-audit-p32-p54-p55.csv). Reproduce it with `node sims/lp2_original_page_boundary_audit.cjs`; use `--csv` for the table. The script cross-checks the continuous parser and hashes the five original page images.

## Page counts and carries

| Physical page | Scan | Rune lines | Runes | Page-local segments | Word starts on page | Complete words wholly on page | Incoming carry | Outgoing carry |
|---|---:|---|---:|---:|---:|---:|---|---|
| 32 | 49.jpg | 25, 23, 23, 21, 22, 7 | 121 | 22 | 21 | 21 | 1 rune | — |
| 54 | 71.jpg | 19, 21, 17, 23, 22, 22, 21, 23, 21, 22, 21 | 232 | 50 | 50 | 49 | — | 10 runes |
| 55 | 72.jpg | 24, 22, 22, 8 | 76 | 17 | 16 | 16 | 1 rune | — |

- **p31→p32:** p31 ends with `ᛠᛗᚩ` and no word separator; p32 begins with `ᛚ`. The full word is `ᛠᛗᚩᛚ` (GP transliteration EAMOL, prime sum 260), global rune offsets 7836–7839. Thus p32 segment 0 is the final rune of an incoming word, not a one-rune word; its p32-only fragment sum is 73.
- **p53→p54:** p53 ends with its red 13-dot terminator at rune offset 179. P54 begins a new one-rune word `ᚪ`; its red heading contains nine runes total, with this one-rune word followed by the eight-rune `ᛗᛝᛞᛡᚦᛉᛁᛗ` word and the red 13-dot separator at offset 9. The oversized red initial is the same source glyph as ordinary `ᚪ`, not a Latin N or a non-rune drop cap: after nearest-neighbour normalization to 34×113 pixels, its original-red mask has IoU **0.962984** against the ordinary p32 A glyph and **0.181329** against the p32 N control. Reproduce the pixel line bands and glyph comparison with [the original-image SFT](../sims/lp2_p54_initial_rune_shape_sft.py). No word carries from p53.
- **p54→p55:** p54's final page-local segment is `ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣ` at p54 offsets 222–231. P55 begins with `ᛝ`, completing the 11-rune word `ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣᛝ`, global offsets 12870–12880. P55 segment 0 is this incoming final rune, not a singleton.

## Printed line wraps

A slash/newline is layout, not a word delimiter. The original images confirm these joins:

- **p32:** line 1→2 is separated by the leading hyphen on line 2. Lines 2→3, 3→4, 4→5 and 5→6 join. The four joined words are `ᛝᛒᛇᛡ`+`ᛚᚪ`, `ᚹᛒᛋᚱᛉᛡᛉ`+`ᚪ`, `ᛟᛝᚩ`+`ᛗᛒᚢᛞᛋ`, and `ᚢᛏ`+`ᚠᛄᛏ`.
- **p54:** lines 1→2, 2→3, 3→4, 4→5, 5→6, 6→7, 8→9 and 10→11 join. Lines 7 and 9 end with explicit hyphens and therefore separate from the following line.
- **p55:** line 1→2 joins `ᛒ`+`ᛠᚠᛉᛁᛗᚢᚳᛈᚻᛝᛚᛇ` into a 13-rune word; line 2 ends with a hyphen, so 2→3 is a boundary; line 3→4 joins `ᚳᛠᛁᛗ`+`ᚳᛉ` into a 6-rune word.

## p32: 22 segments, 21 word starts

The first full stop occurs after p32 local rune offset 32: the first clause is exactly **33 p32 runes** and **7 page-local segments**. Segment 0 is the incoming `ᛚ` carry; the other six are complete word starts. The second clause contains 15 complete word starts and 88 runes. The page therefore has 22 segments intersecting it but only 21 words beginning on it.

The 22nd page-local segment is `ᚪᚷᛒᛇ`, p32 offsets 117–120 (global 7956–7959), with GP-prime sum 216. It is the **21st complete word start** on p32. The 22/7 values used in the M7 route are therefore page-local segment counts. Their arithmetic is unchanged, but an intended carry-inclusive segment address space is not established by the manuscript.

## p55: circumference and fold indices

P55 has 17 page-local segments: index 0 is the incoming carry, and indices 1–16 are the 16 complete word starts. The 17-element fold therefore uses **zero-based page-local segment indices**. Its selected entries are complete word starts 2, 8 and 14:

| Zero-based segment index | Complete word start | GP transliteration | GP-prime sum | p55 offsets |
|---:|---:|---|---:|---:|
| 2 | 2 | SB | 114 | 5–6 |
| 8 | 8 | MSDIAPF | 365 | 36–41 |
| 14 | 14 | CEAIMCX | 284 | 64–69 |

The circumference partition is unchanged: **33 boundary runes and 43 strict-interior runes**. The incoming carry at p55 offset 0 is the terminal boundary rune of the full p54–p55 word. In the 43-rune interior stream, D occurs at one-based positions **5 and 23** (p55 local offsets 12 and 38). A third D occurs at p55 local offset 70, but it is a word-boundary rune and is correctly excluded from the strict interior. The 19-rune interior span from positions 5–23 is `ᛞᚦᛡᚪᛒᚳᛠᚠᛉᛁᛗᚢᚳᛈᚻᛝᛚᛋᛞ`; its center is `ᛁ`.

## Consequences for existing routes

- The p55 fold arithmetic and selected GP strings survive, but the object is a 17-segment page-local sequence, not 17 complete words. The fold hypothesis is conditional on including the carry as segment 0.
- The p32 22/25/7 M7 arithmetic survives as a segment-count candidate, not a 22-word/7-word source instruction. The first page-local segment is a carry fragment.
- The four p32 line-wrap corrections are confirmed by the original scan. The legacy 26-token split remains wrong.
- No rune-order or separator discrepancy between the inspected scans and canonical transcript was found. The audit establishes source boundaries and offsets, not a key, plaintext, or intended address convention. **Cipher-clock decision (Issue #221):** the verified p31→p32 and p54→p55 carries mean that any *word-level* operation must preserve the complete word across the physical page break; they do not establish that the unknown cipher is word-keyed or that its state must be word-continuous. The solved p56 prime-totient control advances per eligible GP rune and passes through its internal 13-/10-dot marks without consuming or resetting, but that is a p56-specific mechanism and provides no cross-page test. The 2016 “words are a map” wording and the carry facts do not specify word-index keying, p50 table columns, byte projection, key direction, or a reset schedule. No source-selected word-continuous state machine is established; do not compare arbitrary page/word clocks without an independently fixed operation.
