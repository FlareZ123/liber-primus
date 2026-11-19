# LP2 p43–p48 source-first preregistration

**Owner:** Agent45  
**Issue:** #1907  
**Run:** agent45-gpt6-20261119T145518Z-draw7-issue1907-b01ed60f  
**Status:** Frozen before consulting any p43–p48 page-specific derived report. This is a source inventory and hypothesis lock, not a decryption claim.

## Scope and source mapping

The repository's original-image README defines LP2 physical page = archive filename index − 17. Therefore p43–p48 are original archive images 60.jpg–65.jpg, stored as resources/liber-primus/60.jpg through 65.jpg. The repository README also records that all 58 LP2 JPEGs are byte-identical to the dated 11 May 2014 Stage11 onion archive distribution. The six images are 2400×3600 grayscale JPEGs.

Exact SHA-256 values:

| LP2 page | Original image | SHA-256 |
|---:|---:|---|
| 43 | 60.jpg | dc4cf22565ccabb2b3d366eb8bd6b74520e3169133a7bd725373aad2f49ac415 |
| 44 | 61.jpg | 463cf95229ccb6ae179cdd0fce2338df9f616da0db38813573a9fb1706846208 |
| 45 | 62.jpg | 898b614af5473937a9abfcdc618160ba80ea44b07d4a479da4526be6e33f28d9 |
| 46 | 63.jpg | 05538b8ebf9ed2a5716d94284a753dd26582a0227f139cc4a27dc3f07b15d301 |
| 47 | 64.jpg | 08ed86be5561c09ce5c773d8001b290cc505436db89637d66ea0f5a15818d1c8 |
| 48 | 65.jpg | 341da69e9d579528dd17b7659e23de210720429111dc76c512843eb1983100ea |

## Source-only visual inventory

- Each page has one central column of 12 printed lines of GP29 runes. The lines are black on grayscale paper; there is no red ink, red initial, colored title, page number, caption, marginal annotation, URL, Latin heading, or explicit numerical table on p43–p48.
- Each page has the same bilateral, botanical/vine-like side ornament: curling stems/roots, leaves or flower-like forms, and small repeated dot clusters. Avoid assigning a species or a more specific symbolic identity without evidence.
- The left margin strip (x=0–499, y=0–3599) and right margin strip (x=1900–2399, y=0–3599) are pixel-identical across the neighboring physical pages p42–p49 (archive images 59–66). Thus the ornament supplies no page-varying image state or per-page key over this interval. It may still function as a section marker.
- The preceding p42 uses the same frame and a 12-line runic block. The following p49 retains the frame but changes visibly: three runic lines lead into a red-marked numerical block. This is the first local, source-visible transition from ordinary runic prose to numbers. Do not project p49's red marker backwards onto p43–p48.
- The canonical resources/liber-primus/lp2-transcription.txt blocks %43–%48 each contain 12 lines. The canonical corpus reports the following rune counts; in the transcription, hyphens are word-divider notation, periods are printed punctuation, and slash characters are transcription-only line terminators (not printed glyphs).

| Page | Lines | Runes | Word-divider marks (-) | Periods (.) |
|---:|---:|---:|---:|---:|
| 43 | 12 | 274 | 53 | 5 |
| 44 | 12 | 273 | 54 | 2 |
| 45 | 12 | 270 | 60 | 3 |
| 46 | 12 | 270 | 57 | 3 |
| 47 | 12 | 274 | 54 | 4 |
| 48 | 12 | 271 | 59 | 7 |
| **Total** | **72** | **1632** | **337** | **24** |

- No special typography distinguishes an individual page within p43–p48. The modest rune-count variation is consistent with a fixed 12-line page layout; the mean is 272 runes/page, not by itself evidence of a key or grid.
- The adjacent solved p56/p57 controls are visually unlike this interval: p56 (archive 73) has red emphasis and a compact five-row hex-like block; p57 (archive 74) has the red PARABLE title/terminal red mark and a short English plaintext. These controls show that salient red/colored structure is available when present; it is absent from p43–p48.

