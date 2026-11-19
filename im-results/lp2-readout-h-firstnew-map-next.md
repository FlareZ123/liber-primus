# READ OUT H-shell readout yields MAP, then MAP prospectively selects NEXT

**Agent2, 19 November 2026. Classification: candidate source-linked instruction recovery with a prospective same-grammar numeric holdout. MAP is produced by a post-observation but tightly bounded position rule on an independently selected receiver. The downstream consumer was inspected only after MAP was fixed, but it consumes GP0 and therefore validates state56 rather than MAP's exact letters. No complete LP2 inverse is claimed.**

## Frozen upstream object

The p28 cube-layer candidate yields **READ OUT**. Under the existing whole-word GP0 to zero-based p50 address to conventional-base60 p0-offset grammar:

- `GP0(READ)=55 -> p50[55]=80`
- `GP0(OUT)=20 -> p50[20]=102`

This selects p0 offsets **80..102**, exactly four complete words18..21 and 23 runes.

The canonical reversible p28 shell operation is `H(x,y)=(x-y,x+y) mod29`, applied outer-to-inner within each word while preserving an unpaired center rune literally. The resulting stream is:

`19,23,25, 4,16,12,9,6,10,14, 15,8,24,5,21, 5,28,26,22,9,0,18,2`

The independently fixed DH23 state is `p=23,g=5,a=6,b=15,A=8,B=19,K=2`, and the independently selected cube exponent is `e=3`.

## MAP recovery

Read the H stream from left to right and retain the first `e=3` distinct values belonging to the fixed DH state:

| readout position | value | DH field |
| ---: | ---: | --- |
| 0 | 19 | B |
| 1 | 23 | p |
| 7 | 6 | a |

Add each value to its zero-based readout position modulo29:

`[19+0,23+1,6+7] mod29 = [19,24,13] = MAP`.

The combiner was recognized after inspecting this packet, so it requires a finite family control and a fresh downstream consequence.

## Whole-manuscript family control

The reproducer exhausts every contiguous four-complete-word window on the 55 rune-bearing unknown pages: **2,763** windows total, with **1,929** exposing at least three distinct DH-state values under the preserved-center H shell.

It charges six elementary sign/origin variants on the first three distinct DH hits: value+pos0, value-pos0, pos0-value, value+pos1, value-pos1, and pos1-value. Exact output **MAP** occurs **once** under value+pos0 and **zero times** under every other variant. The sole hit is p0 words18..21.

This is a bounded post-observation control, not a discovery-adjusted authorship probability.

## Prospective MAP consumer

Only after MAP was fixed, consume it with exactly the same grammar already used for READ and OUT:

`whole-word GP0 -> zero-based p50 address -> conventional-base60 value -> p0 rune offset`.

`GP0(MAP)=56`. Original p50 cell56 is token `4E`:

- conventional base60 = **254**
- drop-f base59 = **250**

Base60 **254** is exactly the start of **p0 word57**. Base59 250 lies inside p0 word56 and is not a word start.

The selected one-based word ordinal **57** is exactly `GP0(NEXT)=57`. Thus the numeric continuation is:

`GP0(output)=56 -> p50[56] -> base60 254 -> p0 word57 -> NEXT`.

A necessary collision control weakens the letter-level claim: authenticated 2016 **MAP**, **AND**, and **SEEK** all have GP0 sum56. The p50 step therefore cannot distinguish those words. It prospectively validates the recovered numeric state56 and supplies a local radix discriminator while preserving the same p0-offset receiver type used for READ/OUT. Exact MAP still rests on the preceding GP29 letter extraction and its bounded family control.

## Existing NEXT continuation

An earlier independently published edge gives:

`NEXT -> GP0 57 -> p50[57]=1w -> base60 118 -> one-based p28 rune118 -> DH`.

The recovered state56 therefore closes a candidate numeric loop back to the selected p28 DH source object through word57/NEXT. Director issue #1690 remains the appropriate familywise audit of the authenticated NEXT opcode route.

## Decision

Preserve:

`READ OUT -> p0 80..102 -> reversible H readout -> MAP (GP0=56) -> p0 word57 -> NEXT -> existing p28 DH edge`.

The MAP extraction's weak point is the post-observation choice of value-plus-position. The downstream MAP-to-NEXT edge is prospectively tested after MAP was fixed, keeps the same base60 p0-offset grammar, lands exactly on a word boundary, and identifies the authenticated NEXT opcode by word ordinal.

Do not expand to arbitrary field permutations, nonlinear position functions, alternate DH subsets, or tuned radices. A useful successor should make a fresh ciphertext or plaintext prediction outside this loop.

## Reproduction

Run `node sims/lp2_readout_h_firstnew_map_next_sft.cjs`.
