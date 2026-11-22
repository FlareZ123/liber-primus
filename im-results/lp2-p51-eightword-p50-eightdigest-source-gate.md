# Eight source words after the p50 table do not authenticate eight SHA-256 digest columns

**17 November 2026, Agent29. Classification:** source-bound hash-preimage test; exact negative in the fixed serialization population. **No LP2 unknown plaintext or key.**

## Human-visible alignment and competing explanation

The original p50 numerical table has **32 rows by eight columns**. The following physical p51 starts the next **170-rune / 40-word sentence**, of which its first **eight complete words comprise 32 rune glyphs**. Their native-GP word lengths are **[3,6,5,5,3,4,3,3]**. The 32-rune excess relative to the complete 138-rune pretable sentence is the table's 32-row dimension. The first 32 runes are an exact whole-word prefix, so a solver could try eight words as identifiers for eight 32-byte column values; each numeric column would be one conventional SHA-256 digest. The source visibly prints a 512-bit hash on solved p56 and uses a ten-dot mark before the table, so a hash-related role is plausible. **The text nowhere says to hash the eight posttable words or identifies SHA-256 for the grid.**

An independent explanation is that the apparent 8×32 correspondence comes from normal word lengths and a table with eight columns. It would be a misleading pattern unless an exact digest or source instruction authenticates it.

## Frozen original-source experiment

The exact 256 grid bytes and 29-symbol indices come from the repository's unchanged canonical sources. Extract the eight printed posttable words, respecting continuous line wrapping and punctuation. Read table *columns* vertically, top to bottom, giving eight 32-byte candidate SHA-256 digests under the existing conditional radix-60 reading. Freeze seven ordinary representations for each word: original rune UTF-8, Latin-GP transliteration upper/lower UTF-8, unsigned GP29 rune-index bytes, corresponding GP-prime bytes, and comma-separated decimal encodings of GP indices/primes. The same seven representations of the 32-rune concatenated phrase form a single fixed group control.

Compare every one of these **63 SHA-256 candidates to all eight whole 32-byte columns** (504 complete byte-exact equalities, including 56 intended one-word/column pairs). This comparison permits unknown word-column permutation but **does not** fit salts, trim digests, swap bytes, shift columns, alter original runes, change table byte radix, or use an alternate hash family. The standardized SHA-256 of the ASCII string abc is checked against the published test vector before the original comparisons; a positive plant embeds the exact SHA-256 digest of one original GP29 word into one synthetic column and recovers exact equality.

| Frozen comparison | Actual original full 256-bit matches |
| --- | ---: |
| Eight posttable words × seven serializations × eight original columns | **0** |
| Complete 32-rune phrase × seven serializations × eight original columns | **0** |
| Exact synthetic hash-column plant | **1 (as designed)** |

The closest original partial comparison differs in **107 of 256 bits**, meaning the data do not even approximate a shared digest beyond chance expectation. Such a nearest Hamming value is not evidence for or against intentional encoding, since exact full-digest equality is the only authenticating criterion.

## Result, limits and link to the first sentence

The **32-rune, eight-word posttable prefix** is a new concrete source alignment to the eight 32-byte table columns. The simplest source-ordered SHA-256 preimage interpretation **fails exactly**. The eight words may still select columns in a different independently signaled way, contain encrypted rather than preimage text, or be unrelated prose. This test cannot establish whether the table stores hashes at all. Other SHA-256 source-window gates for eight preceding pages and ordinary contiguous hash blocks are already reported separately in [the consolidated p50 hash analysis](lp2-p50-sha256-sha512-block-chain.md); the present test uses eight complete words specifically neighboring the grid, preserving the new original sentence comparison.

**Reproducer:** [node sims/lp2_p51_eightword_p50_eightdigest_original_sft.cjs](../sims/lp2_p51_eightword_p50_eightdigest_original_sft.cjs), with exact source assertions and a positive hash-column plant. Ran successfully under Windows Node22: [GitHub Actions run 44161870830](https://github.com/FlareZ123/liber-primus/actions/runs/44161870830). Avoid advancing a SHA256 hash-column theory unless a new source instruction identifies a different original preimage or its exact serialization.

No downstream decoder, ciphertext-key fit or table-data modification is justified by these nonmatching digests.
