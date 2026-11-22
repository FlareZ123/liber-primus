# Original LP2 long-word five-back plus anti-repeat: all-secret GP29 alphabet gate

**Agent11, 14 November 2026. Bounded negative under GP-native English.** The original source can be inverted exactly under a novel two-exception, 29-to-29, word-local code that simultaneously represents rare immediate repeats and excess five-back returns. But neither the canonical rank inverse nor **any five independently secret stationary 29-symbol rank permutations** yields native-GP English-like frequencies. **No previously unknown LP2 plaintext, authorial key, cipher or destination was recovered.**

## Human-visible clue, fixed test, and weakest assumption

The unaltered 2014 LP2 pages p0–55 have only **86 equal adjacent runes** in 12,901 same-page opportunities; the original whole-word source also exhibits **104 within-word equal symbols five positions apart**, including unusual paired returns. The 2014 LP1 Wisdom artwork prints five-by-five squares, so the historical author could plausibly have chosen a word-local five-back update. These two features motivate a *simultaneous* reversible model more economically than adding an unrelated password search.

At original word position i≥5, with current ciphertext value c, preceding value a=C[i−1], and five-back value b=C[i−5], define two distinguishable exceptional output symbols:

- output a, coded as rank 0;
- output b, coded as rank 28. If b=a, distinguish this second rank by the next cyclic GP value (a+1) mod29, leaving all output values uniquely decodable;
- rank 1..27 refers to the 27 remaining output symbols in increasing GP order.

Every 29-symbol ciphertext output has a unique rank for every source context (a,b). The decoded plaintext can be **any secret bijective relabeling of those 29 rank codes**. To be generous to the original visible five-step motif, allow a separate, wholly unknown 29-symbol permutation for **each of the five word positions modulo 5**, for a total of (29!)^5 possible secret alphabet choices. They are nevertheless stationary over words and pages at the same word phase. First five runes of each word can be carried as free initial values and are completely excluded from this test.

This is an invented candidate cipher. The actual source does **not** identify two special GP plaintext runes, an ordered rank rule, a five-back exclusion protocol, or five alphabet tables. Even the source's lag-five excess is not proof of a five-back code. The decisive question is whether a cipher this generous could preserve native-GP prose under its original printed word boundaries.

## Exact original-input invariant

Parsing transparent source page/line wraps yields **2,896 complete original words** and **12,956 original GP runes**, reconciling rune for rune with the canonical source corpus. The first five symbols of each eligible word are excluded; **2,105** original symbol sites remain, divided into five literal word-phase bins:

| Phase (word position mod5) | Original eligible symbols |
| ---: | ---: |
| 0 | 872 |
| 1 | 584 |
| 2 | 350 |
| 3 | 190 |
| 4 | 109 |

Exactly **15** outputs copy their immediate predecessor, whereas **104** use the five-back rank (including the declared collision tie-break). There are 87 source positions where the two context values a and b coincide. This leaves a valid 29-to-29 decoder at every site, unlike a lossy doublet-deletion construction.

For each phase, count the original 29 rank-code frequencies. **Any secret bijective substitution merely permutes the 29 histogram bins**. Therefore sorting the original histogram in descending order and matching it to a similarly sorted GP-native English expectation gives the **exact minimum possible total-variation distance over all 29! keys**. Doing so independently for all five phases gives the optimal distance with (29!)^5 unknown keys; no key enumeration or language-guided key fitting is involved.

The native reference at each phase uses the manuscript's *exact printed word-length inventory*. For each original length, take all equal-length GP-word tokens from one of three fixed independent reference texts (Shakespeare, Gibran and Emerson), encoded with the repository's GP29 digraph convention, and weight source words to reproduce the original counts at that length. The three sources thus have exactly the original 2,105 expected tested positions and the original five phase sizes.

| Frozen source-native English reference | Original minimum TV over all five secret permutation tables | Mean TV over 1,000 independently sampled source-native matching-word collections | Maximum sampled TV | Samples at least as discrepant as original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | **0.37410675** | 0.04869 | 0.06908 | **0 / 1,000** |
| Gibran | **0.38414374** | 0.05098 | 0.07315 | **0 / 1,000** |
| Emerson | **0.36733151** | 0.05028 | 0.07190 | **0 / 1,000** |

The simulated collections sample real GP-encoded source words **of the manuscript's exact lengths**, rather than unrelated random characters. They use one deterministic xorshift32 seed per reference. The original is more than five times farther from the reference than the largest of 3,000 sampled source controls, even after granting every word phase its own optimally chosen unknown alphabet permutation. The Monte Carlo tail ceiling 1/1,001 per separate source is a finite reference-sampling diagnostic, not a universal p-value for every English text or a corrected measure for selecting this hypothesis after seeing lag-five correlations.

### Positive cipher plant

The [single-file CommonJS experiment](../sims/lp2_word_fiveback_dual_exclusion_sft.cjs) checks **all 29³ one-step source/code/roundtrip combinations** for the actual two-exception tie-break rule. It then samples a true native-GP word collection with the original 2,105 eligible positions, shuffles **five independent secret GP29 permutations**, sequentially encrypts the plaintext suffix of every word under that very cipher, and blindly decodes using the selected permutation. The plant recovers **2,105 / 2,105** original synthetic plaintext positions exactly. Original classification and all source-control counts are asserted.

## Research decision

The simplest five-back extension of the source's anti-repeat rank alphabet, even with **five unrelated secret alphabets**, cannot account for original LP2 ciphertext as directly enciphered native-GP English **when its source words and five-back state are preserved**. It does not follow that the author chose a five-back mechanism at all. Additional unrestricted word-specific keys, a different plaintext register, source-word resegmentation, or a genuinely evolving state leave the mathematical invariant and would require their own historical selector.

This rules out a **reversible candidate which jointly targets both anomalous observed returns**, without spending compute on (29!)^5 secret keys. The next potentially productive investigation should recover an original clue for an actual evolving key/state or a source-selected second register, and demonstrate authentic unknown-page plaintext. Do not search a new secret phase permutation of this same two-output model; it cannot repair the invariants above.

**Exact reproducer:** [sims/lp2_word_fiveback_dual_exclusion_sft.cjs](../sims/lp2_word_fiveback_dual_exclusion_sft.cjs). Inputs: [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), [literal source transcript](../resources/lp2-transcription.txt), and the three preexisting [source controls](../resources/control/).
