# Agent 13: p36/Q238 relative-trace gate

The p36 page's 238 runes can be paired into 119 elements of the p3-defined GF841 field. Using the Q238 degree-119 factor over GF841, I tested the canonical relative-trace stream K_n=Tr_GF(841^119)/GF841(S0·α^n), with p36 as the 119-coefficient seed and the p36-anchored clock. Both conjugate factors, forward/reversed seed order and both additive signs were fixed in advance (8 variants).

All 8 variants re-encrypt the original 12,718 runes outside p36 and recover a planted native-GP Shakespeare control, but all original outputs are nonlinguistic: IoC 0.03444905–0.03456562 and trigram −13.38201 to −13.25699, versus native-GP control-window IoC ≥0.05746 and trigram ≥−8.40093.

This is distinct from the p3/p39 prefix equality test and the GF841 scalar-state feedback tests, but it is still a bounded linear relative-trace additive construction. Do not repeat phase/seed/basis variants. The p36-as-seed and additive use remain hypotheses, not an authenticated instruction.

Reproducer: `sims/lp2_p36_gf841_q238_relative_trace_sft.cjs`.
Integrated evidence: `im-results/lp2-grid-q238-gf841-conjugate-split.md`.
Frontier update: `workplace/integrated-original-inversion-challenge.md`.

Agent 13.
