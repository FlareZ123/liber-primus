# LP2 pages 28 and 42: an aligned, symmetric residue-difference anomaly

**Classification:** reproducible exploratory structural lead with calibrated family-wise significance for a defined statistic. **No recovered plaintext or key.** First identified by Agent 11 on 2026-11-10. This page consolidates the evidence, its limitations, and the strongest next cryptanalytic test.

## Why this pair is interesting

When two pages use the **same additive keystream modulo 29** at corresponding rune positions, the unknown key cancels:
```
C_A[i] = P_A[i] + K[i] (mod 29)
C_B[i] = P_B[i] + K[i] (mod 29)
D[i] = C_A[i] - C_B[i] = P_A[i] - P_B[i] (mod 29).
```
For two independent plaintext strings with a **common rune marginal** q, the residue difference histogram has a **symmetric circular autocorrelation** `Pr(D=d)=sum_x q[x]*q[x-d]`, hence `Pr(D=d)=Pr(D=-d)`. This is a testable *necessary pattern* under this key-reuse model, not a sufficient condition proving it.

Across the canonical 55 rune-bearing unsolved LP2 pages (12,956 runes and 2,896 rune words), there are **1,485 unordered page pairs**. At the same within-page rune offset, pages **28 and 42** (archive JPEG scans 45 and 59) show the strongest deviation of the **symmetrized 29-bin residue-difference histogram** from uniform. The pages contain 269 and 272 runes respectively, giving 269 aligned comparisons. Both original JPEGs have been visually inspected: they are distinct manuscript pages, with different artwork and rune layout.

Observed residues `D=C_28-C_42 (mod29)` for the 269 aligned runes, counts for residues 0 through 28:

```
[21,6,15,16,5,17,14,9,6,7,8,9,12,5,5,4,5,4,7,12,4,5,9,18,12,3,15,10,6]
```

There are 21 exact rune coincidences (vs `269/29=9.28` expected under independently uniform symbols), but raw coincidence counts **do not** survive family-wise calibration. The defining feature is the **roughly even frequency of positive/negative residue pairs** combined with nonuniformity.

Define `H_d` as the difference counts and `E=n/29`:

```
S_sym = (H_0-E)^2/E + sum_{d=1}^{14} (H_d+H_{29-d}-2E)^2/(2E).
```

This is the 14-degree-of-freedom symmetric component of the ordinary 28-degree-of-freedom Pearson chi-square. Also define two supporting statistics: ordinary `chi = sum_d (H_d-E)^2/E`; and cross-half profile agreement `cov = sum_d (H_first[d]-n_first/29)*(H_second[d]-n_second/29)`. These are overlapping statistics on the **same data**, not independent confirmations.

| Statistic | Observed pair 28/42 | Family-wise p over 1,485 pairs |
|---|---:|---:|
| Symmetric difference chi-square | **65.200743** | **2/1001 = 0.001998** |
| Ordinary difference chi-square | 74.148699 | 26/1001 = 0.025974 |
| Cross-half histogram covariance | 116.206897 | 8/1001 = 0.007992 |

**Null:** for each of 1,000 trials (fixed PRNG seed 404), independently circularly rotate each of the 55 page rune streams, then rescan **all** 1,485 page pairs and record the *maximum* for each statistic. This retains every page's exact rune multiset and internal adjacency cycle while scrambling physical alignment across pages. The symmetric maximum-null median is about 39, the 95th percentile **46.92424**, and 99th percentile **53.62405**. Only one of 1,000 surrogate maxima reaches the observed 65.200743. Exact full run and positive control: [GitHub Actions 42743234601](https://github.com/FlareZ123/liber-primus/actions/runs/42743234601).

These are *family-wise permutation p-values for fixed statistics*. The symmetric statistic was chosen **after noticing** the initial ordinary chi-square anomaly; the tests do not correct for the broader human/model selection of statistics. The two supporting p-values describe related, partially dependent consequences of the same unusual histogram. An independent, precommitted prediction or plaintext recovery is needed before an identified cryptographic mechanism can be claimed.

## Conditional two-time-pad decoders: bigram lead, stronger trigram negative

Assume the same additive key was used at corresponding positions. Then the observed difference `D[i]` eliminates the key, constraining 29 possible plaintext-rune pairs at each position. Both models optimize two simultaneous GP-rune plaintexts by Viterbi dynamic programming, using the real page-specific rune-word boundaries. English language models are trained on the first **240,000 characters** of `resources/control/shakespeare_first300k.txt`; the held-out remaining 60,000 characters supply independent Shakespeare passages masked by the **same random additive key** as a positive control. For each model, test all cyclic shifts of page 42's runes while preserving the original word-boundary mask.

| Decoder | Genuine held-out shared-key control | Real LP2 pages 28 and 42 |
|---|---|---|
| Smoothed character bigrams | True shift ranks **1/269**, first plaintext recovery **36.06%** of GP runes | Original shift ranks **1/272**; optimized score -1349.496, second-best -1354.196; output gibberish |
| Smoothed character trigrams | True shift ranks **1/269**, first plaintext recovery **68.77%** of GP runes | Original shift ranks **47/272**; optimized score -1268.526, best shifted score -1252.156; output gibberish |

The order-3 model more than doubles the recovered information in the known true-key control and **does not support the original alignment** on the real target. Therefore the initially encouraging bigram rank is not robust to a stronger linguistic model. This materially weakens the specific hypothesis of a *shared additive key over ordinary Shakespeare-like English plaintext*. It does not rule out another plaintext register or a more complicated shared transformation.

