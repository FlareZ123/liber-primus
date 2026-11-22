# Static previous-cipher-symbol GP29 transducers: exact all-secret frequency obstruction

**Agent9, 22 November 2026. Classification: key-independent original-cipher exclusion conditional on source-native plaintext distribution.** This rules out a substantial hidden-key family as a direct decoder and does **not** recover unknown LP2 plaintext, a key, a confirmed historical cipher, or a destination. Original-cipher [Node22/CommonJS reproducer](../sims/lp2_firstorder_quasigroup_majorization_sft.cjs) passed [Windows Actions run 44972311891](https://github.com/FlareZ123/liber-primus/actions/runs/44972311891).

## Motivating question and distinct competitor

The original ciphertext has only 86 adjacent-equal runes among 12,901 physical-page internal transitions, while every other ordered GP29 rune pair occurs. A natural reversible, human-readable response to that scarcity would choose the next output alphabet using the **last ciphertext rune** as a state. Could such a transducer be direct encryption of ordinary source-native GP English, with the 29 hidden substitution alphabets unknown to the solver? A source-visible chapter break may select a new set of secret alphabets.

The competitor is a cipher using **additional state**: secret time/phase clocks, per-page or per-word keys, a key stream, plaintext-dependent state, a non-bijective or variable-length emission step, a permutation before the emission, or non-English deliberately balanced plaintext. These are outside the finite exclusion below.

## Exact all-secret inverse bound

Let the 29 GP rune values be `0..28`. Within each original physical page, after the free first symbol, consider

```
C[i] = sigma[chapter][C[i-1]][P[i]]
```

Each `sigma[chapter][lastC]` is an **arbitrary independent permutation of all 29 runes**; no algebraic structure, known key, predetermined English alphabet assignment or cipher fitting is imposed. Two architectures are charged: one globally reused 29-row table and one independent table for each of the nine actual illustrated chapter spans. Unknown first-rune encoding on all **55 rune-bearing physical pages** is wholly free. A bijective operation is needed only at the per-row output. The model includes fixed previous-ciphertext Caesar/Vigenère shifts, full arbitrary substitution and quasigroup/Latin-table special cases.

Define the original `29×29` ciphertext bigram count `M_s[a][b]` for each allowed secret state scope `s` (global or chapter). For **any** set of `k` plaintext rune labels and **any** assignments of every secret alphabet, the number of those plaintext labels emitted after predecessor state `a` in scope `s` cannot exceed the sum of the `k` largest counts in the row `M_s[a][*]`. A secret permutation must assign each of the `k` plaintext symbols to **distinct** ciphertext symbols. Summing over all predecessor states gives a necessary upper bound

```
U(k) = 55 + sum_s sum_a sum_largest_k(M_s[a][*]).
```

The additive 55 grants all page-start runes to the tested plaintext set, an intentionally permissive bound. This invariant is exact for **every** choice of all the secret permutations and **every** possible decrypted string. For each `k`, the sum of the actual `k` most frequent plaintext rune counts must be at most `U(k)`, because the inequality holds for every fixed selection of `k` labels.

## Original-source results

Original canonical physical p0–p55, skipping runeless p50, supplies **12,956 runes, 55 page starts, 12,901 eligible within-page transitions**. No ciphertext or word boundaries were altered. Nine chapter rune ends are frozen at `[729,1874,3603,5506,6527,7960,9640,12648,12956]`, independently documented by the original illustrated sections. The exact high-level constraints:

| Number of plaintext symbols, `k` | Shared global table: `U(k)-55` | Nine chapter-specific tables: `U(k)-55` | Nine-chapter maximum of full text |
| ---: | ---: | ---: | ---: |
| 1 | 714 | 1,255 | **10.1111%** |
| 2 | 1,359 | 2,289 | **18.0920%** |
| 3 | 1,971 | 3,203 | **25.1467%** |
| 4 | 2,564 | 4,042 | **31.6224%** |

For each `k`, the global table bound is stricter. The independent nine-chapter keys constitute the more permissive architecture shown as percentages. A different secret table on each physical page yields a one-symbol upper bound of **(2,735+55)/12,956 = 21.53%** and is **not** excluded by the English unigram test.

All **812 distinct off-diagonal directed GP29 pairs** appear in original physical-page-internal ciphertext at least **five** times. In chapter eight, every predecessor rune has between **25 and 29** distinct observed successors, excluding chapter-static mechanisms with at most 24 possible output symbols per predecessor, even before the English comparison. This 29×29 support census is an additional exact constraint; a cipher whose allowed successor set changes by an unobserved state is not covered.

## Real plaintext calibration and positive inverses

The reproducible original-input test uses the already calibrated English→GP29 spelling, including composite NG/ING and IA/IO, and compares the cipher-independent maximum against **150 overlapping, fixed-stride 12,956-rune windows** from the Gibran and Shakespeare source corpora. No unknown ciphertext is used to choose the windows.

| Source reference | Whole-reference largest GP rune share | Minimum among original-length windows for top 1 / 2 / 3 / 4 rune shares | Windows satisfying even one nine-chapter bound |
| --- | ---: | --- | ---: |
| Gibran, 62,492 runes | 11.7679% | 11.1377% / 19.8441% / 26.9450% / 33.7295% | **0/30** |
| Shakespeare, 217,106 runes | 11.8099% | 10.9447% / 19.0182% / 26.1115% / 32.9345% | **0/120** |

The distinct manuscript solved-reference translations encode to **3,510 native-GP runes**, whose highest single-rune rate is **12.1652%** and top-four share **35.0142%**, independently above all four chapter bounds. These are population and orthography **calibration checks**, not discovery-adjusted p-values; the 150 windows overlap.

The SFT also draws arbitrary secret 29-way alphabets, **encrypts a genuine 12,956-rune native-GP passage** in each of the two charged state scopes, and recovers its complete plaintext under the exact secret inverse, using real page lengths and independent free page heads. Every planted inverse is exact and its ciphertext-derived necessary bound admits the planted plaintext. This safeguards against accidentally excluding the architecture merely through the testing procedure.

## Cryptanalytic decision

**Retire globally shared or chapter-specific previous-ciphertext-rune-only 29-way substitution as a direct LP2-native-English solution, for any secret keys.** Under the exact model, no allocation of its 29 or 261 secret alphabets can produce a source-native plaintext with the letter concentrations witnessed in the tested independent historical/literary controls. This finding explains why a brute-force search for a previous-rune keyed alphabet table cannot recover conventional English from the given ciphertext: the required conditional output concentration simply is absent.

**Do not extend this proof to** a period-changing alphabet table, source-word-phase state, hidden tape, page-private alphabet tables, a non-bijective 28-successor channel, a different predecessor type, extra transposition layers or an intentionally flatter plaintext register. Those mechanisms can change the state counts or the relevant plaintext marginal. The original manuscript still has no authenticated unknown-page plaintext or operational decryption rule. Future source-led attacks should identify the **additional changing state or emission step** before searching its keys.

**Source and reproduction:** unchanged [canonical corpus](../resources/liber-primus/lp2-corpus.json); [original chapter/word controls](../sims/lp2_wordlength_chapter_mutualinformation_sft.cjs); [source-native GP spelling controls](../sims/lp2_native_gp_source_orthography_sft.cjs); [this exact invariant SFT](../sims/lp2_firstorder_quasigroup_majorization_sft.cjs); [passing Windows Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/44972311891).
