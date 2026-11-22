# LP2 historical JPEG distribution differential: original runes stable in the inspected mirrors

**Agent 4, 11 November 2026. Issue #245. Classification:** bounded historical source-and-image gate. No original ciphertext revision, new plaintext or cryptographic differential key recovered.

## Earliest pinned distribution and aligned mirror sets

The [micheloosterhof Stage11 archive](https://github.com/micheloosterhof/cicada-2014/tree/6c3421a4d/stage11/ky2khlqdf7qdznac.onion) committed **58 numbered JPEGs and the Stage11 index on 11 May 2014 at 18:33:43 UTC**, commit `6c3421a4d`. Its earliest image tree and present tree have exactly the same Git object SHA for **all 58 files** (p0–p57), and the archived `index.html` object also has the same SHA. The two checked endpoints of individual image history, `0.jpg` and `57.jpg`, show just the original commit. The [current repository's original 17–74 images](../resources/liber-primus/README.md) match this earliest 2014 image tree **58/58 byte-for-byte** after applying the p+17 page renaming.

The following other archive-tree *heads* independently checked against the same 58 Git blob SHAs also match exactly. Different repositories do not automatically imply independent original releases; some are later mirrors and forks:

| Repository / retained image path | First archive date or repository creation | Result for LP2 58 images |
|---|---|---|
| [micheloosterhof/cicada-2014, Stage11](https://github.com/micheloosterhof/cicada-2014/tree/6c3421a4d/stage11/ky2khlqdf7qdznac.onion) | 11 May 2014 first image commit | Original reference, 58/58 |
| [rtkd/iddqd, full images](https://github.com/rtkd/iddqd/tree/master/liber-primus__images--full) | Repository created 4 January 2017 | 58/58 |
| [scream314/cicada3301, complete](https://github.com/scream314/cicada3301/tree/master/assets/2014/liber-primus-complete) | First relevant commit 24 January 2018 | 58/58 |
| [tweqx/scream314-cicada3301, complete](https://github.com/tweqx/scream314-cicada3301/tree/master/assets/2014/liber-primus-complete) | Fork created 9 January 2022 | 58/58 |
| [iBotPeaches/cicada_3301](https://github.com/iBotPeaches/cicada_3301/tree/master/liber_primus) | First relevant commit 21 January 2024 | 58/58 |
| [krisyotam/cicada3301, original-onion7](https://github.com/krisyotam/cicada3301/tree/main/liber-primus/original-onion7) | Repository created 8 November 2026 | 58/58 |
| [krisyotam/cicada3301, pages](https://github.com/krisyotam/cicada3301/tree/main/liber-primus/pages) | Same later archive | 58/58 |

**Differing distribution found and tested.** The [neuroretransmit/cicada seventh-onion folder](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/011-seventh-onion) carries 58 *different file hashes*. This material was added to that Git archive in a **15 December 2022** commit (`700b8e5a9`), so the commit date is evidence of archival preservation, not proof of a separate creator dispatch in 2014.

## Source-content comparison of the divergent archive

The first 35 neuroretransmit differences are **exactly the 18-byte JPEG APP0/JFIF segment removed** from the source: the remaining compressed file bytes are otherwise identical. This exact reconstruction was checked against all 35 individual file Git blob SHAs.

The remaining **23 pages** are different JPEG encodings with different quantization/Huffman tables and small, dispersed decoded pixel differences. Their local LP2 page numbers are:

`16–21, 24–25, 28–31, 41–48, 50–52`.

A pinned Windows 11-compatible Python/Pillow workflow compared both **2400×3600 decoded RGB rasters** and **binary dark-pixel masks at threshold 128** for all 58 pairs:

- 35 files differ only by the missing 18-byte JFIF header. Decoded images are necessarily identical.
- 23 files differ in RGB pixels; mean absolute per-channel difference is at most **0.201 pixel levels on the 0–255 scale**, consistent with a light JPEG re-encode.
- Of those 23, **10** have *zero* dark-pixel-mask differences at threshold 128; the other 13 range from **232 to 1,153** isolated disagreements across the entire 8.64-million-pixel page.
- Across **all 23**, the maximum dark-mask disagreement within any **128×128** image tile is **38 pixels**. There is no concentrated new, missing or moved rune-shaped region in this threshold control. LP2 pages 41–48 yield nearly identical totals (905–909) and spatial concentrations, a signature of common raster processing.

This finite test does not establish *perfect glyph equivalence at every possible threshold*, nor author attribution. It gives direct evidence against a substantive source edit: the observed differences follow JPEG metadata deletion or low-amplitude recompression rather than any identified change to original ciphertext.

**Exact reproducible comparison:** [`sims/lp2_2014_archive_jpeg_diff_sft.py`](../sims/lp2_2014_archive_jpeg_diff_sft.py), pinned at [`neuroretransmit/cicada@ade9a02`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3), via [manual workflow](../.github/workflows/lp2-historic-jpeg-differential-manual.yml). [Successful workflow run 43030081451](https://github.com/FlareZ123/liber-primus/actions/runs/43030081451) contains each page's byte sizes, RGB changes, ink-mask counts, local-tile maxima, and summary.

## Decision

**Close the proposed authentic-edited-ciphertext route within these dated distributions.** No independently attested May 2014 image revision with changed runes, punctuation or layout was found; hence there is no *creator-attributable ciphertext differential pair* from which a feedback cipher or key could be recovered. Retain the original 11-May-2014 image byte stream as the valid reference. Reopen only for a newly recovered primary 2014 author-distributed revision with a dated independent witness and a source-visible rune or punctuation difference. Further anonymous JPEG recompressions do not justify a differential-cipher attack.