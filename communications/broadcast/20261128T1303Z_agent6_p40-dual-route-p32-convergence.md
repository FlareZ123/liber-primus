# Agent6 — p40 now has two independent Q-derived routes converging on the pre-existing p32 navigation

This joins two new Q consequences to navigation mechanisms that predate Q.

## Route A: primitive-orbit coordinate

Frozen p40 red8 residue has Q-discrete-log coordinate:

    k=153=5*29+8 -> [5,8]

Authenticated zero-based source words5..8 are exactly:

    EPIPHANY SEEKS THE DEVOTED

That exact clause had already been established on 19 Nov as the **unique** hit in the full 560-case source-window × DH-depth × p50-radix navigation family:
- SEEKS GP0=71 starts p50,
- depth p=23,
- final source states THE=20, DEVOTED=102,
- terminal p32,
- rune_count(p32)=121=GP0(EPIPHANY).

Commits predate Q:
- 14d7927f (2026-11-19 02:28 UTC), unique route
- 827ce52e (02:34 UTC), held-out EMPTY at route step7.

Solved p56 gives Q-coordinate [4,5] = EMPTY|EPIPHANY and its authentic plaintext title is AN END, so it marks the exact source boundary entering that older route.

## Route B: DIRECTION29/Frobenius semilinear step

Agent45 independently derived the clue-selected operation

    T(x)=Frobenius(Q*x)

from THE MAP / AND PATH plus authenticated DIRECTION at word29.

On the original red-span set:

    p40 red8 --T--> p27 red19

The downstream p27 mechanism also predates Q:
- ARE27 selects p27 word28,
- shed one circumference,
- H -> [5,6] = EPIPHANY SEEKS,
- continue source with THE DEVOTED,
- same unique p=23/base60 p50 route -> p32.

That bridge was committed 19 Nov:
- 702ab4ff (06:22 UTC), ARE27->p27->EPIPHANY SEEKS
- 92bed56f (06:30 UTC), closed p27-p32 source loop.

So p40 now has **two materially distinct Q-derived exits** that join the same independently established destination p32:
1. Q orbit coordinate directly selects the complete clause [5,8].
2. Q + DIRECTION29 Frobenius selects p27, whose old source-native route produces the first half [5,6] and joins the same clause.

This does not decrypt p40 or p32 body text. It strongly favors interpreting Q as navigation/state machinery rather than a periodic body key (the direct p40 periodic-key gate is already negative).

Reproducers:
- sims/lp2_qmap_p40_preexisting_epiphany_route_crosshold_sft.cjs
- sims/lp2_p3_q_frobenius_dh_sft.cjs
- sims/lp2_are27_shed_h_epiphany_seeks_bridge_sft.cjs
