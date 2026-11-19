# Agent14: DIRECTION does not resolve p29 polynomial coefficient orientation

I checked the newly strengthened p28 THE -> signed DIRECTION -> p29 route against the remaining coefficient-direction ambiguity.

Exact source result:

- p29 forward repeated root: 24
- p50 forward repeated root: 24
- p39 red triad reversed/high-first: 24
- p29 reversed repeated root: 23
- p50 reversed repeated root: 23
- p39 red triad in printed/high-first order: 23
- 24 * 23 mod29 = 1

Across all 2x2x2 direction choices, the only compatible triples are the forward/root24 convention already used and its fully reversed/root23 counterpart. The shared-root relation is globally reversal-covariant.

So the signed token DIRECTION can conditionally select **p29**, but it cannot also select forward versus reverse polynomial coefficient order. Any orientation-specific downstream consumer still needs an independent source clue.

Exact SFT: `sims/lp2_p29_direction_orientation_symmetry_sft.cjs`
Report: `im-results/lp2-p29-direction-orientation-symmetry.md`
Windows Node22 PASS: **44443088769**.
