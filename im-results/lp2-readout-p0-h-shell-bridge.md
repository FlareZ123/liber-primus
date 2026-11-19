# READ OUT p0 receiver: mirrored H shells recover p57 clause boundaries

**Agent46, 19 November 2026. Classification: source-constrained instruction/state bridge. No unknown p0 plaintext is claimed.**

## Decision

Retain one new consequence of the independently selected p0 receiver at offsets80..102.

The recovered p28 candidate instruction `READ OUT` already fixes

```text
GP0(READ) = 55 -> p50[55] = 80
GP0(OUT)  = 20 -> p50[20] = 102
```

so the p0 span80..102 was selected before the calculation below. It contains exactly four complete words. Their exact GP0 sums and GP29 residues are

```text
word18: 48 -> 19 = B
word19: 78 -> 20 = GP0(OUT)
word20: 63 ->  5 = g
word21:139 -> 23 = p
```

The residue string is `MLCD`, as independently reported by Agent8. The extra fact here is that three entries are already fixed DH23 fields and the fourth is the numeric value of the instruction word `OUT`.

Apply the previously frozen shell map

```text
H(x,y) = (x-y, x+y) mod29
```

to the two mirrored word-shell vectors. Write the left half as `[19,20]` and the right half from the outside inward as `[23,5]`. Read the two difference components first, followed by the two sum components:

```text
[19,20] - [23,5] = [25,15]
[19,20] + [23,5] = [13,25]

output = [25,15,13,25]
```

Against the solved p57 word sequence, that residue vector has exactly one source-order embedding:

```text
25 -> WE             word9
15 -> CIRCUMFERENCES word14
13 -> FIND           word15
25 -> EMERGE         word20
```

Those four words are the boundaries of two clear p57 clauses:

```text
WE [MUST SHED OUR OWN] CIRCUMFERENCES
FIND [THE DIUINITY WITHIN AND] EMERGE
```

This is useful because `H` was already selected from the first omitted instruction, `SHED OUR OWN CIRCUMFERENCES`. The same transform now maps the independently selected unknown-page receiver to the clear words that frame the operation and its continuation.

## Controls

Using the same printed-word parser as the READ OUT/MLCD work gives 2,763 four-consecutive-word windows on unknown p0..p55, excluding numeric p50.

Only 11 windows produce a mirrored-H four-vector that can be embedded anywhere as a four-word GP0-residue subsequence of solved p57. Eight have one embedding. The selected p0 receiver is one of those eight and its embedding is exactly `WE / CIRCUMFERENCES / FIND / EMERGE`.

The exact H output `[25,15,13,25]` occurs only at p0 word18 among the 2,763 windows. This exact-output uniqueness is descriptive because the receiver had already exposed `MLCD` before the H consequence was noticed.

## Bounded consumers rejected

The same mirrored H operation applied at rune level to all eleven symmetric rune pairs of the 23-rune receiver gives

```text
A IO ING E S E M F TH U C F E D EO TH G IO N R A J E
```

under the fixed difference-channel, center, sum-channel serialization. It does not expose coherent plaintext.

Literal nested peeling of the 23-rune receiver also fails the next clear instruction. None of its twelve nested interiors matches `DIUINITY` under GP0=105, GP1=113, or GP-prime=376.

These negatives close the direct rune-H and literal DIVINITY-peel consumers. Do not retune shell order, metric, or serialization to rescue them.

## Reproduction

Run:

`node sims/lp2_readout_p0_h_shell_bridge_sft.cjs`

Windows Node22 CI run **44427978339** passes on the committed source.

The reproducer derives the READ/OUT p50 endpoints, reparses the four p0 receiver words, verifies the `[B,OUT,g,p]` typing, applies mirrored H, reconstructs the unique p57 embedding, runs the 2,763-window control, and freezes both negative consumers.
