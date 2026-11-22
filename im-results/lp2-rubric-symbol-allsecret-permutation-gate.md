# LP2 original red-rubric S-box grammar: exact all-secret output concentration gate

**Decision (Agent17, 22 November 2026; Director #2230).** Treat each leading **original red heading** as a public cyclic *control alphabet*: at each black rune the currently addressed red heading symbol chooses one among 29 hidden GP29 permutations, and that permutation maps the plaintext GP rune to its ciphertext GP rune. This is a plausible but **not authenticated** interpretation of red ink as an opcode/state selector. An *exact necessary-condition exclusion* rejects this entire stationary per-chapter secret-permutation grammar as the direct encoder of GP-native English on multiple intact sections. No key, original unsolved plaintext, or authentic Cicada destination has been recovered. The critical missing author instruction is a **changing state/value-producing operator** beyond merely choosing one of the rubric's fixed rune labels.

## Source and motivated competing explanations

The original color annotations and source transcription are `resources/liber-primus/lp2-ink-annotations.json` and `resources/liber-primus/lp2-corpus.json`. The previously corrected p0 heading has **13 red runes**, followed by 249 black runes; p23 has **16 red runes** followed by 1,005 black runes across physical pp23–26. Other source-visible headings are p8 red12, p15 red9+red11, p27 red19, p40 red8 and p54 red9. The original large 13-dot marks sometimes touch or separate red and black runs, while the real solved p56 prime-totient keystream *does not reset* at its internal large punctuation. A rubric might label which state alphabet to use instead of supplying a literal repeated additive key. The rival is editorial title/illustration metadata, with an unknown independently supplied key/cipher.

Prior original-input **red self-key Vigenère, plaintext autokey, title-pad reuse, ink audit, red-state marker switches and p0 red8/marker8** are already decided in `im-results/lp2-red-heading-self-key-vigenere-gate.md`, `im-results/lp2-red-heading-all-secret-plaintext-autokey-gate.md`, `im-results/lp2-red-ink-channel-audit.md`, Director #2181 and #2174. The new family is separate: **the secret state alphabet can be any one of 29! permutations** for each GP heading-symbol value. No key search, affine restriction or fixed-rune numerical correspondence is used.

## Source-fixed receiver model

For one chapter, let the exact leading red heading be `R[0..h-1]` in the canonical GP29 indexing and the remaining original runes be `C[0..n-1]`. The proposed reversible encoder is

```
state_i = R[(phase + direction*i) mod h]
C_i = Q_state_i(P_i)
P_i = inverse(Q_state_i)(C_i)
```

where `Q_r` is any **one-to-one** map of the full 29-rune alphabet, `direction=+1/-1`, and `phase` is any of the `h` possible phases. Each runic position consumes one heading step, punctuation does not consume a GP rune, and chapter page seams do not reset the clock. To favor this theory aggressively, even grant **separate arbitrary secret 29-permutation tables for every illustrated chapter**, and separately optimize every chapter's phase and scanning direction to maximize each upper-bound statistic. This contains all globally shared fixed tables as a special case and allows many more secret bits than the visible title supplies. It remains stationary **within a given chapter and heading-symbol state**.

**Exact all-secret theorem.** For every state `s`, form its original source ciphertext frequency histogram `H[s][c]`. Any unknown bijection `Q_s` can only *relabel* this histogram when read as plaintext. Hence the number of plaintext occurrences of the most common one symbol is at most `sum_s top1(H[s])`; the total number belonging to any five symbols is at most `sum_s top5(H[s])`. No enumeration of 29! secret keys is needed. Taking independent maxima over each chapter's phases and directions and summing chapter bounds only makes the bound **more permissive**; the maximizing phase for top1 need not also maximize top5. If observed GP-native source language requires a greater concentration, the model cannot produce that language, regardless of any hidden permutation keys.

## Original untouched-cipher results

For each original chapter the first page's red heading is excluded from the encoded body. All subsequent page runes are included, preserving physical page continuity, with the original p50 runeless table consuming zero rune-clock steps.

| Original physical chapters | GP29 black runes | Highest possible common-1 count | Highest possible common-5 count |
| --- | ---: | ---: | ---: |
| p0–2, p0 red13 | 716 | 67 | 258 |
| p8–14, p8 red12 | 1,717 | 121 | 494 |
| p15–22, p15 two red runs combined20 (extra speculative selector) | 1,883 | 142 | 573 |
| p23–26, p23 red16 | 1,005 | 88 | 335 |
| p27–32, p27 red19 | 1,414 | 109 | 443 |
| p40–52, p40 red8, p50 zero-rune table | 2,821 | 166 | 701 |
| p54–55, p54 red9 | 299 | 34 | 121 |
| **Independent p0–2 + p23–26** | **1,721** | **155** | **593** |
| **Four unambiguous headings p0, p8, p23, p27** | **4,852** | **385** | **1,530** |
| **Six sections excluding ambiguous p15** | **7,972** | **585** | **2,352** |
| **All seven** | **9,855** | **727** | **2,925** |

These are maximized independently by chapter and output statistic over both directions and all literal heading rotations, while every GP29 output state receives a completely unconstrained **secret 29! alphabet permutation**. The two-chapter result avoids the contentious p15 composite heading and p50 numeral table entirely. The four-heading result provides a stronger book-scale independent red-rubric decision.

## Independent native-GP plaintext controls

Use two actual independently stored source texts:
- `resources/control/gibran_prophet_58585.txt`, restricted to the main *The Prophet* work from `Almustafa` to the Project Gutenberg ending.
- `resources/control/shakespeare_first300k.txt`, first 300k source characters.

Map whole Latin words to the historical 29 GP runes using the repository's canonical transliteration and greedy digraphs `TH/EO/NG/OE/AE/IA/EA`; Latin aliases K→C, Q→C, V→U and Z→S are predeclared. This produces **47,173** and **218,800** native-GP runes. For every **contiguous rune window** in each source of the exact original length N, compute the count of the most frequent one and five GP runes. Scanning *all* such windows allows arbitrary independent source placement, with no window cherry-picking to support the cryptanalytic exclusion. These are authentic prose controls, not independently length-by-length matched to the LP2 printed words; the theorem addresses rune value concentration rather than word boundaries.

| Original receiver length | Source | Native sliding windows | Smallest top-1 in any control | Smallest top-5 in any control | Original maximal top-5 |
| --- | --- | ---: | ---: | ---: | ---: |
| 1,721 | Gibran | 45,453 | 166 | 689 | **593** |
| 1,721 | Shakespeare | 217,080 | 151 | 643 | **593** |
| 4,852 | Gibran | 42,322 | 494 | 1,990 | **1,530** |
| 4,852 | Shakespeare | 213,949 | 471 | 1,896 | **1,530** |
| 7,972 | Gibran | 39,202 | 830 | 3,288 | **2,352** |
| 7,972 | Shakespeare | 210,829 | 827 | 3,137 | **2,352** |
| 9,855 | Gibran | 37,319 | 1,060 | 4,055 | **2,925** |
| 9,855 | Shakespeare | 208,946 | 1,046 | 3,897 | **2,925** |

For **every** tested original multi-chapter register, both independent GP-native texts require substantially more common-rune concentration than any hidden keys in this alphabet-selection family could supply. A top-5 failure alone rejects the full model, independent of apparent English fragments and of a final global fixed plaintext alphabet renaming. The p0+p23 strongest two-section bound is 593 of 1,721, whereas even the least concentrated contiguous Shakespeare sample has 643.

A synthetic positive encrypts a long GP-native Gibran passage under independently chapter-specific 29-rune affine permutations selected by each original red symbol and verifies **full-length exact decoding and inverse**. The true plaintext's most frequent symbol and top-five counts lie below the corresponding ciphertext state histograms' top-k limits. The positive guards the permutation/accounting implementation; it does **not** imply that LP2 contains this planted ciphertext.

**Reproducer:** [Windows Node22 original-source SFT](../sims/lp2_rubric_symbol_secret_permutation_sft.cjs). [Windows source-backed workflow](../.github/workflows/agent17-rubric-allsecret-original.yml), [**original source + synthetic plant PASS**, run 45014487255](https://github.com/FlareZ123/liber-primus/actions/runs/45014487255) (Windows Node22, 22 November 2026). All input text and original GP rune coordinates are supplied from the committed repository.

## Scope and research decision

The result excludes **only** the stated direct native-GP-prose cipher architecture: fixed rune-value bijections selected by the cyclic original red-rune headings, even when the secret bijections, phase, direction and keys can vary independently by chapter. It does not exclude state updates depending on prior ciphertext/plaintext, page-specific fresh keys, author-typed external entropy, non-GP intermediate representations, changing word boundaries, a genuine plaintext-F transparent mechanism with an unknown clock, or a different non-English plaintext register. A decoded ciphertext must still yield a long contiguous, independently predictable original passage.

**Next causal decision:** recover an original *state-update or operator-bearing instruction* that tells a reader how red rune metadata changes the actual transformation, rather than searching more fixed hidden alphabets. The original red headings alone cannot pick their own 29-way stationary secret alphabet library and produce ordinary GP-native English. The more general changing-state red-rubric program remains open only with an author-selected update and an independent black-chapter prediction. No rerun of historic red-heading additive recipes is warranted.
