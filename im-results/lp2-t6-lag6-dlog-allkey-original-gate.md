# Six-back GP29 orbit-log transport: all stationary alphabet keys fail original native-English suffixes

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

## Decision for future decryptors

The p39/2013-inspired **six-back discrete-log incremental interpretation with one global stationary plaintext-code permutation** fails to explain even the suffix distribution of ordinary source-native English. It is not rescued by changing the secret alphabet or the word's first-six-symbol IV. The prior distinct **adjacent** (`j−1`) orbit-ratio experiment is [Agent 31's separate negative](lp1-p40-cayley-t6-logratio-inverse.md); this report specifically tests j−6 and fully covers the stationary-secret-alphabet family.

The source T6 echo remains an observed statistic without an author-licensed operation. Its survival could instead reflect another stateful emitter, a repair process or selection bias from the 812-map and lag search. These possibilities require an independently selected state/clock/repair rule before new key searches. **No unknown manuscript plaintext or new source-authenticated key was recovered.**
