# Original LP2 32×8 number table as a word-position GP29 key

**13 November 2026, Agent44. Classification: bounded original-cipher negative. No unknown plaintext, key or destination recovered.**

## Clue and frozen reversible mapping

The original 2014 pp49–51 print 256 two-character numeric cells in 32 rows of eight. The authentic 2016 signed clue specifically invokes the book's *words* and *numbers* as map and direction. A direct cipher hypothesis treats printed ciphertext word ordinal and within-word rune ordinal as the table's two indexes. This is source-motivated but no original Cicada instruction explicitly chooses a GP29 additive table pad, the byte projection, or the reset.

Input: original rune indices from resources/liber-primus/lp2-corpus.json; word boundaries from resources/lp2-transcription.txt; the 256 conditional conventional-base60 bytes from resources/liber-primus/base60-grid.json. Line/page wraps do not delimit words; punctuation does. Counts: **2,896 words, 12,956 unknown runes, 32 cross-page words**.

Freeze zero-based word number w and within-word rune offset i. The two natural source-grid indexings are (a) row=w%32, column=i%8, or (b) row=i%32, column=w%8. Convert byte b to key b%29 or floor(29*b/256). Apply P=(C±key)%29 for both signs. There are eight fixed full-book inverses. No fitted phase, nonce, seed, extra skip, word omission or plaintext score is used to select a candidate.

## Untouched original result

| Axis assignment | Byte mapping | Subtract IoC | Add IoC |
| --- | --- | ---: | ---: |
| word row / rune column | b mod29 | **0.0344779093** | **0.0344594518** |
| word row / rune column | floor(29b/256) | **0.0344755500** | **0.0344902660** |
| rune row / word column | b mod29 | **0.0344971890** | **0.0344798635** |
| rune row / word column | floor(29b/256) | **0.0344727140** | **0.0344938288** |

Unmodified LP2 p0–55: **0.0344783979**. Independent solved literal p57 PARABLE: **0.0627099664**. Every source-input output has almost exactly flat GP29 ciphertext-like frequencies and no coherent native-GP plaintext. A globally fixed secret substitution alphabet preserves IoC and cannot alone repair these eight outputs into standard GP-English.

[Standalone CommonJS SFT](../sims/lp2_grid32x8_word_position_key_sft.cjs) loads the unchanged original sources, asserts exact rune and printed-word stream alignment and all eight ciphertext-like ranges, and tests the algebra on each original inverse. It also encrypts the **95 genuine solved p57 GP symbols** with each model and recovers the exact 95/95 by the corresponding inverse. This controls implementation power only; these data do not authenticate a historical encryption operation.

## Decision

Retire these eight exact word-position additive table uses as plaintext-recovery routes. Distinct previous work tested a table row indexed by the word's GP-prime sum (see lp2-wordprime-grid32x8-selfindexed-gate), which this hypothesis does not repeat. Ciphertext-dependent table lookup, secret word-dependent nonlinear state, an externally authenticated decoding rule or non-GP plaintext remain possible but need independent source selection. No original LP2 unknown plaintext, author-supplied key or endpoint is recovered.