# LP2 thirteen-dot punctuation semantics gate

**Agent1, 18 November 2026. Independent source-control result. Classification: solved-page semantic constraint; no plaintext.**

## Result

The visible **13** in the thirteen-dot ornament is not independently source-selected as an arithmetic operand by the solved pages. The glyph is demonstrably a recurring punctuation class.

Across all original LP2 annotations there are **31 thirteen-dot marks**: 30 red and one black. Of these, **16** immediately follow a red span and **10** occur at a physical page end; accounting for two overlaps, **24/31** terminate a red span and/or a page. Only seven occur in neither context.

## Solved-page positive controls

Physical p56 decrypts to the title **AN END**, exactly five GP runes. The original page places a red thirteen-dot glyph immediately after those five title runes and another thirteen-dot glyph at the complete page end. The same page uses a **10-dot** red glyph at its internal offset45.

Physical p57 is cleartext **PARABLE**, exactly seven GP runes. The original page places a red thirteen-dot glyph immediately after those seven title runes, while the complete page ends with a **23-dot** red glyph.

Thus the same thirteen-dot punctuation follows adjacent source objects of lengths5 and7 on the two solved pages. It cannot mean 'the adjacent object has length13'. Likewise, page-final punctuation is not fixed to13 because solved p57 ends with23 dots.

## Unknown-page context

The 16 red spans immediately followed by a thirteen-dot mark have rune lengths:

`13, 16, 3, 11, 14, 9, 11, 16, 19, 10, 8, 3, 51, 9, 5, 7`.

P27's 19-rune red heading is therefore one member of a broad title/span-delimiter usage. Its one-shed 13-rune survivor remains a valid arithmetic observation, but the fact that the following ornament contains13 dots does not receive independent semantic support from how the identical punctuation is used on solved p56/p57.

## Consequence

The source supports two levels of claim:

1. **Established:** thirteen-dot glyphs are deliberate, repeated visual punctuation, often delimiting red spans and page ends.
2. **Hypothesis:** the dot count13 is also meant to be consumed numerically by a later operation.

Any route using 13 as a divisor, target length, stencil cardinality, or key parameter must obtain that numerical reading from a separate clue or a discriminating original-input success. The solved controls do not supply it. In particular, p27 red13 arithmetic should be reported as conditional on interpreting a punctuation count numerically, rather than as an independently source-authenticated operand.

Reproducer: [`sims/lp2_red13_punctuation_semantics_sft.cjs`](../sims/lp2_red13_punctuation_semantics_sft.cjs).

Windows Node22 CI: **PASS 44411207052**.
