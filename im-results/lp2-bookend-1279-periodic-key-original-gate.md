# Original 6395-rune bookend distance: no native-GP periodic 1279-rune key signature

**Agent32 · 22 November 2026. Original-input key-length discriminator, positive-controlled. No plaintext or authenticated secret key.**

## Why 1279 is a specific source-led key-period candidate

The only duplicated original six-rune string of physical LP2 p0–55 is **[23,11,1,17,18,10]**, at zero-based tape offsets **6555** and **12950**, ending at the two independently notable lengths **6561=81²** and **12956**. The two instances are separated by **6395=80²−5** original GP29 runes. As an ordinary integer, **6395=5×1279**, with **1279 prime**. Five is the number of authentically printed ordinal-number holes in the proposed 80×80 register. These arithmetic relations allow a narrowly motivated interpretation: a repeating additive GP29 Vigenère key of exactly1279 runes would have the **same key phase** at both bookend occurrences, potentially explaining the identical six-rune phrase.

The fact that 1279 is prime does not authenticate a puzzle-maker choice. This is a prospective discriminant for the explicit conventional repeating-key mechanism, not a claim that 1279 must be the cipher period.

## Exact invariant with no unknown key search

Suppose all genuine source ciphertext positions obey

\`C_i=(P_i+K_{i mod1279}) mod29\`,

where P is the actual native-GP29 plaintext and K is an **arbitrary** 1279-rune secret GP29 key, selected without restrictions. At any two original positions separated by a multiple of1279,

\`C_{i..i+n−1} = C_{i+1279k..i+1279k+n−1}\`

if and only if the corresponding **plaintext n-grams are identical**. This is an exact consequence of key phase equality; its truth is independent of the 29^1279 possible secret keys.

The original source has **zero matching trigrams separated by exactly1279 runes** across the full 12,956-rune tape. The adjacent integer lags1278 and1280 have one and zero matches, respectively, so no hidden 1279 excess is present. In contrast, the only lag6395 trigrams match at positions **6555,6556,6557,6558**, precisely the four overlapping length-three views of the same duplicated six-rune terminal phrase. There is **no second independent original lag6395 matching trigram**. The complete source counts for multiples of 1279 are:

| Same-phase lag | Original matching trigrams | Original matching six-grams |
| ---: | ---: | ---: |
| 1×1279 | 0 | 0 |
| 2×1279 | 0 | 0 |
| 3×1279 | 1 | 0 |
| 4×1279 | 1 | 0 |
| 5×1279 = 6395 | 4, all from terminal six-gram | 1 |
| 6×1279 | 0 | 0 |
| 7×1279 | 0 | 0 |
| 8×1279 | 0 | 0 |
| 9×1279 | 0 | 0 |

## Direct native-GP English calibration and complete positive inversion

The source-native GP29 encoder, calibrated against the *actual solved* Cicada pages, encodes independent passages from Gibran's *The Prophet* and Shakespeare with the genuine 29-symbol digraph/ING orthography. In each language corpus, sample **128 genuine contiguous 12,956-rune windows**, first window at position zero and the remainder chosen with fixed xorshift32 seed \`0x12793301\`. For each, apply a fully independent random **1279-rune secret GP29 key** repeatedly to all source-shaped positions, decrypt it exactly, then count the same-phase native plaintext/ciphertext triplet matches.

Because the key really repeats, the count is preserved **exactly by the planted cipher**, demonstrating that a genuine native-GP periodic-key decode would expose its source-language n-gram signature without recovering K.

| Independent English GP control, 128 windows | Minimum lag1279 matching trigrams | Median | Maximum | Mean |
| --- | ---: | ---: | ---: | ---: |
| Gibran | 6 | 18 | 31 | 18.2578125 |
| Shakespeare | 3 | 10 | 27 | 11.2421875 |
| **Actual original LP2 ciphertext** | **0** | n/a | n/a | n/a |

Thus **0/256 genuine native-English windows** exhibit the source-original zero-trigram signature at lag1279; all 256 planted periodic-key inverses round-trip. This is a strong native-English empirical exclusion for the hypothesized **single continuous 1279-rune repeating additive key** across LP2. It is **not** a theorem against every possible unknown plaintext or an unknown source-selected nonperiodic key. It says the repeated terminal six-gram is *insufficient to justify* a 1279-key Vigenère architecture.

A **6395-rune period** remains unexcluded by this particular comparison: the original lag6395 yields four overlapping trigram matches, while genuine English source windows span zero to15 matching trigrams at that large separation, and each control's adjacent four-gram count is sparse. Thus one must not extend the negative to a long 6395-rune key or to a resettable page/word clock.

## Research decision and reproduction

Avoid spending resources reconstructing a missing **1279-character periodic secret key** from this bookend string. The exact same-phase invariant makes a native-GP English decoder atypical even granting a free unrelated key at all1279 positions. A true changing-state inverse that produces independent authentic words would be more persuasive. If newly recovered first-party instructions independently demand period1279, rerun this test with their exact spelling and phase/reset conventions rather than rejecting the documented instruction.

[Source- and language-positive-controlled Windows Node22 CJS SFT](../sims/lp2_bookend_1279_periodic_key_repeat_original_sft.cjs) · [Actual original-input PASS run45066273908](https://github.com/FlareZ123/liber-primus/actions/runs/45066273908).