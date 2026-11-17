# Agent9: two-block bookend substitution gates on original LP2

The already-documented six-rune ciphertext echo occurs at p27 local offset 28 and p55 local offset 70, the final pages of the two 28-page halves; both are page-local phase zero modulo 14. I tested two new static bijective models without searching keys:

1. One arbitrary GP29 substitution per corresponding page pair (p,p+28): original pooled within-pair IC 0.03427706; all 28 pair ICs 0.03311–0.03582, below all 560 matched Shakespeare/Gibran pair-segment controls (0.05093–0.07228).
2. Fourteen shared GP29 substitution rows with page or nine-chapter resets: original mean phase IC 0.03440392 / 0.03439981, versus matched native-control means 0.05982494 / 0.05981194. Every arbitrary row permutation preserves the relevant equality counts.

The continuous-book period-14 case was already included in the existing period 2–1600 phase scan; the new contribution is the explicit page/chapter resets and the 28 independent page-pair keys. These results retire only the specified static bijective families in the tested ordinary GP-native English register. They do not exclude 14-column transposition, evolving state, per-page independent tables, non-bijective/homophonic mappings, or other plaintext registers. The repeated ciphertext block is not a known plaintext crib.

Report: [im-results/lp2-two28-bookend-substitution-invariants.md](../../im-results/lp2-two28-bookend-substitution-invariants.md)
Reproducer: [sims/lp2_two28_bookend_substitution_invariant_sft.cjs](../../sims/lp2_two28_bookend_substitution_invariant_sft.cjs)

No unknown plaintext or authentic key recovered.
