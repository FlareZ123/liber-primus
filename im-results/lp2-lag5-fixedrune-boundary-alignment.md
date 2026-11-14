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

## Complete five-phase secret-alphabet gate

**Agent28, 14 November 2026. Source-exact GP-native-English-conditional exclusion, no recovered unknown LP2 plaintext.** The five-dot stencil independently occurs on pp7, 23 and 56, and original intact words contain 104/2,105 lag-five rune equalities. This suggests a source-recognizable but unproved hypothesis: within every printed word, one of five secret **bijective GP29 substitution alphabets** encodes the rune at phase `i mod 5`. Even if each of the 55 rune-bearing physical pages has its **own completely arbitrary set of five 29! secret alphabets**, this model has a key-independent invariant: the count of equal symbols at positions in the same page×phase class must be unchanged by every possible alphabet choice. The word's phase resets at each original word beginning, including 32 joined cross-page words.

The untouched original 2,896 semantic words contain **12,956 GP29 runes**. Across the global five phase classes, their symbol collision rates are **653,650/19,001,504 = 0.0343999**, with every individual phase's IoC **0.0343258–0.0344987**. Allowing **275 page-specific phases**, original exact equal-symbol pairs are **12,399/358,333 = 0.0346019**. A fixed permutation of each class's 29 rune symbols cannot alter any of these counts.

**Independent matched-positive English controls:** freeze all 2,896 original word lengths and original page-index assignments, then replace every word with a source-native, GP-encoded word *of exactly the same rune length*, independently sampled from three archived English texts, using 250 seeded complete-book draws for each corpus. Their **per-page five-phase** collision rates remain strictly above the observed original:

| Source-native independent text | Seeded matched books | Lowest collision rate | Median collision rate | Books at or below original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 250 | **0.0704484** | 0.0729712 | 0 |
| Gibran | 250 | **0.0697089** | 0.0722680 | 0 |
| Emerson | 250 | **0.0684922** | 0.0704791 | 0 |

The complete **750/750** length-matched controls are more than twice the original equal-pair rate. The exact same source-printed length/page layout is used in every case; this diagnostic depends on natural English-style GP rune frequencies and is *not* an unconditional theorem over every possible plaintext language. To positively test the very large secret-key family, the reproducer encrypts one complete native GP-English 12,956-rune book under **275 different random 29-symbol alphabet permutations**, then independently reverses every glyph using its correct page and phase. All **12,956/12,956 runes** are recovered; the exactly preserved equal-pair count is **26,908 before and after encryption**. This ensures that the real-cipher negative is caused by a source-register incompatibility rather than inability to implement this family.

**Decision:** retire **a direct page-reused five-phase secret-alphabet substitution** as the explanation of LP2's lag-five echoes under GP-native English plaintext with original word boundaries. The model permits an arbitrary secret 29! permutation per original page×phase; no choice of those keys can change the observed phase-conditioned collision sparsity. This goes beyond the earlier all-secret five-phase **per-word affine** test, yet does **not** exclude a fresh alphabet at every word, changes to page/word segmentation, differential encodings whose *output* is uniform, an evolving cipher state, or a non-English/non-GP intermediate. There is no solved unknown-page key. A distinct page-reused five-phase ciphertext-feedback family also fails a key-independent, source-native-English test on observable GP29 ciphertext differences, even with 275 unrestricted phase-alphabet keys. See [the complete feedback-gate report](lp2-wordfive-cipherfeedback-secret-alphabet-gate.md). The anomalous observed lag-five *within-word* alignment remains independently established above; the source has yet to identify a reversible state/key operator.

**Reproduction:** [standalone CommonJS exact-input 275-key SFT](../sims/lp2_wordlocal_fivephase_secret_alphabet_source_sft.cjs); [successful Node22 original-source CI run 43616731827](https://github.com/FlareZ123/liber-primus/actions/runs/43616731827). Both original full-rune source corpora agree at 12,956 positions, 750 heldout English controls pass, and every planted key and output is inverted.

## Next cryptanalytic decision and limits

Under two length-inventory-constrained nulls, the **original printed word boundaries are unusually aligned** with the already observed five-apart ciphertext echoes. It is therefore premature to dismiss all printed separators as independently randomized decorative segmentation. A candidate decoder should predict where its five-step output coincidences fall relative to original word boundaries, along with the 86 source adjacent doublets and near-flat GP29 marginals. This could direct a source-selected word-local feedback, copying, or conditional delimiter scheme; **none is currently specified by an authentic Cicada operation**.

These p values correct only the declared short-lag families, not every cipher considered historically. Nulls A and B use the same underlying ciphertext and are **not independent**, so their p values cannot be multiplied. The observation is compatible with content-dependent placement of delimiters and rare chance alignments, as well as with a word-local cipher. It is **not** a decryption, key, recovered sentence or source-authenticated operation.
