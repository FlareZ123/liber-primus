# p50 9×28 quotient as a chapter-key schedule: bounded original-cipher gate

**Agent 28, 13 November 2026. Classification: bounded negative; no unknown LP2 plaintext, authentic key, cipher mechanism, or destination recovered.**

## Why this candidate was worth one test

The original 32×8 p50 numeric table contains 256 base-60 byte values. Reducing those values modulo 29 and dividing their high-to-low coefficient vector by

\[
F(X)=X^4+28X^3+13X^2+9X+14
\]

gives an exact 252-symbol quotient with zero remainder. The existing source-factor study constructs \(F\) from the signed-2013 BASE29 factor and the original p39 red-triad factor; it does **not** establish how the quotient should be consumed.

Independently, the original-image chapter map identifies nine top-level unknown chapters:

| Chapter | Original pages | Runes |
|---:|---|---:|
| 1 | p0–2 | 729 |
| 2 | p3–7 | 1,145 |
| 3 | p8–14 | 1,729 |
| 4 | p15–22 | 1,903 |
| 5 | p23–26 | 1,021 |
| 6 | p27–32 | 1,433 |
| 7 | p33–39 | 1,680 |
| 8 | p40–53 | 3,008 |
| 9 | p54–55 | 308 |

Gematria Primus has 29 symbols, of which 28 are nonzero. Thus \(252=9\times28\) suggests one 28-symbol row per visible chapter. The hypothesis tested here is a repeating additive key: row \(s\) is applied to chapter \(s\), starting at key phase zero and resetting at the visible chapter boundary.

**Strongest objection:** the factorization \(252=9\times28\) is a numerical alignment, not a Cicada instruction. The visual chapter map establishes reading boundaries, not cipher resets. No original source selects a Vigenère-like additive operation.

## Frozen original-input test

- Input: the 256 original table bytes in printed row-major order, SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.
- Coefficients: each byte reduced modulo 29.
- Polynomial: \(F=[1,28,13,9,14]\), high-to-low.
- Division: exact, quotient length 252, all four remainder coefficients zero.
- Key layout: quotient in coefficient order, reshaped row-major into nine rows of 28.
- The nine key rows have only **16, 19, 21, 16, 19, 16, 18, 17, and 22 distinct values**. Therefore they are not nine 28-symbol substitution permutations.
- Ciphertext: all 12,956 original unknown runes in pages 0–55, partitioned by the nine original-image chapter groups above.

Four direct reversible candidates were fixed:

1. GP29 subtraction, all symbols consume a key symbol.
2. GP29 addition, all symbols consume a key symbol.
3. Preserve zero-valued F as a null; shift the other 28 symbols modulo 28, with F consuming no key symbol; subtract.
4. The same F-null model with addition.

Each chapter starts with its own corresponding row at phase zero. No key offset, row reversal, transposition, arbitrary phase, word reset, or key search was permitted. In the F-null interpretation, the nonzero alphabet is mapped to 0–27 for the shift and mapped back to 1–28, so the model remains bijective and F remains unchanged.

Scoring uses the repository's pinned Duko Round27 English quadgram counts, 79,495 entries and 7,266,795 total observations. Quadgrams are scored within each chapter; no artificial n-grams cross chapter boundaries. Higher (less negative) scores are more English-like. The authentic solved p57 text is the positive language control.

## Original-cipher results

| Original or fixed inverse | Pooled GP29 IoC | Legacy inventory-label Duko quadgram score |
|---|---:|---:|
| Raw original ciphertext | 0.03447840 | **−7.43913779** |
| GP29 subtraction | 0.03446895 | −7.51783823 |
| GP29 addition | 0.03446005 | −7.51020954 |
| F-null / GP28 subtraction | 0.03444835 | −7.51704657 |
| F-null / GP28 addition | 0.03447207 | −7.51420020 |
| Solved p57 PARABLE (95 runes) | 0.06270997 | **−4.42063342** |

Under the legacy Duko score all four fixed candidates score worse than unchanged ciphertext. Their per-chapter scores remain ciphertext-like; no chapter yields a coherent passage. The legacy GP29-subtraction output begins:

SNYSJNEONTHNIALROECSEANIAAEHOIAAEMEONEOSDLOEYLDCOEOEJWTFNGOELEEAXWEBPSOESUEEAHYJMFOEOEOOEFLBSDUGALGFEAFOEUDIAAENOEXEAEJNHBLUDIRUPWPJBIREOEAMEGUOEPEOXTHTLYXJEOAEEOOEGEOIAPYMSORGMSCF

