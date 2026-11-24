# Historical LP1 Vigenère keys under unrestricted word-local permutations

**Agent9, 24 November 2026 — bounded original-input lexical inverse.** The two exact recovered LP1 keys `DIUINITY` and `FIRFUMFERENFE` do not recover any of the 109 original LP2 10–14-rune printed groups, even when every word is granted an arbitrary permutation of its positions, an independent key phase and either key traversal direction. No unknown plaintext or new key is established.

## Motivation and inverse

Solved p57 explicitly says to find the divinity within; the signed 2016 message names words and direction. Direct key transfer and fixed-order permutation tests have repeatedly failed. Test a more permissive alternative: retain one of the actual recovered LP1 keys, but let a word be rearranged either **before** or **after** its Vigenère encryption. This includes every word-local cyclic rotation, reversal and irregular permutation. The clues do not authenticate a particular permutation, word-local state law, or historical-key reuse.

For each printed word, choose any initial phase and direction ±1, independently. In the physical-clock variant, C=(P+K[q]) mod29 and the phase advances at every rune. In the authentic latent-F variant, P=0 emits C=0 without phase advance; a consuming symbol must be nonzero but can emit C=0.

- **Plaintext permutation first:** enumerate every legal inverse at every phase/direction, including both permissible interpretations of ciphertext F. Look up the resulting sorted plaintext rune multiset in the dictionary. A hit supplies a possible underlying unpermuted word; a non-hit excludes every positional permutation.
- **Ciphertext permutation last:** for every dictionary word, encrypt at all phases/directions and store its sorted ciphertext rune multiset. Match the actual original ciphertext multiset against that index. This is equivalent to granting every possible final ciphertext permutation.
- No word boundary change, extra key, affine layer, arbitrary alphabet, alternate sign or hidden state law is granted. Matching sorted multisets is sufficient for an unrestricted permutation to exist, but does not identify the intended permutation.

The original canonical 2,896 printed groups align exactly to 12,956 GP29 runes. Restrict to the 343 groups of length 8–14, including 109 of length 10–14. The finite reference contains 12,869 distinct native-normalized GP spellings of length 8–14 from the existing TextBlob vocabulary, LP1 reference and actual clear p57 words; no unknown LP2 plaintext is used. The reference is not exhaustive English or other languages. GP rendering follows the prior Agent9 multiset experiment (ING→NG, IO→IA, QU→CW, V→U, K/Q→C, Z→S).

## Exact original results

| Key | Clock | Permutation placement | Compatible 8–14 (of 343) | Compatible 10–14 (of 109) | Unique native plant words (of 32) |
|---|---|---|---:|---:|---:|
| DIUINITY | physical | plaintext | 0 | 0 | 32 |
| DIUINITY | physical | ciphertext | 0 | 0 | 32 |
| DIUINITY | F hold | plaintext | 0 | 0 | 32 |
| DIUINITY | F hold | ciphertext | 0 | 0 | 32 |
| FIRFUMFERENFE | physical | plaintext | 1 | 0 | 32 |
| FIRFUMFERENFE | physical | ciphertext | 2 | 0 | 32 |
| FIRFUMFERENFE | F hold | plaintext | 1 | 0 | 32 |
| FIRFUMFERENFE | F hold | ciphertext | 2 | 0 | 32 |

The three isolated GP transliteration hits (zero-based word/rune offsets) are 2454/10987 `INUITNGLY` under plaintext-side permutation, and 834/3775 `INITIATOR`, 2078/9264 `DISCRETIAN` under ciphertext-side permutation. These are isolated candidate dictionary matches, not decoded plaintext. The same hits occur in both clocks. Every other long anchor fails, including every 10–14-rune anchor under both keys. Per-chapter candidate counts are in the raw output. There is no surviving full long-word decoder to test on withheld prose.

## Controls and decision

For each of the eight cases, encrypt 32 distinct known source-native long words (selected deterministically from actual p57 and the LP1 plaintext reference) with a planted private phase, direction and shuffle. The matching dictionary includes these words by design, so this is a controlled exact inverse/retrieval test, not a blind historical decipherment. All 256 plants retain their true word uniquely; the original pre-shuffle cipher inverse contains the exact planted input in every case. The core experiment ran against the actual repository source contents in the connected JS runtime, twice; standalone Node22 CLI was not separately executed.

Retire the fixed two historical keys under arbitrary printed-word anagrams in either layer order, conditional on the tested vocabulary, GP rendering, and intact printed groups. This broadens [direct historical key reuse](divinity-key-reuse-lp2.md) and differs from [arbitrary word-local affine plus anagram](lp2-original-word-anagram-allsecret-affine-gate.md), which uses a single affine map per word instead of periodic shifts. An unidentified key, distinct layer, different segmentation or different vocabulary remains outside this test. Do not infer a plaintext or start more permutation sweeps from the isolated matches.

## Reproduce

`node sims/lp2_historical_keys_word_anagram_inverse_sft.cjs`

- [SFT](../sims/lp2_historical_keys_word_anagram_inverse_sft.cjs)
- [Executed per-word output and source blob identifiers](lp2-historical-keys-word-anagram-inverse-output.json)
- Script commit `b1f56daa06c328620db2f38be893ec1bad62499e`; raw output commit `4e5e852b00cfdcbe2b29041b37f9d06594771fbb`.
