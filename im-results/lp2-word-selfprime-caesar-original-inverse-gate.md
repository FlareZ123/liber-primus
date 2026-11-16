# A self-prime-sum key for each original GP29 word: complete inverse and hard original contradiction

**Agent31, 16 November 2026.** Cicada's original Gematria Primus table supplies one prime number per rune; first-party earlier puzzle material uses GP-prime sums of entire words, and the signed 2016 continuation makes word meaning and number potentially relevant. This motivates a human-usable, no-external-key candidate: each word's **own plaintext prime-weight sum modulo29** determines that word's GP29 Caesar shift. This exact self-key rule is a hypothesis, not an independently prescribed LP2 operation.

## One fully specified candidate and its complete inverse

Let a printed word have plaintext GP29 indices P[0..L−1], prime values q[P_i], and secret-looking but self-determined integer k = (Σ_i q[P_i]) mod29. Define C_i = (P_i + s*k) mod29 for every symbol of that word, where s is either +1 or −1. The word's key is a function of the very plaintext it encrypts. No external key, salt, guessed plaintext or new page reset is needed. Each of the original printed word boundaries must remain a genuine plaintext word boundary under this defined model.

The exact inverse is finite: for every original ciphertext word C, try **all 29 shift integers k=0..28**, set P_i=(C_i−s*k) mod29, and retain P only when its own GP-prime sum recomputes to k. A word with **zero admissible keys** is **mathematically impossible** under the stated encryption rule. There is no language model, tuning or probabilistic cutoff in this rejection.

## Original 2,896-word census

Read the exact 12,956 original unknown GP29 runes in all 2,896 original whole-word groups, faithfully joining all page-carried words. The complete source-input inversion counts are:

| Complete self-prime word Caesar sign | Words with 0 keys | Exactly 1 | Exactly 2 | 3 or more |
| --- | ---: | ---: | ---: | ---: |
| C = P − primeSum(P) | **1,050** | 1,120 | 532 | 194 |
| C = P + primeSum(P) | **1,049** | 1,118 | 533 | 196 |

For s=−1 there are 2,826 total admissible plaintext-word alternatives among the whole book; for s=+1 there are 2,808. For example, original p0's second complete word S-Y-E-NG-C has zero admissible plaintext for **both** arithmetic signs. The positive sign additionally rejects the following black word TH-J-G-AE. Thus the model cannot be rescued merely by calling the initial rubric a different kind of plaintext.

As a constructive positive, every native GP29 word in the nine previously solved Cicada source texts is encrypted under the exact same self-prime shift definition and inverted under the exhaustive 29-key loop. The true original solved word appears among the recovered alternatives for both signs in every case, **740/740** native solved words under each sign. The model is not necessarily uniquely decodable when multiple keys exist, but the **absence of any key** is a definitive source-original impossibility proof.

## Decision and boundary

**Retire precisely the word-preserving, same-plaintext-word GP-prime-sum GP29 Caesar shift family, both ± signs, as an LP2 decoder.** At least 1,049 original printed words cannot be produced under any shift. This is an algebraic failure, much stronger than an unpromising language score, and rules out a highly economical direct use of the known word-sum convention.

The source never explicitly instructs the solver to use a word's own prime sum as a Caesar shift; other source-selected keying operations and changes to plaintext word segmentation are **not tested**. The model yields **zero unknown-page plaintext** and no deep-web location. The relevant next discovery would have to identify the missing genuine key operand or decoding operation from original clues.

[Windows Node22 original-source test run 43971488691](https://github.com/FlareZ123/liber-primus/actions/runs/43971488691) completed successfully and printed the complete 2,896-word candidate histogram. Reproduce using [the read-only Node22 original-input SFT](../sims/lp2_word_selfprime_caesar_exact_original_sft.cjs) with unchanged [LP2 original transcript](../resources/lp2-transcription.txt) and [source-native solved GP29 controls](../resources/external/relikd-solved-gp29-native-v1.json).
