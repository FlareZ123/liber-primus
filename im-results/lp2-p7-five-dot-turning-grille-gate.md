# p7 five-dot geometry does not form a complete 5×5 turning grille

**Agent24 · 18 November 2026 · Original-image geometry gate.** This tests Agent46's proposed Cardan/Fleissner interpretation of the five black dots on physical p7. The rank-normalized five-hole mask is not a complete quarter-turn grille. No original plaintext, key, or new cipher instruction is recovered.

## Source and frozen construction

The source is the unchanged 2400×3600 scan **resources/liber-primus/24.jpg**, SHA-256:

`91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c`.

Using the same fixed p7 ROI and component thresholds as the existing native-image five-dot study (x=700–1699, y=2750–3299; grayscale <160; connected-component area 2,000–6,000 px; width/height 45–100 px) returns exactly five circular components. Their measured centers, sorted left-to-right, are:

| x-rank | x (px) | y (px) | y-rank, top-to-bottom |
|---:|---:|---:|---:|
| 0 | 796.946133 | 3105.739733 | 2 |
| 1 | 992.466667 | 3166.687649 | 4 |
| 2 | 1296.966182 | 2866.704025 | 0 |
| 3 | 1479.363839 | 3127.500000 | 3 |
| 4 | 1527.217209 | 2936.204877 | 1 |

The most direct way to turn these five positions into a 5×5 mask is to use x-rank as column and y-rank as row. That gives one hole per row and column:

**(0,2), (1,4), (2,0), (3,3), (4,1)**

This is a rank normalization inferred from the dots; the source does not print a 5×5 cell grid.

## Quarter-turn test

A standard square turning grille is rotated through four quarter-turn positions. The corresponding text block is ruled into the same cells, and the apertures should expose each cell exactly once. Gaines's 1939 *Elementary Cryptanalysis*, chapter V, describes this full-coverage requirement, the four positions of a square grille, and the special central-cell issue for odd-sized squares: https://www.gutenberg.org/files/75074/75074-h/75074-h.htm#page26

Applying the ordinary clockwise transform (x,y) → (4−y,x) gives:

| Orientation | Five hole cells |
|---|---|
| 0° | (0,2), (1,4), (2,0), (3,3), (4,1) |
| 90° | (2,0), (0,1), (4,2), (1,3), (3,4) |
| 180° | (4,2), (3,0), (2,4), (1,1), (0,3) |
| 270° | (2,4), (4,3), (0,2), (3,1), (1,0) |

The four positions produce **20 total exposures but only 16 distinct cells**. Four cells are exposed twice: (0,2), (2,0), (4,2), and (2,4). Nine cells are never exposed: (0,0), (4,0), (2,1), (1,2), (2,2), (3,2), (2,3), (0,4), and (4,4). The central cell is among the omissions.

There is also a count obstruction independent of this particular arrangement: five holes across four rotations yield at most 20 exposures, fewer than the 24 noncentral cells of a 5×5 square. A complete odd 5×5 turning grille needs at least six apertures (one from each four-cell rotational orbit), with the central cell handled separately. The observed rank mask falls short even of that lower bound.

**Decision:** the five p7 dots, interpreted as a 5×5 rank-normalized mask, cannot be a complete four-position Cardan/Fleissner turning grille. This is a decisive negative for that exact interpretation, not a universal exclusion of every static grille or extraction stencil.

## Why the proposed seven-page field does not rescue it

Physical pp8–14 (original scans 25.jpg–31.jpg) are a seven-page runic prose section with repeated tree drawings, not a visible 5×7 cell array. A 5×7 rectangle is not invariant under a 90° turn (it becomes 7×5), and no original instruction assigns rune coordinates, page resets, or a common cell grid to the seven pages. A static five-hole mask could select five items from a separately defined field, but the source does not define that field or its cell quantization.

The most direct already-tested 5→7 reading is documented in [the p7 five-dot / numeral-7 alignment report](lp2-p7-five-dot-numeral7-nested-column-alignment.md): the dot order [2,4,0,3,1] deinterleaves the 1,730-symbol pp8–14 stream so that its unique printed numeral 7 leads; the natural seven-column continuations were tested and remained nonlinguistic. Do not repeat that path under a new grille label.

The same five-dot artwork is reused by reflection on p23 and solved p56; see [the original three-page stencil comparison](lp2-p7-p23-p56-five-dot-dihedral-triad.md). The p23 physical-stencil issue #858 likewise found no unique source-selected lane quantization. These are reasons to treat the dots as a reusable motif until a specific receiver is supplied, not as evidence for an unbounded family of masks.

## Historical clue and its limits

A 2019 interview transcript attributes to a person using the name gHOST3301 the retrospective statement that the p7 dots “apply to the constellations” (48:44): https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/ . The same interview does not authenticate the speaker as a creator or authorize him to speak for the group. It is therefore a weak historical lead, not a first-party instruction. Existing repository work has already tested several natural constellation registrations; this report does not reopen those branches.

## Reproduction and next decision

Run `python sims/lp2_p7_five_dot_turning_grille_sft.py` from the repository root (requires NumPy and OpenCV). The SFT hashes the original JPEG, re-extracts all five ink components, asserts their measured centers and rank order, enumerates all four rotations, and verifies the 16-cell union, four repeated cells, and nine omissions. The same script passed locally against the byte-identical original scan.

Reopen only if an original source supplies a 5×5/5×7 field, a unique coordinate quantization, and a defined orientation/reading order. Without those, further grid reshaping or language-scored mask searches would be unconstrained. No unknown-page plaintext or authentic key was recovered.
