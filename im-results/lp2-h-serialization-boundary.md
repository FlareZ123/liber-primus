# H serialization boundary: pair-interleaved and split outputs are distinct operations

**Agent2, 19 November 2026. Classification: repository-wide operation-boundary correction. Pair arithmetic is preserved; ordered H readouts of length three or greater are convention-sensitive.**

## Decision

The repository currently uses two different ordered serializations of the same outside-in H pair arithmetic:

```text
Hpair
  each outside-in pair emits [difference,sum]
  odd center is appended last

Hsplit
  emit all outside-in differences
  then the odd center
  then sums in inside-out order.
```

For a pair `(x,y)`, both use:

```text
difference = x-y mod29
sum        = x+y mod29.
```

Therefore they preserve the same multiset of pair outputs. They are different ordered transforms from length three onward except when values happen to coincide.

Future evidence must name which serialization supplies an ordered H readout. A route cannot use Hpair ordering at one step and Hsplit ordering at another while treating both as one fixed transform.

Windows reproduction: **PASS 44472966062**.

## Canonical examples

### DIRECTION30

The numbered route fixes:

```text
p29 word30
[11,26,11,18].
```

Pair-interleaved H gives:

```text
Hpair
H(11,18) -> [22,0]
H(26,11) -> [15,8]

=> [22,0,15,8]
=> [p-1,F,b,A].
```

Split H gives:

```text
Hsplit
=> [22,15,8,0]
=> [p-1,b,A,F].
```

The same four values survive, while their positions differ. Any claim that position2 is literal F is Hpair-specific.

### OPENPGP43

The authenticated numbered receiver is:

```text
p42 word43
[16,0,14].
```

The two outputs are:

```text
Hpair  -> [2,1,0] -> PATH / THE / HELLO
Hsplit -> [2,0,1] -> PATH / HELLO / THE.
```

The published restart reading `[2,1,0]`, reversed to `HELLO THE PATH`, therefore depends on Hpair.

### P31 AND key

The established p31 subtraction key is:

```text
[17,14,7].
```

Its two serializations are:

```text
Hpair  -> [10,24,14] -> [-B,-g,-b]
Hsplit -> [10,14,24] -> [-B,-b,-g].
```

The published ordered state shell `[-B,-b,-g]` is Hsplit-specific.

### Two-rune H

For a two-rune input the serializations coincide because there is only one pair:

```text
p24 [27,15]
Hpair  -> [12,13]
Hsplit -> [12,13].
```

Existing two-rune H results therefore do not acquire a serialization ambiguity.

## Manuscript-wide equality census

Across the current canonical complete-word corpus:

| length | complete words | Hpair == Hsplit exactly |
| ---: | ---: | ---: |
| 1 | 83 | 83 |
| 2 | 448 | 448 |
| 3 | 716 | 24 |
| 4 | 509 | 0 |
| 5 | 311 | 0 |
| 6 | 251 | 0 |
| 7 | 213 | 0 |
| 8 | 155 | 0 |
| 9 | 76 | 0 |
| 10 | 49 | 0 |
| 11 | 28 | 0 |
| 12 | 18 | 0 |
| 13 | 4 | 0 |
| 14 | 3 | 0 |

The two outputs are always permutations of the same H pair values. Sequence equality becomes exceptional at length3 and disappears in this corpus from length4 onward.

## OPENPGP restart family when both live serializations are charged

The published complete-corpus control scans all 716 canonical three-rune words for a strict descending authenticated-source run:

```text
[k+2,k+1,k].
```

Under Hpair there is exactly one hit:

```text
p42 word43 start206
OPENPGP43
Hpair -> [2,1,0]
        PATH THE HELLO.
```

Under Hsplit there is also exactly one hit, at a different manuscript object:

```text
p26 word13 start60
Hsplit -> [16,15,14]
          ARE WORDS ITS.
```

Thus OPENPGP43 remains the sole descending-source run within the pair-interleaved numbered-route convention. It is not the sole such run after the repository's second live H serialization is admitted to the operation family.

The OPENPGP receiver remains source-selected by authenticated ordinal43. Its exact Hpair output remains reproducible. The stronger statement that the manuscript contains one descending H restart independent of serialization is unsupported.

## Evidence boundary

Preserve without change:

- the pair arithmetic `(x-y,x+y) mod29`;
- all two-rune H claims;
- order-independent multiset/state-membership claims where the proof genuinely ignores positions;
- DIRECTION30's exact raw receiver and four H pair values;
- OPENPGP43's exact raw receiver and Hpair output;
- p31's exact subtraction key and its Hsplit output.

Require explicit serialization for:

- ordered state-role packets from three or more runes;
- authenticated-source index phrases produced from H output order;
- key schedules that assign named roles by H coordinate;
- cross-route arguments claiming that two longer objects use “the same H shell.”

Do not combine Hpair uniqueness controls with Hsplit state ordering as if they were evidence for one frozen serializer.

## Reproduction

```text
node sims/lp2_h_serialization_boundary_sft.cjs
```

The SFT reconstructs all 2,864 complete page-local words plus the 32 crossing words, verifies the DIRECTION30, OPENPGP43, p31 AND-key and p24 two-rune examples, proves Hpair/Hsplit multiset equivalence on every complete word, tabulates exact sequence equality by length, and charges both live serializations across all 716 three-rune words for the descending-source restart predicate.
