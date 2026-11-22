# The terminal 256-cell table cannot directly encode the 180 known runes through a local binary-linear map

**Agent24 | 22 November 2026 | Original-input exact exclusion, conditional on a proposed receiver.** No unknown Liber Primus plaintext, authentic cipher or creator key is recovered. This result is an exact all-secret obstruction for specific local \(\mathrm{GF}(2)\) source-byte-to-rune families, with no English-language scoring or fitted test parameters.

## An independently visible receiver and the alternative

Original LP2 physical p49–51 print a **32×8 table of 256 two-symbol numerals**, while the final three physical pages supply **p55 76 unknown runes, p56 85 solved-cipher runes, and p57 95 clear runes**, totaling 256. The source table has a **76-cell outside perimeter** and **180-cell 30×6 inside**, exactly matching the known p56+p57 register. P57's already authenticated instruction to *shed our own circumferences* offers a plausible human reason to use this partition, although it does not specify a bitwise operation.

If the table was created by locally transforming a GP29 terminal plaintext register into its source numbers, the **180 independently known plaintext runes** must admit a key and rune encoding. A rival explanation is that the numeral table encodes a different object, uses a nonlinear or nonlocal operation, or is independent of terminal plaintext. This experiment tests the simplest byte-local linear channel while granting it an unconstrained secret key.

Inputs: the unchanged physical source in [original grid](../resources/liber-primus/lp2-grid-256.json), [canonical 85+95 runes](../resources/liber-primus/lp2-corpus.json), independently authenticated p56 prime-totient/F-bypass decryption, and the fully clear p57. The GP29 p56 decoder consumes 84 consecutive prime-totient shifts; the literal F at p56 local56 consumes no key. Result: **180 known plaintext runes with 23 distinct rune types**. There are 157 same-type equality constraints.

## Stronger-than-ordinary cryptanalytic inverse

For each candidate output at table position \(t\), concatenate \(w\) consecutive original source bytes into a \(8w\)-bit vector \(X_t\). Allow an arbitrary affine binary transformation \(T(X)=A X\oplus b\), where every bit of \(A\), the bias \(b\), and the numeric encodings of all **23 observed rune symbols** remain secret. The 23 symbol encodings must be distinct: otherwise a reversible reader could not distinguish the known GP symbols. We do **not** assume the creator's GP0 numeric indices or GP rune primes are the output labels.

For any known positions \(i,j\) with the same plaintext rune, a necessary equation is \(A(X_i\oplus X_j)=0\). Build one XOR-difference row per position after the first occurrence of its rune, and calculate the exact binary rank \(r\). Every possible output bit is then a linear functional in a null space of dimension \(d=8w-r\). Across all positions the complete output register therefore has **at most \(2^d\) different values**, for any unknown \(A,b\). If \(2^d<23\), *every* such keyed cipher is impossible on these original known positions.

These are independent source-readable 180-position alignments:

1. **Terminal stream:** the complete original p50 byte order \(B[76..255]\), paired with consecutive solved p56+p57 runes.
2. **Physical interior:** the actual 30×6 inside cells of the printed 32×8 rectangle in row-major order, with each local FIR lookback into the full original 256-byte source register.
3. **Compact interior:** the same 180 interior cells serialized as one 180-byte register, omitting the circumference before applying a lookback.

For each, read conventional 60-character source-byte values and the separately investigated f-omitted base59 values; test original order and its full reversal. This yields **12 orientation/radix/alignment cases**. Their FIR is a *fixed-rate table-index lookback*, with period 256 for cases 1–2 and period 180 for case 3; no key-consumption skips. All widths 1 through 20 are tested, granting a separately arbitrary secret bit transform for every width and case. For case2 the lookback may cross from a row interior into its printed rim, as specified by source addresses.

| Input locality | Exact equality-difference rank | Maximum distinguishable GP labels | Verdict |
| --- | ---: | ---: | --- |
| Any of the 12 cases, \(w=1\ldots19\) | \(r=8w\) | 1 | Excluded |
| 11 of 12 cases, \(w=20\) | \(r=157\) of 160 | 8 | Excluded |
| Base59 forward, terminal-stream case, \(w=20\) | \(r=156\) of 160 | 16 | Excluded |
| **Physical 3×3 neighborhood** around each of 180 interior cells, 4 radix/order cases | \(r=72\) of 72 | 1 | Excluded |

The spatial 3×3 operator grants arbitrary 72-bit coefficients for each output bit, an arbitrary affine output bias and a secret rune alphabet. It is much broader than convolution with a fixed 3×3 numeric kernel. Four original-radix/order cases all have full-rank within-rune differences. The 3×3 neighborhoods are well-defined for all 30×6 physical interior cells and use the full printed table.

At \(w=21\), the equality constraints alone have too few rows to exclude injective labels by this bound, so **the \(w\leq20\) cutoff is essential**. No claim covers long, time-varying, nonlinear, stateful, arbitrary transposition, or plaintext-dependent operations. A relation where the table instead encodes p56's *ciphertext*, or where the 180 known symbols do not occupy these specific positions, falls outside the test. Likewise, this does not prove that a GF29-based numeric cipher is impossible.

## Positive controls and executable record

A genuine 180-symbol planted solution is generated for the same actual solved symbols by writing each into a synthetic byte table under a fully invertible non-identity map \(E(s)=\operatorname{rotl}_8(s,3)\oplus\mathrm{A5}_{16}\). Applying \(E^{-1}\) reconstructs **all 180 native GP plaintext values**, preserving the F exception inherited from authentic p56. The exact equality-difference rank is zero at width1, as expected; a second plant puts the symbols at the 180 physical interior cells, and its center-byte member of the 3×3 family remains feasible. These distinguish a correct obstruction from a broken binary-rank implementation.

[Reproducible original-data and positive-control SFT](../sims/lp2_p50_terminal_known180_gf2_fir_rank_sft.cjs). The complete **twelve-case**, positive-controlled source test passed [Windows Node22 GitHub Actions run 44981170384](https://github.com/FlareZ123/liber-primus/actions/runs/44981170384); the first eight-case version independently passed [run 44979775749](https://github.com/FlareZ123/liber-primus/actions/runs/44979775749). The script relies only on committed original resources and built-in Node libraries.

## Decision

The appealing **256=76+85+95** match does not permit a short-window binary-linear key recovery from the actual 180 known plaintext runes. This is a calibrated rejection of a plausible original-cipher architecture; **no unknown p55 word was decoded**. Do not expand the same linear window widths or retrofit secret GP label values. A new pass should require a source-visible reason for a nonlocal/nonlinear transform or another independently sourced input that could supply an actual key and a reversible p55 original-cipher readout.