## First-party context available to a contemporary solver

- The signed 2013 forest message (resources/historical/cicada2013-forest-clue.asc) says, “You can't see the forest when you're looking at the trees.” This can motivate a section-level or whole-artifact view; it does not specify a cipher, a selection rule, or a key.
- The signed 2013 continuation message (resources/historical/cicada2013-second-onion-everything-you-need.asc) says one must sometimes “knock on the sky and listen to the sound.” This makes an audible/knock-based operation conceivable, but p43–p48 contain no audio, timing, knock pattern, or uniquely grouped signal.
- The signed 2014 Stage11 message (resources/historical/cicada2014-stage11-message.asc) points to an onion continuation and “enlightenment”; it gives no p43–p48-specific operation.
- The signed 2016 4gq25 message (resources/historical/cicada2016-4gq25.md) says LP words are the map, meaning the road, and numbers the direction, while warning against false paths. This supports semantic interpretation after decryption and gives the adjacent p49 numeric section relevance, but it does not select a transform for p43–p48.

## Frozen candidate hypotheses (maximum three)

These are candidate human readings, not endorsed mechanisms. No p43–p48 derived report, prior page-specific attack, or broad key search was consulted before this lock.

### H1 — “Forest” means treat the interval as one section

- **Exact input:** all 1632 GP29 runes in p43–p48, in physical order, preserving the 72 printed line boundaries and word dividers.
- **Source-visible operation:** concatenate the six pages as one contiguous text section; do not invent a page-specific state reset or treat the repeated border as six different keys.
- **Key/state provenance:** the 2013 signed forest hint plus the repeated frame; this supplies only a scope/grouping cue, not cryptographic key material.
- **Receiver:** eventual semantic plaintext, with p49's numerical block as a possible next-stage receiver under the 2016 words/meaning/numbers guidance.
- **Untouched prediction:** if the frame is a per-page key source, the p48 margin must differ in a reproducible way from p43–p47. If it is only a section marker, no such page-varying state should exist. The exact margin-strip comparison is the discriminating test. Even a positive section-marker result does not identify a reversible cipher.

### H2 — Bilateral frame suggests a mirror operation

- **Exact input:** each original printed rune line on p43–p48, with word dividers retained; p48 is the untouched check page.
- **Source-visible operation:** reverse the rune order within each printed line, without changing the line order or tuning a shift.
- **Key/state provenance:** left/right symmetry of the repeated frame; no key or phase is supplied.
- **Receiver:** direct GP29 transliteration / readable plaintext.
- **Untouched prediction:** the same fixed line-reversal rule must make p48 readable or expose a specific repeated plaintext structure without a page-specific adjustment. If it does not, the frame is not sufficient evidence for line reversal as a stand-alone decipherment.

### H3 — “Knock/listen” suggests a Morse-like signal

- **Exact input:** the printed punctuation/word-divider stream in p43–p48, represented by the canonical transcription's periods, hyphen word dividers, and printed line boundaries; p48 is the untouched check page.
- **Source-visible operation:** test standard Morse with no custom alphabet or arbitrary segmentation; line boundaries are the only permitted packet boundaries.
- **Key/state provenance:** the signed 2013 “knock … listen” hint; no timing, key, or additional grouping is supplied by these pages.
- **Receiver:** ASCII letters/digits.
- **Untouched prediction:** p48's line-bounded packets must parse as valid standard Morse without splitting or regrouping them after seeing the output. If they do not, the punctuation is ordinary punctuation/word separation rather than a Morse carrier.

## Decision rule

Test only H1–H3 as frozen. Do not run p32/p47 low-digit or XOR families, p48 OutGuess/coordinate false-positive work, generic steganography, or broad key/phase searches. A surviving route must specify a reversible operation on the original rune stream, an authentic key/state source, and a receiver; otherwise report the missing clue/receiver and retain ordinary ciphertext continuation as the strongest rival.
