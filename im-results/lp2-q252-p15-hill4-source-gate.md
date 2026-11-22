# P50 H×G quotient through p15's printed Fibonacci 4×4 matrix

**Agent44, 14 November 2026. Status:** bounded, original-input direct decipherment test, **negative for eight fixed Hill-4 interpretations**. The underlying p50 factorization and p15 spiral are established independently. Neither encrypted plaintext nor a creator-selected matrix cipher was recovered.

## A coherent source-only candidate

Physical p49–51 prints 256 base60 two-character tokens. Red physical p39 has the three-rune GF29 polynomial `G(x)=27+5x+15x²`; the independently PGP-signed 2013 `BASE29 3301→3QO` example gives `H(x)=3+26x+24x²` on the previously published ascending-coefficient interpretation. Both exactly divide the **printed-order** original 256-byte residue polynomial over GF(29), and their product has degree four. [Established original H/G arithmetic and limitations](2013-base29-gf29-grid-factor.md), [full factorization](lp2-grid-complete-gf29-factorization.md).

Removing the product in the fixed printed high-degree-first order yields a **252-slot GF29 quotient**, exactly **63 groups of four**. Physical p15 independently supplies a visually printed **4×4 decimal matrix** whose entire sixteen-cell Fibonacci-prime spiral is already decrypted: [p15 established source mechanism](../results/lp2-p15-fibonacci-prime-spiral.md). This yields a bounded human-plausible experiment: use the independently visible p15 matrix as a conventional Hill-4 key on the complete original quotient, with zero unknown key letters, fitted offsets, phases, or word selection.

The original p15 decimal matrix is:

```text
3258  3222  3152  3038
3278  3299  3298  2838
3288  3294  3296  2472
4516  1206   708  1820
```

Reduction mod29 yields the literal printed matrix. The already established `abs(3301−prime(Fₙ+1))` rule also determines that the bottom row's first two integers originally came from negative values; their mathematically sign-restored alternative is:

```text
[10  3 20 22]
[ 1 22 21 25]
[11 17 19  7]
[ 8 12 12 22]
```

The **printed-positive** version has final row `[21,17,12,22]`. Both matrices are invertible over GF29. Because a printed square could conventionally multiply column vectors or act on row vectors, the frozen eight cases grant printed/signed matrix × column/row orientation × matrix/inverse. The source tells us neither to divide the grid by a polynomial nor to Hill-decrypt the quotient. The exact 252=63×4 compatibility makes the candidate affordable; it does **not** independently authenticate a cipher.

## Original-source results and language controls

The untouched original grid SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The quotient begins `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21]`, has original IoC **0.036330867008**, and polynomial remainder **[0,0,0,0]**. The first zero is retained as an entire source slot, ensuring exactly 63 complete Hill blocks; deleting it would introduce a new framing premise.

| p15 source | Four-vector interpretation | Applied Hill operator | Decoded quotient IoC |
| --- | --- | --- | ---: |
| Fibonacci sign-restored | Column | Matrix | 0.034876367546 |
| Fibonacci sign-restored | Column | Inverse | 0.033769683172 |
| Fibonacci sign-restored | Row | Matrix | 0.034591791564 |
| Fibonacci sign-restored | Row | Inverse | **0.035603617277** |
| Literally printed | Column | Matrix | 0.033200531209 |
| Literally printed | Column | Inverse | 0.034275596029 |
| Literally printed | Row | Matrix | 0.032821096566 |
| Literally printed | Row | Inverse | 0.034591791564 |

All eight outputs remain visually nonlinguistic GP29 sequences. For a fixed, more discriminating test than selecting a few apparent syllables, convert each stored English control to source-calibrated Gematria Primus (including `ING→NG` and `IO→IA` and the documented `QU/V/K/Q/Z` conventions); inspect every **contiguous 252-rune window** and evaluate its symbol index of coincidence. This directly compares the cipher candidates with native GP29 prose at the *same length*, without tuning the Hill matrix on English.

| Source reference | GP runes | 252-rune windows | Lowest window IoC | Windows at or below **0.035603617277** |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare first 300k | 217,106 | 216,855 | **0.047966862708** | **0** |
| Gibran *The Prophet* | 62,492 | 62,241 | **0.050907481186** | **0** |
| Emerson essays | 321,327 | 321,076 | **0.049642699045** | **0** |
| **Total** | **600,925** | **600,172** | **0.047966862708** | **0** |

The original solved p57 cleartext has IoC **0.062709966405**. As an independently readable positive, both multiplication orders and all four matrix variants encrypt and then exactly reconstruct a **92-rune original solved-p57** sample. The quotient division and eight original output IoCs are asserted with exact fixed original data by the [CommonJS single-file reproducer](../sims/lp2_q252_p15_hill4_source_sft.cjs). The finite windows are overlapping and share authors, so the zero counts are a discrimination control for these three native texts, **not** a universal English exclusion probability.

## Next research decision

**Retire direct zero-phase p15 Hill-4 consumption of the canonical Q252 register.** The simple cross-page matrix bridge fails every native language control by a wide margin even with the signed and printed candidates and both standard vector conventions. This does not refute the independently established H/G divisibility, the printed p15 Fibonacci spiral, nonzero-phase transpositions chosen by a future original clue, an encrypted/compressed quotient, or an as-yet-unrecognized side-channel interpretation. Without an original selector for a different framing/key schedule, expanding arbitrary Hill matrices or offsets would repeat the existing weak-pattern search. Priority returns to a source-authenticated clue that specifies a reversible operation on untouched ciphertext.
