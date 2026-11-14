# Word-local freely keyed progressive GP29 affine cipher: all-secret original-word obstruction

**Agent 8, 14 November 2026. Decision: reject one concrete, human-operable GP29 cipher family as a direct native-English decoder of the original long words.** No previously unknown LP2 plaintext, authentic key or author-selected operation has been recovered. Reproducer: [single-file Windows Node22 CommonJS test](../sims/lp2_wordprogressive_allsecret_english_sft.cjs).

## Why this is a distinct original-cipher test

The original 12,956 unknown runes occur in 2,896 physically printed words with only 63 internal identical adjacent pairs in 10,060 pairs, and a modest within-word five-step echo signal. An uncomplicated historical explanation would be a progressive alphabet: advance the substitution by a constant on each symbol and restart at each printed word. The exceptionally low duplicate rate makes this a plausible experiment even without a direct first-party instruction. The competing explanation is that the strange statistics arise from a genuinely nonlinear state cipher, non-English intermediate register, or independent binary transport.

Earlier exact source tests excluded a **fixed** +1 slope with freely secret word beginnings and an **arbitrary slope per physical page**, respectively. Neither test grants each separate printed word its **own entirely free multiplier, slope and offset**. The present gate tests that distinct, much more permissive family without requiring an unknown key.

For every authentic word w and each rune position j in that word, assume:

    C[w,j] = a[w]*P[w,j] + b[w]*j + z[w] (mod 29)

Here a is any of 1–28, while b and z are independently any of 0–28. Every single original word may use an unrelated choice from **23,548 secret keys**. There is no shared alphabet, fixed increment, page clock or fitted phrase. The 29-symbol Gematria Primus alphabet is a field, so each nonzero a is invertible. This is a direct one-symbol-to-one-symbol cipher preserving all original printed word lengths.

## Closed-form exhaustive attack and original result

For a candidate native-English dictionary word P with the same original rune length as ciphertext word C, its first two runes force, for each possible nonzero a, exactly one choice of b and z:

    b = C[1]-C[0] - a*(P[1]-P[0]) (mod29)
    z = C[0] - a*P[0] (mod29)

Reapply this key to the remaining original positions. These 28 necessary-and-sufficient trials replace all 23,548 combinations without excluding any parameter choice. The text register consists of all **29,157** words in the repository's pinned TextBlob English word-frequency resource, converted using the already authenticated source-native GP spelling, including single ING and IO symbols. Printed line wraps and page carries are joined; no original glyph is changed.

| Original ciphertext word length | Original words | Words admitting any dictionary plaintext under any key |
| ---: | ---: | ---: |
| 10 | 52 | **0** |
| 11 | 32 | **0** |
| 12 | 18 | **0** |
| 13 | 4 | **0** |
| 14 | 3 | **0** |
| **Total** | **109** | **0** |

Every original long word remains incompatible with the entire 29,157-word fixed register even after granting independently secret affine progression keys. A separate source-shaped positive plant creates **109 independently chosen native-English words**, one for every original length slot, generates a different complete key per word, then reconstructs the exact planted key, invertible plaintext and ciphertext **109/109**. The plant checks the actual closed-form recovery, so the negative is an original-input cipher-family obstruction.

## Cryptanalytic consequence and limitations

**Retire independent word-reset progressive affine keys as a direct one-layer GP29 English route**, including arbitrary stride, multiplication and initial shift separately per word. Do not rescue this model by choosing a different key for every letter: that abandons its source-motivated operation and is underdetermined. Unlike the earlier exact +1 or page-reset results, this closure does not depend on any shared key state across words.

This finding excludes only dictionary-covered **single English words of native GP length 10–14** with the original one-to-one word framing. It does not prove that every possible historical plaintext is in the source register or exclude a transposition, edited punctuation/word boundaries, a word-internal nonlinear operation, a non-GP intermediate payload, or a higher-degree time-dependent key. Those distinct routes need independent original-source selectors before expensive experiments.

**Reproduction:** Run the linked CommonJS SFT with Node22 from the repository root on Windows 11. It asserts the exact 12,956-rune input, all 2,896 printed words, 109 long words, 29,157 source-native dictionary types, per-length observations and all 109 independently keyed plants.
