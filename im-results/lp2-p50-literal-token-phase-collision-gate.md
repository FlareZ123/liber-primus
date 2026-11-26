# Radix-independent repeated-token phase schedule: conditional original obstruction

Agent45, 26 November 2026, Director #2934. **No recovered unknown plaintext or key.** This is a finite native-reference exclusion under the exact ordinary consuming clock, not an unconditional exclusion of all possible GP29 prose.

## Frozen model

The case-adjudicated physical p49–51 table has 256 printed tokens and 161 distinct case-sensitive spellings. Assign one unknown GP29 additive shift k_t to each literal token t, in fixed row-major cycle, phase zero at the start of physical p40–53 (3,008 runes). Ordinary consuming clock; no transparent F hold. Then C_i=P_i+k_{t(i)} mod29, t(i)=tokens[i mod256]. No radix, byte interpretation, shift values, word boundaries, traversal or alternate origin are selected.

This family is contained in ordinary q256 private phase substitutions, whose broad finite-control obstruction is established in [the all-period report](lp2-allperiod-secret-phase-bijection-original-gate.md). However the earlier whole-book/chapter-aggregate collision result does not itself certify a particular chapter; here the repeated-token constraint adds genuine cross-phase pairs at the specified chapter receiver. #2877 is a literal character-class record gate; #2335 is evolving two-rune feedback. Neither is this fixed repeated-token class clock.

## Exact key-independent class invariants

For any positions with the same literal token, C_i=C_j iff P_i=P_j. Let h_t(c) be the histogram of ciphertext rune c for token class t. Any additive shift (or any bijection) preserves all within-class equal pairs M=sum_t,c choose(h_t(c),2). Even noninjective fixed class maps cannot *decrease* M. There are 33,717 eligible pairs on the original, of which **1,160** are equal (3.4404%). The weaker untied q256 phase statistic is 568.

For any target subset S of k plaintext symbols, the total count is bounded by B(k)=sum_t of the k largest entries of h_t, even after arbitrary pre-encryption positional transport. B(1..5)=[423,753,1026,1271,1499]. B(1)=423 is exactly attainable for a chosen target rune by optimizing each shift independently. The additive-specific exact two-symbol bounds for E+O, E+A, E+S are 612,608,594, respectively, using native corpus frequencies to select the fixed symbols.

## Native reference comparison

Use the same three frozen normalized literary GP donors and 32 evenly spaced 3,008-rune windows each as the [literal-F concentration report](lp2-periodic-fhold-concentration-phase-cover.md), with **no printed word-order information**. Within-window rune order is retained for the collision gate. References are overlapping windows, not independent samples or an authenticated LP2 expected plaintext.

| Donor | Same-token collisions min–max | Untied q256 collisions min–max | Prefix-histogram survivors | All 3 pair-bound survivors | Exact same-token collision survivors |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gibran | 1,915–2,182 | 910–1,053 | 32/32 | 18/32 | 0/32 |
| Shakespeare | 1,859–2,138 | 893–1,019 | 32/32 | 13/32 | 0/32 |
| Emerson | 1,885–2,232 | 901–1,086 | 32/32 | 11/32 | 0/32 |

All 96 aligned donor tapes have more equal pairs than original under both tied and untied clocks. Tying the literal token identities yields an exact minimum gap of 699 pairs versus 325 for q256 alone. This strengthens the scoped original-language incompatibility, independent of any shift fit. The order-free sorted-histogram relaxation survives all 96; 42 survive the three additive pair bounds. Consequently an arbitrary positional transport is **not** excluded by these concentration gates. No pre-encryption position permutation is in the frozen receiver.

Three length-matched real-literary GP controls encrypted with hidden, independently sampled token shifts preserve exact collision counts (2,085/2,101/1,954), pass prefix bounds and decrypt exactly with true keys. These validate the algebra, not blind recovery. The fixed ordered-native gate fails before language fitting, so no blind key search or original candidate is warranted. No claim that every possible English string has a collision count above 1,160.

## Decision and reproduction

Retire the direct ordinary consuming repeated-token phase schedule as an explanation of the original chapter under the 96 frozen ordered native-reference windows, consistent with the broader q256 result. Unauthenticated transposition, F-hold or dynamic token meanings are different models, not rescue parameters to tune. Table semantics remain unselected.

`node sims/lp2_p50_literal_token_phase_collision_sft.cjs` — [SFT](../sims/lp2_p50_literal_token_phase_collision_sft.cjs), [executed output](lp2-p50-literal-token-phase-collision-output.json). Executed against pinned source data in connected V8; no Windows CI run claimed.
