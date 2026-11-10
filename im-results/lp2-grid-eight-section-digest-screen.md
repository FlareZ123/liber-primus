# Alternative eight-section clock: direct fingerprints versus the 256-byte printed table

**Agent13, 10 November 2026. Classification: a narrowly incremental original-input test under an independently documented alternative section-boundary clock, with two additional GP byte encodings. This is NOT the first or a general exclusion of direct section-digest hypotheses.** No newly deciphered LP2 plaintext, key, or target URL. [Reproducer](../sims/lp2_grid_eight_section_digest_gate.cjs) · [passing manual CI 42901274183](https://github.com/FlareZ123/liber-primus/actions/runs/42901274183).

## Independent visible reason to test

The repository's **raw** `resources/lp2-transcription.txt` contains **eight nonempty `# Alternative eight-section clock: direct fingerprints versus the 256-byte printed table

**Agent13, 10 November 2026. Classification: a narrowly incremental original-input test under an independently documented alternative section-boundary clock, with two additional GP byte encodings. This is NOT the first or a general exclusion of direct section-digest hypotheses.** No newly deciphered LP2 plaintext, key, or target URL. [Reproducer](../sims/lp2_grid_eight_section_digest_gate.cjs) · [passing manual CI 42901274183](https://github.com/FlareZ123/liber-primus/actions/runs/42901274183).

## Independent visible reason to test

-delimited bodies** under the *p32-end* convention; this is only one of the three [documented, lossless source-section clocks](../workplace/lp2-section-clock-ambiguity.md). The older `resources/transcriptions/liber_primus_master.txt` has nine bodies and a different eight-body merge. Under the raw p32-end convention, the canonical rune counts are **729, 1145, 1738, 1894, 1021, 1433, 1680, 3316** (sum 12,956). The original p49–51 grid contains exactly **256 printed base60-decoded bytes** in **eight physical columns of 32 bytes**, also expressible as eight consecutive row-major 32-byte blocks. A reader could naturally test whether the table supplies eight 256-bit section hashes, source-authentic fingerprints, or section-specific integrity values, rather than a missing encryption pad.

**Previous work and the actual incremental gap.** Agent25's [earlier manuscript-wide digest screen](grid-section-digest-screen.md) already tested **127,872 exact 32-byte comparisons**, including nine canonical-master bodies, an *alternative* eight-body merge, 55 physical pages and whole-book sources under nine serializations and multiple standard digests, all negative. Its eight-group lengths **[729,1145,1729,1903,1021,1524,1589,3316]** differ from the raw p32-end clock used here **[729,1145,1738,1894,1021,1433,1680,3316]**. Here the 9-rune p15 interlude and 91-rune p33 interlude have different assignments, and the newly tested `gpPrimes` and `packedFive` encodings add limited representation coverage. This SFT is a **bounded complementary test of a real documented clock ambiguity**, rather than a novel overarching fingerprint hypothesis. More arbitrary rehashing has low expected value.

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

The result adds only the raw-eight alternative clock and packed-five/GP-prime source encodings to the previously negative digest picture. No changes to the overall established decipherment status are warranted. Do not present the 2,304 comparisons as wholly new relative to Agent25's earlier, broader search.
