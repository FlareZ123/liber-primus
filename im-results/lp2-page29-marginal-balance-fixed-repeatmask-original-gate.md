# Is LP2's 29-symbol page balance a second cipher constraint?

**Agent32, 23 November 2026. Original-source statistical control, no new plaintext or key.**

## Actual observation

The 56 still-encrypted physical pages p0–55 contain **12,956 genuine GP29 runes**, distributed across **55 rune-bearing physical pages** (p50 is the number table with zero GP29 runes). The authentic source rune tally in [the original GP29 corpus](../resources/liber-primus/lp2-corpus.json) has only **86 equal-rune adjacent pairs** where an ordinary iid uniform 29-rune tape would have around445.

A possible further mechanism is page-by-page deliberate rune-count balancing. Fix the unadjusted source statistic before proposing a plaintext inverse: for every source physical rune page, compute `chi² = sum_{r=0..28}(f_r-n/29)²/(n/29)` from its 29 original rune counts, and sum those page statistics without changing the original page boundaries. The actual total is **1374.8117984448622**, or **24.99658 per rune page**, compared with the ideal iid uniform expectation **28 per page / 1540 overall**.

## Independent simulation changes the decision

Two seeded Monte Carlo models retain the **exact 55 source page lengths** without fitting any original rune value. Each runs 12,000 complete synthetic books with the same statistic:

| Model | Mean summed page chi² | SD | Simulations with statistic ≤ original | Lower-tail add-one probability |
| --- | ---: | ---: | ---: | ---: |
| Independent, uniform 29 rune types on each original page | 1540.0574 | 55.3374 | 10 / 12,000 | **0.0009166** |
| **Exact original location of every one of 86 within-page identical-adjacent pairs**; each other site samples uniformly from the other **28** runes | 1454.1717 | 52.1774 | 708 / 12,000 | **0.0590784** |

The second null preserves **all 86 source-realized adjacent-equality positions on their original physical pages**, while assigning random rune identities. It thereby grants a direct one-step forbidden-repeat/repeated-repeat process with precisely the pattern already known in LP2, without adding a page-specific frequency-balancing stage. This drops the apparent deficit from a ~3-SD iid anomaly to about **1.52 SD**, with a one-sided tail around six percent. Simulations are conditional comparisons, not evidence that this null was the author’s cipher.

**Decision:** the page-level near-uniformity alone is not a compelling second source mechanism. The already known extraordinary suppression of adjacent equal runes is capable of explaining most of the apparent marginal balancing. Retire page-local equal-frequency secret-key or numbered-deck hypotheses motivated only by the iid shortfall; require an independent printed cue or original plaintext before treating a page-occupancy mechanism as a cipher.

The source also has 29 rune types, and a speculative *eight-symbol no-replacement window* might be suggested by the separate 8-column table. As an immediate direct falsifier, the original same-page equality counts at lags 2–8 are **435,434,451,463,441,437,421**, close to uniform-reference expectations **443,441,439,437,435,433,432**; all seven lags contain hundreds of repeats. Any literal source-8 ban on reusing a rune within the previous eight positions is therefore rejected by the untouched ciphertext without attempting a key search. This is a bounded source-mechanism exclusion, not a decryption.

## Reproduction

[Read-only original corpus Windows Node22 SFT](../sims/lp2_original_page29_balance_fixed_doublet_mask_sft.cjs) asserts all page lengths, 12,956 source runes, 86 source-realized equal neighbors, the exact original chi-square and Monte Carlo output with seed `0x3301a932`. It uses only the pinned original corpus, a deterministic xorshift32 generator and exact original page boundaries. [Remote Windows Node22 original-input PASS 45090575089](https://github.com/FlareZ123/liber-primus/actions/runs/45090575089).

No previously unknown plaintext, source-specified encryption operation, original key or final Cicada destination was recovered.
