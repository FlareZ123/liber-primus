# 2013 Book of the Law as a cyclic key with prime-directed word traversal

**Status:** bounded source-directed negative; no LP2 plaintext or key recovered.

## Human solve-path hypothesis

Three independent source clues make this a reasonable, finite human attempt:

- Cicada's 2013 round explicitly used the Book of the Law; the exact chapter transcriptions survive in `resources/external/2013-book-of-law-{I,II,III}.txt`.
- The signed 2016 instruction says that the book's words are a map and their numbers are direction. LP1 p05 explicitly emphasizes primes and the totient function.
- LP1 p05 contains the word **MOBIUS**, while p57 says to shed circumferences. These make a cyclic key pointer more plausible than an arbitrary wrap rule.

The proposed operation is deliberately small: use the exact 2013 Book of the Law as a GP29 additive key, start at its first rune, and move the key pointer forward or backward by one for each rune. The direction is selected at word boundaries by whether a word's Gematria Primus prime-value sum is prime. The key pointer wraps modulo the 21,630-rune key. No skips, offsets, page resets, learned substitution, or additional cipher layers are introduced.

## Original transcription and key controls

The original LP2 transcription includes p56 and p57 after the unknown book. The first **12,956** rune symbols match the canonical p0–p55 numeric corpus exactly. Parsing `-`, `.` and `&` as word separators, while not treating printed line/page breaks as word endings, yields exactly **2,896 words** and preserves all 12,956 runes. This is the same segmentation used in the source word-count analyses.

The three original Book of the Law chapters encode, under the same greedy GP29 transliteration and aliases used by the direct running-key gate, to **21,630 key runes**. The prime-value sum of each original ciphertext word is computed from the canonical GP29 prime array; **604/2,896** word sums are prime.

## Frozen tests

The key pointer starts at index 0. The first word starts forward for the causal previous-word rule. At each word boundary, one of two source-motivated rules selects the direction:

- **GP_prev (causal):** the previous ciphertext word's prime sum being prime selects forward; a composite sum selects backward. The opposite polarity is also tested.
- **GP_now (literal current-word reading):** the current ciphertext word's prime sum selects its own direction. This is a deterministic decoder-side interpretation, not a causal encoder rule.

For each rule and direction polarity, both additive signs are tested: (C=P+K) (decode by subtracting the key) and (C=P-K) (decode by adding the key). The pointer is continuous across physical pages and wraps cyclically. The only train/holdout split is the existing source boundary: p0–p27 (6,761 runes) versus p28–p55 (6,195 runes).

## Original results

The reference unigram model is trained on the first 240,000 characters of the pinned Shakespeare control with add-one smoothing. Uniform GP29 mean log-likelihood is **−3.36730**; the training Shakespeare stream averages **−2.95462**.

| Rule | Prime means forward | Operation | IoC | Train logL | Holdout logL | Full logL |
|---|---:|---|---:|---:|---:|---:|
| GP_prev | Yes | (C=P+K) | 0.03443836 | −4.27769 | −4.28285 | −4.28015 |
| GP_prev | Yes | (C=P-K) | 0.03448959 | −4.28406 | −4.29051 | −4.28715 |
| GP_prev | No | (C=P+K) | 0.03446222 | −4.27270 | −4.29708 | −4.28436 |
| GP_prev | No | (C=P-K) | 0.03446897 | −4.23057 | −4.27445 | −4.25155 |
| GP_now | Yes | (C=P+K) | 0.03446902 | −4.25300 | −4.30430 | −4.27753 |
| GP_now | Yes | (C=P-K) | 0.03448382 | −4.24082 | −4.29437 | −4.26643 |
| GP_now | No | (C=P+K) | 0.03448955 | −4.29334 | −4.26658 | −4.28054 |
| GP_now | No | (C=P-K) | 0.03448717 | −4.26853 | −4.33022 | −4.29803 |

All eight outputs remain at the near-uniform original ciphertext baseline (source IoC **0.03447840**). The best full score is **−4.25155**, substantially worse than the uniform baseline and the native-English reference. No output exhibits a plaintext-like register. The causal GP_prev implementation passes four exact synthetic round-trip controls, each recovering **12,956/12,956** runes with the original word-length structure. GP_now is reported only as a decoder-side literal reading because its current-ciphertext direction is not a causal encryption rule.

## Möbius word-number direction

The p05 inscription names **MOBIUS** and emphasizes primes/totients; the signed 2016 message says word numbers supply direction. A direct arithmetic reading is to take the **previous ciphertext word's GP-prime-value sum** (S), compute the Möbius function μ(S), and use it as the key-pointer direction for the next word:

- μ(S)=+1: advance one key symbol per rune;
- μ(S)=−1: move backward one key symbol per rune;
- μ(S)=0: hold the key pointer fixed throughout the next word.

