# GP29 alphabet order and the Anglo-Saxon Rune Poem: source selector and prime-key gate

**Agent42, 24 November 2026. Classification: source-selector positive; proposed cipher key negative.** This is a fixed-edition historical alignment and one bounded key test, not a recovered LP2 plaintext.

## Fixed source and independent selector

The fixed edition is Bruce Dickins, *Runic and Heroic Poems of the Old Teutonic Peoples* (Cambridge University Press, 1915), specifically **"The Anglo-Saxon Rune Poem," pages 12–23**. The edition presents the Old English poem with an English translation. Its alphabet table explicitly labels the matching column **"Anglo-Saxon (a) Runic Poem."** The transcribed 29-rune sequence is:

`ᚠ ᚢ ᚦ ᚩ ᚱ ᚳ ᚷ ᚹ ᚻ ᚾ ᛁ ᛄ ᛇ ᛈ ᛉ ᛋ ᛏ ᛒ ᛖ ᛗ ᛚ ᛝ ᛟ ᛞ ᚪ ᚫ ᚣ ᛡ ᛠ`

This is an **exact 29/29 ordered match** to the canonical LP2 GP29 alphabet. The 29-stanza Anglo-Saxon poem is likewise ordered one stanza per rune. The Norwegian and Icelandic rune poems in the same source have 16-rune sequences; they do not match the 29-symbol GP29 chart. Thus the selection is not merely "runes are old": the exact alphabet order independently selects this particular parallel-language source.

The source's stanza names are Feoh, Ur, Thorn, Os, Rad, Cen, Gyfu, Wenne, Haegl, Nyd, Is, Ger, Eoh, Peorth, Eolh-secg, Sigel, Tir, Beorc, Eh, Mann, Lagu, Ing, Ethel, Daeg, Ac, Aesc, Yr, Iar and Ear. These names should not be confused with the modern GP29 transliteration tokens (for example, the chart's X/NG/OE/IA/EA are not the traditional rune names).

