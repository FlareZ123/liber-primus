# Source-selected Wings XIV: p27 wing attribution and p23–26 textual key gates

**Agent25, 17 November 2026. Current decision:** the exact public insect-illustration article associated with original Liber Primus mayfly artwork supplies no near-exact source plate for physical p27, no intact eight-word quotation anywhere among the LP2 unknown runes, and no recovered plaintext from using the article as a full-offset GP29 additive running key for pp23–26. **No unknown plaintext, source-authenticated key, or final destination was recovered.**

## Why this source is a reasonable human clue

An original-image attribution independently described in [this 2022 community report](https://github.com/scream314/cicada3301/issues/20) identifies the mayfly visible in Liber Primus pp23–26 as a vertically flipped image in [Wings XIV, Figure 4, specimen 5](https://www.metafysica.nl/wings/wings_14.html), *Ephemerella ignita*, image [thieme_90.jpg](https://www.metafysica.nl/wings/thieme_90.jpg). The same page cites Severa in Zahradnik, *Thieme's Insektengids* (1977). This connects an originally visible artifact to a concrete outside source. It provides no author-authenticated cipher instruction, and today's website text is not proved identical to a 2014 version.

Three distinct possible uses of this original visual clue were tested directly: finding the p27 illustration's caption on the same source page, searching its visible English text as verbatim underlying plaintext with the original word lengths intact, and consuming the full site text as a native GP29 running key. Each test uses actual manuscript input and an independent positive control.

## 1. Native artwork: p27 against every linked picture

Original target is physical p27, original source JPG 44.jpg, SHA-256 c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e, wing crop [643,516,1787,855] at 1144×339 pixels. The source page exposes **47 distinct image URLs**. All **47/47 original image bytes were successfully retrieved**. Each was matched both unmodified and mirror-flipped, whole and with up to four segmented major ink components.

Frozen prior original-figure criterion: OpenCV SIFT/Lowe reciprocal matches, 5px similarity RANSAC, at least 30 inliers spanning >50% of target width and >15% target height, with scale 0.08–4. **Best among 47 originals: six inliers, zero passing registrations.** Two six-inlier sources are hennig1954_246_249.jpg and hennig1954_38.jpg. Explicit source image rohd1949_125.jpg (Figure 3 mayfly wing panel) yields four. A planted 4-degree/0.87-scale original p27 positive gets **383 inliers**, the downscaled mirrored positive **420**, and original unrelated p53 drawing gets **three**.

**Scope:** no near-exact reuse in the 47 native images on this one source page. It cannot disprove redrawing from another document or an unknown surviving plate. [SFT](../sims/lp2_p27_metafysica_wings14_registration_sft.py) · [passed Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/44061144893) · [all 47 input hashes and image results](https://github.com/FlareZ123/liber-primus/actions/runs/44061144893/artifacts/14319310008).

### Artwork reuse inside the original p24–26 leaf set

The same mayfly illustration is also repeated on three *different original LP2 image pages*. A separate original-JPEG image difference test isolates unchanged side artwork from each page's central runes. On p24 and p26, native grayscale pixels are **exactly equal**, all **969,000 left** and **935,000 right** pixels in the fixed left (x0..569,y900..2599) and right (x1850..2399,y900..2599) bands. This direct result is consistent with the previously documented duplicate-art fact; the visual duplication itself is not new. Against p24, the p25 version is displaced precisely **one pixel left and one pixel up** in both independent source bands. Translation-registered original contrast correlations are **0.99384326/0.99506378** (left/right), with gray-level mean absolute residuals only **0.84177/0.60603**; no substantial redrawn wing feature is recovered by these two-band metrics. The displacement is source-raster geometry and does not imply a one-rune encryption shift, an embedded key, or an author-selected readout. Page-specific central text and subtle differences elsewhere remain outside this test.

[Original image SFT](../sims/lp2_p24_p26_mayfly_original_margin_difference_sft.py) · [passed Windows original-input run 44064255458](https://github.com/FlareZ123/liber-primus/actions/runs/44064255458). The actual images and their original SHA-256 are pinned in the script; the run preserves the native translated-correlation, XOR and full pixel-equality report.

## 2. Source verbatim plaintext under original word lengths

The original unknown LP2 pp0–55 have exactly **2,896 printed words and 12,956 GP29 runes**; 32 whole words cross original physical page boundaries. The test removes line and page wraps without erasing true printed word separators. It indexes every eight-word visible-source-page substring as **native GP29 symbol lengths**, allowing both a standard transliteration and an alternate ING/IO fusion convention, with source-supported orthography normalization.

**Result: zero exact contiguous eight-word matches** anywhere in unknown LP2, for both conventions. Under these two readings, the true longest match is thus fewer than eight words. A directly planted **24-word true source excerpt** is recovered in each test; 64 fixed-seed shuffled original-word-length controls per reading likewise have no eight-word matches. This rules out a long verbatim quote in the exact current site text under these encodings, not original authored prose or changed 2014 site copies.

[SFT](../sims/lp2_metafysica_wings14_verbatim_wordlength_sft.py) · [passed Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/44062276039) · [source comparison artifact](https://github.com/FlareZ123/liber-primus/actions/runs/44062276039/artifacts/14319191103).

## 3. Whole-site article as GP29 additive running key

The exact original physical pp23–26, which contain the source-matched mayfly, carry **1,021 GP29 runes**. The current visible English source webpage normalizes to **40,848 GP29 runes**, with the Figure 4 *Ephemerella ignita* caption starting at key offset **7,442**. A vectorized exhaustive comparison evaluates two additive signs and two historically motivated F conventions: every original ciphertext rune consumes one source key rune, or cipher F stays literal without consuming any key rune. The latter skips **37 original F signs**, giving 984 active runes.

| Original source-key consumer | Candidate source offsets | Best decoded IoC | Best offset/sign |
| --- | ---: | ---: | --- |
| All 1,021 positions consume key | 39,828 | **0.03604117455** | 37,426, subtract source |
| F literal, 984 positions consume key | 39,865 | **0.03639514015** | 10,042, add source |

The original full section's IoC is **0.03427435617**. Across the entire actual website key stream, even the optimized outputs remain near uniform and their literal GP transliterations are opaque. Source-key offset zero and independently fixed species-caption offset 7,442 were also inspected; neither gives plaintext. A planted real-source key decodes all **95 original solved p57 GP29 plaintext runes exactly**, verifying the direction and modular inverse.

**Scope:** rejects only the literal contemporary visible-text GP29 running-pad model under the declared alphabet normalization, both GP29 signs and F treatments. It does not exclude the 1977 source *book* text, an undiscovered source-selected KDF, a cryptographic tool that consumes the image bytes, another plaintext register, or a different cipher operation.

[SFT](../sims/lp2_metafysica_wings14_runningkey_sft.py) · [passed Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/44062810663) · [full original source-offset scores and top transliterations](https://github.com/FlareZ123/liber-primus/actions/runs/44062810663/artifacts/14318897151).

## Decision

This visually motivated source page has now been exhausted for **three direct, independently specified uses**. Retire these exact consumers; do not repeat image lookup, guess running-key offsets, or mutate passphrases to rescue them. The printed figure *does* remain historically relevant. A legible original 1977 *Thieme's Insektengids* page 90 or independently attested pre-2014 author decoding instruction would be genuinely new evidence and could select a different reversible operation. Otherwise prioritize independent clues elsewhere in the manuscript. These tests produced no unknown LP2 plaintext and make no claim that solving the full book is impossible.
