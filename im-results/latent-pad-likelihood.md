# LP2 page-aligned additive common-pad likelihood (Agent 10, 2026-11-10)

**Status:** powered negative experiment for a *specific shared-key model*. No plaintext, key, or confirmed cipher recovered.

## Hypothesis

Suppose each LP2 page independently enciphers approximately English-like GP runes \`P_page,t\`, using a **single shared additive keystream** aligned at each page's first rune:

\`\`\`text
C_page,t = (P_page,t + K_t) mod 29.
\`\`\`

Pages may have different lengths, but the same position \`t\` on two pages must reuse \`K_t\`. The statistical prediction is strong across the 55 rune-bearing unsolved pages: after subtracting an unknown 29-valued \`K_t\`, all pages sharing that position should collectively resemble a common, nonuniform plaintext rune distribution. This test does not assume knowledge of the key, and is more sensitive than pairwise direct ciphertext equality for the strictly **additive, fixed-alphabet, zero-drift** model. It does not test drifting keys, independent per-page rune permutations, or independently seeded streams.

## Method and data

- LP2 numeric corpus: \`resources/liber-primus/lp2-corpus.json\` (status \`unsolved\`); 55 rune-bearing pages, with runeless page 50 omitted from the sequence data but retained in manuscript indexing.
- Reference plaintext prior: \`resources/control/shakespeare_first300k.txt\`, 300,000 characters, encoded by the 29 canonical GP transliteration labels. Normalize \`QU→CW\`, \`V→U\`, \`K→C\`, \`Z→S\`, greedily replace the seven GP double-letter symbols, then single symbols. The resulting text has **218,800 encoded runes**. Frequencies are add-one-smoothed and mixed with 10% uniform weight to avoid overconfidence in the dramatic-literature register.
- For every rune-position \`t\` with at least ten pages still contributing (272 positions), score all 29 candidate pad symbols by \`sum_pages log(29*prior[(C_page,t-k) mod29])\`, then select the highest. Sum this maximized log-likelihood across positions. This fits an independent \`K_t\` per position, so the null repeats the *same model selection* at every trial.
- Null: independently circularly rotate the complete rune stream of each original page; preserve page lengths, page-specific histogram, repeat suppression and other local dependence. Fixed xorshift32 seed \`0x71de219e\`, 250 randomized pageset rotations.
- Positive controls: retain exact LP2 page lengths, draw independent GP-like plaintext runes from the Shakespeare distribution and encrypt each under a **shared random key**; second control substitutes a random alternative symbol on 81% of would-be immediate ciphertext repeats. Each control uses a fixed PRNG seed and 80 rotations for its own null.

## Successful execution

[Manual GitHub Actions run 42741934273](https://github.com/FlareZ123/liber-primus/actions/runs/42741934273) completed successfully.

| Dataset | Log-likelihood score | Rotation-null mean | Null SD | Standardized score |
|---|---:|---:|---:|---:|
| LP2 observed | −1,742.795 | −1,720.427 | 55.636 | **−0.402** |
| Planted shared pad, no repair | +5,068.787 | −1,706.630 | 49.989 | +135.538 |
| Planted shared pad, 81% immediate-doublet repair | +4,751.301 | −1,702.749 | 58.605 | +110.128 |

Observed upper-tail Monte Carlo probability with +1 correction: **0.6693** (250 nulls). Both planted controls recover the exact key at **271/272 positions** (99.63%), despite 339 synthetic repair substitutions in the doublet-repair control. Their 80-permutation empirical p-values bottom out at 1/81; extreme standardized effects and key accuracy are the meaningful positive evidence.

### What the negative observation means

For a common page-aligned additive stream with ordinary GP-English plaintext frequencies, the model is highly sensitive and accurately recovers almost all planted keystream values. The real unsolved LP2 text scores **worse** than its circularly rotated null average. A shared pad operating in this exact way is therefore strongly disfavored for this register and alignment. This is **not** a universal rejection of common-key reuse: a page-specific substitution can erase the assumed rune labels; key start offsets or inserted/deleted runes can destroy alignment; the actual text might use drastically different rune statistics; and the ciphertext may implement context-sensitive anti-repeat repairs not captured by the control.

The immediate next opportunity is an explicit **drifting/offset model**, with controlled planted page offsets or deletions and a held-out null. Avoid repeating raw page-aligned pad tests without changing the model. Another promising direction is learning shared keystream structure from label-free multi-view statistics, as suggested by Agent 3.

## Reproducibility

- Implementation \`sims/latent_page_pad.cjs\`, CommonJS, only Node.js built-ins.
- Opt-in workflow \`.github/workflows/latent-pad.yml\`. The workflow is dispatch-only and never runs on commits.
- The code produces a JSON report containing exact data totals, priors, scores, null seeds, numbers of null repetitions, estimated key recovery, and synthetic-control parameters. Raw reference and ciphertext inputs are stable repo resources.

This is intermediate evidence only. It does not belong in \`results/README.md\` until a stronger decipherment or structural result is established.
