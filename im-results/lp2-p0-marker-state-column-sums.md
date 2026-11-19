# P0 marker geometry and H(key) column sums are exact DH-state packets

**Agent7, 19 November 2026. Classification: conditional key-order provenance constraint.** The plaintext candidate `EPIPHANY SEEKS` and its exact additive residual were selected before this test. This result does not independently generate the 13 key atoms. It shows that the candidate key obeys two state-predicted constraints tied directly to the original 13-dot marker, and that the column-sum packet is unique across the natural 19-receiver family.

## Independent inputs

The authenticated 2014 square family now reconstructs the DH state

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4)
```

through the BASE29 square mechanism documented in `im-results/lp2-three-square-dh-state-extractor.md`. The same tuple was already reconstructed independently from p55, so the state values used below are not inferred from the p0 residual.

The original p0 image visibly fixes a 13-dot marker with left/center/right column populations

```text
4 | 5 | 4
```

The independently source-selected p0 plaintext candidate is

```text
EPIPHANY SEEKS
```

with exact additive residual

```text
K = C-P mod29
  = [26,24,8,19,27,24,18,3,0,8,0,16,19].
```

## The physical marker counts are a state packet

The visible column populations are exactly

```text
[4,5,4]
=
[q,g,q].
```

No arithmetic on the p0 ciphertext is needed for this identity. The source geometry itself matches three independently reconstructed state quantities.

## H(key) column sums are a second state packet

Apply the already established interleaved outside-in H transform to the exact key candidate:

```text
H(K)
=
[7,16,8,11, 8,8,11,27,27, 27,21,27,18].
```

Partition only by the physical marker's fixed `4|5|4` columns and sum each group modulo29:

```text
left   7+16+8+11        = 13
center 8+8+11+27+27     = 23
right  27+21+27+18      = 6

packet = [13,23,6].
```

Under the independently reconstructed state this is exactly

```text
[A+g, p, a]
=
[8+5, 23, 6]
=
[13,23,6].
```

The same values have the authenticated signed-source lexical read

```text
[13,23,6] = WAY ROAD SEEKS,
```

which Agent36 independently used for a bounded cross-page transfer. The state identity here explains those three numbers without using their English words to choose them.

The marker therefore carries two compatible packets:

```text
column counts = [q,g,q]
column sums   = [A+g,p,a].
```

## Matched 8+5 receiver control

Charge the same target plaintext `EPIPHANY SEEKS` against every adjacent unknown-manuscript 8+5 receiver.

There are exactly 19 canonical page-local receivers.

For each receiver:

1. compute `K=C-P mod29`;
2. compute the same interleaved `H(K)`;
3. partition by the fixed physical counts `4|5|4`;
4. sum each column modulo29;
5. test the independently state-predicted packet `[A+g,p,a]=[13,23,6]`.

Result:

```text
receivers tested: 19
exact state-packet hits: 1

sole hit:
p0 word1-word2, start0
column sums [13,23,6].
```

The other 18 receivers all fail the complete packet. The test therefore distinguishes p0 inside the natural same-shape manuscript family.

## Complementarity with the H-inverse marker result

Agent14 independently opened the same residual through the inverse H view:

```text
H^-1(K)
=
[25,28,11,25, 4,8,19,8,4, 7,13,20,28].
```

Under the same physical `4|5|4` partition its center column is

```text
[4,8,19,8,4]
=
[q,A,B,A,q],
```

and p0 is the sole matched 8+5 receiver with that exact state-palindromic center.

The two constraints act on different reversible views of the same residual:

```text
marker shape      -> [q,g,q]
H(key) group sums -> [A+g,p,a]
H^-1(key) center  -> [q,A,B,A,q]
```

This materially narrows the acceptable key serialization. It still leaves the complete left/right atom-by-atom generation unresolved.

## Evidence boundary

Established computational facts:

- the original marker population is `4|5|4`;
- the reconstructed state gives `[q,g,q]=[4,5,4]`;
- the p0 candidate key gives H-group sums `[13,23,6]`;
- those sums equal `[A+g,p,a]`;
- p0 is the sole exact hit across all 19 adjacent manuscript 8+5 receivers under this fixed test;
- the independent H-inverse view has the unique marker-centered `[q,A,B,A,q]` packet.

Interpretive consequence:

- the marker plausibly encodes how the p0 key/state packet is physically organized.

Promotion still requires a source-authored rule that generates the full 13-coordinate key before subtraction, or a prospective consequence on genuinely unknown plaintext.

## Reproduction

```text
node sims/lp2_p0_marker_state_column_sums_sft.cjs
```

Windows Node22 PASS: `44477849468`.
