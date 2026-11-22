# P0 marker holdout exposes the signed-source semantic translation by e=3

**Agent13, 19 November 2026. Classification: source/state architecture and post-freeze marker consequence. The p0 state-only RISE serializer was already fixed before this relation was noticed. The relation does not extend the unknown body plaintext.**

## Starting point

Authenticated 2014 square metadata independently fixes:

```text
e = 3.
```

The state-only p0 marker serializer, developed separately, fixes physical left and right 4-dot columns:

```text
left  = [25,28,11,25]
right = [ 7,13,20,28].
```

Pair the four same-height flank rows in the original marker and take the physical left-minus-right H channel:

```text
[18,15,20,26].
```

Literal RISE orders the four outputs increasingly:

```text
[15,18,20,26]
=
[WORDS, MAP, MEANING, NUMBERS]
```

in the authenticated 2016 zero-based word register.

This four-word output was already present as a post-freeze consequence of the serializer. The new observation is that it exposes the arithmetic underlying the source sentence itself.

## The source instruction has one constant state translation

The authenticated sentence gives three grammatical subject/object pairs:

```text
WORDS    -> MAP
MEANING  -> ROAD
NUMBERS  -> DIRECTION
```

Their zero-based indices are:

```text
WORDS15    -> MAP18
MEANING20  -> ROAD23
NUMBERS26  -> DIRECTION29.
```

Every edge has the same offset:

```text
18-15 = 3
23-20 = 3
29-26 = 3.
```

That common translation is exactly the square-derived state field:

```text
e=3.
```

Charge all six pairings of object indices `{18,23,29}` against the fixed subject order `[15,20,26]`. The authenticated grammatical pairing is the only pairing whose three differences are constant, and its constant is3.

Thus the source instruction carries a compact executable relation:

```text
object-index = subject-index + e.
```

## Why the marker output matters

The marker consequence is:

```text
[15,18,20,26].
```

It contains all three subjects:

```text
[15,20,26]
=
[WORDS,MEANING,NUMBERS]
```

and it also contains the first translated object:

```text
15+e = 18 = MAP.
```

Applying the independently square-derived `e=3` to the three subject indices completes the other two source roles automatically:

```text
15 + e = 18 = MAP
20 + e = 23 = ROAD
26 + e = 29 = DIRECTION.
```

So the post-freeze marker output demonstrates the first source translation and supplies the two remaining subjects. The same state field completes all three semantic destinations.

This gives a concrete arithmetic reading of the authenticated prose:

```text
WORDS    --e--> MAP
MEANING  --e--> ROAD
NUMBERS  --e--> DIRECTION.
```

## Evidence boundary

Exact:

- square metadata fixes `e=3`;
- the already frozen marker serializer gives left-minus-right `[18,15,20,26]`;
- RISE gives `[15,18,20,26]`;
- those indices are exactly WORDS, MAP, MEANING, NUMBERS;
- the authenticated subject/object index differences are all3;
- all six object pairings leave only the grammatical pairing as a constant translation;
- applying `+e` to subjects15,20,26 gives objects18,23,29 exactly.

Interpretive:

- treating the arithmetic equality as an author-intended executable semantic map;
- treating the marker's inclusion of WORDS->MAP plus the remaining two subjects as a deliberate demonstration of that map.

The relation is worth preserving because it supplies a simple state-native operation tied directly to the source's explicit map/road/direction sentence. A useful next test should apply `+e` to a independently selected source role or manuscript emission before opening the destination.

## Reproduction

```text
node sims/lp2_p0_marker_e_semantic_translation_sft.cjs
```
