# Source-derived H/G 252-coefficient key schedules on unknown LP2

**13 November 2026, Agent 15. Original-cipher result:** A 256-cell numerical table and its established four-degree GF(29) factor yield 252 quotient coefficients. Straightforward nine-chapter, 252-period, and four-state feedback uses of this exact quotient recover **zero unknown LP2 plaintext, zero authenticated keys, and no destination**. The 14 specified full-corpus inverses are fully reversible; every decoded stream retains ciphertext-like GP29 single-symbol frequencies. This is a finite rejection of these consumers, while the table's proven H/G divisibility remains intact.

## Upstream clue and exact construction

The original LP2 numeric pp49–51 table is printed as 32 rows of eight tokens. Under the repository's original-JPEG-corrected base60 reading it contains **256 bytes** (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). The pre-existing [dual-factor reconstruction](../sims/lp2_grid_dual_factor_error_corrector_sft.cjs) connects the actual 2013 BASE29 worked example and DH parameters to two exact GF29 factors in that original table, whose monic product is

\[
F(X)=X^4+28X^3+13X^2+9X+14.
\]

Interpret the 256 physical byte residues modulo 29 in highest-power-first order as the coefficients of \(B(X)\). Division by \(F\) leaves a zero remainder and exactly **252 coefficient slots** in \(Q(X)\), the first slot being zero. This reproduces the established [code structure](../sims/lp2_grid_hg_code_structure_sft.cjs) without selecting a plaintext decoder.

The source-visible unknown LP2 chapters have exactly **nine** original red-heading-defined intervals, hence \(252=9\times28\) suggested one 28-element key row per chapter. GP29 ciphertext also shows strongly suppressed adjacent equal runes, suggesting an alternative 28-step clock. Both links are candidate uses of original structures; the manuscript never explicitly binds the quotient to this GP29 clock.

## Frozen original-cipher consumers

All tests consume the same 12,956 original unknown GP29 ciphertext symbols from pages 0–55, including all original page carries and p53 red runes. The nine visual chapter lengths are \([729,1145,1729,1903,1021,1433,1680,3008,308]\). Each inverse has both possible additive signs.

1. **Nine \(\times\) 28:** Divide \(Q\)'s 252 coefficients into nine consecutive 28-symbol rows, repeat each row within its source chapter, and subtract or add modulo 29. Test each quotient row in original and reversed order (four models).
2. **Period 252:** Repeat the full quotient as an additive GP29 key with one clock for the book, one reset per chapter, or one reset per physical page (six models).
3. **Field-polynomial feedback:** Use the last four source-printed table residues \([6,7,15,22]\) as the state of \(k_{i+4}= -14k_i-9k_{i+1}-13k_{i+2}-28k_{i+3}\pmod{29}\). Decode with book-continuous and chapter-reset clocks (four models).

These are declared mechanisms, not an exhaustive search over possible table uses or arbitrary key origins. Each of the 14 runs exactly re-encrypts the entire original input. The same implementation encrypts and recovers the known 95-symbol native GP p57 reference under every tested schedule, with shorter physical-page controls truncated consistently.

| Original-source diagnostic | Value |
| --- | ---: |
| Unchanged unknown ciphertext GP29 IoC | **0.03447840** |
| Extracted \(Q\) coefficient GP29 IoC | **0.03633087** |
| Highest IoC across all 14 full-corpus inverses | **0.03453216** |
| Genuine solved-p57 95-rune IoC (language diagnostic) | **0.06271** |
| Unknown GP29 plaintext recovered | **0 runes** |

The decoded frequencies stay close to the original's uniform distribution. All 14 rune streams lack coherent GP-normalized English, and the trivial reversible plants make clear that implementation round-tripping alone is not a decipherment. The field feedback is nontrivial and source-defined, while **which four coefficients initialize it remains unselected**: choosing the last four visible cells is merely an explicit testable convention, not authorially established.

## Cryptanalytic decision

The exact H/G factor and 252-coefficient representation survive as potential original key material or as a codeword/integrity relation. This experiment retires only direct **period-28 nine-section addition, period-252 addition, and factor-recurrence addition under the declared original clocks and seed**. A productive successor must identify a distinct original-instructed consumer of the quotient, a hidden register, or an output prediction on an unknown page before adding further arbitrary key transformations.

**Executable evidence:** [single-file CommonJS original-input test](../sims/lp2_grid_hg252_nine_chapter_sft.cjs), verified with Node 22 in [successful manual CI run 43366678872](https://github.com/FlareZ123/liber-primus/actions/runs/43366678872). Input source files and original known control are checked; no stochastic fit or scoring search is involved.
