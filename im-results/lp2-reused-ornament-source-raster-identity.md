# Repeated original LP2 ornaments: exact RGB equality

**Agent20, 15 November 2026. Scope:** original-artifact forensic observation, not an LP2 cipher solution.

Original physical LP2 pages 40–55 repeat a floral border; pages 34–39 repeat a two-line cuneiform heading. If a proposed decipherer relies on *page-varying marks in those precise artwork regions*, the marks must differ in the source. A [source-exact Pillow SFT](../sims/lp2_reused_art_pixel_identity_sft.py) now establishes that every compared RGB channel value is identical.

## Results

Source files are original scans `resources/liber-primus/(p+17).jpg`, all 2400×3600 pixels; the maintainer's original 75-image ZIP was used for direct execution. The SFT converts each JPEG to RGB, crops the stated rectangle without registration/thresholding/downscaling, and compares all RGB bytes to the first page.

| Art region | Source pages | Rectangle (left,top,right,bottom) | RGB changed channels | SHA-256 of identical crop bytes |
| --- | --- | --- | --- | --- |
| Floral left strip | p40–55 (16) | `(0,0,450,3600)` | 0 on all | `170f030ca6c95cd0fb8fe60d998495399304f86932b563ee732cdbf7708251b3` |
| Floral right strip | p40–55 (16) | `(1950,0,2400,3600)` | 0 on all | `b438ac81195b3c9733aff0f6dab0f6a393840873afd51dfe895ea309f10f520c` |
| Cuneiform top heading | p34–39 (6) | `(900,100,1550,500)` | 0 on all | `1c321564f976dade8badbaef85cb0ddaf6aea60f6b7531510fd179a201d90ade` |

**Differential positive control:** Two different original text regions, p41 and p42 both cropped `(900,500,1500,1200)`, differ in **373,773 RGB channel positions** using the same comparator. The script asserts the positive control and the exact source matches. Local PASS: Python 3.13.5, Pillow 12.3.0.

## Exact full-page variability mask across floral chapter

For source pages p40–55, the same SFT also makes **one pixelwise union over all 15 comparisons** of the complete 2400×3600 RGB images, with physical p40 as a fixed reference. A position is marked changed if **any** of its three color channels differs on **any** of the other fifteen pages. The resulting binary mask has **2,631,883 changed pixel positions**, and its **entire bounding box is exactly** `(591,624,1832,3184)` in Pillow's exclusive-end coordinate convention. All pixels outside this 1241×2560 interior rectangle are **identical on all 16 source scans**, including the page ornament, corners and margins. The mask's changed region contains original prose, numeric table, chapter headings and the p53 moth. A positive text differential demonstrates the procedure detects actual differences. This stronger result is asserted in the reproducible SFT and was executed locally with the original ZIP, with no threshold or downscaling.

The result directly narrows any visual key search to **the original central text/art rectangle or nonpixel JPEG carrier bytes**. It does not exclude fixed ornament structure as a cipher clue, source geometric routing or altered text glyphs.

## Implication and limitations

These exact repeated art crops provide no page-index-dependent visible-pixel key. They **can** supply one unchanged clue or semantic chapter marker. The test says nothing about other artwork regions, per-page red headings, rune ink, PDF source layers, JPEG metadata, steganography or independently selected cipher inputs. It yields no original unknown plaintext, historical key or decoder. Keep this source-local exclusion in supporting research and avoid promoting it to solved results.
