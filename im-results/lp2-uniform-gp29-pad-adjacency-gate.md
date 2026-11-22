# Independent uniform GP29 pad: exact original-cipher adjacency exclusion

**Agent 10, 15 November 2026. Classification: key-independent mathematical likelihood for one precise cipher architecture. No new plaintext, source-derived key, or historical cipher instruction.** This refines the pre-existing 86-doublet observation and addresses [Director issue #1039](https://github.com/FlareZ123/liber-primus/issues/1039), which asks whether an externally supplied one-time pad could explain the original LP2 ciphertext.

## Reversible model and source-independent prediction

Fix **any** plaintext rune sequence P, including an unconventional language or arbitrary source document. Let each fresh key symbol K_i be independent and uniform on the 29 Gematria Primus residues, and emit C_i = (P_i + K_i) mod 29. Pages or words may reset the key clock, provided every emitting key symbol is still an independent uniform GP29 draw. The same argument covers subtraction and every per-position bijective permutation of the fresh uniform key alphabet. These are ordinary *direct independent uniform masks*, without postprocessing or collision rejection.

For each physical page, transformation from (C_0,...,C_m) to (C_0, C_1−C_0,...,C_m−C_(m−1)) mod29 is bijective. Thus the adjacent difference residues are independent uniform GP29 values, and the indicators for zero difference are **exactly independent Bernoulli(1/29)**, despite overlapping adjacent rune pairs. This distribution is exact under the stated model, for every possible fixed plaintext and original word layout; it does not use an English-language comparator.

## Untouched 2014 ciphertext and exact likelihood

The canonical original-index dataset [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) supplies all **12,956** unknown ciphertext runes on **55** rune-bearing physical pages p0–p55 (p50 has zero runes), yielding **12,901** within-page adjacent pairs. Exactly **86** pairs have identical neighboring runes. Therefore:

| Measurement | Value |
| --- | ---: |
| Observed equality rate | **86/12,901 = 0.00666614991** |
| Independent uniform GP29 expectation | **12,901/29 = 444.86206897** |
| Exact binomial standard deviation | **20.72491249** |
| Difference from expected | **−17.31549 standard deviations** |
| Exact P(X ≤ 86), X~Binomial(12,901,1/29) | **1.07080747 × 10^−98** |
| log10 of exact lower tail | **−97.9702886058** |

The original count is distributed across **all nine visual chapters**, so this is a full-corpus observation rather than one anomalous page. The existing [original-image doublet audit](lp2-original-ink-critical-site-audit.md) supports the literal 86-rune count. This calculation deliberately skips adjacency across original physical page breaks, avoiding assumptions about page-carry encryption.

For the broader model where ciphertext symbols are independent *and identically distributed* with any stationary 29-symbol marginal q, the expected per-pair equality rate is Σ q_a², which is at least **1/29** by Cauchy–Schwarz. Biasing an independent stationary cipher alphabet therefore cannot explain the low **expected** repetition rate. The exact binomial tail above specifically requires independent **uniform** symbols; it must not be quoted as the exact tail for arbitrary biased or correlated key sequences.

## Implication for source-supplied key acquisition

A plain, fresh, independently uniform GP29 one-time pad is an extraordinarily poor explanation for the original ciphertext even if all **12,956** secret symbols were supplied in a lost historical file. Recovering just a high-entropy raw key file would also leave the **source-selected GP29 emission/encoding rule** unresolved. Pursue an original author-specified key only if its historical delivery or use can explain nonuniform, time-varying or *state-dependent* ciphertext transitions.

This result **does not** reject an independently fixed nonuniform key tape, a deterministic PRG with a deliberate collision-avoidance transform, p56's already known non-i.i.d. prime-totient key, changed word boundaries, or an intersymbol/differential cipher. In particular, it does **not** establish that a 28-successor emitter was used: the 86 equalities would still require a source-supported exception rule. The nonzero-difference histogram is retained by the reproducer as a diagnostic, without choosing a post-hoc symbol mapping.

The [single-file CommonJS reproducer](../sims/lp2_uniform_gp29_pad_adjacency_gate_sft.cjs) parses the original 29-rune corpus, asserts all 55 page lengths, counts the exact adjacent differences, calculates the binomial lower tail in log space without simulation, and prints the nine chapter counts. This is a family exclusion, **not an inverse or a decipherment**.
