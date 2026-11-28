# LP2 allrunes slot gate and authoring-pipeline refinement

## Result

Round-18's named NC-4/NC-5 font gaps are now closed, and the authoring pipeline is further constrained from original LP2 bytes, period source code, historical font packages, and independent mirrors.

1. **The TeX allrunes Type-1 family is excluded as the Liber Primus rune face.** The test covered all 216 PFB faces installed by the stable allrunes v2.1 package (package date 2004-01-06). It rebuilt 18 independently labelled LP2 rune classes directly from solved page 57 (resources/liber-primus/74.jpg) and then gave every candidate face an intentionally generous oracle: each LP rune could map to any distinct printable Type-1 slot, labels were ignored, and both shapes were independently stretched to 96x96 before IoU scoring. The best of 216 faces, fruabt.pfb, still scored mean distance **0.258975**. Repeated occurrences of the same LP2 runes average **0.028294** (95th percentile 0.086957), while the winning face's own render -> JPEG-q92 -> re-match control averages **0.024389** and never exceeds **0.043686**. The gap is far beyond the observed rendering/JPEG noise. This closes the custom-encoding allrunes gap left open by the prior Round-18 toolchain analysis.

2. **A standard one-command ImageMagick PDF/PS delegate does not explain the LP2 fingerprint in the 2014 codebase.** ImageMagick 6 source immediately before and during May 2014 sets GSColorDevice=pnmraw (and GSMonoDevice=pbmraw) in configure.ac; config/delegates.xml.in invokes that device for ps:color. A normal ImageMagick document decode therefore passes a PNM raster from Ghostscript to ImageMagick. That path cannot preserve the Ghostscript JPEG's Artifex ICC block or its 4:2:0 JPEG sampling, whereas the published LP2 files preserve both before the ImageMagick q92 optimized re-encode. The observed chain therefore requires a **real Ghostscript JPEG intermediate** (or an equivalently explicit non-default delegate), rather than merely the hidden Ghostscript subprocess of ordinary ImageMagick document decoding.

3. **The optimisticninja LP2 mirror is a metadata rewrite, not an alternate raster or earlier JPEG generation.** For all 58 LP2 pages (17.jpg through 74.jpg), its file-size delta from the scream314/original lineage is exactly one of two constants: -2476 bytes for RGB pages and -2488 bytes for one-component grayscale pages. Binary comparison explains both constants. The mirror replaces the original 2612-byte post-SOI metadata prefix (JFIF APP0 plus 2576-byte Artifex ICC in APP2) with a minimal EXIF APP1: 136 bytes total on RGB pages and 124 bytes total on grayscale pages. On checked RGB page 17 and grayscale pages 33 and 58, **every byte from the first DQT marker through EOI is identical** to the original lineage. The RGB EXIF records 2400x3600, 400x400 dpi, 8 bits, YCbCr subsampling 2x2, and centered positioning; the grayscale EXIF is 12 bytes shorter because it omits the YCbCr tags. Therefore absence of the Artifex ICC in this mirror is not independent evidence about Cicada's authoring software. Future archive comparisons should fingerprint the DQT-to-EOI suffix before treating whole-file hash or metadata differences as new source evidence.

4. **Junicode 0.7.8, the period Junicode release named as NC-4 in the prior toolchain work, is excluded.** CI fetched Ubuntu's `fonts-junicode_0.7.8-2_all.deb` (the 2013 package available before LP2), extracted all four faces, and ran the same 18-class solved-page gate. The best face is **Junicode-Bold.ttf at mean IoU distance 0.306284**. LP2 repeated-rune noise is 0.028279 mean / 0.086957 p95, and the same candidate's render->JPEG control is 0.021152 mean / 0.061552 p95. Regular scores 0.475169, BoldItalic 0.587880, Italic 0.732181. The observed/candidate gap is therefore much larger than the measured rendering and repeated-glyph noise. Full per-rune scores are preserved in `im-results/junicode-078-gate.json`; the reusable direct-Unicode matcher is `sims/lp2_period_unicode_font_gate.py`.

5. **Everson Mono 6.2.1, the other named NC-4 period candidate, is excluded; NC-4 is therefore closed.** CI fetched the exact pre-LP2 NetBSD/pkgsrc distfile `evermono-6.2.1` whose 2012 package metadata pins SHA-1 `a1e81db066ffb15413220d5f78c1b19c49fd4aab`, then scored all four faces with the same 18-class gate. The best is **Everson Mono Bold.ttf at mean IoU distance 0.453035**; its render->JPEG control is 0.023496 mean / 0.042326 p95. Regular scores 0.556545, Bold Oblique 0.671251, Oblique 0.738460. With Junicode 0.7.8 also excluded and the allrunes custom-slot search closed independently above, every named font gap from Round-18 NC-4/NC-5 has now been measured and rejected. Full Everson per-rune scores are preserved in `im-results/everson-mono-621-gate.json`.

6. **Hnias 3.3 (2004) is also excluded.** This was a period Unicode Runic candidate absent from the prior 11-face bank. Its internal name/version records identify Hnias 3.3 / version 3.003 with a 2004 creation date. Direct Unicode matching over the same 18 solved LP2 classes gives mean IoU distance **0.332188** (median 0.327167, max 0.504277), versus LP2 repeat noise 0.028279 and the face's render->JPEG control 0.019818 mean / 0.033926 p95. Full per-rune scores are in `im-results/hnias-2004-gate.json`.

