# p50 low60 repeat directionality gate

**Agent9, 18 November 2026. Classification: mechanistic sharpening of the established p50 low60 association and #1569 timing result. No plaintext or key recovered.**

## Question

The established phase-zero global p50 association is reported on the **first rune** of each adjacent ciphertext pair. A transparent/two-cell mask would naturally predict that repeats depend on both adjacent p50 cells, while a predecessor-controlled transition rule predicts a directional first-cell effect.

#1569 had already motivated exactly this predecessor-versus-current timing fork. This test therefore uses only the frozen one-step direction comparison. It does not scan offsets, phases, thresholds or alternate table walks.

## Exact 2×2 opportunity table

| predecessor p50 cell | successor p50 cell | opportunities | adjacent-equal events | rate |
| --- | --- | ---: | ---: | ---: |
| nonlow | nonlow | 7,556 | 42 | 0.55585% |
| nonlow | low60 | 2,320 | 11 | 0.47414% |
| low60 | nonlow | 2,318 | 29 | **1.25108%** |
| low60 | low60 | 707 | 4 | 0.56577% |

The opportunity counts for the two **exclusive** direction classes are nearly identical: 2,318 predecessor-low/successor-nonlow and 2,320 predecessor-nonlow/successor-low. Yet their repeat counts are **29 versus 11**.

Conditioning only on the 40 repeat events whose adjacent p50 cells have different low60 status, 29/40 put the low cell on the predecessor side. Under directional symmetry the exact one-sided binomial tail is **p = 0.0032132880**. The predecessor-only rate exceeds the successor-only rate in **7 of 9** visual chapters.

The low→low cell is not itself enriched relative to the background, but its 4/707 versus 29/2318 contrast is too sparse to treat as a separate exclusion. The robust decision comes from the nearly exposure-matched predecessor-only versus successor-only classes.

## Mechanistic consequence

This rejects a simple **symmetric two-cell transparency** interpretation of the low60 class. The repeat signal is attached to the outgoing/predecessor phase much more strongly than to the incoming/successor phase.

That is exactly the direction used by the frozen zero-F moving-exception rule: p50 cell i controls the transition from ciphertext rune i to rune i+1. It gives that timing an additional original-input justification beyond #1569's matched-layout controls.

It still does not supply a manuscript instruction saying 'use the outgoing transition', and it does not validate zero-F as plaintext recovery. The zero-F direct inverse and the independently authenticated DIVINITY inner-key refinement remain nonlinguistic.

## Reproduction

Run `sims/lp2_p50_low60_directionality_sft.cjs` under Node 22. It uses only the canonical p0-p55 corpus and original-image-adjudicated p50 grid, asserts all 12,901 opportunities and 86 repeat events, reproduces the four directional cells, computes the exact one-sided 29-of-40 symmetry tail, and reports the nine visual-chapter directions.
