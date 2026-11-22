# Printed LP2 line-start runes: stable marginal bias, no decoded channel

**Evidence class:** reproducible original-ciphertext structure and conditional matched controls. **No recovered unknown LP2 plaintext, key, or destination.** Agent 20, 2026-11-10. This note consolidates the printed-line experiment with a separately tested first-symbol effect.

## Source contract and mechanism under test

The source `resources/liber-primus/lp2-transcription.txt` uses slash-delimited printed lines and percent-delimited page records. Record 50 maps to LP2 physical page 51 because the original page 50 contains the rune-free numerical grid. The two scripts reconstruct every page and assert exact rune-index identity against `resources/liber-primus/lp2-corpus.json`. The 55 unsolved rune-bearing pages have **594 printed lines and 12,956 runes**.

A line-reset model uses one shared deterministic **bijective** substitution at a given position within each printed line. Under direct GP-English plaintext this would preserve the high natural-language rune-equality rate between line pairs at the same position, regardless of the 29-rune output permutation. Rotating each original line independently gives a null preserving all line inventories, line lengths, ordering within each line, and their low runic doublet rate. A separate conditional null samples equally many line-start runes from the same *offset in each canonical word*, or the stronger *same word offset and whole-word length*. Both respect words spanning printed lines and physical pages.

## New result: first printed rune is systematically biased

Across the **594 first-rune positions**, rune collision IoC is **0.03758779475**. Under **2,400** independent complete-line cyclic rotations, the first-column null mean is **0.03446241**, SD **0.00043040**, making the real value **7.2616 SD above** the null mean. The first printed position is the largest positive standardized coincidence among the **24 positions supported by at least 100 lines**. Only **one of 2,400** rotations produces as large a *family maximum*, giving corrected p **2/2,401 = 0.000833** under this specific position family. This is a conditional structural signal, with no global correction across every hypothesis examined in Liber Primus research.

The same first-rune IoC exceeds all **1,800** same-word-offset randomized selections (add-one p **1/1,801**) and all **1,800** same-offset-and-word-length selections (same upper bound). Thus differential word-fragment positions alone cannot explain the source-level first-rune concentration under these nulls.

The highest individual line-start glyph counts, relative to their unconditional manuscript proportions, are: **ᛠ 38 versus 21.09** expected; **ᛈ 33 versus 20.40**; **ᛞ 32 versus 20.13**. Meanwhile **ᚱ 6 versus 19.44** and **ᛁ 9 versus 21.59**. These are descriptive contributors to a single 29-rune distribution test, rather than independently selected cipher keys. The corresponding **last** glyphs of the 594 lines have IoC **0.03440248**.

**Frozen inter-page prediction:** Fit a single 29-way line-initial versus global-rune odds vector on pages **0–27** only, with a 50-count prior from those pages, and freeze it before scoring the remaining physical pages. The true second-half starts outperform word-offset-and-length-matched alternatives in **2,994 of 3,000** randomizations (upper p **7/3,001 = 0.00233**). Reversing training and test halves gives **p 39/3,001 = 0.0130**. Both halves share initial-rune preferences. These transfer checks were conceived after identifying the phenomenon, so the p-values remain conditional and exploratory.

An attempted **594-rune acrostic** made from the first glyph of each printed line has no detected short-period key: scanning every period **2–60** and calibrating the maximal period z-score over **1,600 within-page permutations of printed-line order** gives a best period **50**, z **1.5200**, family p **0.945**.

## Direct line-key comparison

Pool same-column rune-equality pairs over all printed lines: the observed rate is **0.03476868059** over **3,638,562 eligible pairs**, versus 3,000 line-rotation controls with mean **0.03450536** and ten exceedances (raw add-one p **0.00367**). The weak pooled excess is almost entirely in columns **0 and 1**: taking only those columns gives **0.03652602** (rotation p **0.000333**), whereas excluding both yields **0.03458032** and **p 0.2193**. This is a local margin feature, rather than a distributed repeated-key signal.

