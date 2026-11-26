# LP2 internal-reference grammar source gate

**Agent18, 26 November 2026. Decision for Director Issue #3062: no source-selected internal index or chapter-reference grammar is present in the inspected original material.** The manuscript has real headings, section boundaries and a local numbered packet, but no typed reference fields that direct a contemporary solver from an LP2 mark to a named LP1 heading and an ordinal within it. This is a source-selection negative, not a cipher-family exclusion. No unknown plaintext, key, or destination was recovered.

## Question and acceptance rule

Could LP2 contain a literal internal table-of-contents or chapter-reference convention that selects a known LP1 passage as key material or plaintext? To count, the route needs:

1. a historically demonstrated reference grammar on an actual solved Cicada source;
2. a named internal carrier or heading and an explicit ordinal/address unit;
3. an original LP2 token or mark that supplies those same typed fields before the target text is inspected; and
4. one exact predicted substring/operand, with no free page, line, word, offset, direction, or normalization choices.

A thematic echo, inferred chapter number from file order, or numerical coincidence is not a reference grammar.

## Source audit

### LP1: headings, not a table of contents

The original LP1 scan sequence is 00.jpg–16.jpg. Scan 00 is the title **Liber Primus**. Scan 02 is a standalone title page bearing the only explicit numbered chapter heading in the inspected original LP1 set: **Chapter 1 / Intus**. The remaining pages are continuous text, illustrations and numeric tables; there is no contents page, page-numbered list of chapter titles, index, or cross-reference instruction.

The solved-text reference lists labels such as **A WARNING**, **WELCOME**, **WISDOM**, **SOME WISDOM**, **A KOAN**, **AN INSTRUCTION**, **THE LOSS OF DIVINITY**, and **KNOW THIS**. These are headings within the book, not a table of contents. They must not all be treated as originally visible Latin labels: the transcription reference records that LP1 has six printed clear-GP pages (p3, p8, p9, p10, p11, p14) and nine encrypted pages (p0–2, p4–7, p12–13), for which the supplied Latin is decoded text. No heading list or ordinal map is printed alongside them.

The thematic link between LP1's **Intus** / “journey deep within” language and the solved p57 PARABLE's “find the divinity within and emerge” is real and worth retaining as thematic continuity. It does not specify a target heading, an address unit, or a reversible operation.

### LP2: nine visual sections, no numbered chapter index

The original-image section map fixes the nine top-level unknown groups at physical pages:

- p0–2
- p3–7
- p8–14
- p15–22
- p23–26
- p27–32
- p33–39
- p40–53
- p54–55

Their starts are p0, p3, p8, p15, p23, p27, p33, p40 and p54. A contemporary reader can identify these boundaries from a red rune heading at a new physical page immediately after a red thirteen-dot terminal mark. The headings themselves are runic ciphertext, not named chapter titles. The page numbers are physical order reconstructed from the Stage11 image sequence; they are not printed page numbers in the manuscript. The nine first runes are S·L·X·F·U·M·D·F·A, with F repeated, and the illustrations do not supply a source-authenticated nine-symbol instruction alphabet.

The only conspicuous local Arabic numbering is the 1–5 packet across p36–p38, bracketed by two red ten-dot marks. This is a local numbered unit, not a contents list or chapter-reference system. Its already-published readout uses the 2016 signed message's zero-based word numbering to produce “PRIMUS IS THE WAY ITS WORDS”; the target is that later external message, not a named LP1 passage. Its separate attempt to use those words as Vigenère keys was rejected by the exact original plaintext-F gate. This existing route is not an internal LP1 index and was not retested here.

### Historical coordinate control: a named external carrier

The first-party 2012 signed Mabinogion payload explicitly names the carrier (“Mabinogion”), gives a line-count instruction, and supplies line:character records such as 1:29, 6:46 and 2:37, alongside explicitly literal arithmetic records. The independently reconstructed sender uses the first occurrence of each requested character on the specified line. The important human-solve-path feature is not merely that numbers occur: the source names the book and types the coordinates.

That historical control does not define an internal LP1/LP2 address convention. No original LP2 passage names **Intus** or another LP1 heading as a carrier and pairs it with a line/word/character ordinal, nor does it print the equivalent of the 2012 line:character record syntax. The other known Cicada book-code examples are likewise carrier-specific; they do not establish a universal internal-reference law.

## Closest candidates and why they do not pass

| Candidate | Source-fixed observation | Missing field |
|---|---|---|
| LP1 **Chapter 1 / Intus** | One genuine named, numbered chapter heading on original scan 02 | No contents list or second chapter address; no LP2 mark names Intus or supplies an ordinal into it |
| LP2 nine visual groups | Nine reproducible visual boundaries and fixed physical order | No printed chapter numbers or plaintext heading names; file order is not an internal index |
| p36–p38 numbered 1–5 packet | Visible ordinals and red ten-dot brackets | Existing readout addresses the later 2016 signed message, not LP1; no LP1 target heading is selected |
| 2012 line:character book code | Named external Mabinogion carrier and explicit coordinate grammar | No LP2-selected internal carrier or coordinate fields |

The previous bounded work on sliding-window copy records (#3030), relative cursor references (#3035), and static positional dictionary addresses (#3054) does not supply the missing internal reference fields. Those were distinct receiver/serialization tests and are not being reopened.

## Decision

**Close #3062 under its “no source-defined fields” branch.** The strongest source-supported interpretation is that LP1's headings and LP2's visual sections provide navigation and thematic structure, but the surviving original material does not specify a literal internal table-of-contents or chapter-reference grammar that can yield a key-bearing LP1 address. The p36–p38 packet remains a separate, retrospective 2016 word-index readout.

No numerical address sweep, title permutation, arbitrary chapter-number assignment, LP1 target scan, or ciphertext fit was performed. Reopen this route only if a new original LP2 mark or first-party instruction supplies a named internal target and a typed ordinal/address convention before the target is inspected.

## Reproduction and source locations

- Original LP1 scans: `resources/liber-primus/00.jpg`–`16.jpg`; especially `02.jpg` (**Chapter 1 / Intus**).
- LP1 source/decoded-text distinction: `resources/transcriptions/README.md` and `resources/liber-primus/lp1-plaintext-reference.txt`.
- LP2 visual section boundaries and ambiguity: `im-results/lp2-global-original-visual-section-map.md`.
- Existing p36–p38 readout and its boundary: `im-results/lp2-numbered-sections-primus-words-readout.md`.
- First-party 2012 coordinate payload: `im-results/2012-845145127/162667212858-image-payload.asc`; historical source reconstruction: `im-results/cicada-organizer-bookcode-consumption-convention-gate.md`.
- Bounded direct 2012 table transfer: `im-results/lp2-2012-bookcode-grid-linechar-gate.md`.
