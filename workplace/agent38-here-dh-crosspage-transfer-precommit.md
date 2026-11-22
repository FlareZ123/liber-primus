# Agent38 precommit: Director #1742 cross-page HERE/DH lookup transfer

Date: 2026-11-19
Run: agent38-gpt5.6sol-20261119T015717Z-draw8-73bb85c8419d

## Fixed source objects

Use only the already reconstructed p28 state and the already selected p28 source lines:

```text
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
HERE = physical p28 line1
DH   = physical p28 line6
```

All state-index lookups are one-based, matching the committed candidate reports.

## Already committed candidate descriptors

No new target labels are introduced.

1. p0 AND:
   - receiver start189, length3
   - target AND
   - descriptor fields [g,p,b]
   - source kinds [direct,HERE,direct]
   - subtract

2. p0 THEIR:
   - receiver start192, length4
   - target THEIR
   - descriptor fields [g,p,a,K]
   - source kinds [HERE,direct,HERE,HERE]
   - subtract

3. p2 GOOD:
   - receiver p2 word9, start36, length4
   - target GOOD
   - descriptor fields [g,B,K,b]
   - source kinds [DH,DH,HERE,DH]
   - subtract

4. p38 FOUND:
   - receiver p38 word10, start49, length5
   - target FOUND
   - descriptor fields [a,b,A,a,p]
   - source kinds [HERE,HERE,DH,DH,DH]
   - add
   - the A slot has the published K alias because DH[A]=DH[K]=8; use A canonically.

These are the exact smallest published descriptor rows, not the broad post-target families.

## Cross-page transfer matrix

For equal-length candidates, apply each complete descriptor unchanged to every other candidate receiver of that length:

- p0 THEIR descriptor -> p2 GOOD receiver;
- p2 GOOD descriptor -> p0 THEIR receiver.

Success means exact recovery of the receiver's already committed target. Do not change sign, field order, source kind, origin, or H layer.

Apply each fixed descriptor to every complete word of the same length on p0, p2, p38 and to the full unknown manuscript. Record authenticated 2016 target hits as specificity controls.

## Chronology-blind five-rune transfer

Use the independently committed WILL -> BE -> FOUND navigation receiver:

```text
p0 offsets117..121, length5, target label FOUND
```

The Agent13 report states that this receiver and its FOUND label were selected from source navigation before its five ciphertext values were consumed, and explicitly withheld any plaintext claim.

Apply the already prospectively frozen p38 FOUND descriptor unchanged:

```text
[HERE[a],HERE[b],DH[A],DH[a],DH[p]], add
```

Success requires exact canonical FOUND and exact forward replay.

As a stronger family gate, charge the complete per-slot source vocabulary actually used across p0/p2/p38 candidates:

```text
direct(field), HERE(field), DH(field)
for field in [p,g,a,b,A,B,K]
```

with one-based lookups and both additive signs. For the p0 FOUND receiver, determine whether any such five-slot operation can yield FOUND. This is a necessary transfer test for the union grammar; no descriptor may be chosen after seeing the required difference.

## Decision

- If a fixed descriptor transfers across independent candidates and the p0 FOUND chronology-blind receiver succeeds, retain HERE/DH lookup as a reusable cipher candidate.
- If the exact descriptors are page-specific and the p0 FOUND receiver is impossible even in the full direct/HERE/DH slot vocabulary, retire HERE/DH state lookup as a general decoder. Preserve only local relations whose own receiver chronology remains independently motivated.

No source-line expansion, zero-based lookup, constants, H layer, token arithmetic, sign rescue, or new plaintext target may be added after this precommit.
