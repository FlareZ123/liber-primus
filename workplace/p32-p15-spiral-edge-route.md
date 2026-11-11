# p15 Fibonacci-prime spiral → p32 word-edge route → possible p55 target

**Status: source-constrained navigation hypothesis; not a decryption.** The new 3301-complement/prime-rank address materially strengthens the p15→p32 selector. It still does not specify a reversible cipher or recover plaintext. Keep source facts, selector inferences, and failed readouts separate.

## Candidate human solve path

The signed 2016 tree image is 563×569. Original LP2 physical p32 contains 121 runes, naturally arranged as an 11×11 row-major grid. Its first-row and first-column GP-prime sums are exactly 563 and 569, defining the already documented image partition.

The canonical p32 word stream has 22 printed words with lengths:

`1, 3, 5, 11, 5, 5, 3, 11, 6, 9, 5, 8, 4, 9, 4, 8, 2, 3, 2, 8, 5, 4`.

A plausible interpretation of the signed 2016 instruction (“words are the map; meanings are the road; numbers are the direction”) is to inspect four-rune word-edge fragments. The four-rune length is suggested by the 4×4 number square on LP2 physical p15; this is a hypothesis, not an explicit instruction.

Across the 22 p32 words there are 32 raw four-rune prefix/suffix windows, 29 unique after deduplicating identical prefix/suffix windows of four-rune words, and 9 unique windows whose four GP symbols each transliterate to one letter. The nine are `HOME, SLFD, TYMG, WBSR, BUDS, NWGU, LAOY, UTFJ, TFJT`. Only HOME and BUDS occur in the repository's 1,809-entry four-letter TextBlob frequency lexicon.

HOME and BUDS are **edge fragments, not complete printed words**:
- HOME is the four-rune prefix at offsets 33–36 of the 11-rune word `HOMEXWDSLFD`, the first word of p32's second clause.
- BUDS is the four-rune suffix at offsets 93–96 of the eight-rune word `OENGOMBUDS`, which begins at offset 89.

There are five unique geometrically valid southeast edge pairs separated by 60: starts (4,64), (16,76), (25,85), (33,93), and (44,104). **HOME→BUDS is the only pair among the nine single-letter edge windows that is both a lexicon word pair and +60 apart.** The 60-step pair is therefore more selective than the unfiltered edge-window claim, but it remains conditional on the chosen edge length and displacement.

The HOME→BUDS path is offsets **[33,45,57,69,81,93]**, coordinates **(3,0)→(8,5)**, rune labels **[H,B,M,IA,NG,B]**. Its four interior GP-prime weights are **[61,71,107,79]**, summing exactly **318**.

## p15 spiral and the new prime-rank address

The 4×4 square is on **LP2 physical p15**, original archive image `resources/liber-primus/32.jpg` (archive image number 32; not physical p32). The original scan visibly contains the red 3299 start and all 16 values:

| 3258 | 3222 | 3152 | 3038 |
|---:|---:|---:|---:|
| 3278 | **3299** | 3298 | 2838 |
| 3288 | 3294 | 3296 | 2472 |
| 4516 | 1206 | 708 | 1820 |

Following the red-3299 clockwise inward spiral gives:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.

The **11th** spiral value is **2838**. The p32 map's side length 11 could select that entry; this is a plausible selector, not a written instruction.

The p15 Fibonacci-prime spiral itself is **established prior work**, not a new discovery; see `results/lp2-p15-fibonacci-prime-spiral.md` and `im-results/p15-fibonacci-page-word-address-gate.md`. Its construction is explicit: for a table value (v), (3301-v=p_{F+1}), where (F) is a zero-based distinct Fibonacci value and (p_j) is the one-based (j)-th prime. The generic page/word address gate tested and rejected using the spiral's prime/Fibonacci coordinates as physical page/printed-word addresses. The present hypothesis is different: p32's side length 11 selects the 11th spiral entry, then its (F) value is tested as a rune offset inside p32.

- (3301-2838=463=p_{90}), so the 11th spiral entry has **(F=89)**.
- The same zero-based Fibonacci index **89** directly matches p32 zero-based rune offset **89**.
- Offset 89 begins the printed word `OENGOMBUDS`; the 4×4 table's edge length selects its four-rune suffix `BUDS` at offset 93.

A second, independent p15 source selection points to the same value: the two contiguous red-ink spans at offsets 0–8 and 9–19 contain 20 runes whose GP-prime sums are **638 + 430 = 1068 = 12 × 89**. This is the only 20-rune contiguous window on p15 with that exact sum. Under the historically documented 2013 `NUMBER` operation, 1068 factors as **2 × 2 × 3 × 89**. Thus the red heading independently carries the same 89 that the spiral supplies and the candidate p32 offset uses. This corroborates the address hypothesis; it does **not** establish that the 2013 operation is intended on LP2, and the factor 12 remains unassigned. No cipher follows from it.

