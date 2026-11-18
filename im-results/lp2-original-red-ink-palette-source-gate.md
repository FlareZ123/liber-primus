# Original LP2 red-ink palette: no visible second hue alphabet

**Agent 9, 18 November 2026.** New source-image channel check. No recovered unknown plaintext, key, decoding instruction or continuation. This is a bounded exclusion of *per-glyph visible color-class encoding* in the original red ink, independent of its known 225-rune content and dot-mark position.

## Human-visible hypothesis and original evidence

The red portions of the manuscript distinguish headings, interruptions and the paragraph ornaments. Conceivably the artist could have rendered different individual red rune strokes in two deliberate colors, encoding a second bitstream without changing the 29 GP symbols. Such a channel would be directly observable to a solver inspecting the 2014 released JPEGs. The closest rival is ordinary single-color maroon text with JPEG quantization, antialiasing and edge bleed.

Read the unchanged **58 original LP2 images**, archive scan files `17.jpg` through `74.jpg`, each **2400×3600** RGB. Classify red pixels by `R>120`, `R>2G`, `R>2B`, `G<120`, `B<120`; form eight-connected source-native pixel components. Restrict the color-core test to components with **250–100,000 red pixels** and a box at least 7×7 pixels, with at least 50 near-interior pixels `R>172,G<20,B<20`. This retains substantial original red glyph or ornament strokes, avoiding tiny antialiased edge fragments; no OCR, rune value, plaintext fitness or guessed secret bit assignment participates.

**Original data:** exactly **238 substantial red components on 18 of 58 pages**. Every component's core median red-channel intensity lies between **189 and 192**, with green median **0 or 1**, blue median **0–2**. Of the 238, **140** have median exactly **(192,0,0)**. Their shared dominant interior color is **#C00000**, and remaining variation is consistent with the source JPEG's antialiasing and color quantization. No separate large red glyph component has a median visibly distant from this one fill color.

## Original-image positive and bounded decision

The reproducer recolors one component in original p0 from approximately `#C00000` to `#DC0000` (**28 red levels**), re-encodes the edited original 2400×3600 page as JPEG at quality95, then reruns the unchanged classifier. It identifies **one extra colored component** with median red channel at least 205. Thus the test would detect a straightforward, consistently colored, visibly distinct glyph after JPEG compression.

**Decision:** a direct two-shade or small-palette instruction-bearing red-ink channel, using visibly different red colors on substantial rune/ornament components, is unsupported. The original red runes remain meaningful as *runes*, positions and section cues; this experiment says nothing about those. It also does not exclude per-pixel or DCT-coefficient steganography, tiny glyph fragments, sub-8-level color differences, or a deliberately coded color effect whose local medians collapse onto the same RGB value. None has a separate source cue here, and no hue-to-bit key is inferred.

[Exact original-image Python SFT](../sims/lp2_red_palette_original_sft.py) uses the original repo JPEGs, or the maintainer's unchanged original-JPEG ZIP if running outside the repo, plus Pillow, NumPy and OpenCV. It asserts the **58×2400×3600** source dimensions, exact **238 / 18** component inventory, observed median color bounds, and JPEG positive control. Locally executed against the maintainer-supplied original archive with all checks passing. This is an intermediate negative, not an established decryption result.