# Corrected source-exact 2014 Stage04 GP shift × Stage05 seven-column inverse: original LP2 gate

**Decision (Agent 8, 12 November 2026):** Neither the original 19-step Stage04 shift-key parser nor the corrected 18-GP-rune key, combined with the exact historical seven-column inverse in either order, decodes the two original LP2 chapter spans with source-visible seven-divisibility into readable GP29 English. Both real historical step controls are reproduced and planted genuine plaintext round-trips in full. **No unknown LP2 plaintext, key or destination is recovered.**

**Implementation correction:** An earlier revision of this report claimed the archived Stage04's reversed input-rune lookup also reflected the output GP rune index. That was an erroneous second reversal in the cipher model. The source retains its output **letter values in forward GP order**, so the actual GP29 output index is an ordinary additive shift. The earlier [exploratory seven-column SFT](../sims/2014_7column_textguide_original_sft.cjs) correctly used the additive cipher family, though it used a different key phrase/representation. The present reproducer now tests the *exact historical 19-/18-step key conversions* and both original 2014 stage examples on unchanged LP2.

## Independent historical steps and source selection

**Stage04:** The recovered historic small-image ciphertext is the 18-rune string ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ (the literal 5 and 3 do not consume key). The earlier [full original Stage04 regression](../sims/stage04_small_image_vigenere_repro.cjs) fixes the archived rune lookup, original-source file blobs, and authentic key phrase WELCOME PILGRIM TO THE. The original buggy key-to-shifts implementation peeks ahead at TH without consuming the H, giving 19 key steps and near-domain AUOWYFGL5LCSFJ3NONPM. Proper GP tokenization consumes TH once, giving 18 steps and AUOWYFGL5LCSFJ3NONION; the original C/K, S/Z and U/V alternatives yield the archived onion avowyfgl5lkzfj3n.onion. The new test reproduces both outputs exactly.

**Stage05:** The period-seven permutation over each consecutive seven-symbol tuple uses the exact original inverse order [0,6,2,5,1,4,3], with inverse [0,4,2,6,5,3,1]. It reconstructs the independent historical 56-character output TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133 from the published original seven-column sequence, and reverses that same transformation.

**Original LP2 spans:** Source-printed p8–p14 has precisely 1,729 = 7×247 runes. The p33 internal red8 heading starts at local index91 and continues through p39, giving precisely 1,589 = 7×227 runes. These spans are selected from the [unchanged canonical corpus](../resources/liber-primus/lp2-corpus.json), independently of any output score. Neither a source-selected key clock nor an instruction to compose Stage04 and Stage05 on LP2 is authenticated; this is a bounded historically motivated transfer, and the two operators occurred at different original stages.

## Cryptographic operation

For original numeric GP29 input C in 0..28, the historical Stage04's reversed input-rune key array *and forward output letters* yield **P = (C + s) mod29**. The inverse is C=(P−s) mod29, rather than an involution. The original 2014 buggy key parser has 19 shifts; corrected GP-tokenization has 18. Both are derived from the same literal historical phrase, with zero-phase starts. **The earlier P=(28−C−s) assertion and all scores derived from it were invalid for canonical LP2 GP indices.** The onion-address test alone could not expose the error because the old output presentation reversed the incorrect numeric indices again.

For each original span, consider the Stage05 inverse followed by Stage04, or Stage04 followed by Stage05. Test both original key representations without tuning phase or substituting new text. GP29 trigram scores use one-count smoothing from independently solved LP1 reference text; the native reference score is −2.25755 nats/rune.

| Original span | Key reading | Cipher score | Columnar → Stage04 | Stage04 → columnar |
| --- | --- | ---: | ---: | ---: |
| p8–p14 | archived bug19 | −3.42314 | −3.43162 | −3.42414 |
| p8–p14 | corrected GP18 | −3.42314 | −3.40660 | −3.41058 |
| p33 offset91–p39 | archived bug19 | −3.42394 | −3.41577 | −3.42300 |
| p33 offset91–p39 | corrected GP18 | −3.42394 | −3.41839 | −3.41961 |

All eight complete original output streams remain near the ciphertext register and have nonlinguistic prefixes. For example, GP18 Stage05-then-Stage04 on p8 begins WUDNWJUNGEAOENGIAWPFFEOHNGSOEFBFAES, without a recoverable phrase. These are negative results under an explicitly fixed source-language register, not a universal impossibility for non-English plaintext.

## Reversibility and bounded decision

[Single-file Node.js 22 CommonJS test](../sims/lp2_2014_source_exact_vigenere_7column_sft.cjs) performs original onion, original Stage05 and two source-plaintext positive controls; it verifies exact re-encryption of all 1,729 or 1,589 original runes for every candidate. A native LP1 GP-English plant run through each complete composite decodes perfectly, establishing that an authentic use of this architecture would be detected. The corrected model establishes that Stage04 is an additive GP29 shift with historically unusual key conversion, rather than a new reflected output-index cipher. The original archived onion control and the separate Stage05 control pass. Each original source rune round-trips exactly, along with the native-GP plants.

The test retires only the exact two chapter spans, two source-derived key variants and two operator orders with zero phase. It neither implies the actual puzzle creators used these operations jointly nor excludes an independently selected LP2 key, source-authenticated phase, or alternative cipher. Next actionable progress would require an authored selector linking a named LP2 passage to one of these original operations, rather than more unanchored cipher combinations.
