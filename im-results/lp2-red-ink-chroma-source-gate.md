# LP2 red-ink chroma source gate

**Decision: bounded negative.** The 225 annotated red runes use one stable red rendering across the 15 pages that contain them. The apparent two-level chroma split is a one-code Lab quantization effect whose per-glyph assignment changes under a stricter interior-pixel threshold. No independently readable color class, key, or instruction is selected by the original manuscript. This closes the visible red-ink chroma-channel branch in Director issue #235; it does not address compressed-domain steganography or other image channels.

## Source and exact segmentation

The test uses all 58 original LP2 JPEGs, scans 17.jpg–74.jpg (physical pages 0–57), and the existing resources/liber-primus/lp2-ink-annotations.json. The annotation supplies 225 red-rune instances on physical pages:

0, 3, 6, 7, 8, 15, 23, 27, 33, 39, 40, 53, 54, 56, 57.

The source images are 2400×3600. An 8-connected red mask R>150, G<80, B<80, with fixed morphology limits, identifies exactly **210 standard glyphs and 15 oversized initials**. Counts match the independent annotation page by page. A second, stricter interior mask R>180, G<60, B<60 independently reproduces the same 225 page counts. This includes both solved controls p56 and p57.

The matched paper reference for each glyph is the 24-pixel annulus around its component, restricted to neutral bright pixels (mean RGB>165, channel range<25). Every component's local-background median is [255,255,255]. Color is measured in OpenCV's 8-bit Lab representation as the glyph median minus that matched background median. The stricter mask is used only as an interior/threshold sensitivity check; no plaintext, key, reading direction, or cipher score is used to choose a threshold.

## Results

### JPEG and page strata

- Across all 58 images, **35 are RGB and 23 are grayscale**.
- All 15 red-rune pages are RGB. Every RGB page has the same JPEG component sampling factors (Y 2×2, Cb/Cr 1×1; 4:2:0) and the same quantization-table fingerprint (7dd0884b000cf41a). No red page belongs to a distinct JPEG rendering stratum.
- The per-page annotation and image-component counts agree at both thresholds: 225/225 total.

### Color and typography

| Sample | Glyphs | Median RGB in base mask | Median RGB in strong core | Median normalized Lab |
|---|---:|---:|---:|---:|
| Standard glyphs | 210 | [190,0,1] | [192,0,0] | [-154,64,53] |
| Oversized initials | 15 | [192,0,0] | [192,0,0] | [-153,64,54] |
| All red glyphs | 225 | [190,0,1] | [192,0,0] | [-154,64,54] |

The strong-core RGB median is [192,0,0] for **190/225** glyphs; across all 225 glyphs its component-wise range is only R=190–192, G=0, B=0–2. All 15 oversized initials have the same [192,0,0] core median and the same normalized Lab delta [-153,64,54]. The standard/large difference in the broad mask is therefore consistent with stroke coverage and antialiasing, not a separate pigment.

The broad-mask Lab b-channel medians fall into two adjacent code values: 110 glyphs at 53 and 115 at 54. Under the stronger interior mask, the counts become **8 at 53 and 217 at 54**; **102/225 glyphs change bins**. Each of the 15 red-bearing pages has at least two such per-glyph bin changes. A putative two-color class is therefore not stable under an interior-pixel threshold change. The median hue in the broad mask is 40.156° (range 39.629°–40.156°); the one-code split is below a credible, human-visible pigment distinction and does not define a reproducible glyph class.

### Page-by-page threshold sensitivity

| Physical page | Annotated red runes | Glyphs changing the one-code Lab-b bin |
|---:|---:|---:|
| 0 | 13 | 4 |
| 3 | 19 | 7 |
| 6 | 11 | 4 |
| 7 | 14 | 10 |
| 8 | 12 | 9 |
| 15 | 20 | 9 |
| 23 | 16 | 6 |
| 27 | 19 | 6 |
| 33 | 18 | 7 |
| 39 | 3 | 2 |
| 40 | 8 | 3 |
| 53 | 51 | 26 |
| 54 | 9 | 3 |
| 56 | 5 | 3 |
| 57 | 7 | 3 |
| **Total** | **225** | **102** |

### Cross-page holdout

The first eight red-bearing pages (p0, p3, p6, p7, p8, p15, p23, p27; 124 glyphs) were treated as a descriptive training partition. The remaining seven red-bearing pages (p33, p39, p40, p53, p54, p56, p57; 101 glyphs) were held out, including both solved-page controls. Both partitions have the same median normalized Lab vector [-154,64,54] and the same component-wise range. This confirms a shared rendering, not a class-to-plaintext prediction; no reading direction or binary codebook was selected.

## Interpretation and boundary

The original images support one red ink color with ordinary antialiasing and JPEG sampling variation. The tiny 53/54 Lab-b split is threshold-sensitive, mixed within pages, and not a stable source-visible class. The solved p56 encrypted red heading and p57 literal PARABLE heading share the same red rendering, so color does not distinguish those roles.

**Close #235 as selector absent.** Do not enumerate bitplanes, infer a bitstream from the unstable Lab bins, or fit the GP ciphertext to them. This result rejects only a visible red-ink chroma channel under the tested original-pixel measurement; it does not reject unrelated steganography, metadata, or other source clues.

## Reproduction

Run from the repository root:

python sims/lp2_red_chroma_source_gate.py

The program checks the source annotation, all 58 page modes and JPEG sampling/quantization strata, exact per-page glyph counts at both thresholds, matched-background Lab deltas, typography groups, and the fixed page holdout. It emits the complete JSON summary. Dependencies: Pillow, NumPy, and OpenCV.
