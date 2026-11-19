# P36 GOOD decodes under literal EMPTY-center plus signed direction numbers

**Agent4, 19 November 2026. Classification: strong local plaintext recovery candidate with an explicit reversible source-derived codec.** The previously source-selected p36 GOOD coordinate is canonical word37 at offsets169..173, ciphertext `[2,22,4,1,20]`. Its already-established H5 shell is `[a+g,p-K,q,p,p-1]`, so its literal center is `q=4`. In the authenticated 2016 source, zero-based word4 is **EMPTY**.

Take that label literally and remove the center rune before any language test:

```text
original p36 word37   [2,22,4,1,20]
EMPTY center q=4      remove slot2
four-rune receiver    [2,22,1,20]
```

The authenticated sentence says that "their numbers are the direction." The same signed source has two occurrences of THEIR, at zero-based positions19 and25, followed by NUMBERS=26 and ARE=27. Those four source numbers give the finite key atom set `{19,25,26,27}`.

Because the ordering and additive direction were not precommitted before the receiver was known, charge all **24 permutations × 2 signs = 48** possibilities. Exactly one maps the emptied receiver to any distinct authenticated four-GP-rune source word:

```text
key = [25,19,27,26]
sign = subtraction

[2,22,1,20] - [25,19,27,26] mod29
= [6,3,3,23]
= GOOD.
```

Forward reconstruction is exact:

```text
GOOD [6,3,3,23]
+ key [25,19,27,26]
= [2,22,1,20]

insert q=4 at the center
= [2,22,4,1,20]
= original p36 word37.
```

No rune, word boundary, key atom, sign, or ciphertext offset changes after the hit.

## Complete narrow manuscript control

Under the exact four-atom clue family `{19,25,26,27}`:

```text
318 five-rune words
× 24 permutations
× 2 signs
= 15,264 decoded outputs.
```

Only one output is any of the nine distinct authenticated four-rune source words: p36 word37 -> GOOD.

There are only nine canonical five-rune unknown-page words with center q=4. Restricting to the literal EMPTY-center subset gives `9 × 24 × 2 = 432` decoded outputs and again one hit, p36 -> GOOD.

These are decoded-output family counts. Counting each output against all nine authenticated targets gives 137,376 target comparisons for the manuscript family and 3,888 for the q-center subset.

## Wider clue-family control

The exact authenticated clause is:

```text
their numbers are the direction
```

and the full signed message fixes:

```text
19 THEIR
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION
```

The narrow family takes the plural "their numbers" literally as both THEIR positions together with the literal NUMBERS and ARE positions. The winning order `[25,19,27,26]` was selected by the ciphertext result, so it is not claimed as independently predicted.

A broader adversarial family also admits THE=28 and DIRECTION=29≡0 mod29. Choose every four of these six source numbers, enumerate every ordering and both signs, and apply the same center deletion to every canonical five-rune unknown-page word:

```text
318 × C(6,4) × 24 × 2
= 228,960 decoded outputs.
```

Only three outputs equal any authenticated four-rune source word:

```text
p36 word37 center4 -> GOOD
p28 word4  center9 -> WILL
p18 word13 center0 -> LUCK
```

The p36 hit is the **only** one whose removed center is `q=4=EMPTY`. Restricting the broad family to the nine five-rune words whose literal center is q leaves **6,480 decoded outputs** and only p36 -> GOOD.

## Independent state consistency

The exact winning key has the authenticated-state representation:

```text
[25,19,27,26]
= [p+K, B, -K, p+e].
```

This representation was recognized after the hit and is therefore corroboration, not key provenance.

GOOD itself is also state-shaped in GP29:

```text
GOOD = [6,3,3,23]
     = [a,e,e,-a].

H4(GOOD)
= [12,0,6,0]
= [K*a,0,a,0].
```

Among the distinct authenticated four-rune source words, GOOD is the sole word of exact form `[x,y,y,-x]` with x and y direct DH-state values.

## Relationship to the GOOD LUCK BEWARE corridor

The numbered source route had already selected:

```text
36 GOOD   -> p36
37 LUCK   -> p37
38 BEWARE -> p38
39 FALSE  -> p39
40 PATHS  -> p40
```

Before this result, p36 word37 was a manuscript-unique state packet but GOOD plaintext remained unresolved after a different prospective q-th-section1 receiver failed its length gate. The new operation is distinct: q labels the **center of the already selected word** as EMPTY, so the center is removed rather than used as an ordinal.

P37 already has a strong reversible LUCK candidate and p38 has a strong BEWARE candidate. The new p36 decoder therefore gives a three-page run of strong local candidates `p36 GOOD / p37 LUCK / p38 BEWARE`, with p39's dominant red X still providing the independent visual FALSE warning.

## Evidence boundary

This is stronger than a free known-plaintext fit because the receiver was fixed independently, its center was already q=EMPTY, the key atoms come from the exact authenticated direction sentence, every ordering and both signs are charged, the same family is exhausted over every canonical five-rune word, and exact forward reconstruction restores all five original runes.

The main remaining caveat is chronology. The four-number atom set was recognized after the GOOD coordinate and source-assigned target were known, and the winning ordering was selected inside a finite family rather than predicted blind. Preserve **GOOD** as a strong local plaintext recovery candidate and preserve this center-removal plus source-number packet as a concrete reversible mechanism worth testing prospectively when another source-selected five-to-four receiver appears. Do not generalize the exact key to neighboring pages without a new source-visible selector.

## Reproduction

`node sims/lp2_p36_good_empty_direction_sft.cjs`
