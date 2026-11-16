# Plaintext-word GP sum as a prime-stream index: bounded dictionary inverse

**Agent4, 16 November 2026. Classification: bounded negative for one source-motivated word-key family. No unknown LP2 plaintext, key, or destination recovered.**

## Motivation and evidence boundary

The indexed May 2014 `#cicadasolvers` IRC corpus records a participant hypothesis that a plaintext word's Gematria Primus value and rune position might enter the prime value or index used for a cipher/key rune. This is a contemporaneous solver conjecture, **not** an author-authenticated instruction. Separately, the solved LP2 p56 provides a verified prime-totient additive operation over GP29, with the plaintext-F bypass. Combining those two leads suggests a small, testable word-local key-pointer family.

The exact tested hypothesis is:

1. For a candidate plaintext word (w=(p_0,ldots,p_{L-1})), compute its GP value (S_w), either as the sum of rune ordinals or the sum of the canonical GP-prime weights.
2. Use (S_w), or (1+(S_w\bmod29)), as a one-based starting index into the ordinary prime sequence.
3. At rune position (j), take either the prime itself or its totient (p_n-1), reduce modulo29, and encrypt additively with either sign.
4. Test both ordinary key consumption and the p56-style transparent-F bypass, in which F consumes no key position.

This is a nonlinear prime-indexed key schedule, distinct from the already-tested constant per-word Caesar shift and affine ramp. It gives a concrete interpretation to the IRC participant's word-value/position suggestion without fitting a key to the LP2 ciphertext.

## Exact original-input test

The reproducer uses:

- The repository's original shared LP2 transcription and continuous-word parser. Page breaks and print wrapping do not terminate words.
- Canonical GP rune order from `resources/liber-primus/lp2-corpus.json`.
- Native English-to-GP spelling conventions: QU→CW, V→U, K→C, Z→S, with the manuscript's single-rune ING and IO spellings.
- `resources/control/english_wordfreq_textblob.txt`, excluding Q not followed by U, deduplicated by GP encoding and restricted to the observed maximum word length.

The parser asserts **2,896 printed words and 12,956 runes**. The dictionary contains **28,993 unique GP encodings**.

The 64 frozen variants are the complete product of:

| Dimension | Values |
|---|---|
| Word sum | GP-prime sum; GP ordinal sum |
| Prime-stream start | Full word sum; (1+(S_w\bmod29)) |
| Key value | (p_n\bmod29); ((p_n-1)\bmod29) |
| Index offset | 0; 1 |
| Additive direction | Add; subtract |
| F handling | Spend a key position; transparent F bypass |

For each candidate dictionary word, the forward transform is calculated from that candidate's own GP sum. The resulting ciphertext word is indexed in an exact inverse dictionary and compared with every original printed LP2 word. A source-native positive control confirms that each of the 64 forward encoders is recovered by its corresponding exact dictionary inverse.

## Result

**No six-rune-or-longer original word is a dictionary preimage under any of the 64 variants.** Across all variants, only three distinct original five-rune word positions match at all; their isolated dictionary candidates are `boned`, `canst`, and `unity`. No candidate extends into a coherent adjacent plaintext phrase.

The best individual variant has 179 word positions with at least one dictionary match, but those matches are overwhelmingly one-, two-, and three-rune words. It has only one five-rune match and none of length six or greater. Such short-word matches are expected under a 29-symbol alphabet and are not evidence of decryption. The three five-rune hits across 64 related variants are likewise not plaintext recovery.

The exact tested family therefore fails the natural discriminating criterion: it does not recover even a single six-rune English word from the original ciphertext. This is not repaired by choosing a different one-based offset, sign, GP sum convention, prime-versus-totient value, or p56-style F clock among the frozen alternatives.

## Decision and limits

Retire this **plaintext-word GP sum → prime-stream index → prime/prime-totient additive key** family under preserved original printed-word boundaries and ordinary GP-English plaintext. Do not expand it with fitted offsets, new arithmetic functions, or per-word exceptions without a new source instruction.

This does not exclude all self-keying, plaintext-dependent, word-level, or position-dependent ciphers. The 2014 IRC observation remains a participant hypothesis rather than an author clue, and its exact intended formula is not present in the surviving summary. No LP2 plaintext or key was recovered.

**Reproducer:** [`sims/lp2_word_gp_prime_index_dictionary_gate.cjs`](../sims/lp2_word_gp_prime_index_dictionary_gate.cjs). The script asserts the original corpus counts, dictionary size, all 64 inverse maps, and positive controls.
