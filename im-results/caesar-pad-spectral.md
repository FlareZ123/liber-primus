# LP2 spectral multi-page synchronization under hidden Caesar shifts (2026-11-10)

**Classification: intermediate mechanism-level negative, with a positive planted recovery.** No LP2 plaintext, key, or intended destination found.

## Hypothesis

The previously tested shared additive keystream can be hidden by an unrelated fixed Caesar-shifted alphabet on every page:

\`\`\`text
C(page,t) = (P(page,t) + K(t) + b(page)) mod29,
\`\`\`

where every \`b(page)\` is unknown and each page starts at the same position of a single keystream \`K(t)\`. Direct cross-page rune coincidence, aligned likelihood under an assumed fixed alphabet, and pairwise rune differences at a fixed zero shift cannot recognize this mechanism. The Fourier character \`exp(2πi h C/29)\` has a phase factor from each unknown \`b(page)\`, but the common key term cancels from simultaneous cross-page covariance. Consequently, the covariance should have an unusually strong *rank-one coherent component* even if the page-specific shifts have never been recovered.

This tests **one shared key stream under independent additive page-symbol offsets**, a larger class than the direct aligned fixed-alphabet model but smaller than arbitrary page-wise permutations. Unlike brute-force combinations of 29 shifts per page, a spectral method can recover the common direction in time proportional to the number of pages and symbols.

## Experiment

1. Use \`resources/liber-primus/lp2-corpus.json\` (unsolved 55 rune-bearing pages); retain 49 pages with at least 150 runes. Study the first 150 rune indices per page.
2. Encode the first 300,000 characters of repository Shakespeare English to the 29-symbol GP transliteration to derive a plaintext rune distribution. Pick one Fourier frequency **exclusively from this reference corpus** by maximal squared Fourier amplitude. This is harmonic \`h=4\`, with amplitude² **0.106095912**. Neither the harmonic nor the model is fitted to LP2.
3. For each page and each rune position, take its complex Fourier phasor \`Z(page,t)=exp(2πi * 4*C(page,t)/29)\`. On the **75 even positions**, fit the leading complex covariance eigenvector using a 120-iteration matrix-free positive-semidefinite power method. The eigenvector has dimension 49, one phase per page, and is learned without plaintext or known pad.
4. Hold the eigenvector **completely fixed** and measure its average coherent squared projection on the **75 odd positions**. In an independent flat-rune model, the null expectation of the held-out coherent power is approximately one. A reused pad under page shifts should yield a much larger value. This is held-out latent-key inference, so an in-training large eigenvalue alone cannot count as evidence.
5. Calibrate the complete training/prediction procedure with 180 independent circular rotations of original LP2 page runes (xorshift32 seed \`0x8173f9ae\`), which preserve full within-page ciphertext sequences, symbol frequencies and local anti-repeat structure.
6. Positive control generates 49 pages of lengths matching LP2 from independent GP-English plaintext runes, one shared random mod-29 pad and a different uniformly random page shift. It changes 81% of would-be immediate repeated ciphertext symbols to another random symbol, causing 358 actual repairs. The exact same fitted spectral procedure and 60 rotated null controls are applied.

## Executed evidence

[Successful manual Actions run 42743952059](https://github.com/FlareZ123/liber-primus/actions/runs/42743952059), Node.js 22.

| Measurement | Real LP2 | Planted shifted common pad |
|---|---:|---:|
| Training coherent power, even positions | 2.88387 | 6.84967 |
| **Held-out coherent power, odd positions** | **0.97356** | **5.35068** |
| Rotated-null held-out mean | 0.99595 | 1.00222 |
| Null standard deviation | 0.10968 | 0.12125 |
| Held-out standardized score | **−0.204** | **+35.86** |
| Empirical upper-tail probability | 0.5856 (180 rotations) | 0.01639 (60 rotations) |

The control's 60-rotation empirical p-value is limited by Monte Carlo granularity (1/61); its very large effect and train/test agreement demonstrate high sensitivity to the precise planted model. The real LP2 training power is elevated by normal model-selection of a principal component, while the held-out power is indistinguishable from chance.

## Interpretation and next mechanism

There is **no evidence** for reuse of a page-aligned mod-29 additive pad under arbitrary unknown per-page Caesar rotations. This spectral test is strongly powered for the tested English-like register, 49-page cohort, key alignment, and the simulated 81% doublet suppression.

This does **not** reject arbitrary page-specific alphabet permutations \`σ_page\`, unknown shifts in the *keystream position*, within-page key slips, nonlinear combiners, partial/subset reuse, or a different language. The exact reason those cases remain open is the broken phase relationship: arbitrary permutations can destroy the chosen Fourier harmonic's group structure, and random positional drift can erase cross-page coherence.

A higher-priority next extension would learn a different Fourier channel per page to cover unknown **affine multipliers** \`a_page\`, or a sequence-alignment mechanism for mid-page insertions. Both require their own held-out planted calibration. Unconstrained English-looking outputs do not satisfy cryptanalytic evidence requirements.

## Reproduction

- \`sims/caesar_pad_spectral.cjs\`, CommonJS, only built-in modules and local text data.
- Manual workflow: \`.github/workflows/caesar-pad-spectral.yml\`; no commit-triggered CI.
- The script logs Fourier frequency selection, all train/test coherent powers, random seeds, null populations, and exact planted repair count.

This belongs in \`im-results/\` as supporting negative evidence. The repo's authoritative \`results/README.md\` is unchanged; LP2 remains unsolved.
