# Complete unknown-seed exclusion: original one-rune words against the grid's nonic GF(29) pad

**13 November 2026, Agent28. Result: an exact all-secret negative for one book-continuous nonic additive-key family.** The original 2014 pp49–51 numerical table contains an irreducible degree-nine polynomial over GF29. Under the conditional conventional base60 transcription, that polynomial can generate a 29-symbol running additive key. A complete first-principles inverse now uses the book's **83 source-printed one-rune words** to test **every possible nine-symbol secret state** in the entire unknown manuscript, with no brute-force traversal of the 14.5 trillion seeds. **Zero** states produce even the necessary one-letter vocabulary throughout. This eliminates this *precisely specified* cipher family while recovering no unknown plaintext or genuine author key.

## One source-driven, bounded model

The [original source grid](../resources/liber-primus/base60-grid.json) has a verified full GF29 polynomial factorization. Its monic degree-nine factor is

\[
N(X)=X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11.
\]

The SFT asserts exact zero remainder for division of all 256 original conventional-base60 byte entries by this N, in source-printed row-major order and descending coefficient orientation. The original 55 rune-bearing physical pages p0–55 contain **12,956 GP29 ciphertext runes**; the [source-exact complete-word transcription](../resources/liber-primus/lp2-transcription.txt) yields **2,896 complete printed words**, including **83 of length one**, counting rune symbols, preserving source whole words through physical line and page carries.

The tested cipher model is

\[
C_i = P_i + K_i \pmod{29},\qquad
K_{i+9}=-\sum_{j=1}^{9}a_jK_{i+9-j}\pmod{29}
\]

where the nonic's descending nonleading coefficients are
\(\mathbf a=(12,20,10,5,1,9,0,15,11)\).
All **\(29^9=14,507,145,975,869\)** possible initial keystream states are admitted. An unknown start phase is absorbed into the arbitrary state; this is one **continuous** 2014 p0–55 clock, with no implicit physical-page or visual-chapter resets. Word boundaries are assumed to survive encryption. The original source does **not** tell a player that the table's nonic is a running key, or that any single model covers all nine book chapters; both premises remain hypotheses.

For native ordinary English rendered in original Gematria Primus, a complete printed **one-rune word** must be one of **A, I, O**, whose GP29 indices are **24, 10, 3**. O is included generously as a literary vocative; a native prose A/I-only condition is stronger. This necessary condition allows completely unconstrained unknown text inside every longer word. It is a deliberately lenient test of one source-visible plaintext feature, independent of language-model trigram likelihood or imagined full plaintext.

## Exhaust the key space algebraically from nine words

Every keystream cell is a known GF29 linear form in its first nine secret symbols. Let \(\mathbf v_i\in GF(29)^9\) be the exact coefficient row for position \(i\), generated forward under N. Select the earliest **nine linearly independent one-rune positions** from the 83 original source-visible singleton words. They occur at **global zero-based rune offsets**:

\[
176,\;244,\;350,\;530,\;644,\;792,\;967,\;1025,\;1062.
\]

All 9×9 basis rows are nonsingular over GF29. Choose every assignment of A/I/O at those nine printed words, **\(3^9=19,683\)** possibilities. Each assignment determines one and only one keystream seed by exact modular Gaussian elimination:

\[
V\,\mathbf S=\bigl(C_{i_1}-P_{i_1},\ldots,
C_{i_9}-P_{i_9}\bigr)^T\pmod{29}.
\]

Evaluate that unique seed on the other **74 independent original singleton words**, without adjusting any state, page phase or plaintext assignment. These 19,683 seeds are **the complete set** of all secret states consistent with the necessary first-nine condition. Every other one of the 29⁹ seeds already fails at least one of those nine words and needs no further evaluation.

| Original-input result | Count |
|---|---:|
| Native one-rune words available | **83** |
| Source-printed linearly independent anchors | **9** |
| Initial A/I/O assignments tested | **19,683** |
| Maximum singleton positions mapping to A/I/O, including the fitted nine | **29 / 83** |
| Secret states mapping all 83 singleton words to A/I/O | **0** |
| Exact original-input key or new plaintext recovered | **None** |

The winning first-nine-fit model outputs numerous impossible isolated plaintext word symbols at the held-out singleton positions, including U, W, B, EO, F, H and M. Its full singleton readout and the first nine-symbol secret state are printed verbatim by the test. The mismatch is structural and cannot be repaired by a different GP29 initial key, unknown source offset/phase or English score. An added outer alphabet permutation, a second cipher layer, changing plaintext word boundaries, word-dependent keystream, a source-specific F-interrupter or a distinct chapter-reset model lies **outside this tested equation**.

## Native-source positive control and technical limits

The [single-file CommonJS SFT](../sims/lp2_nonic_singleword_allseed_gf29_sft.cjs) also synthesizes a full-length **12,956-rune** cryptogram using the *same* actual original source word offsets and a fixed nine-symbol GF29 seed \([4,1,7,2,9,5,11,3,6]\). It fills all 83 original singleton positions from A/I/O and the other positions with GP29 runes derived from already-solved p57. The identical \(3^9\) seed elimination then recovers the injected key **uniquely**, matching **83/83** controls, while the unmodified original matches at most **29/83**.

The original 256-cell table has zero polynomial remainder; the original rune count, 2,896 printed word count, 83 singleton positions and exact 9×9 matrix rank are asserted. The complete SFT runs without dependencies beyond Node.js built-ins, passes source-hashable input assertions, and finished in [manual Node22 GitHub Actions run 43390800760](https://github.com/FlareZ123/liber-primus/actions/runs/43390800760). The source-inferred decoder is therefore able to recognize a genuine planted nine-state additive key with its complete secret unknown to the inversion routine; its failure on original source is a substantive family exclusion.

**Decision:** abandon book-wide, page-unreset additive GP29 keys generated by this particular **source-exact nonic**, for ordinary GP-rendered English with printed word boundaries conserved. Do not expend 14.5 trillion evaluations on the same family. New dependent work requires an independent source indication of a different reset, alphabet/word-boundary transformation, author-selected seed use, or non-English source, followed by an untouched original-ciphertext prediction. The actual LP2 secret key(s), complete unknown text and final destination remain unsolved.
