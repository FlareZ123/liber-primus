# P0-selected DH grid coordinate separates VERIFY from the false-path trap

**Agent3, 19 November 2026. Classification: source-constrained navigation discriminator. The p0 receiver, p28 DH state, H orientation and native base60 low-digit pointer were all independently fixed before this table-coordinate continuation. The result gives a coherent route-level branch distinction, not unknown LP2 plaintext and not evidence that arbitrary H pairs should be treated as table coordinates.**

## Frozen inputs

The upstream p0 ROAD/NUMBERS receiver is sealed at words42/43, offsets189..195. Its raw word sums reduce to

```text
[15,2] = [b,K] = H(D,H)
```

and frozen `H^-1` therefore returns the literal p28 label `DH=[23,8]`.

Physical p28 line6 is independently selected by that unique literal DH label and supplies five outer-H endpoint pairs in printed fragment order:

```text
1 [15,2]
2 [14,4]
3 [12,12]
4 [23,12]
5 [8,19]
```

The original numeric field is visibly **32 rows × 8 columns**, and the independently supported state-navigation operation is:

```text
state s
 -> p50[s]
 -> zero-based low digit in native base60
 -> next state
```

No alternate token component is introduced below.

## Interpret the fixed H pairs as literal table coordinates

Use an H pair `[r,c]` as zero-based row/column coordinates in the original 32×8 table.

Only the first two printed p28 H pairs are valid coordinates:

```text
[15,2] -> address 15*8+2 = 122
[14,4] -> address 14*8+4 = 116

[12,12] invalid: column12 >= 8
[23,12] invalid: column12 >= 8
[8,19]  invalid: column19 >= 8
```

The swapped orientation is invalid for both surviving pairs because 15 and14 cannot be columns. The established H orientation therefore also gives the only usable coordinate orientation.

Original cells:

```text
p50[122] = 1Q
p50[116] = 0s
```

## Selected first pair enters VERIFY

Apply the already fixed low-digit pointer without changing type:

```text
address122: p50[122]=1Q -> 26
26:         p50[26] =2r -> 53
53:         p50[53] =2p -> 51
51:         p50[51] =0x -> 59
59:         p50[59] =19 -> 9
9:          p50[9]  =49 -> 9
```

Among the authenticated 2016/2017 source vocabulary:

```text
GP0=59 -> VERIFY
```

and VERIFY is unique at that GP0 state. The intermediate states26,53,51 have no authenticated source-word GP0 labels.

Thus the p0-selected DH aggregate chooses the first valid p28 H coordinate, and the frozen table transition reaches **VERIFY** before the terminal state9 fixed point.

## The only other valid DH coordinate enters the known false-path trap

The second valid H coordinate gives:

```text
address116: p50[116]=0s -> 54
54:         p50[54] =2a -> 36
36:         p50[36] =0s -> 54
```

Authenticated source labels are:

```text
54 = ROAD / PATHS
36 = FOUND
```

This is exactly the independently documented source-side false-path cycle:

```text
ROAD / PATHS <-> FOUND
```

So the two p28 H pairs that are geometrically admissible as original-table coordinates split cleanly into:

```text
pair1 [15,2] -> ... -> VERIFY
pair2 [14,4] -> ROAD/PATHS <-> FOUND
```

The first pair is independently selected by the sealed p0 word-sum receiver before this coordinate interpretation. The second pair is retained as the natural rival and enters the already authenticated false-path trap.

## Coordinate-origin control

For completeness, charge the immediate one-based row/column alternative by subtracting one from each H coordinate before row-major addressing.

It gives:

```text
[15,2] one-based -> address113 -> first authenticated GP0 hit IS
[14,4] one-based -> address107 -> first authenticated GP0 hit THE
```

Those are generic source labels and do not reproduce the VERIFY / false-path opposition. This is a control only: zero-based addressing was already independently supported for the low-digit state mechanism, so the present observation must not be counted as a fresh origin selection.

## Global calibration: VERIFY is not rare in the table graph

Do not treat merely reaching VERIFY as surprising. Across all256 possible table addresses under the same low-digit walk:

- 190/256 eventually reach state59 before their first repeated state;
- 79/256 have VERIFY as their first authenticated-vocabulary GP0 state;
- 16/256 have ROAD/PATHS state54 as their first authenticated-vocabulary GP0 state.

The evidence is therefore **not** a low random probability for VERIFY. The useful structure is causal and local: an independently selected p0 aggregate reproduces the first p28 DH H pair; the original 32×8 geometry admits only the first two p28 H pairs; under the already selected low-digit operation those two branches map respectively to VERIFY and the known false-path trap.

A separately source-selected p39 route now also returns VERIFY. That convergence is compatible with VERIFY functioning as an instruction/checkpoint, while neither route converts it into unknown plaintext.

## Decision

Preserve the following bounded intended-route hypothesis:

```text
sealed p0 [3,4] receiver
 -> raw sums [b,K] = [15,2]
 -> H^-1 => literal DH
 -> same [b,K] as original 32x8 coordinate
 -> p50 low-digit route
 -> VERIFY
```

The only other p28 H pair that fits the table's width enters the signed ROAD/PATHS <-> FOUND false-path trap. This gives the 2017 warning “Beware false paths. Verify OpenPGP …” an operationally relevant branch distinction without mining OpenPGP packet bytes.

Do not generalize this into arbitrary H-pair-to-grid addressing. A next advance requires a source-selected consumer of VERIFY or a blind consequence of the selected branch.

## Reproduction

`node sims/lp2_p0_dh_grid_verify_falsepath_sft.cjs`
