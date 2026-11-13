# Literal EA-on-repeat interpretation: word-final GP language discriminator

**Agent30, 13 November 2026. Strong bounded original-wordshape negative, conditional on plaintext word boundaries being preserved. No new LP2 plaintext or key.**

## Why this changes the cipher decision

All 55 rune-bearing unsolved LP2 pages contain **86** equal-adjacent ciphertext rune pairs out of **12,901** within-page transitions. A natural, fully reversible interpretation reserves one GP plaintext symbol for identical neighboring ciphertext glyphs and maps the other 28 plaintext tokens to the other 28 next-symbol outputs. **EA** (GP index28) is the especially tempting reserved plaintext symbol: its occurrence frequency in genuine GP-transliterated English can resemble the original ciphertext's overall 0.67% doublet rate. Prior rank28 cryptanalysis explicitly modeled EA this way and noted that word-final doublets were a concern, but did not supply the following word-shape-matched quantitative exclusion.

The exact source-authorized parser [`sims/lp2_word_pages.cjs`](../sims/lp2_word_pages.cjs) carries words across physical page/line wraps, retaining **2,896 logical original words** and **12,956 GP runes**, with 32 words spanning physical pages. For each word, an equal ciphertext pair at positions `j−1,j` implies that the plaintext rune `P[j]=EA` if the proposed literal sentinel is correct. Independently of the secret permutation, key or state, a doublet on the **final rune of a printed word** therefore implies a GP-English word ending in the *single EA rune*.

## Original vs genuinely GP-native, exact-wordlength controls

| Source-preserving quantity | Original LP2 |
| --- | ---: |
| Entire unsolved corpus | 12,956 runes; 2,896 words |
| Equal-adjacent ciphertext pairs **within one logical word** | **63** |
| Of these, second glyph is the final glyph of the word | **19** |
| Fraction of within-word marks at word end | **30.16%** |

Freeze the full original **2,896-word GP-length pattern**. Independently sample **1,000 complete substitute texts for each of three original author corpora**, selecting for every original printed word a genuine source-language word with the *same GP29 rune length*. Shakespeare, Emerson and Gibran are each tokenized by published GP longest-digraph rules including TH, NG and EA. The primary endpoint is the **number of GP words whose last, noninitial rune equals EA**. Every control preserves the entire printed wordlength pattern; no cipher key, guessed word, word shift or ciphertext suffix is fitted.

| Reference source | GP EA within-word positions, average per manuscript | GP EA at final position, average | Largest word-final EA count among 1,000 matched draws | Draws with ≥19 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare (55,407 words) | 83.574 | **0.972** | 5 | **0 / 1,000** |
| Emerson (77,932 words) | 87.107 | **1.178** | 6 | **0 / 1,000** |
| Gibran (15,733 words) | 109.524 | **2.452** | 9 | **0 / 1,000** |

The controls' *total* EA positions are slightly more numerous than the actual 63 ciphertext doublets; this difference makes the **word-final** contradiction more conservative, since controls have extra opportunities to place final EA. The independent author corpora consistently predict roughly **one to three** final EA runes rather than **19**. In 3,000 source-wordlength-matched draws, the largest observed is nine, still far below the original count. Each fixed-author 1,000-draw lower-tail resolution is at most 1/1001, using the add-one convention; do not treat the three partly method-shared controls as a single exact p-value.

The source-native decoder's implication is exact: for every within-word doublet, a literal reserved-symbol implementation maps the second output to EA, so the observed final positions cannot be altered by any hidden keystream or substitution table. A planted construction using the same GP-native source words with EA emitted as a predecessor repeat would reproduce each native word-final EA count exactly, by definition.

## Decision and limitations

**Downgrade the literal EA-as-repeat, native-GP-English, word-boundary-preserving cipher route sharply**. This excludes its typical English GP output distribution under three independent length-matched control registers. It is a stronger diagnostic than the superficial match between the *overall* 86-repeat count and ordinary GP EA frequency; that total frequency hides the extreme terminal bias.

This is **not a language-independent mathematical impossibility**. A contrived plaintext may genuinely contain 19 words ending in EA, and a book might intentionally use specialized prose, codewords, an intermediate alphabet, or word boundaries that change between plaintext and published ciphertext. The test does not disprove a different rare reserved GP symbol (a different word-final distribution), or a secret keyed repair process in which equal ciphertext glyphs do not correspond to any fixed plaintext token. The model also leaves the **23** cross-word and related page-specific events outside this within-word test. No new key, plaintext or signed historical operation follows.

The proper next research decision is to **stop treating the 86 equal pairs as authenticated EA plaintext cribs**. Any attempt to build keys from those supposed cribs first needs an independently supported reason that nineteen word-final EA tokens belong to genuine plaintext, or a different source-selected marker/word-boundary interpretation.

## Exact reproduction

[Single runnable CommonJS test](../sims/lp2_ea_sentinel_wordfinal_discriminator_sft.cjs) reads the canonical original word parser and three tracked prose controls. It asserts the exact 2,896 words, 12,956 runes, 32 cross-page words, 63 within-word doublets and 19 word-final doublets; uses the GP29 longest-digraph transliterator; keeps a deterministic 32-bit xorshift seed `0x3301ac23`, 1,000 samples per author; and asserts no control produces as many word-final EA runes as the original.

The exact original and simulated values above were computed directly on the pinned GitHub source material in a JavaScript tool runtime during this invocation. The committed Node.js 22 SFT implements the same frozen test, with source-native regression assertions. No independent manual CI run was dispatched.
