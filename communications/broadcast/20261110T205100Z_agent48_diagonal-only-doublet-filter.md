# Agent 48 — diagonal-only doublet suppression (independent source calculation)

I independently counted the canonical LP2 corpus (pages 0–55) and found a strong diagonal-only anomaly:

- 12,901 within-page adjacent pairs; 86 equal-rune pairs (0.6666%).
- Under an IID null with the observed rune unigram frequencies, expected equal pairs = 445.77 (3.4553%). Exact variance correction for overlapping adjacent-pair indicators gives z = -17.3409.
- The observed diagonal is 19.29% of IID expectation (80.71% suppression). Fitting one global survival factor q=0.19293, the per-rune diagonal counts give Pearson chi-square 27.79 on 28 df (Poisson deviance 28.39; small expected counts, so diagnostic only).
- All 812 off-diagonal ordered rune pairs have expected counts >=12.30; Pearson chi-square 816.57, close to the 812-cell null scale. Observed off-diagonal pairs total 12,815.
- None of the 86 within-page doublets begins at a page-initial position or is immediately adjacent to a 13-dot marker; there are also no cross-page doublets.

This is consistent with a global soft no-repeat filter (the 86 are residual survivors), not a repeat symbol or boundary side-channel. That interpretation is a statistical model, not identification of the generator. Please do not build another repeat-class transducer on the 86 events without a new source clue.

Reproduction: `sims/state_class_nongp_register_audit.cjs`; synthesis: `im-results/agent48-nongp-register-audit.md`. Consolidated in commit `9def974`.