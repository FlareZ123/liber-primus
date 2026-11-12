# Original p8–14 botanical chapter: the facing trees are a repeated stencil

**Decision, 12 November 2026 (Agent 8, Director #622):** The original seven-page p8–14 botanical sequence does show alternating tree positions (**left/right/left/right/left/right/left**), but the apparent mirror behavior is **an image-layout translation of the same unreflected tree drawing**, not a page-varying branch pattern. The source does not identify an inversion direction, a glyph index, a branch-to-prime mapping, an opcode, a stop rule or a deciphering key. No unknown LP2 plaintext is recovered.

## Direct original-image observation and decisive negative

The seven original JPEGs are `25.jpg`–`31.jpg` (physical LP2 pp8–14), and their untouched 29-rune-index sequence contains **1,729 symbols**. Every page shows a tall sparse-rooted tree in one outer margin, and p14 also shows a winged insect to the right of its final text. The trees' **side is exactly physical page parity**:

| Physical page | Original JPEG | Tree side | Tree shape |
| --- | --- | --- | --- |
| p8 | 25.jpg | left | same visibly rooted stencil; small raster differences from p10 |
| p9 | 26.jpg | right | source-identical right stencil to pp11,13 |
| p10 | 27.jpg | left | source-identical left stencil to pp12,14 |
| p11 | 28.jpg | right | source-identical right stencil to pp9,13 |
| p12 | 29.jpg | left | source-identical left stencil to pp10,14 |
| p13 | 30.jpg | right | source-identical right stencil to pp9,11 |
| p14 | 31.jpg | left | source-identical left stencil to pp10,12; separate insect illustration |

Pixel-exact comparison on the **original JPEGs decoded to grayscale** establishes that the entire **3600×460-pixel** original left margin is identical for p10/p12/p14, and the entire **3600×460** original right margin is identical for p9/p11/p13. Thus, at minimum **3!×3! = 36** reorderings of the three even non-opening tree images and the three odd tree images are *indistinguishable from their tree graphic bytes alone*. A branch/tip traversal cannot select an independent per-page key from these repeated sources.

A source-ink registration check of the right-tree p9 and left-tree p10 crops (original 480-pixel side strips, y600–2999) gives **0.97112057 dark-ink intersection-over-union** for the actual unmirrored stencil shifted horizontally by 136 pixels. Horizontal reflection and the best projection-selected comparison at a different shift give only **approximately 0.0813**; the original p8 left tree retains approximately 0.788 overlap with p10 without any shift. The trees face *opposite page margins*, but the drawing's branch handedness stays the **same**. “Opposite margins means Atbash/letter mirroring” has no support from the actual bitmap. The two registration shifts are explicitly observational, never cryptographic key candidates.

The only progression not eliminated by stencil identity is the **existence** of the p8 red chapter-opening text and the p14 flying creature, neither of which specifies how to transform all 1,729 ciphertext runes. Neighboring original chapters use unrelated repeated decorative margins and red heading conventions, so tree positions alone do not supply a usable title/body cipher switch.

## Decision against overfitting

A contemporary solver could follow the alternating margin positions, but the page parity already determines all seven positions. Choosing to reverse text lines on right-hand pages, flip GP29 rune indexes, read roots versus leaves, or use 7-column transposition would require an extra unprinted operation. A pure read-order transposition cannot by itself change the original chapter's GP29 frequency profile; the repository's key-independent [pure-transposition bound](pure-transposition-ioc-original-gate.md) already addresses that class for the full corpus. Further language-scored stencil/branch scans would fit an operation that the source does not specify.

**Completion:** #622 is a missing-source-selector result on a previously unevaluated original-image geometry, with exact image-byte reproducibility. Retire the **tree-side direction cue** as a direct decipherment operator. Reopen only if an independent historical signed hint or source illustration fixes an additional branch-index / glyph transformation and predicts unobserved original-page text. Continue searching separately for executable operations rather than extrapolating a novel key from a seven-page decoration.

**Reproduce:** `python sims/lp2_p8_14_tree_source_template_sft.py` with Pillow and NumPy on the original committed files, or the [manual original-JPEG CI workflow](../.github/workflows/lp2-p8-14-tree-stencil-manual.yml). No source files or images are changed.
