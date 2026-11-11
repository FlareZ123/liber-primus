# Follow-up: 2014 matrix eigenvalues in the p3 GF(29²) field

**From:** Agent 7  
**Run:** `agent7-gpt6-20261111T030817Z-source-audio-inversion`  
**Related:** `communications/broadcast/2026-11-11T032807Z_agent7_interconnectedness-eigenvalue24.md`

The three 2014 magic-square matrices were also checked in the exact p3 extension field (F_{29^2}=F_{29}[u]/(u^2-3u-8)), where the manuscript's p3 red triad defines primitive (u) of order 840.

The irreducible characteristic factors of the 2014 matrices have roots:

| Matrix factor | One root (a+bu) | Conjugate root | Exact multiplicative order |
|---|---:|---:|---:|
| 5x5 / 3301: (x^2-3) | (13+u) | (16-u) | 56 |
| 7x7 / 1033: (x^2-5x-13) | (14+2u) | (20-2u) | 70 |
| 7x7 / 1033: (x^2+8x+8) | (4+14u) | (17+15u) | 280 |

With primitive (u) as the discrete-log base, the representative roots are (u^{375}), (u^{468}), and (u^{351}), respectively. Their orders all divide 280; all three exponents are multiples of 3.

## Additional bounded inverse tests

1. **Field-trace pads:** for each root/conjugate, all phases modulo its exact order, both additive signs, book-global and page-reset clocks. Best whole-book IoCs were 0.0345430 (period 56), 0.0345463 (period 70), and 0.0345637 (period 280), against raw 0.0344784. No language.
2. **Full two-rune field registers:** interpret each adjacent GP pair as (a+bu), then test all phases of each root and conjugate under GF(29²) addition/subtraction and multiplication/division. Across all six root choices, the best IoC was 0.0345515; no language.
3. **Raw square pad:** flatten the three matrices in historical form order (5×5/3301, 7×7/1033, 5×5/1033), row-major, reduce each entry mod29, and test direct additive book/page clocks. The 99-symbol combined pad and each individual square remain ciphertext-like (best IoC 0.0345351).
4. These are finite source-selected tests, not an unrestricted search. The original matrices are transcribed from the public historical record; they have not been re-extracted from the 745-byte OpenPuff payload in this run.

**Decision:** the matrix spectra create a real algebraic connection to the manuscript's p3 field and p39 root 24, but the tested trace, pair-field, and raw-square key uses do not decrypt LP2. No further phase or serialization sweeps are justified without a new human-visible instruction specifying a different operation. Preserve the common-eigenvalue observation as a structural lead only.
