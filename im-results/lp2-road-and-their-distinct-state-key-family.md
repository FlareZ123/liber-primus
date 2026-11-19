# ROAD/DH distinct-field family compresses the AND THEIR inverse keys

**Agent15, 19 November 2026. Classification: post-receiver key-family compression on a prospectively sealed phrase. Agent18 fixed the ROAD dual-radix receiver and the successor targets AND THEIR before opening p0 offsets189..195. This report does not make the key family blind, but it removes the surviving THEIR key ambiguity and sharply narrows AND without choosing field sequences after the fact.**

## Upstream sealed receiver

Agent18's precommit and report establish before receiver values are consumed:

```text
ROAD base29 mod256 = 190
one-based p50 cell = 189 = 3C
base59(3C) = 189 -> p0 word42, length3
base60(3C) = 192 -> p0 word43, length4
next authenticated source words = AND THEIR
GP lengths = 3,4
```

The opened ciphertexts are:

```text
AND receiver   p0 word42 = [0,6,9]
THEIR receiver p0 word43 = [19,12,20,9]
```

The p28 state is fixed independently:

```text
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
```

P28 also supplies two fixed 23-rune lookup lines:

- `HERE`: physical p28 line1, already selected by READ OUT;
- `DH`: physical p28 line6, the literal-DH state line.

For any DH field label `x`, admit exactly three source readings:

```text
direct(x) = x
HERE(x)   = one-based p28 line1[x]
DH(x)     = one-based p28 line6[x]
```

## Broad distinct-field audit

Do **not** preselect the published key field sequences.

For an n-rune receiver:

1. choose every ordered sequence of n **distinct** labels from the seven DH fields;
2. independently read every slot as direct, HERE lookup, or DH lookup;
3. charge both additive signs;
4. compare against the distinct authenticated 2016 source words of the matching GP length.

This gives:

```text
AND, n=3:
7P3 * 3^3 * 2 = 11,340 labeled configurations

THEIR, n=4:
7P4 * 3^4 * 2 = 136,080 labeled configurations
```

### AND

Across all11,340 configurations, there are only **two distinct numeric authenticated-target operations**:

```text
[g,p,b] read [direct,HERE,direct], subtract
key [5,26,15] -> AND

[g,K,p] read [direct,direct,DH], subtract
key [5,2,20] -> ARE
```

The target was prospectively sealed as **AND** from the signed successor phrase before receiver runes were opened. Therefore the broad family leaves exactly one key compatible with the precommitted target:

```text
[5,26,15] = [g,HERE[p],b]
```

### THEIR

Across all136,080 configurations, there is **one distinct numeric authenticated-target operation total**:

```text
[g,p,a,K] read [HERE,direct,HERE,HERE], subtract
key [17,23,10,5] -> THEIR
```

No other signed four-rune word is hit.

This removes Agent18's second source-atom THEIR key

```text
[12,6,19,24] with addition
= [DH[a],a,B,DH[g]]
```

because it reuses the same DH field label `a` twice. The surviving operation uses four distinct state fields and is the only authenticated hit in the complete distinct-field family.

## Independent ROAD geometry cross-link

The distinct-field restriction is additionally aligned with the independently discovered ROAD p50 closure:

```text
cell189 coordinates = (p,g)
token 3C = [e,K*a]
horizontal reflection -> column K
reflected endpoint -> B
literal DH outer-H -> [b,K]
```

Before this report inspected Agent18's key labels, that object already exposed the state fields `p,g,a,K,B,b` through source-visible geometry and the fixed H operation.

The surviving THEIR field sequence is exactly:

```text
[g,p,a,K]
```

and the surviving AND sequence is:

```text
[g,p,b]
```

The lookup masks remain post-receiver discoveries. This report therefore does not claim a fully prospective key generator. It does show that the target-specific source-atom freedom collapses under a simple no-repeated-state-field family that is independently compatible with the ROAD state record.

## Decision

The ROAD dual-radix receiver remains prospectively selected, and **AND THEIR** remains a strong plaintext candidate. The key-assembly gate is materially narrower:

- AND has one exact key within the full distinct-field family once its precommitted target is enforced;
- THEIR has one exact authenticated operation across the entire family, with the previous second numeric key eliminated;
- both exact keys forward-replay the original ciphertexts.

A stronger promotion would still benefit from a source cue that chooses the direct/HERE/DH lookup mask before target feedback, or an untouched receiver on which the same lookup grammar predicts plaintext.

## Reproduction

```text
node sims/lp2_road_and_their_distinct_state_key_sft.cjs
```
