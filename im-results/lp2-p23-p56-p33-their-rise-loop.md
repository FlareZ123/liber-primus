# P23 / p56 five-dot half-turn: familywise page-rise audit

**Agent5, 20 November 2026. Classification: negative as an operational page selector; exact artwork geometry retained as a retrospective cross-check. No LP2 plaintext, key, or reversible cipher receiver recovered.**

## Frozen source data

The original LP2 image census uses the same fixed registration and component gate as sims/black_dot_reflection.py: native 2400×3600 JPEGs 17.jpg–74.jpg, grayscale below 70, connected components 60–80 px in both dimensions, 2,900–3,800 dark pixels, and occupied fraction at least 0.55.

Exactly three LP2 pages contain the eligible five-dot stencil: physical p7 (image24), p23 (image40), and solved p56 (image73). Image50 / p33 has three collinear horizontal dots, a different motif; no other LP2 page has an eligible five-dot component set under this fixed gate.

## Complete pairwise orientation census

All three unordered pairs were tested directly, searching all four axis-sign orientations and all 5! point correspondences, then checking the registered 89×89 thresholded dot masks:

| Source → target | Physical pages | Best orientation | RMS center error | Next-best orientation RMS | Page difference |
|---|---|---|---:|---:|---:|
| image24 → image40 | p7 → p23 | vertical reflection (+1,−1) | 0.036832 px | 150.436 px | 23−7 = 16 |
| image24 → image73 | p7 → p56 | horizontal reflection (−1,+1) | 0.246264 px | 150.361 px | 56−7 = 49 |
| image40 → image73 | p23 → p56 | 180° half-turn (−1,−1) | 0.263633 px | 150.382 px | 56−23 = 33 |

For the direct p23→p56 fit, maximum center error is 0.346301 px and the five matched-dot mask IoUs are 0.969376, 0.956259, 0.977965, 0.961216, 0.980238. The half-turn is therefore directly measured, not merely inferred by composing the two p7 reflections. It is the only half-turn pair among the three eligible pages; p7→p23 and p7→p56 are single-axis reflections.

The reverse directed differences are −16, −33, and −49. They are all outside the nonnegative 2016 word-register index range.

## Charge against the authenticated 2016 word register

Use the existing 43-word core register and its established zero-based indexing from im-results/lp2-signed2016-word-position-dh.md and sims/lp2_signed2016_word_position_dh_sft.cjs. The parser keeps the initial Hello and the final alphabetic Verify/OpenPGP words, while excluding the numeric 3301 and hexadecimal fingerprint.

The three forward pair differences give:

| Pair | Difference / zero-based word index | Word | Three-word window |
|---|---:|---|---|
| p7 → p23 | 16 | ARE | ARE THE MAP |
| p23 → p56 | 33 | WILL | WILL BE FOUND |
| p7 → p56 | 49 | out of range | — |

The two in-range windows are both exact phrases in the authenticated message: “Its words are the map” and “Seek and you will be found.” Thus the word-register test does not uniquely select the p23/p56 pair: the p7/p23 reflection supplies a competing exact window. The p23/p56 half-turn is unique as a geometric orientation, but the 2016 register alone does not make its page difference a unique word hit.

The p23/p56 window at index33 is a previously unselected cross-register check: WILL BE FOUND occupies word positions 33–35, and the existing p33 continuation work independently has p34 BE and p35 FOUND handoffs. This is consistent with the route, but those p34/p35 results were already known; it is not a blind holdout or a new unknown-page decryption.

## Original LP2 page-heading check

The three difference targets are physical p16, p33, and p49:

- p16 / image33 has no red title heading.
- p33 / image50 has the already-known red title decoded by the solved-p56 serializer as THEIR RISE.
- p49 / image66 has a red 13-dot marker but no red title heading.

P33 is the only target with a red heading, but THEIR RISE is the phrase that originally motivated this closure. It cannot be counted again as the independent consequence required to promote the page-rise route. The additional WILL BE FOUND register window is a cross-check, not a unique new LP2 heading or receiver; the competing ARE THE MAP window remains in the charged family.

## Combined five-dot / Liber AL page16 / LP2 p49 map gate (#1960, 20 November 2026)

The three page differences do select a consistent **LP2-only** set under the canonical zero-based physical-page convention:

`p7/p23/p56 → differences 16, 33, 49 → LP2 p16/p33/p49`.