**Source references:** [Dickins 1915, transcribed edition and the Anglo-Saxon Rune Poem](https://en.wikisource.org/wiki/Rune_poems#The_Anglo-Saxon_Rune_Poem); [Dickins 1915, Runic Alphabet table](https://en.wikisource.org/wiki/Runic_and_Heroic_Poems_of_the_Old_Teutonic_Peoples).

## Frozen key hypothesis

The canonical GP29 data assigns the first 29 prime numbers, in the same rune order. A simple operation a human solver could reasonably try is a period-29 additive Vigenere key with shifts

`K[i] = prime[i] mod 29`

and continuous phase zero across the original LP2 stream. Decryption is fixed as `P[i] = C[i] - K[i mod 29] (mod 29)`. No phase, page reset, reverse direction, or alternative prime transform is searched.

The resulting key is:

`2,3,5,7,11,13,17,19,23,0,2,8,12,14,18,24,1,3,9,13,15,21,25,2,10,14,16,20,22`

## Original result

The fixed operation was applied to all **12,956** original runes, preserving the original **2,896** printed groups for language scoring. It produces:

- full-stream IoC: **0.034460894** (near the uniform 29-symbol baseline);
- dictionary matches: **187/2,896** groups overall;
- long dictionary matches: **0/1,132** groups of at least five symbols.

The source-native positive control encrypts and recovers all 12,956 symbols from the authentic solved-GP29 donor exactly with this key and the same implementation. The negative original result is not an implementation failure.

## p56 “AN END”: fixed stanza-final-letter key gate

The original p56 heading **AN END** supplies a possible extraction cue. Combined with the exact 29/29 GP29-to-stanza alignment above, a human solver could test the final letter of each stanza's final word, in poem order, as a 29-symbol key. This is a bounded hypothesis, not an established instruction.

The fixed Old English final words from Dickins 1915 are:

\`hleotan, wuht, resteð, tohiht, milpaþas, restaþ, leas, geniht, syððan, æror, ansyne, þearfum, eþle, ætsomne, gedeþ, lande, swiceþ, getenge, frofur, betæcan, gym[eð], nemdun, oftast, brice, treowe, monige, sum, leofaþ, geswicaþ\`.

The printed key is:

\`N T D T S TH S T N R E M E E TH E TH E R N D N T E E E M TH TH\`

Here Old English \`ð\` maps to GP29 \`D\`, and \`þ\` maps to \`TH\`. Dickins prints the 21st stanza's final \`ð\` in \`gym[eð]\` as a bracketed emendation, so the unbracketed \`gym\` reading (changing that key position from \`D\` to \`M\`) was tested separately. The parallel Dickins English translation was also tested using the final words:

\`Lord, mettle, them, knight, horse, within, else, house, water, betimes, upon, alike, estate, banqueting-hall, touches, land, fails, skies, restless, earth, bridle, hero, prosperity, all, fashion, many, journey, happiness, broken\`.

The fixed operation was continuous period-29 GP29 Vigenere on the original 12,956-rune stream, phase zero, preserving the original 2,896 printed groups. Both conventional signs (\`P=C-K\` and \`P=C+K\`) were tested; there was no phase, page-reset, direction, or stanza-position sweep.

| Source key | Distinct symbols | \(P=C-K\): IoC / dictionary hits / long hits | \(P=C+K\): IoC / dictionary hits / long hits |
|---|---:|---:|---:|
| Old English, printed \`gym[eð]\` | 8 | 0.03448823 / 210 / **0 of 1,132** | 0.03446242 / 200 / **0 of 1,132** |
| Old English, unbracketed \`gym\` | 8 | 0.03447360 / 215 / **0 of 1,132** | 0.03446626 / 203 / **0 of 1,132** |
| Dickins English translation | 11 | 0.03451975 / 204 / **0 of 1,132** | 0.03449888 / 182 / **0 of 1,132** |

The original ciphertext baseline is IoC **0.03447840**, 203 dictionary hits, and 0/1,132 long-word hits. Every candidate remains at the near-uniform original IoC and produces no long dictionary word. The small changes in short-word counts are not evidence of plaintext.

**Decision:** reject this fixed stanza-final-letter Vigenere consumer. The 29/29 source match remains a genuine alphabet/order constraint, not a decryption. The p56 title does not justify sweeping other stanza extractions, word positions, phases, or resets. Reopen only if another original clue selects a specific operation or yields a discriminating held-out prediction.

**Reproduction:** run \`node sims/lp2_anglo_saxon_rune_poem_endletter_sft.cjs\` from the repository root. The script pins the source final words, bracketed-reading alternative, original transcription, dictionary, key construction, and both signs.

## Director #2589: canonical numeric-stream decision (Agent 9, 24 November)

**Source-selection negative; no ciphertext scoring.** The fixed edition provides an explicit numeric feature more credible than invented stanza statistics: the verse number printed at each stanza opening. Reading the actual numbered Old English text in [Dickins 1915, The Anglo-Saxon Runic Poem, pp. 12–23](https://en.wikisource.org/wiki/Runic_and_Heroic_Poems_of_the_Old_Teutonic_Peoples/The_Runic_Poems/The_Anglo-Saxon_Runic_Poem) gives the following 29 labels in GP order:

`1, 4, 7, 10, 13, 16, 19, 22, 25, 27, 29, 32, 35, 38, 41, 45, 48, 51, 55, 59, 63, 67, 71, 74, 77, 81, 84, 87, 90`.

These are **editorial verse addresses**, not an authenticated numeric key. The checked-in Old English source text also contains the corresponding 29 stanza breaks, permitting exact reconstruction of the labels as 1 plus cumulative preceding verse counts. However, the [Hickes 1705 reproduction, vol. 1 p. 135](https://commons.wikimedia.org/wiki/File:Rune_poem_Hickes_1705.png), the surviving early printed witness to the lost Cotton manuscript, has no such printed verse-number sequence in the visible first 27 stanza openings. Its compact physical lines do not coincide with Dickins's verse layout; the available image cuts off the end of the poem. See also [critical reassessment of Hickes and the runological witness](https://theses.gla.ac.uk/5134/) and [the 2017 scholarly encyclopedia account](https://cora.ucc.ie/server/api/core/bitstreams/9cea25e4-fa8f-422a-9d61-f0818c0c76c0/content) on editorial uncertainty. The historical order selects the rune alphabet/poem family, not Dickins's 1915 numbering as the original puzzle's intended edition.

The authenticated [2016 signed message](../resources/historical/cicada2016-4gq25-outguess.asc) explicitly names Liber Primus as the referent of its words, meanings and numbers. No independent clause selects these poem verse addresses, an arithmetic normalization, the extraction of stanza starts rather than ends, a periodic clock, or a cipher operation. A later bounded test below considers one distinct reading of the 2016 message's word/number wording: stanza word counts. Earlier Cicada book codes demonstrate that source coordinates can matter when they are actually supplied; the exact alphabet order alone does not supply a coordinate list. The known prime-number mapping is already part of GP29 and the fixed prime-value consumer above failed.

**Decision:** do not promote these 29 editorial labels to a key. At this checkpoint no stanza-count statistic had been scored; the later bounded word-count test below is the sole additional extraction. Retire the verse-address branch under #2589's source-selection criterion. Retain the exact 29-rune alphabet match.



## Bounded stanza word-count key test (Agent23, 24 November)

**Rationale:** the exact 29/29 GP29-to-Anglo-Saxon-stanza order selects this particular poem family. The authenticated 2016 message says the words, meanings and numbers of Liber Primus are important. One simple, falsifiable interpretation is to turn the words in each selected stanza into a number by counting them, producing one value for each GP29 rune. This is a plausible source-derived hypothesis, not an explicit instruction.

**Frozen extraction:** use Dickins 1915's 29 Old English stanzas in printed order. Count whitespace-delimited tokens containing letters, including the rune-name opening word and printed bracketed words; punctuation does not create a token and the hyphenated Eolh-secg remains one token. Reduce each count modulo 29. Use the resulting 29-value vector as a continuous period-29 GP29 additive key, phase zero, on the original 12,956-rune LP2 stream. Test only the two conventional signs; no page reset, offset, reverse, or alternate tokenization is searched.

Word counts / key values:

`19,16,17,16,17,17,19,20,18,22,14,17,15,16,20,19,18,24,23,23,23,22,18,17,20,17,18,19,22`

The key has 10 distinct values. All counts are 14–24, so modulo 29 does not alter them.

| Stream | IoC | Dictionary hits | Long words (length ≥5) | Long dictionary hits |
|---|---:|---:|---:|---:|
| Raw LP2 | 0.03447840 | 203 | 1,132 | **0** |
| Subtract stanza-word-count key | 0.03450975 | 210 | 1,132 | **0** |
| Add stanza-word-count key | 0.03449613 | 215 | 1,132 | **0** |

Both candidates re-encrypt exactly to the original 12,956 symbols. The slight changes in short dictionary counts do not approach a plaintext result; neither sign creates even one dictionary word of five or more symbols. **Reject this specific stanza-word-count key.** This does not invalidate the 29/29 source selection, but it supplies no decryption and does not justify trying other stanza statistics.

**Reproduction:** `node sims/lp2_anglo_saxon_rune_poem_wordcount_sft.cjs` (Node 22). The script pins the 29 stanza counts, original transcription parse, dictionary, key, signs, and exact round-trip checks.

## Decision

Retain the **29/29 Anglo-Saxon Rune Poem alignment** as a genuine source-selection and alphabet/register constraint. It is a much stronger historical connection than a thematic resemblance, and it supplies a fixed Old English/English parallel reference for future independently motivated tests.

Reject the direct prime-value period-29 Vigenere key, the fixed stanza-final-letter Vigenere consumer selected tentatively by p56 **AN END**, and the single bounded stanza-word-count key; all fail on the original stream. The source match does **not** establish that the Rune Poem is LP2 plaintext, that the stanza meanings are a homophonic code, or that prime values index its text. Do not sweep other stanza extractions, phases, resets, reverse directions or arbitrary word indexing. Reopen only if another original clue selects a specific operation on the poem or predicts a held-out original block.

## Reproduction

Run with Node.js 22 from the repository root:

`node sims/lp2_anglo_saxon_rune_poem_source_gate_sft.cjs`

`node sims/lp2_anglo_saxon_rune_poem_wordcount_sft.cjs`

The SFT asserts the exact 29-rune corpus/source match, first-29-prime assignment, original 55-page/12,956-rune parse, prime-Vigenere output statistics, and exact recovery of a 12,956-rune authentic solved-GP29 plant.
