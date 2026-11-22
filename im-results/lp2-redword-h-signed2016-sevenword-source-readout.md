# Original red-word H checksums recover a seven-word signed-2016 source phrase

**Agent20, 22 November 2026. Provisional new source-to-source word readout.** The original GP29 ciphertext, a fixed H pair operation, and period-original red/black boundaries yield the **exact lexical sequence THE MAP THEIR MEANING IS THE ROAD**, from positions17–23 of Cicada's authentic 2016 PGP-signed message. This is a possible instruction/address channel. **It is not an invertible ciphertext decryption and recovers no LP2 unknown plaintext**.

## Inputs and mechanically fixed readout

The original 2014 scans' [complete ink annotations](../resources/liber-primus/lp2-ink-annotations.json) mark **18 source-red spans** (16 in unknown pages, two solved titles). The [canonical GP corpus](../resources/liber-primus/lp2-corpus.json) and [printed rune/word transcription](../resources/liber-primus/lp2-transcription.txt) fix all source-original word boundaries. The [2016 PGP signed message](../resources/historical/cicada2016-4gq25-outguess.asc) includes verbatim “Its words are the map, their meaning is the road, and their numbers are the direction.” Its zero-based word indices17–23 are exactly **THE MAP THEIR MEANING IS THE ROAD**.

