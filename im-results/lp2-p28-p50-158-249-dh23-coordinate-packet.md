# p28 line-6 position-19 → p50 reciprocal cells: coordinate-selector audit

**Agent4's original arithmetic bridge (22 November 2026); Agent38's independent source-selector adjudication for [Issue #2129](https://github.com/FlareZ123/liber-primus/issues/2129).** Classification: reproducible original-source arithmetic, but **no author-selected coordinate opcode**. No unknown LP2 plaintext, authentic key, or reusable cipher was recovered.

## Current decision

The numerical route is real; the proposed mapping is not source-selected. Retain it as a conditional structural coincidence, **not as a source-derived key route**. Close the coordinate-selector branch unless a new first-party instruction fixes the coordinate origin and axis order before a new ciphertext receiver is inspected.

The decisive missing operation is: map p28's one-based word position 19 and one-based line number 6 to p50's zero-based row 19, column 6. No inspected Cicada source specifies that transpose or mixed indexing convention.

## Reproducible original-source arithmetic

The original physical p28 layout gives:

- Its unique line beginning with the literal fragment `DH` is line 6.
- That line contains 23 runes.
- The already-selected terminal word 28 has length 5 and begins at one-based position 19 on that line.
- The signed 2013 TCP specification separately contains a worked DH exchange with p=23, g=5, public values 8 and 19, and shared value 2. The p28 geometry is a manuscript-side selection of those numbers, not a signed instruction to reuse them as a p50 address.

The original three-page p50 numeric object contains 256 base-60 tokens in a 32×8 row-major layout. Under the proposed mixed-origin, transposed mapping:

```
row = 19, column = 6  (both treated as zero-based)
cell = 19×8 + 6 = 158
p50[158] = "49" = base60 249
p50[249] = "2c" = base60 158
```

This is the unique nontrivial full-byte two-cycle in the 256-cell table. Separately counted original-source quantities are 249 black p0 runes after the 13-rune red heading and 158 printed words across pp0–2. The endpoint coordinates (19,6) and (31,1) also have row displacement 12 and column displacement 5, producing the already reported packet [g,K·a,B]=[5,12,19] at p38 offsets 54–56.

All of those equalities reproduce from the original transcription and p50 table. They do not authenticate the coordinate transform that joins them.

## Independent first-party selector audit

The question was whether an author-era Cicada example fixes the same mapping, including its base origins and axis orientation.

1. **2013 signed TCP/DH specification.** The Cicada-signed source defines BASE29, DH and NEXT and prints the worked DH23 exchange. It contains no table-row/column coordinate grammar and no instruction to carry the worked tuple into LP2. DH arithmetic fixes the tuple's semantics, not a p28-to-p50 address rule. See [the pinned source and signature analysis](../resources/external/2013-tcp-server-signed-source.md).

2. **2014 signed book-code message.** The signed first-onion message contains tuples such as `1:2:3:1` and `45:5:2:3`. The contemporaneous community implementation interprets these as one-based paragraph:sentence:word:character coordinates in the named *Self-Reliance* text and subtracts one from each component. This is a real text-coordinate precedent, but it is **text-to-text book code**, not a mapping from a manuscript line/word pair into a printed numeric table. Its one-based convention does not support using the one-based p28 values directly as zero-based p50 indices. The signed source and pinned implementation are [here](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter).

3. **2014 signed magic-square upload instruction.** The signed message asks solvers to paste already-obtained magic squares into textareas. The contemporaneous archived form labels the fields “Order 5 Square, 3301”, “Order 7 Square, 1033”, and “Order 5 Square, 1033”. The form has no row/column labels, hidden controls, client-side transform, or instruction converting text coordinates into square coordinates. The surrounding HTML is an unsigned participant archive; the embedded instruction is signed. See [the archived form and its semantics](../resources/external/cicada2014-onion6-magic-form-and-response.json).

4. **2016 signed message.** “Its words are the map, their meaning is the road, and their numbers are the direction” is a semantic navigation cue. It supplies no radix, coordinate grammar, origin, transpose, or row/column orientation. The exact signed text is [preserved here](../resources/historical/cicada2016-4gq25-outguess.asc).

5. **2017 signed warning.** The preserved message says to beware false paths and verify the PGP signature. It provides no coordinate operation; see [the signature-verified source note](../resources/historical/cicada2017-yEiTHhvF.md).

The closest source-authenticated coordinate precedent is therefore the 2014 one-based book code, which does not define the p50 mapping. No inspected first-party source selects the proposed p28 line/position → p50 row/column operation.

## Discriminating coordinate alternatives

The mismatch is not cosmetic:

- The source-visible p28 coordinates are one-based: line 6, position 19.
- The natural line-as-row, position-as-column reading gives row 6, column 19, which is outside an eight-column table.
- The proposed mapping transposes the axes, then treats the one-based source values as zero-based grid indices: row 19, column 6 → cell 158.
- If the transposed coordinates are instead treated as one-based table coordinates, they become row 18, column 5 → cell 149. The original table has `p50[149]="2s"`, base-60 value 174, not 249; the reciprocal 158↔249 cycle disappears.

The visible table is laid out in rows of eight, but it has no printed row/column numbers, origin marker, or arrow selecting the transpose or mixed indexing. The 2016 “numbers are the direction” wording does not supply those missing parameters.

## Ciphertext consequence and limits

The p28-derived packet [5,12,19] is the same p38 word already identified by a different route. It reproduces the previously known conditional p0 `WILL` candidate at offsets 141–144: ciphertext [19,16,9,18] minus pad [12,6,18,27] gives [7,10,20,20]. The `WILL` candidate was known before this coordinate bridge; it is not a blind prediction or new plaintext.

The four-rune pad does not extend to a readable p0 stream, and the separate GOOD→LUCK holdout already fails. Thus the bridge supplies neither an independent plaintext recovery nor a reusable inverse. The source-count and p38 matches cannot be multiplied into an independent significance claim after the coordinate interpretation was selected.

## Reproduction and next action

Run `node sims/lp2_p0_158_249_dh23_coordinate_packet_sft.cjs` with Windows Node.js 22 to reproduce the p28 parser, p50 byte table, unique two-cycle, p0 counts, p38 packet and conditional WILL arithmetic. The additional origin check is direct row-major arithmetic against the same `resources/liber-primus/lp2-grid-256.json`: proposed mixed-origin cell 158; one-based transposed cell 149 (`2s`, 174); natural line-as-row/position-as-column is out of range.

**Decision for #2129: close negative.** Do not continue DH-key, p50-coordinate, or p0-WILL sweeps from this bridge. Reopen only if a newly found first-party source fixes the coordinate opcode before an untouched original ciphertext holdout is selected.
