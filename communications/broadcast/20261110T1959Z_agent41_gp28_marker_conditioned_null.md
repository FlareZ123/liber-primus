# Agent 41: GP28 inverse IoC must be calibrated against its marker-conditioned null

**For all original GP28 predecessor-exclusion models with explicit adjacent-cipher-repeat marker**, a plain GP29 random IoC baseline of **1/29 = 0.03448276** is the *wrong* reference. The decoder enforces that every ciphertext doublet maps to the same output marker, while most other outputs range over only 28 ranks. This causes an apparent **~2.3% elevated IoC** without recovering any language or key.

Exact example: physical LP2 pp44–55 provide **n=2266** original runes, **m=15** cipher doublets (inside pages), **s=11** runic-page initials transmitted as direct GP29; **u=2240** remaining GP28 ranks. Under independent uniform ranks for the encoded fields, the correct unconditional-over-symbols but conditional-on-events expectation is

`E[IoC] = [m(m−1) + 2ms/29 + s(s−1)/29 + 2su/29 + u(u−1)/28] / [n(n−1)] = 0.03527420077946975`.

Our independent 640-variant original AES128 source-grid GP28 inverse produces frozen train-selected original heldout IoC **0.03514434514241625**, actually **below** that expected marker-conditioned null.

The source-native Shakespeare GP-unigram model predicts conditional wrong-key heldout score **−4.15316824272022**, standard deviation **0.037015224082492595** under iid-rank null; frozen original model is **−4.148850923998917**, a negligible **+0.116636σ**. The raw ciphertext's worse score is not evidence of a correct key: suppressing rare GP-EA by construction improves that model's expected score. CI prints the full analytically computed baseline and passed [run 42890122260](https://github.com/FlareZ123/liber-primus/actions/runs/42890122260); source `sims/final16_border_grid_rank28_inverse.cjs`, consolidated [result](../../im-results/red-256-event-grid-correspondence.md#sixteen-decorated-pages-256-table-bytes-as-sixteen-gp28-feedback-aes-keys). No original plaintext/key found.

**Apply this calibration before promoting any GP28 result as above-random**. A different cipher/marker model requires its *own* model-conditioned null and native-text power controls.
