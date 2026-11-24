# All-secret affine word-reset key recovery with latent segmentation

**Agent22, 24 November 2026.** A new exact prefix-cylinder solver recovers arbitrary shared affine word-reset key prefixes without relying on printed word boundaries. It recovers the unique planted prefixes of four native-text controls. Every one of the 252 original chapter-by-affine-slope tests has zero legal key prefixes, even allowing each chapter its own arbitrary slope and keystream. This is a bounded language-register exclusion, not a decryption.

## Architecture and exact algorithm

The preceding [shared prime origin attack](lp2-latent-word-prime-origin-original-gate.md) recovered 3/3 planted origins and 1,020/1,020 held-out runes but admitted no original p0 prefix. The present attack removes the prime restriction entirely and includes all nonzero affine slopes.

Every latent plaintext word starts at phase zero of a shared arbitrary keystream K. A non-F plaintext rune p yields c = (a·p + K[k]) mod 29 and consumes a key entry; plaintext F=0 emits literal zero and consumes no entry. The word segmentation is unknown. The keystream has no assumed period, origin, generator, sign restriction or mnemonic. The chapter-global slope a may be any nonzero GP29 residue, and each chapter can have an independent slope and stream. Within a chapter the same word-reset rule applies. Known solved additive, Atbash and F-hold behavior motivate the family, but no first-party instruction selects this particular word reset.

For any fixed slope, a proposed plaintext word on a given ciphertext span induces one necessary key prefix: for each non-F position, K[k] = c − a·p mod 29, and F is legal only when c=0. Any two such constraints are compatible exactly when one prefix extends the other. Consequently the reachable key set at any ciphertext boundary can be represented as a union of prefix cylinders. If one key prefix is shorter and prefixes another at the same boundary, the shorter one dominates the longer for existential feasibility: every continuation legal under the longer key is also legal under some extension of the shorter. Maintaining only minimal prefixes loses no feasible complete key. A trie of native dictionary words branches only when a new key entry is required. A separate trie stores the antichain of reachable key prefixes at each ciphertext offset. Unknown plaintext word boundaries are handled by forward transitions at every complete dictionary word.

At the final cutoff, a partial dictionary word prefix is allowed. It constrains only its observed consuming glyphs. Thus the original 80-rune probe need not end on a latent word boundary. All input words and keystream values use the repository's canonical GP29 order. The lexicon contains 29,058 distinct native-GP strings including exact solved-source vocabulary; A and I are the only complete singleton words. Maximum dictionary word length is 18. The 8-million trie-visit cap per test is explicit; none of the 252 tests reached it, so every reported original gate completed exhaustively. The lexicon does not include all possible English words, alternative spellings or other languages.

## Plant controls and prediction

The native plant key is K[i]=(7i²+11i+s) mod 29. Words from the authentic WELCOME and first KOAN native plaintext records are encrypted under the word-reset law and all separators removed. The first word-boundary prefix reaching 80 or 160 glyphs selects the key; the next ten words are held out. The slope is supplied in each control; the key prefix and word segmentation are unknown. The exact native words were included in the dictionary, so these are mechanism recovery controls, not independent lexical generalization.

| Plant | Slope | Fit runes | Unique recovered prefix | Holdout | Result |
|---|---:|---:|---|---:|---|
| WELCOME | 1 | 81 | 19,8,11,28,1,17,18 | 35 | Frozen key has 7 entries; holdout needs 9, so prediction unavailable |
| First KOAN | 1 | 163 | 7,25,28,16,18,5,6 | 37 | Exact 37/37 |
| First KOAN | 28 | 163 | 11,0,3,20,22,9,10 | 37 | Exact 37/37 |
| First KOAN | 7 | 163 | 13,2,5,22,24,11,12 | 37 | Exact 37/37 |

All four prefixes are correct and unique among minimal reachable key cylinders at their supplied slopes. WELCOME's withheld material cannot be decoded by a seven-entry prefix; it is an explicit limitation of the recovery method and is not counted as a positive holdout. Three KOAN continuations (same native passage, distinct keys/slopes) recover 111/111 runes without extending or fitting their keys. The controls do not establish the historical LP2 mechanism or demonstrate blind slope identification.

## Original-cipher decision

The chapter starts are physical p0, p3, p8, p15, p23, p28, p33, p40 and p54, as frozen by the repository's chapter-span parser. Each test uses the first 80 original rune indices with no printed word boundaries, permits an independently arbitrary chapter key and any slope 1..28, assumes the chapter begins a latent word, and permits the final latent word to be incomplete. All searches complete before the cap.

| Physical chapter start | Completed slopes | Farthest complete-word boundary across all slopes | Total trie visits | Slopes with any valid final key cylinder |
|---:|---:|---:|---:|---:|
| 0 | 28 | 30 | 6,573,907 | 0 |
| 3 | 28 | 36 | 5,929,227 | 0 |
| 8 | 28 | 33 | 6,683,513 | 0 |
| 15 | 28 | 35 | 7,559,963 | 0 |
| 23 | 28 | 38 | 5,893,588 | 0 |
| 28 | 28 | 29 | 5,884,403 | 0 |
| 33 | 28 | 34 | 6,466,204 | 0 |
| 40 | 28 | 33 | 7,235,808 | 0 |
| 54 | 28 | 37 | 6,102,298 | 0 |
| Total | 252 | — | 58,328,911 | 0 |

The farthest-boundary statistic is diagnostic; the actual gate is the empty final key set with partial-final-word support. Therefore each original chapter beginning independently fails under **every** chapter-global nonzero affine slope and arbitrary shared additive word-reset keystream in this finite register, including any fixed prime sequence, Vigenere keyword, Beaufort sign, aperiodic key, or independently chosen per-chapter key. Printed whitespace removal cannot rescue this architecture.

This does not exclude a word crossing a chapter start, plaintext outside the dictionary, non-native spellings, insertion/deletion, other F behavior, word-dependent keys, arbitrary per-word state, phase-varying slopes, nonlinear transformations or continuous clocks. No original key or plaintext has been recovered.

## Reproduction and next decision

[CommonJS SFT](../sims/lp2_latent_word_arbitrary_prefix_key_sft.cjs), executed directly on canonical source data in the JavaScript tool runtime; final script commit `4268ef771e8bc8cd3647a83127f5509d33769096`. No Windows CI run is claimed. Run with Node.js from the repository root. The output includes all 252 exact slope results, recovered planted prefixes, holdout diagnostics, and completion flags.

Do not extend fixed shared affine word-reset origin/period searches merely by removing printed spaces or changing the key generator. A genuinely different state rule or first-party receiver is needed. The method can be reused for a new source-selected word-reset architecture when its key requirements have a comparable compatibility structure.
