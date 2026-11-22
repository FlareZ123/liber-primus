# Original LP2 pp33–55 frozen GP29 context prediction: no heldout gain

**Decision (18 November 2026; issue #1483, Agent21):** A frozen, deliberately low-complexity, order-four GP29 ciphertext predictor trained only on physical pp0–32 has **negative** heldout predictive value on the untouched physical pp33–55. It loses **598.2172 bits** against a same-training-data first-order model over 4,996 runes. This loss is well within the variance of exact original-page-bigram-preserving randomizations, which average a loss of 556.9865 bits (SD 32.7872). The 400-trial lower-tail rank is 42/400 (plus-one 0.10723). The model demonstrably recognizes a planted, easily recoverable second-order stream, so its failure on the original is informative for the *specified* small-memory data-driven approach. **No original LP2 plaintext, decoder, secret key or intended cipher architecture follows.**

## Independently frozen original inputs and grammar

- Original GP29 numeric corpus: [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json). The complete unknown corpus contains 12,956 runes on 55 rune-bearing pages p0–55, skipping the rune-free p50 numeric table.
- **Training:** original p0–32 inclusive, 7,960 consecutive runes. **Heldout:** original p33–55 inclusive, 4,996 consecutive runes. No heldout glyph influences model selection, context counts or smoothing. All originally printed page starts remain distinct in the null; the predictor's history runs continuously across actual physical page boundaries, consistent with the 32 authentic page-carrying printed words.
- The prior-free model is hierarchical Dirichlet backoff with fixed maximum order four over the full 29-symbol alphabet. The order-zero base is `(count(y)+1)/(N+29)`. For each order `k=1..4`, `P_k(y|h)=(count(h,y)+29 P_{k-1}(y|suffix(h)))/(count(h)+29)`; unseen contexts inherit the lower-order probability. Counts and hyperparameters are frozen at the training boundary.
- Prespecified comparisons are the *same frozen model's* order-one distribution, its order-zero distribution, and the `log2(P4/P1)` gain on every untouched symbol. Top-1 predictions use a deterministic smallest-GP-index tie break. This does not attempt to learn or decode plaintext.

## Actual heldout results

| Frozen model | Total bits lost, heldout 4,996 runes | Bits/rune | Correct next rune (top-1) |
| --- | ---: | ---: | ---: |
| Order 0, empirical marginal | 24,280.8165 | 4.86005 | not required |
| Order 1, first-order baseline | 24,432.6980 | 4.89045 | 179/4,996 |
| Hierarchical orders 0–4 | 25,030.9152 | 5.01019 | 162/4,996 |

Higher-order context **adds 598.2172 bits** of predictive loss relative to the order-one model and does not improve top-1 accuracy. On the separate **95 original clear GP29 runes of p57**, after the same frozen ciphertext-trained model, order-one loss is 461.9297 bits, order-four loss 468.8592 bits; this is a small, genuine solved-language control from a different section and **cannot** prove a 4,996-rune statement by itself. The original solved encrypted p56 is not silently treated as plaintext.

## Exact first-order-conditional original test

Use the repository's [uniform original-page Euler-trail sampler](../sims/lp2_exact_page_bigram_euler_sft.cjs) implementation pattern: directed cycle popping samples a labeled-edge last-exit arborescence, followed by uniform outgoing-edge shuffles. Generate **400** independent random heldout books, using seed `0x610e527f`, keeping the 22 rune-bearing heldout page lengths (the p50 table is rune-free), endpoints and **every original per-page ordered GP29 bigram count** exactly. Original training remains fixed. Verify every directed edge count and endpoints in the first synthetic book. Every trial is scored through the identical frozen predictor and original page sequence. No null trial changes the original p0–32 training counts.

| Original-minus-null diagnostic | Outcome |
| --- | --- |
| Observed order-four minus order-one predictive gain | **−598.2172 bits** |
| Exact-page-bigram-null mean gain | −556.9865 bits |
| Null SD | 32.7872 bits |
| Null range | −660.2278 to −456.8764 bits |
| Null trials with gain ≤ original | 42/400 |
| Descriptive plus-one lower-tail rank | 43/401 = 0.10723 |

A striking original fifth-back return anomaly can therefore coexist with *lack of out-of-sample gain* for this context model. This particular statistic does not give a reliable low-entropy encoding state or next-symbol predictor. The null rank is conditional on the original source and on this single fixed predictor; it does not constitute a family-wide cryptographic randomness theorem.

## Constructive positive and negative controls

The same script builds a seeded length-12,956 second-order process: 94% of the time `x[i]=(x[i−1]+x[i−2]) mod29`, otherwise sample a uniform GP29 symbol. Train its frozen model on the first 7,960 generated symbols and evaluate its remaining 4,996. The order-four model wins **17,659.7072 bits**, predicts **4,639/4,996** correctly versus **130/4,996** for order one. Thus the chosen method has ample power to detect a genuinely compact near-deterministic state law. An independently seeded uniform-29 stream gives **−508.4878 bits** gain and top-1 counts 176 versus 178. All controls use the original data split lengths.

Reproducibility: [read-only Node 22 CommonJS SFT](../sims/lp2_context4_heldout_pagebigram_sft.cjs), with exact input, fixed smoothing and random seeds. [First successful Windows CI execution](https://github.com/FlareZ123/liber-primus/actions/runs/44318492003) demonstrates original, exact-null, plant and uniform checks. [Final Windows Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/44319048340) passes the updated script including authentic clear p57.

## Decision and limitation

This closes the frozen candidate in #1483: spend no further effort tuning short-context orders, additive smoothing or retrospective lag lengths against the known holdout. Model architecture is deliberately modest and its negative gain **does not exclude** secret-state encryption, context-tree families with independently sourced parameters, long-range hidden state, non-GP intermediate alphabets or genuine plaintext-based decoding. A future positive route needs a first-party state or key selector and a blind original-cipher inverse, rather than another model fitting the same 12,956 observations.