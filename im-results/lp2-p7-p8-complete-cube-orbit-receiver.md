# LP2 p7→p8: completed GF(29) cubing orbit and its two original-cipher receivers

**Scope: source-anchored structural hypothesis; negative decoder result.** The source operands are five red words on physical LP2 p7, the fourth red rune of adjacent p8, and the exact p8–p14 original GP29 ciphertext. This extends the existing five-product cube observation and the p8 3^5 ternary-axis gate; it does not identify an intended operator or recover unknown plaintext.

## Strongest clue and ambiguity

The p7 red words have source lengths **2,4,3,2,3** and their ordinal-GP29 **products modulo 29** are **[11,26,8,15,2]**. The fourth red rune of p8 is **ᛗ = M = GP index 19**; the p8 header begins **X I X M**, where the first three transliteration tokens also read Roman XIX (=19).

These six values are **exactly** one complete orbit of the GF(29) cubing permutation:
`2 -> 8 -> 19 -> 15 -> 11 -> 26 -> 2`.
The five p7 products supply all orbit elements except 19, which occurs on the immediately following p8 red inscription. The full source values and ordering, rather than a guessed English word, produce this mathematical correspondence. The authenticated corpus has four distinct six-cycles under cubing, and the values above all belong to one of them.

**Weakest assumption:** GP29 multiplication of a red *word* and cubing of that product are hypotheses. The orbit was recognized after inspecting the source, and the p8 red 19 is not a uniquely marked insertion instruction. A low conditional random-coincidence probability under *precommitted* operands would not be an honest historical probability here. This remains a candidate human solve-path cue.

## Bounded candidate A: 6-symbol key clock across the chapter

Choose the literal p7 last product **2** as seed, apply `x -> x^3 mod 29` to produce the exact six-symbol key stream above, and clock it from the first p8 red rune continuously across p8–p14 (**1,729 original runes**). Test ten algebraically reversible, source-motivated single-operation GP29 interpretations: add/subtract the cycle, cube-root19 before/after addition, multiply/divide by the cycle, and cube-root19 after multiplication/division. The inverse exponent **19** satisfies `3 × 19 ≡ 1 (mod 28)`.

Original chapter index of coincidence: **0.03446048347**. All ten candidate inverses yield **0.034421–0.034772**, with no readable GP-native result. All ten mappings reencrypt every original ciphertext rune and decrypt a separately planted 95-rune original p57 plaintext. This rules out these ten **exact, no-free-parameter models**; round-trip alone is an algebraic positive, never evidence of historical decryption.

## Bounded candidate B: p8 black 3^5 tensor under the same orbit

p8 is **255 runes**, comprising **12 red + 243 black**, with `243 = 3^5`. The five red p7 word products can supply one coordinate generator per ternary dimension. For each product `r`, select three evaluation points **[r,r³,r⁹] modulo 29**, or the inverse-cubing direction **[r,r¹⁹,r^(19²)]**. On the five-axis, 3×3 GF29 Vandermonde maps, apply exactly the direct matrix, inverse, transpose-direct, or transpose-inverse (two directions × four conventional transforms = **eight** fixed models).

The original 243-rune black body has IoC **0.03404414516**. The eight outputs range **0.032854–0.035915**, and none reads as GP English. Every original 243-rune candidate maps back to the exact source body; all eight independently recover a 243-rune native-GP plant (original p57 repeated and truncated). Earlier work already excluded numeric-step finite differences and other GF29 polynomial samples on this same 3^5 layout; the **cube-orbit evaluation points** are the incremental source-based test here.

## Research consequence

The orbit completion is a concrete original-cipher feature worthy of preservation because it unites printed adjacent red marks, the prime field, a reversible cubing map, and p8's 3^5 body length. Neither a periodic key use nor a separable tensor interpolation recovers native plaintext. Therefore do **not** schedule more arbitrary phase shifts, tensor permutations or exponent families on the strength of this fit alone. A successor requires an independently visible clue that selects **where the orbit is read**, **which cipher equation receives it**, or a convincing GP29 plaintext holdout.

**Reproducer:** [single-file original-input SFT](../sims/lp2_p7_p8_complete_cube_orbit_key_sft.cjs), Windows Node22/CommonJS. Inputs are the repository's canonical `lp2-corpus.json` and `lp2-ink-annotations.json`. Related antecedents are [p7 Roman cube feedback gate](../sims/lp2_p7_p8_roman_cuberoot_fivetap_sft.cjs) and [p8 3^5 five-axis test](../sims/lp2_p7_p8_ternary_axis_difference_gate_sft.cjs). All numerical details reported here were independently computed on the exact corresponding original arrays; the new committed SFT contains exact forward/reverse and native positive assertions. No plaintext has been promoted to `results/`.
