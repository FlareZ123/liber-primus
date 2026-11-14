# Corrected source-exact 2014 Stage04 GP shift × Stage05 seven-column inverse: original LP2 gate

**Decision (Agent 8, 12 November 2026; p54–55 extension Agent 28, 13 November 2026; p3 gate, 14 November 2026):** Neither the original 19-step Stage04 shift-key parser nor the corrected 18-GP-rune key, combined with the exact historical seven-column inverse in either order, decodes the three original LP2 chapter spans with source-visible seven-divisibility into readable GP29 English. The additional p3 candidate (217 = 31×7 runes) also fails under Stage05-only, Stage04-only, and both Stage04/Stage05 orders. Its page selector is weak: the literal 3 occurs inside the recovered Stage04 onion address, not as an authenticated instruction to select LP2 page 3. The separate p54–p55 Stage05-only transfer also fails; its score is not exceptional among all 5,040 seven-position permutations. Both historical step controls are reproduced and planted genuine plaintext round-trips in full. **No unknown LP2 plaintext, key or destination is recovered.**

**Implementation correction:** An earlier revision of this report claimed the archived Stage04's reversed input-rune lookup also reflected the output GP rune index. That was an erroneous second reversal in the cipher model. The source retains its output **letter values in forward GP order**, so the actual GP29 output index is an ordinary additive shift. The earlier [exploratory seven-column SFT](../sims/2014_7column_textguide_original_sft.cjs) correctly used the additive cipher family, though it used a different key phrase/representation. The present reproducer now tests the *exact historical 19-/18-step key conversions* and both original 2014 stage examples on unchanged LP2.

## Independent historical steps and source selection

**Stage04:** The recovered historic small-image ciphertext is the 18-rune string ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ (the literal 5 and 3 do not consume key). The earlier [full original Stage04 regression](../sims/stage04_small_image_vigenere_repro.cjs) fixes the archived rune lookup, original-source file blobs, and authentic key phrase WELCOME PILGRIM TO THE. The original buggy key-to-shifts implementation peeks ahead at TH without consuming the H, giving 19 key steps and near-domain AUOWYFGL5LCSFJ3NONPM. Proper GP tokenization consumes TH once, giving 18 steps and AUOWYFGL5LCSFJ3NONION; the original C/K, S/Z and U/V alternatives yield the archived onion avowyfgl5lkzfj3n.onion. The new test reproduces both outputs exactly.

**Stage05:** The period-seven permutation over each consecutive seven-symbol tuple uses the exact original inverse order [0,6,2,5,1,4,3], with inverse [0,4,2,6,5,3,1]. It reconstructs the independent historical 56-character output TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133 from the published original seven-column sequence, and reverses that same transformation.

**Additional final-chapter candidate (Agent 28):** The final visual chapter p54–55 has 232+76=308 runes, exactly 44×7. The original Stage11 landing HTML has title 133 and div id 331; interpreting these as octal gives 91=13×7 and 217=31×7, which sum to 308. The same HTML has 58 image links and the p50 table has eight columns, so this is a plausible but unproven base-8 route. There is no canonical segment, paragraph, page, or word boundary at the 91/217 split. Since both lengths are multiples of seven, splitting there and applying the same seven-block permutation is identical to applying it to the whole chapter; the split adds no independent operation.

**Original LP2 spans:** Source-printed p8–p14 has precisely 1,729 = 7×247 runes. The p33 internal red8 heading starts at local index91 and continues through p39, giving precisely 1,589 = 7×227 runes. The final visual chapter p54–p55 has 308 = 7×44 runes. These three spans are selected from the [unchanged canonical corpus](../resources/liber-primus/lp2-corpus.json), independently of output score. The separate p3 candidate is documented below; its digit-based page selector is explicitly provisional. Neither a source-selected key clock nor an instruction to compose Stage04 and Stage05 on LP2 is authenticated; this is a bounded historically motivated transfer, and the two operators occurred at different original stages.

## Cryptographic operation

For original numeric GP29 input C in 0..28, the historical Stage04's reversed input-rune key array *and forward output letters* yield **P = (C + s) mod29**. The inverse is C=(P−s) mod29, rather than an involution. The original 2014 buggy key parser has 19 shifts; corrected GP-tokenization has 18. Both are derived from the same literal historical phrase, with zero-phase starts. **The earlier P=(28−C−s) assertion and all scores derived from it were invalid for canonical LP2 GP indices.** The onion-address test alone could not expose the error because the old output presentation reversed the incorrect numeric indices again.

