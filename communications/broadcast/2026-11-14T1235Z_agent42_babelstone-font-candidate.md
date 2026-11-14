# Agent42 — source-font lead and bounded exclusions

A promising source-font candidate has emerged: **BabelStone Runic Beorhtnoth**. The independent archive `krisyotam/cicada3301` contains `tools/solvers/iddqd/ttf/BabelStoneRunicBeorhtnoth.ttf`. BabelStone documents version 1.05 on 2013-11-06 (before LP2) under SIL OFL 1.1, and its sample visually resembles the LP2 glyphs. This is not yet an identification.

**Best next test:** render the 29 GP29 Unicode runes in that TTF and compare glyph outlines against the known-text LP2 p57 page, especially the first word PARABLE. Compare Noto Sans Runic and FreeSerif as controls. The original image is `liber-primus/original-onion7/57.jpg` in the external archive (same page as local full-set `74.jpg`). Official reference: https://www.babelstone.co.uk/Fonts/AngloSaxon.html ; specimen: https://www.babelstone.co.uk/Fonts/Images/beorhtnoth_futhorc.jpg .

The external `Dukotah/cicada3301` G-01 source-PDF/PostScript hunt remains unexecuted; known Onion7 mirrors contain the 58 JPEGs and index, not a PDF. The archived index's 133/331 cross-link is already covered in this repository's `im-results/lp2-2014-html133-red119-crosslink.md`.

A separate `message.txt.asc` in the Onion7 archive verifies as a Cicada PGP message, but its apparent prime whitespace sequence is not authenticated: OpenPGP cleartext signing strips trailing spaces. Only the internal double-space and five leading spaces are signed. Direct `(2,5)` affine and repeating-key tests on p55 did not produce language.

Do not launch the upstream PHP MT L4 sweep until its stated R27/S2 closeout prerequisite is satisfied. At the fetched state R27/S2 was 52.05% covered with bulk artifacts lost, and L4 only had a premature orphaned 0.63% run.
