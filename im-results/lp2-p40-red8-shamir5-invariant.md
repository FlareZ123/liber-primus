# Original p40 red-eight / five-of-eight GF(29) share-consistency gate

**12 November 2026, Agent22. Exact original-input bounded exclusion. No unknown LP2 plaintext, key, destination or selected historical decoder.**

## Why a five-share check is reasonable

Physical LP2 p40 has a visibly distinct eight-rune red header with GP29 indices **[0,9,19,26,6,23,25,8]**. The source-visible p40–53 chapter has **3,008** runes, leaving exactly **3,000 = 8×375** after the header. The nearby original pp49–51 table has eight printed columns. The independently established 2013 Cicada puzzle used five-share reconstruction, which suggests a human-testable check: are these eight GP29 streams evaluations of a threshold-five polynomial over GF(29)?

**Historical qualification:** Cicada's actual 2013 \`ssss\` v0.5 method operated in the whole-secret field GF(2^984), with XTEA in the recovered source, whereas this is a conjectural *new* native-rune, degree-four GF(29) adaptation. The original LP2 image supplies no instruction to treat the eight runes as share identifiers or the following text as eight shares.

## Frozen original-input algebraic decision

A degree-four polynomial \`f_r(X)\` evaluated at eight distinct field positions is a [8,5] evaluation code. Any five position/value pairs determine the remaining three **exactly**. This consistency is independent of every unknown polynomial coefficient and hidden plaintext.

We froze two source-motivated identifier schemes before evaluating the outputs:

* Red GP ordinal plus one: **[1,10,20,27,7,24,26,9]** in their printed order.
* Historical sequential share IDs: **[1,2,3,4,5,6,7,8]**, following the actual 2013 numbered-share convention.

Prime *values* of the red runes reduced mod29 would have a duplicate field ID, so do not make eight distinct points. We froze three original-copy layouts: **stride-eight** (375 successive rows), **eight contiguous 375-symbol blocks**, and **eight contiguous blocks assigned in classical red-key alphabetical rank [0,4,7,1,2,5,6,3]**. No shifts, phases, custom alphabet mappings, field changes or nonlinear preprocessing were searched.

For each of 375 rows per layout, the first five observations determine a degree-four polynomial. The other three original ciphertext observations form **1,125 withheld exact equality tests**. A valid literal five-of-eight encoding requires **375/375 fully matching rows and 1,125/1,125 held-out symbols**.

| Share IDs | Layout | Complete valid rows (of 375) | Predicted original symbols (of 1,125) | Candidate secret IoC |
| --- | --- | ---: | ---: | ---: |
| Red ordinal +1 | Eight-rune stride | **0** | 38 | 0.0340249554 |
| Red ordinal +1 | Contiguous blocks | **0** | 49 | 0.0352085561 |
| Red ordinal +1 | Red-rank blocks | **0** | 49 | 0.0342245989 |
| IDs 01–08 | Eight-rune stride | **0** | 35 | 0.0344385027 |
| IDs 01–08 | Contiguous blocks | **0** | 25 | 0.0346096257 |
| IDs 01–08 | Red-rank blocks | **0** | 27 | 0.0355365419 |

The 25–49 / 1,125 match counts are near the uniform independent-symbol baseline of 1/29. In the stronger full-eight-point polynomial inverse, all **375** original polynomials have a nonzero coefficient above degree four, under every frozen interpretation. Degree-seven interpolation and re-evaluation exactly reproduce every original 3,000-rune input because they are a general bijective representation; that trivial identity is **not** evidence of a cipher.

## An error-correcting version also fails

A [8,5] polynomial evaluation code over GF(29) has minimum distance four. Even allowing **one arbitrary erroneous share in every row**, at least seven original evaluations must lie on the same degree≤4 polynomial. For each of 375 original rows we exhaustively excluded each of eight possible corrupt positions, interpolated five of the seven remaining original shares, and checked the other two. Only **4, 3, 3** rows (red-ordinal identifiers; stride, block, red-ranked block) or **1, 6, 2** rows (sequential IDs; corresponding layouts) can agree at seven positions. Under this one-error correction model, a genuine 375-row share stream would require **375/375** such rows. Each native-GP positive plant was also damaged at one rotating share position per row; all **375/375** planted rows remain one-error-correctable under all six register choices. This strengthens the direct field/model exclusion without requiring language scores or plaintext guessing. It does not reject an arbitrary two-error model, different coordinates or another cipher layer.

## Source-native positive and implementation control

The [standalone CommonJS reproduction](../sims/lp2_p40_red8_shamir5_sft.cjs) reads the repository's unmodified [canonical original corpus](../resources/liber-primus/lp2-corpus.json). Each variant synthesizes 375 new degree-four polynomial shares carrying the genuinely solved p57 GP rune values repeated in sequence. Decoding any five shares recovers **375/375 true rune positions**, while the other three shares are predicted **1,125/1,125**. It also checks all 3,000 original symbols by forward re-evaluation of the unrestricted interpolants and asserts exact original failure counts and secret IoCs.

## Research decision

This excludes precisely a **literal, stationary, GF(29) degree≤4 threshold-five share representation** of the source-visible p40–53 body under these two ID grammars and three original-shaped layouts. It neither excludes Cicada's historical whole-secret GF(2^984) secret sharing applied to some *different* encoded input, nor variable key material, additional cipher layers, other layouts, other threshold rules, or a creator-provided hidden field/identifier map. Any follow-up requires a source instruction fixing a different input or operation before further candidate scoring. The original unknown chapter is still encrypted.