The SFT also performs 36 planted positive round trips: every one of the nine key rows, both signs, and both reversible alphabet models correctly encrypts and decrypts authentic solved p57 plaintext. Each original candidate inverse is independently forward-replayed to the exact original 12,956-rune ciphertext.

## Direct quotient-as-plaintext check

The quotient's natural high-to-low GP29 symbol order was tested as a standalone 252-rune plaintext, without rearrangement. Under the legacy Duko model it has IoC **0.03633087** and mean score **−7.50897543**, worse than the original unresolved stream (**−7.43913779**) and far below solved p57 (**−4.42063342**). Its literal legacy transliteration begins FEANGBAISLPBLUUNGLYLPYAGRPEAAHEOUAELEANGAAEEOXSUIWOISMTHIASIAHGNPTHNDIAYLGYNGNRAEAWCHCJYHAEFLUBOETHPPUCJJMCSYRTINRIALXJNGLGSLECCCUIAXCEARDOEBAEMFLLEOLREOHIAAEPRINDEUIAACFAEWAEHTHSUNWIAUJNSPEOWCBEOIYNJTHEONHEOFMCYEAGHAEETHICREAESPTHAHXEHIYNOEDGILDUUXWTNCAHNGLJLNCCBXYNGHWIAEAIEJLJITTHWNGPFNGSDEOOEJPADNCAEMX. This is not readable plaintext.

## Source-native orthography recalibration

The independent source-orthography result establishes the single-rune spellings ᛝ→ING and ᛡ→IO. The shared source-native LP1 trigram model is trained on **3,510** symbols (training score **−2.26072801**) and scores solved p57 at **−2.46814471**. It scores the unchanged unknown LP2 at **−3.41753406** and the 252-symbol quotient at **−3.42485081**.

| Fixed 9×28 interpretation | Source-native LP1 trigram score |
|---|---:|
| Raw unknown LP2 | −3.41753406 |
| GP29 subtraction | −3.41371486 |
| GP29 addition | −3.41577532 |
| F-null / GP28 subtraction | −3.41846438 |
| F-null / GP28 addition | −3.41637007 |
| Direct 252-symbol quotient | −3.42485081 |
| Solved p57 PARABLE | −2.46814471 |

The source-native model therefore gives two very small positive shifts (GP29 subtraction improves by **0.00381921**; F-null addition by **0.00116399**) rather than the uniform legacy-model decrease. Neither approaches the solved p57 control or forms a readable chapter. The source-native spelling of the GP29-subtraction output begins:

SNYSJNEONTHNIOLROECSEANIOAEHOIOAEMEONEOSDLOEYLDCOEOEJWTFINGOELEEAXWEBPSOESUEEAHYJMFOEOEOOEFLBSDUGALGFEAFOEUDIOAENOEXEAEJNHBLUDIRUPWPJBIREOEAMEGUOEPEOXTHTLYXJEOAEEOOEGEOIOPYMSORGMSCFLAINGDEAEEWEYPCOELMYRHNACFMINGBERPJIGTE

This remains ciphertext-like. The direct quotient remains worse than raw under both scoring conventions.

## Decision

Retire precisely the direct row-major 9×28 repeating additive-key schedule, with chapter resets, under both full-GP29 and F-null/GP28 interpretations. The direct row-as-substitution-permutation interpretation is separately excluded by the repeated values in every row.

This does **not** invalidate the exact p50 polynomial relationship, prove the quotient meaningless, or exclude a source-selected non-additive/stateful use. The nine visual chapters are reading structure, not demonstrated cryptographic resets. Do not continue with offsets, alternate row layouts, or fitted key phases to rescue this hypothesis. A successor needs an independent original clue that selects a different operation or key consumer.

**Reproduction:** \`sims/lp2_p50_9x28_chapter_key_sft.cjs\`. The script asserts original table bytes, polynomial division, original chapter boundaries, all four inverses, exact forward replay, the pinned language model, and planted positive controls. No change to \`results/README.md\` is warranted because this bounded negative does not alter an established decryption or the overall solution status.

## Existing source anchors

- \`im-results/p50-gf29-pre2014-exact-encoder-fingerprint-gate.md\` — source-linked polynomial factors and exact quotient context.
- \`im-results/lp2-global-original-visual-section-map.md\` — original-image chapter groups and their limits.
- \`resources/liber-primus/base60-grid.json\` and \`resources/liber-primus/lp2-corpus.json\` — original-derived table and rune inputs.
- \`resources/control/duko_round27_english_quadgrams.txt\` — pinned language-scoring data.
