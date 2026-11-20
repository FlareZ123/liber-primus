# Liber AL III:47 × LP2 p49 10×8 receiver gate

**Status: negative source gate; retain the structural correspondence only. No LP2 plaintext, authentic key, or cipher inverse recovered.**

## Hypothesis and original inputs

The OTO holograph scan for Liber AL page 60 / Chapter III:47 shows an 8-column, 10-row grid, a diagonal stroke, and a circled-cross near d7. The verse says that the drawn line and the circle-squared are keys. LP2's three-page numerical table is a 32×8 sequence of 256 tokens, split across physical pages 49–51:

| LP2 page | Archive image | Shape | Cells |
|---|---|---:|---:|
| 49 | 66.jpg | 10×8 | 80 |
| 50 | 67.jpg | 13×8 | 104 |
| 51 | 68.jpg | 9×8 | 72 |

Thus p49 is an exact page-level 10×8 shape match to the Liber AL grid. This is a real, source-visible correspondence and a plausible human-solver lead. It does not by itself establish a cipher operation.

Primary image: [OTO holograph scan, page 60 / III:47](https://lib.oto-usa.org/libri/images/liber0031/60.jpg). The LP2 dimensions are reproducible from resources/liber-primus/lp2-grid-256.json and the original page images.

## Candidate mapping retained for audit, not source-fixed

The prior SFT froze one candidate discretization:

- Four candidate line cells: a1, b3, c5, d7, zero-based indices [0, 17, 34, 51].
- Circled-cross: d7, index 51, used as a readout anchor.
- Candidate shear: r' = (r - 2c) mod 10; the inverse was tested as the direction control.
- Removing the four candidate cells leaves 76 values.

The original scan establishes a continuous diagonal stroke and a separate circled-cross. It does not uniquely specify that exact four-cell rasterization, that d7 is the line endpoint, or the zero-phase shear. The current mask and phase are therefore a candidate interpretation, not a source-fixed instruction. A pre-2014 interpretation reproduced in George Mortimer's edition of Gerald Suster's work instead describes the line as running from C to 7 and assigns c=7; this is evidence of historical interpretive plurality, not an alternative LP2 operation.

Under the candidate mask, the selected tokens are 3N, 3M, 3H, 0x. Their values are [203, 202, 197, 59] under the provisional base60 alphabet and [200, 199, 194, 58] under the provisional f-omitting base59 alphabet. The source geometry does not decide between those radix interpretations.

## Placement, orientation, shear, and length charge

The 32×8 table admits 23 contiguous row-aligned 10×8 windows. Of these, one is the complete page-boundary block p49, four lie wholly within p50, and eighteen cross page boundaries. p51 is only nine rows high, so it contains no complete 10×8 window.

The source labels a–h and 1–10 support the natural orientation, but a conservative charge over the four shape-preserving orientations (identity, horizontal reflection, vertical reflection, 180°) and two shear directions gives 23 × 4 × 2 = 184 candidate placements. A 90° rotation would require ten columns and cannot fit the eight-column LP2 table.

Every 10×8 placement leaves 76 cells after the same four-cell removal. The 76 therefore cannot select p49, a row offset, an orientation, or a shear direction. It matches p55's 76 runes and the 76-cell perimeter of the full 32×8 table, but these are equal lengths, not an identified mapping of cells. If the printed page boundary is imposed as an additional rule, p49 is the only page-level 10×8 block; no Cicada instruction currently specifies that boundary rule.

The p49 page-level shape match remains the strongest part of the hypothesis. The broader placement family shows why the 76-count correspondence alone is not a discriminating key test.

## Cicada-era source selection and the p23 route

The PGP-signed 2013 OutGuess book-code message gives the riddle “A book whose study is forbidden / Once dictated to a beast” and chapter:verse:character coordinates. The archived solve identifies Liber AL vel Legis / The Book of the Law. This is genuine Cicada-era evidence that Liber AL itself was a player-visible source. It does not name the New Comment, the III:47 grid, page 16, or an LP2 traversal. [2013 signed book-code archive](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/001-232.jpg/README.md).

The shortest p23-to-AL proposal is conditional:

1. The p23 five-dot packet yields the local candidate THE ORIGIN.
2. The p23/p56 half-turn pair gives physical page rise 56−23=33; p33's separately recovered THEIR RISE supplies a referent for 33.
3. Applying the solved-p56 T serializer to physical page labels 23 and 33 as positive cardinal inputs yields A and L, appending AL.
4. Crowley's New Comment to III:47 glosses “all” as AL 31 the Key.

Step 3 is a post-discovery page-label interpretation, not an explicit Cicada instruction. The 2013 book code selects Liber AL text, not this page-label operation or a commentary edition. The New Comment's AL=31 gloss is pre-2014 historical context, not a Cicada-authenticated key. The independent DH B→p50→base60→33 route is also conditional and is not needed to obtain the p23/p56 page rise; it does not authenticate the T(page-label) operation. See the qualified [p23 AL=31 provenance report](lp2-p23-origin-al31-readout-key.md) and the Critic's [p23 page-rise correction](../communications/broadcast/20261119T231411Z_critic_p23-page-rise-correction.md).

The grid's historical status also matters. The 2006 Red Flame source critique reports that the grid is absent from the 1912 Equinox I:7 facsimile, first appears in the limited 1925 Tunis edition, and is visible in the 1936 Equinox of the Gods. The line and circle are discussed as manuscript features, but the 10×8 grid is a later addition, not an authenticated 1904 instruction. This does not make the grid unavailable by 2014; it does mean the 2013 book-code clue cannot itself be treated as a selector for the later grid. [2006 source-history discussion](https://www.corneliuspublications.com/an-open-epistle-on-the-grid-from-liber-al-vel-legis/).

## Existing direct-consumer results (preserved)

The reproducible SFT sims/lp2_liber_al_iii47_p49_grid_overlap_sft.cjs tested only the frozen candidate mapping:

- The 76-cell complement as a GP29 additive/subtractive pad for p55.
- The circled-cross as XOR, under modulo-29 XOR and raw byte XOR.
- The 76 numeric values as a stable rank-transposition key, in both directions.
- p55 placed in the 10×8 grid with the four candidate mask cells empty, then read under the candidate shear and its inverse.
- A synthetic positive control for the additive-pad implementation.

Neither radix nor shear direction yields coherent plaintext under these direct consumers. Raw byte XOR produces no coherent ASCII text. The rank permutations and p55 grid-shear readouts are nonlinguistic. The additive inverse implementation passes its synthetic positive control. These are bounded negative results for the tested direct consumers, not a proof against every conceivable use of the source page.

Do not repeat these tests or add arbitrary pads, permutations, phases, radix variants, or cipher consumers.

## Decision

**Negative under the issue's completion criteria.** The 2013 clue independently selects Liber AL as a text, but not III:47 page 16's later grid or a reversible LP2 operation. The p23 AL suffix depends on an unselected page-label T-cardinal step. The p49 10×8 page-level match is real and worth retaining, but the four-cell mask/shear is not uniquely source-fixed, and the 76 count is invariant across 23 placements. No independent Cicada-era clue selects the same grid traversal or a reversible operation on original LP2 material.

Retain only the 10×8 / 76 structural correspondence as an intermediate observation. Retire this as a key/decryption route unless a new first-party source fixes the exact cell mask, orientation, shear, and receiver before output inspection. No new receiver test is justified.

## Reproduction and references

- Canonical 256-token table: resources/liber-primus/lp2-grid-256.json.
- Original LP2 page images: resources/liber-primus/66.jpg–68.jpg (physical pp49–51).
- Candidate p49 receiver SFT: sims/lp2_liber_al_iii47_p49_grid_overlap_sft.cjs.
- Candidate p32/cuneiform shear SFT: sims/liber_al_iii47_10x8_shear_sft.cjs.
- Historical line interpretation: [The Key of It All, reproducing Gerald Suster's C=7 method](https://media-underground.net/ebooks/The_Key_Of_It_All.pdf).
- New Comment source: [Liber AL III:47 commentary](https://hermetic.com/legis/new-comment/chapter-iii).
