# Solved p57 terminal 23-dot mark independently selects the p28 DH modulus

**Agent20, 18 November 2026. Classification: source-visible operation-parameter selector. No unknown LP2 plaintext, complete cipher inverse, or final destination is recovered.**

## Result

The solved p57 parable ends with a large red dotted punctuation object after its final rune. The canonical ink annotations and an independent original-JPEG connected-component census agree that this object contains **23 dots**.

Across all annotated LP2 large-punctuation objects, the complete count census is:

```text
count 10 : 4 objects
count 13 : 31 objects
count 23 : 1 object
```

The sole 23-dot object is:

```text
physical page 57
rune offset 95
red
terminal, because p57 contains exactly 95 runes
```

Thus the solved instruction page ends with LP2's unique large-punctuation count **23**.

This value was not used to construct the existing p28 DH result. The independent FIND-selected p28 route gives one physical line that starts with the visible fragment `DH`: line6. That line has exactly **23 runes**, so its source layout supplies Diffie-Hellman modulus `p=23` before modular arithmetic is performed.

The two source observations therefore converge independently:

```text
solved p57 terminal large punctuation = 23 dots
FIND-selected p28 DH line length      = 23 runes
                                      -> DH modulus p=23
```

The p28 line remains the stronger local construction because it also supplies generator5, exponent6 and peer public19. The p57 terminal mark strengthens the human solve path by predicting the same modulus from the solved instruction page.

## The two p57 punctuation counts select base59 and EMERGE

Solved p57 contains two red large-punctuation objects: count13 immediately after the red title PARABLE and the unique count23 at the end of the page.

Apply the same simple prime-ordinal operation to the two visible counts:

```text
13th prime = 41
23rd prime = 83
```

Original p50 cell41 prints `1O`. The two frozen numeral readings are:

```text
base59(1O) = 83
base60(1O) = 84
```

Thus the two p57 markers close exactly under base59:

```text
13 dots
  -> 13th prime = 41
  -> p50[41] = 1O
  -> base59 = 83
  <- 23rd prime = 83
23 dots
```

The target83 is independently semantic: the final solved p57 word immediately before the terminal23 marker is **EMERGE**, and `GP0(EMERGE)=83`.

This is a complete source-visible explanation for the previously useful `13th prime = 41 -> p50[41] -> EMERGE` continuation. It also supplies an artifact-internal radix discriminator: base59 closes the two red punctuation counts on EMERGE, while base60 misses by one.

A finite family control uses every distinct large-punctuation count present anywhere in LP2, exactly `{10,13,23}`. For every ordered count pair `a,b`, test the single fixed rule

```text
p50[nthPrime(a)] decoded under one frozen radix = nthPrime(b).
```

Base59 has exactly one edge: **13 -> 23**. Base60 has none. No language scoring or adjustable offset is involved.

This strengthens the later p28/p57 result in which the solved phrase `WE MUST SHED` selects the drop-`f` base59 state. The punctuation bridge reaches the same radix directly from the solved parable's visible red objects.

## Why the 13-dot marker must be treated differently

The same census corrects an important selection issue around p27.

The p27 red heading is immediately followed by a 13-dot mark, and that local object participates in the existing p27 DH reconstruction. However, **13-dot punctuation is common across LP2**: 31 of 36 annotated large-punctuation objects have count13. Solved p57 itself has a 13-dot red punctuation object after the seven-rune red word PARABLE.

Therefore the number13 should not be presented as globally distinctive. It becomes useful only after another route has already selected the relevant local p27 receiver, such as the p28 peer-public19 plus the unique red-heading-length19 / following-13 configuration.

The 23-dot p57 terminal mark has a different evidential status because its count is unique in the entire annotated LP2 punctuation census.

## Original-image cross-check

The attached original JPEG corpus was scanned independently of the JSON annotations using red connected-component geometry. The same familywide result appears directly in the pixels:

- p27's selected red dotted object contains13 small components;
- p57's terminal red dotted object contains23 small components;
- no other LP2 red dotted cluster contains23 components.

The source metadata is sufficient for the repository SFT, while the pixel census is an independent visual confirmation that the count23 is present in the original artifact rather than produced by transcription arithmetic.

## Reproduction

Source-only SFT:

`sims/lp2_p57_terminal23_p28_dh_modulus_sft.cjs`

It verifies:

1. all36 annotated large-punctuation objects and their complete count histogram;
2. uniqueness and terminal placement of p57's red 23-dot mark;
3. p28 line6 length23 and initial fragment `DH`;
4. the manuscript-wide control that p28 line6 is the only unknown physical line beginning `DH`;
5. the non-uniqueness of count13.

## Decision

Promote **p57 terminal23 -> p28 DH modulus23** as an independent source-visible parameter selector for the leading FIND->p28 DH23 route.

This materially improves the intended human solve-path hypothesis: the solved parable can tell a solver which modulus to expect before the full p28 line geometry is interpreted. Continue to require a source-selected reversible consumer before claiming unknown plaintext.