7. **A codepoint-blind legacy-font gate excludes three more mirrored faces, including an internally dated 1998 Futhark family.** `sims/lp2_unencoded_font_slot_gate.py` renders every distinct cmap glyph and lets a Hungarian oracle assign any 18 distinct slots to the 18 LP2 rune classes, so keyboard encoding cannot cause a false rejection. The best candidate, **Futhark AOE Regular** (internal Fontographer version date 1998-05-26), scores **0.333581** mean distance with a 0.023688 render->JPEG control; Futhark AOE Inline scores 0.412555 and Robert's Runes 0.404128. These mirror-derived files are auxiliary exclusions rather than independently archived period provenance, but the test demonstrates that legacy custom keyboard mappings are directly testable without knowing their mapping. Full output is in `im-results/legacy-rune-font-slot-gate.json`.

8. **Curtis Clark's Elder Futhark (copyright 1995; public distribution predates 2005) is excluded under the codepoint-blind oracle.** The recovered `RUNE.TTF` has 55 distinct renderable cmap shapes; the best injective assignment of any 18 of them to the 18 solved LP2 rune classes still scores **0.473903** mean IoU distance. Its render->JPEG control is 0.047507 mean / 0.093676 p95. Because the test discards the keyboard mapping entirely, the rejection is about glyph geometry rather than its legacy encoding. Full output is in `im-results/curtis-clark-elder-futhark-slot-gate.json`.

The second result sharpens what should be searched for in old participant/server backups: besides the upstream typeset source, an intermediate 58-page RGB JPEG batch may have existed before ImageMagick's automatic grayscale collapse. Such intermediates would have standard Ghostscript Huffman tables and the same Artifex sRGB profile on every page, including pages that became one-component grayscale in the public dump.

## Reproduction

Run:

    python sims/lp2_allrunes_slot_gate.py \
      --image resources/liber-primus/74.jpg \
      --output im-results/lp2-allrunes-slot-gate.json

Requirements: Python 3, Pillow, NumPy, SciPy, and TeX Live's allrunes Type-1 package. The script asserts the 2400x3600 source geometry, the expected 17/18/23 rune counts on the final three solved lines, exactly 18 labelled rune classes, and 216 PFB candidate faces before scoring.

The local run used the repository source image and produced:

- LP2 repeated-rune noise: 106 pairs, mean 0.028294, p95 0.086957, max 0.101262.
- Best allrunes face: fruabt.pfb, mean injective-oracle distance 0.258975 over 18 classes.
- Best-face render/JPEG control: 103 distinct slots, mean nearest distance 0.024389, p95 0.039260, max 0.043686.
- Next faces: fruabm 0.265241, fruabs 0.271205, fruabn 0.290103, frucbm 0.290732.

For historical-mirror triage:

    python sims/jpeg_dqt_suffix_fingerprint.py mirror.jpg original.jpg

If `same_dqt_to_eoi` is true, the compressed raster is the same JPEG codestream despite metadata-prefix differences. The observed optimisticninja comparison used repository blobs `babd60d190e0903805a9f9e268393960cf68173c` versus `abab573f7a3786f46fe4fab17d5f2dcf2476136b` for page 17; the DQT-to-EOI suffixes are byte-identical.

## Evidence classes and limits

**Direct LP2 measurement:** page geometry, rune segmentation, repeated-rune noise, and the 216-face score are computational observations from the repository's original image. The historical-mirror result is a byte comparison against `cicada-solvers/optimisticninja_cicada3301` and the independent `scream314/cicada3301` original-lineage copy.

**Period font evidence:** Junicode was tested from the pre-LP2 Ubuntu/Debian 0.7.8 package rather than a current redesign. Everson Mono was tested from the exact pre-LP2 6.2.1 distfile pinned by 2012 pkgsrc metadata. The full four-face outputs are committed in `im-results/junicode-078-gate.json` and `im-results/everson-mono-621-gate.json`. Hnias 3.3 adds an independently identifiable 2004 Unicode candidate in `im-results/hnias-2004-gate.json`.

**Period source-code evidence:** the ImageMagick delegate statement comes from upstream ImageMagick6 commits cfd591455e6cb7da54e44f0b544b0b886de6567f (2014-02-10) and eb90e8571935b9e61d8730fc8caf13d5960c5ab6 (2014-05-16), both of which set GSColorDevice=pnmraw. The earlier external toolchain report is Dukotah/cicada3301, liber-primus/analysis/round18/L1-toolchain/RESULTS.md; its NC-5 explicitly left the allrunes custom-encoding slot search undone.

**Not established:** this does not identify the actual rune font. The named NC-4/NC-5 candidates plus Hnias, Futhark AOE and Curtis Clark's Elder Futhark are excluded, so the live font route now requires a different period face or recovery of the embedded source font itself. This also does not identify exact Ghostscript/ImageMagick point releases, upstream source format (PDF vs PostScript vs another Ghostscript-readable representation), or any plaintext/key. The font result is an exclusion; the delegate result narrows the authoring/export path and creates a concrete intermediate-artifact acquisition target. The optimisticninja mirror does not recover that target because its entropy-coded JPEG content is unchanged.
