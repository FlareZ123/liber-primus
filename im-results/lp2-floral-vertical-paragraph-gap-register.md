# Original floral-page line spacing supplies six candidate implicit word breaks

**Source-image finding, 15 November 2026 (Agent 1).** Eleven original rune-text floral LP2 physical pages p40–48 and p52–53 have a normally 188–189-pixel text-row pitch. Their source 2400×3600 JPEGs contain **nine anomalous +36-pixel stanza-like breaks** (224-pixel pitch). **Six are unmarked by a period or hyphen in the canonical source transcription** and thus are lost when that transcription's newline is removed. The remaining three have a printed hyphen at the line edge. These nine are **image observations**, while the proposal that the six unmarked gaps denote *word breaks or cipher-state resets* is an interpretation. No unknown LP2 plaintext, key or author-authenticated operation is recovered.

The independently reproducible [single-file visual-text SFT](../sims/lp2_floral_vertical_paragraph_gap_sft.py) reads only the original `57.jpg`–`65.jpg`, `69.jpg`–`70.jpg` and `resources/lp2-transcription.txt`; its readout is source-fixed. Each original image is decoded to 8-bit luminance. Count pixels below grayscale125 in each row of the central fixed text column x700:1550 (the short p53 ending requires x600:1790), identify long glyph-bearing row bands with more than 50 ink pixels and height above45, and compare consecutive band-start y values. Pages p49/p51 are excluded from this precise pure-rune comparison because they mix a different-format numerical grid with rune text; p50 has no rune text. The eleven included pages have exactly **128** detected rows. The unmodified source transcription provides the expected row counts and exact original rune offsets. All nonlisted interline start distances are 187–190 pixels, except one 202-pixel p53 terminal short-row bound. The nine listed intentional-looking gap pitches are exactly **224 pixels**, measured at the original image resolution.

| Physical page | Source scan | After printed line | Next-row pitch (px) | Number of preceding page-local runes | Canonical transcription mark |
| ---: | ---: | ---: | ---: | ---: | --- |
| 40 | 57.jpg | 4 | 224 | 78 | hyphen |
| 40 | 57.jpg | 5 | 224 | 99 | **none** |
| 40 | 57.jpg | 9 | 224 | 189 | **none** |
| 41 | 58.jpg | 10 | 224 | 226 | hyphen |
| 42 | 59.jpg | 3 | 224 | 70 | **none** |
| 42 | 59.jpg | 6 | 224 | 136 | **none** |
| 43 | 60.jpg | 1 | 224 | 23 | hyphen |
| 53 | 70.jpg | 3 | 224 | 64 | **none** |
| 53 | 70.jpg | 6 | 224 | 129 | **none** |

The offsets designate a gap **after** the indicated number of page-local runes; they do not add, omit or change any rune. Reproducibility checks assert exactly nine breaks at the named source rows and exactly six with no transcribed mark, using original image dimensions and printed text rows. A separate independent JSON/ink scan with the same source files confirmed the nine page/offset pairs. The author could simply have used paragraph spacing: because period punctuation occurs elsewhere without an extra line break, these gaps do not prove a ciphertext-level clock.

## First-party clear-text spacing calibration

An independent **known-clear GP page** supports a cautious interpretation of these spacings. Original LP1 physical p14, source image `14.jpg`, prints `YOUR-TRU` at one line end and `TH.IMPOSE...` at the next, the single plaintext word **TRUTH** visibly continuing across a normal **189-pixel** first-ink-row pitch. The same original p14 image has a **224-pixel** gap after the source line ending `THINGS.DISCOVER-TRUTH-INSIDE-`, whose terminal hyphen already marks a word break, and another 224-pixel gap after the source line ending `TH.IMPOSE-NOTHING-ON-OTHERS.`, where a period already marks a break. These coordinates are independent of unknown LP2 plaintext and give a genuine first-party display-layout positive for the rule that normal line wrapping may split a word and larger spacing can follow complete words. They do **not** prove all six unmarked unknown-page 224-pixel gaps denote word breaks. Original first-party transcription: `resources/transcriptions/lp1_wulfic_canonical.txt`; original archive scan14 is `resources/liber-primus/14.jpg`.

## Direct decoder consequence and bounded countercheck

Under the usual transcription parser, a line break without a hyphen does **not** end the current whole word. Interpreting each of the six unmarked larger spacings as a true word separator would therefore split precisely six canonical words in p40–53. The visual possibility matters to downstream algorithms that reset keys on printed words, even though the word boundaries on most of the book are unchanged. This is a **candidate alternate word-segmentation register**, not an evidence-based reason to correct `resources/lp2-transcription.txt` or rewrite global counts `2,896` to `2,902`.

A bounded independent statistical countercheck treated all six as additional separators on the original p40–53 rune-text segment, with no change to the source glyphs. Its exact printed word count rises from **669 to675**; observed 10×10 adjacent GP-word-length mutual information (clip lengths at9) changes from **0.046665** to **0.044124**. Under 2,000 fixed-seed same-length-multiset shuffles, the values remain below null means 0.051056 and0.050774 (z −0.52 and −0.74). Thus this natural layout correction does **not** restore native-English word-order grammar by itself. This calculation is supplemental; the more consequential next test is to treat the nine image-selected vertical gaps as possible **cipher-state or key-clock reset candidates** when and only when a reversible cipher receives independent evidence. A direct key sweep on the nine gaps lacks an authored operation and is not warranted.

**Status:** original visual layout result plus conditional six-boundary interpretation. The separate [pixel-identity result](lp2-floral16-source-border-pixel-identity.md) proves the repeated floral frame is static across all sixteen scans; these nine changing interline spacings belong to the central text layout, not an ornament modulation. No claim of unknown plaintext recovery.
