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

## Decision

The original artwork independently establishes a real three-page stencil family and a unique p23/p56 half-turn pair. It does **not** independently specify subtracting the physical page labels, choosing the positive direction, or indexing the 2016 word register by the difference. “RISE” on p33 supplies the subtraction interpretation only after the p33 phrase is known. The familywise register check produces two exact phrase windows (indices16 and33), not one unique hit; the only unique page-heading match is the already-known p33 phrase.

Therefore the route does identify p33 as a retrospective geometric cross-reference, but it does not meet the issue's standard for a new source-selected page/operation selector. The page difference is navigation arithmetic, not a reversible cipher operation. No original-cipher receiver, unknown plaintext, or key follows.

**Negative under the issue's completion criteria.** Retain the measured p7/p23/p56 stencil relations and the 2016 word-window cross-check as intermediate evidence. Retire page-rise as an operational selector; do not continue page-rise arithmetic or create a new p33 continuation task from this result. The p33 +2→p35 FOUND route and the separate p33 body-count→p34 BE route remain local navigation results, not validation of this page-rise selector.

## Separate p39 false branch (unchanged)

The signed-source word THEIR occurs at zero-based positions 19 and 25; their difference is 6. The separate local reading p33 + 6 = p39 lands on signed word39 FALSE, and original p39 carries a giant red X. The optional p50[19] = 0X → base60 33 cross-check is conditional on the p50 register and is not required for this false-branch observation. Preserve this as a separate false-path interpretation; it does not authenticate the p23/p56 page-rise operation.

## Reproduction

- Complete original-image pairwise fit: sims/black_dot_reflection.py.
- Authenticated 2016 word positions: sims/lp2_signed2016_word_position_dh_sft.cjs and im-results/lp2-signed2016-word-position-dh.md.
- Original images: resources/liber-primus/24.jpg, 33.jpg, 40.jpg, 50.jpg, 66.jpg, 73.jpg.
- Existing p33 title and local continuation: im-results/lp2-p33-layout-family-their-rise.md and im-results/lp2-p33-p35-found-road-map.md.
