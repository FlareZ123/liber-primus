# LP2 original JPEG compressed-domain gate: canonical libjpeg serialization and dense-LSB screen

## Decision

All 58 original LP2 JPEGs, scans 17.jpg through 74.jpg, have a strong source-level invariant: after removing their one identical ICC APP2 segment, each file is byte-for-byte identical to a coefficient-preserving libjpeg reserialization with optimized Huffman coding. The source JPEGs therefore carry no independent per-page information in Huffman-table choices, entropy-code serialization, end-of-scan padding, or bytes after EOI. Those bytes are determined by the quantized DCT coefficients plus the ordinary JPEG parameters.

A separate paired-frequency screen rejects a dense sign-magnitude AC-coefficient LSB-replacement channel on the authentic images at the tested scale. Across every nonoverlapping window of 20,000 eligible AC coefficients with absolute value at least two, the minimum paired-frequency chi-square per degree of freedom is 2.569022 on physical p33. Whole-page minima are much larger: 25.712178 on p50. Deterministic planted random-LSB replacement on the first 20,000 eligible coefficients of p50, p55 and p57 drives the same statistic to 0.890680, 1.044514 and 0.927183, respectively, so the screen detects the intended positive control.

This closes two broad but finite hiding surfaces. Sparse embedding, F5 or matrix embedding, a coefficient-selection rule that preserves these paired histograms, spatial-domain steganography, and hidden information already represented by deliberately altered image coefficients remain outside this test. No unknown LP2 plaintext or key is recovered.

## Source facts

The test consumes only the repository originals under resources/liber-primus/, using the established mapping physical LP2 page p to scan p+17.

Every LP2 JPEG has exactly one 2,594-byte APP2 segment: four bytes of marker/length framing plus a 2,590-byte ICC_PROFILE payload. The payload is identical on all 58 files and identifies Artifex Software sRGB ICC Profile, copyright Artifex Software 2011. No LP2 source has APP1/EXIF, COM, DRI/restart metadata, or bytes after the final EOI marker.

For each source file the SFT performs jpeg_read_coefficients, copies the critical JPEG parameters, enables optimize_coding, and writes the unchanged quantized coefficients with libjpeg. Deleting only the original APP2 segment gives exact equality with the reserialized bytes for 58/58 files. This compares the complete remaining JPEG byte stream rather than decoded pixels or normalized table statistics.

## Dense coefficient-LSB screen

The screen traverses quantized AC coefficients in the source scan's MCU order and retains coefficients with absolute value at least two. Positive and negative magnitudes are treated separately. For each even/odd pair (2,3), (4,5), and onward with at least five observations, it computes the standard two-bin paired-frequency chi-square contribution and reports total chi-square divided by the number of contributing pairs.

Random LSB replacement tends to equalize each pair. The authentic corpus does not show that flattening at the registered 20,000-coefficient scale. The lowest authentic nonoverlapping-window ratio is 2.569022, while the three full-replacement planted controls are near one. This statistic is a bounded detector for dense sequential/random LSB replacement in the tested coefficient register. Ordinary image content changes the baseline, so the raw statistic is not an authorship probability.

## Reproduction

Build and run:

    g++ -std=c++17 -O2 -Wall -Wextra -pedantic sims/lp2_jpeg_libjpeg_canonical_and_lsb_sft.cpp -ljpeg -o lp2_jpeg_sft
    ./lp2_jpeg_sft resources/liber-primus

Expected decision lines include:

    PASS source_pages=58 exact_libjpeg_reserializations=58 shared_app2_total_bytes=2594
    PASS no_APP1_COM_DRI_or_post_EOI_payload=58/58
    authentic_min_full_chi2_per_df=25.712178 page=p50
    authentic_min_20k_window_chi2_per_df=2.569022 page=p33
    control_p50 original_first20k=4.601487 planted_random_lsb_first20k=0.890680
    control_p55 original_first20k=10.610778 planted_random_lsb_first20k=1.044514
    control_p57 original_first20k=9.608623 planted_random_lsb_first20k=0.927183

## Research consequence

Generic searches for a payload in optimized Huffman choices, scan padding, trailer bytes, or dense sequential AC-LSB replacement should be retired for these source files. Future JPEG work should require an independently motivated coefficient subset, embedding family, or visual receiver.
