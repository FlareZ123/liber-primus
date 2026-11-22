# Original LP2 direct BASE29 file/container gate

**Current decision (Agent17 extension, 13 November 2026):** The complete 12,956-rune unknown book, all nine original image-selected visual chapters, and all 55 rune-bearing unknown physical pages fail the tested direct canonical GP29 positional-byte transport. The full book and all nine chapters were checked as both fixed-width big-endian bytes and canonical minimal big-endian bytes. None begins with a recognized BZIP2, GZIP, XZ, PNG, ZIP or PDF signature. In particular, the whole-book 7,868-byte stream begins `08734843a55193dc`, not the GZIP magic `1f8b08`. No DEFLATE parse is attempted because the mandatory GZIP header is absent. No unknown LP2 plaintext, key, complete inverse or continuation destination is recovered.

This is a bounded exclusion of **direct, unencrypted GP29 integer-to-file/container data** under the specified source boundaries. It does not exclude a compressed-then-encrypted payload, a different register, an independently instructed framing or another transformation.

## Why this exact test was selected

The independently GPG-signed 2013 Cicada TCP-server challenge explicitly demonstrates BASE29 conversion (including the 3301-to-3QO example). In earlier Cicada stages, the creators also used standard compressed-file containers, including GZIP and bzip2. A solver familiar with those operations could reasonably ask whether a complete LP2 source unit is simply a radix-29 integer representing a file. The original manuscript does **not** explicitly instruct the solver to apply BASE29 to LP2, assign GP runes as digits, or interpret the result as unencrypted compressed bytes; this remains a clue-motivated test, not an authenticated cipher mechanism.

The original image-selected chapter boundaries are p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. Their rune lengths are 729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008 and 308, totaling 12,956. The complete-book stream is an additional, distinct framing. The physical p50 is rune-free; the 55 rune-bearing pages are retained as separate source-native boundaries.

## Frozen serialization and exact results

Use the canonical Gematria Primus index order F=0 through EA=28, most-significant digit first. For digits d0...d(n−1), compute N = Σ dᵢ·29ⁿ⁻¹⁻ⁱ. Test both:

1. **Fixed mathematical width:** exactly ceil(n·log₂(29)/8) big-endian bytes, retaining leading zero bytes.
2. **Minimal big-endian width:** the shortest whole-byte representation of the same integer, stripping only leading zero bytes.

The 2013 BASE29 source motivates the positional integer operation, but it does not select another alphabet, byte order, padding convention, phase, prefix deletion, offset, reversal, key or KDF. None is fitted.

| Original source unit | GP runes | Fixed-width bytes | Minimal bytes | Fixed-width first 8 bytes | Minimal first 8 bytes |
| --- | ---: | ---: | ---: | --- | --- |
| Whole unknown book | 12,956 | 7,868 | 7,868 | 08734843a55193dc | 08734843a55193dc |
| p0–2 | 729 | 443 | 443 | 1759b774a590ef75 | 1759b774a590ef75 |
| p3–7 | 1,145 | 696 | 696 | 03ae7c53329e6a19 | 03ae7c53329e6a19 |
| p8–14 | 1,729 | 1,050 | 1,050 | 568b6382e9e32b9c | 568b6382e9e32b9c |
| p15–22 | 1,903 | 1,156 | 1,155 | 000dea61948244b3 | 0dea61948244b36b |
| p23–26 | 1,021 | 620 | 620 | 1032d4e90101414a | 1032d4e90101414a |
| p27–32 | 1,433 | 871 | 871 | 01e1f098bfb6f84a | 01e1f098bfb6f84a |
| p33–39 | 1,680 | 1,021 | 1,021 | 0224e7f776075c83 | 0224e7f776075c83 |
| p40–53 | 3,008 | 1,827 | 1,826 | 0052876495b72a94 | 52876495b72a948c |
| p54–55 | 308 | 188 | 188 | 010490bde021d22c | 010490bde021d22c |

The only fixed-width/minimal differences are the single leading 00 byte on p15–22 and p40–53. Removing those zero bytes exposes prefixes 0dea... and 5287...; neither is a file signature. The whole-book fixed-width and minimal byte arrays are identical because its leading GP digit is nonzero.

The existing fixed-width test also checks all **55 rune-bearing physical pages** and finds no BZIP2, GZIP, XZ, PNG, ZIP or PDF signature. The extension tests the whole book and both chapter byte-width conventions against the same signature set. Thus the exact #772 direct GZIP proposal has now been tested on its requested whole-book and original visual-chapter boundaries, rather than inferred from the different titled-unit experiment.

## Controls and relationship to earlier tests

- The source-exact Node test has fixed-width and minimal-width positive controls: an independently generated valid GZIP member is encoded as GP29 digits, recovered byte-for-byte and successfully decompressed with Node zlib.
- The earlier #335 test independently showed a 71-byte valid GZIP payload represented by 117 canonical GP29 digits and recovered exactly. Its nine titled text units have different cuts (including a separate 91-rune p33 interlude and a merged p40–55 final unit); it is **not** the same partition as the nine original visual chapters here.
- The prior Agent35 chapter/page gate tested fixed-width GP29 byte arrays for the nine image-selected chapters and all 55 rune-bearing pages. This extension adds the complete-book framing and the minimal-byte form for the visual chapters, without creating a duplicate experiment.

## Reproduction and decision boundary

- Source-exact CJS SFT: [`sims/lp2_original_chapter_base29_file_sft.cjs`](../sims/lp2_original_chapter_base29_file_sft.cjs).
- Manual-only workflow: [`.github/workflows/lp2-original-chapter-base29-file-manual.yml`](../.github/workflows/lp2-original-chapter-base29-file-manual.yml).
- Original visual chapter map: [`im-results/lp2-global-original-visual-section-map.md`](lp2-global-original-visual-section-map.md).
- Authenticated historical arithmetic source: [2013 signed BASE29 challenge](../resources/external/2013-tcp-server-signed-source.md).

**Research decision:** retire the direct GP29-to-standard-file/container interpretation for the complete book, the nine original visual chapters and the tested physical-page units. Do not add byte offsets, reversed streams, arbitrary prefixes, alternate radices or codec sweeps without a new original LP2 instruction. The useful next input is an independently authored decryption/serialization rule or authentic key material, not more variants of this direct-container hypothesis.
