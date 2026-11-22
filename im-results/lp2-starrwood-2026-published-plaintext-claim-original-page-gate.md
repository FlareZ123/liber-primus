# Public 2026 “full solution” plaintext: literal original-page test

**Status (15 November 2026, Agent5): direct, source-fixed claimed-plaintext mismatch.** No unknown LP2 rune plaintext, original encryption key, or reversible decipherment was obtained. This report addresses one newly accessible *published candidate text*, rather than adding more cipher/key scans.

## Candidate and the original source

The [Starrwood Studios “Cicada 3301 Full Solution” page](https://www.starrwoodstudios.com/new-page) publicly prints a claimed **30-page** English translation, labeled “PAGE 1” through “PAGE 30,” and links to the contemporaneous [Stefan Best Zenodo working-paper record](https://zenodo.org/records/23487409), DOI `10.5281/zenodo.23487409`, published 20 October 2026. The Zenodo PDF was unavailable to the existing retrieval job ([43645816109](https://github.com/FlareZ123/liber-primus/actions/runs/43645816109), five HTTP 410 responses), but **the publisher's separate website exposes its claimed page text** and can therefore be evaluated directly.

The original LP2 artifact has 58 physical pages p0–p57; 56 unknown pages p0–p55 contain **12,956 GP29 runes**. Known LP1 text includes “WELCOME, PILGRIM, TO THE GREAT JOURNEY,” already solved by the community. The site's PAGE 1 reproduces that **already-solved LP1 opening**, while interleaving headings “A WARNING” and “WELCOME”; these are not newly deciphered LP2 evidence. No original-rune stream, cipher equation, source key, alignment table, or original ciphertext reencryption is published alongside the 30-page English on the cited website.

## Exact claimed-vs-printed page quantities

Treat the public source's first three “PAGE” items literally as candidate plaintext for original encrypted physical LP2 p0, p1, p2 in order. Include each source **body heading** in the plaintext, omit only the metadata “PAGE N” tags, and count words as the public site's alphabetic tokens. Convert alphabetic text to the native 29-rune GP register using K→C, V→U, Z→S, QU→CW, ING→NG and the seven standard GP digraphs TH/NG/EO/OE/AE/IA/EA, longest matching token first. Do **not** add an invented padding channel or alter the page alignment.

| Published item | Published word count | Published GP rune count | Original LP2 physical page | Printed-page local word count | Original rune count | Exact aligned word-length matches |
|---|---:|---:|---|---:|---:|---:|
| PAGE 1 | **64** | **258** | p0 | **59** | **262** | **7** |
| PAGE 2 | **27** | **142** | p1 | **63** | **266** | **5** |
| PAGE 3 | **45** | **185** | p2 | **38** | **201** | **2** |
| **first three** | **136** | **585** | **p0–p2** | **160 local token pieces** | **729** | — |

**Input integrity:** LP2 GP rune counts are from unchanged `resources/liber-primus/lp2-corpus.json`. Source word counts are calculated from `resources/liber-primus/lp2-transcription.txt`: rune glyphs are concatenated across line breaks, while printed non-wrap separators end words; when a word runs across a page, the page-local pieces count separately. The canonical concatenated first chapter has 158 whole words rather than the local-pieces total 160. The site counts are from the three independently named public sections linked above. Their native-GP word-length vectors start respectively **[1,5,7,7,7]**, **[4,6,8,4,7]**, and **[1,5,7,4,4]**; original printed p0–p2 start **[8,5,4,3,3]**, **[5,8,8, …]**, and **[2,1,2, …]**.

For each item, comparing word lengths in source order through the shorter array yields the exact matching counts in the table. The original p0–p2 chapter contains **729** rune glyphs, but the three purported corresponding English pages contain only **585** native-GP symbols, a **144-symbol deficit**. A same-register length-preserving substitution, running-key Vigenère, prime-totient stream or mere rune permutation could not map these directly under this page correspondence; p1 alone differs by 124 rune symbols. The original printed word divisions also disagree.

## Decision: no new original plaintext

The website's text **fails the literal page-by-page plaintext claim** for LP2 pp0–2. In particular, direct original GP29 decryption cannot use this English as its first three physical-page outputs with the existing word divisions. The site also incorporates verbatim already-known LP1 content, which provides no new LP2 plaintext evidence. It supplies no specific alternative 30-to-58 page map, binary payload, padding/restoration rule, cipher or key to test against the remaining 56 unknown pages.

This result excludes **only the directly published PAGE1–3 ↔ LP2 p0–2 mapping under native text and unchanged word boundaries**. The mismatch does not logically exclude an unpublished compression, omitted passages or page regrouping; none is specified by the purported solver. A genuine claimant would need to provide the precise original rune offsets, original-to-output map, reversible encoder/decoder, and an independent held-out original-page prediction.

**Research disposition:** Do not promote the 2026 “full translation” into `results/` or take its invented statements as cribs or instructions. The presently available public text provides no recoverable key or authentic new page. A source-backed executable key/decoder would reopen the claim without any need to duplicate older statistical attacks.
