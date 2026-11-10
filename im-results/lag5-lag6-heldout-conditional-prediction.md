# LP2 lag-five/lag-six motifs predict unseen ciphertext under a constrained positional null

**Evidence status (Agent 12, 2026-11-10):** executed source-original, frozen-half predictive check of **already published** lag-six and lag-five ciphertext dependencies. It adds a proper conditional likelihood model and a stringent heldout word-shuffle comparison to the existing motif tests. **There is no recovered LP2 plaintext, key, cipher, continuation destination, or independently established generative mechanism.** The feature set was inspired by discovery on the full corpus, so this is *not* a fresh independent discovery-wide p-value.

## The original source and mathematical prediction

The source is the canonical 55 rune-bearing unsolved LP2 page records of `resources/lp2-transcription.txt`, SHA-256 `5e0003aa7f7dde3b238d17c5f964790dbf6bf9db5edacc4a5ec0bad81c6f4bce`. It contains **2,896 intact cipher words and 12,956 original GP runes**. Page and printed-line wraps are joined before tokenization so the 32 cross-page words remain whole. Only actual punctuation separates words; the grid-only page 50 contributes no runes.

For each ciphertext output `y = C_i`, with preceding **global** published rune `a=C_(global-1)`, use a 29-symbol baseline with `P_0(y=a)=q`, otherwise `P_0(y)=(1-q)/28`. Estimate `q` from the training half's actual global adjacent-repeat count, without using heldout runes. At a candidate word-local position introduce four fixed possible outputs, in order:

1. **T6:** if `i>=6`, candidate `24-2*C[i-6] mod29`, the independently reported affine six-back relation.
2. **S5:** if `i>=5` and `C[i-5]=15` (the rune `ᛋ`), candidate 15, the previously reported source-conditioned five-back recurrence.
3. **lag5:** if `i>=5`, candidate `C[i-5]`, the general five-back copy.
4. **lag5 contiguous:** if `i>=6` and `C[i-1]=C[i-6]`, candidate `C[i-5]`, a second consecutive five-back copy. The repeated-digraph phenomenon and independent-copy M3 forward model are **prior art**, including Agent 6's earlier implementation.

For feature weights `θ_j`, the exact **normalized and source-defined categorical predictor** is

```text
P(y | published history) =
    P_0(y | preceding rune) × exp(sum_j θ_j × [feature_j candidate equals y])
    / sum_{v=0}^{28} P_0(v | preceding rune) × exp(sum_j θ_j × [feature_j candidate equals v]).
```

Coincident feature candidates add their weights before normalization. For disallowed positions the corresponding feature is absent. Fitting is convex log-likelihood optimization in just four parameters by 14 rounds of coordinate Newton updates. It never guesses GP-English words, keys or plaintext. The predictor is deliberately **autoregressive over the observed ciphertext** and is neither an encoder nor a decryptor.

## Train once and freeze on the remaining original ciphertext

Choose the **first 1,448** complete words as training (**6,489 runes**, 6,488 conditional next-symbol observations). Freeze all four optimized weights, the baseline duplicate probability and the inclusion rules. Evaluate the remaining **1,448 words** (**6,467 runes**, 6,466 conditional observations) without refitting or choosing new feature thresholds.

| Measurement | Value |
| --- | ---: |
| Trained adjacent-equality baseline `q` | **0.006165228113440197** |
| Trained T6 weight | **0.6105578633** |
| Trained S5 weight | **0.6477467289** |
| Trained general lag5 weight | **0.3943548352** |
| Trained contiguous lag5 weight | **0.3747078975** |
| Training log-likelihood improvement over `P0` | **+11.2187510251 nats** |
| **Frozen heldout log-likelihood improvement** | **+12.4242332741 nats** |
| Heldout log-likelihood improvement per next rune | **+0.00192147 nats** |
| Heldout T6 occurrences | **40 hits / 645 opportunities** |
| Heldout S5 occurrences | **7 hits / 32 opportunities** |
| Heldout general five-back coincidences | **48 hits / 1,038 opportunities** |
| Heldout second contiguous five-back positions | **6 hits / 29 opportunities** |

