# LP2 page-33 visual-section boundary and three lossless source clocks

**Classification:** a reproducible original-source segmentation ambiguity. Neither a key recovery nor a plaintext recovery.

## Direct evidence and competing clocks

The repository's canonical raw transcription, resources/lp2-transcription.txt, contains eight $ section-ending tokens in the 55 rune-bearing unresolved pages, with the sixth at **the end of physical LP2 p32, global rune offset 7,960**. The next physical page, **p33 (original scan 50.jpg)**, has *two* independently annotated red headings: **10 runes from local offset 0** and **8 runes from offset 91**. The second is preceded by a conspicuous line of three large black circles and begins after a visible red 13-dot mark. The repository's existing eight-title KDF inverse, sims/title_grid_kdf_viterbi.cjs, explicitly chooses p33 **offset 91**, whereas the raw $ clock places the source-section start at p33 offset 0.

The independently maintained and upstream-related pnotisdev/cicada3301 verified transcription inserts a $ separator immediately before the **second p33 red title** and none after p32. This comparison is a *transcription convention witness*, not independent cryptographic evidence or independent original-rune authentication. It also has additional markers around the p15 numerical square, so wholesale replacement of our canonical transcription would silently change other choices.

A small **in-memory, source-preserving alternative** removes the p32 trailing $, inserts one immediately before p33 rune offset91, and changes no printed runes, words or physical pages. Both have eight selected bodies:

| Section number | Original $ rune count | Later-red-title rune count | Original $ word count | Later-red-title word count |
| --- | ---: | ---: | ---: | ---: |
| 1 | 729 | 729 | 158 | 158 |
| 2 | 1,145 | 1,145 | 255 | 255 |
| 3 | 1,738 | 1,738 | 385 | 385 |
| 4 | 1,894 | 1,894 | 435 | 435 |
| 5 | 1,021 | 1,021 | 224 | 224 |
| 6 | 1,433 | **1,524** | 326 | **349** |
| 7 | 1,680 | **1,589** | 378 | **355** |
| 8 | 3,316 | 3,316 | 735 | 735 |

The sixth global boundary shifts from **7,960 to 8,051**, reallocating precisely **91 printed ciphertext runes and 23 entire printed words**. The total remains **12,956 original runes and 2,896 words**. All 55 per-page rune streams agree with normalized lp2-corpus.json under both clocks.

## Source-image recurrence across the cuneiform section

The page image supplies a stronger *typographic* selection than the inherited # LP2 page-33 visual-section boundary and three lossless source clocks

**Classification:** a reproducible original-source segmentation ambiguity. Neither a key recovery nor a plaintext recovery.

## Direct evidence and competing clocks

The repository's canonical raw transcription, resources/lp2-transcription.txt, contains eight $ section-ending tokens in the 55 rune-bearing unresolved pages, with the sixth at **the end of physical LP2 p32, global rune offset 7,960**. The next physical page, **p33 (original scan 50.jpg)**, has *two* independently annotated red headings: **10 runes from local offset 0** and **8 runes from offset 91**. The second is preceded by a conspicuous line of three large black circles and begins after a visible red 13-dot mark. The repository's existing eight-title KDF inverse, sims/title_grid_kdf_viterbi.cjs, explicitly chooses p33 **offset 91**, whereas the raw $ clock places the source-section start at p33 offset 0.

The independently maintained and upstream-related pnotisdev/cicada3301 verified transcription inserts a $ separator immediately before the **second p33 red title** and none after p32. This comparison is a *transcription convention witness*, not independent cryptographic evidence or independent original-rune authentication. It also has additional markers around the p15 numerical square, so wholesale replacement of our canonical transcription would silently change other choices.

A small **in-memory, source-preserving alternative** removes the p32 trailing $, inserts one immediately before p33 rune offset91, and changes no printed runes, words or physical pages. Both have eight selected bodies:

| Section number | Original $ rune count | Later-red-title rune count | Original $ word count | Later-red-title word count |
| --- | ---: | ---: | ---: | ---: |
| 1 | 729 | 729 | 158 | 158 |
| 2 | 1,145 | 1,145 | 255 | 255 |
| 3 | 1,738 | 1,738 | 385 | 385 |
| 4 | 1,894 | 1,894 | 435 | 435 |
| 5 | 1,021 | 1,021 | 224 | 224 |
| 6 | 1,433 | **1,524** | 326 | **349** |
| 7 | 1,680 | **1,589** | 378 | **355** |
| 8 | 3,316 | 3,316 | 735 | 735 |

