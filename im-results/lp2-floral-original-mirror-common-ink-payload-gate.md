# Floral LP2 p40–55 shared parent: exact mirrored-ink asymmetry is entirely the 13/31 five-dot motif

**Agent13, 22 November 2026; Director #2221.** This is a **new, source-native original-art constraint** on the surviving *common-before-copy* payload hypothesis following #2209. All 16 original LP2 p40–55 floral frames share one exact parent-plate pixel stencil. Within the entire bilateral frame rectangles, **every ink feature more than 3 pixels from its reflection occurs in precisely two intentionally faded left-hand dot spots**, already interpretable as the original five-bit **13** and **31** motif. The other 1.26 million pixels supply no further mirror-breaking ink shape of that size. This proves a very narrow asymmetric-ink source candidate, **not** a complete JPEG steganography exclusion or a recovered plaintext key.

## Frozen original-source geometry

Original scans `57.jpg`–`72.jpg` (LP2 physical p40–55) are exactly 2400×3600. Take the full left floral-frame rectangle `x=0:550, y=650:2950` and right rectangle `x=1850:2400, y=650:2950`; reflect only the right rectangle horizontally and compare the native decoded **luminance** pixels at the same ink coordinates. These are the original plate footprints established by the older native-DCT copy atlas [#2209](lp2-all-reused-plates-original-native-dct-payload-gate.md), but the **left-to-right mirror** comparison was outside that completed same-side source task.

A threshold of original luminance **below127** defines ink. The 550×2300 paired images each have 1,265,000 pixels. The left has **118,511** black pixels, the mirrored right **119,286**; their direct ink intersection-over-union is **0.9810803606**, and **2,271** pixels disagree under exact thresholded equality. Most of these are ordinary ~1px ink-edge/antialias differences.

For the meaningful feature-difference test, expand each side's binary ink mask by **three pixels in both axes** using Pillow's 7×7 MaxFilter. Count any ink on either side not within that tolerance of ink on the other. The full common original stencil yields:

| Exact nonmirror observation | Pixels |
| --- | ---: |
| Left-only substantial ink not near mirrored right ink | **0** |
| Right-only substantial ink not near mirrored left ink | **847** |
| Right-only ink in first source-visible left hollow-dot position (crop x380–413,y810–845) | **442** |
| Right-only ink in second source-visible left hollow-dot position (crop x364–397,y874–908) | **405** |
| Substantial unmatched ink **outside those two spots** | **0** |

This is a literal arithmetic decomposition **442 + 405 = 847**, with the entire nonempty residual supported by two clean contiguous dot interiors at original-image coordinates. At original thresholds80 and175, the 3px-ellipse comparison likewise localizes all residual ink to the same two dots (792 and914 respectively, zero outside); this corroborates that the result is a source feature rather than a particular luminance threshold.

Each of the **16 original p40–55 copies** gives the exact same left/right pair SHA-256 beginning `fc7809839d0efcc8390c29`; the full digest is emitted by the reproducer. Every copy independently meets 0/847 and 442/405. This new result is consistent with and strengthens the already established **zero native DCT differences between copied versions of the same margin** under #2209. The comparison is between **different sides within the common parent plate**.

## Authored clue and actual cryptographic limit

The bilateral art contains the same five geometric dot positions on both sides. On the left, the first/top and fourth/lower-left dot are **pale/hollow**, while the other three are dark. Read top to bottom, and left to right within each lower tier: **01101₂=13**. The mirrored right has five solid dots: **11111₂=31**. This 13/31 reading was already present in earlier research and was tested as a two-register update in [#2211](lp2-two-register-floral13-31-p0title-original-gate.md), whose complete original-LP2 decrypt remained random. The present source-native evidence newly shows that this pair is the **sole source-comparable large mirror asymmetry** in the shared floral frame. Do not relabel 13/31 a newly discovered cipher or rerun the previously falsified two-register scalar schedule.

The art selects two numerical values and a left/right distinction. **Neither the art nor the 2013–14 signed source specifies how these values consume GP29 runes**, whether the two numbers are keys, index offsets, state-register sizes, page selectors, or only ornamental dot counts. Their decimal string reversal (13⇄31) is suggestive but not a uniqueness proof or source-typed byte instruction. A genuine solve would need a source-chosen operation that decrypts full p40–53 text and separately predicts another untouched original region.

## Common-payload and clean-parent decision

No independently authenticated **earlier, unmodified external parent** of the floral drawing was found in the bounded image-source search. A separate exact 96×96 source-tile census between all 17 archived LP1 and all 58 original LP2 JPEGs found no sizable (≥4 nonblank tile) cross-release artwork copy; a grayscale SIFT survey of the same original cross-release margins had at most **9 geometric inliers** for any pair, far below the counts expected of an unchanged large decorative plate. These checks are specifically for an **LP1 internal parent** and do not prove the existence or absence of an external clean vector source.

A hidden **common preembedded motif** must be compatible with all 16 identical copies. Under a *mirror-antisymmetric substantial-ink* channel, the only candidate source content is the two faded five-dot spots above; **there are zero other substantially unmatched pixels** in the two complete frame ROIs. A **mirror-symmetric** common hidden glyph, a coefficient-domain watermark invisible to ink thresholding, or an actual external pre-copy parent remains possible; the source gives no independently selected decoder to test those remaining families. Generic F5 passwords, compressed-coefficient parity after mirroring, and re-encoded cover differencing would lack a source-supported comparator and would repeat #2189's invalid transformed-cover experiment.

## Reproducibility and follow-up

[Original-pixel read-only standalone Pillow/NumPy reproducer](../sims/lp2_floral_mirror_common_payload_source_sft.py) reads all 16 `resources/liber-primus/57.jpg`–`72.jpg`, asserts exact source geometry, pair-byte identity, 0/847 substantial residual, 442/405 per hollow dot, and **zero residual elsewhere**. The source JPEGs are read and closed without transformation or writes. A 16-original complete execution under Python3/Pillow/NumPy succeeded with the same counts.

**Decision for #2221:** A significant independent *common-source physical asymmetry* is resolved to a preexisting 13/31 clue. The remaining payload routes have no independently identified clean parent or typed extraction/key. Preserve this source structural result and pass the stronger 13/31 uniqueness to ongoing p40–53 chapter cipher investigation; do not spend more compute searching generic mirrored plate bits without an authentic historical source selector. This is a bounded source-carrier negative with a sharpened authentic ornament clue, and does not change the established lack of unknown plaintext.
