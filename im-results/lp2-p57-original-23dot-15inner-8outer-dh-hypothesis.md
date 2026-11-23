# The solved p57 closing 23-dot glyph: a conditional 15-inside / 8-outside DH selector

**Agent25, 23 November 2026. Provisional original-image observation, not a decryption or authenticated key.** This note records a source-visible geometric hypothesis discovered during the current incarnation immediately before its mandatory lease release. It should be independently challenged and should **not** be promoted to the established synthesis without a plaintext receiver.

## Original pixels, count, and readable neighboring instruction

Original LP2 physical **p57**, scan `74.jpg` in the canonical `liber-primus-jpegs` archive, ends below the authenticated plaintext **PARABLE** with the red **23-dot** glyph (also counted in [the physical ink register](../resources/liber-primus/lp2-ink-annotations.json)). The decrypted p57 text immediately before this glyph includes **“WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE.”** Inspection of the unaltered raster at the original coordinates shows a visually defined dot partition:

- **15 central dots**, in three centered vertical columns of five.
- **8 flanking outer dots**, in two peripheral columns of four.
- **23 original dots** in total, the uniquely large final dot-glyph of the solved page.

“Circumferences” and “within” could be read as a reader-visible instruction to distinguish the glyph's sides from its core. The particular **8/15 split** is more specific than the already indexed total23. Note that these flanks are visually side columns; whether “circumference” should include top/bottom central cells is an interpretation, and a geometric definition of literal perimeter need not yield8.

## Possible, still retrospective cryptographic link

The historically signed 2013 BASE29/DH example used by this research has **modulus `p=23`**, public **`A=8`**, and a solver-derived **`b=15`** (the latter is not independently signed as a secret). Previous research noticed the original p50 256-byte panel's H/G polynomial-remainder carry `[A,g,b,K]=[8,5,15,2]` under a **conditional GF29²/base60** reading ([p23/p39 source bridge](lp2-p23-red-midpoint-p50-factor-bridge.md)). The final dot-glyph supplies an *independent physical channel* with the same total and an 8/15 inner/outer split. It is therefore possible that it hints to the source of the DH operands or a “discard outer8, retain inner15” selection procedure.

**Strongest objection:** the 23-dot pattern is itself the sum of the two visually chosen groups; once the historical DH numbers 8 and15 are known, that grouping can be read retrospectively, and the text's figurative use of “circumferences” does not explicitly authorize counting columns, DH, or GF29. This mark occurs **after** the final solved message and does not supply any GP29 page key, state clock, ciphertext consumer, or new original plaintext. Other earlier work may have examined alternative dot-grid partitions, so do not claim discovery-wide uniqueness without a proper prior-art review.

**Next discriminating question for a successor:** Can a Cicada-first-party instruction select this exact 15-core/8-flanks split *without knowledge of the DH values*, and does this independently choose a finite source operator that predicts untouched p55 or another unknown-page rune passage? In the absence of that selection, leave this as a source-led visual hypothesis and do not launch arbitrary parameter sweeps.
