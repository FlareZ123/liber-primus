# Six-back GP29 orbit-log transport: stationary global, page and chapter keys fail native-English suffixes

**18 November 2026 · Agent 9 · original-input full-key negative.** This is one bounded, invertible proposed cipher architecture. It recovers **no** unknown LP2 plaintext, key, or destination. The original-source CommonJS program passed [Windows Node 22 workflow 44294285989](https://github.com/FlareZ123/liber-primus/actions/runs/44294285989) after a complete positive source-native encryption/decryption check.

## Source-derived opportunity, missing opcode

Across 2,896 original LP2 printed whole words, a previously discovered but retrospectively selected six-back GP29 affine echo has **80/1,290** positional matches under `T(x)=24−2x (mod29)`. Original half-books each chose this same map in a family of 812 affine maps, as documented by [Agent 9's source-exact split](lp2-sixback-independent-chapter-halves-map-replication.md). One possible 2013-era player-readable interpretation is multiplication/translation in the 29-element prime field: T fixes **H=8**, and on the remaining **28** runes its action is a *single 28-cycle*. The genuine 2013 signed Diffie–Hellman arithmetic makes such a group-coordinate interpretation historically conceivable, though **no Cicada-authored source selects this log transform or a lag-six cipher**.

Use an orbit seeded at GP index21: `[21,11,2,20,13,27,28,26,1,22,9,6,12,0,24,5,14,25,3,18,17,19,15,23,7,10,4,16]`. For every non-H rune x, let `e(x)` be its position in this orbit. By construction `e(T(x))=e(x)+1 mod28`.

## Entire reversible architecture and key-independent obstruction

At each printed GP word of plaintext `P[0..]`, grant the cipher *any secret fixed 29-way permutation* `π`, with code `k=π(P[j])` among 0..28. The first six symbols of each ciphertext word explicitly encode the same code, starting from orbit-exponent zero. At every later j≥6:

- If `k=28`, emit H, GP index8. This is an unambiguous, reversible 29th-symbol escape.
- If `k<28`, emit `orbit[(e(C[j−6])+k) mod28]`, taking `e(H)=0` as the explicitly defined reset convention.

Thus all 29 symbols can be reconstructed exactly using one fixed secret π, including H, word initials and every j≥6. The exact inverse is

`D[j]=28` when `C[j]=H`; otherwise `D[j]=(e(C[j])−e(C[j−6])) mod28`, with reset exponent zero for a prior H.

The recovered `D[j]` equals `π(P[j])` for every j≥6. A secret permutation **cannot change any symbol frequency or index of coincidence**. This yields a **complete all-key test covering 29! stationary alphabet keys** from original ciphertext without enumerating a password or fitting plaintext. For this candidate architecture it is impossible for any stationary key to make the decoded suffixes have a linguistic collision distribution if the original suffix register lacks it. The model is **word-local** and preserves printed word boundaries; neither requirement is independently source-authenticated.

## Exact original and language-control results

The source transcription is joined correctly across line/page carries. Original numeric indices were independently matched 12,956/12,956 against `resources/liber-primus/lp2-corpus.json`. There are exactly **559 original words of length seven or longer**, with **1,290** j≥6 output symbols. For this inverse:

| Original observable | Exact output |
| --- | ---: |
| Full 29-symbol orbit-log suffix IoC | **0.0355230002225149** |
| Distinct non-H pairs, i.e. both C[j] and C[j−6] unequal to H | 1,204 |
| Non-H orbit-log suffix IoC | 0.03685139311190462 |
| Non-H lag-six increment equal to one | 78 |
| Positions with current or lag-six H | 86 |
| Current-rune H escape symbols | 41 |

Three distinct source-native GP29 English registers use the **same exact list of 2,896 original printed word lengths**. Each control constructs 600 deterministic full 12,956-rune books, drawing a complete independent source-English word for every original word; count only native suffixes j≥6. This preserves word-level correlations, appropriate rare 13/14-rune words, and the historical GP spellings `ING→NG`, `IO→IA`, and `QU/V/K/Z` aliases. All 600 samples in each source were higher than the original.

| Source | 600 native-GP controls: minimum suffix IoC | Mean suffix IoC | Original |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 0.0821308507887251 | 0.0911466774115302 | **0.0355230002225149** |
| Shakespeare, first 300k | 0.08604350466980593 | 0.09374542491324939 | **0.0355230002225149** |
| Emerson, *Essays* | 0.08245800783011889 | 0.08993460667985724 | **0.0355230002225149** |

Controls are **conditional reference-distribution comparisons**, not a language-independent impossibility theorem. The all-key proof is exact for the stated one-permutation emitter; its application to English rests on the native-source models.

Each of the three actual English source plants was **fully encoded and recovered 12,956/12,956**, with exact forward replay and independent positive validation of all 1,290 decoded suffixes. The source SFT locks the observed original numeric values, key-family invariance, source lengths and positive controls: [`sims/lp2_t6_lag6_dlog_allkey_original_sft.cjs`](../sims/lp2_t6_lag6_dlog_allkey_original_sft.cjs). Reproduce from repository root on Windows Node.js 22: `node sims/lp2_t6_lag6_dlog_allkey_original_sft.cjs`.

## Stronger original-input test: independent alphabet key on every page or chapter

The stationary global permutation is an unnecessarily strong restriction. Under the same T6 orbit-log emitter, the secret 29-symbol plaintext→code bijection may change **independently on each physical page**. An arbitrary word may cross a page boundary: the key switches at the exact physical rune and the six-rune ciphertext-feedback predecessor stays word-local. Likewise, the secret permutation can instead change independently on each of the **nine original printed chapters**. A hidden page or chapter key changes which labels occur in its stratum, yet **cannot change collisions of the recovered suffix symbols within that stratum**.

The new source-exact [read-only per-page/chapter full-key SFT](../sims/lp2_t6_lag6_dlog_pagekeys_original_sft.cjs) computes the sum of within-stratum collision pairs, excluding pairs that cross an unknown key change. The original 1,290 six-back outputs yield:

| Scope of independently arbitrary 29-way alphabet keys | Original eligible suffix symbol pairs | Same-code collisions | Key-invariant pooled IoC |
| --- | ---: | ---: | ---: |
| One secret alphabet for the entire book | 831,405 | 29,534 | **0.0355230002225149** |
| Nine independent chapter alphabets | 115,568 | 4,165 | **0.036039388065900596** |
| Fifty-five independent physical-page alphabets | 16,875 | 628 | **0.03721481481481481** |

The single-alphabet first-row exact collision numerator 29,534 is inferred from the exact original IoC and 831,405 pairs; independent page/chapter rows are asserted directly by their source-original SFT. Of 55 physical pages, 54 contain at least two suffix symbols, with runeless p50 contributing none. The free key space now includes **all `(29!)^55` possible page-wise alphabets**, and separately all `(29!)^9` chapter-wise alphabets. The security argument is a mathematical invariance: the secret permutations can be entirely unknown and different from each other without changing the observed collision totals.

Calibrate against 800 source-native GP English 12,956-rune books *per control source*, with every printed word length fixed as in the original. Each reference book is sampled as 2,896 complete words, retaining natural within-word repeats and the exact original page/chapter assignment of each output position.

| Source | Per-page native controls: minimum / mean IoC | Per-chapter native controls: minimum / mean IoC |
| --- | --- | --- |
| Gibran | **0.074370 / 0.086662** | **0.080360 / 0.090807** |
| Shakespeare | **0.079230 / 0.089071** | **0.084591 / 0.092982** |
| Emerson | **0.074844 / 0.085206** | **0.080559 / 0.089392** |
| **Original LP2** | **0.037215** | **0.036039** |

None of **2,400 page-key controls or 2,400 chapter-key controls** scores as low as the untouched original book. This exclusion is still conditional on source-like native-English plaintext and faithful original word boundaries. A non-English source, transformed plaintext register, per-word key changes, or another feedback opcode is outside it.

**Constructive all-55-page-key positive:** independently give each physical page `p` an invertible `π_p(P)=11P+7p+3 (mod29)`; use the exact same six-back emission including the H interrupt. On the first genuinely source-native sampled book from **each** of Gibran, Shakespeare and Emerson, the full decoder recovers exactly **12,956/12,956 plaintext GP runes**, including 32 page-crossing printed words. It re-encrypts the result exactly. The decoded within-page suffix collision count is identical to the original planted plaintext's count at every page, which confirms the key-independence on a positive nonstationary-key example. All assertions passed in [Windows Node22 CI run 44294986153](https://github.com/FlareZ123/liber-primus/actions/runs/44294986153).

## Word-by-word secret alphabets and the six-symbol initialization boundary

A still more permissive related cipher draws an **independent arbitrary 29-symbol alphabet permutation for every printed word**, including across all pages and chapters, while using the same T6 transport and direct zero-orbit encoding for the first six symbols of each word. This exposes a stronger, completely key-independent **within-word equality invariant**: the complete code stream, including those first-six symbols, must have exactly the same wordwise repeated-letter relationships as its plaintext. This is mathematically true under every one of the `(29!)^2896` separate word-key assignments. Each original word's full transformed code stream has `D[j]=28` if `C[j]=H` and otherwise `D[j]=e(C[j])−e(C[j−6]) mod28`; the predecessor exponent is defined as zero at j<6.

| Word-local statistic | Original source | Source-native control distribution |
| --- | ---: | --- |
| All positions, sum of within-word equal-symbol pairs | **793 / 30,281 pairs** | Gibran **1,132–…**, mean **1,258.715**; Shakespeare **1,193–…**, mean **1,304.591**; Emerson **1,201–…**, mean **1,298.957** |
| Only post-initialization j≥6 positions, sum of within-word equal-symbol pairs | **57 / 1,460 pairs** | Gibran **34–94**, mean **63.768**; Shakespeare **38–83**, mean **57.838**; Emerson **29–75**, mean **52.410** |

Each control distribution draws **1,000 full source-native GP English books** with exactly the original 2,896 word lengths. None of 3,000 full-word English reference books has as few as 793 repeated pairs, despite **all 29-way alphabet permutations being allowed independently on every word**. The positive plants encrypt and recover 12,956/12,956 native-GP runes in each of the three reference corpora using 2,896 distinct known word-affine permutations `π_w(P)=11P+7w+3 mod29`. These are complete original-size reversible controls. The [read-only wordkey SFT](../sims/lp2_t6_lag6_dlog_wordkeys_original_sft.cjs) passed [Windows CI 44295753029](https://github.com/FlareZ123/liber-primus/actions/runs/44295753029).

**Crucial differentiation:** The full-word rejection depends on the specifically defined direct first-six initialization. If the creator instead supplied **six arbitrary, plaintext-independent ciphertext IV symbols per word**, the first-six code positions would have no required plaintext correspondence; only the later suffixes would expose equality under the secret word permutation. The original suffix-only 57/1,460 pair statistic is **comfortably inside all three 1,000-trial native-source ranges**: 241/1,000 Gibran, 500/1,000 Shakespeare, and 774/1,000 Emerson samples have counts at or below 57. Consequently the suffix-only **per-word-key** family is *not excluded by this equality statistic*; it remains non-identifying, with 2,896 freely changing 29-way permutations and six initial symbols per word requiring independently supplied key/IV information. A source-authenticated per-word KDF and six-rune initialization would be prerequisites for pursuing that variant, not an invitation to fit them arbitrarily.

The full-word difference partly inherits LP2's already-established within-word anti-doublet suppression: first-six codes directly relabel the original ciphertext rather than conceal that source anomaly. This test therefore **strengthens a bounded structural exclusion**, without converting that existing anomaly into independent evidence of a new authored layer.

## Decision for future decryptors

The p39/2013-inspired **six-back discrete-log incremental interpretation with any globally stationary, page-stationary, chapter-stationary or directly initialized word-stationary plaintext-code permutations** fails to explain the suffix collision distribution of ordinary source-native English. It is not rescued by independently changing every page's secret alphabet or the word's first-six-symbol IV. The prior distinct **adjacent** (`j−1`) orbit-ratio experiment is [Agent 31's separate negative](lp1-p40-cayley-t6-logratio-inverse.md); this report specifically tests j−6 and fully covers the stationary-secret-alphabet family.

The source T6 echo remains an observed statistic without an author-licensed operation. Its survival could instead reflect another stateful emitter, a repair process or selection bias from the 812-map and lag search. These possibilities require an independently selected state/clock/repair rule before new key searches. **No unknown manuscript plaintext or new source-authenticated key was recovered.**
