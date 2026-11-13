# Source-motivated 13-phase GP28 predecessor-exclusion: exact all-secret single-rune obstruction

**Agent16, 13 November 2026. Classification: bounded original-cipher exclusion, no LP2 decryption.** The source-observable 29-symbol Gematria Primus alphabet, LP2's 86 same-rune adjacent transitions, and the 13-dot red manuscript markers suggest a candidate two-step encoder: remove the preceding ciphertext symbol from the ordered 29-symbol inventory, encode the next symbol as one of 28 ranks, and then apply a repeating 13-phase cipher/permutation. The original manuscript **does not instruct this combination**, so the result is a decision on one hypothesis rather than identification of the authors' mechanism.

## Exact family and all-secret decision

Each within-page original ciphertext pair \(s,c\) with \(s\ne c\) is assigned its predecessor-exclusion rank \(r=\operatorname{pos}_\pi(c)-[\operatorname{pos}_\pi(s)<\operatorname{pos}_\pi(c)]\), where \(\pi\) is **any secret permutation of the 29 rune identities**. Each of the 13 clock phases may have its **own independent secret ordering and its own secret 28-way output-symbol permutation**, a stronger adversarial allowance than an ordinary 13-step additive Vigenère key. The same 13 keyed phase rules are reused over the book; a different unrelated key for every chapter/page is **outside this test**.

Clock resets: book-continuous, physical-page, or visual-chapter (0,3,8,15,23,27,33,40,54). In each clock, either every actual ciphertext rune advances the clock or only valid nonrepeat successor events advance it. First runes on each of 55 rune-bearing physical pages, and 86 equal-successor pairs, are **completely unconstrained**, with no assumptions about their escape or side channel. All **141 exceptional positions** may be freely set to whichever plaintext rune most benefits the attacker.

For an original weighted transition matrix \(T[s,c]\) restricted to one phase, the **attainable exact maximum** occurrences of any one decoded output rank under *all* secret GP29 orderings is

\[
M(T)=\max_{a<b}\left(T[a,b]+T[b,a]+\sum_{s\ne a,b}\max(T[s,a],T[s,b])\right).
\]

The rank is defined by adjacent alphabet endpoints \(a,b\). Every other predecessor may sit before \(a\) or after \(b\); the optimum of its two contributions is independent of other predecessor placements, so the maximum is actually attained. The reproducer constructs a maximizing permutation and checks occupancy, and independently verifies the formula by exhaustive weighted \(q=4,5,6\) permutation oracles. This theorem reuses the established Agent34 one-rank proof but applies it to **13 *separately changing* secret alphabet orders**. The earlier page-static theorem does not cover changing alphabets by phase.

Each clock partitions the unchanged **12,815** nonrepeat transitions into 13 matrices. The 141 free positions are added *after* optimizing **every phase independently**, giving an intentionally generous single-plaintext-rune bound.

| Phase clock | Advance on every source rune | Advance on nonrepeat events only |
| --- | ---: | ---: |
| Continuous original book | **1,021** | **1,010** |
| Reset at each physical page | **1,035** | **1,019** |
| Reset at each visually marked chapter | **1,016** | **1,011** |

Across all six, the absolute most favorable decoded single rune can appear at **at most 1,035/12,956** positions. The exact phase maxima and maximizing alphabet pairs are printed by the SFT.

## Source-calibrated English adversary

An independently established solved-LP1 orthography uses single GP symbols for **ING** and **IO**. The SFT reconstructs selected literal LP1 words and all **95 source GP runes of independently solved LP2 p57** before examining outside controls. It then scans **every** full **12,956-rune** window of three independent English prose inputs, in both inventory-label GP spelling and source-calibrated GP spelling. It needs only the E rune index18, which is unaffected by the ING/IO override, though source normalization shifts window boundaries.

| Source | Minimum E in any full-length legacy GP window | Minimum E in any source-calibrated GP window |
| --- | ---: | ---: |
| Gibran | **1,407** (50,159 windows) | **1,416** (49,537 windows) |
| Shakespeare | **1,397** (205,845 windows) | **1,408** (204,151 windows) |
| Emerson | **1,482** (311,675 windows) | **1,491** (308,372 windows) |

Even the weakest checked prose window contains **at least 362 more E runes than the exact most generous cipher-family maximum** (1,397−1,035). There are **1,129,739** separately evaluated full-length source windows in total across both spellings. Thus no member of this 13-phase predecessor-exclusion/secret-output-alphabet family produces *any* of these native-English control windows from the original LP2 ciphertext, despite entirely arbitrary secret order and 13 symbol relabelings and 141 free rune positions. A positive 500-rune secret-order/secret-13-key plant reverses every rune.

This is **not a universal exclusion of every natural language**, arbitrary plaintext, a cipher with a differently keyed phase at each page, or a clock affected by some independent unknown side channel. The original symbols may represent an intermediate cryptographic register rather than GP-native prose. More importantly, this does **not recover one previously unknown LP2 rune, an authentic key, or an intended next destination**.

## Research decision

Retire the direct historical-looking **13-phase predecessor-exclusion + rank-alphabet** model with one shared 13-stage key and any of the six frozen source clocks. Do **not** optimize arbitrary phase offsets or substitute unrelated 13-key families to rescue this failure. A distinct historical instruction that specifies a *new state transition* or key-reset rule is required before deeper testing. The exact source and verified finite negative are retained in [the standalone CJS reproducer](../sims/lp2_rank28_period13_allsecret_capacity_sft.cjs).

Original source: [canonical physical LP2 ciphertext](../resources/liber-primus/lp2-corpus.json), [source LP1 orthography controls](../results/lp1-source-orthography.md), [prior all-secret rank theorem](lp2-no-repeat-allorder-page-capacity.md).
