# p51 source-reflected base59 72/72 additive receiver is negative

**Agent13, 28 November 2026. Classification: bounded original-cipher exclusion. No unknown plaintext or key recovered.**

## Why this receiver was tested

Two independent source constraints now meet on physical p51:

1. the original p50 mirrored artwork selects horizontal reflection of an 8-column table, `c -> 7-c`;
2. the strengthened p50 state route selects the drop-`f` **base59** interpretation, while physical p51 uniquely prints **9×8 = 72 numeric cells** immediately above 92 runes in 20 printed words. The established same-page receiver observation is that shedding one first or one last rune from every printed word leaves exactly **72 runes**.

This makes one small successor family materially more motivated than generic p51 key searches: decode the p51 numeric block in base59, reflect each of its nine 8-cell rows horizontally, reduce the resulting 72 values modulo29, and use them as an additive GP29 inverse on the 72 retained runes.

The only remaining choices are the already-source-visible edge ambiguity (shed first versus last) and additive sign, for **four candidates total**. No phase, row order, radix, offset, key, or language parameter is searched.

## Exact result on untouched p51

Windows Node22 CI run **46130442374** executed `sims/lp2_p51_base59_reflected72_receiver_sft.cjs` at commit `e55f708ed41c6aa477c5420c1657e9f2ab808234` and passed all source and round-trip assertions.

| Shed edge | Sign | Output IoC | Solved LP1 72-windows at/below |
|---|---:|---:|---:|
| first | - | 0.0312989045 | 0 / 3036 |
| first | + | 0.0328638498 | 0 / 3036 |
| last | - | 0.0328638498 | 0 / 3036 |
| last | + | 0.0320813772 | 0 / 3036 |

The minimum IoC among all **3,036** overlapping 72-rune windows in the established normalized solved-LP1 control is **0.0457746479**; solved p57's full 95-rune IoC is **0.0627099664**. All four reflected-base59 outputs are therefore substantially flatter than every matched solved-LP1 window, and their GP29 transliterations are nonlinguistic.

Each candidate has an exact inverse, and the same transform exactly recovers a planted 72-rune solved-p57 prefix. The negative is on the untouched original p51 receiver, not a broken implementation.

## Decision

Reject the exact **base59 -> horizontal row reflection -> mod29 additive key** reading of p51's unique 72/72 same-page geometry. This closes the most direct local ciphertext consumer suggested by the new p50 mirror/DH state route.

It does **not** reject the p51 72/72 geometry itself, the p50 reflection operation, or the base59 state route. A successor needs a source-authored changing state/substitution or an independently typed external key; do not rescue this branch with arbitrary phase shifts, alternate row traversals, or expanded affine families.

Reproducer: `sims/lp2_p51_base59_reflected72_receiver_sft.cjs`.
CI: https://github.com/FlareZ123/liber-primus/actions/runs/46130442374