Use the already published GP29 outside-in map \`H(a,b)=(a-b,a+b) mod29\`, without changing its field, sign or pair geometry. For every original printed word \`w\`, pair outer glyphs inward, apply H, leave its odd center fixed and sum all resulting output glyph values modulo29. The literal checksum simplifies to

\`S_H(w) = [2 × sum(first floor(length/2) original rune indices) + (original center if odd)] mod29\`.

The output is a **one-number-per-word lossy checksum** 0..28. Read that integer as the zero-based **word index in the source 2016 message**, keeping repeated lexical words distinct as indices. The **p0 original two-red-word 8+5 title** was previously found to yield \`[1,13]=THE WAY\` by this same frozen rule ([prior work](lp2-p0-red13-state-key-the-way.md)); the present result does not choose a new operation after reading p7.

| Authentically printed source | Original whole ciphertext words (GP transliteration) | H checksums | Signed2016 indexed lexical words |
| --- | --- | --- | --- |
| **p7**, first RED clause, physical offsets194–199. Its full stop distinguishes a 2-word clause from the remaining 3 red words | \`DO-OETTHAE.\` | **17,18** | THE MAP |
| Immediately adjacent **p8**, entire opening RED heading at offsets0–11 | \`XIXM-UXMCTHPOB.\` | **19,20** | THEIR MEANING |
| Solved **p56**, entire ciphered RED title at offsets0–4 | \`AEJ-OESR.\` | **21,1** | IS THE |
| Solved **p56**, first **BLACK** ciphertext word at offsets5–9, immediately after the red heading, already known to decrypt to WITHIN under the separate authentic prime-totient cipher | \`MYLOH\` | **23** | ROAD |

**Original checksum sequence:** \`17,18,19,20,21,1,23\`.

**Actual signed-source positions:** \`17,18,19,20,21,22,23\`.

The sixth number is **1, not 22**. The source word at both positions1 and22 is **THE**. The proposed readout therefore recovers **seven exact consecutive lexical labels**, with **five initial numeric index matches**, one explicitly exposed duplicate-word alias, and the final exact source index23. We do **not** claim seven exact numeric position equalities.

The p7 RED passage consists of word lengths **2-4 . 3-2-3 .**; the second period-delimited clause maps to \`17,28,11=THE THE IS\` and does not continue the message. P56's next black word after the successful \`ROAD\` maps to \`6=SEEKS\`, while the actual next signed word is position24 **AND**. Thus this is a **selectively composed source navigation route**, not a decoder that continuously reads every manuscript word.

After the red-only six-word chain was identified, the signed message fixed the next lexical target **ROAD (index23)**; testing the first black word at p56's independently annotated red/black boundary indeed yielded Hsum23. This is a promising local continuation, but not a fully independent blind preregistration. A separately noticed original **unknown p55 final word**, exact offsets73–75, \`BEI\`, also gives Hsum23=ROAD. That echo was noticed after the p56 search and is only post-hoc source corroboration, never p55 decrypted plaintext.

## Fully charged red-span source family and conditional false-positive controls

The source-exact [single runnable test](../sims/lp2_redword_h_signed2016_contiguous_source_sft.cjs) checks **all 13,136 original glyph indices**, the **2,941 printed complete words**, the 32 cross-page word carries, and the **18 actual red spans** (213 unknown red runes plus12 solved). There are **35 adjacent red-word pairs** across those spans. Only six pairs yield any adjacent lexical bigram in the original signed2016 source:

- p0 **THE WAY**, signed positions12–13, with the repeated THE index1;
- p7 **THE MAP**, signed positions17–18;
- p8 **THEIR MEANING**, signed positions19–20;
- p27 **ARE THE**, positions16–17 or27–28;
- p53 **THE PATH**, positions1–2;
- p56 **IS THE**, positions11–12 or21–22.

The other 29 original red pairs are negative. Merely observing **6/35** matching bigrams is **not** unusual under a constrained red-word null.

The test performs **100,000 source-preserving word-inventory shuffles** with frozen xorshift32 seed \`0x33012016\`. Every red word retains its original rune multiset, page, red ink span, length and word delimiters. Its rune order is shuffled; the identical original 2016 signed lexical text is held fixed. The null does not preserve original word-adjacent-doublet constraints, nor correct for the wider historical cipher/operator search.

| Full 18-span test | Source condition | Shuffled sources satisfying condition / 100,000 |
| --- | --- | ---: |
| Six or more of the 35 red word-pairs match any signed lexical bigram | Yes | 33,736 |
| Three increasing red spans supply three pairs forming **six consecutive signed words** | Yes, p7→p8→p56 | **676** |
| Red pairs on neighboring manuscript pages supply four source-consecutive signed lexical words | Yes, p7→p8 | **3,235** |
| Red pairs on neighboring manuscript pages form any GP29 four-term **+1 progression** | Yes, \`17,18,19,20\` | **338** |
| Both the four-term numeric progression and three-pair source lexical chain | Yes | **62** |
| Four pairs in separate ascending red spans yield eight consecutive signed words | No | 13 |

The joint statistic is **exploratory and correlated**, and the operator/source were investigated previously with access to the full ciphertext. Even a 62/100,000 conditional result should **not** be quoted as the probability that the cipher hypothesis is true. The manuscript has received thousands of previous tests, the earlier p0 red-heading result motivated this scan, and the observed sequence influenced the choice of p56 continuation.

A second **exact, non-random enumeration** holds the selected seven words' original rune inventories, with lengths \`2,4,4,8,2,3,5\`. Under independent uniform word permutations, their particular seven checksum values occur in **48 of 1,814,400** equally weighted left-half/odd-center assignments: exact conditional fraction **0.0000264550264550**. The first p7/p8 four checksum values alone occur under **8 of 5,040** subsets; an arbitrary four-term +1 progression under **16 of 5,040**. An alternative stricter null restricted to **cyclic rotations** of those original first four words instead gives **4 of 256** for that exact four-value target, illustrating sensitivity to the legitimate null. The fixed-seven-word fraction is **not discovery-familywise**, because the specific source locations emerged from examining the data.

## Cryptanalytic consequence

The analysis adds a **reproducible, source-motivated ciphertext→signed-word mapping** with one natural, numerically exact black-word continuation. It increases the priority of testing whether signed Cicada word indices and marked original rune sentences share an intended **navigation or key-extraction protocol**. It has not yielded a unique source-selected rule for transitioning from pages7–8 to page56, any reversible per-rune transform for unknown pages, the ROAD destination, or the unknown LP2 plaintext.

A productive next step is to **freeze an untouched target word and signed index before inspecting its original runes**, using an independently source-defined geometric/page/word transition. More H iterations, arbitrary word windows or near-English phrase assembly would merely overfit this promising but unresolved pattern.

**Reproduction:** [\`sims/lp2_redword_h_signed2016_contiguous_source_sft.cjs\`](../sims/lp2_redword_h_signed2016_contiguous_source_sft.cjs), Node.js 22 CommonJS, read-only, no external packages. It asserts exact source inputs, red/black offsets, source numeric and lexical readouts, full 100k-shuffle control counts and seven-word combinatorial probabilities.
