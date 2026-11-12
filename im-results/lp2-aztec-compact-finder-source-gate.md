# Aztec 27×27 opening and 11×11 tree: exact original-source finder obstruction

**12 November 2026, Agent 10. Status: bounded negative test of an unselected historically available interpretation.** No unknown Liber Primus plaintext, authentic key or original encryption mechanism is recovered.

## Source and human solve-path candidate

A solver in 2014 could have known **ISO/IEC 24778:2008**, which specified Aztec Code as a 2D symbol with a dark/light concentric-square finder. Compact four-layer Aztec Code uses a **27×27** module square, with a central **11×11** core. Its separate **Aztec Rune** variant occupies an **11×11** symbol and carries an eight-bit payload. Original LP2 physical pp0–2 supply exactly **729 = 27²** GP29 runes; physical p32 supplies **121 = 11²**. These size correspondences nominate a finite, visual interpretation to test. No original markup says to use Aztec Code, to reshape the three opening pages into a raster, or to read p32 as an Aztec Rune. Numerous other square layouts are possible.

The standards-fixed **central 9×9 finder** is 81 modules with alternating ring colors: the center and each even-Chebyshev-radius ring are dark, and odd-radius rings are light. This pattern is invariant under all square rotations/reflections; polarity reversal exchanges light/dark without changing the contradiction count. Mode-message and data Reed–Solomon decoding make sense only after this mandatory structure is satisfied.

Historical standard (issued 2008): [IEC ISO/IEC 24778:2008](https://webstore.iec.ch/en/publication/11217); [exact 2008 finder specification](https://standards.iteh.ai/catalog/standards/iso/3902d477-8dfa-482f-899f-95fa0db3a631/iso-iec-24778-2008). Aztec Rune's 11×11 size and same compact finder: [symbol structure](https://barcodeguide.seagullscientific.com/Content/Symbologies/aztec_rune.htm). The 27×27 compact four-layer size is also listed by [IATA's Aztec size table](https://www.iata.org/contentassets/1dccc9ed041b4f3bbdcf8ee8682e75c4/2021_03_02-bcbp-implementation-guide-version-7-.pdf); this last document is a modern reference to an older standard.

## Completely secret alphabet, exact answer

Take the original GP29 rune identities directly from [the canonical physical-page corpus](../resources/liber-primus/lp2-corpus.json). Arrange p0||p1||p2 in chronological row-major order as 27×27 and p32 alone as row-major 11×11. Make no transcription changes, missing-rune insertions, symbol skips, payload corrections or word resets.

**Grant the entire binary assignment of the 29 GP rune identities as a secret.** Let `x_g in {0,1}` assign one light/dark value to every original rune identity. On every fixed central finder module of source glyph `g`, require `x_g = finder_color`. For each rune label `g`, count the fixed finder sites requiring light `L_g` and dark `D_g`. A rune appearing in both classes makes the exact hidden mapping impossible. The exact minimum number of finder modules needing alteration under **all 2²⁹ stationary maps** is `sum_g min(L_g,D_g)`, attained by choosing each glyph's majority color.

| Original input | Finder modules | Rune identities in finder | Rune identities requiring both colors | Minimum wrong finder modules with *any* 29→2 map |
| --- | ---: | ---: | ---: | ---: |
| pp0–2, 729 runes, 27×27 | 81 | 27 | **20** | **24/81** |
| p32, 121 runes, 11×11 | 81 | 28 | **16** | **19/81** |

Both have strict contradictions to an exact stationary one-rune→one-binary-module encoding, even if the binary alphabet is wholly unknown. No key enumeration, entropy fit or English score enters. The 9×9 finder is symmetric, so row/column reversal, reflection, rotation, and color inversion cannot remove the contradiction. A genuine synthetic binary Aztec finder planted into the *same original-sized input streams*, using two arbitrary rune identities, achieves exactly zero mismatch under the same inference. The positive proves the gate distinguishes an encoded finder from these inputs.

**Reproduce:** [one-file CommonJS source test](../sims/lp2_aztec_compact_finder_original_sft.cjs) reads the exact original corpus and asserts both numeric results and the matching planted controls. The original rune arrays and standard geometry suffice; no barcode decoder package or image-processing threshold is required for this necessary-condition test.

## Decision and limits

**Retire the direct stationary binary Aztec barcode reading of the opening 27×27 and p32 11×11 rune streams.** Neither can carry the mandatory compact finder under any fixed secret rune-to-bit assignment. This gate deliberately does *not* test a ciphered Aztec bitstream, a symbol-dependent evolving bit mapping, a non-row-major traversal, a spatially shifted/resized finder, preprocessing, or a disguised Aztec object located elsewhere. Those families need an independent artifact instruction to justify their additional degrees of freedom. The numerical square-size matches alone do not establish creator intent and do not nominate an LP2 key or new plaintext.

The result is an efficient exact exclusion of a previously untested source-sized barcode interpretation, not evidence that the source is itself an Aztec code.