**Exact reproducibility:**
- Bigram source `sims/relative_key_english_probe.cjs`; [successful run 42743752448](https://github.com/FlareZ123/liber-primus/actions/runs/42743752448).
- Trigram source `sims/relative_key_trigram_probe.cjs`; [successful run 42744414946](https://github.com/FlareZ123/liber-primus/actions/runs/42744414946).

Neither run's real-page optimized strings are readable and neither is a cryptographic recovery. The rank tests remain secondary exploratory diagnostics, not independent family-wise evidence across 1,485 pairs.

### Additional mechanistic constraints

The solved-LP1-English-to-GP-rune marginal predicts elevated difference probabilities near residues 0, ±14 and ±8, whereas the actual pair's distribution emphasizes 0, ±3, ±5 and ±6. The empirical English-difference log likelihood ratio against uniform on the real pair is approximately **-0.24 natural log units**. The model-predicted symmetric chi-square at n=269 is approximately 31 (versus observed 65). The unexpected symmetry thus does **not** match the specific difference pattern expected from independently sampled ordinary English texts.

The page-number separation happens to be 14, but the 41 pairs separated by exactly 14 pages average symmetric chi-square only about 14.38, and only page 28/42 among them exceeds 26. No general period-14 key-reuse cluster has been demonstrated. The aligned word-delimiter overlap in the pair is **12**, essentially the independence expectation **12.29**.

## A further cross-validated affine scale: factor four

A plain-English additive-key model would give `D_i=P28_i-P42_i`, but the actual difference histogram overrepresents 0, ±2, ±3, ±5, ±6 and is a poor fit to the unscaled English-GP difference distribution. This suggests the more general, explicitly falsifiable model

```
D_i = m*(P28_i-P42_i) + delta (mod 29),     m in 1..28.
```

Fit **812** scale/offset templates, obtained from the English-GP rune marginals of the 240,000-character Shakespeare training sample, using **only the first 134 positions** of the page pair. The fitted maximum is `m=4,delta=0` (the symmetry of the underlying iid difference model makes `m=25,delta=0` an equivalent template). The fitted model's log-likelihood improvement against independent-uniform runes is **+6.63251 nats** in the training half and **+6.28655 nats** in the untouched second 135 positions. The same model is the top scorer on both halves independently.

**Independent reference-register check:** repeating the 812-model fit with the [Wulfic canonical solved-LP1 English translation](https://raw.githubusercontent.com/Wulfic/Cicada3301-Liber_Primus/f038274969449660fff5450b229bb96b510ec079/data/canonical/liber_primus_translation.txt), encoded into GP runes under the same digraph convention (**2,939 reference runes**), also selects **m=4,delta=0** from the first half (+7.36926 nats) and again independently in the second half (+7.52431 nats). The full 269-position histogram's Pearson residual against this fitted distribution is **40.11 for 28 nominal degrees of freedom**, indicating imperfect but plausible marginal fit. This is replication of the *template fit* across two plaintext references, not independent reproduction of ciphertext evidence, because both checks use the same selected LP2 page pair and similar English symbol distributions.

For a proper control that includes the initial page-pair selection, **1,000** independent per-page cyclic rotations (PRNG seed 2026) repeat this *entire* pipeline: select the maximum-symmetry pair from all **1,485 pairs**, fit all 812 models on the selected pair's first half, score its second half. Only **7/1,000** surrogate selected pairs have heldout score at least 6.28655: add-one `p=8/1001=0.007992`. Requiring *both* the observed symmetry 65.200743 and heldout fit exceeds the target occurs in **1/1,000**: `p=2/1001=0.001998`. The null 99th percentile of heldout score is **5.87235**. This is a materially tighter hypothesis than arbitrary symmetric histogram shape, albeit motivated *after* inspecting this pair. The p-values do not account for exploratory selection of the factor-family itself.

Source `sims/relative_key_scale_validation.cjs`; [successful GitHub Actions run 42745361435](https://github.com/FlareZ123/liber-primus/actions/runs/42745361435). An algebraic planted control checks all 269 inversions of `D=4(P-Q) mod29`, with inverse 4 equal to 22 modulo29.

The stronger trigram Viterbi decoder was rerun with `D'_i=22D_i mod29` (source `sims/relative_key_trigram_probe.cjs`; [successful run 42744935164](https://github.com/FlareZ123/liber-primus/actions/runs/42744935164)). The scaled real pair improved from **rank 47/272** to **rank 13/272** cyclic alignments; the optimized strings remain mostly gibberish. The positive synthetic shared-key control for the unscaled model still scores rank1/269 at 68.77% accuracy. **This is evidence for a candidate marginal relationship, not for recovered passages or a proved factor-four cipher.**

## Current interpretation and next genuinely discriminating tests

The **same-offset, symmetric cross-page difference anomaly** is reproducible, and a **factor-four affine marginal relationship** is preferred after training-half selection and heldout evaluation. The most concrete candidate is common additive key material with transformed plaintext symbols, `C28=4P28+K` and `C42=4P42+K` modulo29. The linear relation alone does not justify accepting this construction: joint trigram English decoding still fails to reveal readable plaintext, the model family was suggested after inspecting the anomaly, and original source images have not been independently transcribed glyph-by-glyph.

An alternative transformation, non-English rune-plaintext register, structural coupling of pages, or a rare but real null-tail event may explain the same evidence. Separation by 14 pages is incidental under current measurements: the other 40 page pairs at that separation show no comparable aggregate effect. Aligned word-delimiter overlap is 12 versus 12.29 expected under independent layouts.

**Useful next work**: a word-level constraint solver or richer lexicon test on the *pre-specified scaled model*; independent page-level predictions such as a shared reconstructed keystream passing held-out glyphs; and image-level adjudication of all relevant transcription symbols. If true plaintext is discovered, both pages must re-encrypt exactly under the **same** extracted key stream. Until that occurs, this belongs in `im-results/` as a significant provisional investigation, with no claim of solved pages.
