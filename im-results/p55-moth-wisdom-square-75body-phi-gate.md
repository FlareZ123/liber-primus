# P55 75-rune body as three p5 Wisdom-square cycles

**Agent 11, 13 November 2026. Evidence status: exact original geometry and a source-linked, bounded negative cipher test. No unknown LP2 plaintext or authentic key transfer.**

## Human-visible selector and its weakness

The original 2014 LP1 p5 *SOME WISDOM* scan prominently prints a 5×5 mixed numerical/rune table and a moth illustration. Original LP2 physical p55 (original JPEG 72.jpg, SHA-256 a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba) **reuses the moth illustration**. An authentic earlier solved p5 sentence expressly calls **the totient function sacred**. The GP-prime-sum expansion of its 13 word cells yields a 25-cell square whose rows and columns each total **1033** (see [2014 original square source and reconstruction](2014-magic-square-direction-map.md)).

The original p55 has a one-rune initial NG carry completing a word from p54, then **16 complete words totaling exactly 75 runes**. That body is **3 × 25 symbols**, permitting three row-major uses of p5's 5×5 source square without changing any printed runes or selecting an arbitrary key length. This 75/25 fit, together with the reused moth and the p5 source's explicit totient wording, motivates a *single* reversible cipher candidate.

The weakest premise is the missing *instruction that the p5 table should be used as a periodic p55 key*. The same 75/25 geometry does not authenticate applying totients to composite numbers, nor does the manuscript specify which historical source object is the encryption key.

## Frozen original-input inverse

The earlier 2014 source-consistent 5×5 numeric table in printed row-major order is:

| | | | | |
|---:|---:|---:|---:|---:|
|272|138|341|131|151|
|366|199|130|320|18|
|226|245|91|245|226|
|18|320|130|199|366|
|151|131|341|138|272|

Apply Euler phi once to each of its 25 values, reduce modulo29, and take the printed row-major key:

**[12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12].**

Decode exactly the **75 original p55 body runes** (source local positions1–75) by the known solved-p56 GP29 subtraction operation **P[i] = (C[i]−K[i mod25]) mod29**, key index zero at p55 body start. The incoming p54 NG is preserved outside this body decoder as a carried prior-word glyph. There is **one key origin, one sign, one table orientation**, no F-skip or guessed state.

The exact complete decoded GP transliteration is:

> PRFOEIPMFOGIFBTHRNGEOIAIYTHMWPBTHANTFNPTHHGDNGNRBDCEBUWREOIADEAAEUPJBEOMEOMHHJORWSMMGTWOIA

This is nonlinguistic. Using the same 0.1-smoothed GP29 trigram model with **40,000 Gibran training runes**, the original 75-rune body scores **−12.1892069985**, and its source-square inverse scores **−12.1436931753**. Every one of **22,622** native-GP 75-rune held-out control windows exceeds **−9.7607350210**. The decoded IoC is **0.0342342342**. A source-native 75-rune plant is encrypted and recovered under the identical frozen key, and all 75 original symbols forward-reencrypt exactly. The observed original still has no credible GP English recovery.

## Independent newly surfaced moth-language crib

Another original-artifact observation, recorded independently by Agent41 in [the provisional p55 seven-word crib](lp2-p55-moth-p5-terminal-sevenword-crib.md), is that the final seven printed p55 body-word lengths exactly match solved p5's **THE TOTIENT FUNCTION IS SACRED ALL THINGS** in source-native GP spelling. This selects an independently recognizable **30-rune p55 suffix candidate** at original local offset46. Its historical plaintext status remains unproven.

The same unmodified 25-cell source-square pad predicts **only 1 of the 30** ciphertext-minus-proposed-plaintext key symbols. If the seven-word interpretation ever becomes an authenticated crib, this direct Wisdom-square pad is algebraically incompatible with it. This result is an additional check of the *same frozen inverse*, not proof that the crib is true.

## All-secret period-25 obstruction, conditional on the 30-rune crib

The proposed 30-rune p5 phrase spans original p55 local offsets46–75, a length exceeding the source-selected 25-cell key clock by five positions. Therefore the hypothesis can be tested **independently of the actual 25 table values**, granting an adversary a completely secret additive GP29 key of period25 and a free unknown phase. If the crib is genuine and P[i]=C[i]−K[i mod25] is the cipher, the *required* key values must agree in all five positions separated by25. The authentic ciphertext demands instead:

| Original local positions | Required K at first | Required K after 25 |
|---|---:|---:|
|46 and71|10|20|
|47 and72|0|10|
|48 and73|12|15|
|49 and74|15|26|
|50 and75|23|24|

**All five pairs contradict** an arbitrary secret period25 key. A separate predecessor-step model P[i]=(C[i]−C[i−1])−K[i mod25] mod29, motivated by the observed LP2 adjacent-repeat deficit, demands step-key pairs **[5,26], [17,28], [23,14], [16,9], [5,6]** at those same five source-fixed positions. **All five also differ**. These witnesses exclude every secret value assignment and every phase for the two exact period25 additive models, *provided the seven-word phrase is true plaintext*. They are independent of choosing φ(cell), the specific 1033 square, or language scoring.

This is a useful locked falsification of the **cipher-plus-prospective-crib conjunction**. It cannot by itself falsify the seven-word crib: a genuine LP2 encryption could use an aperiodic stream, a nonadditive state, a different plaintext representation, or a transform that changes word boundaries. Nor does it establish any plaintext for the remaining original page.

The SFT asserts all ten unequal key-pair witnesses directly on original GP indices, in addition to testing the table-derived key.

## Direct 5×5 Hill-matrix reading of the same source geometry

