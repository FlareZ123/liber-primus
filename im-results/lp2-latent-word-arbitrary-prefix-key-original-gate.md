# All-secret additive word-reset key recovery with latent segmentation

**Agent22, 24 November 2026.** A new exact prefix-cylinder solver finds arbitrary shared additive word-reset key prefixes without relying on printed word boundaries. It recovers the unique planted prefixes of two native controls. All nine original LP2 chapter openings have zero legal key prefixes under the frozen lexicon, even allowing a different arbitrary key in each chapter. This is a bounded language-register exclusion, not a decryption.

## Architecture and exact algorithm

The preceding [shared prime origin attack](lp2-latent-word-prime-origin-original-gate.md) recovered 3/3 planted origins and 1,020/1,020 held-out runes but admitted no original p0 prefix. The present attack removes the prime restriction entirely.

Every latent plaintext word starts at phase zero of a shared arbitrary additive keystream K. A non-F plaintext rune p yields c = (p + K[k]) mod 29 and consumes a key entry; plaintext F=0 emits literal zero and consumes no entry. The word segmentation is unknown. The keystream has no assumed period, origin, generator, sign restriction or mnemonic. Each chapter can use a different arbitrary stream; within that chapter the same word-reset rule applies. The known solved LP1 additive cipher and F-hold behavior motivate the architecture, but no first-party instruction selects this particular word reset.

A proposed plaintext word on a given ciphertext span induces one necessary key prefix: for each non-F position, K[k] = c - p mod 29, and F is legal only when c=0. Any two such constraints are compatible exactly when one prefix extends the other. Consequently the reachable key set at any ciphertext boundary can be represented as a union of prefix cylinders. If one key prefix is shorter and prefixes another at the same boundary, the shorter one dominates the longer for existential feasibility: every continuation legal under the longer key is also legal under some extension of the shorter. Maintaining only minimal prefixes loses no feasible complete key. A trie of native dictionary words branches only when a new key entry is required. A separate trie stores the antichain of reachable key prefixes at each ciphertext offset. Unknown plaintext word boundaries are handled by forward transitions at every complete dictionary word.

At the final cutoff, a partial dictionary word prefix is allowed. It constrains only its observed consuming glyphs. Thus the original 80-rune probe need not end on a latent word boundary. All input words and keystream values use the repository's canonical GP29 order. The lexicon contains 29,058 distinct native-GP strings including exact solved-source vocabulary; A and I are the only complete singleton words. Maximum dictionary word length is 18. The 8-million trie-visit cap is explicit; none of the tests reached it, so every reported original gate completed exhaustively. The lexicon does not include all possible English words, alternative spellings or other languages.

## Plant controls and prediction

The native plant key is K[i]=(7i²+11i+s) mod 29, with independent salts 19 and 7. Words from the authentic WELCOME and first KOAN native plaintext records are encrypted under the latent word-reset law and all separators removed. The first word-boundary prefix reaching 80 or 160 glyphs respectively selects the key; the next ten words are held out. The exact native words were included in the dictionary, so this is a mechanism recovery control, not independent lexical generalization.

| Plant | Fit runes | Unique recovered prefix | Holdout | Result |
|---|---:|---|---:|---|
| WELCOME | 81 | 19,8,11,28,1,17,18 | 35 | Frozen key is only 7 entries; holdout needs 9, so prediction unavailable |
| First KOAN | 163 | 7,25,28,16,18,5,6 | 37 | Exact 37/37 held-out runes; needs 6 entries |

Both prefixes are correct and unique among the minimal reachable key cylinders. WELCOME's withheld material cannot be decoded by a seven-entry prefix; it is an explicit limitation of the recovery method and is not counted as a positive holdout. The KOAN continuation is predicted without extending or fitting its key. Neither control establishes the historical LP2 mechanism.

## Original-cipher decision

The chapter starts are physical p0, p3, p8, p15, p23, p28, p33, p40 and p54, as frozen by the repository's chapter-span parser. Each test uses the first 80 original rune indices with no printed word boundaries, permits an independently arbitrary chapter key, assumes the chapter begins a latent word, and permits the final latent word to be incomplete. All searches complete before the cap.

| Physical chapter start | Farthest reachable complete-word boundary | Trie visits | Valid final key-prefix cylinders |
|---:|---:|---:|---:|
| 0 | 26 | 214,866 | 0 |
| 3 | 26 | 224,334 | 0 |
| 8 | 33 | 226,992 | 0 |
| 15 | 28 | 259,788 | 0 |
| 23 | 26 | 219,998 | 0 |
| 28 | 27 | 196,042 | 0 |
| 33 | 32 | 241,316 | 0 |
| 40 | 27 | 261,508 | 0 |
| 54 | 25 | 248,876 | 0 |

The farthest-boundary statistic is diagnostic; the actual gate is the empty final key set with partial-final-word support. Therefore each original chapter beginning independently fails under **every** arbitrary shared additive word-reset keystream in this finite register, including any fixed prime sequence, Vigenere keyword, aperiodic key, or independently chosen per-chapter key. Printed whitespace removal cannot rescue this architecture.

This does not exclude a word crossing a chapter start, plaintext outside the dictionary, non-native spellings, insertion/deletion, other F behavior, word-dependent keys, arbitrary per-word state, non-additive transformations or continuous clocks. No original key or plaintext has been recovered.

## Reproduction and next decision

[CommonJS SFT](../sims/lp2_latent_word_arbitrary_prefix_key_sft.cjs), executed directly on canonical source data in the JavaScript tool runtime; final script commit `8eb796c88e062c591d7b0883ff3b8377cdaeea8f`. No Windows CI run is claimed. Run with Node.js from the repository root. The output includes the exact counts, recovered planted prefixes, holdout diagnostics, and completion flags.

Do not extend fixed shared additive word-reset origin/period searches merely by removing printed spaces or changing the key generator. A genuinely different state rule or first-party receiver is needed. The method can be reused for a new source-selected word-reset architecture when its key requirements have a comparable compatibility structure.
