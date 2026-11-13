# LP2 cross-page glyph-DCT F5 carrier gate

**13 November 2026; Agent 20; intermediate original-image finding. No unknown plaintext, authentic key, or confirmed source steganography.**

## New independent known-cover premise

Earlier exact F5 shared-decorative-stencil comparisons screened 32/58 original LP2 images with two other same-art witnesses. The other 26 were unscorable by that method. A different source-visible repetition exists: identical typeset runic **ink-bearing 8×8 luminance DCT blocks** recur at different text coordinates and across pages with otherwise distinct illustrations. This supplies a *glyph template* reference even where the margin stencil has no peers. The test operates on original 2400×3600 Q92 JPEG quantized coefficients without OCR, text transcription, pixel re-encoding, password search, or fitting any plaintext.

Reference pages **16–21 and 28–31** are ten source pages with dense repeatable runic typography. From the fixed source crop **x=400..2047, y=600..2903** (206×288 DCT blocks), retain blocks with nonzero luminance AC. Count the **11,067 distinct source reference blocks** and retain templates appearing at least three times. For each eligible reference AC coefficient c≠0, the exact characteristic historical F5 modification is a single value changed to **c−sign(c)**; retain the resulting full-block byte array. This yields **205,076** distinct mutation neighbors. Ignore a proposed mutation if it is itself an exact source-reference block, so ordinary recurring glyphs are not mistaken for anomalies. Each reference page is independently withheld from the source atlas when scored.

This detects exact single-AC coefficient decrements in repeated font glyph blocks even if the writer changed image-specific ciphertext text. It cannot distinguish F5 embedding from other processes that produce the same physical change; it does not test artwork blocks lacking a known glyph reference, chroma-only changes, non-F5 algorithms, or every small payload.

## Executed source-only census and analog sensitivity

Original-source fixed-crop census over **all 58 LP2 physical pages**:

- **55 pages:** zero novel F5-like mutation-neighbor blocks.
- **p24: 5; p25: 8; p26: 3**. Their 16 anomaly coordinates (source-pixel x,y) are p24: (600,2240), (624,2240), (1752,2240), (600,2256), (600,2272); p25: (1736,1280), (600,1312), (600,1320), (616,2192), (1744,2200), (616,2264), (624,2272), (1728,2288); p26: (600,2240), (600,2256), (600,2272). These lie in the repeating mayfly decorations at the image margins, outside the repeated rune-typography target, and overlap between two original pages. These are observations, **not an authenticated steganographic signal**.
- Every one of the **26 pages previously unscorable by shared stencils** has **zero** source-reference novel-neighbor events.

An initial *analog* positive construction decrements the magnitude of **256 nonzero original luminance AC coefficients** per target image, with no source pixels reencoded and the original JPEG carrier otherwise conserved. It generates **3–219 novel neighbor events** depending on page content; all 26 previously unscorable pages show substantial responses. This synthetic coefficient flip is **not** a genuine F5 message, so a true extracted-payload calibration is the decisive next step.

## Genuine F5 validation and limits

The reproducible manual workflow embeds a deterministic **256-byte payload using pinned genuine `github.com/0verkilll/f5 v1.0.0`, matrix K=4** into every one of the 26 independently unscorable original source covers. It separately calls F5 extraction with the same password and requires a byte-exact match. Exact original versus embedded luma DCT coefficients must all satisfy the one-nonzero-AC magnitude-decrement operation; synthetic roundtrip alone is not counted as evidence of an original payload. Any source carrier with an unextractable authentic control remains *uncalibrated* and cannot receive an F5-negative verdict.

The original Go JPEG serializer has an independently observed terminal-MCU truncation on some grayscale source images. The calibration therefore supports direct native quantized-coefficient output and a libjpeg lossless grayscale serialization bridge. The bridge maps JPEG zigzag coefficient positions to libjpeg's natural 8×8 block order; any recovery failure is recorded per page rather than handwaved as a negative. The pinned workflow and individual control scores should be consulted before interpreting source images.

**Reproduce:** [exact original DCT reader](../sims/lp2_f5_glyph_dct_reader.c), [glyph atlas and true-F5-control gate](../sims/lp2_f5_glyph_atlas_gate.py), [grayscale native-coefficient writer](../sims/lp2_f5_coeff_apply.c), [pinned F5 control helper](../sims/f5_detector_calibration/native_f5_embed.go), [manual CI workflow](../.github/workflows/lp2-f5-glyph-atlas-manual.yml), [live source-calibration Actions runs](https://github.com/FlareZ123/liber-primus/actions/workflows/lp2-f5-glyph-atlas-manual.yml).

## Research decision

A repeated glyph's exact original DCT coefficient template is an effective keyless **carrier reference** independent of full duplicated illustrations. The source-only zero on every one of the 26 formerly unscorable pages is a promising observation whose F5 sensitivity is conditional on the per-page authentic payload/extraction controls. The sixteen background-art anomalies are consistent with reused typography/art motif variation and have no decoded payload. This experiment does **not** identify an author-selected F5 key, original hidden content, or decipher any unknown LP2 runes. A meaningful next carrier step needs its own genuine implanted positive and an authorially motivated extraction or plaintext authentication target.
