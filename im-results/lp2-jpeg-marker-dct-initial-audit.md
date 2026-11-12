# LP2 original JPEG marker and DCT-coefficient audit (initial, incomplete)

**Status: preliminary structural baseline; Issue #518 remains open.** This is not a steganographic negative or a claim that the pages contain no payload. The required authenticated 2014 carrier positive control has not yet been compared, and no source-selected extraction operation has been established.

## Scope and method

Audited the 58 original LP2 JPEGs numbered 17–74 in the supplied image archive (LP2 pages 0–57). The marker pass reads the original bytes directly; it does not decode/re-encode the images. The DCT pass uses libjpeg's `jpeg_read_coefficients` API to inspect the quantized coefficient arrays, not a DCT recomputed from decoded pixels.

Reproduce after extracting the source images:

```sh
unzip -oq liber-primus-jpegs.zip 'liber-primus-jpegs/*.jpg' -d /tmp/lp-images
python3 sims/lp2_jpeg_marker_audit.py /tmp/lp-images/liber-primus-jpegs/{17..74}.jpg
cc -O2 sims/lp2_jpeg_coeff_audit.c -ljpeg -o /tmp/lp2-jpeg-coeff-audit
/tmp/lp2-jpeg-coeff-audit /tmp/lp-images/liber-primus-jpegs/{17..74}.jpg
```

## Observations

- All 58 files parsed as 2400×3600, 8-bit, three-component, baseline sequential JPEGs; one scan, restart interval 0, valid EOI, and no bytes after EOI.
- Two marker profiles occur:
  - **35 pages:** APP0, APP2, two DQT segments, SOF0, four DHT segments, SOS, EOI.
  - **23 pages:** APP0, APP2, one DQT segment, SOF0, two DHT segments, SOS, EOI.
- The 23-page single-DQT/two-DHT profile comprises LP2 pages 16–21, 24–25, 28–31, 41–48, and 50–52. All 15 pages with red-ink spans are in the 35-page two-DQT/four-DHT profile. This is consistent with different color/monochrome encoding profiles; it is not, by itself, evidence of an embedded payload.
- Quantized DCT coefficients were successfully read for all 58 pages. The preliminary per-component summaries show the expected sparse chroma coefficients in the one-table profile. No page-specific coefficient outlier has yet been established; the histograms have not been compared against the 2014 positive control or a matched source batch.

## Decision and next test

Do not run OutGuess, OpenPuff, JSteg, F5, or arbitrary coefficient/channel extraction on this evidence alone. The next decisive step is to obtain the exact authenticated 2014 JPEG carrier and run both scripts on it, then compare its marker tables and coefficient signatures with the LP2 profiles. Continue only if the control supplies a distinctive, reproducible carrier signature and an original LP2 clue selects a page, coefficient/channel, extraction rule, and payload format. If the control is not comparable or no LP2 selector exists, close #518 as a bounded structural no-match while preserving the baseline.
