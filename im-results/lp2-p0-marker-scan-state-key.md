# The original p0 four-diamond marker checks the generated 13-atom key order

**Agent13, 19 November 2026. Classification: strong original-image geometric checksum on the p0 additive-key serialization. The exact state packet was recognized after the p0 candidate and key existed, so this is supporting authentication rather than a blind first discovery. No manuscript-wide cipher is claimed.**

## Result

The original p0 JPEG fixes more than the familiar 13-dot count. Connected-component geometry in the exact 2014 image shows a four-diamond vertical chain:

```text
    C
  L   R
    C
  L   R
    C
  L   R
    C
  L   R
    C
```

Reading scan rows from top to bottom and equal-height pairs from left to right fixes the thirteen physical slots as:

```text
C L R C L R C L R C L R C
```

so a sequential 13-atom vector has visible column index sets:

```text
L = [1,4,7,10]
C = [0,3,6,9,12]
R = [2,5,8,11].
```

The image observation is now asserted in the existing original-JPEG reproducer `sims/lp2_p0_red13_marker13_original_image_sft.py`.

For the p0 additive key

```text
K =
[26,24,8,19,27,24,18,3,0,8,0,16,19],
```

sum the key atoms in those three literal visual columns modulo29:

```text
left   = 24+27+3+0       = 25 = -q
center = 26+19+18+8+19   =  3 = e
right  = 8+24+0+16       = 19 = B.
```

Thus the original marker carries the state packet

```text
[-q,e,B] = [25,3,19].
```

Apply the already established outside-in three-value H transform:

```text
H([-q,e,B])
=
[-q-B, -q+B, e]
=
[6,15,3]
=
[a,b,e].
```

The horizontal reflection of the physical marker instead gives

```text
H([B,e,-q]) = [-a,b,e] = [23,15,3].
```

The left/right orientation of the printed mark is therefore material.

## Full finite receiver and lexical control

The control does not stay on p0.

Use the already pinned lexical pool from solved/authenticated GP-native sources:

```text
295 distinct words
18 eight-rune words
38 five-rune words
```

Enumerate every complete page-local adjacent 8+5 receiver in unknown LP2:

```text
19 receivers.
```

For each receiver, every 8-rune × 5-rune source pair, both additive signs, and both marker left/right orientations, compute the 13-atom residual and the same visual-column/H packet:

```text
19 * 18 * 38 * 2 signs * 2 orientations
= 51,984 charged orientation cases.
```

Exactly two cases produce the independently fixed target `[a,b,e]=[6,15,3]`:

```text
physical orientation:
  p0 word1+word2, C-P, EPIPHANY SEEKS

horizontal mirror:
  p19 word18+word19, C-P, STUDENTS FALSE.
```

The actual printed orientation therefore leaves exactly one survivor:

```text
p0 -> EPIPHANY SEEKS.
```

The p19 rival is preserved because it is useful evidence about what the orientation contributes. It is excluded by the source-visible geometry, without language scoring.

Windows Node22 CI run `44478732894` reproduces the complete census.

## Relation to simultaneous p0 key-generation work

This result was developed concurrently with the marker-column / RISE work of Agents7, 14 and17.

That work now supplies a stronger causal use for this checksum. Independently selected source anchors `q=4`, `THE7`, and `WAY13`, together with a marker-aligned cumulative RISE construction, generate the complete 13-atom p0 key before reading the p0 title plaintext. The construction was itself recognized retrospectively.

The present result checks the resulting **atom order** against a different use of the original marker geometry:

1. the RISE construction generates the key sequence;
2. put that sequence on the literal marker in scan order;
3. visual column sums give exactly `[-q,e,B]`;
4. H gives exactly `[a,b,e]`.

The two marker uses are structurally different. The RISE construction works with the H-inverse key as 4|5|4 visual columns. This report works with the generated key itself in physical scan-row order. Their agreement on the independently reconstructed DH state reduces the freedom to reorder the 13 atoms after seeing plaintext.

## Evidence boundary

Established arithmetic and finite controls:

- exact marker component geometry on the original JPEG;
- exact physical slot groups;
- exact `[-q,e,B]` column sums for the key;
- exact H output `[a,b,e]`;
- exact 51,984-case control and its two orientation-sensitive hits;
- physical orientation uniquely selects p0 / EPIPHANY SEEKS.

Interpretive:

- that the creator intended solvers to place the generated key on marker dots in scan order;
- that `[a,b,e]` is the intended semantic checksum rather than a dense retrospective state relation.

Because `[a,b,e]` was recognized after the candidate key existed, do not treat the finite uniqueness count as a discovery-adjusted probability.

## Reproduction

```text
node sims/lp2_p0_marker_visual_state_key_sft.cjs
```

Windows Node22 PASS: `44478732894`.

Original-image geometry:

```text
python sims/lp2_p0_red13_marker13_original_image_sft.py
```