The first 28 physical pages supply 310 lines and 6,761 runes, same-column IoC **0.03482992** and p **0.0604** under 2,500 rotations. Later pages supply 284 lines and 6,195 runes, IoC **0.03507871** and p **0.00200**. Train a 29-symbol per-column prior on one half, freeze its probabilities, and predict the other half against 3,500 cyclic test-line controls. First-to-second test logLR is **-164.0504**, null mean **-180.2520**, p **0.1945**. Reverse transfer gives **-198.6682**, null mean **-216.2853**, p **0.2091**. The manuscript has no significant persistent all-column alphabet preference under this fitted model.

Twenty diagnostic synthetic GP-English rune sequences using a shared 29-position additive key reset per printed line, plus 81% stochastic correction of immediate ciphertext repeats, yield same-column IoCs **0.053008–0.056130**, all far above the original. Twenty independent-per-output-key controls yield **0.034241–0.034649**. These synthetic overwrites are model controls and are not offered as an invertible Cicada cipher. The evidence substantially disfavors a shared directly encrypted GP-English line-reset bijection, even under an unknown shared ciphertext permutation.

The low runic repetition rate continues through printed-line joins: **4/539** equal consecutive symbols across within-page line boundaries, compared with **82/12,362** within-line adjacent pairs. Nothing establishes a line-local reset of the observed anti-repeat channel.

## Interpretation and decision

The original page-0 JPEG displays lines of roughly 19–24 runes ending at a shared visual right margin. The source's large first-column rune bias has a **physical layout explanation supported by original pixels and independently predicted wrap locations**. The [source-glyph-width inversion and original-image analysis](printed-line-greedy-width-inverse.md) estimates relative advances from physical line cuts on one page half; the two fitted rune-width profiles correlate r=0.846, and each predicts 87–89% of unseen line cuts within one glyph. Native original-JPEG first-ink-component width measurements correlate r=0.891 and r=0.873 with widths fitted entirely on the opposite manuscript half. In 376 original source-image line joins, remaining right-side ink gap also correlates with the next rune's actual ink width (Pearson r=0.44005), exceeding all 4,000 same-page pixel-permutation controls. These independent observations establish width-sensitive source typography as a substantial contributor; they do not identify exact original font advances or kerning.

To address the remaining cipher-relevant question rather than assuming all bias is explained, a subsequent [original-JPEG-width-conditioned residual test](printed-line-width-conditioned-residual.md) fixed each rune's independent source-image width category, then preserved the exact counts of selected line starts *separately within every page and width bin*. Across 10,000 conditional selections, the original **539 within-page starts** show no unusual residual 29-rune discrepancy (χ² 31.08491, p=**0.10629**); the **388 midword line starts** likewise give χ² 25.14533, p=**0.32547**. Fitting the same residual alphabet on the first/last physical-page halves and predicting the opposite pages fails in both directions (all four transfer p values **0.52555–0.70603**). A stable, artificially planted eightfold GP P preference survives the same width conditioning, with frozen-half heldout p=**0.000333**. The coarse bins and historical selection of this effect limit any universal inference, yet they leave **no detectable width-independent line-start cipher alphabet**.

The observed line-initial bias is thus a real and reproducible source statistic with a strong, forward-predictive typographic mechanism and no supported additional ciphertext-letter layer under this finite test. It has yielded **no decoded acrostic, genuine key, unknown plaintext, or exact re-encryption of an LP2 heldout interval**. A new line-start channel hypothesis should account for original-JPEG width selection before proposing a key, and should make a fixed original-ciphertext prediction.

## Reproduction

- [Original-line key invariant and GP-English controls](../sims/printed_line_phase_invariant.cjs)
- [First-rune family correction, word-offset nulls, frozen inter-half test, and acrostic](../sims/printed_line_start_channel.cjs)
- [On-demand CI workflow](../.github/workflows/printed-line-phase-manual.yml)
- [Successful initial CI run 42768872911](https://github.com/FlareZ123/liber-primus/actions/runs/42768872911)

The observation is retained in `im-results/` pending a demonstrated cryptographic or typesetting mechanism. The project-wide authoritative `results/README.md` continues to identify the unsolved pages as encrypted and without recovered keys or plaintext.
