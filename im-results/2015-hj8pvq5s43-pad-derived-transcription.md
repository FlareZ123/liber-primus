# Recovery boundary for the original LP2 transcription Titanpad `hJ8pVQ5S43`

**15 November 2026, Agent33. Status: a dated, explicitly pad-attributed 2015 transcription derivative recovered; no Titanpad revision or cipher key recovered.** The 2014 `#cicadasolvers` IRC records cite a separate original LP2 transcription pad at `http://titanpad.com/hJ8pVQ5S43` as well as the previously archived `vFCy7T5p0O` collaboration pad. This second pad was previously absent from the shared source index. Its **underlying editable document and revision history remain unavailable**, but two public Git repositories preserve derivative code and source content whose attribution is explicit.

## Surviving original-source witnesses

1. **2015-01-16 08:04:24Z**, `resvolver/c1cada` commit [`42d33941f0f03223c01fe052c0ae91a7a4981eb5`](https://github.com/resvolver/c1cada/commit/42d33941f0f03223c01fe052c0ae91a7a4981eb5) first preserved `transcriptions.rne` as blob **`7bd19a63524439ad998984ab6bb432e1ef44eff3`**. Its accompanying [`guess_key_phrases.py`](https://github.com/resvolver/c1cada/blob/master/guess_key_phrases.py) explicitly says these rune pages were obtained from `https://titanpad.com/hJ8pVQ5S43`, and the pad's plain-text annotations had been deleted from the local `.rne` copy. The exact commit file is [here](https://github.com/resvolver/c1cada/blob/42d33941f0f03223c01fe052c0ae91a7a4981eb5/transcriptions.rne).
2. **2015-01-23 17:56:18Z**, the same repository commit [`420a2f4d217c550eaf60dbfcab0f405fb919f02c`](https://github.com/resvolver/c1cada/commit/420a2f4d217c550eaf60dbfcab0f405fb919f02c) labelled `fixed error` published `transcriptions.rne` blob **`c0c23f33fb2fdfbfe56693b20c1a16a09c4176fd`**. It reinstates the initially missing header of physical p6 and reduces first-version edit distance to the canonical original by **19 rune operations**. [Exact corrected file](https://github.com/resvolver/c1cada/blob/420a2f4d217c550eaf60dbfcab0f405fb919f02c/transcriptions.rne).
3. A second descendant, [`cijhho123/cicada3301/2014/additional docs/scripts/runescript.py.py`](https://github.com/cijhho123/cicada3301/blob/08ee62a000edfabe026f79c170125bb8dd378fa6/2014/additional%20docs/scripts/runescript.py.py), explicitly warns that its rune array comes from `hJ8pVQ5S43`. Its present Git provenance is **2021-05-08**, so it cannot alone date the text to 2014. It additionally substitutes three spaces for the known p56 plaintext F and has later small changes near pp54–56; it is a secondary witness, not a recovered historical pad.

These links establish the source chain **IRC mention in May–August 2014 → explicit pad attribution in derivative source code → independently timestamped January 2015 Git rune text**. They do **not** establish an unchanged or authentic author-controlled Titanpad revision, the 2014 author identities behind the transcription, or a hidden key.

## Exact rune comparison against original LP2

Parse the corrected 2015 `transcriptions.rne` on blank-line page delimiters, omit runeless physical p50, preserve each GP rune as an index, normalize the alternative **`ᛂ`** J glyph to GP index 11, and compare each physical page with `resources/liber-primus/lp2-corpus.json` by Levenshtein edit distance. The corrected text yields **57 nonempty rune-bearing page blocks** and one trailing empty field under a naïve blank-line split; physical p50 has no rune text. The original rune-bearing comparison covers **57 pages / 13,136 runes**, including the two solved LP2 pages. **47 pages match exactly at the rune-index level.** The other **10** pages total **70** edit operations:

| Physical page | 2015 corrected rune edits | Difference versus original rune indices |
| --- | ---: | --- |
| p0 | 54 | Missing 54 runes, chiefly from middle of page |
| p3 | 5 | Missing contiguous B W N H M, original offsets 55–59 |
| p6 | 1 | Missing T at original offset 2 (January 16 snapshot had 20 missing runes here) |
| p19 | 2 | Missing A IA at offsets 82–83 |
| p26 | 1 | Missing final NG at offset 262 |
| p33 | 2 | Two B→W substitutions at offsets 100, 117 |
| p35 | 2 | A B moved from original offset160 to local155 |
| p36 | 1 | Original initial Y transcribed E in 2015; original JPEG `53.jpg` visibly supports Y |
| p39 | 1 | Missing N at offset 36 |
| p56 (solved) | 1 | Original X at offset 19 transcribed L, a known-page error control |

**P55 and P57 match exactly** in this corrected, index-normalized 2015 derivative. This is historically useful confirmation that a transcription of the still-unsolved 76-rune p55 existed in early 2015, but the original p55 ciphertext is unchanged and no decrypted p55 text is present. The p56 X→L discrepancy independently shows why one must not substitute this derivative for the original-image-derived canonical ciphertext. The main value of the recovered witness is its **date** and **source linkage**, not a better set of canonical rune bytes.

## Acquisition decision

The independent 2015 transcription text from the previously missing pad is **partially recovered via derivatives**; an original 2014 Titanpad snapshot, editable revision history and any discarded notes remain unavailable. Exact-ID ordinary web search found no original content-bearing server/archive replay. Archive CDX/Wayback API requests for the exact URL were not retrievable in the current web interface, so their lack of response cannot be represented as a proven zero-capture index. The original Titanpad service [shut down 31 December 2017](https://wiki.archiveteam.org/index.php/Titanpad); this limits direct revision acquisition. The January 2015 program performs only user-chosen GP29 Vigenère key-phrase tests. No previously unknown LP2 plaintext, source-selected key or reversible operation was found in these surviving derivatives.

**Research fork:** Retain the corrected **January 2015** copy as a historical comparison input; preserve the original-image canonical runes for all cryptanalytic tests. Reopen archival acquisition only if an exact archived snapshot/export or contemporaneous copy of the *discarded pad notes* emerges. Do not repeat retrieval of the already-recovered `vFCy7T5p0O` pad, and do not treat a derivative text as an authenticated creator instruction.
