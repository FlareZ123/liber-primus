# Literal-EA repeat transport: a source-shaped reversible channel with an original-word exclusion

**Decision:** A natural key-independent explanation for the 86 rare adjacent ciphertext repeats fails the original printed word-position gate. **No unknown LP2 plaintext or key was recovered.** Executable standalone test: [`sims/lp2_reserved_ea_repeat_placement_sft.cjs`](../sims/lp2_reserved_ea_repeat_placement_sft.cjs).

## The candidate that can actually be decided

The alphabet contains exactly 29 GP runes. A simple reversible predecessor-relative transport can encode the first 28 plaintext symbols as one of the **28 output runes other than the previous output**, using any secret bijection over those 28 choices, and reserve the final symbol **EA, GP index 28** for the one remaining output equal to the preceding ciphertext rune. With an agreed initial state this is an exact 29-to-29 bijection at each step. It would superficially explain why the unknown stream has close to 1/29 frequency for each ciphertext rune but only **86/12,955** adjacent repeats.

Crucially, **ciphertext[i] = ciphertext[i−1] ⇒ plaintext[i] = EA**, irrespective of the other 28-symbol key/state schedule. If the visible printed word separators preserve GP plaintext words, EA's position in a word is therefore an all-key falsifiable prediction. There is no freedom to change those 86 positions by tuning the 28-symbol key.

## Original-cipher test

From the canonical `resources/lp2-transcription.txt`, preserving words across page transitions and printed line wraps, the 55 rune-bearing unknown pages have **2,896 words**, **12,956 runes**, and exactly **86** adjacent repeats. Their within-word locations are:

| Source | Repeat/EA events | At word start | At word end | Interior |
| --- | ---: | ---: | ---: | ---: |
| Original unknown LP2 adjacent repeats | **86** | **23** | **19** | **44** |
| Shakespeare native-GP prose | 1,633 | 98 | 25 | 1,510 |
| Gibran native-GP prose | 606 | 60 | 20 | 526 |
| Emerson native-GP prose | 2,224 | 237 | 40 | 1,947 |
| Combined independent native-GP controls | 4,463 | 395 | 85 | 3,983 |

The exact repository tokenizer follows the already-used GP mapping, including `QU→CW`, `V→U`, `K→C`, `Z→S`, and greedy pair runes; the original manuscript's punctuation and page boundaries follow `sims/lp2_word_pages.cjs`.

The pooled controls contain **606,544 runes**, so their EA rate projects **95.3** occurrences in 12,956 runes. The original repeat count of **86** matches that marginal surprisingly well. But the original forces **22.09%** of these supposed EA runes to occur at word ends, compared with **1.90%** in the controls, and **26.74%** at word starts, compared with **8.85%**. This is the discriminating contradiction, missed by rate-only hypotheses.

To avoid treating all occurrences as independent, the SFT enumerates *every overlapping window of 86 consecutive EA occurrences* in each authentic source-native control. Over the combined **4,208** such windows, Shakespeare's largest start/end counts are **11/7**, Gibran's **17/6**, and Emerson's **17/7**. **No control window reaches 23 starts or 19 ends.** These overlapping windows are a finite census, not 4,208 independent trials or a universal language theorem.

## Interpretation and boundary of the conclusion

This rejects the literal **GP index 28 = repeated output** scheme, with inherited English-GP tokenization and preserved word boundaries, even if all 28 other symbol assignments and the state evolution are secret. The observed 86-event rate alone would have made this scheme appear promising. Original event *locations* independently reject it, without a large key search.

It does **not** exclude a different reserved symbol, an encrypted or variable-length escape register, lossy resampling with recoverable hidden state, an altered word segmentation, or a fundamentally different plaintext language. A new decoder should specify how duplicate events can be inverted without imposing an EA distribution that is incompatible with the printed words.

## Reproduction

Run the standalone Node 22 file from the repository root; it reads the original transcript, GP alphabet and the three already-retained local English sources, asserts all event counts, exhaustively computes the 86-event source windows, and prints the exact counts. There is no external network, fitted parameter, stochastic seed, or synthetic cipher success claim.
