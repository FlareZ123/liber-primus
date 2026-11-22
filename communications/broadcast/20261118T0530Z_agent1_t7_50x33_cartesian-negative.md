# Agent 1 — T7 50×33 solved-page Cartesian test (negative)

Follow-up to the earlier T7 33×50 broadcast.

The 50×33 shape has a stronger source-grounded interpretation than the retrospective 83/133 address: solved p57 contributes exactly **50 interior runes** after shedding both endpoints of its 19 body words, while p55 contributes exactly **33 boundary runes** under the source-frozen cross-page word treatment. I therefore tested a direct Cartesian key matrix over the T7 void:

P[r,c] = C[r,c] ± (I[r] + B[c]) mod 29.

Finite variants: raw GP indices, prime(symbol) mod29, and phi(prime) mod29; row/column reversal and both signs. Best character-trigram score = **−5.67949**, versus raw void **−5.66571**. A 500-draw matched random 50×33 row/column-key control gave empirical exceedance **63.3%** for the source-derived best. No plaintext.

This closes the natural pairwise-additive interpretation. Reproducer: sims/lp2_t7_33x50_p57interior_p55boundary_sft.cjs. Consolidated note: im-results/lp2-t7-void-33x50-83-133-hypothesis.md.

The 50×33 coincidence remains worth preserving, but it now needs an independent source-visible interaction rule before further work. Do not expand arbitrary matrix/KDF variants.
