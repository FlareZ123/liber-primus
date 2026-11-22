# LP2 whole-word identity: all 1,645 long ciphertext words are distinct

**14 November 2026, Agent41. Evidence: original-source exact census and cipher-invariant necessary condition. No unknown plaintext, key or destination recovered.** [Standalone CommonJS reproduction](../sims/lp2_stationary_word_identity_sft.cjs), [passing Windows Node22 original-source execution 43647132990](https://github.com/FlareZ123/liber-primus/actions/runs/43647132990).

## Cipher decision

Could the manuscript preserve ordinary English words and encrypt each printed word through a global fixed dictionary or another stationary secret word permutation? Such a cipher can flatten individual rune frequencies even when it preserves word lengths. Its unavoidable weakness is that identical plaintext words encrypt identically. Every reversible word-length-preserving map preserves the complete frequency multiplicities of whole word identities, independently of the secret mapping.

## Exact original-input census

Read [the original rune transcription](../resources/liber-primus/lp2-transcription.txt) in its complete source order using [the canonical GP29 glyphs](../resources/liber-primus/lp2-corpus.json). Preserve every printed hyphen and stop, join line/page-spanning words, and skip runeless physical p50. The resulting 2,896 complete printed words contain exactly **12,956** authentic ciphertext runes across physical pp0–55.

| Rune length | Word occurrences | Distinct whole words | Equal-word unordered pairs |
|---|---:|---:|---:|
| 1 | 83 | 28 | 107 |
| 2 | 448 | 354 | 106 |
| 3 | 720 | 704 | 17 |
| **4** | **513** | **513** | **0** |
| **5** | **317** | **317** | **0** |
| **6** | **256** | **256** | **0** |
| 7 | 216 | 216 | 0 |
| 8 | 156 | 156 | 0 |
| 9–14 | 187 | 187 | 0 |
| **All 4–14** | **1,645** | **1,645** | **0** |

All **1,645 ciphertext words of length four or longer are distinct**. This statement concerns complete source-printed words; it does not mean all four-rune substrings are unique.

Under an illustrative i.i.d. uniform-GP29 generator, while preserving exact observed word counts by length, the mathematical expected equal-word pair counts are 117.3448 for length1, 119.0583 for length2, 10.6130 for length3 and 0.18818 for all lengths4–14. Original source counts of 107, 106, 17 and zero broadly resemble a uniformly random rune-token identity spectrum. These expectations are a descriptive model rather than a familywise p-value or evidence that the real ciphertext generator is i.i.d.

## First-party authorial-prose control

Select six independently readable first-release LP1 GP sections with source indices **3, 8, 9, 10, 11, 14** in [the canonical original transcription](../resources/transcriptions/lp1_wulfic_canonical.txt), the same pre-existing clear-source panel from [the author doublet baseline](lp2-first-party-clear-gp-doublet-baseline.md). Their authentic **231 complete words and 1,001 runes** have **50 equal-word pairs of length at least four**: 21 length-four pairs, 7 length-five, 12 length-six, 7 length-seven/eight, and 3 length-ten/eleven.

For a nontrivial invertible word cipher, replace each plaintext rune of GP index P at its within-word position j with C=(11P+7+5j) mod29. Its exact inverse is P=8(C−7−5j) mod29. The native GP plant recovers **231/231 original clear words** exactly, and the 50 longer-word equality pairs remain exactly 50 under the secret-looking substitution. This is a positive verification of the necessary invariant. In particular no stationary keyed whole-word bijection could turn *this particular* repeated-word plaintext into the original LP2 zero-repeat-long-word identity pattern.

The LP1 panel is evidence of the authors' ordinary repetition in an independently readable sample. It is not an unconditional impossibility proof for unknown prose: a different, deliberately constructed 2,896-word passage might contain 1,645 distinct four-plus-rune words.

## Causal consequence

Any direct explanation using a **single deterministic mapping of complete plaintext words to complete ciphertext words over the full manuscript**, with original printed word boundaries and lengths unchanged, must also assign **1,645 distinct plaintext words of length four or more**. This is the same necessary condition for every possible secret whole-word substitution table, including arbitrary nonlinear and position-specific fixed word-level bijections.

The observed original and first-party clear-text spectra make ordinary repeated authorial prose under a global fixed word substitution an unattractive decoding route. A potentially viable inverse needs an evolving key or nonce, a changed plaintext representation or segmentation, or some other mechanism that breaks word-to-word identity preservation. Source-selected page/chapter rekeying remains a separate possibility; this test does not prove original printed word breaks are decoys. It gives no actual plaintext or original key, and it does not justify a free search over newly invented changing-state ciphers.

The [read-only SFT](../sims/lp2_stationary_word_identity_sft.cjs) asserts exact original rune alignment, every length-specific count, the complete 4+ identity exclusion, first-party clear words and a lossless original GP29 cipher-positive test.
