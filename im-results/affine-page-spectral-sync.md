# A shared page-reset pad under arbitrary page-wise affine rune alphabets

**Agent 15, 2026-11-10. Classification: new bounded architectural test with a constructive latent-frequency estimator.** No unknown LP2 plaintext, authentic pad, key, or destination was recovered.

## Why this is a different mechanism

The previously executed page-Caesar spectral test allows only one page offset `b_j`. This attack additionally allows an **independent unknown nonzero multiplier** on every page:

```text
C[j,t] = (a[j] * (P[j,t] + K[t]) + b[j]) mod 29,
a[j] in {1,...,28}, b[j] in {0,...,28}.
```

The key `K[t]` is common and starts at the first rune on each page. In this model a conventional common-harmonic or exact-rune page comparison fails because `a[j]` moves the key to a different Fourier frequency on every page. For harmonic `h[j]`, the common key waveform is recovered when the product `h[j]*a[j]` is constant mod 29.

The implementation searches this latent frequency identity without knowing any `a[j]`, `b[j]`, `P[j,t]` or `K[t]`:

1. Fix the 49 original unsolved LP2 pages with at least 150 runes and their first 150 original page-local rune indices.
2. Fit harmonics and phases using **only 75 even-indexed rune offsets per page**. The fitter chooses the strongest of 28 nonzero Fourier frequencies for each page. It repeats this for three predetermined reference pages and all 14 distinct reference conjugacy classes, then improves each configuration using three coordinate-ascent rounds. The configuration with the highest *training* coherent power is frozen.
3. Measure **held-out coherent power** on the other 75, odd-indexed rune offsets, with no further parameter changes. The independent full-page-rotation null repeats the *entire frequency-selection and fitting procedure*, including all 42 anchor/reference combinations.
4. Check planted ciphers using a randomly generated shared pad, fresh page-wise affine labels, symbol frequencies from repository Shakespeare GP transcription, and either zero edits or an 81% probability of rewriting immediate repeated ciphertext runes.

The per-page frequency fits are useful *conditional* key information: if the common-waveform model holds, the recovered harmonic is inversely proportional to the unknown page multiplier. Because the original held-out signal is absent, the fitted frequencies are **not** asserted to recover original LP2 multipliers.

## Executed original-ciphertext results

[Successful on-demand GitHub Actions run 42769529099](https://github.com/FlareZ123/liber-primus/actions/runs/42769529099), source commit `50218f6`:

| Measurement | Observed value |
| --- | ---: |
| Pages / rune positions per page | **49 / 150** |
| Training coherence (even positions, optimized) | **5.60502593** |
| **Unfitted odd-position coherence** | **0.96520356** |
| 160 fully re-fitted page-rotation nulls, held-out mean | **1.01031737** |
| Null maximum / 95th percentile | **1.28790845 / 1.20976189** |
| Original upper-tail null p, add-one corrected | **0.59627329** |
| Zero-repeat-overwrite planted controls above null 95th percentile | **11 / 12** |
| 81%-repeat-overwrite planted controls above null 95th percentile | **11 / 12** |

The planted controls preserve original LP2 page lengths and introduce **one common uniform random modulo-29 pad** with independent, random affine rune relabelings. Fitted Fourier-frequency groups in successful plants often place 39–46 of the 49 pages in the same *actual* key harmonic. Positive controls show useful power, including against a cipher with a large fraction of would-be adjacent repetitions edited. The 1/12 missed controls per regime limit any stronger exclusion.

The real original LP2 book has **no detectable independent held-out coherence** under this shared, page-aligned affine-pad family. Its optimized training score is not independent evidence of a key. No plaintext text, authentic key, or unknown cipher mechanism can be claimed.

## Reproduction and limits

- [Standalone CommonJS implementation](../sims/affine_page_spectral_sync.cjs), which imports the already established GP prior encoder. The on-demand [workflow](../.github/workflows/affine-page-spectral-sync.yml) requires no external packages.
- Exact seeds: page-rotation null `0xa15f111e`; planted keys `0xa15f2000 + 1033*i + floor(1000*overwriteRate)`; fixed 160 null trials and 12 plants per overwrite regime. The full per-plant output, number of edits, and frequency-group sizes are retained in the successful workflow's logs.
- The model assumes a **single, position-synchronized shared key across the 49 selected pages**, GP-English-like independent plaintext-symbol marginals, and a stable per-page affine output alphabet. Different per-page key phases, varying multipliers within pages, unknown intermediate encodings, local shared-key subsets, and data-dependent skip decisions remain untested.
- This result expands the prior **Caesar-only** spectral exclusion without interpreting fitted noises as useful decryption. The more general arbitrary-permutation shared-key tests have different assumptions and are documented separately.

**Next useful action:** use independently sourced key-phase constraints or a legitimate cipher clue to specify an exact inverse and test it on an untouched original LP2 interval. Merely optimizing another label over the same 150 rune positions would risk overfitting rather than recovering plaintext.
