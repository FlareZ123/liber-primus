# Nine visually marked LP2 chapters: exact all-secret predecessor-difference ceiling

**Agent 6, 14 November 2026. Evidence class:** source-exact algebraic necessary condition, plus two original/known-language implementation controls. **No recovered unsolved LP2 plaintext, authenticated key, cipher instruction or puzzle destination.**

## Why this question matters

The original 12,956 GP29 ciphertext runes on physical LP2 pp0–55 have only **86 equal-adjacent-rune events**, a strong anti-repeat phenomenon spanning the original word boundaries. A parsimonious cipher may replace each **predecessor difference** with a plaintext rune under a hidden substitution alphabet. The original nine visibly red-headed chapters would give a human solver a reason to suspect that the alphabet changes at chapter boundaries. The 252-slot original table quotient is also exactly **9×28**, making one key/lookup per chapter a source-proposed possibility, albeit an unauthenticated one.

This experiment removes **all** unknown substitution keys, even their original numerical values. It allows a completely arbitrary independent **29! GP29 bijection in each chapter**. It tests a stationary *difference-to-plaintext lookup* within each chapter, not the already tested **time-varying 28-symbol Vigenère shift** from the quotient rows. There is no author-attributed instruction choosing either architecture.

## A complete key-independent original-input bound

Concatenate the unchanged original ciphertext in physical page order, with original chapter ranges pp0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55, rune lengths respectively **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**. Let `C[-1]=0` and `D[i]=(C[i]-C[i-1]) mod29`, carrying the previous ciphertext rune continuously across printed words/pages/chapter transitions. The starting convention affects only one original rune.

For chapter `j`, the unknown plaintext symbol is `P[i]=s_j(D[i])` under any of the `29!` bijections `s_j`. Each bijection **only permutes its chapter's 29 difference-frequency counts**. The largest frequency in each original chapter is

`[38,55,78,87,47,65,82,123,20]`.

Therefore, even with all nine secret alphabets chosen adversarially to maximize a chosen output rune, that plaintext rune appears **at most 595/12,956 = 4.5925%**. The original differences have exactly 86 zeroes, including continuous cross-page handling.

Stronger: to maximize the **pooled GP29 index of coincidence**, sort each chapter's 29 difference-frequency bins descending, align the largest bins across chapters, and sum by rank. By the **rearrangement inequality**, this arrangement maximizes every pairwise cross-chapter dot product simultaneously. Consequently it is the exact global optimum over **all (29!)⁹ bijective secret alphabets**, without approximation or search. The resulting canonical pooled count vector is

`[595,568,545,537,528,519,514,506,499,488,482,478,468,462,457,452,446,437,428,424,417,414,398,388,375,369,347,329,86]`.

Its maximum GP29 IoC is exactly (from the integer pair counts) **0.03593165550736161** (normalized ×29 **1.0420180097**); by majorization and Schur-concavity the **minimum** achievable symbol entropy is **4.818234879512238 bits per rune**. The explicit maximizing secret bijections produce this count vector and round-trip **all 12,956 original ciphertext runes exactly**; the bound is achievable, not an approximate pessimistic estimate.

## Independent ordinary-GP controls and falsifiable scope

The native canonical-GP rendition of the **first 12,956 GP runes** of repository-pinned Shakespeare (uppercase, K/Q→C, V→U, Z→S, longest-match canonical transliteration) has observed IoC **0.059500713098479326** and 1,450 occurrences of GP E. A genuine **95-rune clear p57** GP sample has IoC **0.06270996640537514**. Both are beyond the exact **0.03593** IoC ceiling regardless of the hidden chapter-static alphabet. This is a substantial necessary-condition mismatch for ordinary English-like **native GP29 plaintext**. These two references do not prove a universal threshold for every literary register or deliberately balanced prose.

A native-Shakespeare-shaped **12,956-rune planted plaintext** is encrypted with nine genuinely distinct, invertible secret affine GF29 alphabets on the predecessor differences, respecting precisely the original nine chapter lengths. The fixed inversion recovers **all 12,956 plaintext symbols**, preserving its native IoC. Thus the original contradiction is not caused by the model's inability to represent English or by a wrong encoder.

## Research decision

A **chapter-static fixed secret substitution of continuous predecessor differences**, however its nine independent 29-symbol alphabets are selected, cannot yield an entire ordinary GP-native plaintext book with the observed solved/independent-English frequency concentration. In particular, simply interpreting a single chapter key as a secret 29-symbol **lookup alphabet** is insufficient. This mathematical exclusion **does not cover** the earlier Q252 28-symbol rotating period within chapters (position dependent), arbitrary varying alphabets inside chapters, stateful entropy decoding, word-boundary changes, transposition, compressed/binary plaintext, a different output register, or source-derived high-entropy one-time keys. It does not establish that the author used a delta cipher at all.

Unlike postselected language-optimized key searches, this finite bound closes its exact model without tuning a cipher on unknown plaintext. Prior related studies already reject a *single* stationary differential substitution via a frequency bound and reject several time-varying differential families using native GP control entropy; the nine-original-chapter algebraic **joint optimum** here is the incremental result. Do not launch a 29!⁹ search or claim recovered keys from the explicit optimizers. The remaining causal bottleneck is a source-authenticated, time-dependent decipherment operation.

**Reproduce:** [read-only original-source Windows/Node22 SFT](../sims/lp2_ninechapter_delta_allsecret_bound_sft.cjs). Inputs: unchanged [GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [pinned English control](../resources/control/shakespeare_first300k.txt). The existing Agent6 manually dispatched workflow has an isolated `chapter-delta` route.
