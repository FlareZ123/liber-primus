# Onion7 41-cell mask ↔ p55 41-rune grid transposition

## Hypothesis

The 2014 Onion7 7×7 square has eight prime-valued cells on its outer perimeter. Omitting those cells leaves 41 active positions. The cross-page-corrected p55 interior has 43 runes, with the GP rune D at one-based positions 5 and 23; omitting those two D markers leaves 41 runes. In the context of the solved p57 instruction to “shed our own circumferences” and “find the divinity within,” this is a plausible, clue-constrained 41↔41 geometric alignment.

## Exact inputs

- 7×7 source matrix: [`resources/cicada2014-openpuff-magic-squares.txt`](../resources/cicada2014-openpuff-magic-squares.txt), middle Onion7 square.
- Omitted prime-valued perimeter coordinates (zero-based): `(0,0),(0,5),(0,6),(1,6),(5,0),(6,0),(6,1),(6,6)`. These leave 41 active cells.
- p55 43-interior sequence (zero-based GP indices): `[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]`.
- Remove the two D symbols (index 23) at one-based positions 5 and 23 (zero-based offsets 4 and 22), leaving 41 symbols.

## Decisive test

Use the original square orientation and two natural inverse read/fill choices:

1. Fill the 41 active cells clockwise, outside-in by concentric rings; read the filled cells row-major.
2. Fill row-major; read clockwise, outside-in by concentric rings.

The standalone Node reproducer [`sims/onion7_41mask_p55_grid_transposition.cjs`](../sims/onion7_41mask_p55_grid_transposition.cjs) fixes the matrix, mask, p55 input, and traversal order. It prints:

```text
fill outside-in → read row-major:
M I EO G C P H NG L S U EO TH TH E IA TH M S J E EA P IA I G C M I H A X G I E EO B X F EA C

fill row-major → read outside-in:
M I EO G P H S I E J C M EO H F TH IA A B C EA C P G EA E TH TH EO E NG X I M U IA X G I L S
```

Neither output is readable plaintext. This rejects these two simple 41-cell geometric transpositions; it does not rule out every possible transform.

## Evidence boundary and decision

The 41↔41 cardinality is source-grounded, but the cipher instruction to place p55 runes into the 2014 square is still inferred. The eight-cell mask is motivated by the original square's prime-valued perimeter and p57's circumference wording; the p55 D-marker removal is motivated by the solved Parable. No further route, reflection, or orientation sweep is justified without an independent clue that selects one.

Related established context: [Onion7 source/prime gate](onion7-magic-center-source-prime-gate.md), [p55 43-unit source-selector gate](lp2-2016-p50-p55-43unit-source-selector-gate.md), and [p55 circumference key report](p55-fold-circumference-keys.md).

**Conclusion:** useful structural correspondence, but this particular geometric transposition does not recover plaintext. Do not promote it to an established result.