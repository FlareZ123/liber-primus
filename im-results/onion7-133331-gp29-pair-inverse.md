# The 2014 onion7 133/331 pair: GF29 inverse and original-cipher frequency obstruction

**Agent 13, 10 November 2026. Classification:** an exact cross-source arithmetic observation and a bounded, executable negative for a specific source-defined two-rune decoder. **No unknown LP2 plaintext, original cryptographic key, authorial arithmetic link, or final destination has been recovered.**

## Independent historical and manuscript inputs

The preserved [2014 onion7 HTML](../resources/cicada2014-onion7-index.html) has HTML title **133**, a div identifier **331**, and **58 numbered page-image references**. The second Liber Primus release has 58 physical pages, and the [Gematria Primus cipher alphabet](../resources/liber-primus/lp2-corpus.json) has 29 symbols. These are externally fixed numbers; their relevance to each other has not been authenticated.

They satisfy four exact identities:

- `133 + 331 = 464 = 8 × 58`; `133 × 331 = 44,023 = 759 × 58 + 1`.
- Over GF(29), `133 = 17` and `331 = 12 = -17`.
- `17² = 12² = -1 (mod 29)` and `17 × 12 = 1 (mod 29)`.
- The same residues modulo 58 are **17** and **41**, and `17² = -1`, `17 × 41 = 1 (mod 58)`. Hence either source number proposes a 4-cycle multiplicative page permutation, with the other as inverse.

The numbers appear in the historical HTML source; the resulting congruences are mathematical deductions, **not historical evidence of a chosen cipher**. Reverse-digit structure and the fixed 29/58 moduli suggest an explicit finite-field test rather than further unconstrained key search.

## A source-locked reversible two-rune proposal

A GP29 two-point mixing model using the two signed roots is

[
\begin{bmatrix} C_0\\ C_1\end{bmatrix}
=
\begin{bmatrix}17 & 17\\12 & 17\end{bmatrix}
\begin{bmatrix} P_0\\ P_1\end{bmatrix}
\pmod{29}.
]

Its determinant is 27, so the inverse exists and is particularly simple:

[
(P_0,P_1) = \big(6(C_0-C_1),\,6(C_0+C_1)\big)\pmod{29}.
]

The [complete source-driven inverse](../sims/onion7_133331_pair_inverse.cjs) tests this mapping and the three signed/swap variants from the two roots. It uses all 12,956 original unknown LP2 ciphertext runes in 55 rune-bearing pages, **2,896 complete source words**, and both pair phases under each of book-continuous, page-restarted and word-restarted pair framing: **24 fixed original-input configurations**. All rune sources agree exactly, and the cipher maps whole two-rune blocks invertibly.

The highest decoded 29-symbol coincidence rate among all 24 is **0.0347510202** (page-reset phase0), close to uniform `1/29 = 0.0344827586`; the canonical book-continuous phase0 inverse yields **0.0346608281**. Its beginning transliterates `POEOINCBBNGXJTHEPUSCC...`, with no sustained readable text. A disjoint GP-encoded Shakespeare reference of the same 12,956-rune length has **0.0592783412** coincidence.

### An exact obstruction even with secret output alphabets

The inverse produces two rune channels of roughly equal length. Suppose a further unknown substitution maps each channel to GP plaintext with a **completely arbitrary 29-symbol permutation**, independently for the first and second channel. For any one plaintext rune, the most it can receive is the largest observed frequency in channel A **plus** the largest in channel B. Unpaired source runes are generously counted as *all* that target rune. This is a necessary condition that does **not** depend on knowing either substitution.

A concrete native-GP benchmark is the letter E, GP index 18, occurring **1,546 times** in the independently held-out Shakespeare 12,956-rune reference:

| Pair framing | Actual paired rune blocks | Unpaired runes granted freely | Absolute maximum E after any two secret channel substitutions | Minimum edits to permit 1,546 E runes |
| --- | ---: | ---: | ---: | ---: |
| Whole book, phase0 | 6,478 | 0 | **512** | **517** |
| Whole book, phase1 | 6,477 | 2 | **524** | **511** |
| Physical page, phase0 | 6,462 | 32 | **543** | **502** |
| Physical page, phase1 | 6,439 | 78 | **578** | **484** |
| Whole word, phase0 | 5,753 | 1,450 | 1,921 | Not excluded by this E bound |
| Whole word, phase1 | 4,307 | 4,342 | 4,705 | Not excluded by this E bound |

Allowing **different secret channel alphabets independently on every physical page** still gives only **1,006 / 1,032** possible E instances in page phases 0 / 1, with all 32 / 78 unmatched glyphs counted as E. This is a stricter family than unconstrained word-local substitution; it still cannot directly encode the native benchmark without additional alterations.

The final column is a conservative bound: changing a printed ciphertext rune in this pair transform can affect **at most two recovered plaintext positions**, so reaching the reference E count after an unknown rewrite layer needs at least `ceil((1546-capacity)/2)` altered ciphertext runes. These thresholds are specific to the reference's E count. They are **not** universal bounds for Latin, non-natural-language text or a different plaintext distribution; a changing state or nonstationary glyph register can escape them.

## True encrypted plaintext and 81% collision-repair controls

Encrypt the native Shakespeare GP control with the exact source-root forward pair matrix, then invert the output: **all 12,956 plaintext runes recovered exactly**. A separate forward control uses the existing 81%-of-tentative-doublets correction rule, replacing colliding ciphertext with a nonrepeating symbol before word-local index6 or with `24−2×C[i−6] (mod29)` thereafter. The deterministic seed `0x133331` produces **266 genuine printed-cipher edits** on a 12,956-rune encrypted English book of the same source word lengths.

Despite 266 ciphertext edits, the unchanged direct inverse still recovers **12,432/12,956 source plaintext runes**, and its output IoC is **0.0581891696**. The original LP2's best original inverse stays near **0.03475**. This is direct discrimination against a source-root pair cipher followed by *that specific* sparse collision repair. A different, more destructive or state-dependent rewrite rule remains possible.

The small page-order hypothesis from the same 58-page residues fares poorly: the previously identified 12–17 GP step arc appears in **23/54 actual sequential page joins**, compared with **10/54** in the 17-multiplier page order and **18/54** in the inverse 41-multiplier order. These are descriptive counts on a previously selected statistic, and no discovery-wide significance attaches to them.

## Decision

The historical source numbers provide an exact, constrained **candidate** for a GP29 quarter-turn and pair transform, but the direct cipher family does **not** recover native-GP text from original LP2. Crucially, an unconstrained secret permutation of each whole-book or page-wide output channel cannot rescue normal English-like letter frequencies without a substantial, otherwise unexplained edit or evolving-state layer.

**Prioritize a different mechanism if pursuing 133/331:** explicit ciphertext-position-dependent state driven by the HTML source or the manuscript's printed clues, with a key independently recovered and a held-out original plaintext interval. The arithmetical coincidences alone cannot authenticate a key.

The complete self-contained Node.js 22/CommonJS runner reads the archived HTML, original rune corpus and independent English control, enforces the 58/29 arithmetic, performs 24 original inversions, calculates all source-symbol capacity bounds and executes both true-key positives. It passed [manual GitHub Actions run 42850152363](https://github.com/FlareZ123/liber-primus/actions/runs/42850152363) with all assertions.
