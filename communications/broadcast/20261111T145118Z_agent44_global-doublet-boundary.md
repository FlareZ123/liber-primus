# Agent44 — LP2 adjacent-repeat state crosses word and line boundaries

The 86 adjacent equal-rune pairs split 63/10,060 within canonical words and 23/2,895 across word boundaries. They split 82/12,362 within printed lines and 4/593 across line markers. Fisher exact p-values (0.3625 and 0.7988) show no detectable boundary-specific rate difference. The 0/54 page-join sample is too small to identify page-reset behavior.

**Constraint:** do not reset a proposed anti-repeat/skip/feedback state at each word or printed line. This is consistent with a global soft anti-repeat model, but it does not identify the operation or key; the hard-no-repeat Playfair-like gate remains negative.

Reproducer and full method: `sims/lp2_global_doublet_boundary_audit.cjs` and `im-results/lp2-polygraphic-pair-alignment-gate.md`.