The original page map is explicit in `resources/liber-primus/README.md`: LP2 physical p16/p33/p49 are archive images 33/50/66. P16 is a 267-rune text page; p33 has the already-known red THEIR RISE heading; p49 is the first **10×8** segment of the 32×8 numerical table, followed by p50 (13×8) and p51 (9×8). The external Liber AL holograph's page16 / III:47 grid (OTO scan image60) is a separate object. Its 8×10 shape matches the p49 10×8 segment exactly, but this is a cross-document shape correspondence, not evidence that LP2 p16 is that grid.

The PGP-signed 2013 book-code makes Liber AL a player-visible source; the book's III:47 contains the line/circle passage, but the code does not select the later grid, its edition, or an LP2 traversal. It does not name the holograph page16, select a particular edition carrying the later grid, or instruct the solver to map only the first difference to Liber AL while the other two remain LP2 page addresses. Thus:

- **Uniform LP2 grammar:** all three differences select LP2 p16, p33 and p49, but p16 is ordinary text and the result is only a set of page references.
- **Mixed-domain reading:** difference16 selects external Liber AL page16 while differences33/49 select LP2 p33/p49. This makes the grid/p49 shape match salient, but the domain switch is not specified by the 2013 or 2016 source.
- **Uniform Liber AL grammar:** would send all three differences to Liber AL pages16/33/49, not to LP2 p33/p49 and their known page features.

The 2016 signed message provides two competing in-range word windows: zero-based index16 begins ARE THE MAP, and index33 begins WILL BE FOUND; index49 is outside its 43-word register. The two hits correspond to different stencil pairs (p7→p23 and p23→p56), so the register does not uniquely select the p23/p56 half-turn or the three-page destination set. The p33 heading is already known, not a blind prediction. The p49 grid-shape match is genuine but is not a new receiver: the corrected Liber AL III:47/p49 report already charges the line/circle geometry and its tested p55 consumers, which recover no plaintext.

## Decision

The original artwork establishes three eligible five-dot pages and a unique p23/p56 half-turn, with pairwise differences 16, 33 and 49. Under the repository's canonical zero-based LP2 page convention these point to p16, p33 and p49; under a one-based interpretation they point instead to p15, p32 and p48. The positive direction is chosen by ascending page labels; the reverse differences are negative and outside the nonnegative 2016 register.

The zero-based LP2 targets are real but heterogeneous: p16 is a text page, p33 has the already-known THEIR RISE heading, and p49 is the first 10×8 segment of the 32×8 numerical table. The p49 segment's 10×8 shape matches the separate Liber AL holograph page16 / III:47 grid. The 2013 signed book-code makes Liber AL a player-visible source, but it does not select that holograph page/edition or instruct a domain switch. Treating difference16 as Liber AL page16 while 33/49 remain LP2 pages is therefore a mixed-domain hypothesis; treating all three as LP2 pages is consistent but yields only page references.

The 2016 register has two competing zero-based windows: index16 begins ARE THE MAP and index33 begins WILL BE FOUND; index49 is out of range. With one-based word indexing, the corresponding windows are WORDS ARE THE and YOU WILL BE, not the same phrases. The two zero-based hits belong to different stencil pairs, so the register does not uniquely select the p23/p56 half-turn or the three-page set. “RISE” on p33 is a retrospective referent, not an independent selector.

The p49/Liber AL shape correspondence is genuine, but the corrected III:47/p49 report already tests the source-geometry line/circle receivers on original p55 without recovering plaintext. The triangle adds no new reversible operation, key, or unknown-page receiver. **Close #1960 as a bounded negative**: retain the stencil, page references, word-window correspondences and 10×8 shape match as structural/navigation clues; do not continue page-rise arithmetic or reopen the p49 direct-consumer families without a new first-party instruction. The p33 +2→p35 FOUND route and p33 body-count→p34 BE route remain local navigation results, not validation of this page selector.

## Separate p39 false branch (unchanged)

The signed-source word THEIR occurs at zero-based positions 19 and 25; their difference is 6. The separate local reading p33 + 6 = p39 lands on signed word39 FALSE, and original p39 carries a giant red X. The optional p50[19] = 0X → base60 33 cross-check is conditional on the p50 register and is not required for this false-branch observation. Preserve this as a separate false-path interpretation; it does not authenticate the p23/p56 page-rise operation.

## Reproduction

- Complete original-image pairwise fit: sims/black_dot_reflection.py.
- Authenticated 2016 word positions: sims/lp2_signed2016_word_position_dh_sft.cjs and im-results/lp2-signed2016-word-position-dh.md.
- Original images: resources/liber-primus/24.jpg, 33.jpg, 40.jpg, 50.jpg, 66.jpg, 73.jpg.
- Existing p33 title and local continuation: im-results/lp2-p33-layout-family-their-rise.md and im-results/lp2-p33-p35-found-road-map.md.
