# LP2 p40–55: exact common-frame JPEG pixels and quantized coefficients

## What the original sources establish

The **16 consecutive physical LP2 pages p40–p55** carry the same ornamental side-frame. All are original 2400×3600 JPEGs, archive members `57.jpg`–`72.jpg`. Their two fixed strips `x=0..279` and `x=2120..2399`, `y=400..2899`, contain **1,400,000 decoded grayscale pixels per image**. Their concatenated luminance data are byte-identical on all 16 pages; the common SHA-256 is:

`fcc52a7e8855dccde78fd18dde9174fe9d7899b28f93f868647243d0355233ce`

A second, *compressed-domain* original-input test using libjpeg reads the **Y (luminance) quantized DCT coefficients** in the corresponding full 8×8 blocks, rows 50–362 and columns 0–34 / 265–299. **All 1,402,240 Y coefficients match exactly on all 16 originals.** The identical border region contains **155,752 nonzero Y AC coefficients**, of which **104,915 have absolute magnitude at least 2**, invariant on every page. These magnitudes constitute **17.3264%–26.9529%** of all such original Y AC candidates on the respective pages. Both immediate outside controls p39 and p56 fail the common-frame comparison, and a planted one-coefficient difference is detected by the test.

Of the 58 LP2 original images, **35 are RGB and 23 grayscale (L)**. Grayscale pages are p16–21, p24–25, p28–31, p41–48 and p50–52. Their apparently different JPEG *quantization profiles* arise because grayscale JPEGs carry only one table; **quantization table 0 is exactly the same on all 58 LP2 pages**. Within p40–55, the five RGB pages **p40, p49, p53, p54, p55** are precisely the five pages containing red ink or red dot punctuation in the pinned `lp2-ink-annotations.json`; the eleven remaining framed pages are grayscale. Here image mode redundantly records color visible in the artifact and supplies no independent binary key instruction.

## Cryptanalytic consequences and limits

The inspected frame strips cannot contain a **page-dependent key encoded by altered visible pixels or modified quantized luminance DCT coefficients**, since there are no differences. The repeated frame can still serve as a *fixed positional register* for selecting inner content if an independent original instruction identifies coordinates or a readout.

A conditional steganographic implication is stronger than the visible pixel claim: **17.3264% or more** of each framed page's nontrivial Y AC candidates lie inside these exact-repeat strips. Under a hypothetical independent per-image encoder that chooses `m` uniformly random **magnitude≥2 Y AC** locations *without replacement* from a common unmodified cover, its probability of avoiding these strips is at most `(1−0.173264)^m`; for `m=32` this is **≤0.00227 per image**, and for `m=64` **≤5.15×10⁻⁶**. These numbers are **conditional model bounds**, not measured probabilities of Cicada using a particular steganographic algorithm or an assertion that 32/64 changes occurred. A common already-embedded template, center-only embedding, JPEG chroma payloads, another coefficient domain or a very small payload remain possible. No original embedding key or payload is identified.

The 16-page/4×4 count correspondence is structural only; the *runeless* p50 inside the framed chapter obstructs a naive “one rune from each page” secret. The source does not select a 4×4 rearrangement, inner sampling coordinate or cipher operation. **No unknown LP2 plaintext, authentic key or destination was recovered.**

## Exact reproduction

- `sims/lp2_framed_border_pixel_sft.py` (Pillow) verifies the image-mode census, common luminance quantizer, 16-way decoded-strip hash and unframed negative controls. Passed locally on byte-preserved original JPEGs.
- `sims/lp2_framed_border_dct_sft.c` (libjpeg) checks equality of all original strip DCT coefficients, computes original AC magnitude inventories, checks p39/p56 negative controls and detects a one-coefficient planted difference. An equivalent full C implementation was compiled and executed locally against every original source image; the committed condensed version expresses the same comparisons.

The shared inputs are the immutable `resources/liber-primus/57.jpg`–`72.jpg`, with adjacent controls `56.jpg` and `73.jpg`. Future work should pursue an independently source-selected inner readout or authentic key rather than inventing page-variable border signals.
