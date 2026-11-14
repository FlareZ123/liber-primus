# LP2 word-length transitions versus prose controls

**14 November 2026; original-input intermediate result, not a decryption.** The exact 2,896 source-printed words of the 55 rune-bearing unsolved pages contain 12,956 runes, including 32 words carried across physical page boundaries. An independently trained English word-length transition model cannot distinguish the original printed word-length order from a shuffle preserving every chapter's original word-length inventory. This challenges the use of printed spaces as known genuine English plaintext boundaries in hypothetical direct word-preserving inverses.

## Exact decision and controls

An original visible nine-chapter partition has 729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, and 308 runes, with 158, 255, 383, 437, 224, 326, 378, 669, and 66 complete printed words assigned by starting rune. Punctuation ends a word; typographic line/page wraps do not. The question is whether adjacent cipher-word lengths retain the local syntactic dependence of ordinary English under the *specific assumption* that ciphertext preserves order and word lengths.

For each of three preselected English reference corpora (Gibran, Emerson, Shakespeare), fit a Laplace-smoothed length-1 Markov model to the *other two*, using source-GP-like lengths that collapse ING and the runic digraphs TH, NG, EO, OE, AE, IA, EA and IO. Score a heldout coherent 2,896-word passage against the model's independent-length unigram baseline. Compare the heldout coherent passage with 600 exact-inventory word-length shuffles. Independently score the original nine chapters, excluding chapter transitions, against 1,000 shuffles preserving each original chapter's complete word-length inventory. The native controls validate that the test can detect ordinary prose dependence without training on its target corpus.

| Heldout native corpus | Original score vs shuffled-original mean (nats/adjacency) | Original z | Heldout native score vs shuffled-native mean | Native z |
|---|---:|---:|---:|---:|
| Gibran | -0.027981 vs -0.026205 | -0.513 | +0.018021 vs -0.017126 | +9.65 |
| Emerson | -0.024834 vs -0.023594 | -0.346 | +0.013406 vs -0.020567 | +8.65 |
| Shakespeare | -0.042012 vs -0.038373 | -0.789 | +0.002450 vs -0.033499 | +6.95 |

The original lies between 0.35 and 0.79 null standard deviations **below** its inventory-preserving shuffled average, with empirical upper-tail p ≈ 0.65–0.79. Every heldout ordinary prose control is over 6.95 null standard deviations **above** its shuffled benchmark (upper-tail Monte Carlo limit 1/601). The full-original lag-one Pearson length correlation is -0.014965, against -0.1209, -0.1474 and -0.0784 for the three full controls using this normalization. This is an observed ordering effect, not plaintext recognition.

## Explanation and limitations

The original word-length sequence lacks the measured English-like first-order grammar of the three source-normalized literary controls. Possible explanations include authorial style, a different language, word-order transposition, non-preserved word boundaries, or variable-length enciphering. In particular, the controls are prose, whereas Cicada can use unusual narrative or word lists. This is **not** an impossibility proof against all length-preserving ciphers, and the normalizer approximates historical GP spelling rather than proving an exact English-to-rune rule. The randomization also does not address higher-order or long-range dependencies. No original unknown plaintext, key, operator or next destination is recovered.

The next materially discriminating branch requires an independent original-page instruction specifying a reversible word permutation or segmentation rule before testing the ciphertext. Optimizing permutations to make this single score high would be an unconstrained overfit. Previously published word-level exclusions retain exactly their original conditional scopes.

**Exact read-only Node 22 reproduction:** [sims/lp2_wordlength_transition_english_gate_sft.cjs](../sims/lp2_wordlength_transition_english_gate_sft.cjs). Inputs are the repository's shared original LP2 transcription and three existing pinned prose controls. Seed: 0x56565555. The same computations were independently executed in the runtime; the committed Node SFT is provided to preserve the result and expose future regression tests.
