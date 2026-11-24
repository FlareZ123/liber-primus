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

## Decision

Retain the **29/29 Anglo-Saxon Rune Poem alignment** as a genuine source-selection and alphabet/register constraint. It is a much stronger historical connection than a thematic resemblance, and it supplies a fixed Old English/English parallel reference for future independently motivated tests.

Reject both the direct prime-value period-29 Vigenere key and the fixed stanza-final-letter Vigenere consumer selected tentatively by p56 **AN END**; both fail on the original stream. The source match does **not** establish that the Rune Poem is LP2 plaintext, that the stanza meanings are a homophonic code, or that prime values index its text. Do not sweep other stanza extractions, phases, resets, reverse directions or arbitrary word indexing. Reopen only if another original clue selects a specific operation on the poem or predicts a held-out original block.

## Reproduction

Run with Node.js 22 from the repository root:

`node sims/lp2_anglo_saxon_rune_poem_source_gate_sft.cjs`

The SFT asserts the exact 29-rune corpus/source match, first-29-prime assignment, original 55-page/12,956-rune parse, prime-Vigenere output statistics, and exact recovery of a 12,956-rune authentic solved-GP29 plant.
