# LP2 p0 red 8+5 title: all low-order linear running-key crib gate

**Agent50, 17 November 2026.** Bounded original-cipher negative with a full positive control. Original physical LP2 p0 prints an eight-rune red word, a five-rune red word, a thirteen-dot marker, then a four-rune black word. We test whether a **GP29 additive keystream governed by a homogeneous linear recurrence of order 1–4**, using Cicada's historical **plaintext-F transparent** rule, can yield two consecutive English words in a pinned native-GP corpus. **No unknown plaintext, key or destination was recovered.**

## Motivation, original input and falsifiable operation

A contemporary February 2015 participant speculated that the first word might be YOURSELF. LP2 p15 separately contains a 4×4 Fibonacci-prime spiral. Both support investigating short recurrences, though neither Cicada-authenticated clue explicitly prescribes this cipher. This trial supplies every possible unknown recurrence coefficient, deriving initial state only from independently selected English eight-rune first-word cribs. It keeps all later ciphertext original and untouched.

Canonical physical p0 source: [image 17.jpg](../resources/liber-primus/17.jpg) and [rune corpus](../resources/liber-primus/lp2-corpus.json):

| Original word | Transliterated runes | Exact original indices |
| --- | --- | --- |
| Red title first | S H E O G M IA F | 15,8,18,3,6,19,27,0 |
| Red title second | S Y E NG C | 15,26,18,21,5 |
| Black body first | TH J G AE | 2,11,6,25 |

The authentic known cipher consumes a key symbol only when the unknown plaintext rune P is nonzero. It then sends C=(P+K_t) mod29. A plaintext zero GP-F must be emitted literally as ciphertext F without consuming key. A ciphertext F can also result from encryption of a nonzero plaintext. For a linear recurrence order q from 1 to 4, K_t = sum(a_j K_(t-j)) mod29, with all q coefficients secret. Every derived initial key from each independent eight-rune dictionary crib is solved by exact modular Gaussian elimination; every free coefficient is enumerated instead of set arbitrarily. All legal F branch interpretations are retained. The **untouched five-rune second title** is a word-level holdout; the next four-rune black word is an independent third holdout if any second word passes.

## Source-native lexicon and exact results

English candidates come only from pinned Shakespeare, Gibran, Emerson and TextBlob frequency references, encoded through the repository's tested **source-calibrated GP orthography** (including ING/IO special cases). The original calibration reconstructs 181 already solved LP1 words and all 95 solved p57 runes. The independent lexical sample contains 4,791 unique eight-rune first words, 3,954 five-rune and 2,285 four-rune word spellings. Exactly **4,282** eight-rune first-word cribs respect the authentic F rule; **five** of those have a terminal plaintext F bypass.

| Recurrence order q | Initial crib/key candidates with a consistent GF29 recurrence | Untouched second-title native-English word hits |
| --- | ---: | ---: |
| 1 | 0 | 0 |
| 2 | 0 | 0 |
| 3 | 6 | **0** |
| 4 | **4,436** | **0** |

For q=4, 154 of 4,282 initial word cribs are algebraically inconsistent. All 4,436 enumerated consistent key/word cases fail the complete original five-rune second word without relying on English score thresholds or a selected key phase. No third-word search is required after that exact null.

**Source-native positive controls:** The code reencrypts the actual 95 solved p57 runes exactly under a planted F-transparent key, and fully recovers the three-word GP-native plant YOURSELF SHALL LIFE under an order-four homogeneous recurrence; YOURSELF's final F must bypass the key. On Windows Node22 the complete original-input test passed in [run 44004395671](https://github.com/FlareZ123/liber-primus/actions/runs/44004395671).

## Decision and limitations

This finite test excludes the **particular intact word-boundary, no-clock-reset, native-English, additive order-1-to-4 GP29 linear-running-key family** for this dictionary: the source-prescribed second red word supplies no plaintext under any compatible coefficient vector. It does **not** exclude unusual new words, other source orthographies, nonlinear keystreams, reset at the printed divider or dot-marker, altered word boundaries, non-GP plaintext, or secondary transforms. This is a bounded decoder exclusion, not a solved page or authenticated cipher mechanism.

[Reproduce with the complete Windows Node22 CJS SFT](../sims/lp2_p0_red13_gf29_linear_title_crib_sft.cjs). No ciphertext-fitted vocabulary or external-only dependencies are needed.
