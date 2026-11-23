# Source-original GP29 doublets versus physical glyph allographs

**23 November 2026, Agent3.** A direct physical exception-channel prediction was tested on the original 2014 LP2 JPEGs. No authentic plaintext, side channel, key or continuation recovered. [Successful original-source run 45165344104](https://github.com/FlareZ123/liber-primus/actions/runs/45165344104) executes the [single Python SFT](../sims/lp2_doublet_original_allograph_sidechannel_sft.py).

## The concrete solve path

The source original unknown pages p0–55 have **12,956 runes but only 86 adjacent identical-rune events**. One proposed binary transport permits 28 successor choices excluding the preceding rune; repeated symbols might instead require exceptional physical printing, such as a distinct typeform or small ink marker, to signal an escape. The author used image steganography historically, making visible physical exceptions a plausible place to seek missing key bits. A testable necessary prediction is that repeated-rune positions should coincide with abnormal printed shapes much more often than ordinary runes do. This is conditional; the source gives no direct instruction to use an allograph escape.

## Source-fixed, independent-template experiment

Reuse the [already established all-29-shape segmentation and renderer](../sims/lp2_allglyph_original_allograph_sft.py), training all 29 GP symbol templates **solely on the independently solved p56 and p57 original print images**. Extract original black ink components on each unknown physical page, align the classified glyph run to the canonical original page rune indices with a position-preserving matching algorithm, and compare each mapped original glyph to its correct rune's solved-page templates. The binary morphological distance and the threshold **0.03** are inherited unchanged from the original allograph test; no parameter is selected using the doublet outcome.

Mark a physical glyph as belonging to the repeated-rune group if its source GP token is identical to its preceding or following token on that page. Test the one-sided hypergeometric enrichment of same-rune positions among morphology exceptions against fixed observed margins. This is a specific class-agnostic carrier test; it does not presume what bits would mean. The source-glyph labels, physical page numbering, doublet definition and classification thresholds are frozen before the page-by-page test.

## Original result

| Measurement | Value |
| --- | ---: |
| Actual repeat events on pp0–55 | **86** |
| Events with both glyphs physically mapped | **84** |
| Unmapped event endpoints | p11 local80, p27 local229 |
| All mapped original glyphs | **12,865** |
| Mapped glyph positions touching a doublet | **170** |
| Morphology exceptions within doublet positions | **1 / 170** |
| Morphology exceptions at other positions | **75 / 12,695** |
| Enrichment p under fixed margins | **0.637216** |
| Mean morphology distance, doublet glyphs | **0.0019901** |
| Mean morphology distance, other glyphs | **0.0022556** |

The single exception at a doublet position is p27 local index228, the **C** GP rune. Its paired neighbor (local229) is physically unmapped by the renderer, so it is not an authenticated repeat-specific allograph. Most other exceptions (73 of 75 in non-doublet glyphs) are ordinary **C** templates on unrelated positions. All 84 fully mapped repeat pairs coexist with zero additional morphology flags under this same criterion.

## Consequence and scope

The proposed conspicuous typeform escape at adjacent equal runes has **no source-image support**; it does not explain the manuscript's unusual repeat rate. This specifically rejects a broad repeat-vs-visible-allograph correspondence under the independent renderer and 0.03 threshold. It cannot exclude an adversarial microscopic printer-phase bit, an unregistered alternative font, or an escape signaled through a different medium. Any such expansion requires an independent reading clue. The preserved script offers a reproducible position-level carrier detector for a future authentic clue, and the 86 repeat events remain a cryptanalytic constraint.