The last four hit counts are *overlapping conditions*, not independent samples and should not be combined as if independent. In particular the T6 and S5 identities were chosen in earlier exploratory searches, and the S5 count in the second half exceeds the first-half rate. The empirical likelihood improvement is real under the fixed source and exact model, but the numerical size is small per rune.

## Exact positional permutation control on the heldout half

Generate **1,500** deterministic heldout surrogates from seed `0x12a53301` with xorshift32. Independently shuffle only the **interior** of each complete ciphertext word by Fisher–Yates; reject a shuffled word if its number of immediately equal neighbouring pairs changes. This preserves **each word's exact length, rune multiset, first rune, last rune, and total adjacent doublet count**. Fixing endpoints also preserves the observed *global* cross-word adjacent doubles, and all word and page boundaries remain untouched.

Apply the frozen **original training** model to each surrogate, including computing candidate T6/S5/lag5 values from the *surrogate's own published prefix*. No surrogate affects parameter fitting.

| Holdout log-likelihood lift vs same `P0` | Nats |
| --- | ---: |
| **Real LP2** | **+12.4242332741** |
| Median of 1,500 constrained surrogates | **−6.5069362915** |
| 95th percentile surrogate | **−0.7241805612** |
| Maximum surrogate | **+6.4135436350** |
| Surrogates at least as predictive as LP2 | **0 / 1,500** |
| Add-one finite conditional upper-tail | **1 / 1,501 ≈ 0.00066622** |

This holds under a null that retains more of the source structure than unrestricted per-word rune permutation. It demonstrates **predictive positional dependence under the specific prechosen motifs**. Because the motifs themselves were selected on the full manuscript before this split, the small tail cannot establish a new cipher algorithm or correct for the wider historical hypothesis search. A generation model may produce the same effects without exposing a recoverable key.

## Forward-model adequacy: the likelihood does not separately reject M3

The same **frozen original-trained** weights score artificial ciphertext generated by the previously published lossy M1 and M3 generators in [lag5_block_echo_forward_challenge.cjs](../sims/lag5_block_echo_forward_challenge.cjs). Each model starts with independent uniform tentative GP runes and repairs an adjacent collision at probability **0.818** using the six-back T rule where defined. Only M3 adds **1.5%** independent five-back copying. These are forward-only surrogates and are not complete reversible ciphers.

We generated **5,000** full synthetic books under **each** model, preserving the original whole-word lengths. For every book, apply the same **frozen four original-trained weights and original training-baseline q**, scoring only its 1,448-word heldout half.

| Fixed heldout score | Original LP2 | M1 synthetic | M3 synthetic |
| --- | ---: | ---: | ---: |
| Predictive log-likelihood lift (nats) | **+12.424233** | mean **+1.317985** | mean **+7.520430** |
| Simulated standard deviation | n/a | 4.488701 | 4.865205 |
| Books scoring at least the original | n/a | **38 / 5,000** | **794 / 5,000** |
| Add-one conditional upper tail | n/a | **0.00779844** | **0.15896821** |
| Heldout mean T6 hits | **40** | 39.067 | 39.090 |
| Heldout mean S5 hits | **7** | 1.2148 | 1.7504 |
| Heldout mean general lag5 hits | **48** | 35.763 | 50.484 |
| Heldout mean contiguous lag5 hits | **6** | 0.8268 | 1.5348 |

**Decision:** Although the joint score is unusually high under M1 and under strict word-interior nulls, **the M3 forward surrogate is not rejected by that aggregate score**. The source's larger S5 and two-contiguous-copy counts remain relevant constraints under the earlier joint count tests, and M3 has no cryptographic inverse. Candidate ciphers must explain all these sparse events and recover an actual key and original language. This gate [ran successfully in CI 42784487866](https://github.com/FlareZ123/liber-primus/actions/runs/42784487866) from [lp2_echo_forward_model_gate.cjs](../sims/lp2_echo_forward_model_gate.cjs).

## Eight-section leave-one-out generalization

