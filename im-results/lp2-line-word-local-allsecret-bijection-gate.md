# Independent line and word secret-alphabet gate on original LP2

**Decision (11–12 November 2026):** Original LP2 cannot come from GP29-encoded ordinary English under **one arbitrary secret 29-symbol alphabet per printed line** or **one arbitrary secret alphabet per canonical word**, even granting 594 or 2,896 unrelated hidden keys, respectively. Arbitrary within-unit transposition also leaves the tested invariant unchanged. The result is conditional on source word/line units reflecting plaintext and the sampled language register; it yields no unknown plaintext or original key.

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

## Adjacency-conditioned robustness on the independent-word family (12 November 2026)

**Incremental decision, Agent30:** The all-pairs/one-secret-alphabet-per-word theorem above already excludes the natural per-word bijection family. A separate original-source control now asks whether its apparent language mismatch is merely the already-known scarcity of identical *adjacent* runes, rather than a more general shortage of repeated word letters. This is a diagnostic of the **same excluded family**, not a new independent cipher exclusion or a decipherment.

Of the 2,896 original words, exactly **2,834** contain **no adjacent equal GP29 runes**. On just these words, the original has **731 pairs of equal runes at nonadjacent positions** out of **19,415 eligible nonadjacent pairs**. For each of the checked-in Gibran, Emerson and Shakespeare controls, retain **only GP29-encoded words that likewise have zero adjacent equal runes**, then independently select 1,000 control word sets per author with the **identical filtered original word-length pattern**. Each source contains all required lengths.

| Native-GP control, conditioned on zero adjacent equal runes | Minimum nonadjacent equal pairs | Mean | Replicates ≤ original 731 |
| --- | ---: | ---: | ---: |
| Gibran | **873** | 962.864 | **0/1,000** |
| Emerson | **918** | 1,003.374 | **0/1,000** |
| Shakespeare | **906** | 989.522 | **0/1,000** |

This comparison removes the trivial adjacent-doublet difference **before** testing within-word nonadjacent equality. Even so, none of the 3,000 matched native-language controls is as collision-sparse as original LP2. It is an empirical finite-register robustness check, not a claim that every possible English text has higher counts. The control conditioning assumes no within-word transposition in the hypothesis being screened, since a transposition changes which equal pairs are adjacent; the earlier unconditional all-pair invariant applies even if word order is transposed.

The [separate CJS SFT](../sims/lp2_perword_bijection_collision_sft.cjs) uses pinned control seed `0x42c12577`, checks the exact 2,834-word/731-pair source measurement, and includes an independent **2,896-secret-alphabet plus within-word-transposition positive plant** recovering 12,956/12,956 native-GP symbols. **No plaintext, historical key, or new reversible decoder follows.** Further word-bijection tests are low priority without a new source-selected operation.

## Complete word-reset linear-progressive additive family

The verified solved p56 uses a symbol-changing prime/totient shift. As a clue-adjacent extension, consider the **entire** 29-slope family of word-reset arithmetic shifts with one arbitrarily unknown additive offset for each individual word:

\[
C_{w,j}=P_{w,j}+b_w+s j\pmod{29},
\quad b_w\in\mathbb F_{29},\quad s\in\mathbb F_{29}.
\]

Here j starts at zero at the beginning of each canonical word, s is one bookwide slope, and all **2,896 independent word seeds** b_w are unconstrained secret values. For any frozen s, undoing the progression leaves only a different unknown Caesar shift for each word. Accordingly the within-word equality-pair count of the deprogressed text is **exactly** the plaintext count under every possible assignment of the 2,896 secret seeds; arbitrary within-word permutations do not change it.

All **29/29** slope values were tested on the original 12,956 symbols. Slope zero gives the original 811 pairs; the global maximum is just **1,123 pairs at slope23**, with the runner-up slope9 at **1,111 pairs**. Every slope is below **1,215**, the minimum of the 1,200 exact-length-matched solved-Cicada-register samples already fixed above. This is a necessary-condition exclusion of the entire word-reset global-linear-progression family under that register, with no recovery of a real key.

