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

The source image `17.jpg` (LP2 physical page 0) displays rows of roughly 19–24 runes ending at a closely shared visual right margin. Rune-dependent typesetting or wrapping is a plausible **unverified** cause of biased first glyphs. A separate exploratory Noto Sans Runic font-width proxy correlates positively with the first-glyph overrepresentation, but that available font is **not verified as the font used in the original manuscript**. A font-independent graphical source measurement or a physically specified encoding rule is required to distinguish layout from intentional cryptographic selection.

A separate [source-glyph-width inversion and original-image confirmation](printed-line-greedy-width-inverse.md) now provides an independently predictive **visual wrapping mechanism** for this first-rune effect. The 29 relative glyph advances inferred separately from the two physical page halves correlate r=0.846; frozen half-models locate **87–89% of unseen printed line breaks within one glyph** (equal-rune-width baselines 57–67%). More decisively, measured first-glyph ink-component widths in original source JPEGs correlate **r=0.891 and r=0.873** with predictions fitted on the *opposite* physical page halves. Neither pixel correlation was reached by 1,500 page-preserving first-rune-label shuffles (conditional p=1/1501 each). On 376 original adjacent source-image line joins, the preceding line's right-margin gap correlates with the upcoming first glyph's native-JPEG ink width (Pearson r=0.44005, Spearman0.38984), larger than all 4,000 same-page ink-width permutation controls (p=1/4001). This confirms visual width-sensitive wrapping without using fitted font parameters. Original line starts favor symbols estimated wider on unseen pages (p=0.001, 0.004). This demonstrates a substantial source-layout contribution, with actual original font advances, kerns and any remaining width-conditioned cryptographic bias still unresolved.

The initial-rune distribution is a reproducible, geographically localized source constraint. It has so far yielded **no decoded acrostic, repeated pad, key, plaintext passage, or exact re-encryption of an original unfitted LP2 interval**. No additional free-form offsets, alphabets, or language searches are warranted on this evidence alone. The source-grounded heldout line-wrap prediction and opposite-half source-JPEG width validation are now implemented; the exact font advance and any surviving width-conditioned acrostic remain open.

## Reproduction

- [Original-line key invariant and GP-English controls](../sims/printed_line_phase_invariant.cjs)
- [First-rune family correction, word-offset nulls, frozen inter-half test, and acrostic](../sims/printed_line_start_channel.cjs)
- [On-demand CI workflow](../.github/workflows/printed-line-phase-manual.yml)
- [Successful initial CI run 42768872911](https://github.com/FlareZ123/liber-primus/actions/runs/42768872911)

The observation is retained in `im-results/` pending a demonstrated cryptographic or typesetting mechanism. The project-wide authoritative `results/README.md` continues to identify the unsolved pages as encrypted and without recovered keys or plaintext.
