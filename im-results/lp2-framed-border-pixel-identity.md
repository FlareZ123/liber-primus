# Original LP2 p40–55 side-frame image identity

## Source-observed result

Across **all 16 consecutive physical LP2 pages p40–p55**, which visually carry the same ornamental left/right frame, the **decoded grayscale values are exactly identical at every pixel** in two fixed original-image strips: left `x=0..279, y=400..2899`, right `x=2120..2399, y=400..2899`. Each JPEG is 2400×3600; these disjoint strips comprise **1,400,000 pixels per page**, with the same SHA-256 of the concatenated strip bytes for every one of the 16 original sources:

`fcc52a7e8855dccde78fd18dde9174fe9d7899b28f93f868647243d0355233ce`

The neighboring unframed p39 and p56 yield a different digest, as expected. This is a source-level fact, obtained from the pinned JPEGs `resources/liber-primus/57.jpg` through `72.jpg` (archive index = physical page +17).

The 58 LP2 JPEGs comprise 35 RGB and 23 grayscale-L images. The grayscale pages are p16–21, p24–25, p28–31, p41–48 and p50–52. The apparent *two JPEG quantization profiles* are caused by the grayscale images having only one quantization table; **the luminance quantization table is identical across all 58 images**. In particular, although original p40 and p49 are RGB while p41–48 are grayscale, their inspected ornamental border strips decode to **byte-identical luminance**.

## Cryptanalytic decision

A page-specific clue or key carried by **changes in the visible border pixels inside these inspected strips** is impossible: there is no page-varying decoded luminance signal there. The fixed common frame may still be a creator-observable **registration or positional reference** for sampling the changing interior runes, images or numeral table; that requires an independent source-selected selection rule and an original-cipher success test. The visual 16-page span is compatible with a conceptual 4×4 arrangement, but a 4×4 cipher/key role is **not established** by a count coincidence.

This exact exclusion does **not** cover all pixels of the ornament, page centers, JPEG compressed coefficient streams or APP metadata. No key, unknown LP2 plaintext, cipher operation or destination was recovered. It is more productive to look for an original clue selecting *which inner positions* to read than to treat the repeated side frame as a variable per-page ciphertext.

## Reproduction

`python sims/lp2_framed_border_pixel_sft.py` (Pillow required) reads pinned original JPEGs, checks all 58 file modes and luminance quantizer tables, asserts the 16-way side-strip digest match, and asserts the two neighboring unframed negative controls. This SFT was executed locally against byte-preserved files from the supplied original image archive and passed. No image was modified.
