# Source-constrained encoder gate for LP2 lag-five and adjacent-repeat structure

**Agent4, 19 November 2026 · Director Issue #1892.** Decision: no source-constrained reversible encoder currently explains both statistics. The five-dot cue motivates a narrow period-five/word-local test, but it does not specify a key or five phase permutations. The simplest source-derived candidates fail on original ciphertext and native-language controls.

## Fixed observations

The original 55-page LP2 stream contains 12,956 runes in 2,896 printed words (maximum word length 14). There are 12,901 within-page adjacent pairs, of which 86 are equal: 63 within printed words and 23 at word boundaries. There are 2,105 within-word lag-five pairs, of which 104 are equal. The existing page-conditioned exact-bigram null gives an expected 72.5 lag-five matches (p≈0.0006); the effect is localized inside words and does not appear across word boundaries. The source-native analyses are [the lag-five conditional/page-Markov gate](lp2-original-lagfive-conditional-page-markov-gate.md) and [the adjacent-repeat/fixed-reserve gate](lp2-wordedge-fixedreserve-original-native-gate.md).

These are two different constraints. A candidate must preserve the within-word lag-five equality signal while also accounting for the unusually low adjacent-repeat count, including the boundary observations. Explaining only one is insufficient.

## Source cue and candidate family

Original p7 (scan 24.jpg) has five black dots below its terminal red caption; printed word boundaries are visible throughout LP2. A human solver could reasonably test a five-phase operation that resets at each word. The dots do **not** label a grid, give a rune alphabet, or state a reading order. Treating them as a pentagram and taking its star traversal is a plausible interpretation, not an established instruction.

### Candidate 1: word-reset period-five additive substitution

Use C_i = P_i + K_(i mod 5) mod 29 within each printed word, resetting phase at the next word. This is the lowest-description reversible family that preserves lag-five equality exactly: the same key value recurs after five symbols, so C_i=C_(i−5) iff P_i=P_(i−5). Adjacent equalities depend on the five successive key differences, so a suitably chosen key might reduce them.

The most natural five-dot key attempt connects the five points as a pentagram, reads every second point, and uses the resulting ordinals. Both traversal directions and both 0/1-based interpretations were tested: [1,3,5,2,4], [1,4,2,5,3], [0,2,4,1,3], and [0,3,1,4,2], each with both additive signs.

On the original 2,896 words, the eight exact whole-word native-lexicon hit counts are **92, 77, 89, 91, 88, 85, 97, 77**; the untransformed ciphertext has 79 hits. The lexicon contains 6,897 distinct GP29 spellings from Gibran, Shakespeare, and solved Cicada text. With the original word-length distribution, a uniform 29-symbol null expects 86.4 hits; the best candidate, 97, is only 1.14 standard deviations above that rough baseline, before accounting for the eight variants. The new hits are isolated short words, not coherent plaintext.

The native-language control is more decisive: the tested pentagram additive keys predict roughly **353–699 adjacent equalities**, depending on source corpus and sign, against the observed 63. Their expected lag-five counts (about 122–150) are near the observed 104, but they fail the adjacent-repeat constraint by a wide margin. The p7 dots may suggest period five; they do not supply a five-symbol key whose phase differences explain the actual adjacent-repeat suppression.

### Candidate 2: word-local five-rail transposition

A second low-description reading of the five dots is a five-rail transposition applied independently to each printed word. Natural rail order and the two pentagram rail orders were tested in both directions. The exact whole-word native-lexicon hits are **79, 79, 79, 79, 77, 77**, versus 79 for the untouched ciphertext; no new coherent text appears.

The inverse natural five-rail permutation has an initially attractive structural property: all 2,105 ciphertext lag-five comparisons map to adjacent plaintext positions. But the joint control rejects it. Across the native English controls, this inverse predicts only about 45–57 lag-five matches and 381–472 adjacent repeats, versus observed 104 and 63. The forward and pentagram orders likewise predict hundreds of adjacent repeats and do not match both statistics. A 5-rail permutation therefore does not provide the required joint explanation.

### Candidate 3: fixed-reserve state mapping (negative control)

A lossless state mapping can force C_i=C_(i−1) exactly when P_i equals one reserved rune. This can explain adjacent-repeat suppression, but it has no LP2 source selector and does not explain the lag-five effect. The existing full-word-mask test finds only reserve S compatible with every observed word mask; native English controls predict more than 900 S occurrences at the relevant lengths, while the original stream permits only 86–141. The Latin Vulgate GP29 control independently predicts about 1,042. This family is rejected; do not reopen it.

## What would be required to explain both effects

The residual algebraic class is a word-reset, five-phase family of **different bijections**: reuse the same bijection at positions five apart to preserve lag-five equality, but use different adjacent-phase bijections to suppress adjacent repeats. The p7 dots could suggest five phases, and printed spaces could suggest a reset, but neither supplies the five 29-symbol permutations or a deterministic way to generate them. A generic five-permutation search is an unconstrained key search, not a source-constrained decipherment.

The 5-dot object has already motivated music, turning-grille, numeral, and other tests. Reinterpreting the same unlabelled points as a period or pentagram does not create a new source instruction. No independent Cicada text specifies the five permutations, key values, or exact reset rule. The 2013 fixed-pad, stationary-bijective, word-rekey, and page-local families remain excluded absent such an instruction.

## Decision and reopening criteria

No tested source-cued reversible encoder explains both the lag-five excess and adjacent-repeat suppression. The word-reset period-five additive family explains the lag-five relation but its natural dot-derived keys fail the adjacent statistic and do not recover plaintext. Five-rail transposition fails the native-language joint control and exact-word test. The fixed-reserve alternative fails the full native word-mask control.

**Completion:** close this bounded source-selector task negatively. Reopen only if a contemporaneous source gives the five-dot object an explicit ordering/key interpretation, identifies the five phase permutations, or specifies a reversible word-reset operation. Do not expand arbitrary five-symbol keys, 5! rail permutations, or stationary-bijective families.

Reproduction: [source-constrained five-dot/word-local SFT](../sims/lp2_lagfive_fivedot_wordlocal_candidate_sft.cjs).