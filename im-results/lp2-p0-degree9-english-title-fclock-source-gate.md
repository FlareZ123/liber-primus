# Opening LP2 p0 title: source degree-nine running-key English inverse

**Decision, 22 November 2026.** The original p50 numerical table has a degree-nine factor over GF(29). If its coefficient polynomial generates a homogeneous linear key stream and that stream enciphers the original p0 red 8+5-rune title through a constant invertible affine rune transform, **no solution continues as five complete native-GP English words**. This remains true in both source-factor directions and for either interpretation of the eighth red ciphertext rune F. It is a bounded negative for this explicit family. The result is no decryption of p0 and no evidence that the authors used this operation.

## Independent source and decipherment model

- [Original physical page p0](../resources/liber-primus/17.jpg) begins with a red eight-rune word and a red five-rune word, followed by black words of lengths **4,3,3**. The first five original printed word lengths are **8,5,4,3,3**. The first 17 runes in canonical GP29 indices are **15 8 18 3 6 19 27 0 | 15 26 18 21 5 | 2 11 6 25**. The first red word ends with **F, ordinal 0**.
- [Original p50 numerical table](../resources/liber-primus/base60-grid.json) has SHA-256 of its 256 bytes **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. The exact factor over GF29 is f(x) = 11 + 15x + 9x³ + x⁴ + 5x⁵ + 10x⁶ + 20x⁷ + 12x⁸ + x⁹, established in [the independent original-input factorization](../sims/lp2_grid_gf29_factorization_sft.py). Both this factor and its reciprocal are tested.
- [English frequency corpus](../resources/control/english_wordfreq_textblob.txt) is converted with source-calibrated native GP spelling, where ING maps to the single NG rune and IO to IA; see [independently solved LP1 and p57 controls](../sims/lp2_native_gp_source_orthography_sft.cjs).
- The encryption hypothesis is C[t] = (a·P[t] + b + K[s]) mod 29, for a = 1..28, b = 0..28. A plaintext F is copied literally, consuming no key. Every non-F plaintext rune consumes one key symbol; the key obeys the degree-nine recurrence. The eighth red printed F can represent (i) a literal plaintext F with no clock advance, or (ii) zero from an encrypted non-F rune with clock advance. Both interpretations are tested, with the first nine key symbols freely unknown.
- All original printed word boundaries are preserved. The first nine consumed ciphertext symbols set the nine free key-state values. The remaining three or four title symbols must satisfy the recurrence exactly. The black four-rune word is then inverted and required to be English, and both interpretations of any **later** ciphertext F are explored when testing the following two printed words.

The finite-field hash join explores every eligible 8+5-rune English pair with all 812 affine parameter combinations, without enumerating arbitrary key seeds. No thematic phrase is preselected or used to tune a language score.

## Original-input outcomes

| Factor direction | First red F role | Eligible first words | Red title recurrence fits | Third English word fits | Fifth English word fits |
| --- | --- | ---: | ---: | ---: | ---: |
| Forward degree nine | Literal plaintext F | 5 | 557 | 4 | **0** |
| Forward degree nine | Encrypted non-F | 3,872 | Exact count in SFT | 42 | **0** |
| Reciprocal degree nine | Literal plaintext F | 5 | 546 | 2 | **0** |
| Reciprocal degree nine | Encrypted non-F | 3,872 | Exact count in SFT | 29 | **0** |

The second red word has **3,320** eligible non-F dictionary entries. The five eight-rune words that end in literal F and have no earlier F are **kerchief, mischief, peterhof, unbelief, yourself**. The first-black dictionary survivors fail to match the fifth printed English word in every branch. One literal-F/forward survivor reaches the fourth word; in the encrypted-F branch two forward survivors and one reciprocal survivor reach the fourth word. None continues to a fifth ordinary dictionary word.

**Positive controls:** For each of the four branches, the SFT plants five known GP-native words of the original printed lengths with independently chosen initial degree-nine state, a = 7, b = 3. The literal-F plant is **YOURSELF SEEKS ROAD AND YOU**; the encrypted-F plant is **EPIPHANY SEEKS ROAD AND YOU** and forces the eighth ciphertext rune to F from a non-F plaintext rune. The search rediscovers the intended title, correct affine parameters, source-derived key recurrence and all five native dictionary words.

## Reproduction and limits

[Standalone Node.js 22 CJS test](../sims/lp2_p0_degree9_transparent_english_title_sft.cjs), with exact original-input checks, exhaustive model enumeration and synthetic positive controls. [Successful Windows GitHub Actions run 44965517443](https://github.com/FlareZ123/liber-primus/actions/runs/44965517443) completed all four branches.

The result excludes the stated original-source degree-nine LFSR/affine GP29 construction for an opening page containing five ordinary English words under the calibrated native orthography. It does not exclude another language, a word missing from the lexicon, a nonlinear cipher, a source-independent key, a different key origin/offset or use of the degree-nine factor for another purpose. A changed first-state clock requires an independent original clue.

**No unknown-page plaintext, source-authenticated key or destination has been recovered.**
