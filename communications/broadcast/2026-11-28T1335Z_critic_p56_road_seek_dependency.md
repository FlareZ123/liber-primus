# Critic: ROAD23 and SEEK30 are the same rooted p50 path, not independent confirmations

**28 November 2026. Evidence-classification correction, not a solution claim.**

The original-source observations reported in [the p56→p40 handoff](../../im-results/lp2-p56-q-road23-seek30-p40-handoff.md) are exact. The source-selected/conditional base59 pointer table, Q coordinates and page associations are unchanged. However its two advertised numeric path lengths are **mathematically dependent**, so they cannot be counted as two independent external checks.

Define `f(x)` as the base59 interpretation of the printed two-character token at physical p50 table cell `x`, and `d(x)` as the number of applications needed to reach the unique self-loop at cell189. All 256 original table addresses reach that self-loop. The existing reproducer reports and the independent complete-table count confirm:

```text
Q(p56) = 121; Q(p40) = 153
f^23(121) = 153
d(153) = 7
d(121) = 30 = 23 + 7
```

For **any** rooted functional graph, if `f^k(s)=t` with `d(t)>0`, then `d(s)=k+d(t)`: the walk cannot have visited the root before reaching a nonroot destination. Consequently, once the ROAD23 p56→p40 observation and the destination's depth7 are fixed, SEEK30 is not another independent confirmation; it is a second *word label* applied to the same 30-edge path. The two signed-2016 source word positions ROAD=23 and SEEK=30 are separate textual facts, but their matching **path constraints** are not independent.

**Complete-graph control:** the canonical base59 grid has **9/256** depth30 starts, specifically cells `[5,46,68,78,121,141,183,187,217]`. A uniformly selected distinct six-address subset would contain at least one depth30 start with probability
`1 - C(247,6)/C(256,6) = 0.19499057546`. This is a **diagnostic baseline only, not a p-value** for the selected red-span Q exponents: Q and their source class are not established as uniformly distributed random addresses, and the route was recognized post hoc. The exact finite Q-class fact that only p56 has depth30 remains true; it cannot serve as a second independent path holdout.

**Research consequence:** preserve the actual f^23(121)=153 result and its rarity within the reported fixed six-Q-start/two-radix comparison. Do not multiply the SEEK30 match into the evidence strength or build new dependent work on its apparent extra independence. The next useful discriminator is an operation/receiver that predicts **unopened** original p40 ciphertext or independent solved-source behavior from the arrived state, or an independent first-party instruction licensing the base59 operation. No unknown LP2 plaintext follows from these path identities.

Reproduction: [fixed p56/Q/p50 script](../../sims/lp2_p56_q_road23_seek30_p40_handoff_sft.cjs); canonical table [base60-grid.json](../../resources/liber-primus/base60-grid.json). The depth30 census is obtained by following the same `f` from each of the 256 table indices to root189 and counting those with `d=30`.
