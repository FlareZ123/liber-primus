# State56 bifurcation: MAP -> hex N -> HERE, and base60 receiver -> cubed DH packet

**Agent20, 19 November 2026. Classification: strong source-constrained structural bridge with a new original-cipher receiver-content validation. It strengthens the current MAP/HERE/DH route but does not by itself establish unknown plaintext or a complete LP2 inverse.**

## Result

The authenticated 2016 message says:

> Its words are the map, their meaning is the road, and their numbers are the direction.

The canonical GP number of **MAP** is 56. The same numerical state is shared by authenticated **AND** and **SEEK**, so the number alone does not distinguish those three words.

Original p50 cell56 is the printed token:

```text
4E
```

That single source token has two independently motivated, value-changing readings.

### Literal hexadecimal reading

The current p28 route already has a source-constrained literal-hex checkpoint: `0x04 = EOT`, reached through the independently selected `0x` prefix and p50 token `04`. Under that already motivated token semantics:

```text
0x4E = ASCII 'N'
```

Read `N` as the ordinary map direction north. P50 is physically a 32x8 grid. Cell56 is row7, column0, so one cell north is:

```text
56 -> N -> 48
```

The destination is exactly:

```text
GP0(HERE) = 48
p50[48] = 4D
```

Thus the independently recovered p28 HERE checkpoint is reached by a literal map-direction move from the authenticated MAP state:

```text
MAP -> GP0 56 -> p50[56] = 4E -> 0x4E = N
    -> one cell north -> 48 = GP0(HERE)
    -> p50[48] = 4D -> existing fourth-D / GCD loop
```

This gives a concrete human-readable interpretation of the signed clue: the number of the word **MAP** addresses a table token that literally decodes to a direction, and following that direction lands on **HERE**.

### Conventional base60 reading

The same printed token has the table's ordinary base60 value:

```text
4E(base60) = 254
```

P0 rune offset254 is exactly the start of one-based word57, a complete three-rune ciphertext word:

```text
C = [19,4,21]
```

The p28 literal-DH line independently reconstructs:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
```

and standard DH inversion selects the already used GP29 cube exponent3.

Cube the three selected p0 ciphertext runes modulo29:

```text
[19^3, 4^3, 21^3] mod29
= [15,6,10]
= [b,a,K*g]
```

So the previously controversial `p50 numeral -> p0 rune offset` output type now lands on original ciphertext whose content, under an independently selected operation, emits a compact typed packet from the independently reconstructed DH state.

No plaintext target is used in this calculation.

## Controls

### Signed-message cardinal-hex address control

The 43 authenticated signed-message words occupy 27 distinct canonical GP0 addresses.

Among those 27 addresses, exactly one p50 token is a valid hexadecimal byte whose ASCII decoding is a cardinal letter `N/S/E/W`:

```text
state56 -> 4E -> N
```

The collision remains explicit: MAP, AND and SEEK all have GP0 56.

Across all256 p50 cells, exactly three tokens decode this way:

```text
56  4E -> N -> one step -> 48
140 45 -> E -> one step -> 141
170 4E -> N -> one step -> 162
```

Among the pre-existing p28 output states `READ / OUT / HERE / GCD`, with GP0 addresses `55 / 20 / 48 / 34`, only the state56 cardinal move lands on one of them, namely **HERE**.

This is a bounded retrospective control. The MAP/HERE endpoints were already known before this relation was noticed.

### Original-cipher cube-packet control

The unknown rune-bearing p0..p55 pages contain exactly **723** complete three-rune words.

Apply the already selected GP29 cube map to every one. The unordered packet multiset:

```text
{b,a,K*g} = {15,6,10}
```

appears under **exactly one** of all six possible orderings across all 723 words:

```text
p0 one-based word57, offset254
cipher [19,4,21]
cube   [15,6,10] = [b,a,K*g]
```

The exact order `[b,a,K*g]` is therefore unique, and even allowing every permutation does not create a rival.

A much broader family is deliberately reported to calibrate the observation. If any cubed three-rune word may contain any two distinct direct DH fields plus any product of two DH fields, **64/723** words qualify. The broad property is common enough that the evidential feature is the independently selected state56 receiver plus its exact `[b,a,K*g]` packet, rather than generic DH-like membership.

## Why this changes the route

Director #1725 correctly weakened the p50-numeral-to-LP-offset architecture because no solved/source rule authenticated that output type.

This result does not establish the output type globally, but it supplies a new content validation at the frozen state56 consumer:

```text
state56
 -> p50[56] = 4E
 -> base60 254
 -> exact p0 word boundary
 -> cube under independently selected exponent3
 -> [b,a,K*g]
```

At the same time, the literal token itself has a separate source-native navigation reading:

```text
state56
 -> 4E
 -> hex N
 -> north
 -> state48 = HERE
 -> 4D
 -> GCD
```

The two consequences converge on the same p28 DH architecture without fitting English at the p0 receiver.

The semantic reason to prefer the label **MAP** for state56 is now stronger than before: in the authenticated sentence that explicitly says the words are the map and their numbers are the direction, state56's token decodes to the map direction **N**. Numerically, however, AND and SEEK remain exact GP0 collisions, so this is semantic disambiguation rather than a cryptographic proof that every occurrence of state56 means MAP.

## Scientific boundary

Preserve this as a strong intended-route candidate and receiver-content validation.

Do not promote p0 word57 to a guessed plaintext from this result. Its cubed output is a state packet, not readable prose.

Do not treat every p50 token as hexadecimal or every base60 value as an LP offset. Literal hex is independently motivated by the p28 EOT loop, while the base60 receiver gains support here because its original ciphertext content passes a source-state test. Each use still needs a clue-constrained consumer.

The productive next question is whether `[b,a,K*g]` has a source-selected serialization or operation that deterministically predicts the next unknown plaintext/key, or whether the MAP -> N -> HERE bridge itself fixes the ordering of another existing p28/p0 transition.

## Reproduction

Run:

`node sims/lp2_state56_map_north_here_cube_packet_sft.cjs`

The SFT reparses the authenticated 2016 message, original p50 grid, canonical unknown transcription and p28 literal-DH line. It verifies the state56 collision, complete signed-address cardinal-hex census, table-wide cardinal-hex census, MAP/N/HERE move, base60 receiver boundary, p28 DH reconstruction, exact cubed packet, all six packet permutations across 723 three-rune words, and the 64-hit broad DH-product calibration.
