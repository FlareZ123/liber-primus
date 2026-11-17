# LP2 original-JPEG shared-floral-border DCT carrier constraint

**Decision (17 November 2026, Agent20):** All **15 original LP2 physical pages p40–p54** (original JPEGs \`57.jpg\` through \`71.jpg\`) preserve exactly the same **67,500 quantized luminance DCT blocks** within the outer left/right 600-pixel bands. Their complete 64-coefficient blocks, including DC, are identical there; **zero differing blocks or coefficients** across 14 independent pages relative to p40. This is a source-bytes property that constrains **page-specific edits to those JPEG luma coefficients**. It does not identify an embedded payload, first-party stego password, decryption key or unknown LP2 plaintext.

## Motivation and authenticated source inputs

OutGuess extraction was a genuine historical Cicada stage, so image-domain payload tests are at least plausible. LP2's repeated floral side ornaments offer a built-in original-art reference: if the same rendered cover JPEG coefficient blocks are reused without modification on distinct pages, page-specific stego edits cannot have altered any of those blocks after this source layer was fixed. A uniformly spread independent coefficient-embedding model can be tested against that property; it is a **conditional source-carrier discriminator**, not an instruction from Cicada to apply a particular stego tool.

Input images are the repository's original \`resources/liber-primus/57.jpg\` … \`72.jpg\`, representing LP2 physical pages p40–p55. Every image is 2400×3600 pixels. No artifact rescaling, re-encoding, recompression, color transfer, OCR or pixel thresholding is performed before the comparison. Native \`libjpeg\` reads **quantized JPEG coefficient arrays directly** via \`jpeg_read_coefficients\`. Select the first image component (the grayscale or Y luminance component), verify the fixed 300×450 block grid and the equality of its quantization tables, and select all rows of block columns 0–74 inclusive and 225–299 inclusive (pixel x=0–599 and x=1800–2399). This selects 300×450/2 = **67,500** DCT blocks, **4,320,000 quantized coefficient cells per page**.

A practical uniform spatial candidate population is all 63 non-DC AC coefficients with magnitude at least two in the luminance plane (to distinguish coefficient use from zero/nonzero transitions). This population definition is a transparent thought experiment about possible embed locations; no evidence establishes that historical OutGuess or OpenPuff used uniform selection over it.

## Exact original-input outcome

The original p40 border has **185,779** magnitude-≥2 luminance AC coefficients. Each of p41–p54 has exactly the same 185,779 eligible coefficient **positions and values** in the two 600px side bands. Across all 15 pages no border DCT value differs, despite page-specific text and image content elsewhere.

| Physical page | Original JPEG | Y components present | Eligible whole-Y AC | Eligible shared-border AC | Shared-border differences versus p40 |
| --- | --- | --- | ---: | ---: | ---: |
| p40 | 57.jpg | 3-channel JPEG | 529,809 | 185,779 | 0 |
| p41 | 58.jpg | grayscale JPEG | 588,707 | 185,779 | 0 |
| p42 | 59.jpg | grayscale JPEG | 591,233 | 185,779 | 0 |
| p43 | 60.jpg | grayscale JPEG | 595,193 | 185,779 | 0 |
| p44 | 61.jpg | grayscale JPEG | 598,038 | 185,779 | 0 |
| p45 | 62.jpg | grayscale JPEG | 576,827 | 185,779 | 0 |
| p46 | 63.jpg | grayscale JPEG | 586,523 | 185,779 | 0 |
| p47 | 64.jpg | grayscale JPEG | 595,697 | 185,779 | 0 |
| p48 | 65.jpg | grayscale JPEG | 605,520 | 185,779 | 0 |
| p49 | 66.jpg | 3-channel JPEG | 438,042 | 185,779 | 0 |
| p50 | 67.jpg | grayscale JPEG | 389,253 | 185,779 | 0 |
| p51 | 68.jpg | grayscale JPEG | 464,965 | 185,779 | 0 |
| p52 | 69.jpg | grayscale JPEG | 597,435 | 185,779 | 0 |
| p53 | 70.jpg | 3-channel JPEG | 503,892 | 185,779 | 0 |
| p54 | 71.jpg | 3-channel JPEG | 554,085 | 185,779 | 0 |
| p55 | 72.jpg | 3-channel JPEG | 404,820 | 186,279 | 41 changed blocks / 817 changed coefficients |

The p55 exception is expected from **source artwork**: its wing drawing enters the right 600px side band at DCT columns x=225–228 and rows y=347–359. It should not be presented as hidden data. P55 is excluded from the 15-page equality assertion.

On the 15 exactly repeated pages, shared-border eligible AC coefficients account for **30.6809024%–47.7270567%** of each page's eligible first-component AC coefficients. Therefore a model which independently picks **200** positions uniformly from a page's same defined eligible pool and changes **exactly 200** coefficients *in a manner not also mirrored on all pages* has probability at most \`(1 − 0.306809024)^200 ≈ 10^−31.829\` to avoid the shared border on one page. The exact without-replacement probability is no larger than this conservative independent model bound. A nonuniform or shared common cover embedding does not obey that null. This probability is **not an empirical p-value for whether the pages contain steganography**, and its smallness must not be used as standalone evidence of any particular image generator.

## Reproducer and scope

Source: [\`sims/lp2_floral_border_dct_sft.c\`](../sims/lp2_floral_border_dct_sft.c), standalone C11/libjpeg SFT with deterministic page-level assertions and a per-page CSV. Run it from a checkout with libjpeg using an ordinary C11 compiler and the \`-ljpeg -lm\` libraries, or pass an explicit directory containing those original numbered JPEGs. Local \`gcc -std=c11 -O2 -Wall -Wextra\` and \`AddressSanitizer + UndefinedBehaviorSanitizer\` executions both passed on 17 November 2026. The source's fixed input scope is original p40–p55, no surrogate images.

**What is now constrained:** an authentic **page-specific, post-template, border-modifying, quantized-Y-AC JPEG carrier**. A conventional image-wide uniform selection that frequently modifies each of these borders is incompatible with the exact unchanged source coefficient observations on p40–p54.

**What remains open:** embedded data in text/interior-only coefficients, color components, differing image bands, metadata, image source generation before reusing border blocks, identically shared modifications across every image, other JPEG domains and deterministic/nonuniform stego placement. A source-selected password, output magic and legitimate positives are still required before claiming stego extraction. The 56 unsolved pages remain undeciphered; no original plaintext is recovered here.

**Practical implication:** any proposed LP2-wide JPEG extraction that assumes its carrier uniformly modifies luminance AC coefficients over all original page area must now explain this artifact reuse and survive this heldout ornament-region control. Prefer specifically source-marked images/interior operations over another unrestricted password dictionary.
