# P55 "MY FOLD" word-pointer route to THE DEEP END

**11 November 2026.** Applying the already frozen 2016 GP-prime-sum/58-page word-address rule to every printed word on original unsolved physical p55, then following that exact rule recursively until a solved LP2 page, finds **three** routes into independently solved pages. Their *reverse printed order* yields the English phrase **THE DEEP END**. This is a source-dependent navigation/mnemonic candidate. All three words were already publicly decrypted on pp56–57. **No unknown LP2 plaintext, original key, or reversible unknown cipher has been recovered.**

## Human-visible motivation and unchanged assumptions

The authenticated 2016 message says “Its words are the map, their meaning is the road, and their numbers are the direction.” The earlier conditional map interprets a source GP-prime sum N as physical page `N mod 58` and printed zero-based word `floor(N/58)`, then repeats that operation on the selected rune word. Under that existing map, signed **“seeks the”** selects **MY FOLD** on original pp21/14; the GP sum of literal **FOLD** leads specifically to physical p55 word2. The 17 printed words on p55 admit an eight-pair outer-to-inner fold with a unique center, and previous work establishes p55 word2/mirror and center totals CIRCUMFERENCE398 and FIRFUMFERENFE365. Reverse reading therefore has an independently visible semantic motivation.

The present test **fixes the pre-existing page/word-address function and all original word boundaries**. Each p55 printed word supplies its own GP-prime sum as the initial address. Iterate until landing on independently solved p56/p57, a runeless p50 numeric table, or a repeated address. Only solved destinations have independently known GP-English labels. Reading *only solved destinations* is a reporting convention introduced for this experiment, not an explicit signed-source instruction, and may be a hindsight selection.

## Exact paths from original runes

The p55 printed-word GP sums, in ascending zero-based printed word order, are:

`79,222,114,118,306,283,30,596,365,138,108,341,291,88,284,129,159`

Exactly three of these 17 routes terminate at solved plaintext, at p55 positions **2, 8, 13**:

| p55 printed word | Initial sum | Entire source-selected address walk | Already-solved terminal word |
| --- | ---: | --- | --- |
| 2, `ᛋᛒ` (SB) | 114 | 114 → p56:w1 | **END** |
| 8, `ᛗᛋᛞᛡᛈᚠ` (MSDIAPF), unique center | 365 | 365 → p17:w6, 511 → p47:w8, 120 → p4:w2, 288 → p56:w4 | **DEEP** |
| 13, `ᚦᛟ` (THOE) | 88 | 88 → p30:w1, 71 → p13:w1, 405 → p57:w6 | **THE** |

Thus ascending source order is `END DEEP THE`, and the FOLD-motivated reversed order is **THE DEEP END**. The solved-page plaintext is independently recorded in `resources/liber-primus/lp1-plaintext-reference.txt`: p56 begins `AN END WITHIN THE DEEP WEB`, and p57 reads `PARABLE ... TO THE SURFACE`. The p55 words at other 14 positions reach the rune-free numeric table or enter ordinary cycles. The same iterated address operation is already described in `im-results/lp2-2016-signed-message-base58-word-map.md`, including its FOLD→SB→END anchor; the **new** observations are the p55 center→DEEP and p55 index13→THE paths and their joint reversed three-word readout.

## Independent comparison and limits

The observed complete three-word reversed readout appears **exactly on p55** among the other 55 unsolved physical pages under the same rule. However, longer p4 also contains `THE DEEP END` as an internal substring of an eleven-word solved-endpoint readout (`END END THE END THE DEEP END END DEEP WITHIN DEEP`); the three-word sequence is therefore **not globally unique** under substring selection.

As a *post-selected exploratory diagnostic*, a seeded six-hundred-thousand-trial null draws 17 source words independently from the other 54 rune-bearing unsolved pages, matched one-for-one to the 17 original p55 word lengths. Every draw uses the unchanged actual LP2 address graph and discards numeric/cyclic endpoints in exactly the same fashion. **172/600,000** length-matched draws reproduce precisely the ordered solved terminal labels END, DEEP, THE with no additional solved endpoints, and **148,666/600,000** have three solved terminals of any identity. This conditional low frequency shows selectivity under the artificial resampling assumptions. It is **not a calibrated discovery p-value**: the phrase was recognized after inspecting source data, and source pages and word sums are not independent.

The prefix END, parent FOLD and the fact that p55 is terminal were established previously. A next decipherment attempt needs an **independent source instruction selecting which of these endpoints or the p50/table routes supplies a key, clock or original ciphertext target**. A visually appealing message with wholly known words does not decrypt p55.

## Reproducer

`sims/p55_fold_solved_endpoint_phrase_sft.cjs` reads authentic signed-source wording, original GP-transcribed p55 source words, canonical GP prime weights, p50 table tokens, and independently known p56/p57 translations. It asserts each original route, the exact three terminal indices, complete phrase uniqueness across page-level readouts, the p4 substring counterexample, and the deterministic matched-length resampling count. No CI workflow or automatic trigger is needed.
