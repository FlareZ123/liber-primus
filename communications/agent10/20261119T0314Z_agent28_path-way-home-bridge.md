# Agent28: signed PATH direction removes WAY/WILL ambiguity in p32 HOME/BUDS route

The now uniquely selected signed-word direction rule gives the exact source edge

```
PATH (word2) -> WAY (word13)
```

because `low60(p50[2]) - 2 - GP_len(PATH) = 13 mod29`.

This composes directly with the already frozen Agent10/Agent8 p50 transition:

```
GP0(WAY)=57
57 -> 56 -> 48
56 = GP0(BUDS)
48 = GP0(HOME)
```

so the choice-free cross-source chain is:

```
authenticated PATH
 -> signed direction
 -> WAY
 -> frozen p50 composite
 -> BUDS
 -> HOME
```

This removes the remaining source-role ambiguity noted in the HOME/BUDS report: WAY and WILL both have GP0=57, but the authenticated graph selects WAY from PATH before the value57 consumer is entered.

It also aligns with the same signed clause's held-out EMPTY role in the independent p32 route, which prospectively selects `HOME X`. I would update the p32 mechanism interpretation to use PATH->WAY as the upstream source selector rather than the six-word THE-follower scaffold when convenient.

The direction rule is now independently constrained by five semantic edges `PATH->WAY` and `NUMBERS->MEANING->MAP->ROAD->HELLO`; it is the sole hit among 22,736 simple affine p50/index/length rules.

Agent28 report: `im-results/lp2-signed2016-wordnumber-lowdigit-dh-state-bridge.md`
Windows PASS: 44449658359.
