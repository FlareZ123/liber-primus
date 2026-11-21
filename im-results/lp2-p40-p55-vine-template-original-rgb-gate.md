# LP2 p40–p55: original vine margins are fixed RGB templates

**21 November 2026, Agent35. Classification: original-image structural exclusion, no unknown plaintext or key.**

## Which original feature can actually carry page-dependent information?

The sixteen consecutive LP2 rune/table pages **p40–p55** (original source JPEGs **57.jpg–72.jpg**) all show the same illustrated floral-vine frame to either side of the rune-bearing or numerical central panel. A plausible human-image hypothesis is that the original artist deliberately changed individual leaf, bud, stroke, steganographic color or LSB pixels from page to page, allowing the 16-page sequence to encode a key. That hypothesis requires an actual difference between source pages' marginal pixels.

The [read-only original-JPEG SFT](../sims/lp2_p40_p55_vine_margin_exact_pixel_sft.py) decodes all 16 original 2,400×3,600 RGB JPEGs without rescaling, thresholding or segmentation, and hashes these coordinate crops (exclusive right/bottom):

| Original source crop | Pixel rectangle `(left,top,right,bottom)` | RGB pixels per page | Unique exact SHA-256 values across the 16 pages |
| --- | --- | ---: | ---: |
| Left side vine | `(0,560,560,2890)` | **1,304,800** | **1** |
| Right side vine | `(1840,560,2400,2890)` | **1,304,800** | **1** |
| Central rune/table control | `(630,680,1770,2800)` | **2,416,800** | **16** |

The original left and right side crops each have **exactly identical RGB channel bytes** across all sixteen pages, so this holds even for one-bit color variation in those crops. The middle changes on every page, demonstrating that each source is a distinct page image. There is thus no page-index-modulated message in either specific side-vine strip, and attempting to read successive different leaf positions or pixels from those strips is unmotivated. The frame is mechanically a reused visual template within the crops.

This test cannot exclude information shared by every printed vine template, unique additions beyond the stated strips, central-body illustrations, different artwork on other chapter pages, hidden bytes outside the displayed image, or a cipher in the rune sequence itself. It does not prove how the publisher assembled the JPEGs. The immediate research decision is to stop comparing p40–p55 *side-vine differences* as a variable key, and inspect page-specific source features if an independently visible human clue selects them.

## Reproduction

`sims/lp2_p40_p55_vine_margin_exact_pixel_sft.py` reads checked-in original `resources/liber-primus/57.jpg` through `72.jpg`, asserts all JPEG sizes, verifies the exact RGB template identities, and outputs the three crop SHA-256 hashes. Uses Python 3.12 and Pillow 11.3.0; no mutation, OCR, external retrieval, linguistic assumptions, or candidate-cipher tuning. Run through the repository's existing manual Python image SFT workflow, not a new workflow.
