# Reciprocal-root orientation has a source-visible p23/p24 asymmetry

**Agent14, 19 November 2026. Classification: conditional orientation clue, not an authenticated page-pointer operation.**

The p28 `THE -> DIRECTION -> p29` route now selects project p29 before the p39/p50 repeated-root test. The exact coefficient-direction audit then leaves two mathematically equivalent orientations:

```text
forward p29 + forward p50 + reversed p39 triad -> repeated root 24
reversed p29 + reversed p50 + printed p39 triad -> repeated root 23
```

with `24*23 = 1 mod29`.

Before opening the candidate destination pages, the discriminating prediction was frozen as follows: **if the repeated root is meant to be consumed as the next page number under the signed word DIRECTION, one of roots 23/24 should select a visibly privileged source object rather than an ordinary continuation page.**

## Source result

That conditional prediction is satisfied only by the reverse/root23 branch.

- **p23** begins with a red 16-rune rubric at rune offset0 and a red large punctuation mark at offset16.
- **p24** has no red-start annotation and is an ordinary continuation inside the same p23–p26 visual chapter.
- The original-image five-disc census independently established that the distinctive five-dot emblem occurs on exactly physical LP2 p7, p23 and solved p56 among the 75 distributed scans. P23 is therefore one of only two unknown pages carrying that exact emblem, and the p7/p23 copies are vertically reflected with near-pixel identity.
- P23 is also a visual chapter boundary; p24 is not.

Existing source files make the red-boundary distinction exact:

```text
p23 red span: start 0, length 16
p24 red-start span: none
```

The exact original-image five-dot bridge is already reproduced by `sims/lp2_five_dot_mirror_source_sft.py` and documented in `im-results/lp2-mirrored-five-dot-original-page-bridge.md`.

## Interpretation

This creates a coherent **conditional** route:

```text
p28 local THE
-> authenticated DIRECTION selects p29
-> p29/p50/p39 repeated-root gate
-> choose the orientation whose numeric root points to a privileged page
-> reverse orientation / root23
-> p23 red chapter boundary + exact five-dot bridge
```

The route is interesting because the selected branch is also the one that uses reversed p29/p50 coefficient order, while p23's five-dot artwork participates in an authenticated reflection/rotation family with p7 and solved p56.

The missing step remains explicit: **no first-party source currently says that a polynomial root is a manuscript page number.** Therefore this observation must not be used to promote reverse coefficient order, p23, or any p23 plaintext as established. It is a source-visible discriminator to test if a future clue independently licenses root-as-page navigation.

The older p23 five-dot work also matters as a negative control. It found no standalone value-changing cipher from the emblem, and a fixed music-symmetry transfer of the solved p56 prime-totient operation to p23 already failed. Selecting p23 does not revive those exhausted decoders.

## Later source-selector update: root24 wins the coefficient-direction fork

P33 now independently yields hidden `THEIR RISE`. Consuming `RISE` as a coefficient-direction instruction on the printed p39 triad `[27,5,15]` means powers rise left-to-right:

```text
27 + 5X + 15X^2 = 15(X-24)^2 mod29.
```

The opposite direction, `27X^2+5X+15`, has double root23. A dedicated exact-source SFT then recomputes the p29/p50 orientation family: root24 is the printed/high-first event with the unique consecutive Taylor packet `[24,25,26,27]`; root23 is the reversed event with nonconsecutive packet `[23,47,15,10]`.

Under the current source chain this resolves the orientation in favor of **root24** before any root-as-page interpretation. The earlier p23 visual asymmetry remains a documented retrospective coincidence/control. Retire root23 -> p23 navigation unless a later first-party clue explicitly licenses root-as-page output and overrides the rising-power direction.

See `lp2-their-rise-polynomial-orientation.md`, Windows PASS 44457869317.

## Next decisive test

The current source-selected orientation is root24, so the root23 page-pointer branch is inactive. Do not consume p23 ciphertext from this branch unless new independent source evidence explicitly restores root23 and supplies a page-pointer output type.

Supporting exact orientation reproducer: `sims/lp2_p29_direction_orientation_symmetry_sft.cjs`, Windows PASS 44443088769.
