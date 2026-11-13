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

## Decision

The 75=3×25 relation is a source-constrained potential way to interpret the reused moth's 5×5 matrix. **The cheapest historically precedented totient/Vigenère use does not decode p55.** Retire this exact transfer; the moth, 5×5 table and exact p55 body length remain source facts. Do not broaden into different key phases, square traversals, moduli or nonadditive ciphers without an original selector.

**Reproduction:** [complete self-contained Node.js CommonJS SFT](../sims/p55_moth_wisdom_25cell_phi_sft.cjs), using the canonical GP29 corpus, original p55 JPEG, the printed source-square constants and the pinned GP-normalized Gibran control.
