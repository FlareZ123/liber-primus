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

## First decoder: joint plaintext with shared additive key

Given the observed rune difference sequence, each position has 29 possible plaintext pairs satisfying `P_28[i]-P_42[i]=D[i]`. Implemented a dynamic-programming Viterbi decoder over these paired states, scored using Gematria Primus rune transliteration, a smoothed Shakespeare-trained character-bigram model, and the two pages' actual rune-word delimiters. Training uses the first **240,000 characters** of `resources/control/shakespeare_first300k.txt`, with a **held-out 60,000-character** region to create an independently keyed positive control.

Reproducibility: `sims/relative_key_english_probe.cjs`, [successful GitHub Actions run 42743752448](https://github.com/FlareZ123/liber-primus/actions/runs/42743752448).

- Real pair at the **original zero offset**: best Viterbi score **-1349.496**; **rank 1 out of 272** when all cyclic shifts of page 42's runes are rescored against page 28, keeping physical word delimiters fixed; score median **-1373.366**, second-best score **-1354.196**.
- Synthetic true shared-key control: two held-out 269-rune Shakespeare-derived passages masked by the *same* independent random additive key; zero offset **rank 1 of 269** cyclic shifts. The Viterbi reconstruction is correct at **36.06% of runic positions** for the first passage, demonstrating limited plaintext accuracy even when the key-sharing premise holds.
- The real run's two maximal-likelihood output strings are **recognizably English-like but mostly gibberish**. They are *not* asserted plaintext. A high Viterbi score/rank is an exploratory secondary indicator conditioned on a pair already selected by ciphertext statistics, not a new all-pairs FWER result.

The reference model's **single-rune marginal** differs from the observed paired histogram. The known solved-LP1-English-to-Gematria rune marginal predicts high difference probabilities especially near residues 0, ±14, and ±8, whereas the target pair emphasizes 0, ±3, ±5, ±6. The direct empirical English-difference log likelihood ratio against uniform for this pair is approximately **-0.24 natural log units**. Hence the relative-key pattern alone does not imply that the underlying pages are ordinary English.

## Interpretations and immediate research leverage

This is the strongest current **localized cross-page statistical anomaly** in this particular pairwise residue-difference scan. Shared-key encryption is a concrete *hypothesis* that could make it useful: `D_i` directly eliminates an otherwise unknown key and turns a two-page decryption into a constrained dual-language problem. Test this hypothesis with higher-order language models, a dictionary and exact source word boundaries, and independent text-register controls. If genuine English plaintext is recovered for both pages, re-encrypt each under a reconstructed *single identical key stream* and cross-check held-out positions and other pages.

Other mechanisms that could yield this pattern include a different shared transformation, language structure in the ciphertext difference, a non-English plaintext register, a non-random design feature, or an extreme of the search's null distribution. The observed effect alone **does not establish key reuse**. Original image-level transcription independence is not yet attained; both shared machine-readable transcriptions derive from the same community lineage.

Do **not** promote this to a solved passage or cipher mechanism in `results/` without actual reversible plaintext. The local scans and decoder belong in `im-results/` until such evidence exists.
