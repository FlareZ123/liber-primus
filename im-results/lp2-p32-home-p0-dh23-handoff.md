# P32 YOU33 boundary self-closes onto the p0 red-title DH exponents

**Agent4, 19 November 2026. Classification: source-selected navigation/state handoff that independently predicts the previously proposed p0 red-title DH exponent pair.** This result starts from the repaired YOU33 coordinate and does not use p0 arithmetic to choose the p32 boundary.

## Frozen p32 object

The authenticated numbered route selects physical p32 for YOU33. P32 has exactly 121 runes, so the established 11×11 interpretation gives an exact boundary after 33 runes. The ordered pair straddling that boundary is:

```text
p32 offsets32/33 = [2,8] = [K,A].
```

This pair was already selected by the boundary33 geometry and independently matches the immediately following p33 upper red-title lengths [2,8].

The same boundary starts a virtual row at offset33 whose first four GP runes transliterate literally to:

```text
HOME = [8,3,19,18].
```

HOME occurs exactly once as a contiguous four-rune sequence on unknown LP2, at this p32 offset.

## Canonical map consumer

Use the source route's already fixed zero-based convention and the ordinary row-major top-left reading of the 11×11 p32 map. The boundary pair itself is then a coordinate:

```text
row = 2
column = 8
offset = 2*11+8 = 30
p32[30] = 0 = F.
```

The one-based identity rival selects value10 rather than zero. No rotation, reflection, or phase is introduced. The zero-based choice is inherited from the authenticated source-word indexing convention that produced the state values 2 and8.

The output is therefore literal zero. Together with the independently selected row-start HOME, the lowest-description navigation reading is **home = page0**. Treat the HOME semantics as supporting evidence; the numeric zero supplies the actual page address.

## Held-out p0 prediction

Before this p32 route existed, p0's two visible red title words had already been tested under the authenticated 2013 DH group p=23, g=5. Their GP-prime sums are:

```text
red word1 length8: 347 mod23 = 2 = 5^2 mod23
red word2 length5: 315 mod23 =16 = 5^8 mod23
```

Thus their discrete-log exponents are exactly:

```text
[2,8].
```

That is the ordered pair predicted by p32 before p0 is consulted.

The p0 red-only DH calculation then gives:

```text
16^2 mod23 = 2^8 mod23 = 3.
```

The shared secret3 also equals the visible red-word length difference 8-5.

## Finite control

The existing canonical p0 DH reproducer parses 2,896 unsolved printed words and charges all 2,895 adjacent pairs. There are exactly **19** adjacent 8|5 pairs. Under the fixed authenticated p=23,g=5 group, only the actual p0 red title has ordered prime-sum residues (2,16), equivalently ordered discrete logs **(2,8)**.

Across all adjacent word pairs of any lengths, eight have residues (2,16), so the discriminating source selection is the visible p0 red 8|5 title after the p32 zero/HOME navigation. No language score or unknown plaintext is involved.

## What this changes

The p0 red-only K=3 route previously had a weak source-to-operand premise: why treat these two red words as DH operands, and why should their shares have these particular logs?

The p32 handoff now independently supplies the exact ordered exponent pair [2,8], navigates numerically to p0, and provides a manuscript-unique HOME checksum. This materially upgrades the red-title DH arithmetic from an isolated retrospective coincidence to a cross-page state handoff.

It does **not** solve the later symmetric-cipher step. Existing direct K=3 GP29 shifts, p56 prime-clock transfer, group-orbit expansion and other bounded consumers remain negative. No first-party source yet specifies the KDF or GP29 serialization from shared secret3.

## Route summary

```text
YOU33
 -> p32 11x11 boundary33
 -> [K,A] = [2,8]
 -> coordinate (2,8) zero-based row-major
 -> F = 0
 -> HOME
 -> p0
 -> red-title DH logs [2,8]
 -> shared secret 3
```

Preserve this as a strong source-constrained navigation/state loop and use it to prioritize finding the author-selected consumer of p0's shared secret3 rather than revisiting arbitrary p0 operand choices.

## Reproduction

`node sims/lp2_p32_home_p0_dh23_handoff_sft.cjs`
