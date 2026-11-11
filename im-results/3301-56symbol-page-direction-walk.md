# Conditional 3301/5×5 56-symbol stream as an LP2 page-direction walk

## Hypothesis

The original 2013/2014 5×5 square sums to 3301. Applying the archived 2013 `NUMBER` factorization cellwise, in row-major order, produces 70 distinct-prime-factor occurrences. Four prime factors outside the 29 GP prime weights occur seven times in total; expanding each as base29 digits adds seven symbols. Omitting the 21 factor-2/F symbols (a transfer of the solved p56 F-skip, not a source-fixed rule for this square) leaves a 56-symbol GP stream. This matches the 56 physical LP2 pages. The signed 2016 message says: “Its words are the map, their meaning is the road, and their numbers are the direction.” A natural test is to interpret each symbol's GP prime weight as a step around the 56-page cycle.

## Exact stream reconstruction

The stream is reconstructed from source values, not parsed from an ambiguous concatenated transliteration:

- 5×5 square: first matrix in `resources/cicada2014-openpuff-magic-squares.txt`.
- Cellwise operation: archived `NUMBER` factorization (`sims/onion7_parable19_nestedprime_sft.cjs` reproduces its semantics).
- Four outside-GP primes are expanded into base29 digit indices.
- Omit index 0 / F: 70 factor occurrences, 21 omitted F symbols, 56 remaining GP indices.
- Exact GP-index stream: `[3,10,1,7,8,1,5,4,23,1,3,8,1,6,3,9,16,3,2,3,1,3,6,10,23,2,10,7,24,2,10,10,23,1,3,6,2,3,16,3,3,9,1,6,1,3,8,4,23,1,5,1,7,8,3,10]`.
- Transliteration: `OIUWHUCRDUOHUGONTOTHOUOGIDTHIWATHIIDUOGTHOTOONUGUOHRDUCUWHOI`.

## Decisive test

1. Map each GP index to its canonical GP prime weight.
2. Reduce each weight modulo 56.
3. Starting at page 0, cumulatively add each step modulo 56.

The exact reproducer is [`sims/3301_56symbol_page_walk_gate.cjs`](../sims/3301_56symbol_page_walk_gate.cjs). It tests both plausible 56-position windows: include the starting page and first 55 moves, or use all 56 arrival pages. Both windows visit only **32 distinct pages**, omitting the same 24 pages. After all 56 moves the route ends at page **38**, not page 0. The walk is therefore not a 56-page permutation or a closed 56-step cycle.

## Decision

This rejects the forward, start-at-zero, mod56 cumulative GP-prime-weight walk. It does not rule out a different use of the 56-symbol stream. The F omission and transfer of `NUMBER` output to GP indices are conditional; the 2016 wording motivates a direction interpretation but does not fix start, sign, modulus, or page-reading operation. Do not expand into arbitrary starts, signs, or moduli without a source instruction that selects them.

Source context: [Agent 27's NUMBER/3301 handoff](../communications/agent19/20261111T085200Z_agent27-number-address-negative-handoff.md), [2016 signed message](../resources/historical/cicada2016-4gq25-outguess.asc), and [authoritative research synthesis](../results/README.md).

**Conclusion:** no plaintext or complete page traversal recovered.