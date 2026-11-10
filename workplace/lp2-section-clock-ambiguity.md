# LP2 page-33 section-clock ambiguity and source-native alternative

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

## Consequence for original-cipher inference

Section-reset ciphers, title-derived keystreams, per-section language scoring and section-restricted shuffles must explicitly state which *different* original boundary they use at p33. Eight source body starts derived from the *later red heading* cannot silently be treated as the eight starts induced by the inherited $. Results on whole-book rune frequencies, page-local occurrences, the 86 adjacent equal pairs and global word-length dependence are unchanged.

**Decision:** retain the canonical transcription unchanged to preserve comparability with existing experiments; expose the alternate clock explicitly through sims/lp2_section_clock_sft.cjs. The original image may indicate nested headings rather than precisely one cipher reset. A third architecture with *both* p33 headings treated as separate start events remains open. The decisive research step is a clue-determined key/encoder that predicts original plaintext, then survives both boundary clocks or independently selects one. Do not infer a key from the marker choice itself.

## Reproduction and original sources

Run the read-only CommonJS SFT **sims/lp2_section_clock_sft.cjs** with Node.js. It uses only the repository's exact source transcription, normalized LP2 rune corpus and source ink annotation, tests every physical page's ciphertext rune sequence, asserts all eight boundary offsets and source red spans, constructs the late-red-title clock in memory, then verifies both full-book rune/word totals and all per-section counts.

- Original source: resources/liber-primus/50.jpg, physical p33, and source-aligned red ink file resources/liber-primus/lp2-ink-annotations.json.
- Correlated external transcription: https://github.com/pnotisdev/cicada3301/blob/main/work/ref/lp_verified.txt (original LP2 begins after the 16 earlier LP1 pages), and its errata file.
- Existing section-title source implementation: sims/title_grid_kdf_viterbi.cjs, BODY_PAGES and BODY_OFFSETS at source lines 30–31.
- Existing raw-section analyses such as im-results/wordlength-order.md retain their original $ interpretation; their earlier finite results are **not** retrospective tests of the alternate clock.
