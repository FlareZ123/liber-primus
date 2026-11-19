# All 32 LP2 cross-page word carries: original-image audit

**Agent15, Director task #1909, 19 November 2026. Classification: complete structural inventory; no cipher key, clock, opcode or plaintext recovered.**

## Finding

The 32 cross-page words are genuine printed-word continuations, not page-local singleton words. Every one begins in the final rune-bearing line of a physical page and resumes at rune offset **0 of line 1** on the next page. None has a hyphen or punctuation mark at the page boundary. All 32 crossing fragments are black ink; no red/black change occurs at any crossing.

The inventory covers all 55 rune-bearing LP2 pages p0–p49 and p51–p55. Page p50 is the image-only 32×8 numerical table and has zero runes. Thus there are **54 transitions between rune-bearing pages**: **32 carry a word**, while **22 have a printed word delimiter**. The physical page break itself is not a word delimiter.

## Method and conventions

- The original LP2 JPEG sequence maps physical page p to file p+17 (p0 is 17.jpg; p55 is 72.jpg). The page-number mapping and image-only p50 are recorded in [the source inventory](../resources/liber-primus/README.md).
- Rune and global offsets are **zero-based**. Rune-bearing line numbers are **one-based**; offsets within a line are zero-based. Marker-only lines are not counted as rune-bearing lines.
- The structured offsets are reproduced by [the all-32 boundary script](../sims/lp2_all_cross_page_word_boundaries.cjs), which checks each page's rune count against lp2-corpus.json and cross-checks the 32 words against the canonical continuous parser in lp2_word_pages.cjs. The [CSV](lp2-all-32-cross-page-word-boundaries.csv) contains the full word, GP transliteration, both page fragments, page-local offsets, line offsets, image names and global offsets.
- All 64 page-edge line crops (last rune-bearing line of each preceding page and first rune-bearing line of its successor) were visually reviewed against the original JPEGs. The crop review shows no separator at any crossing. A red-pixel mask (R>140, G<110, B<110) returns zero pixels in those edge-line bands; all crossing glyphs are black. This is a visual source check, not a new independent glyph-by-glyph transcription.

## Complete inventory

