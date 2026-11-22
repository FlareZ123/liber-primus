# READ OUT p0 receiver: MLCD Roman-numeral gate

**Agent8, 19 November 2026. Classification: provisional source-visible clue plus bounded downstream rejection. No unknown LP2 plaintext is claimed here.**

## Starting point

This test began only after the independently selected `READ OUT` continuation had fixed physical p0 offsets **80..102** as one untouched 23-rune, four-whole-word receiver.

The four selected words are p0 words18–21:

| word | span | length | raw GP0 | GP0 mod29 | GP29 transliteration |
|---:|---:|---:|---:|---:|---|
| 18 | 80..82 | 3 | 48 | 19 | M |
| 19 | 83..89 | 7 | 78 | 20 | L |
| 20 | 90..94 | 5 | 63 | 5 | C |
| 21 | 95..102 | 8 | 139 | 23 | D |

Thus the already observed receiver state `[B, OUT, g, p] = [19,20,5,23]` also reads literally as **MLCD** under canonical GP29 transliteration.

## Why MLCD is worth preserving

M, L, C and D are the four largest standard Roman-numeral denominations, with ordinary values:

`M=1000, L=50, C=100, D=500`.

Their values sum to **1650**, and `2×1650+1 = 3301`.

This arithmetic is descriptive and post-observation. It is not promoted as a discovery probability or a recovered key.

The complete unknown-manuscript four-word census contains **2,763** consecutive four-word windows. Only **four** have all four GP0 residues inside the high Roman set `{M,L,C,D}`. The selected p0 receiver is the **only** window whose residue multiset is exactly `{M,L,C,D}`, and the only one in exact order `MLCD`.

Those counts are useful controls, but the Roman interpretation itself was noticed after the receiver was selected. They therefore do not justify a naïve 1/2763 probability claim.

## Rejected p33/p39 continuation

A tempting continuation arises because the same emerging route separately selects the p33 cuneiform material. Treating `MLCD` as Roman step lengths in original order gives:

`[1000,50,100,500]`.

On the broad physical p33–p39 page concatenation of 1,680 runes, cumulative forward zero-based positions are:

`[1000,1050,1150,1650]`

and those four runes spell **PADA**.

That apparent hit is **boundary-dependent**.

The source-visible marked cuneiform unit is now correctly bounded from p33 after the first `&` to p39 before the first `&`, excluding the p33 preface and p39 red-X tail. Its exact length is **1,468 runes**. Applying the same frozen cumulative Roman walk modulo 1,468 yields positions:

`[1000,1050,1150,182]`

and runes:

`A A NG S`.

Across the 16 natural coordinate variants charged here, formed by original/reversed Roman order × absolute/cumulative coordinates × forward/backward direction × zero/one origin, **none** spells PADA on the correctly marked 1,468-rune cuneiform body.

Therefore the PADA read is not currently a source-robust continuation.

## Contingent PADA/K artifact

For completeness, the broad 1,680-rune physical-span PADA artifact has:

`GP0(PADA)=13+24+23+24=84`.

Under the already frozen post-MUST drop-`f` base59 table state:

`p50[84] = 2r -> 170`.

Untouched p0 offset170 is rune `TH=2`, numerically equal to the already fixed DH shared secret `K=2`.

Conventional base60 instead gives `2r -> 173`, where p0 offset173 is `OE=22`.

This alignment is recorded so it cannot be rediscovered later without its dependency. It inherits the invalid/unsupported 1,680-rune receiver choice and must **not** be used as evidence for base59 or for PADA unless an independent source clue explicitly selects the full physical p33–p39 span over the visible 1,468-rune marked unit.

## Decision

Preserve **MLCD** as a compact new semantic observation on an independently selected p0 receiver.

Do not advance **PADA**, `GP0(PADA)=84`, or the p0[170]=K landing as the current solve path. The visually marked cuneiform boundary defeats the strongest apparent downstream reading.

A productive successor would need an independent source reason for how Roman values are to be consumed. It should make a blind prediction before another target is inspected.

## Reproduction

- `sims/lp2_readout_mlcd_roman_pada_route_sft.cjs`
- Windows / Node.js 22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44427109885
