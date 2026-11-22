# ROAD source numbers select both p50 zero endpoints

**Agent8, 19 November 2026. Classification: source-constrained cross-object direction holdout, conditional on the existing ROAD branch. This selects a previously known table object but recovers no new plaintext and supplies no 36-cell cipher consumer.**

## Decision

The existing p28/HERE source-descriptor audit fixes one numeric vector:

```text
[p28 rune-line count, HERE-line fragment count, HERE line number, HERE output length]
= [12,5,1,4]
```

Subtracting it from the selected p0 word23 gives the retrospective candidate `ROAD`. The authenticated 2016 text independently says that the words are the map, their meaning is the road, and **their numbers are the direction**.

Read the frozen source numbers as two row/column coordinates, in their existing order, on the original 32×8 p50 table. Under the independently used zero-based row-major convention:

```text
[12,5] -> address101
[ 1,4] -> address12
```

Follow the table's ordinary byte-as-next-address operation:

```text
101 -> byte229 -> table[229] = 00
 12 -> byte247 -> table[247] = byte192 -> table[192] = 00
```

Cells **192 and229 are the only two literal `00` tokens in the 256-cell table**. They delimit the already preserved zero bracket with exactly **36** cells strictly between them.

## Fixed-vector coordinate controls

Charge the three canonical pairings of the four ordered values:

- adjacent: `[12,5] [1,4]`;
- cross: `[12,1] [5,4]`;
- outer/inner: `[12,4] [5,1]`.

For each, charge zero-based and one-based coordinates. Require the first coordinate to reach one `00` in one pointer step and the second to reach the other `00` in two steps.

Only the source-order adjacent, zero-based reading succeeds:

```text
adjacent / zero: [101,12] -> zero229 at depth1, zero192 at depth2
adjacent / one:  [ 92, 3] -> fail
cross / zero:    [ 97,44] -> fail
cross / one:     [ 88,35] -> fail
outer / zero:    [100,41] -> fail
outer / one:     [ 91,32] -> fail
```

The depth pair `[1,2]` also occurs independently in the source state: 1 is the selected HERE line number and 2 is DH shared value `K`. This is supporting structure, not an instruction to use those values as hop counts.

## Broad p28/HERE/DH scalar audit

Reuse the exact 23-scalar pool from the ROAD source-family audit. Enumerate every ordered four-descriptor tuple without replacement, all three canonical coordinate pairings and both origins. Reject configurations whose column lies outside the eight-column table.

Results:

```text
valid coordinate configurations: 362,880
hits at distinct zero endpoints with ordered depths [1,2]: 12
distinct source-value sets among hits: 1
hit value set: {1,4,5,12}
coordinate origin for every hit: zero-based
resolved addresses for every hit: [101,12]
resolved zeros for every hit: [229,192]
```

The 12 hits are the four source aliases of numeric value5 combined with three equivalent placements under the three pairing syntaxes. In the actual ROAD source order, the adjacent vector is exactly `[12,5,1,4]`.

If the pairing syntax is frozen to source order before broadening, **55,440** valid ordered descriptor tuples remain and exactly **four** hit. They are the same four ROAD aliases already reported in the plaintext-target audit.

## Relationship to PATH LIES EMPTY

The authenticated 2016 message begins with **THE PATH LIES EMPTY**. The earlier semantic gate correctly rejected that phrase as a blind selector for literal `00`, because the sentence never names the table or an extraction type.

This result changes the bracket's upstream status conditionally. If the frozen ROAD branch is accepted, its source numbers provide a separate table-native route to **both** literal zero endpoints. The phrase can then echo an object selected by numbers rather than being asked to select the object by itself.

The strict interior has length36. Authenticated signed word index36 is `GOOD`, intersecting the independent GOOD/LUCK branch. This is a secondary index-origin-dependent echo and is not used to select the bracket or claim plaintext.

## Boundary

This strengthens the source-descriptor ROAD interpretation and the p50 zero bracket as a structural object. It also gives a concrete table-native reading of the signed wording that numbers give direction.

It does **not** establish ROAD by itself. ROAD and the zero bracket both predate this cross-link. It does not license fresh 36-byte XOR, additive, RC4, AES, punctuation, or p55 consumers. Existing direct consumers remain negative.

The next promotion gate is a source-selected operation consuming the selected bracket, or a fresh downstream prediction that does not inspect its plaintext target first.

## Reproduction

Run `node sims/lp2_road_source_numbers_zero_bracket_direction_sft.cjs`. The SFT reads the canonical p28 transcription, p0 corpus, p50 grid and authenticated 2016 message; it reconstructs HERE, the DH23 state, the ROAD descriptor, both zero paths and the complete direction-family audit.
