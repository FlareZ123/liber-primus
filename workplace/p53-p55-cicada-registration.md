# Physical LP2 p53/p55 repeated-cicada registration: an isolated art clue

**Status: source-image observation only.** The repeated cicada could in principle serve as an interpage registration mark, but the displacement supplies neither a selected cipher operation nor any unknown LP2 plaintext, key, or destination. This is deliberately kept in `workplace/`, outside established results.

## Exact original inputs

- Physical **p53** = archive `resources/liber-primus/70.jpg`, SHA-256 `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548`.
- Physical **p55** = archive `resources/liber-primus/72.jpg`, SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.
- Both are 2400×3600 pixels at 400 dpi. The lateral branch border is the previously established constant template throughout pp40–55, and is therefore an independent stable page-origin reference.

The cicada at the lower center is virtually identical on p53 and p55. On p55, the same source drawing is shifted **+66 pixels horizontally and +67 pixels vertically** relative to p53. A fixed **1,100×310 pixel** grayscale cicada crop from p53, `x=650..1749, y=2740..3049`, compared with p55 at `x+66, y+67`, gives mean absolute intensity difference **0.79510264** out of 255 and **99.8654%** agreement after thresholding both images at grayscale 130. With no displacement the difference is **79.1522**; at adjacent horizontal offsets 65 and 67 it is **6.149** and **6.150**, while vertical neighbours 66 and 68 yield **9.167** and **9.122**. Registration is thus pixel-specific rather than an impression based on the centering of an asymmetrical insect.

At 400 dpi, **12 typographic points is 66⅔ pixels** on both axes. A mundane 12-point diagonal movement of one reused graphic is consistent with the observed integer raster shift. Original p53/p55 rune text occupies the same four upper printed-line baselines, whereas registering on the cicada shifts these baselines apart by ~67 pixels. For the top-panel `x=570..1849, y=550..1449`, the binary-ink row projections of the two pages correlate **0.85836** at zero vertical shift versus **−0.37309** at +67. This disfavors a literal two-page transparent-overlay reading registered on the cicada in place of the page geometry.

## Cryptanalytic decision

The difference supplies an **exact source-selected translation vector** but no original instruction to treat image-pixel units as a rune/key/address system. In particular `(66,67)`, their 12-point interpretation, and the presence of 51 red p53 runes plus 76 p55 runes do not establish an operation on the original GP29 ciphertext. Do not reinterpret the displacement as an independently authenticated key or change the existing p53/p55 127-rune original-stream hypotheses to fit it. Revisit only if a separate Cicada source selects an image-overlap/registration procedure or yields a frozen plaintext prediction.

**Reproducer:** [`sims/lp2_p53_p55_cicada_registration_sft.py`](../sims/lp2_p53_p55_cicada_registration_sft.py), Python 3 + Pillow + NumPy, loads the unchanged original JPEGs and checks their SHA-256 values and fixed-offset controls. No new CI workflow or automatic trigger was added.
