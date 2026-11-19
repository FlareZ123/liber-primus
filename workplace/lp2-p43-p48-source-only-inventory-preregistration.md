# LP2 p43–p48: corrected source inventory

**Correction:** the earlier version of this file mistakenly treated archive filenames 43–48 as LP2 physical page numbers. The archive contains 17 LP1 images first; the correct mapping is **physical LP2 page = archive filename − 17**. Thus p43–p48 are archive images **60.jpg–65.jpg**. This file supersedes the erroneous image inventory. The already committed `workplace/source-first-p43-p48-preregistration.md` is the valid earlier source-first freeze of hypotheses H1–H3.

## Correct original inputs

The six files below were extracted from the supplied ZIP and their SHA-256 values match the existing source-first preregistration and repository source inventory.

| Physical page | Archive image | SHA-256 |
|---:|---:|---|
| 43 | 60.jpg | `dc4cf22565ccabb2b3d366eb8bd6b74520e3169133a7bd725373aad2f49ac415` |
| 44 | 61.jpg | `463cf95229ccb6ae179cdd0fce2338df9f616da0db38813573a9fb1706846208` |
| 45 | 62.jpg | `898b614af5473937a9abfcdc618160ba80ea44b07d4a479da4526be6e33f28d9` |
| 46 | 63.jpg | `05538b8ebf9ed2a5716d94284a753dd26582a0227f139cc4a27dc3f07b15d301` |
| 47 | 64.jpg | `08ed86be5561c09ce5c773d8001b290cc505436db89637d66ea0f5a15818d1c8` |
| 48 | 65.jpg | `341da69e9d579528dd17b7659e23de210720429111dc76c512843eb1983100ea` |

All six are 2400×3600 grayscale JPEGs. The canonical transcription blocks %43–%48 each contain 12 lines:

| Page | Lines | Runes | Hyphen dividers | Periods |
|---:|---:|---:|---:|---:|
| 43 | 12 | 274 | 53 | 5 |
| 44 | 12 | 273 | 54 | 2 |
| 45 | 12 | 270 | 60 | 3 |
| 46 | 12 | 270 | 57 | 3 |
| 47 | 12 | 274 | 54 | 4 |
| 48 | 12 | 271 | 59 | 7 |
| **Total** | **72** | **1632** | **337** | **24** |

## Correct source-visible structure

- Every page has the same centered 12-line GP29 text block and the same bilateral botanical/vine-like frame: curling stems, roots, leaf/flower-like forms, and small dot clusters. There is no red ink, enlarged initial, colored title, page number, caption, marginal annotation, Latin text, URL, or printed numerical table on p43–p48.
- The left margin crop `x=0..499` and right margin crop `x=1900..2399` are pixel-identical across archive images **59–66**, i.e. physical p42–p49. The crop SHA-256 values are respectively `0f912c9126481b038f7906edaf518caed80f5e4306f69b21747b125a30522b8c` and `0a96c791f5e4b794577009bd1dfccb244e8e939c8c721095e7c9e406e6d75234`. The frame carries no page-varying state over this interval.
- p49 (archive 66) retains the same frame, but after three runic lines transitions to a red-marked numerical block. The p43–p48 images themselves remain ordinary text pages.
- Printed hyphens are word-divider notation in the transcription; periods are printed punctuation; slash characters are transcription-only line terminators. No timing, knock sequence, or distinct dot/dash alphabet is visible.

## Frozen source-first candidates

Use the exact hypotheses and decision rules in `workplace/source-first-p43-p48-preregistration.md`:
1. **H1:** the signed 2013 “forest” hint motivates treating the six pages as one section; the repeated frame is tested as a possible section marker, not assumed to be a per-page key.
2. **H2:** bilateral frame symmetry motivates one fixed reversal of rune order within each printed line; p48 is the untouched check.
3. **H3:** the signed 2013 “knock … listen” phrase motivates standard Morse on the punctuation/word-divider stream, with printed line boundaries as the only packets; p48 is the untouched check.

The original-source inventory does not itself select a reversible cipher, key, or plaintext receiver. A positive result must supply all three; otherwise close the interval as a bounded negative and retain ordinary ciphertext continuation as the strongest rival.
