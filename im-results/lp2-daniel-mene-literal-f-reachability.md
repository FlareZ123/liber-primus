# Daniel wall inscription: exact rejection of one source-motivated key

## Hypothesis

The two original Babylonian-style numerals on p33 and p39 identify a bounded chapter. Frank G. Bosman's [2020 interpretation of the cover](https://frankgbosman.wordpress.com/2020/02/11/cicada-3301-the-book-of-daniel/) connects the artwork to Daniel; Daniel 5:25 supplies the literal phrase MENE MENE TEKEL UPHARSIN. [Sanhedrin 22a](https://www.sefaria.org/Sanhedrin.22a) records historical cryptographic interpretations of that inscription, including Atbash and vertical writing. This is an independently motivated candidate, not a demonstrated first-party LP instruction.

Freeze the KJV spelling, standard GP transliteration (K→C), all 21 starting phases, both additive signs, continuous phase across physical p33–39, and literal plaintext-F hold. The 21-rune key is [19,18,9,18,19,18,9,18,16,18,5,18,20,1,13,8,24,4,15,10,9]. For each ciphertext F, branch over literal plaintext F (phase unchanged) and a non-F consuming inverse when possible. For every other ciphertext symbol, only the consuming inverse is possible, and plaintext F is forbidden on that branch. Exact dynamic programming counts legal inverse paths by phase without language-model pruning.

## Result

All 42 original configurations become impossible within the first 147 ciphertext runes (zero-based last-death offset 146); no full inverse exists. All 42 matching synthetic Emerson controls (1,680 runes each, with literal F present) retain legal paths. The controls establish reachability, not unique plaintext recovery. No original plaintext was recovered. No claim is made about arbitrary Daniel-derived keys, other spellings, transpositions, resets, or alternative F semantics. The historical connection motivates this finite test but does not establish source intent.

Reproduce from repository root: `node sims/lp2_daniel_mene_literal_f_reachability_sft.cjs`. Exact output: [JSON](lp2-daniel-mene-literal-f-reachability.json). Executed experiment core in connector V8, not standalone Node or CI.
