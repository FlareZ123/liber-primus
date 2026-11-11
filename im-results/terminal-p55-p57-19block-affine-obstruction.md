# The terminal 19×4 / 19×5 known-plaintext bridge: exact affine obstruction

**Classification (11 November 2026):** new, bounded, all-secret-key original-input rejection of one literal terminal-page bridge. The tested original ciphertext remains unsolved. This result excludes a particular code architecture rather than identifying the historical creator's intended mechanism.

## Human-readable source selection and hypothesis

The manuscript's final two text-bearing physical pages have source-constrained lengths **p55 = 76 ciphertext runes** and **p57 = 95 established plaintext runes**, separated by the independently solved p56. The solved p57 *PARABLE* has **19 body words** and says that one must “shed our own circumferences” and “find the divinity within.” The arithmetic gives a complete **19×4 / 19×5** grouping: 76/19=4, 95/19=5. A possible literal meaning is that the 95-runic known message represents 19 five-rune codewords whose one-rune “circumference” is removed to leave 19 four-rune words. Another is a four-input/five-output error-checking or affine transport from p55 into the known p57. Neither relation is historically instructed, and the two pages are not adjacent. The grouping is *hypothesis-forming*, not independent confirmation of a cipher.

This experiment is deliberately different from the established [32×8 printed table circumference and 180-rune known-interior gate](terminal-grid-circumference-knownplain-gate.md). It reads **only the unaltered 76 original p55 runes and 95 original p57 runes**, grouped in printed order, and grants the proposed map its entire secret coefficient matrix, with no table-byte key or language-model assumption.

## Six frozen original-data decisions

Let \(\mathbb F_{29}\) use the original Gematria Primus rune order 0–28. Partition p55 into 19 consecutive **four-vectors** \(A_i\), p57 into 19 consecutive **five-vectors** \(B_i\), both zero-based. Test these source-natural, *stationary* code families:

1. **Forward:** \(B_i=[1,A_i]M\) for an unrestricted secret \(5\times5\) coefficient matrix \(M\). This includes arbitrary affine maps, arbitrary four-to-five linear codes, and appended linear check symbols.
2. **Reverse:** delete one *fixed* position \(d\in\{0,1,2,3,4\}\) from each \(B_i\), leaving a four-vector \(D_i\). For each of the five \(d\), test \(A_i=[1,D_i]N_d\), with an unrestricted secret \(5\times4\) matrix. Deleting any one of the five glyph positions is allowed; secret matrices are fitted independently for each choice.

For each family, the **first five input blocks are affinely independent**: the \(5\times5\) augmented input matrix has full rank over GF29. Those five source blocks uniquely determine *every possible secret affine matrix* from the first five observed output blocks, regardless of how large a key search would be. Freeze that unique matrix and evaluate the 14 untouched blocks. There is no need to search parameter grids or infer a key from language.

| Original p55↔p57 mapping | Unfitted positions | Exact matches | Contradictions |
| --- | ---: | ---: | ---: |
| Forward 4→5, arbitrary affine code | 14×5 = 70 | **2** | **68** |
| Reverse 5→4, delete position 0 | 14×4 = 56 | **2** | **54** |
| Reverse 5→4, delete position 1 | 56 | **1** | **55** |
| Reverse 5→4, delete position 2 | 56 | **2** | **54** |
| Reverse 5→4, delete position 3 | 56 | **2** | **54** |
| Reverse 5→4, delete position 4 | 56 | **1** | **55** |

The first, decisive forward failure needs only **six** 4-/5-rune block pairs. Its sixth augmented p55 input vector is the affine combination of the first five inputs with weights

\[
(\lambda_1,\ldots,\lambda_5)=(27,8,4,5,15)\pmod{29}.
\]

Every stationary affine 4→5 map fitting blocks 1–5 therefore **must** produce p57 block six \([6,0,15,14,16]\), but the actual source block is **[21,16,3,2,18]**. All **five** coordinates disagree. The rank and linear-dependence certificate is a mathematical contradiction independent of any GP-language frequency score. The reverse variants have similarly contradictory sixth blocks (full vectors in the executable output).

## Reproducibility and positive controls

The dependency-free CommonJS [single-file test](../sims/terminal_p55_p57_19block_affine_gate_sft.cjs) reads the canonical [physical-page corpus](../resources/liber-primus/lp2-corpus.json), asserts the source page lengths and solved status, inverts five-row GF29 design matrices exactly, freezes the fitted secret matrices, and checks every one of the withheld positions. It asserts all six original mismatch counts and the exact first failure above.

Two independent planted controls construct secret affine coefficient matrices *before* generating synthetic target blocks from the unchanged original source inputs. The same five-block estimation procedure then predicts **70/70** and **56/56** withheld synthetic outputs exactly. This verifies that failure on original p55/p57 is a genuine obstruction to these models, rather than an implementation that cannot recover a valid hidden affine mapping. Exact predicted codeword equality on the held-out positions is the decision criterion.

## Consequence for the actual Liber Primus problem

The source alignment **cannot** be explained by one stationary GF29 affine 4→5 encoder, any of the five direct one-position “shed” affine decoders, or any secret Hill-style matrix in these families. Those mechanisms are rejected outright for this proposed terminal bridge. A non-affine code, historical source-selected block permutation, non-GP intermediate, keyed variable state, or a completely unrelated interpretation of the two page lengths remains possible. The original sources provide **no independent instruction selecting any of those additional operations**. Do not open a broad fitted permutation or nonlinear-code search merely to repair this finite rejection.

There is **no recovered unknown LP2 plaintext, authentic key, mechanism or destination**. The [authoritative overall synthesis](../results/README.md) remains unchanged.
