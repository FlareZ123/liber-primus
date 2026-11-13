# 2016 oak tree source JPEG: original-size test and clue decision

**Agent 2, 13 November 2026.** The exact stock-tree image linked by the early 2016 Cicada community page is still hosted and its JPEG intrinsic dimensions are now independently measured from original HTTP bytes. **This resolves a specific missing original-source check**, but does not authenticate a 2016 domain, recover LP2 plaintext, or prove that any pixel dimensions encode a cipher key.

## Frozen source and executable test

The 2016 [community walkthrough](https://uncovering-cicada.fandom.com/wiki/2016_Message) identifies its dead-oak clipart with the exact original image URL `http://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg`. The HTTPS endpoint serves the same named file as a direct HTTP 200 JPEG on 13 November 2026. This address was selected from an existing historical witness; no similar-image search, fit, crop, or selected image parameter entered the test.

The self-contained [Node.js 22 SFT](../sims/cicada2016_oak_stock_intrinsic_size_sft.cjs) fetches that specific HTTPS URL directly, parses original JPEG marker segments to read the SOF dimensions, and computes SHA-256 of the complete returned bytes. It independently checks the unmodified archived 2016 signed-message JPEG, [`resources/historical/cicada2016-4gq25.jpg`](../resources/historical/cicada2016-4gq25.jpg), against its pinned SHA-256 and its native dimensions. Neither image is re-encoded or adjusted; original stock bytes are not rehosted in this repository. The [manual-only workflow](../.github/workflows/cicada2016-oak-stock-native-manual.yml) completed successfully in [run 43469209029](https://github.com/FlareZ123/liber-primus/actions/runs/43469209029), whose job logs print all raw metadata.

| Property | Current ClipartBest source JPEG | Authentic 2016 `4gq25.jpg` |
| --- | --- | --- |
| HTTP response for stock | 200, identical final HTTPS URL | Pinned local original archive file |
| Native SOF0 width × height | **1222 × 1600** | **563 × 569** |
| File size | **280,214 bytes** | **26,342 bytes** |
| SHA-256 | `6fc875c099081908587fed6f1b3ac96bceece97f276e9fdd5cd52ec5ea791a34` | `a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe` |

The earlier model web preview was rescaled to **764×1000** and therefore could **not** establish the original SOF dimensions. The executable 1222×1600 measurement supersedes that preview. The measured file differs in aspect ratio and in both axes from 563×569. Thus the signed 2016 image did **not** inherit the current stock JPEG's native 563×569 dimensions unchanged. A resize, crop, pad, and/or re-composition occurred somewhere along the image lineage, possibly by automatic image handling.

## Consequence for the previously proposed 2012 phone-domain replay

The [existing source-fixed 2012→2016 candidate analysis](cicada2012-2016-phone-image-dimension-transfer-gate.md) correctly observes that the *sorted prime dimensions* of the signed 2016 image `563,569` exceed the original 2012 image's `503,509` by **60 on both axes**, and that replaying the original 2012 telephone multiplication yields candidate `1057465447.com`. The exact original ClipartBest source size had been missing, leaving open the specific counter-explanation that its JPEG already used the prime canvas `563×569`. **For the currently hosted stock asset that counter-explanation is now excluded.**

**Crucial limits:** The stock image is observed in 2026, and no byte-identical pre-January-2016 capture of that file has been authenticated. A historical stock variant might have used different dimensions. A deliberate 563×569 canvas is only *more plausible* after this test: ordinary image-processing software can resize/crop automatically, and the 2016 signed prose does not command repeating the 2012 telephone multiplication. The current-source dimension mismatch does not supply a cipher key or a verified `1057465447.com` page.

**Next decisive test:** If a pre-January-2016 original stock capture survives, compare its own header and digest with the modern 1222×1600 source to exclude asset-version drift. Independently, a dated January 2016 DNS/Wayback record containing an authenticated signature or LP2 key on exactly `1057465447.com` could justify following the historical domain rule. No need to run more speculative source-image transforms, keyword searches, or ciphertext fits without that evidence.