A 2,896-independent-secret-word-seed GP29 arithmetic-progressive planted cipher at s=23 round-trips **12,956/12,956**, and its symbol-pair count is exactly restored after removing s. The extended [Node 22 CI run 43126922385](https://github.com/FlareZ123/liber-primus/actions/runs/43126922385) passes. This is evidence against one simple genuinely intra-word-varying mechanism, not a general exclusion of nonlinear within-word states, independent word-specific slopes, or p56's changing prime/totient operation.

## Complete per-word secret-offset/secret-slope GP29 affine lexicon gate (12 November 2026)

The prior test kept one common progression slope across all source words. This exact source-original extension grants every one of the **2,896** printed words its own arbitrary, hidden additive offset and its own hidden linear slope:

\[
C_{w,j}=P_{w,j}+a_w+b_w j\pmod {29},\qquad a_w,b_w\in\mathbb F_{29}.
\]

Every word has 29×29 = **841** potential keys. The original ciphertext word's length and every second finite difference mod29 are invariant under all of them. The condition is also sufficient: if all second differences match a plaintext candidate, its first two rune differences determine the unique offset and slope. Therefore one source-lexicon lookup decides the entire secret-key family for each word, without selecting or searching keys.

A frozen 32,228-word Latin lexicon combines the repository's TextBlob spelling list, Shakespeare first-300k, Gibran, Emerson and the solved LP1/p57 source reference. Each word is encoded using the established GP29 orthographic glyph groups, known C/K, S/Z, NG/ING, IA/IO, solved U/V, plus permissive Q/QU normalization. Original line/page wraps preserve continuous words, totaling **2,896 words and 12,956 runes**.

| Original word length in GP runes | Original words | Admit any source word after any offset/slope |
|---:|---:|---:|
| 1 | 83 | 83 |
| 2 | 448 | 448 |
| 3 | 720 | 720 |
| 4 | 513 | 493 |
| 5 | 317 | 43 |
| 6 | 256 | 1 |
| 7 | 216 | **0** |
| 8 | 156 | **0** |
| 9 | 78 | **0** |
| 10 | 52 | **0** |
| 11 | 32 | **0** |
| 12 | 18 | **0** |
| 13 | 4 | **0** |
| 14 | 3 | **0** |

**None of 559 original words having seven or more runes** can result from any 32,228-lexicon word through any offset/slope pair. For the 815 words having six or more runes, just one six-rune sequence, EA-A-E-TH-L-AE, admits a candidate, REVOIR. Physical p55's thirteen-rune B-EA-F-X-I-M-U-C-P-H-NG-L-EO admits none.

[The standalone Node SFT](../sims/lp2_word_independent_affine_lexicon_sft.cjs) verifies all 2,896 original source-word records; authentic solved p57 GP orthography recovers **95/95** original rune symbols. For an independent source-native planted correctness control, **559 independently offset/slope keyed words, totaling 4,644 runes**, each admit their original plaintext and invert exactly. The known p57 words belong to the generous lexicon, so that authentic control verifies spelling and does not independently estimate unknown vocabulary coverage.

**Decision and limits:** All *per-word independently affine GP29 shift keys* are excluded for plaintext composed exclusively of this finite GP-native English vocabulary under original printed word segmentation. This test does not exclude English spellings absent from the dictionary, proper names, alternate languages/registers, different word segmentation, higher-order/nonlinear state, deletions/insertions, or multi-rune encodings. It discovers no authentic unknown-LP2 plaintext or key. Avoid further slope tuning without independent evidence selecting a different model.

## All-secret independent per-word polynomial pads through degree eight (13 November 2026)

**Original-input extension beyond the unrestricted two-parameter affine case.** The previous per-word test allows two independent parameters per printed word. This extension grants **up to nine freely chosen GP29 coefficients per word**, with the polynomial degree selected separately for every word. A source-visible printed word of length \(L\), indexed \(j=0,\ldots,L-1\), follows the hypothetical cipher

\[
C_{w,j}=P_{w,j}+\sum_{k=0}^{d}a_{w,k}{j\choose k}\pmod{29},\quad 0\le d\le8.
\]

The Newton/binomial basis represents every polynomial of degree at most \(d\) over \(\mathbb F_{29}\) on the source lengths \(L\le14\). All \(a_{w,k}\) are unconstrained, independent secrets, so the experiment does not try guessed keys. The **complete key-independent test** is that the \((d+1)\)-st discrete forward difference of the ciphertext word must equal the same-order difference of a candidate GP-native plaintext word. This condition is both necessary and sufficient for a polynomial pad of degree at most \(d\): the first \(d+1\) source differences determine the Newton coefficients, including when \(L\le d+1\) and the condition is automatically satisfied.

The independent lexical register uses the same GP transliteration, source-authentic word parsing, and reference sources as the preceding affine test. Its current TextBlob/Shakespeare/Gibran/Emerson/solved-page fixtures produce **32,232 distinct Latin word forms**, compared with 32,228 in the earlier frozen affine run; the additional forms leave the original affine tallies unchanged. The original manuscript has **2,896 words**, including **559 of length at least seven**, **109 of length at least ten**, and **25 of length at least twelve**.

| Greatest freely chosen polynomial degree per word | Compatible original words / 2,896 | Compatible length ≥7 / 559 | Compatible length ≥10 / 109 | Compatible length ≥12 / 25 |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 1,048 | **0** | **0** | **0** |
| 1 | 1,788 | **0** | **0** | **0** |
| 2 | 2,127 | **0** | **0** | **0** |
| 3 | 2,380 | 44 | **0** | **0** |
| 4 | 2,585 | 248 | **0** | **0** |
| 5 | 2,719 | 382 | **0** | **0** |
| 6 | 2,791 | 454 | 5 | **0** |
| 7 | 2,841 | 504 | 54 | **0** |
| 8 | 2,869 | 532 | 82 | **1** |

This is a **whole-manuscript obstruction to arbitrary word-independent polynomial pads of any degree from zero through eight**, under the tested English lexicon and exactly preserved source word boundaries. In particular, all 559 original length-≥7 words fail the quadratic-or-lower source-word signature, even though each cipher word can have its own 29³ candidate key triples. At degree eight, the only compatible original word of length at least twelve is length-twelve **word ordinal 512**, with the isolated candidate **diametrically**. The other 24 original words of that length class have zero candidates, including every length-thirteen and length-fourteen word. The unique candidate is merely a high-degree numerical fit, **not plaintext recovery**; no manuscript clue specifies its word, the degree-eight polynomial or the required nine secret coefficients.

The original-input [single-run CJS reproducer](../sims/lp2_word_independent_polynomial_allsecret_sft.cjs) checks the 12,956 exact source rune indices, source-correct word parsing, 95/95 known p57 cleartext GP runes, and the original counts for every degree. For **each** degree 0 through 8 it also generates an independently keyed native-English positive plant over all **559 long-word slots**, proving exact inverse recovery of **4,644/4,644 runes** by the true secret polynomial and preservation of the source dictionary signature. All original-cipher assertions and planted controls passed in [manual-only GitHub Actions run 43340450767](https://github.com/FlareZ123/liber-primus/actions/runs/43340450767). The updated reproducer also **reconstructs every proposed word's secret Newton coefficients directly from its candidate plaintext and printed ciphertext**, then verifies exact forward encryption; those reconstructed coefficients invert all 559 independently keyed plant words per degree. This supplies an executable complete inverse whenever a future independent clue genuinely selects a plaintext word.

**Cryptanalytic decision:** Do not extend the prior independent per-word affine-key search to degree-two, degree-three or any degree-eight-or-lower fixed-polynomial pad while assuming printed word-preserving English: even unrestricted unknown word keys cannot meet the original's long-word finite-difference constraints. This does not exclude text absent from the pinned lexicon, non-English source material, changing within-word state beyond a fixed low-degree polynomial, different segmentation, transpositions between words, or multi-symbol transformations. No original cipher, key, unknown-page plaintext or destination has been recovered.

## Independently secret second-order GP29 word streams: all coefficient pairs (13 November 2026)

The physical p15 Fibonacci-prime clue motivates an evolving two-state key rather than a position-polynomial pad. The earlier [source-complete Fibonacci-specific word inverse](word-fibonacci-key-inversion.md) already excluded its two fixed forward/reverse recurrences. A stronger, algebraically complete extension now allows **each printed original word to choose its own two freely secret recurrence coefficients and its own two free starting key symbols**, without assuming Fibonacci coefficients, shared seeds, a common phase, or a globally reused recurrence:

\[
C_{w,j}=P_{w,j}+K_{w,j}\pmod{29},
\quad K_{w,j}=a_wK_{w,j-1}+b_wK_{w,j-2}\pmod{29}\quad(j\ge2).
\]

Each word therefore has **29⁴ = 707,281 unconstrained key tuples**. The source does not select this particular additive family; the finite-field and Fibonacci references motivate testing it cheaply as a possible word-local key evolution rule.

**Exact inverse without key search.** For a proposed plaintext word, calculate every inferred pad rune \(K_j=C_j-P_j\bmod29\). Then solve all linear equations \((K_{j-1},K_{j-2})\cdot(a,b)=K_j\) over GF29. Rank-two systems recover the unique coefficient pair; rank-one systems admit at most 29 pairs; rank-zero systems handle the zero-register degeneracy. Each candidate pair is checked against **every** position of the complete word, with the two starting residues inferred directly from the first two source symbols. This is a complete existence test across every possible secret coefficient/seed quartet; no beam, guessed recurrence, phase, score threshold, or arbitrary cipher key is involved.

Run the exact source GP29 English 32,232-form lexicon against all **559 original words of length seven or more**, maintaining their original GP digraph lengths and page-spanning word boundaries:

| Printed original word length | Original words | With any source-lexicon candidate | All candidate word forms |
| ---: | ---: | ---: | ---: |
| 7 | 216 | 30 | 34 |
| 8 | 156 | **0** | **0** |
| 9 | 78 | **0** | **0** |
| 10 | 52 | **0** | **0** |
| 11 | 32 | **0** | **0** |
| 12 | 18 | **0** | **0** |
| 13 | 4 | **0** | **0** |
| 14 | 3 | **0** | **0** |
| **Total ≥8** | **343** | **0** | **0** |

Thus **343 independent original long words fail even this four-secret parameter family**, including all 109 length-ten-or-greater words. The 34 isolated seven-rune lexical fits are expected to become easier as the word-length-to-parameter ratio approaches the four-key degrees of freedom; no candidate is independently selected by a historical clue or validated by any second passage. None is reported as recovered plaintext.

The [original-source CJS SFT](../sims/lp2_word_independent_order2_allsecret_sft.cjs) asserts all 12,956 canonical original rune indices, exact word boundaries, and all 95 authentic p57 known-cleartext GP runes. It also builds an independent new \((a_w,b_w,K_{w,0},K_{w,1})\) for each **559** matched-length native-English control word, verifies a compatible recovered key by solving from observed ciphertext and a proposed source word, and exactly inverts **4,644/4,644 planted runes**. All checks, including the preceding polynomial regression, passed in [manual-only GitHub Actions run 43342582423](https://github.com/FlareZ123/liber-primus/actions/runs/43342582423).

**Research consequence:** Do not spend further computation tuning the two Fibonacci seeds or scanning arbitrary GF29 second-order coefficients separately for each original word under native GP29 English. The entire independently keyed two-state **linear** recurrence class fails its necessary full-long-word compatibility test. This leaves nonlinear state transitions, cross-word information, different plaintext registers/segmentations, secret per-position permutations, and external key material genuinely open. No unknown plaintext, author-selected key or destination is recovered by this exclusion.

## Inversion controls and reproducibility

A different random secret 29-rune alphabet is independently assigned to every unit. Each planted GP-native ciphertext is reversed using the true per-unit inverse alphabet, recovering **12,956/12,956** positions. The within-unit equality invariant is preserved exactly: the 594-independent-line-key plant has 7,780 matching pairs and the 2,896-independent-word-key plant has 1,409. The reproducible PRNG uses initial state 0x3301a033.

The full regression, including original source assertions, the authentic solved-text control, all 29 arithmetic-progressive slopes and a reversible 2,896-secret-seed plant, passed in [manual Node 22 CI run 43126922385](https://github.com/FlareZ123/liber-primus/actions/runs/43126922385). Existing manual-only workflow was extended; no per-commit CI hook was added.

**Consequence for decrypting LP2:** Reject the class of all line-static and word-static monoalphabetic GP29 ciphers under the tested English registers, including independent Caesar shifts for every word or line and their within-unit transpositions. The all-secret global-linear-progression word-reset family, independently secret polynomial word-pads through degree eight, and independently secret two-state linear word recurrences also fail under the stated finite lexicon. Prioritize a source-indicated genuinely nonlinear within-word operation, alternate register, segmentation, or multi-symbol transform. These are still open research routes. This experiment recovered no authentic key, unknown page plaintext, or continuation destination.
