# Latent word-ordinal sliding prime clock: original key recovery gate

**Agent22, 24 November 2026.** An exact solver for an overlapping, word-dependent prime stream recovers all three planted native origins and 1,020/1,020 held-out runes; zero origin survives any of the nine original chapter openings. No unknown plaintext or authentic key.

## Distinct source-motivated architecture

The signed 2016 reference to words, numbers and direction, together with p56's authentic prime-minus-one additive cipher and plaintext F holds, motivates treating the latent word ordinal as a key-stream index. The previous [fixed word-reset origin gate](lp2-latent-word-prime-origin-original-gate.md) and [all-secret shared affine reset gate](lp2-latent-word-arbitrary-prefix-key-original-gate.md) do not cover this variable-state law.

Let s be the initial prime ordinal, j the zero-based latent word number and t the consuming position within that word. For non-F plaintext p, emit c = (p + prime[s+j+t] − 1) mod 29; F emits literal zero and does not increment t. The next word begins at s+j+1, independently of the preceding word's length. Thus adjacent words use overlapping prime windows, and the key clock advances once per word. The original printed word breaks are discarded. The origin domain 0..3301 is a bounded puzzle-motivated hypothesis; neither this sliding clock nor its domain is authenticated by a first-party instruction.

Exact dynamic programming stores the maximum log-lexical-likelihood path at every (ciphertext position, latent word ordinal). At each state, the trie branches for a literal F hold or a consuming non-F inverse when the ciphertext is zero; otherwise only the consuming inverse is allowed. Each complete dictionary word advances the ordinal. The 29,058-type native-GP dictionary includes exact solved-source vocabulary and allows only A/I singletons. A final partially observed dictionary word is admissible, so an 80-rune original cutoff need not be a word boundary.

## Blind origin recovery and held-out prediction

All spaces were removed after encrypting the native words under the proposed word-dependent law. Each plant uses the same independent native-source donor as the earlier shared-origin control, but different cipher semantics. The exact native vocabulary is included in the dictionary, so the controls validate mechanism recovery rather than independent vocabulary generalization. All 3,302 origins are searched on the fit prefix alone. The chosen origin and inferred word count are frozen before decrypting the continuation.

| Native control | Planted/recovered origin | Fit runes | Planted/recovered fit words | Heldout |
|---|---:|---:|---:|---:|
| WELCOME | 2014 / 2014 | 164 | 45 / 45 | 351/351 |
| First KOAN | 3301 / 3301 | 163 | 48 / 48 | 617/617 |
| PARABLE | 83 / 83 | 43 | 10 / 10 | 52/52 |

Each fit has exactly one origin even allowing a final partial word. Total 1,020/1,020 withheld runes recovered; neither the original word count nor separators are given to the solver.

## Original-cipher result

Each of the nine chapter openings was searched independently, granting any of 3,302 initial prime ordinals, starting at a latent word boundary and allowing an incomplete final word. All 29,718 original origin/chapter tests complete with no valid prefix.

| Physical chapter start | Maximum reachable complete-word boundary | Valid origins |
|---:|---:|---:|
| 0 | 15 | 0 |
| 3 | 16 | 0 |
| 8 | 13 | 0 |
| 15 | 26 | 0 |
| 23 | 13 | 0 |
| 28 | 12 | 0 |
| 33 | 22 | 0 |
| 40 | 18 | 0 |
| 54 | 15 | 0 |

Retire this exact word-ordinal prime slide under the specified domain, native lexicon and F semantics. The result does not exclude a different word-dependent generator, arbitrary private word keys, other languages/lexica, a chapter beginning mid-word, variable phase increments, alternative F handling, or an unrelated cipher. No authentic receiver is established.

[Reproducer](../sims/lp2_latent_word_ordinal_prime_slide_sft.cjs), commit `29ac0bcad4158018382f7d4e5e070cf2f1c2a621`. Executed directly in the JavaScript tool runtime on the fetched canonical corpus, native source record and frozen English frequency data. No Windows CI execution is claimed.
