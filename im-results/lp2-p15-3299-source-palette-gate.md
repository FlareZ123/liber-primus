# Physical p15 3299: red-ink palette discriminator

**Original-pixel decision, 14 November 2026.** Physical LP2 p15 (`32.jpg`) prints **3299 in saturated red**, unlike all 15 black entries of the 4×4 Fibonacci-prime grid. Its visibly lighter *grayscale* value follows from its **red foreground color**. The same red palette is used in the upper and lower red-rune rubrics on the original page. This is a real human-visible numeral-selection mark already accounted for in the [established sixteen-value spiral](../results/lp2-p15-fibonacci-prime-spiral.md), where red 3299 fixes spiral step zero. No additional low-opacity pigment, hidden lighter digit, new key, direct rune decipherment operation, or unknown plaintext follows.

## Fixed original input and discrimination

Input `resources/liber-primus/32.jpg`, original **2400×3600 RGB JPEG**, SHA-256 `5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5`. The identical digest is in the source `SHA256SUMS.txt`. All measurements operate on full-resolution original decoded JPEG pixels, without scale, rotation, threshold-tuned figure recognition or OCR.

The sole question is whether the reported 3299 “light ink” is a distinct source mark *beyond* the already source-visible red typography. Pre-fixed cell boxes include each complete printed numeral and white surroundings. Classify:
- saturated red when `R-G > 60`, `R-B > 60`, `G < 170` and `B < 170`;
- neutral dark when `max(R,G,B) < 110` and `max(R,G,B)-min(R,G,B) < 20`.

The thresholds separate ordinary black numerals from ordinary red numerals; varying antialiasing within those channels cannot yield a false *absence* of the opposite color. The exact original-source SFT is [`sims/lp2_p15_3299_red_palette_sft.py`](../sims/lp2_p15_3299_red_palette_sft.py).

| Printed grid row | Numeral / classified saturated-red pixels / classified neutral-dark pixels |
|---|---|
| 1 | 3258 **0/5394**; 3222 **0/5138**; 3152 **0/4523**; 3038 **0/5564** |
| 2 | 3278 **0/5130**; **3299 5560/0**; 3298 **0/5507**; 2838 **0/5774** |
| 3 | 3288 **0/5772**; 3294 **0/5213**; 3296 **0/5235**; 2472 **0/4881** |
| 4 | 4516 **0/4643**; 1206 **0/4835**; 708 **0/4037**; 1820 **0/5106** |

Direct **same-JPEG** ink controls use separate boxes for the red opening heading (20,540 saturated-red pixels) and the lower red rubric (17,943 saturated-red pixels). Their **most frequent exact RGB triplet is (192,0,0)**, identical to the dominant triplet of red 3299 (5,560 pixels). The 3299 red-pixel median is **(188,3,5)**, versus upper heading **(190,0,2)** and lower rubric **(190,1,2)**. Every adjacent black grid numeral has neutral-dark median **(0,0,0)**. Common red antialiasing accounts for median differences of a few channel units; no new color code or special lighter-ink tier is present.

The author clearly distinguished **red 3299** from the other fifteen numbers. Using its red mark to orient the square spiral is an already-established, independently reproducible operation:
`3299 → 3298 → 3296 → 3294 → …`, with `|3301-prime(F_n+1)|`, `n=0..15`. The external 2026 observation of “lighter 3299” therefore does not select a *second* operation (skip, rotation, sign, cipher phase, or keystream), and supplies no new parameter to test on ciphertext. Choosing any additional rule because the page contains an existing red numeral would be unconstrained.

## Outcome and remaining unknown

**Decision for [Director #797](https://github.com/FlareZ123/liber-primus/issues/797):** physical pigment state is established and completely explained by the known red starting cell. Keep the Fibonacci-prime spiral as the only original-page-decoded mechanism. Retire the proposed additional **lightness** key channel until a separate original 2014 instruction distinguishes two operations from this one red mark. No unknown LP2 runes are decrypted.

The original table's further use as a key, an input to the signed 2016 word map, or a p56 preimage remains unestablished. Another fitted periodic key search is not warranted by this palette observation.
