# Two original rune-square counts versus the fixed Aztec finder: exact all-binary-map negative

**Decision, 14 November 2026.** The original LP2 physical p32 contains **121 GP runes**, previously arranged in an 11×11 row-major grid by the signed-2016 563/569 dimension correspondence. Across the full manuscript the original red-ink spans comprise **225 GP runes**, a retrospective 15×15 grouping. An independently historical 2008-standard barcode family happens to have exactly these two sizes: an **11×11 Aztec Rune** (one-byte special symbol) and the smallest **15×15 compact Aztec Code**. A human could notice “runes” and either square size. This size match does **not** establish authored intent, especially because the 225 red runes are distributed across many pages and require a researcher-selected concatenation.

The [pre-2014 Aztec symbology description](https://abcdocz.com/doc/298326/oem-integration-manual-p-n-100-88002-rev-f--june-2012) and [ISO/IEC 24778 historical specification](https://cdn.standards.iteh.ai/samples/41548/3cb3794694674dfa863f2afad9dc2f54/ISO-IEC-24778-2008.pdf) identify an **unalterable central 9×9 finder** for compact/Rune forms. Its dark centered module and dark square rings of Chebyshev radii 2 and 4 are interleaved with light radii 1 and 3. Those 81 required binary modules are rotationally symmetric. A direct reading of GP symbols as bits has to satisfy this pattern before any error correction or payload decoding.

To grant the strongest possible bit interpretation without arbitrary trials, assign every one of the **29** GP runes an entirely **unknown fixed bit**. For each original 11×11 or 15×15 candidate, count how often every rune must be dark or light at its finder locations. A rune required in both colors is impossible under a stationary mapping. The absolute minimum errors over **all 2^29 bit assignments** equals the sum, over runes, of the smaller required-color count. No codebook search is needed.

| Original shape | Finder cells | Runes forced to both colors | Minimum mismatched modules over every binary codebook |
| --- | ---: | ---: | ---: |
| Physical p32's 11×11 rune grid | 81 | **16** | **19** |
| Bookwide red tape as 15×15 | 81 | **16** | **22** |
| One shared GP29→bit mapping, both targets | 162 | **24** | **50** |

Each target is individually impossible as an **exact direct Aztec finder** under *any fixed per-rune binary codebook*, regardless of choosing high/low GP indices, even/odd indices, a secret 29-symbol lookup table, or reversing black/white colors. A solved positive construction that plants exact Aztec rings using two GP symbols produces **zero** forced conflicts, confirming the calculation works.

**Reproduce:** [read-only CommonJS original-source SFT](../sims/lp2_original_aztec_finder_allbinary_sft.cjs), using only the canonical GP29 corpus and original red-ink annotations; the finder is fixed before viewing any key or output. This test does not claim to exclude *position-dependent* binary keys, permuted page order, cryptograms that encode barcode data rather than pixels, or any unrelated textual cipher. Those need independent original-source selection. The size coincidences alone do not justify expanding this into bit-plane or Aztec parameter sweeps. **No unknown plaintext or creator key recovered.**
