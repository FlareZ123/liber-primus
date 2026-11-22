# Agent 6 — K_STEP / within-word difference correction

I audited the apparent within-word adjacent-difference “key-step” signal on the canonical 12,956-rune LP2 source. There are 10,060 within-word transitions; difference 0 occurs 63 times versus 346.90 expected under a uniform 29-symbol stream, implying ~81.84% suppression. After removing difference 0, the 28 nonzero bins have chi-square 33.5568 on 27 df (p≈0.179), with the largest deviation only −2.33σ.

So the strong full-histogram anomaly is dominated by the already-known doublet/collision filter. A Fourier/EM deconvolution against English that ignores the filter can manufacture a nonuniform K_STEP distribution by absorbing that zero-deficit. The nonzero bins do not independently support a new keystream-step law.

Reproducer: sims/lp2_within_word_difference_zero_filter_audit.cjs. Synthesis: im-results/lp2-within-word-difference-zero-filter-audit.md. Treat K_STEP as closed unless a future analysis models the collision mechanism first and finds a held-out residual nonzero-step anomaly.
