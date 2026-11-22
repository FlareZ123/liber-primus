# Nine independent variable-length rune codebooks: all-key substring gate

**Stronger decision (Agent 7, 14 November 2026; #843 extension).** One exact **two-original-word**, **all-key** contradiction now rules out **every** complete source in the pinned 29,157-word English lexicon as a valid plaintext for original visual chapter 3 under any independently secret nonempty, injective, fixed-per-chapter GP29 rune-to-string codebook preserving printed word boundaries. This proof allows all 26 ASCII single letters as dictionary words and places no upper bound on codeword length. A unique possible plaintext for one 12-rune cipher word forces a second original word to decode to a string absent from the full lexicon. The previous 108 complete native-prose-window negatives and 36/36 reversible independently keyed chapter positives remain independently reproducible, but are now **supporting evidence rather than the strongest exclusion**. No unknown plaintext or authentic LP2 key was recovered.

## Original source and assumed encoder

The canonical original unknown LP2 text has **12,956 GP29 runes**, **2,896 complete printed words**, including 32 carried across physical pages, and nine source-visible chapter boundaries at cumulative rune offsets **0,729,1874,3603,5506,6527,7960,9640,12648,12956**. The corresponding chapter word counts are **158,255,383,437,224,326,378,669,66**. A word spanning a physical page remains intact and is assigned to its starting chapter; a word is never divided merely because a page ends. Visual chapters are original-image segmentation, not proven cipher resets.

The candidate selects independently for every chapter an arbitrary secret, injective map from the 29 GP runes to **nonempty plaintext strings**, and concatenates the maps within each printed word. The model preserves each printed word boundary. Its original-cipher codeword lengths and alphabet mappings are completely secret, with no limit on codeword length and no prefix-free constraint. #525's nine-chapter minimum-decoded-length sensitivity (15,915 letters versus the global model's 24,495) removed the old length-only contradiction; this tests a different exact necessary condition.

## Mathematical key-independent obstruction

If a cipher rune r appears as a complete one-rune printed word, its codeword s must itself be a **complete plaintext word**, possibly longer than one letter. For any other original printed word that starts with r, the plaintext must start with s. The same applies to ending r and suffix s, interior r and interior substring s, and any occurrence of r and substring s. Because every other GP rune has a nonempty output, each longer source cipher word corresponds to a native word strictly longer than s.

For each rune r that appears as a singleton cipher word, count five demands in the same chapter: (n,p,q,m,a), where n counts complete singleton words equal to r, and p/q/m/a count longer cipher words where r occurs as a prefix, suffix, strictly interior character or anywhere. For every distinct complete native plaintext word s in a candidate 2,896-word source window, compute the analogous five occurrence counts among whole native words and longer native words. Draw an edge r to s only when all five native counts meet or exceed r's demands. Since all 29 cipher codewords must be injective, the bipartite graph must have a maximum matching covering **every singleton-rune type**. This condition admits any nonempty codeword length and grants all remaining GP29 codewords freely. It is necessary, not sufficient.

The original nine visual chapters have **5,7,9,12,5,8,9,11,2** distinct singleton-rune types, **68** in total across independent chapter key spaces.

## Stronger exact two-original-word dictionary certificate

The 29,157-entry source-native English lexicon includes **all 26 ASCII one-letter entries a through z**, so this proof makes no grammatical A/I/O shortcut. It contains **1,986** words of length at least 12; its longest entry has 18 letters. The source chapter 3 spans concatenated original rune offsets **3603–5505** and contains 437 intact printed words, including **12** distinct one-rune word types.

Freeze the 12-rune original printed word starting at global rune offset **5447**:

    ᚹᛒᛗᚱᚾᛗᚻᛗᛁᚾᚪᛞ

For **every one of the 1,986 length-feasible whole dictionary words**, enumerate all **nonempty contiguous assignments** to the twelve consecutive cipher positions. Whenever the same rune occurs twice, its assigned output must be identical; unequal runes must have different outputs (injectivity). If a rune is one of the source-visible one-rune complete printed words in this original chapter, its output must itself be a **whole lexicon word**. No other cipher word, other rune or chapter key is used to select a candidate.

Exactly **one** pair of dictionary plaintext and injective segmentation survives this fully enumerated gate: **INSIGNIFICANCE**, with these forced assignments:

| Original GP rune | Forced ASCII output |
| --- | --- |
| ᚹ | in |
| ᛒ | s |
| ᛗ | i |
| ᚱ | g |
| ᚾ | n |
| ᚻ | f |
| ᛁ | ca |
| ᚪ | c |
| ᛞ | e |

Independently, the original printed two-rune word **ᚱᛁ** at global rune offset **4061** lies in the **same source-visible chapter**. The one surviving anchor assignment therefore forces it to decode to **gca**, which is **absent from the entire pinned 29,157-word lexicon**. There is no remaining key to tune for that word. Thus the assumed unchanged-word, chapter-fixed, injective rune-to-string codebook is **exactly incompatible with the complete original chapter 3 in this finite lexicon**, irrespective of the remaining twenty rune outputs and all other chapter keys.

This deduction is not a translation of either original word. INSIGNIFICANCE is a **reductio candidate** forced by a deliberately permissive dictionary and eliminated by another untouched ciphertext word. The result makes no claim about every possible English-language word, scientific abbreviation, word separators that move, exotic source registers, or a stateful/changing cipher.

**Independent exact decoder control:** the [two-word certificate SFT](../sims/lp2_chapter3_two_word_allkey_dictionary_sft.cjs) constructs a separate 29-codeword prefix-free invertible plaintext alphabet with 25 singleton letters except c and four two-letter codewords ca/ce/ch/ck. The native word INSIGNIFICANCE uses two of those genuine two-letter codewords, produces **12** encrypted runes, decodes exactly and passes the same exhaustive segmentation witness search. The original contradiction still fails with **all a–z singleton words permitted**.

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

The **new exact two-original-word proof** rules out every entry in the pinned 29,157-word English lexicon as a jointly consistent plaintext for the fixed original chapter-3 codebook, even with all 26 standalone ASCII letters permitted. The earlier 108-window test independently rejects four source-native ordinary prose registers. Neither is an all-English-language theorem: an out-of-dictionary word, engineered nonrepeating prose, changing codebooks within chapters, secret transposition, different printed word segmentation, noninjective mappings, other rune registers or external ciphertext transport remain possible. No genuine unknown LP2 plaintext or author-selected operation is recovered.

[Source-exact CommonJS SFT](../sims/lp2_ninechapter_codebook_substring_matching_sft.cjs) reads the original LP2 transcription and the four project control fixtures, freezes all source numbers, recomputes all 108 native samples, and asserts complete decode and all 36 positive chapter gates. The published runner was executed against the unmodified fetched GitHub files using a V8 Node-fs/path/assert compatibility shim, with all assertions passing. The decisive 29,157-word whole-lexicon two-original-word certificate is independently reproducible at [sims/lp2_chapter3_two_word_allkey_dictionary_sft.cjs](../sims/lp2_chapter3_two_word_allkey_dictionary_sft.cjs). Both executable scripts were run on exact current GitHub source bytes in V8 with Node module compatibility shims; all assertions passed. Original source symbols were not modified.
