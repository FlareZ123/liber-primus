# Original shared-plate JPEGs: complete native coefficient-difference gate

**Agent8, Director Issue #2209, 22 November 2026.** Seven first-party repeated-art groups have pixel-identical copied plate regions under their authentic, unchanged source geometry. Exhaustively comparing all original *quantized JPEG coefficients* inside the complete contained 8×8 blocks of these original-image rectangles gives **zero page-specific changes** across **29 original JPEG comparisons and 813,882 luminance blocks**, representing **52,088,448 exact luminance coefficient comparisons**. The additional 17 same-RGB-image comparisons likewise show **zero changes** across **177,642 Cb/Cr blocks**, or **11,369,088 exact chrominance coefficient comparisons**. Thus the examined exact source-plate regions have **63,457,536 equal same-location native DCT coefficients**. There is no differential bitstream, parity channel, extractable byte, or key in these specific original reused-plate footprints.

This is a **strict local source-native exclusion**, with a real synthetic 40-bit positive decoder; it does not establish that all first-party image carriers are empty. In particular, the repeated images could share a common payload inserted *before* copying, and visually distinct foreground, single-page objects, or original external parent plates remain outside the compared regions. No unknown LP2 plaintext or crypto opcode was recovered.

## Human solve path and first-party source

Earlier genuine Cicada 3301 puzzles used image-embedded payloads, so a human examining repeated LP2 illustrations could reasonably compare the original JPEGs rather than inventing a long decryption key. The [exact compositor atlas](lp2-original-exact-compositor-layer-atlas.md) establishes seven ordinary exact pixel-reuse groups and image-registered rectangles independently of this native coefficient experiment. The original release is the custodian 75-file JPEG corpus; the exact concatenated SHA-256 of the images 00.jpg–74.jpg is `cdda41395a52761be5d00c52ec4a2c1c769f9a9f756974a7ec62d4bbf4156dc1`. Physical LP2 pN is original scan `N+17.jpg`.

These are the frozen exact rectangular original-image pixel ROIs, with the first and all later pages in each group compared at the same native spatial DCT coordinate. Only **full contained 8×8 blocks** are admitted, preventing out-of-ROI typography from contaminating edge blocks.

| Original copied design | Physical LP2 pages | Exact source pixel ROI (x0,y0,x1,y1) | Pairs | Y blocks compared per pair | Differences in quantized original Y coefficients |
| --- | --- | --- | ---: | ---: | ---: |
| Triple-bar cross | p1↔p2 | (0,900,450,2650) | 1 | 12,208 | **0** |
| Bilateral scrolls | p4↔p5,p6,p7 | (0,850,560,2600), (1800,850,2400,2600) | 3 | 31,610 | **0** |
| Right saplings | p9↔p11,p13 | (1850,600,2400,2900) | 2 | 19,516 | **0** |
| Left saplings | p10↔p12,p14 | (0,600,550,2900) | 2 | 19,516 | **0** |
| Insect wings | p24↔p26 | (0,1000,520,2600), (1800,1000,2400,2600) | 1 | 28,000 | **0** |
| Cuneiform header | p34↔p35,p36,p37,p38,p39 | (900,250,1450,670) | 5 | 3,468 | **0** |
| Bilateral floral frames | p40↔p41 through p55 | (0,650,550,2950), (1850,650,2400,2950) | 15 | 38,896 | **0** |
| **Total** | | | **29** | **813,882** | **0** |

The cross and insect-wing luminance exactities were individually known from the narrower original-source [#2180 audit](lp2-original-jpeg-reused-plate-coefficient-gate.md). This work extends that to the remaining five groups, especially **15 complete floral-frame comparisons** on p40–p55. Their exact native Y equality holds even when the pasted source was published as grayscale on some pages and full RGB on other pages.

For two color JPEGs in the same group, a separate component-native **Cb and Cr** comparison uses original component sampling factors and original quantization tables to select the corresponding complete contained chroma blocks, never inventing a resampled 8×8 alignment. Both chroma channels are identical across all 17 eligible RGB-to-RGB pairs, covering **177,642 matching chroma blocks**. For 12 cross-type pairs (11 floral gray-vs-color plus insect gray-vs-color), a matching native chroma component does not exist, so the chroma comparison is inapplicable; do not report an invented chroma equality for those pairs.

## Carrier-positive and original negative

The original-image test reads quantized coefficients **before any JPEG recompression**, directly with the libjpeg `jpeg_read_coefficients` interface. It confirms the native dimensions 2400×3600, 300×450 Y block grid, equal luma quantization tables, pixel-registered atlas rectangles, and all 64 original coefficients per valid block, including DC and every AC amplitude. Across all 29 pairs, all 813,882 blocks are exactly identical. In particular, the number of differing original AC parities in the reused art is **0**, leaving **zero bits available for a page-specific coefficient-difference payload** under the stated differential receiver.

As an explicit capacity/decoder positive, a throwaway *synthetic* copy of the original p40 JPEG is modified at the **first 40 nonzero AC sites with absolute magnitude ≥2** in the frozen floral ROI (row-major original block ordering, then coefficient index 1..63). The independently reread synthetic JPEG extracts the 40-bit payload `33 33 30 31 0A` in hex, ASCII **`3301\n`**, exactly. The synthetic message is a planted fixture, **not** authentic Cicada evidence. The positive shows that a native coefficient LSB payload at the specified sites would be observable, so the lack of real differences is a true capacity exclusion for *differential signals within these footprints*. The planted image is never substituted for the authentic sources.

## Reproduction and decision

- [C99/libjpeg source SFT, all 29 original Y comparisons plus planted 40-bit positive](../sims/lp2_all_original_reused_plate_native_dct_payload_sft.c).
- [C99/libjpeg source SFT, original Cb/Cr on the 17 compatible RGB comparisons](../sims/lp2_all_original_reused_plate_native_chroma_sft.c).
- Source copies: `resources/liber-primus/18.jpg` through `72.jpg` as selected by the frozen group manifest. The C programs require an original-JPEG directory and the luminance test also a **new temporary** output JPEG path for its known-positive copy; do not overwrite the source.
- [Independent GitHub Actions native-source PASS 45008798510](https://github.com/FlareZ123/liber-primus/actions/runs/45008798510) on the repository source JPEGs, with exported original Y and Cb/Cr CSVs and the planted 40-bit positive; the workflow checks 29 Y original pairs, 34 original Cb/Cr comparisons and 12 non-RGB skips exactly.
- Locally executed original-bit-exact C99/libjpeg 2.1.5 run: all 29 Y and 17 two-component original color comparisons report 0 coefficient differences, and the planted 40-bit extraction prints `PLANTED_POSITIVE,40,5,3301_newline,PASS`. Both programs now treat a real difference as a failing source-gate condition so a later source drift cannot silently pass.

**Decision:** close the original-image reused-plate **page-differential** carrier route at its measured zero-bit capacity. Do not rerun arbitrary XOR, LSB passwords, region shifts, or recompressed JPEG subtraction over those seven exact same-grid plates. Only a creator-authored per-copy edit outside the admitted rectangle, a historically authenticated *clean parent* exposing a common pre-embedded payload, or an independent original-region selector would make further art-carrier work causally relevant to unknown-page plaintext.

The result changes the source image decision rather than purporting to find a novel cipher: **the difference between these exact copies is literally empty in the quantized native coefficient domain**. Unknown pages p0–p55 still require an authentic key or invertible operation.