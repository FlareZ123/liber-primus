# Liber AL III:47 × LP2 p49 10×8 geometry and receiver gate

**Status: corrected source geometry; structural correspondence strengthened; direct receivers negative. No LP2 plaintext, authentic key, or cipher inverse recovered.**

## Hypothesis and original inputs

The OTO scan of Liber AL page 60 / Chapter III:47 shows an 8-column, 10-row grid labelled a–h and 1–10, a diagonal line, and a circled plus/cross near d7. The verse explicitly calls the drawn line and the circle-squared keys. LP2's numerical table is a 32×8 sequence of 256 two-character tokens, split across physical pages 49–51:

| LP2 page | Archive image | Shape | Cells |
|---|---|---:|---:|
| 49 | 66.jpg | 10×8 | 80 |
| 50 | 67.jpg | 13×8 | 104 |
| 51 | 68.jpg | 9×8 | 72 |

Thus p49 is an exact page-level 10×8 shape match to the Liber AL grid. This is a genuine, source-visible correspondence and a plausible human-solver lead. It does not by itself establish a cipher operation.

Primary image: [OTO holograph scan, page 60 / III:47](https://lib.oto-usa.org/libri/images/liber0031/60.jpg). LP2 dimensions and tokens are reproducible from `resources/liber-primus/lp2-grid-256.json` and the original page images.

## Corrected source geometry

The scan's labelled diagonal runs approximately from **b1 to e7**. On the natural 10×8 coordinate reading, its four column-aligned grid points are:

- **b1, c3, d5, e7** — zero-based row-major indices **[1, 18, 35, 52]**.
- The circled plus/cross is separately at **d7**, index **51**. It is not the line endpoint.

The earlier SFT's mask **a1, b3, c5, d7** (indices [0, 17, 34, 51]) was shifted one column left and incorrectly treated the circled d7 as the line endpoint. It is not the source geometry.

The line has slope two rows per column. Anchoring the shear at its first point b1 gives the unique simple straightening transform

`r' = (r - 2(c - 1)) \bmod 10`.

This maps b1, c3, d5, e7 to the top row at columns b–e; the separate circled d7 maps to row 3, column d (zero-based row 2, column 3). This corrects the prior phase-zero shear `r'=(r-2c) mod 10`.

Under the natural interpretation that the four labelled line points are the four marked cells, removing them leaves **76** p49 table values, matching the 76 runes on p55. The circle supplies a separate readout anchor. This is materially stronger than an arbitrary four-cell mask: the line selects the four coordinates and the circle selects the anchor. The remaining receiver choices—using the p49 page block, deleting the four points, reading row-major after the circle, and treating the 76 values as a key—are still interpretations rather than explicit Cicada instructions.

The corrected p49 tokens at the four line points are **3p, 0F, 0d, 1Q**; the circle token is **0x**. Under the provisional standard base60 alphabet the line values are [231, 15, 39, 86] and the circle value is 59. Under the provisional f-omitting base59 alphabet they are [227, 15, 39, 85] and the circle value is 58. The source does not select between these radix interpretations.

## Placement and historical source selection

The 32×8 table contains 23 contiguous row-aligned 10×8 windows: one is the page-boundary block p49, four lie wholly within p50, and eighteen cross page boundaries. p51 is only nine rows high. The four shape-preserving orientations and two shear directions therefore create a broad alternative family if the printed p49 page boundary and labelled source orientation are not imposed. The line geometry now selects the four coordinate points and the anchored shear within the p49 interpretation; it does not, by itself, authenticate the cross-document choice of p49 as the receiver.

The PGP-signed 2013 OutGuess book-code message identifies Liber AL vel Legis / The Book of the Law through its book riddle and chapter:verse:character coordinates. This is genuine Cicada-era evidence that Liber AL was a player-visible source. It does **not** name the New Comment, the later III:47 grid, page 16, or an LP2 traversal. [2013 signed book-code archive](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/001-232.jpg/README.md).

The archived 2013 OS also provides a source-motivated prime/totient receiver to test. Its `prime_echo` script prints 464 primes; the OS message says “The key is all around you”; the signed 2013 TCP clue supplies `BASE29`; and the 2014 “Some Wisdom” material identifies Euler's totient. The corrected p49 complement bytes all fall in 1–255 (base60 range 4–255; base59 range 4–251), so they can be read as 1-based prime ordinals. This motivates the direct key `K_i = φ(p_{b_i}) mod 29 = (p_{b_i}-1) mod 29`, where `b_i` is the corrected p49 byte and `p_n` is the nth prime from the OS sequence. The corrected SFT tests this exact operation under both token radices and both additive signs; neither yields recognizable p55 plaintext. The OS message is archival rather than a signed instruction, so this is a plausible human route, not an authenticated cipher specification.

The p23-to-AL proposal remains conditional: p23's red packet supplies a local THE ORIGIN candidate; the p23/p56 half-turn pair gives a 33-page rise to p33 THEIR RISE; applying the solved-p56 T serializer to physical page labels 23 and 33 as positive cardinals yields A and L; and Crowley's New Comment glosses AL=31 as a key. The T(page-label) step is post-discovery and not Cicada-authenticated. The 2013 book code selects Liber AL text, not that page-label operation or a commentary edition. See the qualified [p23 AL=31 report](lp2-p23-origin-al31-readout-key.md) and the Critic's [page-rise correction](../communications/broadcast/20261119T231411Z_critic_p23-page-rise-correction.md).

The grid's historical status matters. The 2006 Red Flame source critique reports that the grid is absent from the 1912 Equinox I:7 facsimile, first appears in the limited 1925 Tunis edition, and is visible in the 1936 Equinox of the Gods. This does not make the grid unavailable to a 2014 solver, but it means the 2013 book-code clue cannot itself be treated as a selector for that later grid. [2006 source-history discussion](https://www.corneliuspublications.com/an-open-epistle-on-the-grid-from-liber-al-vel-legis/).

## Corrected receiver test

The corrected SFT is `sims/lp2_liber_al_iii47_p49_source_geometry_sft.cjs`. It uses the source-coordinate mask [1,18,35,52], the separate d7 anchor, and the b1-anchored shear. It tests the 76-cell complement read after the transformed circle against the original 76-rune p55:

- Base60 and base59 decoding of the p49 tokens.
- GP29 additive and subtractive pads.
- Modulo-29 XOR and raw byte XOR.
- Stable rank transposition in both directions.
- Five-symbol line/circle key from b1,c3,d5,e7 plus d7: repeating GP29 additive/subtractive and stable 5-column transposition under line→circle, circle→line and reversed-line orderings.
- 76-cell clockwise outward spiral from the transformed circle d7, initially moving toward the straightened line and skipping its four cells; use the spiral values as a GP29 additive/subtractive pad.
- The same circle-centred spiral as a route transposition: place p55 row-major in the original 76-cell complement, apply the b1-anchored shear, then read the spiral; test the inverse permutation as well.
- 1-based prime-index/totient pad: treat each corrected p49 byte as a prime ordinal and apply `φ(p_n)=p_n−1 mod29`, motivated by the 2013 OS prime echo, the signed BASE29 clue, and the 2014 totient material.
- p55 placed into the 10×8 grid with the four source-coordinate cells empty, then sheared and read from the circle anchor.
- A synthetic positive control for the additive-pad inverse.

Neither radix yields recognizable plaintext under these direct consumers, including the prime-index/totient pad the corrected five-symbol line/circle key consumers, the circle-centred spiral readout, and its forward/inverse route transpositions. The raw XOR outputs are not coherent ASCII; rank permutations and the p55 grid-shear readouts are nonlinguistic. The synthetic additive-pad control passes. These are bounded negative results for the tested receivers, not a proof against every possible use of the line and circle.

The previous `sims/lp2_liber_al_iii47_p49_grid_overlap_sft.cjs` is retained as historical work, but its a1/b3/c5/d7 mask and phase-zero shear are superseded. Do not cite its receiver outputs as tests of the corrected geometry.

## Decision

**Retain the corrected 10×8 / 76 structural correspondence and line/circle geometry; do not promote it to a decryption.** The source scan supports b1/c3/d5/e7 and the separate d7 circle. The resulting 76-cell candidate key has been tested with the simplest direct receivers and does not recover p55 plaintext. The 2013 clue authenticates Liber AL as a source, not the edition, page pairing, or receiver. No LP2 plaintext or authentic key has been recovered.

Do not repeat the corrected additive/XOR/rank/shear consumers or reopen broad placement searches. Reopen this branch only if an independent Cicada-era clue specifies a different reversible receiver or a testable consequence beyond the already failed direct consumers.

## Reproduction and references

- Canonical 256-token table: `resources/liber-primus/lp2-grid-256.json`.
- Original LP2 page images: `resources/liber-primus/66.jpg`–`68.jpg` (physical pp49–51).
- Corrected source-geometry SFT: `sims/lp2_liber_al_iii47_p49_source_geometry_sft.cjs`.
- Superseded candidate-mask SFT: `sims/lp2_liber_al_iii47_p49_grid_overlap_sft.cjs`.
- Historical C=7 interpretation: [The Key of It All, reproducing Gerald Suster's method](https://media-underground.net/ebooks/The_Key_Of_It_All.pdf).
- New Comment source: [Liber AL III:47 commentary](https://hermetic.com/legis/new-comment/chapter-iii).
