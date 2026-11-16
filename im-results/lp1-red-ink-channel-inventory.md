# LP1 red-ink inventory and image-10 JPEG trailer

**Status:** established physical-artifact observation; red-channel interpretation remains open.

## Source and scope

The supplied liber-primus-jpegs.zip contains 75 numbered JPEGs, 00–74. The first 17 are the LP1 archive image set; the remaining 58 are the LP2 set. The repository's LP2 transcription and red-ink audits do not cover the LP1 red channel. The current LP1 canonical transcription has 16 text segments, so do not assume a one-to-one mapping from all 17 image indices to text segments without aligning the cover/sequence first.

Red pixels were counted with the fixed mask R>140, G<120, B<120, R−G>60, R−B>60.

## LP1 red-ink distribution

Red pixels occur on LP1 image indices 1, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15 and 16. Indices 0, 2, 7 and 8 have no pixels meeting the mask. Visual inspection of the red-only contact sheet shows a large left-margin arrow-like mark on indices 1, 3, 4, 6, 10, 13, 14 and 16; several other images carry short red rune strings and dotted separators without that mark.

This inventory is not a transcription. The red glyphs are not color-tagged in resources/transcriptions/lp1_wulfic_canonical.txt, and no plaintext/key interpretation is established. The arrow-marked indices are a candidate selection channel, not yet a justified decoding rule.

## Image-10 concatenated JPEG

LP1 archive image 10.jpg is 4,240,957 bytes. Its first JPEG ends at byte offset 754,662. A second JPEG begins immediately there and is 3,486,295 bytes, SHA-256 8c90214a46cb6fa563bcfb46012c1cf7c4dcbd9d1db62c37c856074c756aafff. Both JPEGs decode as 2400×3600 RGB images.

The appended image is **pixel-identical** to standalone 11.jpg in the supplied ZIP, despite having a different JPEG encoding. The full 10.jpg SHA-256 is 12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376. Independent archive research reports the same full 10.jpg bytes under the Onion-6 archive path; see the linked trailing-data ledger. Therefore this trailer is a duplicate of LP1 image 11, not an additional encrypted payload or a previously unknown page.

## Research decision

Do not spend further effort treating the image-10 trailer as hidden ciphertext: it is a second encoding of image 11. The still-open, source-grounded question is the LP1 red layer itself. The next discriminating step is to transcribe only red runes and separators on image indices 1, 3–6, 9–16, align them to the canonical LP1 transcription, and test whether the arrow-marked subset selects a coherent sequence without tuning offsets or arbitrary transforms. If the red glyphs simply duplicate black text or yield no consistent selection, retire that branch.

## Reproduction and sources

Run:

    python sims/lp1_red_ink_channel_inventory.py /path/to/liber-primus-jpegs.zip

External corroboration for the concatenated-image observation:
- [Dukotah corpus trailing-data report](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/REPORT-A.md)
- [Dukotah trailing-data ledger](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/TRAILING-DATA.json)

The local test additionally compares the appended image's decoded RGB pixels against standalone 11.jpg, establishing exact pixel identity.