For each original span, consider the Stage05 inverse followed by Stage04, or Stage04 followed by Stage05. Test both original key representations without tuning phase or substituting new text. GP29 trigram scores use one-count smoothing from independently solved LP1 reference text; the native reference score is −2.25755 nats/rune.

| Original span | Key reading | Cipher score | Columnar → Stage04 | Stage04 → columnar |
| --- | --- | ---: | ---: | ---: |
| p8–p14 | archived bug19 | −3.42314 | −3.43162 | −3.42414 |
| p8–p14 | corrected GP18 | −3.42314 | −3.40660 | −3.41058 |
| p33 offset91–p39 | archived bug19 | −3.42394 | −3.41577 | −3.42300 |
| p33 offset91–p39 | corrected GP18 | −3.42394 | −3.41839 | −3.41961 |
| p54–p55 | archived bug19 | −3.41367 | −3.42184 | −3.43167 |
| p54–p55 | corrected GP18 | −3.41367 | −3.44389 | −3.42904 |

All twelve complete original output streams remain far below the solved-text control; source-native scoring introduces only small shifts and have nonlinguistic prefixes. For example, GP18 Stage05-then-Stage04 on p8 begins WUDNWJUNGEAOENGIAWPFFEOHNGSOEFBFAES, without a recoverable phrase. These are negative results under an explicitly fixed source-language register, not a universal impossibility for non-English plaintext.

## p3 217-rune page gate (14 Nov 2026)

The Stage04 small-image output contains a literal digit 3, but that digit is part of the recovered onion address; treating it as a selector for LP2 page 3 is an **inferred, weak hypothesis**, not an authenticated instruction. Page 3 nevertheless has 217 = 31×7 runes, making it a bounded candidate for the exact Stage05 period-seven operation. The corrected Stage04 GP18 key is the source-derived 18-symbol reading WELCOME PILGRIM TO THE. Tested the Stage05 inverse [0,6,2,5,1,4,3], its opposite, the Stage04 key alone, and both composite orders with both permutation directions. No phase or key tuning was allowed.

| p3 transformation | Canonical LP1 trigram | Source-native LP1 trigram |
|---|---:|---:|
| Raw p3 | −3.41039500 | −3.40732389 |
| Stage05 exact inverse | −3.43666275 | −3.43027960 |
| Stage05 opposite | −3.42465182 | −3.42752050 |
| Stage04 corrected GP18 only | −3.42745200 | −3.43459566 |
| Stage05 exact → Stage04 GP18 | −3.44353806 | −3.43407149 |
| Stage04 GP18 → Stage05 exact | **−3.40586212** | **−3.39953231** |
| Stage05 opposite → Stage04 GP18 | −3.44749565 | −3.44478853 |
| Stage04 GP18 → Stage05 opposite | −3.46224973 | −3.46088514 |
| Solved LP1 training control | −2.25754522 | −2.26072801 |

The best composite is only marginally above raw p3 (0.00453 canonical and 0.00779 source-native nats/rune) and remains far below the solved-text control. Its first 48 canonical symbols are PPNGSOEEOOYLIASIIXGPBMYARTTEANGHDDJEAAOEEOIALHGXMXAIEAFFXJ, not readable plaintext. Exact forward/inverse round-trips pass for every tested operation. This rejects the direct historical transfer under the page-3/7-block interpretation; it does not establish a universal impossibility for other ciphers or non-English plaintext.

Reproduction: sims/lp2_2014_source_exact_vigenere_7column_sft.cjs (p3Gate).

## Stage05-only final-chapter gate (p54–p55)

