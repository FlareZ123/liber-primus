# LP2 p3–p7 to p8: exact stateless word-lookup obstruction

**Agent14, 22 November 2026. Evidence class: conditional original-cipher structural exclusion.** No new plaintext, key or decipherment was recovered. This excludes a complete and natural receiver family for an interesting source alignment, rather than the larger possibility that p8 carries a stateful key for the preceding scroll.

## Source pairing and its independently motivated rival

The original five-page scroll p3–p7 has exactly **255 complete printed words**, containing **1,145 GP29 runes**. The immediately following physical p8 contains **255 runes**. The separate p49–p51 number panel has **256 source-printed cells**, read as bytes under the conventional base60 hypothesis. A plausible human attempt pairs scroll word *i* with p8 rune *i* and asks whether p8 records a table lookup or checksum of the word.

The stronger rival is a stream or stateful mechanism: the same source word can produce a different output depending on its ordinal, preceding state, page position or a key carried from elsewhere. Those possibilities are outside this test.

## Exact, key-independent same-word contradiction

Under **any deterministic function** \`y_i = f(word_i)\` with a common unknown table, exact repeated input words must yield equal output runes. The original source supplies **three direct counterexamples** among the 255 aligned positions:

| Source word's GP29 indexes | Scroll word ordinals, zero-based | Physical source pages | Aligned p8 GP29 output indexes |
| --- | --- | --- | --- |
| \`[8]\` | 47, 240 | p4, p7 | 16, 8 |
| \`[11,19]\` | 48, 231 | p4, p7 | 11, 22 |
| **\`[23,21]\`** | **235, 236** | **p7, p7** | **17, 3** |

The final pair is an especially restrictive case: the identical two-rune word occurs **twice consecutively on the same original p7**, but the two aligned p8 runes differ. It excludes every static lookup of **(source page, source complete word)** to p8 symbol, regardless of whether the lookup table is known, secret, nonlinear, cryptographic, or encoded using p50. A row-wise or word-wise substitution cannot repair the contradiction without adding a position, state, exception flag, or different alignment.

There are **252 distinct source words** among 255. A best-possible arbitrary word-key lookup requires **at least three exceptions** against the 255 original target runes. This lower bound is an exhaustive fit over *all possible* functions, not a search of guessed keys.

## All-secret 256-cell address maps, plus actual p50 bytes

The same exact test applies to three source-natural numeric word addresses modulo256. For each address, fit the **optimal completely unknown table** from 256 possible inputs to 29 possible output runes. For any repeated address having multiple target rune labels, at least all but the most frequent label must be exceptions.

| Source word address modulo 256 | Distinct addresses | Conflicting address groups | **Minimum mismatches under any 256-entry table** | Literal p50[address] mod29 equal to aligned p8 rune |
| --- | ---: | ---: | ---: | ---: |
| Sum of GP29 indexes | 106 | 67 | **141 / 255** | 10 / 255 |
| Sum of printed GP primes | 152 | 70 | **101 / 255** | 7 / 255 |
| Whole word as a base29 integer, most significant rune first | 167 | 55 | **84 / 255** | 7 / 255 |

The direct literal-table hit counts have ordinary alignment ranks over all **255 possible circular p8 shifts**, including the original zero shift: GP0 sum **94/255**, prime sum **202/255**, base29 integer **192/255**. A planted truly deterministic lookup passes at 255/255 with zero contradicting address groups using the same procedure.

The table tests are a narrower check than the universal same-word contradiction. They do not require p50's alleged byte interpretations to resolve the more fundamental contradiction at p7 positions235 and236.

## Cryptanalytic consequence and decision

Retire a **single-source-word to p8-symbol, stateless digest/checksum/S-box** under the observed sequential 255-to-255 pairing. A direct extra 256-cell secret permutation cannot fix repeated-input conflicts; tuning the table wastes effort. The meaningful next route requires **a source-selected changing state, positional operand, different word-to-rune permutation, or a different kind of relationship between p3–p7 and p8**. Any such candidate must specify its state transition before examining target plaintext and must explain why adjacent identical p7 words map to different p8 symbols.

The observed 255-to-255 count match and source adjacency remain plausible puzzle clues, but **the pairing is not independently authenticated by Cicada**. The result is therefore a conditional exclusion, not evidence that p8 itself has been deciphered.

**Reproducer:** [original 255-word all-secret lookup gate](../sims/lp2_scroll255_word2rune_anylookup_obstruction_sft.cjs), Node.js 22/CommonJS, reads only the original-transcription-derived resources, asserts all counts and original word positions, checks exact arbitrary-table lower bounds and independent planted controls.
