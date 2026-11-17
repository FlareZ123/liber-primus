# LP2 common-pad likelihood: page-aligned and variable-phase original-input tests

**Status:** two bounded original-input negatives: page-aligned common-pad reuse (Agent 10, 10 November 2026) and independently free page phases/reversals for a 256-period additive pad (Agent 8, 17 November 2026). Neither identifies unknown plaintext, a key, or a confirmed cipher.

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

The simplest remaining changes require independently motivated **insertions/deletions, evolving key state, per-page key derivation, or a different cipher register**. A source-blind change of the page-start phase alone is no longer sufficient to justify another scan; the 256-period free-phase experiment below explicitly tests that possibility. Additional extensions should be selected by an original clue or an independently discriminating plaintext prediction.

## Extended original-input decision: unknown page phase and reading direction (Agent 8, 17 November 2026)

The physical **256-cell** numeric table motivates testing a 256-symbol key period without assuming a particular interpretation of its bytes. Under the stronger *all-secret* model
`C[j,t]=(P[j,t]+K[(phase[j]+direction[j]×t) mod256]) mod29`,
each physical page has an independently unknown one of **256 phases** and a **forward or backward** key-clock direction, while the entire book shares one arbitrary 256-symbol additive pad. This extends the page-start-only model above; it does not assume that p50 actually supplies the pad.

The [standalone source-native test](../sims/lp2_shared256_freephase_orientation_sft.cjs) selects the **46** original unsolved pages with at least 200 runes, freezes their first **200 original GP29 indices**, and derives a GP-native plaintext-difference likelihood from the original clear p57 PARABLE's **95 runes** (symmetric 0.4 smoothing). It fits 512 direction/phase pairs *against anchor p0 only* for each other page, without using the nonanchor pairs in fitting. Its final statistic is the mean log-likelihood ratio against uniform differences, normalized by the square root of the number of overlapping positions, over **990** nonanchor page pairs. The key cancels when correctly aligned; no actual secret key is fitted or presumed.

| Frozen discriminator | Original LP2 | Matched null, 40 independent eight-rune-block shuffles | Twelve same-length synthetic shared-pad plants |
| --- | ---: | ---: | ---: |
| Mean nonanchor pair score | **−0.24225850** | Mean **−0.24010183**; range **−0.25655150 to −0.22912396** | Mean **−0.17820378**; range **−0.23110548 to −0.12382189** |
| Positive-scoring nonanchor fraction | **0.12222** | Mean **0.12278** | Mean **0.21044** |
| Mean fitted anchor score | **0.37080080** | Mean **0.36392345** | Mean **0.42474946** |

**Null ranking:** 26/40 shuffled controls have higher nonanchor scores than original; the +1 empirical upper tail is **27/41 ≈0.65854**. The null shuffles independently reorder 25 contiguous eight-rune blocks within each page, preserving the source character inventory and most local adjacency. Crucially, *whole-page circular rotations would be invalid nulls for this free-phase hypothesis*, because arbitrary phase fitting would absorb them.

**Power control:** Each plant uses fresh random 256-rune pad values, page-specific random phases and reversals, the p57 rune prior, and 81% replacement of newly created adjacent repeated ciphertext symbols. All **12/12** plants exceed the original nonanchor score; the anchor step recovers **9–21 of 46** exact relative page phase/direction pairs per plant. This is a measured detector with imperfect phase recovery, not a universal exclusion theorem. Sensitivity checks using p0, p16, p33, p40, p47 or p54 as the training anchor give original nonanchor scores **−0.25653 to −0.23401**, without a new familywise null claim. No original key trajectory or plaintext emerges.

**Decision:** The source shows no positive evidence for an ordinary shared 256-period *additive GP29* pad even when physical pages may independently rotate and reverse its clock. The test leaves open output-alphabet changes, per-page keys, non-256 periods, state changes and lossless insertions/skips. Those require an independent selector; further unrestricted 256-grid pad variants are unlikely to recover plaintext merely by fitting more phases.

## Reproducibility

- Implementation \`sims/latent_page_pad.cjs\`, CommonJS, only Node.js built-ins.
- Opt-in workflow \`.github/workflows/latent-pad.yml\`. The workflow is dispatch-only and never runs on commits.
- The code produces a JSON report containing exact data totals, priors, scores, null seeds, numbers of null repetitions, estimated key recovery, and synthetic-control parameters. Raw reference and ciphertext inputs are stable repo resources.

This is intermediate evidence only. It does not belong in \`results/README.md\` until a stronger decipherment or structural result is established.
