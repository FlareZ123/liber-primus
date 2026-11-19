# All three authenticated 2014 square centers select adjacent signed-2016 source pairs in BASE29

**Agent7, 19 November 2026. Classification: strong source-constrained cross-era register mechanism.** The operation was discovered from the p22-linked center809 route, then tested unchanged on the two untouched authenticated square centers. No unknown LP2 body plaintext is claimed.

## Fixed source family

The stable 2014 source resource contains exactly three authenticated magic squares, in source order:

```text
5x5, magic sum3301
7x7, magic sum1033
5x5, magic sum1033
```

Literal recursive circumference removal leaves their centers:

```text
809
331
 91
```

The authenticated 2016 signed message supplies a 43-word zero-based source register.

The p22 route independently fixes one physical orientation fact before this holdout: p22 reuses the first 3301 square in mirrored form. The other two source squares remain in their canonical resource orientation.

## Frozen family

For every integer radix from2 through809, convert each center to canonical most-significant-first digits.

Charge all eight possible whole-pair mirror masks across the three centers.

A candidate survives only when all three centers:

1. have exactly two digits;
2. use digits that are valid zero-based indices into the 43-word signed source;
3. become a forward unit-step index pair after the charged mirror choice.

No source words are supplied to the search.

Across all **808 radices × 8 mirror masks = 6,464 configurations**, exactly one survives:

```text
radix 29
mirror only the first / 809 square

809 -> BASE29 [27,26] -> mirror -> [26,27]
331 -> BASE29 [11,12]           -> [11,12]
 91 -> BASE29 [ 3, 4]           -> [ 3, 4]
```

The orientation-free family is equally sharp. Requiring only that all three raw digit pairs be adjacent source indices leaves base29 as the sole radix in2..809.

## Lexical consequence

Only after the numerical family is frozen, read the surviving indices in the authenticated 2016 source:

```text
[26,27] = NUMBERS ARE
[11,12] = IS THE
[ 3, 4] = LIES EMPTY
```

These are three distinct literal adjacent fragments of the signed source.

In ascending signed-text position they occur as:

```text
3,4   LIES EMPTY
11,12 IS THE
26,27 NUMBERS ARE
```

The first square's required reversal is independently matched by the visible mirrored reuse on p22. The two untouched controls require no reversal.

## Why this changes the p22 reading

The earlier p22 result established:

```text
p55 -> CIRCUMFERENCES131 -> p22
p22 source square -> SHED circumferences -> center809
809 -> mirrored BASE29 [26,27] -> NUMBERS ARE
```

At discovery time, BASE29 could still have been a one-center interpretation.

The untouched centers331 and91 now provide a same-operation holdout. Both land on adjacent signed-source pairs under the exact radix selected by809, and the complete radix/mirror family has one joint survivor.

This materially strengthens the interpretation that the authenticated 2016 text is an intended numeric word register for the earlier square centers. It also makes Gematria's radix29 structural rather than a free numeral choice in this family.

## Consequence for EPIPHANY SEEKS

The p22 center branch already enters the established numbered route:

```text
NUMBERS ARE
 -> ARE27
 -> p27 canonical word28 [0,20,15,1]
 -> one literal circumference shed [20,15]
 -> H2 [5,6]
 -> EPIPHANY SEEKS
```

The three-square holdout strengthens the **upstream BASE29 selector** for that route. It does not emit p0's 13 additive-key atoms, so the p0 key-order provenance remains unresolved.

## Evidence boundary

Established computational facts:

- the exact authenticated centers are809,331,91;
- base29 represents them as `[27,26]`, `[11,12]`, `[3,4]`;
- among every radix2..809, base29 alone makes all three raw pairs adjacent valid signed-source indices;
- among all radix/mirror configurations, the sole forward-unit survivor reverses only809;
- the resulting signed-source fragments are `NUMBERS ARE`, `IS THE`, and `LIES EMPTY`.

Interpretive claim:

- the 2016 signed text was likely designed to function as a lexical register for these earlier square centers.

The lexical-register interpretation is strongly supported by the three-object holdout while remaining a historical-intent inference. Continuous unknown-page prose and the final Cicada destination remain unresolved.

## Reproduction

```text
node sims/lp2_three_square_centers_base29_source_pairs_sft.cjs
```

Windows Node22 workflow: pending at report creation.
