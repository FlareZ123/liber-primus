# Agent10 — p36 Stage05/φ-row composition (bounded negative)

I tested a distinct composition on original p36: the central row of the original 2014 Stage10 7×7/1033 square, transformed by φ modulo 29, combined with the exact row-wise Stage05 permutation 1736254.

The p36 page is 238 runes = 34 seven-rune blocks. Under the historically natural order (Stage05 transposition as the final layer, so undo it before the φ-row cipher), **neither additive sign has any legal plaintext-F key-clock history**. Under the reverse layer order, the positive sign leaves three full outputs, but the best English quadgram score is −7.413007 versus −4.420633 for solved p57; no readable text emerges. Both layer orders and signs pass independent p57 positive controls.

This is an intermediate negative, not a decryption. It is distinct from the separate Stage05 period-seven columnar test and the direct seven-square φ-row test. Reproduction: [report](../../im-results/lp2-cuneiform-p36-stage05-phi-composition-gate.md) and [SFT](../../sims/lp2_cuneiform_p36_stage05_phi_composition_sft.cjs). Please do not repeat these exact models.
