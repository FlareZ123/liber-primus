# Cicada article → 221-index → p50 table → 2016 word map: candidate navigation route

**Agent16, 20 November 2026. Intermediate finding only: a source-constrained word-map/navigation hypothesis, not a recovered cipher or complete plaintext.**

## Human-visible clue path

LP2 p27 (original image 44) carries a wing-like insect motif; LP2 p55 (image 72) depicts a cicada on a tree. A plausible contemporary external reference is Susan Milius's *Science News* feature “Mystery in Synchrony: Cicadas' odd life cycle poses evolutionary conundrums” (13 July 2013; [original issue PDF](https://www.sciencenews.org/wp-content/uploads/sites/2/2024/02/sciencenews20130713-dl.pdf)). The article discusses 13- and 17-year broods, three evolutionary lineages, and their 221-year coincidence. Its printed page 27 contains a lineage-tree and brood-distribution figure. The motif association is plausible, but no exact copying or visual identity has been established.

The article provides two unusually specific numerical inputs:

- the 13- and 17-year cycles coincide every **221 years**;
- the article tracks broods across **2013, 2014 and 2015**, giving a natural three-year sequence.

LP2's 256-entry table is preserved as a 32×8 row-major transcription across pages 49–51. Treating 221 as the first zero-based table address and the three brood years as three successive cells selects indices **221, 222, 223**. These are row 27, columns 5–7 (zero-based). This address rule is an inference, not an explicit Cicada instruction; the article's page-27 figure and LP2 p27 image provide a possible row-27 cross-reference.

## Original table cells and BASE29 readout

The three cells are present in original LP2 p51 image 68 at local row 4, columns 5–7. The printed tokens are **0q, 0p, 2V**. Under the preserved table's base-60 token rule they decode to:

| Global index | Table coordinate | Original token | Decimal value |
|---:|---|---|---:|
| 221 | row 27, col 5 | 0q | 52 |
| 222 | row 27, col 6 | 0p | 51 |
| 223 | row 27, col 7 | 2V | 151 |

The tokens were checked against the original p51 JPEG crop, not just copied from the derived JSON.

The signed 2013 TCP source authenticates BASE29 integer conversion (its positive control is 3301 → 3QO). Converting these three table values gives:

| Value | BASE29 digits |
|---:|---|
| 52 | [1,23] |
| 51 | [1,22] |
| 151 | [5,6] |

In the 2013 signed command alphabet 0123456789ABCDEFGHIJKLMNOPQRS, these numerals are 1N, 1M and 56 respectively. The numeric digits [1,23], [1,22], [5,6] are then used as word positions in the 2016 register. This does not assert a GP29-rune mapping; the proposed receiver is the 2016 word map.

The signed 2016 message supplies a 43-word alphabetic register and says that words are the map and numbers the direction. Under zero-based word indexing, the pairs are:

- [1,23] → **THE ROAD**
- [1,22] → **THE THE**
- [5,6] → **EPIPHANY SEEKS**

Under one-based word indexing they are **HELLO THE / HELLO IS / EMPTY EPIPHANY**, which is substantially less coherent. The exact zero-based output is three pairs; a possible grammatical assembly is “THE ROAD THE EPIPHANY SEEKS” if the repeated THE is treated as a shared node. That merge is interpretive, not a source-prescribed operation.

A one-based table-ordinal alternative (ordinals 221–223 correspond to zero-based cells 220–222) instead gives values **58, 52, 51**, and does not reproduce the same pair set. The zero-based table and word origins are therefore favored by the combined output, but neither is explicitly numbered in a surviving instruction.

## Cross-links and limits

- The value **151** also occurs at two opposite corners of the 5×5/1033 Stage10 square. This links the cicada/table route to the separate Stage10 square-cell observation.
- The pairs **THE ROAD** and **EPIPHANY SEEKS** match the p0 candidate fragments already present in the research synthesis. This invocation had already seen those candidates, so this is **not a blind confirmation**. The row27 mapping itself was derived from the article, table and signed 2016 register, not from p0 ciphertext.
- The table values modulo 29 give the tempting three-symbol key [23,22,6]; the full BASE29 digit stream is [1,23,1,22,5,6]. Both natural direct additive GP29/Vigenère interpretations were tested with both signs on p55's 43 strict interiors and all 76 p55 runes. They are nonlinguistic. The output should therefore be treated as a word-map pointer, not a direct additive key.
- The fixed 13/17/221 periodic-substitution family remains rejected by the separate all-key gate. This hypothesis uses 221 as a table address, not as a repeating period.

## Weakest assumptions and next decision

The strongest evidence is the exact, source-visible numerical chain: 221 → original table tokens 0q/0p/2V → 52/51/151 → BASE29 pairs in the signed 2016 register. The weakest assumptions are:

1. the p27/p55 insect imagery intentionally points to this particular 2013 Science News article;
2. 221 is a zero-based address in the 256-cell table, with 2013–2015 selecting the next two cells;
3. the table is read in zero-based row-major order;
4. the 2016 word register inherits zero-based indexing;
5. the three pairs should be assembled as a phrase or as a navigation instruction.

This is worth independent source-first evaluation because it may supply a zero-based word-origin selector missing from the square-only Stage10 analysis. It does **not** yet provide a reversible operation on unknown LP2 ciphertext, a p55 key, or a complete plaintext. The decisive next step is a blind reproduction of the article→221→table→BASE29→word-map chain, followed by one locked test of whether its output predicts a previously withheld LP2 plaintext feature. Do not expand into generic 13/17-period searches or arbitrary Vigenère keys.

## Reproduction

Run node sims/lp2_cicada_article_row27_wordmap_sft.cjs. The script prints both table-index origins, both word-index origins, original token checks, the 151 square cross-link, and the two natural direct-additive key tests.
