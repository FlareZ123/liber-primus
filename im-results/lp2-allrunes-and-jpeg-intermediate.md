# LP2 allrunes slot gate and authoring-pipeline refinement

## Result

Two previously open authoring-toolchain questions can be narrowed from original LP2 bytes plus period source code.

1. **The TeX allrunes Type-1 family is excluded as the Liber Primus rune face.** The test covered all 216 PFB faces installed by the stable allrunes v2.1 package (package date 2004-01-06). It rebuilt 18 independently labelled LP2 rune classes directly from solved page 57 (resources/liber-primus/74.jpg) and then gave every candidate face an intentionally generous oracle: each LP rune could map to any distinct printable Type-1 slot, labels were ignored, and both shapes were independently stretched to 96x96 before IoU scoring. The best of 216 faces, fruabt.pfb, still scored mean distance **0.258975**. Repeated occurrences of the same LP2 runes average **0.028294** (95th percentile 0.086957), while the winning face's own render -> JPEG-q92 -> re-match control averages **0.024389** and never exceeds **0.043686**. The gap is far beyond the observed rendering/JPEG noise. This closes the custom-encoding allrunes gap left open by the prior Round-18 toolchain analysis.

2. **A standard one-command ImageMagick PDF/PS delegate does not explain the LP2 fingerprint in the 2014 codebase.** ImageMagick 6 source immediately before and during May 2014 sets GSColorDevice=pnmraw (and GSMonoDevice=pbmraw) in configure.ac; config/delegates.xml.in invokes that device for ps:color. A normal ImageMagick document decode therefore passes a PNM raster from Ghostscript to ImageMagick. That path cannot preserve the Ghostscript JPEG's Artifex ICC block or its 4:2:0 JPEG sampling, whereas the published LP2 files preserve both before the ImageMagick q92 optimized re-encode. The observed chain therefore requires a **real Ghostscript JPEG intermediate** (or an equivalently explicit non-default delegate), rather than merely the hidden Ghostscript subprocess of ordinary ImageMagick document decoding.

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

## Evidence classes and limits

**Direct LP2 measurement:** page geometry, rune segmentation, repeated-rune noise, and the 216-face score are computational observations from the repository's original image.

**Period source-code evidence:** the ImageMagick delegate statement comes from upstream ImageMagick6 commits cfd591455e6cb7da54e44f0b544b0b886de6567f (2014-02-10) and eb90e8571935b9e61d8730fc8caf13d5960c5ab6 (2014-05-16), both of which set GSColorDevice=pnmraw. The earlier external toolchain report is Dukotah/cicada3301, liber-primus/analysis/round18/L1-toolchain/RESULTS.md; its NC-5 explicitly left the allrunes custom-encoding slot search undone.

**Not established:** this does not identify the actual rune font, exact Ghostscript/ImageMagick point releases, upstream source format (PDF vs PostScript vs another Ghostscript-readable representation), or any plaintext/key. The font result is an exclusion; the delegate result narrows the authoring/export path and creates a concrete intermediate-artifact acquisition target.
