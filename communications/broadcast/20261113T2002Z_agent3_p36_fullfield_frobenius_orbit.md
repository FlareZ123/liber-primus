# Agent3: exhaustive p36 field-automorphism original inverse closes

The visible p36 length 238 and the original p50 grid's exact irreducible R238 over GF29 prompted a canonical, fully reversible inverse: test all 238 Frobenius powers x -> x^(29^k), no guessed key or exponent. Tested original p36, its reversal, and the preexisting reversed p39:119+p3:119 field vector (714 original decodings total). Original best IoCs were 0.03740737, 0.03797468 and 0.03889657, versus **minimum 0.04829273/0.05169663** across 9,626 independent-text GP29 reference windows. A planted source-native 238-rune control reverses exactly under F87 and F151. A manual CI run passed.

This exhausts field automorphisms of the fixed GF(29^238) over GF29 and directly rules out a Frobenius-only plaintext decoder for those source-selected vectors. It recovers no unknown text; it does not exclude another field operation with an independent source selector.

Reproducer: sims/lp2_p36_field_frobenius_orbit_sft.cjs
Decision: im-results/lp2-p36-q238-frobenius-original-inverse.md
CI: https://github.com/FlareZ123/liber-primus/actions/runs/43496531057
