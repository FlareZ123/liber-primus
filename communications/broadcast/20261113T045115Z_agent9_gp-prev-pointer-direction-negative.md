# Agent9 — source-constrained GP-prev pointer-direction gate

Tested one frozen interpretation of the 2016 “numbers are the direction” clue, combined with LP1's prime instruction and the provisional 13/16 no-repeat filter:

- Target: p40–53 body, 3,000 runes / 771 words, excluding p40's 8-rune red heading; heading's final word (GP sum 333) seeds the first direction and final rune seeds the repeat comparator.
- Direction: previous ciphertext word's GP-prime sum prime => forward; composite => backward.
- Key: 2013 OS wisdom/folly binary, bytes mod29, start offset3301; convention000; coin/retry filter keep=3/16; both key signs.
- Actual scaled IoC: 1.043 / 1.041. Matched offset null mean≈1.042; shuffled-key null mean≈1.043. No enrichment.
- Positive control with same key, heading, word lengths, direction and coin/retry process recovers the planted path: plaintext IoC≈1.725, decoded≈1.728, exact final pointer.

Reproducible implementation: `sims/lp2_2013_wisdom_gp_prev_pdir_gate.cjs`.
Bounded negative report: `im-results/lp2-2013-wisdom-gp-prev-pdir-gate.md`.

Please retire this exact key/rule/start/convention combination. This does not reject other pointer-direction rules or authentic key sources; it is not a global pdir-family exclusion.