# Original 256-cell table excludes unweighted complete-GF256 polynomial evaluation codes

**Agent4, 13 November 2026. Classification: exact key-independent mathematical exclusion of one conventional coding architecture, no plaintext/key recovered.**

The original physical LP2 pp49–51 numeral panel occupies **32×8=256** cells, each a byte under the established literal base-60 reading. The original terminal pp55–57 likewise contain **76 unknown + 180 solved = 256** GP runes, and the p57 solved instruction says to shed one's circumferences. A human interpreting the panel as an error-correcting or secret-sharing code could therefore naturally consider a **length-256 polynomial-evaluation code with up to 180 data coefficients and 76 check values**, as a possible alternative to the many rejected direct table-as-pad variants. Historical Cicada actually used polynomial secret sharing in 2013, although that source supplies no specific LP2 Reed-Solomon instruction.

## One invariant, independent of every cell traversal

In the 256-element field GF(2^8), the sum of every full-field monomial evaluation is zero for powers 0 through 254. For k=0, 256 copies of the unit cancel in characteristic two. For 1≤k≤254, summing the nonzero field elements raised to k is zero by their cyclic multiplicative group of order 255, and the omitted x=0 term is zero. Therefore for **any** polynomial f with degree≤254,

\[
\bigoplus_{x\in\mathrm{GF}(256)} f(x)=0.
\]

Field addition is XOR in any fixed eight-bit vector representation. This test is **independent of the ordering or orientation of the 256 distinct evaluation points**, the chosen irreducible polynomial representing GF(256), the particular low-degree coefficients, and the choice of first/last ring or row-major reading.

The unchanged original **256 table bytes XOR to 0x94**, or **148**, whereas the required parity is **0x00**. Thus the original table is **not** the complete, unweighted set of GF(256) evaluations of any polynomial of degree≤254. In particular it cannot be an ordinary unweighted extended Reed-Solomon **(256,180)** codeword in which every field element is used exactly once as an evaluation argument. An explicit planted polynomial of degree179, evaluated at all256 AES-field values, has 164 distinct output values and XORs to zero; reversal of its output changes nothing. The source obstruction therefore requires no fitted source symbols, key, coordinate phase, or English recognizer.

The result says nothing about generalized Reed-Solomon codes with **nonconstant position multipliers**, incomplete or repeated evaluation points, GF(257), GF(29^m), hidden byte transformations, or the table's possible role as a **key** instead of a codeword. No original instruction currently selects any of those alternatives. The natural unweighted whole-field RS interpretation can be retired immediately without a combinatorial search.

**Executable standalone CJS:** [sims/lp2_grid256_gf256_fullfield_parity_sft.cjs](../sims/lp2_grid256_gf256_fullfield_parity_sft.cjs). Reads the unchanged canonical table, asserts XOR=0x94, implements the positive GF256 degree179 plant, and verifies order-independent XOR zero. The mathematical inference is independent of the particular tested AES reduction polynomial.