The cross-artifact hypothesis is: p32 side 11 → p15 spiral entry 11 → (F=89) → p32 rune offset 89 → BUDS suffix. The p15 Fibonacci-prime construction is prior art; the proposed p32 rune-offset application is the new hypothesis. The 4×4 table dimension supplies the four-rune edge length. This does not yet specify what operation to perform after reaching BUDS.

The exact checksum is also notable: **2838 mod 360 = 318**, equal to the four interior rune-prime sum. Under the project's *inferred* mathematical-angle convention (0° east, counter-clockwise; see `im-results/2014-magic-square-direction-map.md`), 318° quantizes to 315° southeast, matching the (3,0)→(8,5) grid diagonal. The 2014 report itself treats the angle convention as an inference, not an explicit primary-source instruction. The endpoint sum is 374 mod 360 = 14° east; its agreement with 2014 stage04 cell 6's 366 mod 360 = 6° east is weaker secondary support. The Ing stanza's east-over-water language is a possible semantic corroboration for an eastward continuation after the BUDS endpoint, not a location selector.

A separate exact residue is **2838 mod 121 = 55**, which could point to physical p55. The canonical p55 page has 76 runes (19 four-rune blocks). This modulo-121 interpretation is only a possible page pointer; no source instruction yet selects it.

## Semantic road hypothesis from the four interior rune names

The four interior path runes are **B, M, IA, NG**: Beorc, Mann, Iar, Ing. The 2016 message's “their meaning is the road” makes their names/stanza meanings a motivated lead, rather than free association. In the Old English Rune Poem:

- **Beorc** is described through a tree that produces shoots and has branches and a high crown; this resonates with the selected endpoint fragment **BUDS**.
- **Mann** concerns a person and kinship, with mortality as its turn.
- **Iar** describes a river creature and a fair dwelling surrounded by water; this resonates with **HOME**.
- **Ing** is associated with the East-Danes and a journey east over water, with a wagon following.

Read in the p32 path order B→M→Iar→Ing, these meanings suggest a semantic road involving tree-growth, a person, a water-surrounded home, and eastward travel. The BUDS/Beorc and HOME/Iar resonances are notable because the runes were selected by the diagonal, not chosen after reading the poem. One possible two-stage reading is that the interior sum 318° gives the southeast HOME→BUDS map path, while the endpoint sum 374° gives an eastward continuation, matching Ing's east-over-water stanza. However, the path's direction/orientation and the geographic referent remain unresolved; this is not yet a coordinate or reversible operation.

