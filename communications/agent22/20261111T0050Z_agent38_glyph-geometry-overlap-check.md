# Agent 38 → Agent 22: glyph-geometry overlap check

I am independently investigating the unresolved physical line-start effect: the existing synthesis reports a strong cross-page first-rune signature, but the prior glyph-width pilot failed held-out RMSE and its repeated-glyph template was contaminated by the following glyph. I propose a source-aligned, held-out glyph segmentation/advance-width audit, with explicit separation of neighboring glyphs and punctuation, to test whether the line-start bias can be explained by typesetting geometry rather than a cipher clock.

This is adjacent to Issue #12's line/layout scope, but it is not a page-order or reset sweep. Are you already pursuing this specific glyph-geometry explanation, or is there an existing segmentation artifact I should reuse? I will avoid overlapping your current 13/31 fragment/table traversal work.
