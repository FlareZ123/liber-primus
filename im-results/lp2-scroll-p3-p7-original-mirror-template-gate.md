# LP2 pp3–7 scroll-border artwork: exact original-raster state-selection gate

**Agent 1, 17 November 2026. Classification: negative source-selection decision for Director #1386.** No plaintext or authored scroll-to-cipher grammar identified.

## What the human sees

Original archive JPEGs `20.jpg`–`24.jpg` (physical LP2 pp3–7) all show the same distinctive pair of vertical scrolling stems/spirals. Each page has a left and a horizontally mirrored right flourish, both with the same two tiny outer ink dots near the upper spiral. Page 3 additionally begins two red rubric passages. Page 7 concludes with its independently known split red text and five black dots below the scrolls; these lie outside the side-stem artwork and have been separately investigated as terminal markers.

The source-visible candidate was that changing scroll strokes, curl handedness, dots or their page-to-page placement might instruct a five-page state clock, traversal choice or left/right permutation. A competing explanation is a mechanically repeated mirrored compositor border, without an independently encoded state.

## Frozen original-image comparison

Read every original source JPEG at native **2400×3600** RGB resolution; examine only the decoration-only rectangles `(x=0..499,y=450..3149)` and `(x=1900..2399,y=450..3149)`. This avoids the centered rune columns, p3 rubric and p7 five-point footer.

- The **four p4–p7 pairs** are **RGB-pixel-identical in their entire two-strip register** (2,700,000 pixels per page). Their common concatenated SHA-256 is `6d056e4a99d82c54978ae2ac55c22e02a72317b2c717e7e65c417bb7e86f2b2`. Thus the spirals provide **no visibly changing side-stroke or page-specific marker on pp4–7**.
- Page **p3** uses a slightly different raster of the same ornament. Concatenated SHA-256 `ae55016020bf50051ff2e8bcc7419682b3056924ec7e09e3269566d0b80fa4e`, with **173,066** RGB pixel locations differing from the later common raster. The difference traces both contours symmetrically and has no added readable marker. At threshold grayscale 128, p3 and p4 each have approximately **39,763 black pixels on each side**, and their side-to-side reflected black masks disagree in only **32** and **38** pixels respectively out of **1,350,000**. The p3/p4 shape differences are compatible with another rasterization/placement of the same vector flourish; the native JPEG alone does not uniquely attribute their cause.
- All five right-hand motifs are effectively **pixel-mirror images** of their corresponding left motifs. Therefore a reader cannot infer independent left and right state labels from tiny differing stem features. The two adjacent dot flecks also repeat as mirrored motifs, without a direction selector.
- A synthetic one-pixel decoration edit deliberately inserted in memory changes the measured hash. The comparison therefore detects an actual independent mark where one exists.

The comparison is precise **only within the two original-pixel side rectangles**, not a proof that full-image JPEG DCT coefficients, the red rubric, p7 footer, or hidden metadata carry no information.

## Cipher decision and honest limits

No independent original stroke or dot *change* identifies a per-page transition, which of two mirrored curl directions a human must read first, a reset rule, a period, or a GP29 value operation. A shared decorative *shape* could in principle be an instruction, but the image does not specify how to turn it into a unique invertible rune order. This is exactly the premise gate required by Director #1386: **stop before an arbitrary palette of reversible scroll rotations, boustrophedon line choices, and borrowed cipher keys.**

The p7 five-dot footer and red four-dot separator remain source-visible, but neither supplies a scroll-to-key grammar; earlier image-geometry and p7 red-marker hypotheses already failed to recover text. This result does **not** disprove a key supplied externally or a common static mirror operation instructed elsewhere. It prevents further investment in a **page-variable scroll-border state clock** without a new first-party asymmetric marker and an explicit decoder. No original rune is changed.

**Reproduction:** [Read-only original JPEG SFT](../sims/lp2_scroll_flora_template_source_sft.py) using Pillow/NumPy. The same SFT independently confirms all 16 LP2 pp40–55 floral side strips are byte-identical under their own fixed rectangle; this illustrates how the manuscript reused chapter artwork as compositing templates and does not itself reveal a cipher.
