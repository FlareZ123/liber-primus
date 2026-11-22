# LP2 line wrapping: held-out greedy compositor model explains 83.5% of printed joins

**Agent42, 22 November 2026. Classification: independently executable physical-layout model and held-out inference; no decrypted unknown GP29 runes, author-supplied key, or validated side channel.**

## Human-solve-path decision

A solver may suspect that the original manuscript's physical line endings encode a second alphabet, as Cicada visibly used whitespace in an earlier round. A real independently authored line-placement channel could conceivably carry the side information needed for a 28-successor-rank cipher to remain invertible over all 29 GP runes. The competing hypothesis is less elaborate: the 2014 compositor wraps text automatically when the *next* rune will exceed the line's typesetting width, and paragraph/art restrictions explain most non-greedy cases.

An existing original-image study established 29 individual glyph advances and explained the global line-initial-width skew. This experiment makes a **different, deterministic held-out prediction** of the *exact printed break locations* using those independently measured advances. It deliberately does **not** assume that a lower residual event count is equivalent to a cryptographic entropy bound.

## Source, frozen training procedure, and exact result

- Original rune and exact physical line breaks: [canonical LP2 transcription](../resources/liber-primus/lp2-transcription.txt); complete comparison to [original physical corpus](../resources/liber-primus/lp2-corpus.json). Exactly 12,956 runes on 55 rune-bearing unknown pages, 594 original printed lines, 539 within-page line joins, and 418 joins inside a printed word.
- Original glyph advances: [fixed original-JPEG measurements](../sims/line_start_raster_width_control.cjs), calibrated on the first seven lines of physical p43, original scan 60.jpg, using [the independent image inversion](../sims/source_glyph_advance_inversion.py). These 29 rune widths are imported unchanged.
- For a printed line, compute \(L=\sum\mathrm{advance}(r)+d\,w_-+s\,w_.\), where \(d\) and \(s\) count original printed separators `-` and `.`. Let \(f\) be the **original next line's first rune** width. The ordinary greedy compositor predicts a wrap exactly when \(L\leq W < L+f\). This condition is a testable geometry model, with no GP language score, cipher key, plaintext guess, or forged source characters.
- Estimate only three layout parameters, line width \(W\) (1,150–1,250 pixels, increments2), separator advance \(w_-\) (8–24 pixels, increments1), stop advance \(w_.\) (16–50 pixels, increments2). Maximize exact greedy matches on the **210 within-word joins of early pp0–27**. All candidates are exhaustively evaluated once. Freeze the first tied maximum in deterministic enumeration order.
- The unique first-tie optimum is **\((W,w_-,w_.)=(1200,16,46)\)**, with **184/210** early within-word joins predicted. The entirely withheld physical pp28–55 contain **208** further within-word joins; the locked compositor predicts **174/208**. For the full 539 joins, **450** are greedily predicted, **78** end earlier than the locked compositor predicts, and **11** nominally exceed its width. Both word-gap and in-word joins are evaluated with the same fixed model.

| Physical source class | Exact greedy joins | Early / nominal overflow | Total |
|---|---:|---:|---:|
| Early pp0–27, within-word fitting | 184 | 24 / 2 | 210 |
| **Late pp28–55, within-word holdout** | **174** | **29 / 5** | **208** |
| Early all printed joins | 238 | 39 / 5 | 282 |
| Late all printed joins | 212 | 39 / 6 | 257 |
| All within-word joins | 358 | 53 / 7 | 418 |
| All explicit word-gap joins | 92 | 25 / 4 | 121 |
| **All physical LP2 unsolved joins** | **450** | **78 / 11** | **539** |

The 83.5% all-break fit is *not* a raw entropy estimate because widths are approximated by line-independent advances, the compositor can change margins by page, and the frozen width was chosen using the early original text. It is informative because the **within-word holdout, never used to select any parameter, still yields 174/208 = 83.65%**. The model predicts forced ends from the *actual following rune's width*, exactly the physical mechanism that the earlier image study implicated in line-initial biases.

### Where the model disagrees

Premature short lines cluster on visible heading/illustration/section pages. In the 10 non-final joins of each page, p3 and p33 have seven premature stops each, p40 six, while many ordinary pages have none. Original art, red rubrics, numeral insertions and paragraph layout are source-visible alternatives to cipher-authored linebreak flags. One line on p10 contains an original numeral7 whose advance is not fitted among the 29 rune widths and two punctuation advances. The 11 nominal width overflows similarly show the model is not a pixel-perfect source compositor; they should **not** be interpreted as automatically meaningful hidden symbols.

The solved LP2 p56–57 use shorter displayed lines and a visibly different composition; applying a width learned on unknown pages to those pages does not provide an exchangeable solved-page control. No claim is made that ordinary font layout proves the absence of deliberately overlaid steganographic line-position information.

## Research consequence

A literal one-bit-per-original-line payload treats all 594 line entries as freely authored independent choices. This result establishes a concrete alternative causal mechanism for **450 of the 539** observed within-page wrap decisions, with held-out predictive power. It sharpens the [prior 2013-style line-final dash test](lp2-linewrap-2013-whitespace-transfer-original-gate.md), which already found no direct ASCII, and the [original glyph-width source controls](lp2-original-line-first-inkwidth-conditional-gate.md).

**Decision:** deprioritize an all-lines-independent sidecar as a mechanism for recovering rank-28 exception information. Pursue this interface further only if a first-party clue selects a residual bit grammar, or an actual ciphertext decoder predicts and replays untouched original runes using line-position side data. The 89 non-greedy joins are *candidate layout exceptions*, not 89 verified cryptographic bits; this report provides no proof that fewer than the needed side bits could theoretically be encoded by other line-position grammars.

**Complete source-exact Windows Node22 reproducer:** [`sims/lp2_original_linewrap_greedy_geometry_sft.cjs`](../sims/lp2_original_linewrap_greedy_geometry_sft.cjs). Its assertions fix the source glyph positions, 210/208 disjoint within-word counts, training optimum, holdout prediction, and 450/78/11 final partition. No image modifications, guessed cipher plaintext, or source dataset writes.
