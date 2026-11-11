# Daniel 4 and Blake tree inscriptions: original-image-attributed LP2 crib gate

**Decision, 11 November 2026:** no exact 40-GP-rune plaintext crib from three independently specified pre-2014 passages. Source-selection was prompted by original visual material, rather than the ciphertext distribution. The strongest source-region overlap is just **five consecutive word lengths**, and the full familywise page-preserving null exceeds this in **1,989 of 2,000** trials. There is no recovered plaintext or key, and the proposed literary attribution remains unconfirmed. This closes only the fixed-quote/preserving-word-boundary interpretation.

## Historical/visual premise before the cipher test

The authentic 2014 `1033.jpg` cover contains a William Blake collage, including Blake's drawing of **Nebuchadnezzar**. The source [William Blake/Daniel 4 iconographic interpretation](https://frankgbosman.wordpress.com/2020/02/11/cicada-3301-the-book-of-daniel/) (2020) independently proposes that the Book of Daniel may be relevant; that paper is a later conjecture, not an authenticated 3301 cipher instruction. Original LP2 pp16–21 show branch/tree marginalia; p22 has a recumbent human; p27 an insect wing; p32 a blurred tree. The full original scans are archive `33.jpg`–`49.jpg`. These visual cues suggest testing the actual **pre-2014** King James rendering of Daniel 4's tree dream and the defeated king without assuming that the text quotes Daniel.

The third cue is a separate William Blake engraving, [*Laocoön*, ca. 1826–27](https://blake.lib.asu.edu/html/laocoon.html), whose inscriptions include literal opposed **trees of life/death**, and the declaration `GOD IS JESUS`. The Blake link is real at the 2014 cover, but **nothing in p32 says “Laocoön”**. This attribution is weaker and deliberately tested only on illustrated p32. The three passages and region selections were frozen before comparison against rune lengths.

| Source-fixed candidate text | Original target pages | GP words / GP runes | Printed LP2 words in region | Longest exact word-length match |
| --- | --- | ---: | ---: | ---: |
| [KJV Daniel 4:10–12](https://original.sacred-texts.com/bib/kjv/dan004.htm), Nebuchadnezzar's great tree | p16–21, tree/branch marginalia | 96 / 323 | 373 | **5** |
| [KJV Daniel 4:33](https://www.biblegateway.com/passage/?search=Daniel+4%3A33&version=KJV), king's birds' feathers and claws | p22–27, recumbent figure and insect wing | 45 / 176 | 303 | **5** |
| [Blake, *Laocoön* tree inscriptions](https://blake.lib.asu.edu/html/laocoon.html) | p32, drawn tree | 15 / 47 | 21 | **2** |

**Why these are concrete 40+ GP rune candidates:** each whole selected original passage exceeds forty GP rune symbols, with fixed spellings and word boundaries. If the manuscript were quoting any intact contiguous 40-rune block of them, its printed 1:1 GP word lengths would preserve a much longer sequence than the maximal displayed five or two. The authentic solved p56/p57 text provides independent historical evidence that genuine plain GP words can preserve printed delimiters, but this premise need not be true for the unknown sections.

## Frozen original-input test and control

The [standalone CommonJS SFT](../sims/lp2_daniel4_blake_tree_source_crib_sft.cjs) uses the existing source-checked [complete page-spanning word parser](../sims/lp2_word_pages.cjs) on all 12,956 original runes and 2,896 printed words. It uses the historical seven GP digraphs plus the solved-page-attested `ING` single-rune option, and fixed `QU→CW, V→U, K/Q→C, Z→S` normalization; no manuscript text is selected or decoded by fitting a cipher key. The fixed pre-2014 KJV verses are encoded in the test source. The Blake quote is taken from the established ASU edition of the engraving.

For a familywise no-crib control, the SFT shuffles the observed word lengths **inside each individual original page** while retaining the original printed word counts and per-page length inventories, then reruns the *entire* three-candidate/three-region maximum exact-match search. A deterministic 2,000-trial xorshift stream uses seed `0x041c3301`. Independent full quoted source-list lengths are planted into copied target vectors and recovered exactly, verifying that the matching algorithm would discover an actual preserved-boundary quotation when present.

| Statistic | Result |
| --- | ---: |
| Maximum among three original-source windows | **5** words |
| Mean maximum across 2,000 page-preserving shuffles | **5.734** words |
| Null maxima distribution | 4:11, 5:826, 6:910, 7:208, 8:34, 9:6, 10:4, 12:1 |
| Null trials with a maximum ≥ original | **1,989 / 2,000** |
| Plus-one tail estimate | **0.9945027486** |
| Any source-selected intact 40-GP-rune word-boundary match | **No** |

Executed successfully in dispatch-only [GitHub Actions run 43121092878](https://github.com/FlareZ123/liber-primus/actions/runs/43121092878), with full JSON result archived as workflow artifact `daniel4-blake-crib-source-gate`.

## Interpretation and handoff

The Blake cover and original tree/figure imagery support a visually motivated **source hypothesis**, but they provide no unique chapter, verse, translation, or original passage length. The three frozen exact-source quotations fail the simplest test, and their best matches are very ordinary compared with the null, so no part of the proposed passages should be promoted as recovered LP2 plaintext. The result does not exclude Daniel/Blake as symbolism or paraphrased source material, an alternative translation, an actual source-selected key text rather than a plaintext quotation, altered word boundaries, or a multi-layer encrypted intermediate.

**Director decision:** close the bounded exact-quotation branch without opening numerical key scans. Revisit if an original image or signed source independently identifies a specific verse/line **and** a transformation with an explicit, discriminating original-cipher prediction. A visual analogy alone is insufficient to claim a 40-rune crib.
