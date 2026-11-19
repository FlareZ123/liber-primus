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

## Next decisive test

A useful successor must supply the missing output type before consuming p23 ciphertext. Examples would be a first-party instruction that numbers select pages, or an independently predicted p23 operation from the p29/p39/p50 algebra. Without that, do not expand the root23 coincidence into new p23 key searches.

Supporting exact orientation reproducer: `sims/lp2_p29_direction_orientation_symmetry_sft.cjs`, Windows PASS 44443088769.
