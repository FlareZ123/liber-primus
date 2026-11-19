# The two 1033-sum source squares contain a unique center-out BASE29 source chain

**Agent7, 19 November 2026. Classification: strong source-structural holdout and plausible intended traversal.** This result was discovered after the three authenticated square centers had already selected BASE29. It adds a spatial ordering rule to the held-out non-center chain.

## Fixed source family

The stable 2014 square resource contains three authenticated magic squares:

```text
5x5  sum3301
7x7  sum1033
5x5  sum1033
```

The latter two therefore form an independently source-selected same-sum pair.

For each cell, define its source-visible circumference depth by Chebyshev radius from the unique square center:

```text
radius0 = center
radius1 = first surrounding circumference
radius2 = next circumference
radius3 = outer circumference of the 7x7 square
```

## Target-free family

Charge every integer radix from2 through456, the largest cell in the two 1033-sum squares.

For every possible starting index in the authenticated 43-word signed-2016 register, require:

```text
radius0 contains [n,   n+1]
radius1 contains [n+1, n+2]
radius2 contains [n+2, n+3]
radius3 contains [n+3, n+4]
```

where each bracket is the complete two-digit representation of a literal square cell in that radix.

No target integer values or words are supplied to the search.

Exactly one configuration survives:

```text
radix = 29
start = 3
```

with:

```text
radius0:  91 = [3,4]
radius1: 121 = [4,5]
radius2: 151 = [5,6]
radius3: 181 = [6,7]
```

The source geometry fixes their locations:

```text
91   center of the 5x5 sum1033 square
121  radius1 in the 7x7 sum1033 square, two symmetric cells
151  radius2 corners of the 5x5 sum1033 square, two symmetric cells
181  radius3 corners of the 7x7 sum1033 square, two symmetric cells
```

Thus the same-sum square pair itself orders the four edges from center outward.

## BASE29 arithmetic

The progression is structurally exact:

```text
91,121,151,181 = 91 + 30r
```

because:

```text
[n,n+1]_29
= 29n + (n+1)
= 30n + 1.
```

For n=3,4,5,6 this gives exactly the four source cells above.

## Lexical readout

Only after the numerical and spatial family is frozen, read the authenticated source indices:

```text
[3,4] = LIES EMPTY
[4,5] = EMPTY EPIPHANY
[5,6] = EPIPHANY SEEKS
[6,7] = SEEKS THE
```

Their overlaps collapse to the exact signed-source substring:

```text
LIES EMPTY EPIPHANY SEEKS THE
```

This supplies a direct center-out source route through **EPIPHANY SEEKS**.

## Relationship to EMERGE

Solved p57 already contributes the literal vocabulary:

```text
SHED OUR OWN CIRCUMFERENCES
FIND THE DIVINITY WITHIN
AND EMERGE
```

The p22 route uses the inward half literally on the 3301-sum square: shed circumferences to center809, then read EMERGE through the fixed table consumer.

The two 1033-sum squares now supply a mathematically unique **outward** chain by increasing circumference radius. Reading it center-out is therefore a plausible physical realization of EMERGE.

This interpretation should remain distinguished from the computational fact. The exact center-out chain is established by the source geometry and exhaustive radix/start family. The claim that the creator intended the word EMERGE to command this traversal is an interpretation supported by the already solved vocabulary.

## Consequence for p0

Square value151 is a literal source cell and equals BASE29 `[5,6]`, selecting authenticated words **EPIPHANY SEEKS**.

This selection is independent of:

- the 13 p0 title ciphertext values;
- the retrospective 13-atom additive key order;
- the p22 center809 to ARE27 navigation bridge.

It therefore strengthens phrase selection while leaving the key-order provenance unresolved.

## Stop condition

The two authenticated 1033-sum squares provide radii0 through3 and no radius4. The chain therefore has a source-geometric endpoint after source index7.

The arithmetic next value would be211 = BASE29 `[7,8]`, but no radius4 exists in the source family. Earlier direct checks also find211 absent from all three source squares and noncontinuing at pp49-51 cell211. Do not synthesize a radius4 receiver elsewhere without a new source clue.

## Reproduction

```text
node sims/lp2_1033_squares_base29_emerge_chain_sft.cjs
```

Windows Node22 workflow: pending at report creation.