| Boundary | Complete word (GP runes) | Split at page | Page-local offsets (previous; next) | Rune lines / line offsets | Global offsets |
|---|---|---|---|---|---:|
| p0→p1 | ᚹᚪᛁᛗᛋᚾ | ᚹ + ᚪᛁᛗᛋᚾ | 261–261; 0–4 | L12:22–22 → L1:0–4 | 261–266 |
| p1→p2 | ᛚᛉᛁᛟᛗ | ᛚᛉᛁ + ᛟᛗ | 263–265; 0–1 | L12:20–22 → L1:0–1 | 525–529 |
| p3→p4 | ᚻᛠᚻᛚᛡ | ᚻᛠᚻ + ᛚᛡ | 214–216; 0–1 | L11:20–22 → L1:0–1 | 943–947 |
| p4→p5 | ᚢᚱᚫ | ᚢ + ᚱᚫ | 260–260; 0–1 | L12:22–22 → L1:0–1 | 1206–1208 |
| p5→p6 | ᛏᛉᚳᛏᚻᛞᛇ | ᛏ + ᛉᚳᛏᚻᛞᛇ | 262–262; 0–5 | L12:19–19 → L1:0–5 | 1469–1475 |
| p6→p7 | ᛋᚻᛝ | ᛋ + ᚻᛝ | 195–195; 0–1 | L10:21–21 → L1:0–1 | 1665–1667 |
| p8→p9 | ᛇᚣᚹᚫᚷᛄ | ᛇ + ᚣᚹᚫᚷᛄ | 254–254; 0–4 | L12:23–23 → L1:0–4 | 2128–2133 |
| p9→p10 | ᚹᛡᛠᚱᚫᚹᛡᛞᚪᚦᚳ | ᚹᛡᛠᚱᚫᚹᛡᛞᚪᚦ + ᚳ | 258–267; 0–0 | L12:13–22 → L1:0–0 | 2387–2397 |
| p16→p17 | ᛟᚷᛚᚦ | ᛟᚷ + ᛚᚦ | 265–266; 0–1 | L12:20–21 → L1:0–1 | 4027–4030 |
| p18→p19 | ᚷᚾᚩᛟᚾᚠ | ᚷ + ᚾᚩᛟᚾᚠ | 259–259; 0–4 | L12:19–19 → L1:0–4 | 4561–4566 |
| p19→p20 | ᛗᛇᛈ | ᛗᛇ + ᛈ | 269–270; 0–0 | L12:20–21 → L1:0–0 | 4831–4833 |
| p21→p22 | ᛁᛈᚪᛝᛋᛞᛟᚩᛝᛗ | ᛁᛈᚪᛝᛋᛞᛟᚩ + ᛝᛗ | 265–272; 0–1 | L12:16–23 → L1:0–1 | 5367–5376 |
| p23→p24 | ᚪᚻᛠᚦᛞᚱᚠ | ᚪᚻᛠᚦ + ᛞᚱᚠ | 209–212; 0–2 | L10:17–20 → L1:0–2 | 5715–5721 |
| p24→p25 | ᚪᛉᛇᛝᛋᛖᛇᛁᚻᚾ | ᚪᛉᛇᛝᛋᛖᛇᛁ + ᚻᚾ | 262–269; 0–1 | L12:15–22 → L1:0–1 | 5981–5990 |
| p25→p26 | ᛡᛖᛏᛠᚢᛡ | ᛡᛖᛏᛠᚢ + ᛡ | 268–272; 0–0 | L12:16–20 → L1:0–0 | 6257–6262 |
| p27→p28 | ᚾᛈᚠᛈᚳ | ᚾᛈᚠ + ᛈᚳ | 231–233; 0–1 | L11:19–21 → L1:0–1 | 6758–6762 |
| p29→p30 | ᚷᚻᛗᛞᚪᛈᛖ | ᚷᚻᛗ + ᛞᚪᛈᛖ | 274–276; 0–3 | L12:19–21 → L1:0–3 | 7304–7310 |
| p31→p32 | ᛠᛗᚩᛚ | ᛠᛗᚩ + ᛚ | 266–268; 0–0 | L12:19–21 → L1:0–0 | 7836–7839 |
| p33→p34 | ᛒᛗᛒ | ᛒ + ᛗᛒ | 213–213; 0–1 | L11:23–23 → L1:0–1 | 8173–8175 |
| p35→p36 | ᚫᛠᛇᚣᚾ | ᚫᛠᛇ + ᚣᚾ | 268–270; 0–1 | L12:19–21 → L1:0–1 | 8703–8707 |
| p40→p41 | ᛈᛡᛠᛁᚪ | ᛈᛡ + ᛠᛁᚪ | 229–230; 0–2 | L11:17–18 → L1:0–2 | 9869–9873 |
| p41→p42 | ᛟᛟᚳᛏᛄᛞ | ᛟᛟᚳᛏᛄ + ᛞ | 268–272; 0–0 | L12:19–23 → L1:0–0 | 10139–10144 |
| p42→p43 | ᛞᛠᚢᚾᛝᚠᚾᛖᚫᚻᛄ | ᛞᛠᚢᚾᛝᚠᚾᛖᚫ + ᚻᛄ | 263–271; 0–1 | L12:14–22 → L1:0–1 | 10407–10417 |
| p43→p44 | ᛄᛏᛠᚢ | ᛄᛏ + ᛠᚢ | 272–273; 0–1 | L12:20–21 → L1:0–1 | 10688–10691 |
| p44→p45 | ᚱᛗᛞᛋᚳ | ᚱᛗᛞᛋ + ᚳ | 269–272; 0–0 | L12:17–20 → L1:0–0 | 10959–10963 |
| p45→p46 | ᚹᛝᚻᛏᛉᚫᛁᛄᚢ | ᚹᛝ + ᚻᛏᛉᚫᛁᛄᚢ | 268–269; 0–6 | L12:21–22 → L1:0–6 | 11231–11239 |
| p46→p47 | ᛝᛚᛗᚳᛡᛇᚠᚫᛠᛁᚦ | ᛝᛚᛗᚳᛡᛇᚠᚫ + ᛠᛁᚦ | 262–269; 0–2 | L12:15–22 → L1:0–2 | 11495–11505 |
| p47→p48 | ᚪᚩᚪᚫᚻᚳᛁᚦ | ᚪᚩᚪᚫ + ᚻᚳᛁᚦ | 270–273; 0–3 | L12:20–23 → L1:0–3 | 11773–11780 |
| p48→p49 | ᛇᚠᚢᛞᚣᚪᛚᚠᛡ | ᛇᚠᚢᛞᚣᚪᛚᚠ + ᛡ | 263–270; 0–0 | L12:16–23 → L1:0–0 | 12040–12048 |
| p51→p52 | ᛈᛚᚠᛈ | ᛈᛚᚠ + ᛈ | 89–91; 0–0 | L4:21–23 → L1:0–0 | 12203–12206 |
| p52→p53 | ᛟᚷᚻᚣᚻᛇᚫᛠᚫᚣ | ᛟᚷᚻᚣᚻ + ᛇᚫᛠᚫᚣ | 258–262; 0–4 | L12:18–22 → L1:0–4 | 12464–12473 |
| p54→p55 | ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣᛝ | ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣ + ᛝ | 222–231; 0–0 | L11:11–20 → L1:0–0 | 12870–12880 |

## Boundary controls and interpretation

- **p49 → p50 → p51:** no word carries through the numerical table. P49's final rune-bearing line ends with a full stop, followed by the ampersand marker; p50 has no runes; p51 starts a new word. This is one of the 22 word-delimited transitions between rune-bearing pages, not a missing carry.
- **p40 → p41:** the p40 final line has a period before the final two-rune fragment. The carried word starts after that period, then crosses the page break with no trailing separator.
- The previous-page fragment begins on line 12 in 24 cases, line 11 in five, line 10 in two, and line 4 in one. Every continuation begins on line 1. Complete word lengths range from 3 to 11 runes; the previous-page fragments range from 1 to 10 runes and the next-page continuations from 1 to 7.
- The earlier p32/p54/p55 audit and p40–p53 carry gate are focused subsets of this inventory: [p32/p54/p55](lp2-original-page-boundary-audit-p32-p54-p55.md) and [p40–p53](lp2-p40-53-page-boundary-carry-gate.md). Their individual glyph, clause and arithmetic findings remain unchanged.

## Cipher-clock decision

**No source-selected page-reset or continuous-clock rule is present in these page edges.** The scans establish word continuation across 32 page boundaries; they require any word-level operation to preserve the complete word across those breaks. They do not prove that the cipher is word-keyed, nor do they determine whether a per-rune cipher state resets at a page boundary.

The independent p50 low60 clock-selection test remains unchanged: among its four frozen within-page clocks, continuous global phase zero is the only one with positive held-out support (**+4.584893 nats, 9/9 chapters**); physical-page reset is negative (**−1.038412 nats, 6/9**). This is empirical support for that association, not an author-authenticated cipher clock. See [the clock-selection report](lp2-p50-low60-clock-selection.md). No cipher search or phase sweep was run for this issue.

**Disposition:** close #1909 on the negative source-selector result. Page boundaries carry words; they do not supply a cipher-clock reset instruction.
