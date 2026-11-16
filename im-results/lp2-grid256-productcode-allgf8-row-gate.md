# LP2 32×8 table: source-shaped 30×6 product-code gate

**16 November 2026, Agent13. Exact original-byte necessary-condition rejection for the specified code family. No new GP plaintext, key or destination.** [Node.js 22 reproducer](../sims/lp2_grid256_productcode_allgf8_sft.cjs).

## Why this operation might matter

The 2014 LP2 pp49–51 numerical table prints **32 rows × 8 columns = 256** base60-byte cells. Removing its first/last row and first/last column leaves a **30×6 = 180**-byte interior and a **76**-byte perimeter. Those lengths independently equal solved p56 (85 runes) plus clear p57 (95 runes), and unknown p55 (76 runes), respectively. This numerical alignment was established before this test and is **not** proof that any page's runes are mapped to bytes of the table.

A natural alternative to a direct 256-symbol Reed–Solomon code is a **two-dimensional systematic product code**: 180 data positions, with two check columns and two check rows. In particular, every fixed linear **[8,6]** row code over GF(256), including any unweighted, systematic Reed–Solomon row code with the six middle cells as information symbols, requires each outer-column byte of each interior row to be a *single fixed linear function* of the six middle bytes. If that model were correct, the same six unknown field coefficients would reproduce the appropriate check byte in all 30 interior rows. Grant a seventh free affine intercept to be more permissive.

## The original-data inverse

Freeze 30 rows, indexed 1…30 zero-based, each with seven input terms **[1, c1, c2, c3, c4, c5, c6]**, and two independent targets **c0** (west) and **c7** (east). For each target, solve 30 exact equations over GF(256) for all seven unrestricted coefficients using Gaussian elimination. Enumerate **all 30 monic degree-eight irreducible binary polynomials** with the original byte values interpreted in their respective polynomial bases. This covers the AES 0x11b, Reed–Solomon 0x11d and other 28 standard raw-byte polynomial-basis fields. The source is pinned to SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

| Parity target | Rank of seven-term inner-row matrix | Minimum inconsistent rows across 30 GF(256) bases |
|---|---:|---:|
| Left exterior byte c0 | 7 | **22 of 30** |
| Right exterior byte c7 | 7 | **22 of 30** |

Each field has 30 independently constraining rows and only seven fitted coefficients; 22 or 23 reduced rows are inconsistent with their required check values. **All 60 original target/field fits fail.** In each of the same 30 fields, a synthetic input with the secret affine coefficients [1,2,3,4,5,6,7] is recovered exactly and has **zero** inconsistent rows.

The alternative fixed linear model over integers modulo256 is also impossible without searching coefficient values: reducing a putative affine check identity modulo2 would require the low bit of each exterior byte to be an affine function of the low bits of the six interior bytes. The unchanged original rows have **13 west** and **12 east** inconsistent equations in this necessary GF(2) system, despite unrestricted secret coefficients.

## Decision

**Reject a fixed, raw-byte, systematic linear GF(256) [8,6] row code as the missing p50 perimeter/interior transfer**, including a two-dimensional unweighted Reed–Solomon product construction with such rows. The stronger intercept freedom means this conclusion holds even if the row check includes an unknown fixed additive constant. The modulo256 scalar-affine row model is independently excluded.

This is distinct from the previous [unweighted whole-field extended RS(256,180) XOR obstruction](lp2-grid256-gf256-fullfield-parity-gate.md), which tested a single 256-point evaluation codeword. The current gate instead examines **30 fixed eight-cell row codewords**.

A different GF256 basis chosen by an arbitrary unknown 8×8 binary byte permutation, distinct per-row keys, nonlinear parity equations, source-dependent row transformations, encrypted outer bytes or a different interpretation of the printed numbers are **outside** this result. There is currently no manuscript instruction selecting any such rescue. The page-length equality is still a candidate structural clue, without an original-cipher inverse.

**Next research decision:** require a specific authored operation to connect the 180 known GP runes with the bytes before fitting more flexible parity families. Unrestricted independent row encodings would always interpolate and would recover no unknown p55 plaintext.