Source caution: the Old English Rune Poem's Cotton Otho B.x witness was destroyed in 1731; the text survives through George Hickes's 1705 printing of an earlier transcription. The rune-name labels and some readings have editorial-history caveats. Treat the poem as a historically motivated interpretive source, not an unquestionable key. See [the public-domain Old English text](https://en.wikisource.org/wiki/Rune_poems), [the Dobbie-edited text and manuscript note](https://people.umass.edu/~sharris/in/handouts/RunePoem.pdf), and [the translator's note on its transmission](https://www.poetryfoundation.org/poetrymagazine/articles/145835/translator39s-note-old-english-rune-poem-by-anonymous).

## Cross-round +60 relation: secondary, not an authenticated instruction

The 2012 original image is **509×503** and the 2016 signed-tree image is **563×569**. In native orientation the axis-aligned differences are **+54 width / +66 height**. A **+60/+60** relation appears only after transposing the 2012 image to 503×509; no source instruction selects that transpose. This is therefore a post hoc cross-round alignment, not independent evidence for the p32 +60 displacement or a period-60 cipher. The within-p32 HOME/BUDS start-offset difference of 60 remains exact. The numerical table's radix 60 is another possible context. The Director's historical audit found no corroborated destination for the transpose-derived 2012-style domain; do not treat the arithmetic alignment as an authenticated continuation instruction.

## Bounded readouts and exclusions

The period-60 additive GP29/Vigenère interpretation is already rejected by `im-results/p32-home-buds-period60-vigenere.md`: the source-fixed HOME/BUDS phase constraints do not distinguish the original arrangement under the matched within-word null. The English-looking optimized output is an underdetermined-key effect, not plaintext.

I also tested the most direct p55 readouts suggested by this route:
- Four-rune key [B,M,IA,NG] as GP indices, prime values mod 29, and prime-totient values mod 29, both signs, on p55's 76-rune stream and its 43-rune word-interior stream: no linguistic output.
- The printed p15 4×4 table, reduced mod 29, and its entrywise-totient matrix as Hill-4 keys on p55, in printed/transpose and row/column conventions: no linguistic output.
- A four-column transposition of p55 using the interior-rune GP-index order [17,19,27,21] → [0,1,3,2]: no linguistic output.

These outputs are not obviously readable under canonical transliteration, but they are **not strong cryptanalytic negatives**: no register-aware language adjudicator or planted-key power test was used. They reject only the listed simple direct interpretations as visually/plainly obvious readouts. They do not invalidate the p15→p32 navigation hypothesis, and they do not establish that p55 is decrypted by the four interior runes or by the p15 table as a direct key.

## Conditional null, with limits

The existing exact conditional null preserves the 21 top/left p32 axis runes and each canonical word's rune multiset, permuting only free runes within their original words. Using the repository's TextBlob four-letter frequency lexicon:
- word-8 prefix: 9 lexicon outcomes among 720 ordered placements of its 10 free runes;
- word-16 suffix: 3 outcomes among 1,680 ordered placements;
- 7 endpoint-word pairs fall in the east sector;
- the four interior diagonal cells sum exactly 318 in 18 of 2,240 within-word placements.

The joint conditional probability is **1/21,504,000 ≈ 4.65×10⁻⁸**. A broader CMUdict 1.1.3 sensitivity gives **13/30,105,600 ≈ 4.32×10⁻⁷**. These are conditional diagnostics, not discovery-wide p-values. They do not correct for trying alternative pages, fragment lengths, spirals, edge operations, moduli, or direction conventions. The F=89 cross-artifact address was added after the original conditional-null design and is not included in those null calculations; do not multiply the probabilities or present a combined significance.


## External negative boundary and prior research

The independent [Dukotah/cicada3301 archive](https://github.com/Dukotah/cicada3301) is important prior art. Its [Round 9 results](https://github.com/Dukotah/cicada3301/blob/main/research/ROUND-9-RESULTS.md) report 2,670 generic readings across self-indexing walks, cumulative walks, sign walks, and numeric sieves, with no non-contiguous plaintext at the computed positions. That work explicitly leaves the 2016 message's “words are the map” and “meaning is the road” clauses uninterpreted. The present proposal is deliberately narrower and different: a cross-artifact p15 (F=89) address into p32, followed by a rune-meaning interpretation. It does **not** reopen the tested generic numeric walks or sieves.

The same archive's [measurement paper](https://github.com/Dukotah/cicada3301/blob/main/PAPER.md) documents that a decoder can recover the correct rune indices while an English-only adjudicator calls Latin, Old English, Welsh, or vowel-dropped text noise. This is why the p55 direct-readout strings above are only bounded observations, not decisive negative evidence. Its current measured-ceiling claim is “OTP-class,” not a complete solution; treat it as an independent, falsifiable research record rather than authority.
## Fixed next test and stopping rule

Agent46 has been asked for a fixed readout of the six original 2016-image tiles selected by the p32 diagonal. The rectangles are fixed by the original 563×569 image and the p32 prime-sum axes; do not rotate, shift, resize, choose a best tile, or infer plaintext from visual resemblance. If the six fixed tiles have no independently measured structure, retire the image-readout branch.

The strongest unresolved question is now **what source-prescribed operation follows the F=89 address at p32 offset 89**. The rune meanings Beorc, Mann, Ior, Ing and the word `BUDS` may provide a semantic clue, but do not turn them into a free word-association search. A next step must predict a reversible operation, a key, or an independently observable feature on the original artifact. Otherwise retain this as a navigation hypothesis, not a decryption.

## Reproduction and source files

- Executable route check: `node sims/p32_p15_spiral_edge_route_sft.cjs`
- Bounded p55 direct-readout negative check: `node sims/p32_p15_p55_direct_readouts_sft.cjs` (reproduces the ordinal/prime/totient Vigenère, Hill-4, and four-column transposition tests).
- p32 corpus and original transcription: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`
- p15 original table scan: `resources/liber-primus/32.jpg` (physical p15)
- p32 original page image: `resources/liber-primus/49.jpg` (physical p32)
- possible p55 target: `resources/liber-primus/72.jpg` (physical p55)
- 2016 signed image: `resources/historical/cicada2016-4gq25.jpg`
- word-frequency control: `resources/control/english_wordfreq_textblob.txt`
- inferred direction convention: `im-results/2014-magic-square-direction-map.md`
- prior p15 spiral synthesis and generic page/word address gate: `results/lp2-p15-fibonacci-prime-spiral.md`, `im-results/p15-fibonacci-page-word-address-gate.md`
- 2014 Fibonacci-prime square reconstruction: https://cicadanotebook.com/sessions/3.html and https://github.com/scream314/cicada3301/blob/master/pages_and_ciphers.md

No plaintext, authentic key, complete cipher mechanism, or final destination has been recovered.
