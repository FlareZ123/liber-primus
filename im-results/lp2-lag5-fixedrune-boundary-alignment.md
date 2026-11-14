# Fixed-ciphertext word-boundary alignment of LP2 lag-five echoes

**Agent43, 14 November 2026.** Original-ciphertext-fixed conditional test; **no recovered unknown plaintext, historical key or selected decoder**. This addresses a different null from [the earlier within-word shuffled-rune study](lag5-contiguous-echo-second-order.md).

## Exact original observation

The unknown LP2 pages 0–55 hold **12,956 GP29 runes** in **2,896 complete semantic words**, reconstructed with all 32 page-spanning carries. The full original rune stream has **479 five-apart equal-rune positions among 12,951**. The real printed words enclose **104/2,105**, leaving **375/10,846** comparisons that cross one or more word breaks (4.9406% vs 3.4575%). **Nine** within-word adjacent pairs of five-apart equalities occur. The raw rates overlap and are not independent Bernoulli trials.

Previous conditional results randomize runes within each source word while freezing word boundaries. Here *all 12,956 actual source rune identities and absolute positions are frozen* in every null book. Only printed word-length order is shuffled. This tests whether actual source **word boundaries align unusually with already-existing five-apart ciphertext echoes**.

## Original-preserving nulls

**A. Chapter-inventory shuffle:** permute whole-word length order independently in each of the nine visually delimited LP2 chapters, preserving each chapter's exact ciphertext runes and word-length multiset. Chapter word counts are **158,255,383,437,224,326,378,669,66**. This may reposition page carries.

**B. Physical-page/carry-preserving shuffle:** hold fixed the **55 rune-bearing physical page lengths**, the **22 breaks exactly at page turns**, **32 original words carried across page turns**, and the exact leading/trailing fragment lengths of those carried words. Shuffle only complete interior word fragments within their original physical page. The overall 2,896-word length inventory and all page-turn geometry are unchanged. This tighter null also preserves the original rune stream.

For each lag L the algorithm precomputes absolute-rune-position prefix counts of equal symbols L positions apart, and of two adjacent such comparisons. Each permuted word contributes prefix-sum differences over its new interval, without changing the ciphertext. **2,000 training draws** freeze mean/SD; **5,000 independent heldout draws** supply upper-tail and family maximum p values. Xorshift32 seeds are **0x436a5501** (A) and **0x43ca7711** (B). The single family is maximum absolute standardized signal over L=2..10; the adjacent-pair family is maximum positive standardized signal over L=2..7.

| Original-source null | 104 L5 singles against null mean ± SD | Fixed L5 p | Family L2–10 p | 9 L5 adjacent pairs against null mean ± SD | Fixed L5 p | Family L2–7 p |
| --- | --- | ---: | ---: | --- | ---: | ---: |
| A: nine chapter inventories | **77.605 ± 7.943** | 0.000600 | **0.012398** | **2.891 ± 1.590** | 0.001000 | **0.008198** |
| B: exact physical pages and carried word fragments | **80.201 ± 7.672** | 0.002799 | **0.021796** | **4.0465 ± 1.620** | 0.009198 | **0.043791** |

Observed lag5 single z is **3.32** under A and **3.10** under B; adjacent-pair z is **3.84** and **3.06**. A positive artificially planted five-back copy at indices 5–7 of all **343** original-format words of length at least eight produces **699** detected adjacent lag-five pairs, validating the detector. The main result modifies **no original rune**.

[Reproducible original-input Node22 CommonJS SFT](../sims/lp2_lag5_boundary_alignment_sft.cjs) · [Successful Windows Node22 Actions run 43588587564](https://github.com/FlareZ123/liber-primus/actions/runs/43588587564).

## Next cryptanalytic decision and limits

Under two length-inventory-constrained nulls, the **original printed word boundaries are unusually aligned** with the already observed five-apart ciphertext echoes. It is therefore premature to dismiss all printed separators as independently randomized decorative segmentation. A candidate decoder should predict where its five-step output coincidences fall relative to original word boundaries, along with the 86 source adjacent doublets and near-flat GP29 marginals. This could direct a source-selected word-local feedback, copying, or conditional delimiter scheme; **none is currently specified by an authentic Cicada operation**.

These p values correct only the declared short-lag families, not every cipher considered historically. Nulls A and B use the same underlying ciphertext and are **not independent**, so their p values cannot be multiplied. The observation is compatible with content-dependent placement of delimiters and rare chance alignments, as well as with a word-local cipher. It is **not** a decryption, key, recovered sentence or source-authenticated operation.
