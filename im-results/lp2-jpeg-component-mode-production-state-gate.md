# JPEG component mode is a production-state channel, not an independent LP2 bit tape

**Agent8, 19 November 2026. Classification: source-level exclusion of the LP2 RGB/grayscale component split as independent cryptographic evidence. No unknown plaintext, key, or destination is recovered.**

## Question

The original JPEG census established that physical LP2 has exactly **35 three-component JPEGs** and **23 one-component JPEGs**. Because 23 is also the modulus in the current p28 DH candidate, that count is an attractive cross-check unless the image-mode split has a simpler source explanation.

This test freezes only observable source properties: JPEG SOF component count, original file order, the existing original-ink annotations, and the independently established repeated-cuneiform composite group p34-p39.

## Exact source result

The image-mode sequence is highly constrained by production state.

1. **Original source scans 00.jpg through 32.jpg are all three-component JPEGs.** This prefix spans every LP1 image 00-16 and LP2 physical p0-p15 at scans17-32. The first 33 source images therefore form a uniform RGB production prefix across the LP1/LP2 boundary.
2. LP2 one-component pages are exactly physical
   `16-21, 24-25, 28-31, 41-48, 50-52`, for **23 pages**.
3. **Every one of those 23 grayscale pages has zero annotated red runes and zero annotated red large marks.** All 225 red runes and all 35 red large marks occur on three-component pages.
4. From physical p16 onward, only three RGB pages have no annotated red ink: **p34, p35, p37**. All three lie inside the independently established p34-p39 group whose six originals share the same cuneiform header/composite treatment.
5. Consequently, on all **42 pages p16-p57**, the following production classifier predicts JPEG component count with **42/42 exact agreement**:

   `RGB iff red-annotated OR page belongs to p34-p39 shared-cuneiform composite; otherwise one-component grayscale.`

There is therefore no unexplained post-p16 mode bit left after visible/compositing state is accounted for.

The complete LP2 component runs in physical page order are:

`RGB16, gray6, RGB2, gray2, RGB2, gray4, RGB9, gray8, RGB1, gray3, RGB5`.

These run lengths are descriptive production blocks. They should not be reinterpreted as a rune/key sequence without a separate source instruction.

## Cryptanalytic consequence

The numerical equality

`number of grayscale LP2 pages = 23 = candidate DH modulus p`

is **not independent support for DH23**. The component split is already explained by source-image production state, including a 33-image all-RGB prefix crossing the earlier LP1 material and an exact visible-state classifier after p16.

This does not exclude coefficient-level steganography, pixel-level information, or the visible red/cuneiform objects themselves. It closes only the use of **JPEG component count / RGB-versus-grayscale mode** as an independent hidden tape, key, or validation statistic.

The source explanation also sharpens the older JPEG-container census, which previously recorded the 23/35 split without identifying why it occurs.

## Reproduction

Run:

`node sims/lp2_jpeg_component_mode_source_gate_sft.cjs`

The SFT parses JPEG SOF markers directly from all 75 originals, reads the stable ink annotations, verifies the 00-32 all-RGB prefix, checks the exact 23 grayscale pages, and asserts the p16-p57 production classifier with zero mismatches. It uses only Node.js standard-library modules.

The p34-p39 shared-header premise is independently established by [the original quantized-header study](lp2-six-identical-cuneiform-headers-native-openpuff-medium.md).
