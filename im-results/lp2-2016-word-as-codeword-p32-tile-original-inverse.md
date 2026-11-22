# Literal 2016 words→number→p32 tile→one rune: complete original-book inverse

**Agent 7, 15 November 2026. Original-source direct plaintext consumer; executed on all 2,896 original cipher words and calibrated against untouched native GP-English prose. Result: no deciphered original LP2 plaintext, source-authenticated key or destination.** [Single-file CommonJS SFT](../sims/lp2_p32_2016_wordcode_tile_original_sft.cjs) · [passing original-source Windows/Node22 workflow 43775002661](https://github.com/FlareZ123/liber-primus/actions/runs/43775002661).

## Source-selected candidate that might have decoded text

The verified signed 2016 Cicada message instructs that the *words* of Liber Primus are the map and their numbers are the direction. A plausible, finite interpretation is that an apparently random original **ciphertext word is one numerical codeword for a plaintext GP rune**, with the word separators carrying actual symbol boundaries. This is substantively different from treating all 12,956 rune symbols as a single additive cipher. The source-printed words average 4.47 original ciphertext runes and have atypical native English word-length grammar. A word-to-letter expansion by multiple code glyphs per plaintext symbol would explain that grammar **if** it recovered actual language.

The independently existing exact 2016 image/p32 relation supplies a specified translation table: the signed 2016 picture is 563×569; physical LP2 p32 contains 121 GP runes that *can be reshaped*, without rearrangement, into an 11×11 grid whose first-row and first-column GP-prime sums reproduce those two dimensions. Those 21 header runes define eleven horizontal and eleven vertical strip widths over the original picture area; all other 100 printed p32 runes become tile values. See the [new short-ID/3301 fixed-point check](lp2-signed2016-p32-number-coordinate-fixedpoints.md) for the precise axes, conditional evidence and the serious weakness of the original 11×11 identification.

For **each of all 2,896 physically printed original ciphertext words**, preserving the exact hyphen/dot separators across line and page wraps, test two once-fixed source-native ways of obtaining its integer:

1. **BASE29 positional value**, because an authenticated 2013 Cicada challenge explicitly taught BASE29 number parsing. The original source GP indices form the digits in printed order. Calculate pixel x=N mod563, y=N mod569 and read the original p32 rune at the source-width/height strip intersection.
2. **Gematria Primus prime sum**, another authenticated earlier Cicada arithmetic convention. Use the same pixel-to-tile operation.

Both routes produce exactly one original p32 GP rune for each untouched printed word; neither changes original page order, spacing, p32 tile data or a per-word key. The p50 numeric-only original page is excluded as not a GP word source. Six standalone red decimal headings are excluded as nonrunic word tokens. The source count is asserted: **55 nonempty unknown rune-bearing pages, 2,896 complete original words, 12,956 original GP ciphertext runes**. The already solved p56 and clear p57 are not accidentally included among the input words.

## Actual complete-book outputs

| Frozen direct consumer | GP output length | Unique GP output types | Empirical rune IoC | Opening original outputs |
| --- | ---: | ---: | ---: | --- |
| BASE29 word number → native p32 tile | **2,896** | **29/29** | **0.0526596151** | L X L EA A A TH X AE L AE W X IA L ... |
| GP-prime word sum → same native p32 tile | **2,896** | **15/29** | **0.1083626752** | J EA EO M L O IA TH EO B EA IA TH L EO ... |

Both outputs are deterministic and contain the expected exact 2,896 GP symbols. Their high or moderate IoC is **not a decryption signal**: the original p32 tile alphabet itself is nonuniform, and the prime-sum candidate uses only 15 of its 29 letter values. The BASE29 candidate at least reaches all 29 values, making a native English comparison possible.

The SFT used the independently committed original 300k Shakespeare reference file, greedily encodes the first **160,000** GP runes as a 29-symbol native-GP trigram frequency reference with count+0.5 smoothing, and reserves a disjoint **2,896-rune native-GP window** for a true-language check. It scores the entire frozen BASE29 output, and **256 deterministically seeded** random permutations of the *same original decoded 2,896 symbols*, which retain exact original output marginals. All scores are log-likelihood in natural-log units **per GP rune**:

| Source | Native GP-English trigram log likelihood |
| --- | ---: |
| **Original full-book one-rune-per-word result** | **−12.30849321** |
| Independently reserved authentic English-GP window | **−7.96779920** |
| Same 2,896 original decoded symbols, 256 shuffled-order controls | median **−12.31238423**, range **−12.38665591 to −12.25207976** |
| Shuffled controls at least as English-like as original | **112/256**, corrected upper-tail **113/257 ≈ 0.43969** |

The original sequence scores **almost identically to a random rearrangement of itself** and far worse than the genuine text control. Its output contains no sustained original plaintext or recognizable instruction. The prime-sum output is even less plausible, being restricted to 15 unique symbols by its deterministic numerical range.

## Real positive and conditional limits

This source grid could in principle encode authentic GP text: scan the first 29⁴ positional BASE29 integers and find a four-digit GP word routing to each of the **29** original p32 rune values; all 29 are reachable, with the largest required integer **36,484**. The SFT converts the **95 genuine original clear p57 GP symbols** into four-digit codewords and recovers all **95/95** by the same unmodified coordinate decoder. That validates the exact encoding, output availability and numerical inversion; it is deliberately synthetic input and **does not establish the author selected this code**.

The original 2016 words/map clue does **not explicitly specify** original GP-word boundaries as letter boundaries, positional BASE29 of the word, the 2016 image as coordinate plane, or the inferred p32 11×11 source square as a lookup table. The source-number fixedpoint report documents only a conditional two-number arithmetic relation, not a cipher instruction. Thus this experiment cleanly resolves one **human-executable, fixed, independently checkable proposed decoding route**, without extrapolating to arbitrary word coordinate recipes.

**Decision:** retire **direct single-output GP rune per printed word via the original 2016 dimension/p32-prime-axis tile lookup** in either the BASE29 or prime-sum integer register as a route to ordinary GP-English plaintext. Any successor needs an original source instruction specifying a different letter extractor, selected image payload channel or a *substantive* keyed operation; reassigning word origins or reordering decoded symbols until English appears would be postselected. The existing authentic p56/p57 plaintext status remains unchanged.
