# Signed-2016 GP29 cube: complete orbit-preservation gate on the unknown book

**Agent 15, 23 November 2026. Classification: source-derived algebraic exclusion of an entire key family, conditional on ordinary GP-native English and unchanged rune inventory.** All 56 unknown LP2 physical pages p0–55 remain undeciphered. This study recovers no new plaintext, key, or destination. It identifies precisely why applying the independently reconstructed **2016 signed-message cube** alone, even with unlimited secret rounds and arbitrary rune-order changes, cannot be the decoder of the entire unknown book.

## Source-selected operation and necessary consequence

The authenticated 2016 words yield the source-word-number operation `Q(x)=x³ mod29`, via `LIES=3` and `DIRECTION=29`, documented in [the earlier source/operator derivation](lp2-signed2016-wordnumber-cube-operator.md). The inference was historically postselected after a proposed p28 local READOUT route and does **not** prove the 2014 manuscript actually uses Q. The strongest rival is an ordinary GP29 alphabet chosen for another purpose, with the cube relevant to only one local clue or absent entirely.

Over the **original canonical GP ordinal labels 0..28**, Q decomposes into eight mutually inaccessible cycles:

| Cycle | Runes in exact iteration order | Size |
| --- | --- | ---: |
| 0 | F | 1 |
| 1 | U | 1 |
| 2 | TH / H / M / S / J / Y | 6 |
| 3 | O / IA / NG / I / X / E | 6 |
| 4 | R / G / P / OE / C / N | 6 |
| 5 | W / A / L / AE / D / T | 6 |
| 6 | EO / B | 2 |
| 7 | EA | 1 |

For **any** secret per-position integer clock `k_i`, `Q^(k_i)(x)` stays in the cycle containing `x`. More generally **any independently secret per-position permutation restricted to these same cycles** preserves the cycle identity of each individual rune. Permuting the resulting rune positions in any order preserves the eight total cycle counts as a multiset of categories, too. Thus no secret exponent stream, number of cube rounds, key period, local reset, word shuffle, page permutation, or within-cycle substitution can change this exact vector.

For a candidate ordinary plaintext with eight cycle counts `P_0...P_7` and the original ciphertext counts `C_0...C_7`, any extra **orbit-changing** operation must move at least

`M(P,C) = ½ × Σ_{j=0}^7 |P_j − C_j|`

runes across cycles, regardless of how the within-cycle keys and all rune positions are chosen. This is a sharp transport lower bound if arbitrary cross-cycle replacements are granted; an actual cipher must do at least that much, and potentially more. It is not a lower bound on a numerical key length.

## Original 12,956-symbol register and independent controls

Exact unmodified source `resources/liber-primus/lp2-corpus.json`: all 56 physical pages p0–55, 55 with rune text and one number-only page p50, **12,956** original ciphertext GP29 indices. The eight cycle counts are:

`[458, 450, 2637, 2750, 2688, 2669, 844, 460]`

Notice that the source's **EO/B** two-cycle has **844** runes and fixed **EA** has **460**. These values are features of the original ciphertext without a plaintext assumption.

For independent ordinary-English GP-native comparators, encode the pinned **Gibran Prophet** and **Shakespeare first300k** reference texts with the established historical spelling convention (QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA), tokenize the seven two-letter GP rune labels greedily, and search **every contiguous** 12,956-rune reference window. For each window, calculate its exact eight-cycle count vector and the transport minimum above; choose the **most permissive** window separately for each corpus.

| Reference corpus | Native GP source runes | Complete exact-length windows | Smallest mandatory cross-cycle changes | Best window start (0-based GP rune) |
| --- | ---: | ---: | ---: | ---: |
| Gibran | 61,918 | **48,963** | **1,247** | 16,691 |
| Shakespeare | 215,146 | **202,191** | **1,213** | 149,402 |

The best Gibran count vector is `[391,693,2628,3325,2385,3098,210,226]`; the best Shakespeare vector is `[272,574,2583,3454,2604,3054,260,155]`. Even the closest original-length Shakespeare candidate requires changes to **1,213 of 12,956** original rune cycle memberships, **9.36%**, beyond all pure-cube secret-key freedom.

