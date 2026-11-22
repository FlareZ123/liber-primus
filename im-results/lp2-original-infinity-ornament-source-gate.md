# Original LP2 infinity ornament p0–2 and p15: repeated stencil, enlarged same-handed symbol

**Direct original-image result, Agent 28, 12 November 2026, Director Issue #437.** This identifies the visible shape and its repetition more precisely. It does not recover unknown LP2 plaintext, a key, a Möbius traversal or a source-selected decipherment operation.

## Human-visible clue and the stronger competing explanation

Original LP2 pp0–2 (archive JPEG17–19) display a thin figure-eight/infinity ornament both above and below the rune text. Physical p15 (archive JPEG32) has one substantially enlarged black version located directly between the **16-number Fibonacci-indexed-prime table** and its red/black rune passage. The page-15 symbol has the **same unreflected figure-eight outline**. A viewer might call it a Möbius/infinity mark, but it is drawn as a **single flat crossed stroke**, with no two separate band edges or indicated one-sided surface. The smallest directly identifiable conventional referent is the familiar mathematical infinity sign, `∞`; no underlying Mobius-strip geometry is visually forced.

The ordinary infinity notation has an independently dated historical source, John Wallis's *De sectionibus conicis* (1655), as catalogued in [MacTutor's notation history](https://mathshistory.st-andrews.ac.uk/Miller/mathsym/calculus/). Bernoulli's 1694 lemniscate curve is another mathematical figure-eight precedent ([MacTutor curve history](https://mathshistory.st-andrews.ac.uk/Curves/Lemniscate/)). These two pre-2014 sources establish that a human could reasonably name the **symbol class**, not that the particular LP2 penstroke was copied from Wallis or Bernoulli. The participant [Uncovering Cicada image inventory](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) also labels the LP2 page 1–3 and 16 marks as infinity signs, but the wiki is a later source annotation, not an original Cicada command.

## Complete original scan geometry and replication

Original images all use **2400×3600** pixels. Each box below is original-pixel `(x,y,width,height)`; the crops are compared on grayscale from unchanged image bytes, threshold at 110. The original p0 image includes red rune ink and may have different JPEG grayscale tones.

| Physical page / JPEG | Top ornament crop | Bottom ornament crop |
| --- | --- | --- |
| p0 / 17.jpg | `(1132,620,114,38)` | `(1132,2943,115,41)` |
| p1 / 18.jpg | `(1132,618,115,41)` | `(1132,2943,115,41)` |
| p2 / 19.jpg | `(1132,618,115,41)` | `(1132,2943,115,41)` |
| p15 / 32.jpg | `(875,1510,551,187)` after table | none |

The **top motifs on p1 and p2 are grayscale-pixel identical**. The **three bottom motifs on p0, p1 and p2 are grayscale-pixel identical**. Their distinct original-grayscale SHA-256 fingerprints are:

- p1/p2 top 115×41: `2e967b35cfcceb19a4bcb8db9e203c509ae32906a14c2f6dc2caae3188139679`.
- all three bottom 115×41: `979b7c8d06fe14ea8cde689931cf70ba5fb472035fc89de61b6d733be156c5bb`.
- p15 enlarged 551×187: `7850ec78ec24b57fa187709a0ed21cdd67ac87ccaff5f6ac533a7f4af662fab7`.

The small p1 top versus bottom ink binary masks have **intersection/union = 0.9837310**; the source's top/bottom minute differences do not yield distinct visibly countable branch or loop states.

A source-wide center-ROI connected-component census of **all 58 original LP2 JPEGs** finds exactly **six** small forms with the same broad 110–130 by 34–50-pixel aspect, 650–1200 dark pixels and >0.4 resized-mask overlap: both marks on p0, p1 and p2. The detector is deliberately aspect/position constrained and does **not** assert that no unseen larger or redesigned infinity-like flourish exists elsewhere. The p15 large crop is handled independently.

**Large mark comparison:** transform the source p15 551×187 black mask to p1's 115×41 reference, allowing only scale width109–122, height37–45 and translations ±7 x / ±6 y, all fixed independent of plaintext. Under that limited registration, the best same-handed original comparison is **IoU 0.764432** (115×39, offset0,+1). Re-running the *same permitted registrations* on p15's reflected masks gives only **0.200000** (horizontal), **0.137160** (vertical) and **0.174323** (both), respectively. Thus the enlarged p15 drawing shares handed outline with the p0–2 infinity emblem. The marks are **not byte-identical** at different sizes, and this does not attribute either to a particular historical printing plate. The wrong-handed controls reject the interpretation that source art intentionally alternates mirrored side choices.

## Implication for decipherment

The repeat locations follow a recognizable **typesetting role**: paired delimiters framing original p0–2 rune blocks, and a single section separator under p15's numeric diagram before a new runic paragraph. The original source supplies **no arrow, start/end, cell order, direction, crossing priority, topological surface rule, key or plaintext target** connecting the infinity shape to the p15 Fibonacci-prime spiral's sixteen numbers. Using a Möbius strip would require a source-selected twist/side/seam coordinate and stopping convention that are absent.

A full-pixel repeated ornament is especially weak as an independent page-varying ciphertext key. Previous #172 explorations of p0–2 seams/27×27 paths and algebraic Möbius transforms remain separate bounded negatives; do not rerun them because the artwork is a scaled figure eight.

**Decision for #437:** a generic historic `∞` symbol is attributable at the *class* level, and the original LP2 page positions/pixel repetitions establish likely section punctuation. No exact pre-May-2014 manuscript stencil attribution, cipher consumer or held-out GP prediction emerged. Retire the figure as a standalone **Möbius-strip traversal instruction**. Reopen only on a dated identical source image plus an explicit source-selected reversible operation on an untouched manuscript interval.

**Reproduce:** [single runnable original-image SFT](../sims/lp2_infinity_motif_source_sft.py) on OpenCV, NumPy and Pillow. It scans all 58 source images, asserts the original exact-crop matches, re-optimizes identical and wrong-handed masks under one fixed scale window, emits source grayscale hashes, and reports every matching location. Original LP2 JPEGs are stored under `resources/liber-primus/`; the SFT also accepts the maintainer's original archive ZIP as its sole optional argument.
