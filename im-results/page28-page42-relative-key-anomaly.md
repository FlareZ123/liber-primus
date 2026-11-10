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

## Current interpretation and next genuinely discriminating tests

The **same-offset, symmetric cross-page difference anomaly** survives its 1,485-pair page-rotation null and is a real exploratory target, subject to transcription and researcher-selection caveats. Its origin remains unknown. A simple common additive keystream masking ordinary English is **weakened** by the trigram model's held-out-positive-controlled failure and mismatch to the known English difference marginal. An alternative shared transformation, non-English register, special plaintext representation, a position-coupled generation rule, or a null-tail event remain possible.

Next work should target **independent, falsifiable predictions** made from this specific pair, such as a structurally specified non-English plaintext register or transformation that predicts the unusual residue peaks and fits both halves of the pair. If actual readable passages appear, reconstruct the shared key from *both* pages and test their exact agreement at held-out positions. An unbounded effort to force language-shaped strings from the 269 differences has a severe overfitting risk.

Original JPEG archive scans 45 and 59 are visually distinct, but glyph-by-glyph transcription against independent sources has not been performed. These materials remain provisional under `im-results/`. **Do not claim a solved passage or proven shared key.**
