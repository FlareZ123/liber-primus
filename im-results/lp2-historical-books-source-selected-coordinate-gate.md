# Historically named books: exact LP2 key-selector decision

**Agent1 · Director #2290 · 22 November 2026. Classification: source-bounded negative on a literal inherited book-coordinate grammar, with one explicit thematic lead. No unknown LP2 plaintext or key.**

## The actual historical book-cipher operands

The historical 2012–2014 puzzles used several external texts and explicit address grammars, not a universal rule for picking a book. The [2014 authenticated source/operator audit](../workplace/cicada-authenticated-operator-prior-20261121.md) preserves separate cases:

- 2012: 29-volume encyclopaedia/Mabinogion reference and a separate William Gibson *Agrippa* QR-code poem route. The supplied coordinates were for **those** stage outputs.
- 2013: *Liber AL vel Legis* was identified for its own book-code stage, not an LP2-running-key instruction.
- 2014: the signed first-onion poem selected Emerson's *Self-Reliance* and supplied **fifteen 1-based paragraph:sentence:word:letter coordinates and one literal digit 3**, recovering `auqgnxjtvdbll3pv.onion`. The contemporary [archived essay text](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/self-reliance.txt) is pinned to a repository commit. A later 2014 stage selected Hofstadter's *Gödel, Escher, Bach* through chapter abbreviations and its own line/word/letter addresses.

The [authenticated 2016 instruction](../resources/historical/cicada2016-4gq25-outguess.asc) instead identifies **Liber Primus's own** words, meanings and numbers as map/road/direction. It does not name an external book, edition, coordinate tuple, exact offset, running-key operation, or ciphertext receiver.

## A genuine cross-text observation, and why it is insufficient

The first paragraph of the pinned 2014 Emerson transcription says that the **inmost** becomes the **outmost**. Authentic [solved LP1](../resources/liber-primus/lp1-plaintext-reference.txt) speaks of journeying *within* to arrive *outside* and later of the instar emerging through going within; solved p57 similarly describes finding divinity within and emerging. The LP2 prelude is titled *INTUS* (within). This establishes a real, historically accessible thematic compatibility between a previously used book and the manuscript. The original LP1 itself already supplies the same inside/outside motif, and there is no original address directing a solver from *INTUS* to one specific edition or a section of the Emerson essay. Treat the book-key interpretation as an **unselected hypothesis**, not an inferred historical key.

## Narrow original-input address-grammar gate

A direct transfer of the **historical 2014 Emerson four-field coordinate format** to the original p49–51 32×8 numerical object would read 256 printed tokens as 64 consecutively packed paragraph:sentence:word:character addresses. The source transcript is [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json); the 2014 archived essay has an **exact maximum contiguous alphabetic-word length of 16** (e.g. `circumnavigation`). Retaining the original panel's conventional radix60→byte interpretation and the original 1-based coordinate semantics, the **fourth** field exceeds the valid 1–16 character range for:

| Four-cell starting phase (circular source order) | Valid fourth fields /64 | Impossible /64 |
| --- | ---: | ---: |
| 0 | 2 | 62 |
| 1 | 3 | 61 |
| 2 | 2 | 62 |
| 3 | 3 | 61 |

The panel also uses only tokens whose first printed glyph is a digit 0–4; none is itself the alphabetic chapter abbreviation required by the previously used *GEB* format. That is a **literal-format mismatch**, without implying that an unknown numerical recoding is impossible. No original clue selects a recoding, phase or replacement coordinate grammar. Exact [read-only Node22/CommonJS reproducer](../sims/lp2_historical_bookcode_p50_literal_sft.cjs); same results recomputed directly from all 256 canonical bytes.

The p15 highlighted 16-cell Fibonacci-prime spiral is independently solved on its own native terms ([source derivation in authoritative synthesis](../results/README.md)); neither its sixteen large integers nor the p50 panel supplies an independently selected paragraph/sentence/word/letter address into *Self-Reliance*, *Agrippa*, *Liber AL*, or *GEB*. An imagined base conversion or new page selector would be an additional, unprovided author instruction.

## Decision and specific reopen condition

**None of these historically attested named books is presently an authenticated LP2 running key or selected edition.** The exact first-party book references and typed coordinate protocols are real, but remain attached to their original stages. The early-Emerson within/outside match is a distinct possible historical inspiration, not a key selector. The only concrete direct original-panel reuse of the old 2014 four-field code fails 61–62 of 64 literal letter positions even before decoding GP ciphertext.

Reopen the book-key route only on an **independent original LP2 illustration/rubric, a newly recovered first-party handoff, or a specifically printed coordinate grammar** that chooses (i) exactly one named edition/corpus; (ii) address units and indexing; (iii) rune/letter serialization and the transparent-F rule; (iv) running-key offset/clock; and (v) a ≥250-rune original unknown receiver plus ≥150 withheld runes. Without that missing selector, another edition sweep or arbitrary GF29 Vigenère alignment is unlikely to advance plaintext recovery.

No new unknown-page plaintext, key, or general book-cipher exclusion is claimed.
