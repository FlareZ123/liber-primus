# LP2 pp49–51 numeral table as eight unmodified SHA-256 digests: original-source gate

**Agent21, 13 November 2026. Evidence class:** bounded, clue-motivated original-input negative. No unknown LP2 plaintext, authenticated key, or continuation address was recovered.

## Why this is a possible human operation

The original physical pages 49–51 display **32 rows × eight two-character numerals**. Under the repository's conditional conventional base-60 reading, the 256 source cells become bytes. Each **printed vertical column is exactly 32 bytes**, the output length of SHA-256. A returning 2014 solver could reasonably ask whether these are eight hashes of previously visible page or chapter inputs. The opposite source-natural serialization, eight consecutive printed 32-byte blocks, was also held fixed. This differs from the existing eight AES-256-key/CTR consumer, literal bitmap, polynomial and SHA-512 *preimage* gates.

The weakest premise is that the original page supplies **no SHA-256 command, hash-input formatting rule or column-to-source pairing**. A successful unmodified match would be unmistakable, though a negative can only eliminate explicitly enumerated source bytes.

## Locked original inputs and exact test

The 256 table bytes are read from [the canonical original-source derived table](../resources/liber-primus/lp2-grid-256.json), with SHA-256 exactly `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The test forms eight literal printed 32-byte columns and eight disjoint row-major 32-byte blocks. Its actual digest implementation is Node's standard `crypto.createHash('sha256')`, separately checked against the conventional `abc` test vector.

The frozen **560** source-defined candidate byte strings are:

- **450** corpus sources: every nonempty physical LP2 page (57, including solved pp56–57), all nine original-image chapter unions, and nine derivative textual sections. Each has six fixed serializations: contiguous UTF-8 GP runes; concatenated GP transliteration; raw GP index bytes (0..28); two-character zero-padded decimal indices; space-separated GP prime values; and contiguous UTF-8 runes with a final LF. The empty p50 numeral-only page is deliberately skipped.
- **86** authentic JPEG sources: all 75 original publication JPEG files as exact stored bytes, plus eleven fixed contiguous JPEG-file concatenations across natural LP1/LP2 section and source boundaries.
- **24** solved p56/p57 message sources: four fixed published text formats (line breaks, space replacing breaks, no whitespace, heading plus body), each under three final line-ending variants (none, LF, CRLF).

The test compares each of the **560** complete SHA-256 outputs against both source-natural table layouts, for **8,960** exact 32-byte equality checks. There is no key fitting, page reordering, truncated hash matching, digest-algorithm shopping or use of original ciphertext to choose a winning variant.

## Results and scope

| Outcome | Exact result |
| --- | ---: |
| Whole 32-byte digest matches | **0 / 8,960** |
| Maximum matching bytes at the same byte positions | **3 / 32** |
| Comparisons with at least three coincident bytes | **4 / 8,960** |
| Source table original SHA-256 check | **Passed** |
| Independent SHA-256 `abc` control | **Passed** |

For comparison, independent uniformly random 32-byte strings have about **0.000271589** probability of matching at least three corresponding byte positions. Across 8,960 pairwise checks this predicts about **2.43** such near matches in expectation; the four observed are not evidence of a cryptographic relation, and the sources are not independent trials in a formal statistical sense.

The strongest observed outcomes are three source-corpus near matches and one JPEG near match. None comes remotely close to the **32/32 exact byte agreement** demanded by the literal interpretation. The separate p56 printed 64-byte hash also differs from every contiguous 64-byte window of the table under the frozen conventional byte reading.

**Decision:** The table's eight printed columns and eight consecutive 32-byte blocks are **not** direct SHA-256 outputs of these preserved page texts, solved messages or original JPEG source bytes. The table may still encode keyed hashes, hashes of unpreserved plaintext, other data, or an unrelated cryptographic object. The source does not authorize expanding this into unlimited encodings or arbitrary candidate key searches. Pursue a real author-selected table consumer or a recoverable independent key instead.

**Reproducer:** [CommonJS single-file SFT](../sims/lp2_grid_eight_sha256_source_sft.cjs). It loads the original source files from this repository and asserts the counts, the source table fingerprint, zero full matches and the exact observed maximum. The exact 450 corpus-source calculation was independently executed in a pure-JavaScript SHA-256 reference implementation with its `abc` and source-256-byte digest assertions; the exact 110 image/solved-text calculations were independently executed with Python's `hashlib` and the same reconstructed table fingerprint. The standalone CJS file is committed for reproducibility; no separate CI execution is claimed.
