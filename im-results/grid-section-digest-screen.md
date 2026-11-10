# LP2 base-60 table: eight 32-byte columns are not literal manuscript digests

**Evidence class:** executable, tightly bounded negative about a source-derived hypothesis. Agent 25, 2026-11-10. No plaintext, decryption key or destination recovered.

## Concrete clue and inversion path

LP2 pages 49–51 print a **32-row × 8-column** table of base-60 byte tokens. Treating each **vertical column** as 32 bytes gives eight 256-bit strings, a possible set of eight SHA-256-like cryptographic commitments. The canonical transcription has **nine** '$'-delimited nonempty sections, one only **9 runes** long, which permits a natural eight-group arrangement by joining that bridge to the following section. The eight merged rune counts are **729, 1145, 1729, 1903, 1021, 1524, 1589 and 3316** (sum **12,956**).

If a column is the direct cryptographic digest of its associated *ciphertext* section, reproducing that digest would establish a keyed-independent, exact grid/manuscript relationship and identify a verifiable section assignment. This is a falsifiable hypothesis; digesting the **unknown plaintext** or a private key is outside its scope.

## Completed direct comparison

The [reproducer](../sims/grid_section_digest_screen.cjs) reads the canonical full transcript and the corrected 256-byte grid. It computes all of the following literal source sets: nine unmerged sections, eight groups, each of 55 rune-bearing pages, and whole-LP2 rune-only or punctuation-preserving book strings.

For each source it checks **nine** concrete encodings: UTF-8 with original punctuation, rune-only UTF-8, zero- and one-based byte indices, expanded Latin transliterations in both cases, and three punctuation/line-wrap normalizations. Each encoding is hashed using SHA-256, SHA3-256, BLAKE2s-256, first or last 32 bytes of SHA-512, and 32-byte SHAKE256 output: **3,996** byte-for-byte computed digests.

Each is compared against **32 exact presentations** of the printed table: 8 original or reversed vertical columns and 8 original or reversed consecutive 32-byte row-major chunks. The entire search covers **127,872** digest-to-grid comparisons. The script verifies a published SHA-256('abc') vector before evaluating the manuscript.

**Observed exact matches: zero.** The executed program recorded exactly 55 pages, 12,956 runes, the nine-section length vector **[729,1145,1729,9,1894,1021,1524,1589,3316]**, and a clean empty matching list. The on-demand [successful GitHub Actions run 42754533193](https://github.com/FlareZ123/liber-primus/actions/runs/42754533193) preserves the output.

## Original red-section titles as source-only grid commitments (Agent 15)

A complementary, previously untested source pair is the **eight section-opening red headings** versus the **eight 32-byte grid columns**. The independent two-ink annotations fix physical opening pages **0, 3, 8, 15, 23, 27, 33 and 40**. On those pages there are **11 separately annotated red rune spans** once secondary red passages at p3, p15 and p33 are retained. This is a direct test of whether some original title is committed literally by the printed table; no plaintext hypothesis or cipher key is fitted.

Read every original printed two-character grid token under both its published **base-60** byte codec and the already documented **lowercase-f-omitting base-59** alternative. Decode each red span in nine source-defined ways: zero-/one-based GP indices; GP prime values as bytes; exact UTF-8 runes; upper-/lowercase GP transliterations; and decimal index or prime-value ASCII with or without commas. Apply **SHA-256, SHA3-256, BLAKE2s-256, SHAKE256 (32 bytes), and the first/last 32 bytes of SHA-512**. Test every resulting digest against the original or reversed **eight vertical 32-byte columns** and the original or reversed **eight consecutive 32-byte row-major grid chunks**, under both grid numeral codecs. The closed search comprises **11 spans × 9 encodings × 6 digests × 64 grid presentations = 38,016 byte-exact comparisons**.

**Original-input result: zero 32-byte matches; the largest shared leading prefix is one byte.** The test independently recomputes the literal source title indices from the ink annotation, asserts every original glyph, checks both full-grid SHA-256 fingerprints, checks SHA-256(`abc`), and inserts a known title digest as a constructive exact-match control. Both radix choices round-trip through their original source tokens. These original-source comparisons were executed during the investigation; the new Node 22 SFT has been committed, but its newly wired manual GitHub Actions workflow variant has **not** yet been dispatched. A digest test is insensitive to postulated plaintext semantics because it uses only source-visible title bytes and grid bytes.

**Scope:** this excludes the specified literal per-span 256-bit commitment constructions. It does not test multipart title concatenation with intervening punctuation, normalized red-letter layouts beyond the nine encodings, unknown earlier plaintext titles, key-derived/salted hashes, or digests of artwork. No source independently stipulates that grid columns are hashes; the count of eight is a motivating hypothesis, not proof.

[Original red-title/grid 38,016-comparison SFT](../sims/grid_red_title_digest_gate.cjs); the existing [manually dispatched grid-digest workflow](../.github/workflows/grid-section-digests.yml) now includes this independent step.

## Interpretation

The table columns or row-major 32-byte chunks do **not** directly contain any of the tested standard 256-bit digests of the *visible runic ciphertext* under the specified normalizations. This weakens the easy interpretation that the numeric grid is a literal authentication table for the already visible text.

It does not test the SHA-256 of unknown plaintext, a keyed MAC, salted or domain-separated hashes, historical raw JPG image bytes, less conventional source encodings, digests of reconstructed or unobserved plaintext titles, multipart red-heading strings with punctuation, or page artwork, or a different hash function. Such variants need independent manuscript constraints before investing in another broad enumeration.

The structure of eight vertical 32-byte columns remains a potentially meaningful source of **256-bit keys or commitments**, but no direct cryptographic relationship has been proved. This result is supporting evidence only and does not change the unresolved state in results/README.md.

Implementation: [sims/grid_section_digest_screen.cjs](../sims/grid_section_digest_screen.cjs). Runner: [.github/workflows/grid-section-digests.yml](../.github/workflows/grid-section-digests.yml), dispatched manually and never on commit.
