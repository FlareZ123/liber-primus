# Terminal numeric grid: all-secret quadratic known-interior gate

**Decision (Agent18, 14 November 2026):** A stationary polynomial of total degree at most two in the current and preceding original table-cell residues cannot map the 32×8 number table onto the final three LP2 pages under nine source-natural readouts. Every tested configuration contradicts independently solved p56/p57 symbols even when **all six coefficients are free secret field elements**. This is a bounded, nonlinear exclusion. It recovers **no unknown-page plaintext, key, historical instruction or continuation address**.

## Causal premise and input

The source-original LP2 pp49–51 contain a 256-token 32×8 number table. Separately p55/p56/p57 contain 76/85/95 GP29 runes, also totalling 256. Concentric peels of the printed rectangle have lengths 76,68,60,52, giving a literal exterior/known-interior split. The p56 prime-totient plaintext and p57 clear runes supply 180 authentic terminal targets to infer, without using or fitting any of p55's 76 unknown glyphs. See `resources/liber-primus/lp2-grid-256.json` and `resources/liber-primus/lp2-corpus.json`; the source-pinned p56 inverse advances the prime clock on all runes except its one literal F at local index56.

A human reader could plausibly try an elementary two-input numerical rule on adjacent or vertically neighboring table cells given the 8-column printed register and established interest in simple mathematical operations. **No original instruction actually selects either polynomialization or the final-page alignment.** The candidate is an independently testable mathematical hypothesis rather than an asserted historical cipher.

For original table residues `x[i]=byte[cell[i]] mod29` and `y[i]=byte[cell[(i-lag) mod256]] mod29`, test every secret coefficient vector in

```text
target[i] = a0 + a1*x[i] + a2*y[i] +
            a3*x[i]^2 + a4*x[i]*y[i] + a5*y[i]^2 (mod 29).
```

This includes arbitrary constants, both individual quadratic terms, and the nonlinear interaction term. Original table readouts are direct printed row-major, plus all eight concentric outer-to-inner ring traversals from four corners and either winding direction. Freeze lag1 (adjacent cell in that readout) or lag8 (source table width); test both terminal known registers: authentic decrypted p56 plus clear p57, and literally printed p56 plus clear p57. No coordinate or polynomial coefficient is chosen by English scoring.

## Exact result

There are **9 table readouts × 2 registered targets × 2 source-width lags = 36** frozen models. Each yields 180 target equations for 6 unrestricted GF29 coefficients. All **36/36** original feature matrices have rank6. **Zero configurations** admit a full 180-rune fit. Following exact modular Gaussian elimination, the smallest number of inconsistent augmented rows among the 174 post-pivot equations is **163**. This number is *not* a minimum Hamming mismatch count over all possible secret polynomials; it is an exact algebraic inconsistency certificate in a particular elimination order. The entire original GP ciphertext is kept unchanged.

Six independently planted six-coefficient controls using the same original table geometry (row-major, one ring start and another ring start; both lags) infer the precise secret coefficients from 180 synthetic known outputs and recover **76/76** concealed outer symbols. Thus the reported original failure is not caused by an unidentifiable polynomial basis, a broken finite-field solver, or a too-small held-out region.

**Reproduction:** [the standalone CommonJS original-input SFT](../sims/lp2_terminal256_quadratic_known180_sft.cjs) requires only Node.js 22 and the two committed original-source JSON files. It asserts all page lengths, the p56 authentic clock, nine unique table readouts, 36 failures, the exact minimum163 and all six planted controls.

## Decision and remaining routes

Retire this exact **stationary total-degree-two, two-cell lookup** across these original grid readouts. The result extends the previous [all-secret linear, 2D stencil and Hill4 known-interior gates](lp2-terminal256-original-inner-separable-gates.md) to a small nonlinear family without fitting unknown p55. It does **not** exclude an authored page-dependent state, a table-to-key map rather than table-to-text, a different table serialization, a non-polynomial function, or a rim-only p55 secret which has no reason to reproduce the known inner symbols.

Do not increase polynomial degree or retune table coordinates just to rescue the 163-row contradiction: those new freedoms lack a source-selected operation. A genuine next step requires independent historical or original-image instructions sufficient to select an executable nonlinear inverse and predict known plaintext before p55 is examined.
