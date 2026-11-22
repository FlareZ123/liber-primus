# Original p50 interior: arbitrary GP29 byte codebook with row/column XOR masks

**Independent bounded original-input gate, Agent28, 16 November 2026.** No previously unknown Liber Primus plaintext or key was recovered. A historically motivated, reversible direct route from the **180 known p56+p57 runes** to the **76 unknown p55 runes** fails exact source constraints in all twelve frozen geometries/registers. This is a mathematically complete exclusion of the stated class, including *any* secret rune-to-byte table and *any* independent byte-valued row/column XOR pads. It is not an exclusion of stateful ciphers or differently structured grids.

## Why this is a route to plaintext

The authentic original pp49–51 table is **32×8 = 256** two-character entries interpreted conditionally as bytes. Its perimeter holds exactly **76** cells, matching all **76** original p55 encrypted GP29 runes; its interior has **180** cells, matching **85** independently solved p56 runes plus **95** clear p57 runes. The original solved p57's “shed our own circumferences” motivates a perimeter/interior separation; the historically authenticated 2014 Cicada LP1 stages used **bytewise XOR** in a separate puzzle context. Neither clue establishes that these particular operands were intended to be combined by XOR. The base60 byte conversion is also provisional; radix59 remains an independent interpretation.

Consider the reversible model for every 32×8 coordinate:

```
  T[r,c] = M[P_at(r,c)] XOR R[r] XOR C[c]
```

Here T is the byte-converted original printed table, P is a rune index, M is an **arbitrary secret 29-entry GP29→byte codebook**, and R[0..31], C[0..7] are **arbitrary secret 8-bit pads**. The p56/p57 interior supplies 180 known P values. Recover M,R,C there; if consistent and sufficiently constrained, invert the perimeter to attempt p55 plaintext. No original ciphertext, key, or English text is tuned to fit this test. This is a stronger and mathematically distinct original hypothesis from a fixed GP29 additive row/column pad (already rejected by the independent 2×2-minor gate in issue #41).

## Source registers and exact decision

Inputs: `resources/liber-primus/lp2-corpus.json` (physical p56 **85** printed ciphertext GP29 indices, physical p57 **95** clear GP29 indices); `resources/liber-primus/base60-grid.json` (original physical pp49–51 **32×8** byte conversion). P56's original prime-totient inverse consumes **84** consecutive primes with plaintext-F bypass at ciphertext offset **56**; it begins **AN END** in attested GP spelling. The two independently specified 180-rune registers are (a) recovered p56 plaintext || clear p57, and (b) printed p56 ciphertext || clear p57. The six nonadaptively selected interior layouts are row-major and reversal; top-left clockwise/counterclockwise nested spirals and their reversals, always with perimeter removed. No arbitrary starting rotation, changed rune segmentation, or extra alphabet is introduced.

This linear byte-XOR model has **69** nominal unknown 8-bit variables (29 byte-map entries, 32 row masks, 8 column masks). Each interior cell contributes an equation with precisely three variables. Gaussian elimination over GF(2), carrying its 8-bit right-hand side, accepts a model **only if every zero-left-hand-side equation has a zero byte**. The data span only 23 distinct GP runes in the solved register, so the effective rank is 57 there, versus 63 for the printed register. Any nonzero contradictory byte refutes *all* secret maps and masks under that frozen layout.

| Interior traversal | Solved p56 + clear p57 contradictions | Printed p56 + clear p57 contradictions |
| --- | ---: | ---: |
| Row-major | 123 | 117 |
| Row-major reversed | 123 | 116 |
| Top-left clockwise spiral | 123 | 117 |
| Top-left counterclockwise spiral | 123 | 117 |
| Clockwise reversed | 123 | 117 |
| Counterclockwise reversed | 123 | 117 |

**All 12 variants fail exactly**. For the most natural solved-register row-major path, the first impossible right-hand side appears at known-rune offset **13**, after rank 57 is eventually reached. A deterministic **source-shaped positive plant** uses an arbitrary non-GP byte codebook and independently nonzero row/column XOR pads on the same 180 known source positions: the same checker accepts the full synthetic table with **zero** contradictory equations and rank57. This proves the all-secret solver accepts a true instance of its targeted class.

## What to pursue instead

The actual p55 perimeter remains completely undecoded. Unknown state evolution, position-dependent rune codebooks, nonlinear byte algebra, base59 treatment, and source-authored alternate traversal/operand relationships are outside this exclusion; opening an unrestricted parameter hunt to rescue this failed architecture would be unproductive. A future test needs a separate original artifact that *selects* the missing state change or key, or authentic new plaintext surviving blind p55 holdout. No change to the repository's authoritative unknown-page status is warranted.

Reproducer: `sims/lp2_p50_rowcol_xor_secretmap_sft.cjs` (Node.js 22, read-only, exact source inputs and planted positive). Related prior narrower row/column additive GP29 failure: issue [#41](https://github.com/FlareZ123/liber-primus/issues/41).