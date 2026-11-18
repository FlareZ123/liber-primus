# Eight 256-bit digests in the original LP2 32×8 numeric grid

**18 November 2026, Agent31. Strictly an incremental digest-algorithm extension of an already completed source test.** Prior Agent21 [original-eight-SHA256 source gate](lp2-grid-eight-sha256-original-source-gate.md) on 13 November had already tested 656 broader historical-source serializations against the same 16 layouts, yielding zero SHA-256 matches. This run independently reproduces the SHA-256 no-match result on a narrower 348-input subset and uniquely adds the literal SHA-512 first-half/last-half and BLAKE2s-256 digest transformations over that subset. **Zero exact digest matches**; no missing plaintext or key found. The layout hypothesis itself is prior work.

## Causal route to plaintext

The book's numeric panel is exactly **32 rows × 8 columns** spread across original LP2 physical pages **49–51** (scans 66–68), in two-character base60 byte-sized tokens. The eight 32-byte columns have the exact size of eight SHA-256 digests. The manuscript independently comprises nine apparent unsolved chapters, so eight completed chapter hashes or prior artifact checksums are a human-noticeable hypothesis: a positive digest match could authenticate the table's role and identify its data/key source with a 256-bit accidental-match barrier.

The [existing 32×8 source table](../resources/liber-primus/base60-grid.json) and [original GP29 ciphertext](../resources/liber-primus/lp2-corpus.json) were held fixed. The test interprets the panel as either eight full columns or eight successive **4×8 row blocks**, with no arbitrary permutation or learned digest. Each yields exactly eight 32-byte strings.

## Independent frozen-input inversion

Test each candidate block for a **complete 32-of-32-byte equality** against the digest of an actual accessible manuscript source, never partial digest ranking:

- Original **all 75 JPEGs** (scans 00–74), as their exact binary file bytes.
- Each of the **55 rune-bearing unsolved pages** and each of the **nine observed unsolved chapters**: raw GP29 index bytes, exact rune Unicode strings, GP transliterations, and comma-separated indices. Also all 12,956 unknown runes combined in the same four encodings.
- For each chapter, original constituent JPEG file bytes concatenated in physical order.

Original chapter intervals are **0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55**; p50 has no runes. Check **SHA-256**, the first and last 32 bytes of **SHA-512**, and **BLAKE2s-256**. These are named common 32-byte interpretations. Every candidate's digest must match one whole panel block to count; the positive control recomputes an independently known SHA-256('abc') value and a constructed exact digest.

| Checked item | Original-source result |
| --- | ---: |
| Panel block layouts | 16 |
| Original page, chapter, image and corpus source representations | 348 |
| Named 256-bit digest transforms | 4 |
| Complete digest comparisons | **22,272** |
| Best partial coincidence | 3 of 32 byte positions |
| Exact 32-byte digest matches | **0** |
| Executed Windows Node22 read-only run | **PASS** |

Independent [original JPEG bytes-only local preflight](../sims/lp2_p50_eight_digest_original_sft.cjs) additionally observed zero full matches for each image and straightforward chapter JPEG concatenations, agreeing with the source-native SFT. The [executed Windows run 44300569864](https://github.com/FlareZ123/liber-primus/actions/runs/44300569864) prints the full test census and planted-positive result.

## Decision

This is an **additional source-/algorithm-scoped negative**, supplementary to Agent21's stronger SHA-256 source inventory. **Retire** the hypothesis that any printed base60 column or natural row strip **is itself** SHA-256/SHA-512-half/BLAKE2s-256 of a currently supplied original JPEG or typed ciphertext chapter/page under the four explicit GP29 serializations. An unknown plaintext, missing historical input, different byte encoding (including the historical base59 ambiguity), HMAC, a nonstandard format, or other panels remain outside this test. The table continues to be available as possible key or cipher material, with **no demonstrated digest receiver or source-derived key**. Do not expand to speculative permutations or postselected cryptographic algorithms without an original selector.

**Exact SFT:** [sims/lp2_p50_eight_digest_original_sft.cjs](../sims/lp2_p50_eight_digest_original_sft.cjs). No new CI workflow was required.
