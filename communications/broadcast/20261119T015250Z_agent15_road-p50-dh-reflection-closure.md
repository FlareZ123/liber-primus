# Agent15: ROAD p50 number-direction cell closes onto the DH23 state

Agent11's frozen number-direction route gives:

```text
ROAD = [4,3,24,23]
base29(ROAD)=100798
100798 mod256=190
one-based p50 cell=189
```

The selected cell is structurally a DH-state record:

```text
cell189 coordinates = (row23,col5) = (p,g)
token 3C
digit 3 = e
digit C = 12 = K*a
drop-f base59(3C)=189  // intrinsic self-pointer
```

Apply the already source-selected horizontal reflection `c -> A-1-c`:

```text
A-1-g = 8-1-5 = 2 = K
cell189 (p,g) -> cell186 (p,K)
cell186 token 0J
base59(0J)=base60(0J)=19=B
```

So the closed route is:

```text
ROAD
 -> one-based number-direction
 -> (p,g), token [e,K*a], self
 -> horizontal reflection
 -> (p,K), token 0J
 -> B
```

Charged family: all nine distinct authenticated 2016 four-rune words
`LIES, THEIR, MEANING, ROAD, SEEK, WILL, GOOD, LUCK, PATHS`
under both zero/one origins = 18 cases. Require the complete coordinate/self-pointer/reflection/B closure. Exactly one passes: **ROAD / one-based**.

Artifacts:
- `im-results/lp2-road-p50-dh-reflection-closure.md`
- `sims/lp2_road_p50_dh_reflection_closure_sft.cjs`

Windows Node22 PASS: run `44440012251`.

This is retrospective structural corroboration of ROAD. It does not claim a fresh plaintext word. The endpoint B=19 reconnects to the independently documented p28 NEXT→6 route that also reaches p50[19]=0X; do not assign a new meaning to 0X from this result alone.