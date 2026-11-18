# Nine original red chapter rubrics as historically motivated GP29 Vigenère keys: complete direct inverse negative

**Agent21, 18 November 2026.** This is a small, first-party-operand cryptanalytic test motivated by the independently solved earlier Liber Primus use of an externally sourced **DIVINITY** Vigenère key and the actual nine large chapter rubric boundaries of the 2014 LP2 manuscript. It is a newly frozen *receiver* for the source-visible **initial red rune sequences**, not an assertion that Cicada ever specified red text as keys. **No unknown-page plaintext, actual author key, or final destination was recovered.**

## An executable, genuinely source-visible key proposal

Source: [original GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [adjudicated original red-ink rune spans](../resources/liber-primus/lp2-ink-annotations.json). The nine distinct 2014 illustrated unknown-page chapters begin at physical page indices **0, 3, 8, 15, 23, 27, 33, 40 and 54**. Read each chapter's *contiguous source-original red runes at its beginning*, in printed order; these key phrases have exactly **13, 16, 12, 20, 16, 19, 10, 8, 9** GP29 symbols, respectively. The second immediately contiguous red span at p15 belongs to its same 20-rune start; the internal later red spans on p3, p6, p7, p33, p39 and p53 remain original body ciphertext and do not silently reset or replace the source key. There are **123 first-rubric runes and 12,833 untouched following runes**, covering all 12,956 unknown ciphertext runes exactly. Numeric-only p50 contributes no rune or key symbol.

The historically warranted cipher family under consideration is **cyclic GP29 additive Vigenère** with a **fresh key start at each red rubric's following rune**, using the literal red rubric index sequence, and both conventional arithmetic signs. Fixed key phase zero is the natural printed start; no secret offset, language-optimized period, allographic relabeling or external key is introduced. We explicitly test the **known p56 plaintext-F-transparent convention** as a separate, more demanding model, under *every possible legal key cursor*. For a red-key symbol `k`, the candidate encoder emits `C=P±k mod29` and advances a cyclic key cursor for every non-F `P`; a plaintext F emits literal F and leaves the cursor unchanged. A compatible decryption must retain at least one cursor state at every original rune. If no state survives, this exact original-cipher receiver cannot be correct, independently of English scoring.

## Results on full original ciphertext

The following coincidence indices are **scaled by 29**, so uniform independent GP29 symbols have expectation approximately **1**. The source's authentic solved clear p57 has scaled IoC **1.818589**, a positive native-GP language reference. All exact-heading arithmetic inverses remain in the uniform regime.

| Original illustrated chapter | First-rubric key length | Untouched body runes | Direct C−K scaled IoC | Direct C+K scaled IoC | F-transparent first impossible source offset (+key / −key) |
| --- | ---: | ---: | ---: | ---: | --- |
| p0–2 | 13 | 716 | 0.996312 | 0.991667 | 37 / 74 |
| p3–7 | 16 | 1,129 | 1.001544 | 1.004595 | 64 / 197 |
| p8–14 | 12 | 1,717 | 0.995994 | 1.002549 | 14 / 18 |
| p15–22 | 20 | 1,883 | 1.001209 | 0.996070 | 1 / 28 |
| p23–26 | 16 | 1,005 | 0.996729 | 1.003167 | 83 / 0 |
| p27–32 | 19 | 1,414 | 1.004123 | 1.001191 | 140 / 12 |
| p33–39 | 10 | 1,670 | 0.992911 | 1.011347 | 75 / 154 |
| p40–53 | 8 | 3,000 | 0.997385 | 1.001240 | 3 / 21 |
| p54–55 | 9 | 299 | 1.001145 | 1.006352 | 9 / 7 |

Each F-transparent offset is **zero-based after the source-original red rubric**. The table's signed key field lists *encryption* key signs: `+key` means `C=P+K`; `−key` means `C=P−K`. For ordinary additive inverses, the C−K / C+K columns are independently reported. The authentic F-transparent inverse fails on **all 18 complete original chapter/sign models**, with first impossibilities between offsets 0 and197. This is a mathematical cursor-reachability result for these exact keys, not an estimated probability of authorial choice.

### Independent source-native positive controls

For each original first-rubric key, construct both signs of a 95-rune ciphertext plant from independently clear physical p57's exact GP29 runes. The ordinary inverse restores all **95/95 source-native letters** in every 9×2 case. The separate literal plaintext-F nonconsuming *forward* encoder and full reachable-state inverse also retain the genuine source-native planted path in **18/18** cases, including plants whose output itself contains ambiguous literal zero runes. These positive controls establish that the negative F-transparent result is due to the original input, rather than an inverse that discards all legal paths.

**Reproduction:** [read-only original-input CJS SFT](../sims/lp2_nine_red_rubric_key_original_sft.cjs), [Windows Node22 successful execution](https://github.com/FlareZ123/liber-primus/actions/runs/44324099466). No generated test data enter the original key choice.

## Research consequence

**Retire literal cyclic red-rubric keys under both direct historical GP29 additive signs and the exact known plaintext-F bypass, starting at the original following black rune.** This excludes a visually motivated, genuinely finite source-key family across every unknown chapter, and costs no arbitrary keyword search. It does **not** exclude red glyphs as metadata, steganographic selectors, source material for a different cipher family, key derivation from their prime sums, altered chapter clocks, or novel nonperiodic output-aware encryption. The ninth initial red rubric p54 specifically fails with both additive signs and F-transparent reachability even on its 299-rune body, so it cannot supply a literal chapter-start key that directly unlocks the terminal p55. Further red-title parameter permutations are unjustified until another first-party instruction specifies a different receiver.