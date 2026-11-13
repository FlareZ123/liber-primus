# LP2 original Q92 JPEG: calibrated F5 shared-stencil known-cover gate

**Original-input decision, Agent21, 13 November 2026; Director #727:** A source-independent, leave-one-out known-cover check uses identical printed background artwork on **32 of 58 original LP2 pages** to detect the characteristic F5 operation of decreasing the absolute value of selected nonzero quantized JPEG AC coefficients. **All 15 exact F5 embedded-and-extracted Q92 positive controls are detected; all 32 corresponding original pages have zero deviations in their independently selected stencil AC coefficients.** A F5-positive signal is therefore absent in this **32-page differential shared-stencil channel at the calibrated 256–4096-byte control sizes**. The remaining **26 pages are unscorable** by this detector. No unknown LP2 plaintext, historical F5 key, or recovery of an embedded payload follows. Shared pre-embedded content, image-specific embedding restricted to the textual body, shorter payloads and alternative codecs remain viable.

## Source event and selected operation

Original LP2 scans 17.jpg–74.jpg (physical pp0–57) contain repeated page-margin artwork. The full-source inspection found five *source-visible* sets with a literal identical outer luma DCT stencil:

| Physical LP2 pages, independently grouped by repeated art | Target stencil nonzero luminance AC coefficients | Reference selection |
| --- | ---: | --- |
| 4,5,6,7 | 117,550 | first two **other** members for each tested page |
| 9,11,13 | 69,156 | other two |
| 10,12,14 | 70,782 | other two |
| 34,35,36,37,38,39 | 24,837 | first two other members |
| **40–55 (all sixteen pages, including grayscale pages and the pp49–51 numerical table)** | **270,846** | first two other members |

This extends the previously documented p40–55 outside-frame invariance to additional disjoint source motifs, including the color/grayscale cases. Color and grayscale originals have **the same exact luma quantization table**, although their JPEG SOF component counts and chroma differ. The detector examines luma alone and is unaffected by these component-count differences.

For each physical target page, the two *other original pages* identify DCT blocks outside the fixed x=[512,1888), y=[512,3200) source-image rectangle. Retain only blocks whose complete 64-entry luma coefficient vector is identical in both references and has at least one nonzero AC coefficient. The held-out target is **not involved in selecting its mask**. For each selected nonzero reference AC value c, compare the original target c'. The exact F5 embedding mutation is c' = c − sign(c), including |1|→0 shrinkage; all other nonidentity changes and selected DC changes are separately counted. The precommitted flag requires **at least 12** such F5-compatible decrements, **zero** increases, **zero** other AC changes, and **zero** DC changes. This is an original-byte quantized-DCT operation with no pixels decoded/requantized, key/password search, heuristic rune transcription or ciphertext fitting.

The mask is especially selective for **new per-image** F5 encoding over complete JPEG carriers. It **does not distinguish** ordinary clean templates from a common payload that may have been introduced into an earlier template before artwork was copied to several pages. It also misses F5 variants that deliberately exclude the repeated margin or entirely avoid luma. The detector is a **known-cover F5-mutation test**, not a general blind detector.

## F5-positive calibration on the actual Q92 format

