# Independent line and word secret-alphabet gate on original LP2

**Decision (11 November 2026):** Original LP2 cannot come from GP29-encoded ordinary English under **one arbitrary secret 29-symbol alphabet per printed line** or **one arbitrary secret alphabet per canonical word**, even granting 594 or 2,896 unrelated hidden keys, respectively. Arbitrary within-unit transposition also leaves the tested invariant unchanged. The result is conditional on source word/line units reflecting plaintext and the sampled language register; it yields no unknown plaintext or original key.

## Original source and all-key theorem

The frozen input is the 55 rune-bearing LP2 physical pages p0–55, with source word and printed-line breaks. Physical p50 contributes the numeric table and zero runes. Both independently parsed partitions flatten identically to the 12,956 original GP29 indices: **594 nonempty printed lines** and **2,896 canonical words**. Printed line and page wraps can divide a manuscript word.

Within each unit u, define the exact equal-symbol pair count:

\[
E(u)=\sum_{a=0}^{28}{n_{u,a}\choose2}=\sum_{i<j;\ i,j\in u}{\bf1}[C_i=C_j].
\]

For an arbitrarily selected unknown *unit-specific permutation* \(\pi_u\), every position inside that unit obeys \(C_i=\pi_u(P_i)\). Hence \(E(u)\) and the sum over all units remain **exactly equal** before and after substitution, regardless of the keys. A transposition confined to the same unit likewise preserves its symbol multiset. The theorem covers each line/word having its own 29! key and requires no key enumeration.

| Independently keyed unit | Independent keys allowed | Original matching symbol pairs | Eligible pairs | Original rate |
| --- | ---: | ---: | ---: | ---: |
| Printed line | 594 | **4,358** | 136,831 | **0.0318495078** |
| Canonical word | 2,896 | **811** | 30,281 | **0.0267824709** |

## Matched natural-language and genuine solved-Cicada controls

The [single-file reproducer](../sims/lp2_independent_line_word_secret_alphabets_sft.cjs) uses source-original rune/line/word positions and the repository GP29 native English normalization: QU to CW; V to U; K or Q to C; Z to S; ING to NG; then longest-token GP rune matching. Shakespeare, Gibran and Emerson GP-native streams are cut into source-identical 12,956-rune windows, step 6,478, then partitioned at the **exact original LP2 unit lengths**. The 88 windows overlap and are treated as descriptive controls.

| Control | Windows | Minimum equal pairs inside source-shaped lines | Minimum equal pairs inside source-shaped words |
| --- | ---: | ---: | ---: |
| Shakespeare | 32 | **7,323** | 1,342 |
| Gibran | 8 | **7,461** | 1,284 |
| Emerson | 48 | **7,695** | 1,315 |
| **Original LP2** | input | **4,358** | **811** |

A stronger word-specific comparator samples **exactly the original word lengths**. Every target word of length 1–14 is replaced by an independently selected GP-native source word of the same rune count. No unsupported length classes are silently filled.

| Matched word-length comparator | Replicates | Minimum | Median | Maximum within-word equal pairs |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 500 | 1,230 | 1,343 | 1,450 |
| Gibran | 500 | 1,191 | 1,289 | 1,397 |
| Emerson | 500 | 1,206 | 1,316 | 1,433 |
| **Solved Cicada author register** | **1,200** | **1,215** | **1,336** | **1,437** |
| **Original LP2** | input | **811** | | |

The authentic-author comparison pools **715 GP-transliterated words** from selected original prose in the LP1 solved reference together with the p57 PARABLE runes directly from the solved LP2 image transcription. Bracketed editorial continuation lines are excluded. This pool covers every source word length 1–14. Repeated sampling of the finite pool is a check against the author's known prose style, rather than 1,200 independent historical witnesses. Every one of 1,200 control samples produces substantially more within-word equalities than the original ciphertext.

## Complete word-reset linear-progressive additive family

The verified solved p56 uses a symbol-changing prime/totient shift. As a clue-adjacent extension, consider the **entire** 29-slope family of word-reset arithmetic shifts with one arbitrarily unknown additive offset for each individual word:

\[
C_{w,j}=P_{w,j}+b_w+s j\pmod{29},
\quad b_w\in\mathbb F_{29},\quad s\in\mathbb F_{29}.
\]

Here j starts at zero at the beginning of each canonical word, s is one bookwide slope, and all **2,896 independent word seeds** b_w are unconstrained secret values. For any frozen s, undoing the progression leaves only a different unknown Caesar shift for each word. Accordingly the within-word equality-pair count of the deprogressed text is **exactly** the plaintext count under every possible assignment of the 2,896 secret seeds; arbitrary within-word permutations do not change it.

All **29/29** slope values were tested on the original 12,956 symbols. Slope zero gives the original 811 pairs; the global maximum is just **1,123 pairs at slope23**, with the runner-up slope9 at **1,111 pairs**. Every slope is below **1,215**, the minimum of the 1,200 exact-length-matched solved-Cicada-register samples already fixed above. This is a necessary-condition exclusion of the entire word-reset global-linear-progression family under that register, with no recovery of a real key.

A 2,896-independent-secret-word-seed GP29 arithmetic-progressive planted cipher at s=23 round-trips **12,956/12,956**, and its symbol-pair count is exactly restored after removing s. The extended [Node 22 CI run 43126922385](https://github.com/FlareZ123/liber-primus/actions/runs/43126922385) passes. This is evidence against one simple genuinely intra-word-varying mechanism, not a general exclusion of nonlinear within-word states, independent word-specific slopes, or p56's changing prime/totient operation.

## Inversion controls and reproducibility

A different random secret 29-rune alphabet is independently assigned to every unit. Each planted GP-native ciphertext is reversed using the true per-unit inverse alphabet, recovering **12,956/12,956** positions. The within-unit equality invariant is preserved exactly: the 594-independent-line-key plant has 7,780 matching pairs and the 2,896-independent-word-key plant has 1,409. The reproducible PRNG uses initial state 0x3301a033.

The full regression, including original source assertions, the authentic solved-text control, all 29 arithmetic-progressive slopes and a reversible 2,896-secret-seed plant, passed in [manual Node 22 CI run 43126922385](https://github.com/FlareZ123/liber-primus/actions/runs/43126922385). Existing manual-only workflow was extended; no per-commit CI hook was added.

**Consequence for decrypting LP2:** Reject the class of all line-static and word-static monoalphabetic GP29 ciphers under the tested English registers, including independent Caesar shifts for every word or line and their within-unit transpositions. The all-secret global-linear-progression word-reset family also fails. Prioritize a source-indicated genuinely nonlinear within-word operation, alternate register, segmentation, or multi-symbol transform. These are still open research routes. This experiment recovered no authentic key, unknown page plaintext, or continuation destination.