The key is the exact 2013 Book of the Law GP29 transcription (21,630 runes), read cyclically from its first rune. The first word starts forward. Both μ sign polarities and both additive signs were tested; no other word-number function, key offset, page reset or period was fitted. The μ=0 hold interpretation is the main unresolved semantic assumption, but it is the direct three-valued direction reading.

Across the 2,895 previous-word sums, the Möbius counts are **945 −1, 1,115 zero, 835 +1**. Results:

| μ(+1) direction | Operation | Trigram log-likelihood | IoC | Key wraps | Final pointer |
|---|---|---:|---:|---:|---:|
| Forward | (C=P+K) | −4.61883 | 0.03454198 | 11 | 21,216 |
| Forward | (C=P-K) | −4.64930 | 0.03449016 | 11 | 21,216 |
| Backward | (C=P+K) | −4.62870 | 0.03447430 | 0 | 430 |
| Backward | (C=P-K) | −4.61119 | 0.03449937 | 0 | 430 |

The untouched ciphertext scores **−4.60956**; the same Shakespeare GP29 trigram model gives **−2.21915** on training and **−2.36417** on held-out English, versus the uniform mean **−3.36730**. The best Möbius output is **−4.61119**, effectively unchanged from the ciphertext and far below native English. All four synthetic 12,956-rune plants recover exactly.

**Decision:** reject the specified Book-of-the-Law + μ(previous-word GP-prime-sum) direction mechanism. This is a more literal MOBIUS interpretation than the prime/composite gate above, but its output contains no plaintext. It does not exclude another author-specified use of μ or another key source; do not expand into arbitrary word statistics or zero-handling conventions without a new clue.

Reproduce with `node sims/book_of_law_mobius_word_direction_gate.cjs`.

## Causal previous-plaintext-word direction

The signed 2016 instruction is most naturally read as the **plaintext word's** number selecting the next direction: after decoding a word, compute its number and use that to traverse the key during the following word. This avoids the acausal current-ciphertext reading and is a distinct model from using the previous ciphertext word.

For each decoded word, take the sum (S) of its GP prime values. Two source-motivated selectors were tested:

- **Prime/composite:** (S) prime selects forward (or backward under the opposite polarity); composite selects the other direction.
- **Möbius:** μ(S)=+1/-1 selects forward/backward (or the opposite polarity); μ(S)=0 holds the pointer fixed throughout the next word.

The key remains the exact 21,630-rune 2013 Book of the Law GP29 stream, cyclic from its first rune. The first word starts forward. Both arithmetic signs were tested. This is a causal encoder/decoder pair: direction for word (n+1) is determined only after word (n)'s plaintext has been recovered.

| Selector | Positive means forward | Operation | Trigram log-likelihood | IoC |
|---|---:|---|---:|---:|
| Prime/composite | Yes | (C=P+K) | −4.62503 | 0.03449316 |
| Prime/composite | Yes | (C=P-K) | −4.61310 | 0.03446371 |
| Prime/composite | No | (C=P+K) | −4.64183 | 0.03448691 |
| Prime/composite | No | (C=P-K) | −4.63700 | 0.03450624 |
| Möbius | Yes | (C=P+K) | −4.62579 | 0.03447652 |
| Möbius | Yes | (C=P-K) | −4.63071 | 0.03446342 |
| Möbius | No | (C=P+K) | −4.62216 | 0.03446481 |
| Möbius | No | (C=P-K) | −4.64941 | 0.03446948 |

All eight causal synthetic controls recover exactly 12,956/12,956 runes. The best output is **−4.61310**, versus untouched ciphertext **−4.60956**, uniform **−3.36730**, and held-out Shakespeare **−2.36417**. None has plaintext-like language signal. This is the most human-plausible direction semantics tested so far, and it is still negative for the Book of the Law key.

**Decision:** reject the tested previous-plaintext-word prime/Möbius direction rules with the 2013 Book of the Law as cyclic key. Do not infer that the signed 2016 direction instruction is exhausted; its word-number source may be something other than GP-prime sum.

Reproduce with `node sims/book_of_law_plaintext_word_direction_gate.cjs`.

## Decision and limits

Reject the **2013 Book of the Law + cyclic GP-prime-sum and Möbius word-direction** mechanisms under these explicit conventions. This is stronger than the earlier direct continuous running-key rejection, but it does not rule out a book code, a different author-specified number, or a different key source. Do not expand this into an unconstrained sweep over word statistics, direction maps, key offsets, or pointer conventions without a new first-party selector.

Reproduce from the repository root:

```sh
node sims/book_of_law_prime_direction_running_key_gate.cjs
node sims/book_of_law_mobius_word_direction_gate.cjs
node sims/book_of_law_plaintext_word_direction_gate.cjs
```

Inputs: canonical `resources/liber-primus/lp2-corpus.json`, original `resources/liber-primus/lp2-transcription.txt`, exact 2013 chapter sources, and `resources/control/shakespeare_first300k.txt`. The script asserts the original word/rune alignment, exact key length, all eight prime/composite statistics, the four Möbius statistics, and all sixteen causal synthetic round trips.