A second natural role for the 2014 p5 **5×5 matrix** with exactly **75=15×5** p55 body runes is the historic Hill cipher, rather than a periodic additive pad. The source already calls for phi, and the 29-rune GP alphabet supplies the prime modulus. Apply Euler φ to each original matrix cell, reduce modulo29 and arrange the 25 values in their original 5×5 printed rows:

| | | | | |
|---:|---:|---:|---:|---:|
|12|15|10|14|5|
|4|24|19|12|6|
|25|23|14|23|25|
|6|12|19|24|4|
|5|14|10|15|12|

**Mathematical input fact:** its exact determinant is **28 mod29 = −1**, so the matrix is invertible over GP29 with no secret coefficients. The exact modular inverse is:

| | | | | |
|---:|---:|---:|---:|---:|
|12|13|17|12|24|
|27|25|9|3|0|
|26|15|3|15|26|
|0|3|9|25|27|
|24|12|17|13|12|

The candidate is the standard column-vector Hill inversion of each of the 15 consecutive 5-rune blocks, with no carry, phase, F omission, or unknown alphabet. Test a row-vector transpose and the untransformed original number-square matrix in both vector conventions as **three wrong-source/orientation controls**. Both matrices are invertible: raw-cell determinant **3 mod29**.

| Source / orientation | Original 75-rune GP trigram score |
|---|---:|
| **φ(square), column-vector** | **−12.666276** |
| φ(square), row-vector | −12.368575 |
| Raw numeric square, column-vector | −12.115441 |
| Raw numeric square, row-vector | −12.348893 |

All four outputs are unintelligible GP text and score below all **22,622** held-out native-English 75-rune windows (worst score −9.760735). The complete primary original-output transliteration is:

> UXITHOEBIEAPLNEEOTAEDEAEFYWRBAEAEAMLPJXBTHOENFTDTHYEOJNWCCWWJFJTHRFPXRUIYWUPEOEAEOLCFAELWEOGL

Every 75-rune decoded output re-encrypts the untouched original ciphertext under its exact inverse, and all four 75-rune solved-English plants decrypt exactly. The source-motivated **φ-square Hill transfer therefore fails to recover original plaintext**. Its determinant is a potentially useful property of a candidate matrix; its exact value does not authenticate any LP2 cipher.

The [self-contained 5×5 source-matrix Hill SFT](../sims/p55_moth_wisdom_5x5_hill_sft.cjs) includes source image and matrix assertions, modular determinant/inverse proof, complete original readouts, 75/75 planted controls and 22,622 held-out windows. The wrong-source matrix is a control, not permission for broader Hill-key searches.

## Unknown-secret 5×5 Hill key reconstructed from the provisional seven-word crib

The exact 30-rune LP1 p5 phrase tentatively associated with the original p55 final seven words occupies **p55 local offsets46–75**. Since the complete-word body starts at local offset1, the prospective crib begins at **body offset45 = 9×5**, precisely on a five-symbol block boundary. It therefore supplies **six complete original GP29 plaintext/ciphertext block pairs** for an unconstrained *unknown 5×5 Hill encryption matrix*. This construction does not presuppose any known 2014 square cells, any particular key, or any cipher score.

Grant an adversary **all 25 unknown Hill key coefficients**. The first **five** proposed plaintext 5-tuples form a matrix P with determinant **2 mod29**, so they uniquely determine a GP29 row-vector encryption key X satisfying P·X=C for the five authentic source ciphertext blocks. Its exact recovered candidate is:

| | | | | |
|---:|---:|---:|---:|---:|
|3|27|3|24|15|
|23|4|1|4|20|
|28|4|24|18|19|
|4|28|2|13|22|
|11|13|23|4|22|

X has determinant **26 mod29**, so it is a legitimate invertible Hill-cipher key. The first five blocks are fitted exactly with **25/25** positions, using only their own ciphertext and prospective plaintext. Freeze X and predict the sixth original block using the untouched last five source-normalized crib runes:

| Sixth block | 5 GP29 original indices |
|---|---|
| Predicted ciphertext from uniquely inferred X | **[13,19,22,1,22]** |
| Actual untouched original p55 local offsets71–75 | **[11,1,17,18,10]** |

**The withheld sixth block disagrees at all five positions.** Therefore **no stationary 5×5 GP29 Hill encryption key whatsoever**, even a completely unknown secret matrix and either equivalent row/column convention, can encrypt this exact proposed 30-rune phrase to the authentic source suffix under the printed 75-rune body's natural five-rune grouping. This is an algebraic impossibility conditional on the provisional plaintext and original block alignment, stronger than the direct known-square negative.

The result does **not** disprove the seven-word guess: the real cipher could be stateful, non-Hill, use different segmentation, or the proposed crib could be coincidental. No natural-language plaintext has been recovered. The [Hill SFT](../sims/p55_moth_wisdom_5x5_hill_sft.cjs) asserts full source bytes, both determinants, the unique 25 fitted coefficients, 25/25 exact fit, and the full five-symbol blind failure.

## Decision

The 75=3×25 relation is a source-constrained potential way to interpret the reused moth's 5×5 matrix. **The direct totient/Vigenère pad and the source-φ 5×5 Hill operation both fail to decode p55.** Retire this exact transfer; the moth, 5×5 table and exact p55 body length remain source facts. Do not broaden into different key phases, square traversals, moduli or nonadditive ciphers without an original selector.

**Reproduction:** [complete self-contained Node.js CommonJS SFT](../sims/p55_moth_wisdom_25cell_phi_sft.cjs), using the canonical GP29 corpus, original p55 JPEG, the printed source-square constants and the pinned GP-normalized Gibran control.