The original-image visual chapter p54–55 contains **308 runes** (p54=232, p55=76), or 44 consecutive seven-rune blocks. Applying the exact Stage05 ciphertext-to-plaintext order \`[0,6,2,5,1,4,3]\` gives a slight score increase, but no readable plaintext. The opposite order \`[0,4,2,6,5,3,1]\` gives a similar increase.

| p54–p55 stream | LP1-native smoothed trigram score |
|---|---:|
| Raw ciphertext | −3.41367426 |
| Exact Stage05 inverse | −3.39951364 |
| Opposite permutation | −3.40173517 |
| Solved LP1 reference | −2.25754522 |

The source inverse improves the score by only 0.01416 nats/rune and begins \`AXNGTHMIADIUIANGMPDWNGMNGAATTHCWIIAHSAEIAEMPOGAFOOEWTYEATJUTHJEENEACCEARHUWODXBUFJNGCAOGIALJIEAHCUABXJWDMYIAPOIARPTHLIEOYS\`; this is not readable English. To avoid mistaking a small score bump for evidence, all **5,040** fixed permutations of seven positions were enumerated on the same 44 blocks. The source inverse ranks **961/5,040** (80.93rd percentile), its reverse ranks **1,175/5,040** (76.69th percentile), and identity ranks **2,763/5,040** (45.18th percentile). Neither historical direction is an exceptional fit.

The base-8 side hypothesis gives \(133_8=91=13\times7\) and \(331_8=217=31\times7\), with \(91+217=308\). But the final chapter has no canonical segment/paragraph boundary at cumulative rune 91 or 217; nearest word boundaries are 86/94 and 220/222. Moreover, because both lengths are divisible by seven, applying the same seven-position permutation separately to the 91- and 217-rune blocks produces exactly the same output as the whole 308-rune transform. Thus the octal split does not select a distinct operation or improve the result.

This is a Stage05-only test; no Stage04 key is applied to p54–p55. The exact 2014 permutation is source-authentic, but its transfer to this LP2 chapter is only a hypothesis. The small score gain and non-extreme permutation rank do not justify a further key or cipher search.

## Source-native orthography recalibration

The earlier score tables use the conventional inventory-label spelling. The independent LP1 source-orthography result validates the single-rune spellings ᛝ→ING and ᛡ→IO. Re-scoring with the shared source-native LP1 trigram model (3,510 training symbols; training **−2.26072801**; solved p57 **−2.46814471**) changes some small score differences but does not reveal plaintext.

### Stage04×Stage05 composite, all three original spans

| Span | Raw source-native score | Key model | Stage05→Stage04 | Stage04→Stage05 |
|---|---:|---|---:|---:|
| p8–p14 | −3.42114678 | archived bug19 | −3.43045452 | −3.42381557 |
| p8–p14 | −3.42114678 | corrected GP18 | **−3.40474736** | −3.41220692 |
| p33 offset91–p39 | −3.42395742 | archived bug19 | −3.41734828 | −3.42379688 |
| p33 offset91–p39 | −3.42395742 | corrected GP18 | −3.41800154 | −3.41933302 |
| p54–p55 | −3.41748461 | archived bug19 | −3.41672981 | −3.43249447 |
| p54–p55 | −3.41748461 | corrected GP18 | −3.44024190 | −3.43255232 |

One p54–p55 composite variant (archived bug19, Stage05→Stage04) is only **0.00075481** above raw; the best overall composite (corrected GP18, p8–p14, Stage05→Stage04) improves by **0.01639942**. These are small score movements, not readable plaintext, and remain far below the solved p57 control.

### Stage05-only p54–p55 and permutation null

| Stream | Source-native LP1 trigram score |
|---|---:|
| Raw p54–p55 | −3.41748461 |
| Exact Stage05 inverse | −3.40205838 |
| Opposite permutation | −3.39972814 |
| Solved p57 control | −2.46814471 |

Under source-native scoring, the exact Stage05 order ranks **1,348/5,040** (73.25th percentile), its reverse **1,097/5,040** (78.24th percentile), and identity **3,505/5,040** (30.46th percentile). Neither direction is an exceptional fit. The native spelling changes the permutation ranking from the legacy-label model, reinforcing that a modest score increase is not enough to claim a cipher transfer.

The numeric transformations and exact forward-replay checks are unchanged. The source-native model changes only the language calibration; all candidate outputs remain far from the solved-text control and no plaintext is recovered. Reproduction uses sims/lp1_source_native_trigram_model.cjs.

## Reversibility and bounded decision

[Single-file Node.js 22 CommonJS test](../sims/lp2_2014_source_exact_vigenere_7column_sft.cjs) performs original onion, original Stage05 and two source-plaintext positive controls; it verifies exact re-encryption of all 1,729, 1,589, or 308 original runes for every composite candidate. It now also verifies the p54–p55 308-rune Stage05-only round trip, the 91/217 block equivalence, the full 5,040-permutation null ranking under both spellings, and source-native scores for every composite candidate. A native LP1 GP-English plant run through each complete composite decodes perfectly, establishing that an authentic use of this architecture would be detected. The corrected model establishes that Stage04 is an additive GP29 shift with historically unusual key conversion, rather than a new reflected output-index cipher. The original archived onion control and the separate Stage05 control pass. Each original source rune round-trips exactly, along with the native-GP plants.

The composite Stage04×Stage05 test retires only the exact two chapter spans, two source-derived key variants and two operator orders with zero phase. The additional Stage05-only p54–p55 test also fails its fixed source permutation and is unexceptional in the complete 7! null distribution. It neither implies the actual puzzle creators used these operations jointly nor excludes an independently selected LP2 key, source-authenticated phase, or alternative cipher. Next actionable progress would require an authored selector linking a named LP2 passage to one of these original operations, rather than more unanchored cipher combinations.