### Local nine-chapter exclusion, allowing different secret cube schedules

Even a different hidden Q-exponent/permutation key on **every visually marked original chapter** cannot fix this orbit-total mismatch. Segment the unmodified source at its nine printed chapter starts 0,3,8,15,23,27,33,40,54 and independently compare **every** source-length GP-English window for each chapter. The following are the smallest necessary number of orbit-changing runes for any tested matched native-English window; the Gibran/Shakespeare search is restarted at every chapter, giving this hypothesis maximal freedom to select unrelated texts.

| Physical chapter | Original runes | Gibran minimum changes | Shakespeare minimum changes |
| --- | ---: | ---: | ---: |
| p0–2 | 729 | 60 | 54 |
| p3–7 | 1,145 | 102 | 88 |
| p8–14 | 1,729 | 138 | 125 |
| p15–22 | 1,903 | 159 | 139 |
| p23–26 | 1,021 | 67 | 67 |
| p27–32 | 1,433 | 115 | 113 |
| p33–39 | 1,680 | 124 | 108 |
| p40–53 | 3,008 | 246 | 253 |
| p54–55 | 308 | 16 | 12 |

All **nine** chapters individually require rune movement across Q's fixed orbit partition, from at least 12 changes in the shortest p54–55 chapter to at least 246 changes on p40–53 under these pinned reference corpora. Thus the full-book exclusion is not an artifact of forcing a common cube key across stylistically different chapters; the cube-only step cannot by itself decode a complete natural English chapter in any of the nine observed sections. This does not logically rule out Q-only decipherment of a shorter isolated word or non-English intermediate code.

A simpler independent necessary-condition check reaches the same direction: across all native GP original-length windows, EO/B appears **193–281** times in Gibran or **214–322** times in Shakespeare versus **844** original; native EA occurs **81–245** (Gibran) or **95–189** (Shakespeare) versus **460** original. Both signatures are categorically unchanged by any power of Q.

As manuscript-native reference, genuinely clear physical p57 has 95 source runes with orbit counts **[3,6,14,28,23,20,1,0]**. Seven separately selected solved LP1 prose sections, encoded into native GP with the same documented spelling rules, provide 2,357 runes; their cycle 0/1/6/7 counts are **39/123/31/23**. These controls are comparatively short; neither is the statistical reference for the full 12,956-rune exclusion.

## Positive, scope, and research fork

The [standalone CommonJS SFT](../sims/lp2_signed_cube_orbit_allkey_sft.cjs) asserts exact source and cycle counts, performs all **251,154** contiguous reference-window comparisons, and asserts these nine independent original chapter bounds, and tests a full-length native GP Gibran positive under positionwise independently varying Q exponents `(7i+3) mod6`. This planted cipher decodes exactly **12,956/12,956**, and reversing all its rune positions retains the same eight cycle counts. It uses no historical secret key.

**Decision:** retire *orbit-preserving-only* readings of the signed-2016 cube as a full-book ordinary-GP-English decoder, including secret exponent schedules, repeated Q layers, arbitrary within-orbit substitution and any pure post-cube rune permutation. This covers all possible hidden keys **within the stated architecture** rather than another brute-force shortlist. The original may encode a non-English/nontext register, an uncontracted alphabet, or a binary intermediate representation; those alternatives are not excluded.

**Most useful next causal decision:** any alleged p28→p51/p0 cube-based solution must specify from an independently visible author clue the **orbit-changing operation** (for example, an additive mixing step, an alternate alphabet conversion, or a plaintext-register change), its placement relative to cubing, and a full-page original-source decipherment. A new cube exponent/period/orbit order alone is mathematically incapable of solving the book. No additional unconstrained cube-only key search is warranted.

Reproduce with `node sims/lp2_signed_cube_orbit_allkey_sft.cjs` on the pinned repository. The script reads source files only and passed on Windows Node.js 22 with every original count, all rolling reference windows and native plaintext controls asserted: [Windows chapter-extended PASS 45157050413](https://github.com/FlareZ123/liber-primus/actions/runs/45157050413).
