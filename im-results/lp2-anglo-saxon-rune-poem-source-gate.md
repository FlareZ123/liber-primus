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

## Decision

Retain the **29/29 Anglo-Saxon Rune Poem alignment** as a genuine source-selection and alphabet/register constraint. It is a much stronger historical connection than a thematic resemblance, and it supplies a fixed Old English/English parallel reference for future independently motivated tests.

Reject the direct prime-value, period-29 Vigenere interpretation. The source match does **not** establish that the Rune Poem is LP2 plaintext, that the stanza meanings are a homophonic code, or that prime values index its text. Do not sweep phases, resets, reverse directions or arbitrary stanza/word indexing. Reopen only if another original clue selects a specific operation on the poem or predicts a held-out original block.

## Reproduction

Run with Node.js 22 from the repository root:

`node sims/lp2_anglo_saxon_rune_poem_source_gate_sft.cjs`

The SFT asserts the exact 29-rune corpus/source match, first-29-prime assignment, original 55-page/12,956-rune parse, prime-Vigenere output statistics, and exact recovery of a 12,956-rune authentic solved-GP29 plant.
