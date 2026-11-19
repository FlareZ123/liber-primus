# P11 THEIR NUMBERS orders p27 as WE MUST SHED

**Agent50, 19 November 2026. Classification: source-authored ordering rule for an existing p27 instruction chain. This resolves the explicit p27 ordering limitation without opening a new cipher family. It does not decrypt unknown p27 body text.**

## Result

P11 now has an untouched, manuscript-unique raw selector.

The source-selected same-index receiver is:

```text
p11 word11 = [11,14]
```

Use the standard pair-interleaved H order, difference before sum:

```text
11 - 14 = -3 = 26 mod29
11 + 14 = 25

=> H = [26,25]
```

This is a complete unit-step source-index run. The independently established instruction `THEIR NUMBERS ARE THE DIRECTION` fixes increasing numerical direction, so orient the run as:

```text
[26,25] -> [25,26]
```

Authenticated source indices25 and26 are:

```text
25 THEIR
26 NUMBERS
```

so the raw ciphertext says:

```text
THEIR NUMBERS
```

before any plaintext inversion.

Across all **465** complete two-rune manuscript words, the exact standard-H shell `[26,25]` occurs once at this p11 receiver. Across the corrected 42-object numbered diagonal, standard H has exactly three complete unit-step runs; this one is the descending pair that normalizes to `THEIR NUMBERS` under increasing numerical direction.

The authenticated continuation is the increasing source/page corridor:

```text
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION
```

giving the explicit instruction:

```text
THEIR NUMBERS ARE THE DIRECTION
```

## The unresolved p27 ordering problem

P27 is the corridor's `ARE` page.

Agent14 independently selected the p27 red heading from the p55 terminal route and recovered three exact clear-p57 word values under operations already established elsewhere in the manuscript.

In structural evaluation order:

```text
full red heading:
prime rank(1109) = 186 = MUST

first literal circumference shed:
prime rank(673) = 122
p50[122] = 86 = WE

second shed shell:
phi(233) = 232 = SHED
```

Thus the three recovered numbers are:

```text
[186,86,232]
= [MUST,WE,SHED]
```

The original p27 report correctly left the English order underselected. Natural outer-to-inner structural order gives `MUST WE SHED`, while the clear p57 sentence is `WE MUST SHED`.

## THEIR NUMBERS ARE THE DIRECTION supplies the order

The p11 packet gives a source-authored ordering instruction immediately before the p27 object:

```text
THEIR NUMBERS ARE THE DIRECTION
```

The corridor itself is traversed in increasing source/page-number direction:

```text
25 -> 26 -> 27 -> 28 -> 29
```

Apply that same increasing numerical direction to p27's three recovered word numbers:

```text
86 < 186 < 232
```

which gives:

```text
86  = WE
186 = MUST
232 = SHED

=> WE MUST SHED
```

There are six possible permutations of the three p27 objects. Exactly one produces the clear consecutive p57 phrase `WE MUST SHED`, and it is the increasing-number order selected by the source corridor.

## Why this is stronger than matching the p57 sentence directly

The p27 arithmetic already fixed all three values before this bridge:

```text
186, 86, 232
```

The missing choice was only their order.

P11 contributes two independent constraints:

1. the unique untouched two-rune packet `[25,26]=THEIR NUMBERS`;
2. the authenticated continuation `ARE THE DIRECTION` in increasing source indices.

No new affine coefficient, key phrase, rune mapping, phase, or permutation search is added. The only operation introduced is monotone ordering in the direction already demonstrated by the source numbers themselves.

This directly addresses the missing step stated in the earlier p27 report: a source-authored rule that orders the three validated values.

## Route consequence

The corridor can now be read as an operational sequence:

```text
p11 raw packet
 -> THEIR NUMBERS

source-number direction
 -> pages25..29
 -> THEIR NUMBERS ARE THE DIRECTION

p27 red heading
 -> numbers 186 / 86 / 232

follow their increasing numerical direction
 -> 86 / 186 / 232
 -> WE MUST SHED
```

P28 and p29 already have independent downstream evidence:

```text
p28 -> READ OUT THE
p29 -> DIRECTION / WAY branch
```

so the same five-page corridor now contains both the ordering instruction and the existing READ OUT THE DIRECTION handoff.

## Evidence boundary

This closes the **ordering** of the p27 instruction chain.

It does not yet specify what unknown ciphertext object must be shed after the instruction `WE MUST SHED`. Agent14's direct 13-rune repeating-key receiver remains excluded by plaintext-F transparency.

The next useful test should therefore consume `WE MUST SHED` on a source-selected object in the p25-p29 corridor or on the solved p57 continuation `OUR OWN CIRCUMFERENCES`, with the receiver fixed before plaintext inspection.

## Reproduction

- new bridge SFT: `sims/lp2_p11_p27_numbers_direction_order_sft.cjs`
- workflow: `.github/workflows/agent50-p11-p27-numbers-direction-order.yml`
- p11 source selector: `sims/lp2_p11_is_occurrence_hrect_sft.cjs`
- p11 report: `im-results/lp2-p11-is-occurrence-hrect.md`
- upstream p27 instruction SFT: `sims/lp2_p27_redheading_we_must_shed_sft.cjs`
