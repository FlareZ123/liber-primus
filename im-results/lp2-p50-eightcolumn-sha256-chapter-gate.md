# Eight-column SHA-256 chapter-address hypothesis for the p49–51 numeric table

**Decision (17 November 2026): finite original-input negative.** The 256 printed base60-compatible values on physical LP2 pp49–51 can be arranged as eight vertical 32-byte columns, the length of eight SHA-256 digests. This is a potentially human-recognizable interpretation because the independently solved p56 `AN END` explicitly contains a SHA-512 challenge, and the original p49–51 table prints 32 rows by eight columns. **The exact interpretation tested here recovers no chapter digest, key, or original plaintext.** It remains a shape-motivated hypothesis: no first-party instruction selects SHA-256, the eight-column grouping as digests, or the required serialization.

## Source-defined one-shot experiment

Inputs are `resources/liber-primus/lp2-grid-256.json` (256 source-transcribed numeric cells, byte reading described in its metadata) and `resources/liber-primus/lp2-corpus.json` (per-page GP29 indices). Nine visibly marked unknown chapters, as mapped from physical imagery, are p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, and p54–55. Their source rune lengths are respectively **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. The rune-free p50 belongs to the p40–53 segment for this purpose.

For each entire original chapter, compute standard SHA-256 on each of these five transparent, fixed serializers: exact concatenated UTF-8 GP glyphs with no separators; concatenated canonical GP transliterations with no separators; raw zero-based GP29 index bytes; comma-separated decimal GP prime values; raw one-based GP29 index bytes. Compare the resulting 32 digest bytes against all eight **vertical** 32-byte columns as printed and all eight **horizontal** successive 32-byte blocks. This covers possible direct assignment of **any** chapter to **any** column/block without searching keys or substrings.

There are **9 chapters × 5 registers × 2 orientations × 8 blocks = 720 exact original-source comparisons**. SHA-256 is checked by the `abc` published known-answer vector; the first vertical block is `cb5c796d7350fdfe7aa48ed3de7a492ac90a7de7e9f0eb80006e398e446a9071` and the first horizontal block is `cbe7a7ba61ed7eb75cf99cdef704b7d479ca0f2166893b576dc6ad1996428d85`, pinned independently of the digest matches.

**Result:** zero exact 32-byte matches. The maximum equality was just **2 of 32 bytes**, for the transliteration digest of terminal chapter p54–55 against vertical column 5 (zero-based). This is chance-compatible and contains no plaintext indication. The table does not directly print SHA-256 digests of entire GP29 chapter content under these serializations, even granting rearrangement of which of the nine chapter hashes feeds which displayed 32-byte column.

**Reproducer:** [`sims/lp2_p50_eightcolumn_sha256_original_sft.cjs`](../sims/lp2_p50_eightcolumn_sha256_original_sft.cjs). Read-only CommonJS, Node.js 22, Windows compatible; run once from repository root with `node sims/lp2_p50_eightcolumn_sha256_original_sft.cjs`. It prints the complete maximal-match record and asserts no exact match.

## Meaning and remaining route

This test rules out only literal chapter-digest lookup in the declared base60 byte register. A SHA-256 hash of a **different author-specified input**, a keyed digest, hidden salt, noncanonical word-break serialization, byte-order transform, or use of the table as a cryptographic operator is outside this finite gate. Exhaustively inventing such variations without an original clue would be arbitrary key/format search. The table might still carry a key, encrypted payload, or error-correcting structure; these require an independent original-source selector and a complete reversible receiver. No change is warranted to the authoritative established-results synthesis, which still has zero authentic unknown-page plaintext.

This investigation does not duplicate the established result that the table's 256-value size is nonunique as an original red-event receiver or the prior tests of common hash/PRNG generators. It specifically tests **complete original LP2 chapter SHA-256 input→p50 eight-column output identity**.