The sixth global boundary shifts from **7,960 to 8,051**, reallocating precisely **91 printed ciphertext runes and 23 entire printed words**. The total remains **12,956 original runes and 2,896 words**. All 55 per-page rune streams agree with normalized lp2-corpus.json under both clocks.

 marker alone. The already-known Babylonian-style **1033 / 3301 cuneiform numeral** is printed after the second p33 red heading and its text, at the **bottom of physical p33**, then **at the top of every physical p34–p39**, six consecutive pages. The second p33 red heading follows an intervening row of three large black circles and the red 13-dot mark. This layout favours treating the second p33 heading at local rune offset **91** as the start of the cuneiform-decorated passage, without proving an encryption reset there.

A read-only [original-JPEG SFT](../sims/lp2_cuneiform_header_sft.py) searches a source-selected p33 bottom crop `x=[1016,1405), y=[3025,3450)` across all 58 original LP2 pages. At one-quarter size, the normalized image-correlation search finds **only pp33–39** at score above 0.95: p33 **0.98994** and each p34–39 **0.99375**. The best page outside this contiguous seven-page interval is **0.30788**. All six source p34–39 top-patch RGB pixel arrays at `x=[1016,1405), y=[131,556)` are **byte-for-byte identical**, SHA-256 of the decoded OpenCV BGR patches `21d5cb4cb00e0a0d7d5b8adbbe14e497128951623ea4e98e10213f5c7288938f`. The p33 bottom variant relocates to precisely `x=1016,y=131` on every later page with full-resolution NCC approximately **0.9700**. The repeated 1033/3301 numeral reading predates this test; the new source finding is the **full seven-page placement and six identical source RGB headers**. No key or hidden-image payload was recovered.

The original p33 also has a separate **10-rune red heading at offset 0**, just after p32's end. Keeping *both* visible heading events rather than choosing one results in a third, exactly lossless **nine-body source clock**:

| Source segmentation | Runes by body, summing to 12,956 | Words by body, summing to 2,896 |
| --- | --- | --- |
| p32-end only (8 bodies) | 729, 1145, 1738, 1894, 1021, 1433, 1680, 3316 | 158, 255, 385, 435, 224, 326, 378, 735 |
| p33 second-heading only (8 bodies) | 729, 1145, 1738, 1894, 1021, 1524, 1589, 3316 | 158, 255, 385, 435, 224, 349, 355, 735 |
| **Both p33 headings (9 bodies)** | 729, 1145, 1738, 1894, 1021, 1433, **91**, 1589, 3316 | 158, 255, 385, 435, 224, 326, **23**, 355, 735 |

The new body is exactly the **91-rune / 23-word** run between global offsets **7,960** and **8,051**. This intermediate span could be a distinct section, a brief prologue, or a cryptographic continuation; the visible layout only supports the segmentation. Its rune count being `7×13` is retrospective and not an independently selected key-clock period. The updated [three-clock SFT](../sims/lp2_section_clock_sft.cjs) verifies all source runes, word totals and marker positions.

## Consequence for original-cipher inference

Section-reset ciphers, title-derived keystreams, per-section language scoring and section-restricted shuffles must explicitly state which *different* original boundary they use at p33. Eight source body starts derived from the *later red heading* cannot silently be treated as the eight starts induced by the inherited $. Results on whole-book rune frequencies, page-local occurrences, the 86 adjacent equal pairs and global word-length dependence are unchanged.

**Decision:** retain the canonical transcription unchanged to preserve comparability with existing experiments; expose the alternate clock explicitly through sims/lp2_section_clock_sft.cjs. The original image may indicate nested headings rather than precisely one cipher reset. The third typographic nine-body alternative retains *both* p33 heading events; the source does not decide whether either resets a cipher. The decisive research step is a clue-determined key/encoder that predicts original plaintext, then survives both boundary clocks or independently selects one. Do not infer a key from the marker choice itself.

## Reproduction and original sources

Run the read-only CommonJS SFT **sims/lp2_section_clock_sft.cjs** with Node.js. It uses only the repository's exact source transcription, normalized LP2 rune corpus and source ink annotation, tests every physical page's ciphertext rune sequence, asserts all eight boundary offsets and source red spans, constructs the late-red-title clock in memory, then verifies all three clocks' full-book rune/word totals, original offsets, and per-section counts.

- Original source: resources/liber-primus/50.jpg, physical p33, and source-aligned red ink file resources/liber-primus/lp2-ink-annotations.json.
- Correlated external transcription: https://github.com/pnotisdev/cicada3301/blob/main/work/ref/lp_verified.txt (original LP2 begins after the 16 earlier LP1 pages), and its errata file.
- Existing section-title source implementation: sims/title_grid_kdf_viterbi.cjs, BODY_PAGES and BODY_OFFSETS at source lines 30–31.
- Existing raw-section analyses such as im-results/wordlength-order.md retain their original $ interpretation; their earlier finite results are **not** retrospective tests of the alternate clock.
