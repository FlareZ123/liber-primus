# LP2 original 32×8 numeric table is not a complete standard packed GPS coordinate list

**Decision (16 November 2026, Agent 10):** None of six standard full-row geographic pair interpretations can represent all 32 printed rows as latitude/longitude. This is an original-input, source-constrained exclusion, **not** a recovered LP2 plaintext, cryptographic key, or destination.

## The human route and its limit

The original LP2 numerical table occupies physical pages 49–51 and prints **32 rows of eight two-character base60 tokens**. Under the established but conditional base60-to-byte reading, each row provides **eight bytes**, exactly the size of *two* ordinary IEEE-754 single-precision geographic coordinates, or two 32-bit signed fixed-point coordinates. The original Cicada 2012 challenge used real geographic coordinates, and the authenticated 2016 message says “Its words are the map. Their meaning is the road, and their numbers are the direction.” Together these warrant one bounded, direct packet-interpretation check.

The weakest premise is the jump from numeric-table dimensions to a GPS packet. There is **no authorial LP2 instruction specifying floats, fixed-point scale, endianness or 32 coordinate pairs**. The original 2012 coordinates were presented as decimal text, so this is an inexpensive test, not an established intended route.

## Complete unchanged-source decoder

Input: `resources/liber-primus/base60-grid.json`, with the exact printed token order and 10 + 13 + 9 row allocation across the three pages. Every token `ab` is decoded as `60*index(a)+index(b)`, producing the same canonical 256 bytes pinned by SHA-256
`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

For each of 32 rows, interpret the first four bytes as latitude and the next four as longitude. Test **IEEE-754 float32** and **signed int32 scaled by 10⁶ or 10⁷**, each in big- and little-endian byte order. Count a row as a *possible* coordinate only if both values are finite and satisfy the deliberately generous geospatial ranges `|latitude| <= 90`, `|longitude| <= 180`. This gate accepts arbitrary tiny coordinates near zero, so it favors the candidate mechanism instead of over-rejecting.

| Packed format, one pair per eight-byte row | Little-endian rows in bounds | Big-endian rows in bounds |
| --- | ---: | ---: |
| IEEE-754 float32 + float32 | **10 / 32** | **6 / 32** |
| signed int32 / 10⁶ + signed int32 / 10⁶ | **0 / 32** | **0 / 32** |
| signed int32 / 10⁷ + signed int32 / 10⁷ | **10 / 32** | **10 / 32** |

The few admissible IEEE-754 rows are largely microscopic-magnitude floating-point values, consistent with chance interpretations of high-entropy bytes. For example, in little-endian reading zero-based **row 0** gives latitude about −0.001281 and longitude −0.0000152; row 10 gives latitude −25.1536 and longitude 14.9445. Neither is itself evidence of a historical target; most other rows fail elementary geographic bounds. Counting a possible row is intentionally weak: a complete 32-row itinerary would require **all 32** rows to pass one agreed format. **None does.**

The finite result excludes only these *complete* common packed-coordinate models. A subset of rows, alternate data fields, deltas, encoding, encryption, non-geographic directions, or other scale may remain possible; inventing those after the original test would lose the independent source selection. A scale of 10⁸ for signed integers, for example, makes every signed 32-bit value artificially fit within ±21.48 degrees, so universal range compliance alone would cease to discriminate.

## Reproduce and consequence

The [one-file Windows-compatible CommonJS original-input test](../sims/lp2_grid_gps_standard_pairs_sft.cjs) parses every original base60 pair, rechecks each byte against the canonical fixture and SHA-256, asserts all six counts, prints admissible row indices and numeric examples, and encodes/decodes an independently supplied plausible coordinate through both float32 endiannesses as a positive control. Run `node sims/lp2_grid_gps_standard_pairs_sft.cjs` from the repository root.

The source supports **a numerical puzzle artifact**, with no direct 32-stop GPS itinerary in the tested standard eight-byte registers. Search for an authenticated LP2 decoding instruction before introducing an arbitrary geospatial codec. This does not change the authoritative unsolved-page summary in `results/README.md`.
