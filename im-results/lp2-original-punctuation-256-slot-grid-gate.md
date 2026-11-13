# Original punctuation and page breaks form 256 slots, but a stationary grid-byte decoder fails

**Agent16, 13 November 2026. Classification: source-visible structural candidate plus a key-independent, native-GP-conditional cipher-family exclusion.** This does not recover an unknown Liber Primus plaintext, secret key, destination, or authenticated authorial instruction. It is a new original-source 256-slot alignment whose most direct reversible cipher interpretation has a decisive obstruction.

## Source-visible route and the vulnerable assumption

The complete LP2 numerical table occupies physical pp49–51 and has exactly **32×8 = 256** base60 byte cells in printed order. Original LP2 unknown pp0–55 comprise **56 physical pages**, including runeless **p50**, and **12,956** GP29 runes. The canonical transcription has no empty page slot for p50, so this experiment reinstates the physical p50 blank turn between p49 and p51 while preserving every rune and all other boundaries. The restored physical source agrees rune-for-rune with all 56 pages of the canonical LP2 corpus.

The unknown text contains the following delimiter *events* in this source representation:

| Source separator | Count |
| --- | ---: |
| Ordinary period marks | **175** |
| Transcribed ampersand marks | **17** |
| Transcribed dollar marks | **8** |
| Physical page changes after restoring runeless p50 | **55** |
| **Total interior separators** | **255** |
| **Maximal intervals** | **256** |

This yields a **256-slot** sequence aligned in *cardinality* to the 256-cell table, with exactly **37 zero-rune intervals**, **219 nonempty intervals** and all **12,956** original runes unchanged. The blank intervals arise from consecutive source-visible delimiters; they must be preserved to obtain the count. Printed word hyphens and line wraps remain *inside* these intervals, so the equality depends on this particular source-boundary vocabulary. This choice is motivated by distinguishing major punctuation and physical page changes, but it was recognized retrospectively and is **not a signed Cicada instruction** to assign table bytes to intervals. Other plausible delimiters do not necessarily give 256 slots.

The most direct consumer would let each table byte select one independently secret and otherwise arbitrary fixed GP29 output-alphabet permutation for its interval. It is sufficiently generous to encompass any constant table-byte Caesar shift and any additional per-slot secret substitution key.

## Exact all-secret-key obstacle

Let G_i be the GP29 runes within printed interval i. For any per-interval 29-symbol bijection S_i, the equality of two runes within the *same* interval is unchanged by replacing each x with S_i(x). Therefore the pooled within-interval collision probability

\[
I=\frac{\sum_i\sum_{a=0}^{28} n_{i,a}(n_{i,a}-1)}
        {\sum_i |G_i|(|G_i|-1)}
\]

is exactly invariant under **all 256 independent secret alphabets**, including arbitrary table-derived choices. Empty and one-rune intervals contribute zero to both sums.

On original, unreordered LP2 ciphertext, **I = 0.033742684447855706**. For exact-layout native GP29 English controls, independently encode Shakespeare, Gibran and Emerson using the canonical 29-rune alphabet, take nonoverlapping **12,956-rune** windows, and cut *every window* at the exact 256 original interval lengths. The results are:

| Native GP source | Independent full-length windows | Minimum I | Maximum I |
| --- | ---: | ---: | ---: |
| Shakespeare | 16 | **0.058203013** | 0.062039080 |
| Gibran | 4 | **0.059354313** | 0.061199591 |
| Emerson | 25 | **0.060798235** | 0.063634910 |
| **Original LP2** | 1 | **0.033742684** | |

All **45/45** native controls lie far above the exact original invariant. This is a comparison to these specific source-native literary registers, rather than a universal language theorem or a p-value for Cicada's intentions. An arbitrary secret permutation independently generated for every one of the 256 source slots encrypts and decrypts a **12,956-rune** Shakespeare plant *exactly*, preserving this same invariant. Thus the obstruction holds with all substitution keys left completely unknown, and the plant confirms the implementation.

A second, much narrower literal inverse uses the table bytes in printed 32×8 row-major order as a **constant additive GF29 mask per aligned interval**, considering both arithmetic signs and reverse-table reading as a declared orientation control. The four full original outputs all remain near uniform IoC:

| Table orientation | GP29 inverse sign | Full 12,956-rune IoC |
| --- | --- | ---: |
| Printed | Subtract | **0.034456080** |
| Printed | Add | 0.034507818 |
| Reversed | Subtract | 0.034479399 |
| Reversed | Add | 0.034464826 |

For comparison, the original unchanged full-stream IoC is **0.034478398**. The table-byte inverses all round-trip exactly under their matching forward operations, with no extracted native-GP message.

## Decision

The **256-to-256 source count** is an economical hypothesis for which the table could address a partition of the rest of the book, but the 37 empty intervals and the postselected boundary vocabulary limit its evidential specificity. A stationary, separate symbol substitution for each interval **cannot** produce the tested native GP-English registers, regardless of the number or secrecy of alphabet keys. Direct table-byte shifts also yield no unknown-page plaintext.

A future viable table-to-interval cipher must specify an independently motivated mechanism that varies *within* intervals, changes symbol identities beyond a static per-slot bijection, changes word/interval boundaries, or uses a different plaintext register. The exact table entry and a candidate original-input inverse must be supplied before adding further tuned permutations. This result does not disprove every possible use of 256 table entries.

**Reproduce:** [single-file original-input Node22 CJS SFT](../sims/lp2_grid256_punctuation_interval_allsecret_sft.cjs); the source alignment, all-secret invariant, three controls, four byte masks and full secret-S-box recovery plant pass in [manual-only Windows GitHub Actions run 43390815578](https://github.com/FlareZ123/liber-primus/actions/runs/43390815578). The canonical source files are [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), [lp2-transcription.txt](../resources/lp2-transcription.txt) and [base60-grid.json](../resources/liber-primus/base60-grid.json).
