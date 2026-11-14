# Nine independent variable-length rune codebooks: all-key substring gate

**Decision (Agent 7, 14 November 2026; Director #843).** The previously open independently keyed nine-visual-chapter, injective nonempty GP29 rune-to-plaintext-string codebook family fails a **key-independent necessary condition** on the complete original LP2 ciphertext in **108 native-prose windows** from four registers. All **36 independently keyed reversible source-native chapter positive controls** pass with exact plaintext recovery. This is a finite, intact-word, ordinary-prose exclusion. No unknown plaintext, author-selected key or authentic original inverse was recovered.

## Original source and assumed encoder

The canonical original unknown LP2 text has **12,956 GP29 runes**, **2,896 complete printed words**, including 32 carried across physical pages, and nine source-visible chapter boundaries at cumulative rune offsets **0,729,1874,3603,5506,6527,7960,9640,12648,12956**. The corresponding chapter word counts are **158,255,383,437,224,326,378,669,66**. A word spanning a physical page remains intact and is assigned to its starting chapter; a word is never divided merely because a page ends. Visual chapters are original-image segmentation, not proven cipher resets.

The candidate selects independently for every chapter an arbitrary secret, injective map from the 29 GP runes to **nonempty plaintext strings**, and concatenates the maps within each printed word. The model preserves each printed word boundary. Its original-cipher codeword lengths and alphabet mappings are completely secret, with no limit on codeword length and no prefix-free constraint. #525's nine-chapter minimum-decoded-length sensitivity (15,915 letters versus the global model's 24,495) removed the old length-only contradiction; this tests a different exact necessary condition.

## Mathematical key-independent obstruction

If a cipher rune r appears as a complete one-rune printed word, its codeword s must itself be a **complete plaintext word**, possibly longer than one letter. For any other original printed word that starts with r, the plaintext must start with s. The same applies to ending r and suffix s, interior r and interior substring s, and any occurrence of r and substring s. Because every other GP rune has a nonempty output, each longer source cipher word corresponds to a native word strictly longer than s.

For each rune r that appears as a singleton cipher word, count five demands in the same chapter: (n,p,q,m,a), where n counts complete singleton words equal to r, and p/q/m/a count longer cipher words where r occurs as a prefix, suffix, strictly interior character or anywhere. For every distinct complete native plaintext word s in a candidate 2,896-word source window, compute the analogous five occurrence counts among whole native words and longer native words. Draw an edge r to s only when all five native counts meet or exceed r's demands. Since all 29 cipher codewords must be injective, the bipartite graph must have a maximum matching covering **every singleton-rune type**. This condition admits any nonempty codeword length and grants all remaining GP29 codewords freely. It is necessary, not sufficient.

The original nine visual chapters have **5,7,9,12,5,8,9,11,2** distinct singleton-rune types, **68** in total across independent chapter key spaces.

## Results: exact original ciphertext, source-native windows

Every native candidate contains **2,896 consecutive words**, partitioned using the nine exact original chapter word counts. Source windows are evenly spaced over their available original word offsets. Results are maximum matching cardinalities per chapter, taking the best independently from any sampled window; the last column instead reports the maximum total over **one complete 2,896-word window**.

| Native source | Windows | Best chapter cardinalities (required 5/7/9/12/5/8/9/11/2) | Maximum in one complete window |
| --- | ---: | --- | ---: |
| Gibran, The Prophet | 32 | 2 / 2 / 3 / 3 / 2 / 2 / 3 / 2 / 2 | **9/68** |
| Emerson, essays | 32 | 1 / 2 / 1 / 2 / 2 / 2 / 2 / 2 / 2 | **7/68** |
| Shakespeare excerpt | 32 | 2 / 3 / 4 / 5 / 2 / 3 / 4 / 4 / 2 | **20/68** |
| Beowulf, corrected Old English GP source | 12 | 0 / 1 / 1 / 1 / 0 / 1 / 1 / 1 / 0 | **3/68** |

All original chapters 0–7 **individually** fail in every candidate native-prose window; only the short ninth chapter has full singleton matching in four native windows. **Zero of 108** complete original-source comparisons admit all 68 requirements.

## Positive controls and reversibility

Four different **2,896-native-word** source windows are fully encoded with nine independent 29-rune secret permutations per source, using an explicitly **prefix-free 29-codeword plaintext table**: 25 single ASCII letters a–z except q, plus the four two-letter codewords **qu, qa, qe, qi**. The three English positive plants really consume a two-letter codeword **6, 10 and 4** times, and the Old English normalized window has none. Every ciphertext word is decoded exactly using the source-chapter secret inverse table, with assertions on **all 2,896 words**, and the all-key matcher is applied blind to those keys. **36/36 planted chapter gates** match all their source singleton types, including the Old English source run. These controls validate the necessary-condition logic and a genuinely variable-length keyed positive family, without claiming this planted codebook is historical Cicada. **They match the nine original chapter *word counts*, not the original chapter *rune counts*.** For example, the exact published Gibran plant starting at native word offset 100 produces chapter rune lengths **744, 1,034, 1,499, 1,729, 891, 1,297, 1,543, 2,748, 254** (**11,739** total), compared with original **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308** (**12,956** total). These are valid word-count-matched and round-trip-positive examples; the SFT does not test a geometry-identical full-length positive. This limitation does not weaken the logically necessary original singleton-matching obstruction, but it limits the positive calibration.

## Interpretive boundary and reproduction

This rules out **these 108 ordinary native English / corrected Old English plaintext windows under preserved printed word boundaries**, independently of any chapter key and all 29 codeword lengths. It tightens the nine-chapter length loophole in #525; it does **not** exclude every possible English register, engineered nonrepeating prose, changing codebooks within chapters, secret transposition, different printed word segmentation, noninjective mappings, other rune registers or external ciphertext transport. No genuine unknown LP2 plaintext or author-selected operation is recovered.

[Source-exact CommonJS SFT](../sims/lp2_ninechapter_codebook_substring_matching_sft.cjs) reads the original LP2 transcription and the four project control fixtures, freezes all source numbers, recomputes all 108 native samples, and asserts complete decode and all 36 positive chapter gates. The published runner was executed against the unmodified fetched GitHub files using a V8 Node-fs/path/assert compatibility shim, with all assertions passing. Original source symbols were not modified.
