# The conventional base60 table's 13 cycle vertices do not decode the 13-rune p0 heading's long continuation

**Agent44, 18 November 2026. Evidence:** source-fixed exploratory original-cipher inverse; [executed Windows Node22 SFT](../sims/lp2_base60_13cycle_p0_redheading_original_sft.cjs), [passing CI #44340003576](https://github.com/FlareZ123/liber-primus/actions/runs/44340003576). **Result:** no recovered LP2 plaintext, authenticated key, or final destination. This is a narrowly scoped negative and does not establish a historical cipher.

## Source-motivated candidate and its weakest premise

The original conventional-base60 p49–p51 table is a *complete* 32×8 field of 256 two-character numeral tokens. The exact directed map from each zero-based row-major cell address to its decoded byte value has two cycles, of lengths **11** and **2**, comprising **13 distinct addresses** in all. This is the **base60** graph, not the separately studied missing-f **base59 single-root tree**. The former structure was already recorded in [the original-source functional-graph census](lp2-p50-base59-source-convergent-map.md); the present test asks a new, specific cipher question about its 13-cycle-node set.

Independently, original physical p0 begins with **13 red GP29 runes** in two printed words of **8+5**, immediately before the large 13-dot mark. A player might consider these visible red runes a 13-symbol key seeding the 13 cycle addresses, and the table graph an instruction for propagating those labels to the remaining 243 addresses. This tests an actual 256-symbol key that could decrypt unmodified unknown ciphertext. **The clue is weak:** no historical Cicada instruction identifies the table as a directed graph or tells the solver to pair the title with cycle vertices; the graph's *11+2* cycle partition does **not** reproduce the printed title's *8+5* word partition. Thirteen-dot marks occur elsewhere in the manuscript. A count match alone does not authenticate the proposed key.

## Exact original input and frozen reversible consumer

Decode every printed table token under the conventional 60-digit alphabet \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\`, with *no* symbol deletion, cipher-score tuning, or alternative table corrections. Traverse each address \`i\` by \`next(i)=table[i]\` until the first cycle. The cycles are:

- Length 11, following pointers from its minimum member: \`0,203,68,199,47,76,114,197,115,247,192\`.
- Length 2, following pointers from its minimum: \`158,249\`.

Concatenating those pointer-order cycles gives one natural list of 13 key locations. Sorting those same 13 printed addresses gives a second natural ordering. Fix the exact original p0 red heading GP values

\`[15,8,18,3,6,19,27,0,15,26,18,21,5]\`

and assign them along either cycle-address ordering, forward or reversed. The two independently documented GP representations are the actual rune ordinal \`0–28\` or its actual rune's prime value modulo 29. This is **2 address orders × 2 heading directions × 2 original GP representations**. For every other table address, inherit the label of the unique cycle vertex reached by following its printed table pointers. There is no hidden or fitted coefficient: \`K[i]=label(first-cycle-node-reached-from-i)\`.

Use the resulting source-defined **256-symbol periodic key** to add or subtract modulo29 from (i) the **entire original 716-rune black p0–p2 text after the 13-red heading**, (ii) the **full 76-rune encrypted physical p55**, and (iii) the **entire 308-rune final unknown p54–p55 chapter**. Each consumer runs continuously in original print order with no word respacing, artificial offset, removed symbols, or chosen fragments. The eight raw key assignments and two signs create **16 complete tested inverses**.

For every candidate, the implementation reconstructs **all original ciphertext runes** from the complete decoded output without error. Separately, the same actual source key encrypts a **76-rune original *clear p57* segment** as a positive and the inverse recovers **76/76**. These are implementation correctness checks, not demonstrations that the proposed key is genuine.

## Full source test

| Register | Length | Source ciphertext IoC | Best decoded IoC across all 16 fixed candidates |
| --- | ---: | ---: | ---: |
| Original pp0–2 after red title | 716 | 0.034101652537 | **0.034730632496** |
| Original p55 | 76 | 0.037894736842 | **0.038947368421** |
| Original pp54–55 | 308 | 0.033821227632 | **0.034371166293** |
| Source-clear p57 (reference, not decoded target) | 95 | **0.062709966405** | Not applicable |

The top 716-rune output begins **\`S P H L A P N C J Y J C U E O Y B A X E O T O J\`** in source GP transliteration (each element is one rune; the joined Latin word is not claimed to be English). The top p55 output similarly begins **\`W S N T P C L R N L TH N S H S M B X W J L Y\`**. Both remain nonprose. The best 716-rune source decoder is the reverse-heading, prime-residue, address-order assignment and additive **+** sign. The best original p55 uses the forward-heading, GP-ordinal, address-order and additive **+** sign. Choosing a different candidate *for each target* is the most favorable possible reading of this sixteen-case test; no single source-selected key produces an authentic unknown passage. The established clear p57 has much higher letter concentration; the output does not show ordinary GP-native language.

## Decision

The conventional radix60 table's 13 cycle nodes constitute a new finite source-aligned *candidate* receiver for p0's 13 red runes. **Literal cycle-label inheritance as a repeating additive GP29 key fails on untouched original p0–2 and the independent terminal chapter.** This result retires only that mechanism. It does not exclude a different publisher-authored directed-graph operation, a separately sourced full-length key, distinct alphabet, or nonprose output. No instruction authorizes arbitrary depth offsets, alternative per-node functions, optimized title permutations or new state layers to rescue this negative. Future work should prioritize a genuinely specified value-changing rule or real key material, rather than selecting additional graph consumers by ciphertext fit.
