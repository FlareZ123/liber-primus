# Eight source-section fingerprints versus the 256-byte printed table

**Agent13, 10 November 2026. Classification: source-prespecified negative for direct author-section cryptographic digests.** No newly deciphered LP2 plaintext, key, or target URL. [Reproducer](../sims/lp2_grid_eight_section_digest_gate.cjs) · [passing manual CI 42901274183](https://github.com/FlareZ123/liber-primus/actions/runs/42901274183).

## Independent visible reason to test

The source LP2 transcription contains exactly **eight nonempty printed text sections** separated by its original `$` section markers; the canonical rune counts are **729, 1145, 1738, 1894, 1021, 1433, 1680, 3316** (sum 12,956). The original p49–51 grid contains exactly **256 printed base60-decoded bytes** in **eight physical columns of 32 bytes**, also expressible as eight consecutive row-major 32-byte blocks. A reader could naturally test whether the table supplies eight 256-bit section hashes, source-authentic fingerprints, or section-specific integrity values, rather than a missing encryption pad.

The source-defined target is the *original printed ciphertext*, so this hypothesis needs neither a hidden key nor a guessed plaintext; one exact match would be strong evidence of a relationship. The test also considers four 512-bit digests of adjacent pairs of the eight source sections against the four row-major quarters or physically paired columns, motivated by the solved p56's 64-byte hash and the grid's total 256-byte size. This second partition is weaker as a visual clue and is labeled separately.

## Exact, reproducible candidate scope

For each of the eight independently parsed source sections, freeze **six ordinary byte serializations** before checking the table: literal transcription with punctuation, rune-only UTF-8, numeric GP-index bytes, GP-prime-valued bytes, rune transliteration in UTF-8, and 5-bit MSB-first packing of GP indices (zero-padded only in the last byte). Hash each with **SHA-256, SHA3-256, or BLAKE2s-256** and test exact 32-byte equality against **eight** physical columns and eight 32-byte row-major chunks, allowing any section/target assignment. This is **8 × 6 × 3 × 8 × 2 = 2304 exact 32-byte comparisons**. No scoring, candidate fitting, digest truncation or arbitrary alphabet permutations.

For the weaker adjacent-source-pair hypothesis, concatenate each pair's original same-encoding bytes; apply SHA-512 and test four quarter/paired-column 64-byte chunks, yielding **4 × 6 × 4 × 2 = 192 exact 64-byte comparisons**. A positive checker replaces a *shadow copy* of original grid column3 with the correct SHA-256 of section0 GP-index bytes and recovers exactly one intended match; the original source grid remains unchanged.

## Decisive outcome under declared scope

| Hypothesis | Exact comparisons | Original-grid matches |
| --- | ---: | ---: |
| Eight 32-byte SHA-256 / SHA3-256 / BLAKE2s fingerprints | **2,304** | **0** |
| Four 64-byte SHA-512 adjacent-section-pair fingerprints | **192** | **0** |
| Shadow positive control, known SHA-256 | 8 target columns | **1**, at implanted column3 |

All data contracts and the positive checker passed in the [executed original source CI](https://github.com/FlareZ123/liber-primus/actions/runs/42901274183). Therefore the grid is **not simply a literal collection of the tested conventional hashes of the eight observed source sections under those encodings/layouts**. This does not rule out hashes of unknown plaintext, authenticated hidden pages, salted/HMAC checks, other sources/serializations, cryptographic signatures, or a grid representing machine state. It should prevent further blind byte-layout rehashing absent a specific source clue.

No changes to the overall established decipherment status are warranted.
