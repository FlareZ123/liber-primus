# Static previous-cipher-symbol GP29 transducers: exact all-secret frequency obstruction

**Agent9, 22 November 2026. Classification: key-independent original-cipher exclusion conditional on source-native plaintext distribution.** This rules out a substantial hidden-key family as a direct decoder and does **not** recover unknown LP2 plaintext, a key, a confirmed historical cipher, or a destination. Original-cipher [Node22/CommonJS reproducer](../sims/lp2_firstorder_quasigroup_majorization_sft.cjs) passed [Windows Actions run 44972311891](https://github.com/FlareZ123/liber-primus/actions/runs/44972311891).

## Motivating question and distinct competitor

The original ciphertext has only 86 adjacent-equal runes among 12,901 physical-page internal transitions, while every other ordered GP29 rune pair occurs. A natural reversible, human-readable response to that scarcity would choose the next output alphabet using the **last ciphertext rune** as a state. Could such a transducer be direct encryption of ordinary source-native GP English, with the 29 hidden substitution alphabets unknown to the solver? A source-visible chapter break may select a new set of secret alphabets.

The competitor is a cipher using **additional state**: secret time/phase clocks, per-page or per-word keys, a key stream, plaintext-dependent state, a non-bijective or variable-length emission step, a **post-emission** transposition that changes the observed ciphertext predecessor order, or non-English deliberately balanced plaintext. These are outside the finite exclusion below.

**Related narrower refinement (25 November):** [conjugated cumulative GP29 recovery](lp2-conjugated-cumulative-gp29-recovery.md) adds exact column-regular constraints for the cyclic-group subclass with two arbitrary secret permutations, continuous across physical page seams, and tests a blind original key-recovery algorithm. It does not strengthen the bound for arbitrary independent predecessor rows.

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

**Independent single-chapter rejection.** The eighth original visual chapter has 3,008 runes and 13 free page heads. Within its 2,995 constrained edges, the maximum possible share of *any* one decoded plaintext rune under any chapter-private previous-C 29-way secret substitution is exactly **(235+13)/3,008 = 8.24468%**. This does not rely on any other chapter using that cipher. All **119** 3,008-rune Gibran source-native windows (minimum most-frequent rune **10.37234%**) and all **426** Shakespeare windows (minimum **9.00931%**) exceed this independent bound. Their overlapping 503-rune stride is fixed, so these counts are finite controls rather than independent p-values. A multi-cipher book could exempt other chapters, but the observed eighth chapter itself still requires an extra changing state, different plaintext concentration, or a different emitter.

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

## Source-motivated two-clock extension

**Source-motivated two-clock extension (Agent9, 22 November):** even the original p50 low60/base60-even-bit0 state (36/256 events; unknown-LP2 repeat-enriched) **combined with a five-position clock reset at each of the 2,896 authentic printed words** cannot repair this obstruction if the only emitted-symbol dependence is an arbitrary hidden bijective alphabet selected by `[previous ciphertext rune, p50 bit0, word position mod5]`. The complete **290 independent secret alphabets** yield exact ciphertext-derived maximum shares **9.9105% / 17.9454% / 25.0617% / 31.5761%** for the most frequent one/two/three/four plaintext runes after granting all 55 physical page heads freely. All 150 original-length Gibran/Shakespeare GP-native reference windows exceed all four limits, and a new full 290-secret-map encrypted native-GP positive roundtrips exactly and satisfies the bound. This narrowly retires **the two-clock global previous-cipher-only model**, while chapter-varying alphabets and nonbijective/changing-length emissions remain open. Source selection of the p50 bit0 legend is itself only provisional. [Full source report](../im-results/lp2-p50bit-wordfive-allsecret-original-invariant.md) · [original-source read-only SFT](../sims/lp2_p50bit_fivephase_allsecret_majorization_sft.cjs) · [Windows PASS 44973736935](https://github.com/FlareZ123/liber-primus/actions/runs/44973736935).

## Cryptanalytic decision

**Retire globally shared or chapter-specific previous-ciphertext-rune-only 29-way substitution as a direct LP2-native-English solution, for any secret keys.** Under the exact model, no allocation of its 29 or 261 secret alphabets can produce a source-native plaintext with the letter concentrations witnessed in the tested independent historical/literary controls. This finding explains why a brute-force search for a previous-rune keyed alphabet table cannot recover conventional English from the given ciphertext: the required conditional output concentration simply is absent.

**Do not extend this proof to** a period-changing alphabet table, source-word-phase state, hidden tape, page-private alphabet tables, a non-bijective 28-successor channel, a different predecessor type, extra transposition layers or an intentionally flatter plaintext register. Those mechanisms can change the state counts or the relevant plaintext marginal. A **pre-emission** permutation or whole-word rearrangement of otherwise ordinary GP English does **not** evade this bound: the aggregate plaintext unigram frequencies remain unchanged and are forbidden after any such rearrangement. The original manuscript still has no authenticated unknown-page plaintext or operational decryption rule. Future source-led attacks should identify the **additional changing state or emission step** before searching its keys.

**Source and reproduction:** unchanged [canonical corpus](../resources/liber-primus/lp2-corpus.json); [original chapter/word controls](../sims/lp2_wordlength_chapter_mutualinformation_sft.cjs); [source-native GP spelling controls](../sims/lp2_native_gp_source_orthography_sft.cjs); [this exact invariant SFT](../sims/lp2_firstorder_quasigroup_majorization_sft.cjs); [passing Windows Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/44972311891).
