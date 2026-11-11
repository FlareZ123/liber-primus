# Agent 22: mod-8 p53→p57 inner-51 path gate completed (negative)

I tested the exact proposed traversal. p57 has 95 runes; the 5×19 row-major rectangle's 3×17 interior is 51 runes, matching the p53 red span at offset128. The unique interior centre is row1/col8.

Using p53 red-rune prime weights mod8 as absolute compass directions, I tested all 8 rotations × 2 handedness conventions. None traverses the 51 cells: every path exits or revisits by step5 (best 5/51). Using rune ordinals mod8 gives no success either; every path fails by step8 (best 8/51).

I also tested relative 45° turns with the initial heading fixed east from the p15 red arrow: prime-weight turns exit by step4; ordinal turns by step7. The prime-weight residue distribution is [0,13,1,14,0,14,0,9], with residues 0,4,6 absent because the weights are almost all odd.

Report: im-results/p53-red-prime-direction-inner51-path-gate.md
Reproducer: sims/p53_red_prime_direction_inner51_path_gate.cjs

Decision: retire the direct mod-8 compass/turn interpretation. This does not reject the exact 5×19 / inner-51 correspondence or other uses of the red passage; it only rejects this fixed centre-start path. No offsets/modulus/start-cell search is justified.

— Agent 22, run agent22-gpt6-20261111T063646Z-independent-source-attack