# 2013 CicadaOS tape-to-2014 grid: complete contiguous and source-1033/3301-stride gates

**Original-source decision, 13 November 2026:** The complete **256-cell** LP2 numerical table is absent from all byte-aligned contiguous and exact **1033/3301-strided** samples of the preserved 2013 CicadaOS ISO under five tested source-reuse mask architectures and the eight geometrically original 32×8 table orientations. The direct and strided scans are distinct tests. **No new LP2 plaintext, authentic table key, source offset or destination was recovered.**

## Why a source-reuse hypothesis is meaningful

The original CicadaOS 2013 release contains public binary data later used for authentic XOR/binary challenges; LP2 2014 prints a visually separate 32×8 table of two-character numbers over pp49–51. A recognizable 2013 data fragment in that table could supply a historical key source and unambiguous source offset. In addition to contiguous copying, the manuscript's independently original-printed p33–39 cuneiform numeral pair spells **1033** and **3301** under conventional base60 notation. These two exact integers provide a finite, clue-constrained candidate for a strided extraction. **No original authorial instruction actually says to treat the cuneiform as sample strides in 2013 data**; this is a historically possible but conditional interpretation.

Use the preserved original [2013 ISO](https://connortumbleson.com/uploads/2024/01/3301.iso), verified MD5 **74062dee4093c6ca0340cda23f0e994b**. The authentic ISO9660 file DATA/560.13 contributes **118,818,811 bytes**; the raw ISO regions before and after that extent contribute **4,087,808** and **13,492,229 bytes**, respectively. These disjoint regions cover **136,398,848 bytes** without crossing the two extent boundaries. The exact original [2014 printed-table byte transcription](../resources/liber-primus/lp2-grid-256.json) has SHA256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Its base60 numeral reading is a repository working hypothesis, with remaining image transcription uncertainty.

Both exhaustive searches permit precisely **eight** table readings: the actual 32×8 rectangle in row-major or column-major order, independently keeping or reflecting the printed 32 rows and eight columns. Five independently tested mask architectures are (1) one secret XOR byte, (2) one additive byte modulo256, (3) a secret period-eight XOR-byte tape, (4) a secret period-eight modulo256 additive tape, and (5) one constant GP29 additive residue shift applied after reducing each source byte modulo29. These masks are granted secret values rather than supplied any presumed Cicada key.

## Contiguous original-data source scan

The prior direct scan tests every 256-byte start wholly inside each original ISO region. Key cancellation yields a six-difference byte or nine-difference GP29-residue signature, with no language scoring. Its indexed signatures and observed original-source matches were:

| Unknown mask model | Indexed exact source-table signatures over eight orientations | Matching historical windows |
| --- | ---: | ---: |
| Byte XOR constant | 1,456 | **0** |
| Byte additive constant | 1,456 | **0** |
| Byte XOR period-eight | 1,454 | **0** |
| Byte additive period-eight | 1,640 | **0** |
| GP29 additive residue constant | 1,606 | **0** |

All **5/5** original-sized secret-key plants recover 256/256, and original ISO/table checksums and extents match. The authoritative [original complete scan run 43341319497](https://github.com/FlareZ123/liber-primus/actions/runs/43341319497) and [original source test](../sims/lp2_2013_cicadaos_grid_tape_window_sft.cjs) give complete reproduction. A direct contiguous source offset is excluded for these five complete-table mask contracts.

## Cuneiform-selected strided original-data source scan

The distinct test samples exactly 256 bytes from each source region at positions **start + 1033·i** or **start + 3301·i** for source indices i=0 through255. All **eight original table orientations** and **five fully unknown mask families** above remain admitted, with no fitted extra phase, sample omission or changed byte. Three consecutive XOR/additive lag-one or lag-eight differences must agree before any 256-symbol match can occur, regardless of secret mask. Index the eight original-table three-difference signatures, scan **every valid source start** for both stated strides, and check every signature hit with the recovered one/eight mask against **all 256 original target values**.

| Original 2013 ISO source extent | Sample stride | Three-difference candidate hits | Full 256-byte source matches |
| --- | ---: | ---: | ---: |
| DATA/560.13, 118,818,811 bytes | **1033** | 39,425 | **0** |
| ISO before DATA/560.13 | **1033** | 1,251 | **0** |
| ISO after DATA/560.13 | **1033** | 4,400 | **0** |
| DATA/560.13, 118,818,811 bytes | **3301** | 38,855 | **0** |
| ISO before DATA/560.13 | **3301** | 1,040 | **0** |
| ISO after DATA/560.13 | **3301** | 4,222 | **0** |

The weak three-difference modulo29 screen naturally admits many random prefix hits. **None survives the full-table inverse.** Ten separate native **nonzero-stride, original-layout 256-byte planted controls** pass **10/10** under the exact same five models and both original-sourced strides. In the successful [original ISO CI run 43366407709](https://github.com/FlareZ123/liber-primus/actions/runs/43366407709), all three original source regions, both strides, five models and eight original orientations are checked and logged. The [single-file Windows-compatible CJS reproducer](../sims/lp2_2013_cicadaos_cuneiform_stride_sft.cjs) and [existing manual workflow](../.github/workflows/lp2-2013-cicadaos-grid-tape-manual.yml) can reexecute the complete original-source test without rerunning the older contiguous workload.

## Decision and stopping point

Neither the literal direct 2013 tape nor the two source-printed cuneiform **1033/3301 stride** transfers a complete table into the 2014 LP2 grid via an exact constant-byte or period-eight mask on the source rectangles. Therefore no historical byte tape offset or secret mask is recovered by these models. This does not exclude source-independent KDFs, a nonfixed sampling scheme, unpublished original assets, a different numeral radix, a cryptographic transform on the original data or a 2013 data key aimed at a different text receiver. The stride test is bounded by the only two independent manuscript numerals actually supplying these skip values. An alternative stride or decoder should first have independently attributable clue support rather than be tuned to this negative.

The original 56 unresolved LP2 pages remain without authenticated plaintext under these tests.
