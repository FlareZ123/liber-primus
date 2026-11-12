# Original p55 predecessor-differential inversion with the printed 76-cell table perimeter

**Decision (12 November 2026): bounded negative; no unknown-page plaintext.**

The original LP2 physical pp49–51 carry the 32×8 numeric table (256 source-visible cells). The clockwise top-left-start perimeter has exactly 76 cells. Physical p55 has 76 GP29 runes, including its inherited first word/rune position. Solved p57’s “shed circumferences” language supplies a possible human clue for the ring extraction, but **no authenticated source assigns this perimeter to p55 or identifies a feedback cipher**. A source-independent report already tested the same ring under direct GP29 addition/subtraction and XOR; the present test addresses the distinct first-order predecessor-dependent alternative.

## Frozen original-cipher experiment

Read all printed table values using the repository's conditional base60 interpretation. Traverse the outside 76 cells from the printed top-left across the top, clockwise, with a reversed-order alternative. Map each byte to a GP29 index by reduction modulo 29. Decode all 76 physical p55 ciphertext runes with:

`P_i = (C_i - C_(i-1) ± K_i) mod 29`.

Only the orientation and arithmetic sign are free. For the first predecessor, use either zero or the actual last rune of physical p54; thereafter the previous original p55 ciphertext symbol is mandatory. **All symbols are consumed exactly once** with no guessed phase, offset, word resets, skips or altered source images. The reverse encoder is `C_i = (C_(i-1) + P_i ∓ K_i) mod 29`.

This target is motivated by the very low count of adjacent equal ciphertext runes, and by the possibility that the source-supplied ring is a key rather than literal plaintext. These premises are hypotheses. Unlike direct XOR, a difference decoder could in principle undo a self-synchronizing running-sum layer.

## Original-input outcome

All eight source-fixed candidates round-trip exactly. The best is clockwise perimeter, `P_i=C_i-C_(i-1)+K_i mod29`, with the prior p54 final rune as the starting predecessor:

- Best GP-native Shakespeare-trained trigram score: **−5.219586530935149 per evaluated rune**; GP29 IoC **0.03508771929824561**.
- With initial zero, the same candidate scores **−5.252152555585558**. No other tested candidate scores higher.
- Raw p55 score under this scorer: **−5.693042771543037**; unkeyed first-order difference with zero initial predecessor: **−5.996872740831399**.
- English reference: 719 nonoverlapping held-out 76-rune windows, scored using the same GP29 tokenizer and smoothed trigram model trained on the preceding 75% of the supplied Shakespeare source; range **−3.145569093901447** through **−1.9535890728840908**; median **−2.376220928750856**.

The best original candidate is below **all 719** reference windows. Its leading 40 rune aliases are:

`A-O-T-O-W-P-EO-G-X-AE-X-EA-G-U-T-AE-OE-R-EA-L-A-T-T-I-E-T-U-EO-IA-C-H-Y-T-I-C-OE-G-X-U-M`.

A genuine source-native 76-rune planted text encrypted with the source ring using the stated original-cipher recurrence decodes and re-encrypts without error. Thus this result is a bounded failure of the specified original input, rather than a nonworking inverse implementation.

## Scope and next decision

Reject **only** the direct byte-mod29 perimeter as a 76-step additive key for a preceding-ciphertext feedback decoder on p55, with the fixed starts, two directions, two signs and the stated clocks. Reversing all page glyph order, changing the table base, fitting a new phase, using private alphabet substitutions, or adding key-skip logic is **outside the scope** and is not justified by this evidence. This test does not contradict source-visible perimeter76/interior180 counts; those counts alone do not select an authentic key.

Unless an independently dated Cicada source supplies an actual ring orientation, GP29 mapping and feedback operation, prefer a genuinely different original-source selector over neighboring variants of this failed model.

**Reproducer:** [single-file CommonJS SFT](../sims/p55_grid_ring76_differential_sft.cjs). Source inputs: `resources/liber-primus/base60-grid.json`, `resources/liber-primus/lp2-corpus.json`, `resources/control/shakespeare_first300k.txt`. Related independent direct-ring report: [76 perimeter/180 interior source partition](lp2-p50-76-perimeter-180-interior-source-partition.md).
