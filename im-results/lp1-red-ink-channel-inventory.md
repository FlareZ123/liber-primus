# LP1 red-ink inventory and image-10 JPEG trailer

**Status:** established physical-artifact inventory; the provisional “red arrow” interpretation is superseded. The oversized forms are ordinary GP29 drop-cap initials already counted in the canonical text. No independent LP1 red-arrow selector, key or receiver has been established.

## Source and scope

The supplied `liber-primus-jpegs.zip` contains 75 numbered JPEGs, 00–74. The first 17 are the LP1 archive image set; the remaining 58 are LP2. LP1 has **15 rune-bearing pages**, represented by the 15 nonempty `%`-delimited pages in `resources/transcriptions/lp1_wulfic_canonical.txt`. Scan 00 is the cover and scan 02 is the “Chapter 1 / Intus” title card; the rune-bearing pages map as LP1 p0→scan01, p1→scan03, p2→scan04, …, p14→scan16. The earlier description of 16 LP1 text segments was incorrect.

Red pixels were counted with the fixed mask R>140, G<120, B<120, R−G>60, R−B>60.

## LP1 red-ink distribution

Red pixels occur on LP1 image indices 1, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15 and 16. Indices 0, 2, 7 and 8 have no pixels meeting the mask.

The eight scans previously described as carrying “large left-margin arrow-like marks” (01, 03, 04, 06, 10, 13, 14, 16) contain **nine oversized red runes** because scan 13 has two. All nine are ordinary GP29 initials at the start of a word or paragraph in the corresponding canonical page. Their source-coordinate measurements and exact text correspondences are in [the enlarged-initial control](lp1-enlarged-red-initials-original-dropcap-control.md), with a compact reproducible source-coordinate test in `sims/lp1_red_initial_dropcap_sft.py`.

This is a correction, not a new cipher channel: the large forms are drop capitals, not directional arrows or extra ciphertext symbols. The same convention occurs in both encrypted LP1 pages (p0 and p1) and clear-GP pages (p8, p11 and p14), so it does not identify cipher mode. The other red rune strings are colored portions of the printed text; no source instruction selects a separate red-only serialization or receiver. The repeated red dot motifs are also not per-occurrence key values: the cross-release stencil census records 20 LP1 11-dot instances and 9 LP1 10-dot instances ([source geometry](lp1-lp2-red-stencil-cross-release.md)).

**Decision:** retire the LP1 “arrow-selected subset” premise. Do not use these initials as an LP2 direction/key stream or launch a cross-release receiver search from them. A distinct, independently source-selected red instruction would be required to reopen the broader red-ink question.

## Image-10 concatenated JPEG

LP1 archive image 10.jpg is 4,240,957 bytes. Its first JPEG ends at byte offset 754,662. A second JPEG begins immediately there and is 3,486,295 bytes, SHA-256 `8c90214a46cb6fa563bcfb46012c1cf7c4dcbd9d1db62c37c856074c756aafff`. Both JPEGs decode as 2400×3600 RGB images.

The appended image is **pixel-identical** to standalone 11.jpg in the supplied ZIP, despite having a different JPEG encoding. The full 10.jpg SHA-256 is `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`. Independent archive research reports the same full image10 bytes under the Onion-6 archive path; see the linked trailing-data ledger. Therefore this trailer is a duplicate of LP1 image 11, not an additional encrypted payload or a previously unknown page.

## Reproduction and sources

Run the red-pixel inventory:

    python sims/lp1_red_ink_channel_inventory.py /path/to/liber-primus-jpegs.zip

Run the oversized-initial source-coordinate and canonical-context test:

    python sims/lp1_red_initial_dropcap_sft.py resources/liber-primus

The second test also accepts the original ZIP path and uses the canonical transcription by default. It verifies nine large red components and their page contexts; it is a source-coordinate SFT, not OCR or a cipher test.

External corroboration for the concatenated-image observation:
- [Dukotah corpus trailing-data report](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/REPORT-A.md)
- [Dukotah trailing-data ledger](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/TRAILING-DATA.json)

The local test additionally compares the appended image's decoded RGB pixels against standalone 11.jpg, establishing exact pixel identity.
