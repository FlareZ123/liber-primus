# The LP2 32×8 numerical table is not a full static-wiring 8-bit ASCII message

**Decision, 15 November 2026.** The original p49–p51 256-cell numerical table cannot supply **32 complete printable 8-bit ASCII characters** by assigning one source-derived Boolean property to each cell, reading each printed row's eight cells as one byte, and then applying any single fixed permutation of the eight bit columns with any independent fixed bit inversions. This remains true when all eight wiring positions and inversion signs are secret. A source-native positive construction passes the exact invariant. **No unknown LP2 plaintext, key, or address was recovered.**

## Original clue and motivated candidate

The original manuscript prints **32 physical rows of eight two-character base60 tokens**, distributed across the three unchanged scans 66.jpg, 67.jpg and 68.jpg. Their canonical source-derived byte readings are [the 256-cell reference](../resources/liber-primus/lp2-grid-256.json). Grouping eight binary observations into one ASCII character is an understandable human-puzzle hypothesis; an earlier Cicada round also used an eight-bit whitespace text carrier. The historical whitespace source does not establish that this particular LP2 table is a binary message, so the test is a bounded *hypothesis*, not an author-authenticated decipherment instruction.

The [original-source CommonJS SFT](../sims/lp2_table_bit_column_ascii_exclusion_sft.cjs) tests fifteen fixed Boolean properties of each original table cell: every one of its eight numeric byte bits; quotient and remainder parity under division by 29; base60 second character lowercase/digit class and first character parity; 8-bit popcount parity; and ordinary integer primality. These are independent visible/source-arithmetic readings, without fitting a property after seeing any candidate text.

## Exact all-secret fixed-column obstruction

Let B(r,c) be a candidate property at one of the original 32 rows r and eight printed columns c. A fixed column-order mapping with a fixed XOR inversion mask creates an output byte per row. If all 32 bytes are ordinary 7-bit ASCII, **their most significant bit is zero for every row**. Whatever secret column supplies that output bit must therefore be all-zero or all-one across the 32 original rows. Inversion of a changing column cannot make it constant, and a permutation only moves that column.

For **all fifteen original-value selectors**, each of the **eight** source bit columns has at least one zero and at least one one among the 32 original rows. Consequently **no** fixed eight-bit column permutation or fixed XOR mask yields 32 complete ASCII bytes. This is an exact key-independent impossibility for the specified family; searching all 8! column orders and 2^8 inversion masks cannot rescue it. The SFT prints each source column's complete one-counts so the obstruction is independently auditable.

**Control:** a known source-length 32-character ASCII phrase is converted to eight bits per row, then its columns are permuted and individually inverted. The test recovers the required invariant of at least one constant source column. It therefore distinguishes a genuinely possible unknown-wiring ASCII plant from the original table's 15 candidates.

## Precise scope and research decision

This excludes only a **full-length 32-row ASCII message** under the tested per-cell one-bit predicates and *row-independent* bit wiring. It says nothing about a shorter address padded with high-bit binary data, seven-bit ASCII with a discarded parity column, variable row-dependent keys, external codebooks, another source-selected predicate, a reordered cell traversal, or a binary cryptographic key. None of those alternatives can be promoted without its own independent source clue. The printed 32×8 form alone does not supply a recovered address or plaintext; the next productive move requires identifying an author-selected property, route or additional key before using this table as a decoder.
