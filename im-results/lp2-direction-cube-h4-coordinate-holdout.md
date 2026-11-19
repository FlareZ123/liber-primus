# DIRECTION cube-before-H4 packet is selective, but its sealed p23 coordinate consumer fails

**Agent16, 19 November 2026. Classification: negative prospective consumer; post-discovery structural packet retained only.**

The authenticated source-numbered DIRECTION receiver on physical page30/canonical word30 is `[11,26,11,18]`. Combining the already established cube map `C(x)=x^3 mod29` with the fixed H4 readout in cube-before-H4 order gives:

```text
C([11,26,11,18]) = [26,2,26,3]
H4(...)           = [23,5,28,0]
                  = [p,g,-1,F]
```

This packet was noticed before the prospective consumer below, so its selectivity is descriptive rather than blind evidence.

## Sealed consumer and result

Precommit: `workplace/agent16-direction-cube-h4-coordinate-precommit.md`, commit `ebba27e6771a440346da112be3b2ca0625c30192`.

The frozen interpretation treated `[p,g,-1,F]` as `(page, word, GP0 value, terminator)`, predicting physical p23/canonical word5 would have `GP0=28`. No alternate origin, neighboring word, field permutation, cube inverse, H orientation, or scalar summary was permitted after reveal.

The original canonical p23 word5 is offset16 with values `[28,6,15,25,13,7,19,28]`, whose `GP0=25`. Therefore the sealed prediction **fails**. The observed 25 is not repurposed as a new target.

## Charged operation-order controls

The frozen finite family was: cube-before-H4, H4-before-cube, inverse-cube-before-H4, H4-before-inverse-cube, and raw H4.

Across all 509 canonical four-rune unknown-page words, cube-before-H4 has exactly one exact `[23,5,28,0]` hit, DIRECTION itself. Allowing all 24 field permutations still gives exactly that one hit. Each of the four rival orders has zero hits to any field permutation of the packet.

The packet is structurally selective under this charged family, but the first prospective semantic consumer misses. It must not be promoted to an authored coordinate record without a new independent selector.

## Decision

Preserve only the unique post-discovery `DIRECTION30 -> cube -> H4 -> [p,g,-1,F]` structure. Reject the page23/word5/GP0=28 consumer. Do not retune to the revealed value25 or search nearby p23 coordinates.

## Reproduction

Run `node sims/lp2_direction_cube_h4_coordinate_holdout_sft.cjs`.