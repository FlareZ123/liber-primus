# Exact periodic collision-hold crib recovery

## Mechanism and decision

Test the M04 **hold** clock independently of the existing fixed-clock spend and collision-redraw/extra-advance receivers. At phase j a plaintext p proposes u=(p+k[j]) mod 29. If the proposal equals the previous emitted ciphertext, a repair may substitute any other symbol and consume p while retaining j; otherwise the normal emission consumes p and advances j. Also allow the authentic literal-F convention as a separate model (p=0 emits 0 and does not consume the key).

For a known crib, a normal emission forces k[j]=(c-p) mod 29, advances phase; a repair forces k[j]=(prev-p) mod 29 and holds phase, provided c differs from prev. Depth-first search enumerates both branches with exact assigned-key consistency, retaining partial as well as complete keys. Rotation absorbs unknown initial phase. The previous ciphertext is the actual symbol before the candidate placement. At the first rune of the entire stream no previous-symbol repair is permitted. There is no heuristic cutoff.

Six maximal repeated solved LP1 motifs (lengths 37, 29, 42, 41, 22, 20; source KOAN 1 and LOSS OF DIVINITY) are selected by exact rune equality, not by the unknown pages. All six happen to contain no F, so the ordinary and literal-F receiver are **identical for this crib set**. Search every possible contiguous placement in the 12,956 unknown LP2 runes at q=8,13 (historically demonstrated keyword lengths).

| Measure | Result |
|---|---:|
| Distinct original crib/period placements | 155,102 |
| Exact DFS nodes | 4,215,551 |
| Complete candidate keys | 0 |
| Partial candidate keys | 0 |
| Native synthetic controls retaining complete planted key at true placement | 24/24 |
| Additional F-bearing literal-F controls | 2/2 |

Controls use the actual solved source sections, deterministic pseudorandom keys and 80% collision repair with uniform nonrepeat substitutions. They are not blind plaintext recoveries; repeated motifs naturally produce multiple hits. Two additional F-containing 40-rune WARNING controls confirm that the literal-F branch works. No original survivor exists for independent holdout decoding.

**Scope:** this rejects only exact recurrence of the six selected contiguous phrases under continuous q8/q13 M04 hold. It is not a rejection of M04 generally, other plaintext, nonperiodic keys, or transformed/moved cribs. Unlike spend and skip receivers, this repair retains the active key index after emitting the repaired rune. The six F-free motifs make doubling the original scan by F convention redundant; the reported counts are deduplicated.

Reproduce with `node sims/lp2_collision_hold_repeated_crib_sft.cjs`. Inputs are canonical `resources/liber-primus/lp2-corpus.json` and `resources/external/relikd-solved-gp29-native-v1.json`. The exact function was executed in connected V8; standalone Node CI not run. Code commit 7d3c868be5874e0b0c2eaf0111e07ca7e0cceccd.

Related: [fixed-clock spend](lp2-fixedclock-collision-repair-crib-gate.md), [one-redraw recovery](lp2-period8-collision-redraw-key-recovery.md), [uniform-key nonidentifiability](../sims/lp2_m04_uniform_key_nonidentifiability_sft.cjs). A useful next step is language-conditioned blind inference, not adding more speculative crib fragments.