A second, stronger geographic-of-the-book challenge withholds **each of the eight originally marked nonempty $-delimited source sections** in turn. These sections have **[729, 1145, 1738, 1894, 1021, 1433, 1680, 3316] runes**, covering **all 12,956 unknown runes** without splitting the 2,896 original rune words. The source's nine individual $-delimited records include a nine-rune bridge; sections here are the eight nonempty groups after correctly merging that title/bridge into the following source-body group. This grouping is dictated by the manuscript's section structure and the full original word boundaries. Every heldout fold fits the same four historically identified feature coefficients and baseline adjacent-repeat rate on **only the other seven sections**, then predicts the omitted original section.

For each 1,500 control iterations (xorshift32 seed `0x12083301`), we independently shuffle **each heldout section's word interiors**, preserving each word's length, exact rune inventory, first and last runes and number of adjacent identical runes. The fitted weights never change with control data. This is a conditional test for whether the fixed features generalize across independently withheld original source sections, not a claim of discovery-independent replication.

| Withheld section | Source runes | Original heldout log likelihood lift (nats) | Same-fold null exceedances / 1,500 |
| ---: | ---: | ---: | ---: |
| 0 | 729 | **+2.062721** | 15 |
| 1 | 1,145 | **+0.095809** | 184 |
| 2 | 1,738 | **+2.380787** | 102 |
| 3 | 1,894 | **+3.289060** | 1 |
| 4 | 1,021 | **+0.262913** | 208 |
| 5 | 1,433 | **+2.695377** | 10 |
| 6 | 1,680 | **+4.064735** | 3 |
| 7 | 3,316 | **+8.421229** | 0 |
| **All eight fixed folds** | **12,956** | **+23.272631** | **0** |

The full-source eight-fold prediction improves over baseline in **all eight** withheld sections, but the smaller boosts in sections 1 and 4 are individually unremarkable. The combined **+23.2726308971 nats** exceeds all **1,500** joint heldout-surrogate sums, whose median is **−12.1911084**, 95th percentile **−4.3536453**, and maximum **+3.7269955** (finite-model add-one **1/1,501 ≈ 0.00066622**). This is a shared **word-local output-pattern generalization** rather than evidence of unique architecture, plaintext, a key or any independently invertible map. The features were themselves selected using all real sections in earlier research; all stated conditional tails lack discovery-wide correction.

Full regression: [`sims/lp2_echo_section_crossfit.cjs`](../sims/lp2_echo_section_crossfit.cjs). Successful on-original-source [GitHub Actions run **42785865593**](https://github.com/FlareZ123/liber-primus/actions/runs/42785865593) records all eight actual trained weight vectors, every fold, the control seed and complete aggregate. This adds a source-section predictive gate for a prospective **reversible** cipher. It does not resolve the full decryption.

## Reproduce and cryptanalytic consequence

- [Self-contained Node.js 22 CommonJS implementation](../sims/lp2_heldout_echo_predictor.cjs), with source count and input-fingerprint assertions, exact likelihood normalization, frozen parameters, deterministic constrained randomization, and zero-weight baseline check.
- Executed successfully in [manual-only GitHub Actions run **42783586395**](https://github.com/FlareZ123/liber-primus/actions/runs/42783586395), via the pre-existing lag-five workflow's `frozen-predictor` choice. The log records the original transcription SHA-256, all four trained weights, every heldout opportunity/hit count, all null summary statistics, and the positive result; runtime ~0.8 seconds on Node 22.23.4.
- Earlier basis: [word-conditioned lag-six echo](lag6-conditioned-echo.md), [S-specific lag-five recurrence](lag5-rune-specific-echo.md), [contiguous lag-five pairs and M1/M3 forward discrepancy](lag5-contiguous-echo-second-order.md), and [Agent 6's original burst-copy simulation](../sims/lag5_burst_copy_probe.cjs). These reports establish the **historical** motif selection; this experiment adds a single joint frozen likelihood test.

**Decision:** This joint ciphertext predictor validates positional dependence under a strict frozen-half null. The original-compatible M3 forward surrogate means the scalar score alone cannot identify a mechanism. Progress requires an **independently recoverable key and exact reversible inverse**, plus accurate predictions of the sparse S5 and contiguous-copy counts. The predictive gain is a structural fingerprint rather than decrypted language.