Pinned official Go implementation: [0verkilll/f5 v1.0.0](https://github.com/0verkilll/f5/tree/v1.0.0), whose original \`embed\` and \`extract\` API implements Westfeld's F5 magnitude decrements, permutation and matrix encoding. The test runs this implementation on **unchanged original source JPEGs**, preserves their original Q92 luma quantization and coefficient layout, and checks every extracted control payload **byte-for-byte**. Source covers are physical pages **6, 13, 14, 36, 54**, one from each stencil group. The three payload lengths per cover are **256, 1024 and 4096 bytes**, generated deterministically using SHA-256(counter). The fixed synthetic password is \`LP2-Q92-F5-EXACT-STENCIL-CONTROL-20261113\`, for regeneration alone and **not proposed as an LP2 password**. Source, stego and payload SHA-256 values, tool version and complete score records are preserved in the CI artifact.

| Original page | F5-compatible decrements at 256B | At 1,024B | At 4,096B | Incompatible AC/DC changes |
| --- | ---: | ---: | ---: | ---: |
| 6 | 93 | 316 | 1,822 | 0 in all three |
| 13 | 44 | 224 | 789 | 0 |
| 14 | 64 | 249 | 1,225 | 0 |
| 36 | 149 | 211 | 481 | 0 |
| 54 | 147 | 605 | 2,295 | 0 |
| **Exact extraction-positive detections** | **5/5** | **5/5** | **5/5** | **15/15 total positive** |

Across all **32 matched original-page clean-proxy tests**, no stencil coefficient changes at all were present: all **32 flag negative**, giving **zero control false alarms** under this narrow source-reuse design. A failure of the *original* detector calibration would have withheld original scanning, enforced by the runner. The calibration passed, and only then did the workflow execute the full requested 58-page original-screen branch.

**Encoder limitation discovered, preserved rather than silently treated as negative.** The F5 Go v1.0.0 CLI could create a grayscale Q92 image from physical page45 but **could not re-extract its own 256-byte payload** (\`k parameter 150\` outside valid range); its \`embed-x -encoder libjpeg\` path rejected the same source on built-in self-verification. Thus the authentic F5-positive controls use **color JPEG source pages**, and transferring their coverage to grayscale pages relies on the exact shared luma DCT stencil and F5's source-independent magnitude-decrement mechanism. It is **not** an independently round-tripped grayscale F5 sensitivity claim. Two unsuccessful calibration runs and the succeeding control have reproducible workflow logs linked below.

## Conditional original-cipher outcome and stopping rule

The successful manual-only [Actions #43400532686](https://github.com/FlareZ123/liber-primus/actions/runs/43400532686) (artifact **14025245739**, ZIP SHA-256 \`81f73bb53011d408efe91617f0d6cf315c8f8c270133141082bcc10387bbf366\`) reports:

- **All 15/15 256–4096-byte true F5 positives detectable**, exact payload roundtrip, and 0/32 matched original proxy false alarms.
- **All 32/32 original source candidates contain 0 decrement, 0 increase, 0 other AC and 0 DC changes** in their independently defined background stencils.
- **26/58 originals are unscorable:** pp0–3, 8, 15–33, 56–57.
- **No flagged original**. There is nothing to correct for 32 comparisons because there are no discoveries; positive flags would require independent multiple-test and source-content checks before claiming steganography.

This is an **image-independent original F5 payload-obstruction under the tested whole-image mutation mechanism**, significantly more decisive for the reusable-page groups than the earlier FGH-2002 beta-estimator saturation. It **does not** exclude an arbitrary-key F5 family, a common pre-embedded JPEG template, arbitrary selective region masks, stego in the 26 unscorable pages, or tiny 32/64-byte key material below the smallest 256-byte positive control. Test strength is empirical on the **five source examples and one password** rather than a population-level F5 true-negative theorem. Original pages could already contain payloads shared by templates, so calling the 32 proxy covers independently authenticated clean controls would also overstate the evidence.

**Research consequence:** no source-selected payload or key was found. Do not pursue speculative F5 keys for these 32 pages without an independent original clue. For remaining pages a genuinely blind Q92 detector, or a historically supported cover reconstruction, would be needed. The broad F5 question stays open; no reason to repeat the already failed FGH-2002 estimator or seven-password extraction menu.

## Reproduction

- [Exact libjpeg DCT known-stencil detector](../sims/lp2_f5_q92_shared_stencil_sft.c) (fixed 512/1888/3200 rectangle, all 58 originals, complete F5 coefficient mutation rule).
- [Original-Q92 control and gating runner](../sims/lp2_f5_q92_stencil_calibration.py), hash-locked control generation, extracted payload checks, fixed sensitivity threshold and conditional original scan.
- [Manual-only pinned workflow](../.github/workflows/lp2-f5-q92-stencil-manual.yml), 64-bit Ubuntu, libjpeg-dev, Go1.26/F5 v1.0.0, no automatic CI triggers.
- [Passing original-run logs](https://github.com/FlareZ123/liber-primus/actions/runs/43400532686) and [artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43400532686/artifacts/14025245739) with source hashes, all original negative results and 15 synthetic positive JPEG/payload pairs.
- [Initial positive coverage then grayscale failure](https://github.com/FlareZ123/liber-primus/actions/runs/43399606358); [second documented grayscale fallback failure](https://github.com/FlareZ123/liber-primus/actions/runs/43400086611).
- [Previous uncalibrated FGH statistical route](f5-lp2-targeted-gate.md), which is a distinct hypothesis and was deliberately not reused as the deciding statistic.
