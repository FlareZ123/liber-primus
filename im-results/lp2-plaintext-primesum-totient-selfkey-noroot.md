# Exact no-root gate for plaintext-prime-sum totient word shifts

**Agent40, 14 November 2026. Result: rigorous rejection of one source-motivated implicit-key cipher, no newly decrypted LP2 plaintext.** The original 55 rune-bearing unsolved LP2 pages have 12,956 runes in 2,896 complete printed words, including the 32 page-spanning words. The solved LP1 text calls primes and Euler's totient sacred; solved LP2 p56 uses successive prime-totient shifts; the genuine 2016 message alludes to words and their numbers. These clues justify examining whether a word supplies **its own GP-prime/totient Caesar key**, without a missing external pad. They do **not** authenticate this particular operation.

## Frozen, fully implicit mechanism

Let `pr[g]` be the original 29 Gematria Primus primes and `P_w` the whole plaintext rune word, with its exact original printed word boundaries. For each word compute

```
k(w) = phi(sum(pr[p] for p in P_w)) mod 29
C[w,j] = (P[w,j] + sign*k(w)) mod 29
sign = +1 or -1
```

The key depends on **plaintext**, which is unknown to the decoder. For an observed ciphertext word `C_w`, enumerate the **entire 29-element domain** `k=0..28`, derive `P_w[j]=(C_w[j]−sign*k) mod 29`, and retain `k` only when the resulting plaintext satisfies its own totient equation. An observed word with zero retained roots is *mathematically impossible* under this exact model; language scoring and guesses about plaintext are unnecessary.

This is different from already-tested per-word functions of the **ciphertext** rune prime sum and from the **previous-word** prime/totient keystream. The ordinary one-shift-per-word relation is the only clock tested here. If the creator actually supplied an additional independently chosen mapping or a different nonlinear word transform, this result does not reach it.

## Full original-input result

| Cipher convention | Impossible words (zero self-consistent keys) | Exactly one key | Multiple keys | Impossible words containing **no ciphertext F** |
| --- | ---: | ---: | ---: | ---: |
| `C=P+k` | **1,008 / 2,896** | 1,113 | 775 | **839** |
| `C=P−k` | **1,012 / 2,896** | 1,120 | 764 | **869** |

The first no-F obstruction under `C=P+k` is word index **2** (0-based), original romanization `THJGAE`, four GP runes. Under `C=P−k` the first is word index **5**, romanized `NEWBASOEEOINGU`, eleven runes. Neither has even one solution over all 29 candidate keys. The no-F subset is particularly relevant because the historical **plaintext-F transparency** exception cannot rescue a word without ciphertext F: authentic plaintext F would have to emit ciphertext F. Thus these 839/869 exclusions remain even if that exception is permitted while retaining the same one-shift/word rule.

**Controlled functionality:** take each of the original 20 known-cleartext words on solved p57 (95 GP runes), calculate its key from its own GP-prime sum, encrypt each word independently under each sign, and exhaustively invert the resulting ciphertext. Every planted key is recovered among the roots (**20/20 under each sign**); forward reconstruction recovers the exact 95-rune source. This verifies the algorithm on source-native text but **does not demonstrate that the historical cipher used this model**.

The executable [CommonJS single-file test](../sims/lp2_self_toti_word_noroot_sft.cjs) reads the unchanged reference corpus and source-accurate shared-word parser; asserts 12,956 runes, 2,896 words, all no-root counts, 20 original p57 words and both planted positives. The *committed test source itself* was executed against the original GitHub corpus/transcription in the available V8 runtime with Node filesystem/word-parser shims; every assertion passed. No CI resources were consumed.

## Decision

The same plaintext-derived word-totient key cannot encrypt the original entire LP2 manuscript, regardless of which of the 29 GP shifts is chosen for any word, under either specified sign. This decisively closes the simplest **self-supplying prime/totient word key** mechanism, removing one possible escape from the missing external-key bottleneck. It yields **no authentic plaintext, no recovered creator key, and no identified continuation page**. Further word-state guesses would need a separate authorial selector and a reversible original-input prediction; altering the rule until every ciphertext word has a fixed point does not establish a historical decryptor.
