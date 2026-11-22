# LP2 pp0–2: 27×27 grid-source selection gate (12 November 2026)

**Decision:** the original first-three-page 729-rune square remains an admissible *representation*, but neither the manuscript's printing nor the period-authenticated Cicada material encountered here selects a **27-column reading/deciphering operation**. No unknown LP2 plaintext, historical key or source-fixed decoding rule was recovered. The result bounds an explicit grid-selection question, not the possibility of a hidden 27×27 mechanism.

## Original manuscript and the competing readout

The canonical physical page lengths are **262, 266, 201 runes**, totaling **729 = 27² = 9×81 = 3⁶**. The source image sequence is archive **17.jpg–19.jpg** (LP2 physical pp0–2), with 12, 12 and 9 printed runic lines. The printed line-rune lengths are respectively:

- p0: `20,23,19,22,24,21,21,23,23,20,23,23`
- p1: `24,23,23,21,23,23,22,21,21,21,21,23`
- p2: `21,24,22,25,23,21,24,22,19`

These **33 physical lines** are neither 27 equal columns nor a physical 27×27 diagram. The original 3|3-like marginal staves and infinity-shaped ornaments are real visible motifs, but their historical runic reading/cipher linkage remains unauthenticated (see closed [#439](https://github.com/FlareZ123/liber-primus/issues/439) and [#469](https://github.com/FlareZ123/liber-primus/issues/469)). The source permits as readily a 9×81 or six-trit address as a 27×27 matrix; none gives a unique orientation or reversible GP29 cipher.

## Exact source-only delimiter-phase test

[SFT](../sims/lp2_p0_27square_seam_selector_sft.cjs) parses only original `lp2-transcription.txt` and `lp2-corpus.json`. It records rune offsets after printed word separators (`-` or `.`), physical line terminators (`/`), period marks, and physical page cuts. **No proposed plaintext or inferred key enters the experiment.** The first 729 runes contain **157** word-delimiter offsets, **32** explicit line terminators, **8** periods and page cuts **262/528**.

For a candidate width `w` and seam phase `r`, count events at rune positions `w+r,2w+r,... <729`. Compare phase zero (the natural layout beginning at the first red rune) to *all* phases rather than selecting a favorable seam retrospectively.

| Source event | Width | Phase-zero hits | Maximum over phases | Mean over phases | Max-phase index |
| --- | ---: | ---: | ---: | ---: | ---: |
| Word delimiter | 9 | 21 | 25 | 17.333 | 5 |
| Word delimiter | **27** | **9** | **12** | **5.630** | **2** |
| Word delimiter | 81 | 2 | 6 | 1.728 | 14 and 70 |
| Printed line end | 27 | 2 | 4 | 1.148 | 16 |
| Period | 27 | 1 | 1 | 0.259 | multiple |
| Original page end | 27 | 0 | 1 | 0.074 | 15 and 19 |

Nine of 26 canonical 27×27 row seams land at word delimiters, more than the 5.63 phase mean but below phase two's 12. Only two canonical row seams coincide with printed line ends. **No printed page cut coincides with a canonical 27-row seam.** This is a finite phase-rank comparison, not an independently calibrated significance test; its strongest use is that the manuscript does not uniquely register the intended row-seam phase.

The 729 = 3⁶ relation suggests a particularly constrained six-trit representation if the marginal 3|3 shape were an address cue. But the most literal GP-index-modulo-three cyclic six-trit scan has **443 distinct six-trit windows**, rather than 729 required for a ternary order-six de Bruijn address cycle. This rejects that single fixed readout, not arbitrary ternary encodings.

## Relation to the published opening and completion decision

The previously proposed source node **AE–J–EA** at positions 334–336 and ciphertext positions 348–354 give the arithmetic output `ASIGOTHE` under a chosen key. This remains a retrospective path: the source has a literal period after `AS` at position 349, and the published succeeding blocks cease to respect source word boundaries. The complete 38-block route uses only 103 distinct cells and has multiple incompatible plaintext readings at revisited ciphertext cells under different keys; see [opening selector](lp2-p0-27x27-opening-selector.md) and [next-block branching](lp2-27x27-published-nextblock-branching.md). Those observations do not refute context-dependent polyalphabetic operations, but they supply no independently fixed readout for the other 626 source cells.

The historically solved Stage05 transposition supplies a genuine positive example of a *clue selecting a column operation*, while providing no 27-column instruction for this manuscript. The present source-inspection gate finds no corresponding original cue. **Decision: do not commission further phase/key/path fitting on the 27×27 map without a new independent historical instruction fixing the orientation, cipher and complete original-cipher inverse.** A future positive must account for all 729 runes and predict a withheld original interval, with forward verification and authentic solved controls.

## Reproduction

`node sims/lp2_p0_27square_seam_selector_sft.cjs` reads the checked-in Unicode transcription and GP29 JSON, asserts each source length and event count, and outputs all width9/27/81 phase summaries. The input and script remain in the repository; no private corpus, random seed, or plaintext dictionary is required.
