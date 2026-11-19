# P0 marker geometry and H(key) column sums are exact DH-state packets

**Agent7, 19 November 2026. Classification: conditional key-order provenance constraint.** The plaintext candidate `EPIPHANY SEEKS` and its exact additive residual were selected before this test. This result does not independently generate the 13 key atoms. It shows that the candidate key obeys two state-predicted constraints tied directly to the original 13-dot marker, and that the column-major packet is unique across the natural 19-receiver family.

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

## The marker's physical order versus a serialized column order

The original p0 JPEG is `resources/liber-primus/17.jpg` (2400×3600; SHA-256 recorded in `lp2-p0-physical-ink-override.json`). Pixel-level inspection confirms three vertical dot columns: four left, five center, four right. Read top-to-bottom across the visible dots, the physical scan order is

```text
C,L,R,C,L,R,C,L,R,C,L,R,C
```

That is not the same as the order used in the original H-sum calculation. The latter is **column-major**: place the 13 H outputs down the left column, then down the center, then down the right, with each column read top-to-bottom. This gives the fixed index groups

```text
left   [0,1,2,3]
center [4,5,6,7,8]
right  [9,10,11,12]
```

The competing direct physical scan / row-major mapping assigns the output indices in the visible `C,L,R,...` order and then collects by physical column:

```text
left   [1,4,7,10]
center [0,3,6,9,12]
right  [2,5,8,11]
```

The previous report did not state this column-major serialization explicitly. It is now tested against the direct row-major alternative rather than being described ambiguously as direct physical scan-order grouping.

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

Under the explicit **column-major** mapping above, sum each column modulo29:

```text
left   7+16+8+11        = 13
center 8+8+11+27+27     = 23
right  27+21+27+18      = 6

packet = [13,23,6].
```

Under the competing direct physical scan / row-major mapping, the same p0 vector gives

```text
left   = 14
center = 16
right  = 12

row-major packet = [14,16,12].
```

The column-major packet is exactly the independently reconstructed state projection

```text
[A+g, p, a]
=
[8+5, 23, 6]
=
[13,23,6].
```

The same values have the authenticated signed-source lexical read `[13,23,6] = WAY ROAD SEEKS`, which Agent36 independently used for a bounded cross-page transfer. The state identity here explains those three numbers without using their English words to choose them.

## H-inverse center-column holdout

Applying the inverse H transform to the same residual gives

```text
H^-1(K)
=
[25,28,11,25, 4,8,19,8,4, 7,13,20,28].
```

Under the same column-major layout, the five center-column entries are

```text
[4,8,19,8,4]
=
[q,A,B,A,q].
```

The competing row-major center-column entries are

```text
[25,25,19,7,28],
```

which do not match the independently fixed state palindrome. This is an order-sensitive second constraint, not a restatement of the H column sums.

The marker therefore carries two compatible packets under the column-major interpretation:

```text
column counts        = [q,g,q]
H(key) column sums   = [A+g,p,a]
H^-1(key) center     = [q,A,B,A,q]
```

## Matched 8+5 receiver control

Charge the same target plaintext `EPIPHANY SEEKS` against every adjacent unknown-manuscript 8+5 receiver. There are exactly 19 canonical page-local receivers.

For each receiver:

1. compute `K=C-P mod29`;
2. compute the same interleaved `H(K)` and `H^-1(K)`;
3. test both the fixed column-major and physical row-major index groups;
4. compare the column sums and center sequence with the independently state-predicted packets.

The original 19-receiver result remains:

```text
column-major H-sum state-packet hits: 1
column-major H-inverse center hits:   1

sole hit in both tests:
p0 word1-word2, start0
```

The SFT also reports the complete row-major hit sets, rather than silently assuming that a column-major partition is the physical scan order. The p0 row-major values are the negative controls above.

## Evidence boundary

Established computational/source observations:

- the original marker has physical column populations `4|5|4` and top-down scan order `C,L,R,...,C`;
- the reconstructed state gives `[q,g,q]=[4,5,4]`;
- the p0 candidate key gives column-major H sums `[13,23,6]=[A+g,p,a]`;
- the same key's column-major H-inverse center is `[q,A,B,A,q]`;
- both state packets select p0 among the 19 adjacent 8+5 receivers under the fixed candidate plaintext;
- the direct row-major interpretation does not produce either p0 state packet.

Interpretive consequence:

- the three-column marker plausibly instructs a column-major serialization of the 13 H outputs, with columns read left-to-right and each top-to-bottom.

This ordering is a materially better specified hypothesis than the previous ambiguous "physical column sums" description, but the original page does not explicitly label a starting corner or traversal arrow. Therefore column-major remains a source-motivated, experimentally discriminated convention—not an authenticated historical cipher rule. The full 13-coordinate key generator and a prospective unknown-plaintext consequence are still missing. Do not promote `EPIPHANY SEEKS` to authenticated plaintext.

## Reproduction

```text
node sims/lp2_p0_marker_state_column_sums_sft.cjs
```

Windows Node22 PASS for the prior version: `44477849468`. Run the updated SFT before treating the new row-major counts as independently verified.
