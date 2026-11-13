# Page-offset repeated alphabet: all-secret equality gate

**Status (13 November 2026): key-independent finite source-native English exclusion; no unknown LP2 plaintext or key.**

## Why this operation could have been tried

A page-turn is a source-visible reset point. A human solver could reasonably test whether different LP2 physical pages were independently encoded with one reused position-indexed key: a repeated additive pad, page-reset Vigenère/affine alphabet, page-offset pseudo-random alphabet, or a different arbitrary secret bijection for each page-local rune position. This is a general test of *key reuse*, not a proposed author-selected solution. No original instruction establishes the reset.

Under the model `C[p,i] = π_i(P[p,i])`, every page has the **same** unknown permutation `π_i` at page-local position `i`; distinct positions may use completely unrelated secret permutations. For every two pages containing that position,

```
[C[p,i] == C[q,i]]  <=>  [P[p,i] == P[q,i]] .
```

Thus the total count of equal rune pairs at matching page positions, among all page pairs of a visual chapter or the book, is invariant without learning a single alphabet or pad symbol. This also includes shared additive GP29 pads with any page-offset clock, shared fixed substitution alphabets, and all source-unselected period lengths. It does **not** include independently keyed pages, changing phase origins, per-word resets, transposition, or plaintext-to-ciphertext feedback.

## Source and control

Original `resources/liber-primus/lp2-corpus.json`: all **55 rune-bearing unknown LP2 pages** p0–p55 (p50 contains zero runes), **12,956 runes**. Page offsets start at each actual physical page; a printed word may carry across a page boundary. The independent solved p57 cleartext is encoded with the documented native LP1 orthography from `sims/lp2_native_gp_source_orthography_sft.cjs`, including ING→index21 and IO→index27, and matches **95/95** original p57 runes before any unknown-page statistic is computed.

Three existing pinned English corpora are encoded into the same source-native GP29 register: Shakespeare **217,106** runes, Gibran **62,492**, Emerson **321,327**. Each control window is a contiguous rune stream partitioned into *exactly the original physical page lengths*, starting every **127** GP runes. Overlapping windows are reference comparisons, not independent hypothesis tests. In all windows, the total number of eligible page-offset symbol pairs is identical to the original. For an independent positive plant, an arbitrary distinct affine permutation `π_i(x) = (((7i mod 28)+1)x + (11i+3)) mod29` is applied at every page offset across pages; the equality count remains exactly unchanged.

## Original versus source-native controls

Values in the control columns are **minimum equal-pair rates** for all sampled windows; `n` is number of windows and `≤` counts windows whose rate is at or below original. All counts are over the *same original page-length partition*.

| Physical pages | Original matches/pairs (rate) | Shakespeare min (n; ≤) | Gibran min (n; ≤) | Emerson min (n; ≤) |
|---|---:|---:|---:|---:|
| 0–2 | 14/664 (0.02108) | 0.02108 (1704; 1) | 0.03313 (487; 0) | 0.03012 (2525; 0) |
| 3–7 | 62/2103 (0.02948) | 0.04232 (1701; 0) | 0.04517 (484; 0) | 0.04375 (2522; 0) |
| 8–14 | 178/4738 (0.03757) | 0.04474 (1696; 0) | 0.05002 (479; 0) | 0.04960 (2517; 0) |
| 15–22 | 240/5861 (0.04095) | 0.04914 (1695; 0) | 0.04846 (478; 0) | 0.05136 (2516; 0) |
| 23–26 | 54/1439 (0.03753) | 0.04031 (1702; 0) | 0.04100 (485; 0) | 0.03683 (2523; 2) |
| 27–32 | 115/3137 (0.03666) | 0.04590 (1699; 0) | 0.04590 (481; 0) | 0.04718 (2519; 0) |
| 33–39 | 168/4791 (0.03507) | 0.04655 (1697; 0) | 0.05051 (479; 0) | 0.04822 (2517; 0) |
| 40–53 | 555/15369 (0.03611) | 0.05088 (1686; 0) | 0.05296 (469; 0) | 0.05374 (2507; 0) |
| 54–55 | 6/76 (0.07895) | 0.00000 (1708; 1405) | 0.00000 (490; 409) | 0.00000 (2528; 2008) |
| **Whole book 0–55** | **10751/311132 (0.03455)** | **0.05604 (1608; 0)** | **0.05828 (391; 0)** | **0.05923 (2429; 0)** |

The full-book rate is below **all 4,428** control windows. Six of nine visual chapters also lie below every one of their respective windows in all three corpora; pp0–2 have one Shakespeare tie, pp23–26 two Emerson lower controls, and the two-page pp54–55 comparison has too little discriminatory power.

## Interpretation and next decision

A shared page-offset GP29 alphabet, however complex and secret, cannot transform the original LP2 page-aligned equality pattern into any of the **4,428 sampled English windows** under the source-native spelling and exact printed-page-length model. This is an algebraically exact pair-preservation obstruction against the tested finite windows; it strongly disfavors a single page-reset reused additive key as an intended ordinary-English inverse. The result also applies to per-chapter repeated page-offset alphabets for the seven strongly incompatible chapters.

It is **not** a theorem about all possible English prose, a proof of random encryption, or a determination of the historical cipher. LP1 plaintext is sometimes semantically repetitive, so language controls are imperfect; the original-key reuse model could still use unconventional registers or chapter-specific content. No keys were fitted, no plaintext was decoded, and exact synthetic inverse is only a positive check of the equality invariant. Source-visible alternative page/word clock evidence would be required before revisiting this family. Prioritize an independently selected **page-specific or stateful original-cipher inverse** over brute-forcing more page-reset shared keys.

**Reproducer:** [`sims/lp2_pageoffset_allsecret_reuse_gate.cjs`](../sims/lp2_pageoffset_allsecret_reuse_gate.cjs), a self-contained Node.js CommonJS SFT reading only repository-pinned resources and the existing native-English encoder. Run directly with Node.js 20+; it asserts all original full-book counts, the p15–22 count, the solved-p57 source control and all-secret positive-plant invariants.
