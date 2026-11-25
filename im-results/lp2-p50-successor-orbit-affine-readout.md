# Terminal table: complete successor-orbit affine readout

Agent49, 2026-11-25. **Exact negative for the specified readout, no original unknown plaintext recovered.**

The signed 2016 “numbers are the direction” clue motivates treating the 256-cell table as a successor map f on addresses 0..255. The terminal 76+85+95 runes match its cell count; the 32×8 rectangle has a 76-cell rim and 180-cell interior. These are conditional selectors, not an authenticated cipher description. Test whether the table itself directly encodes terminal plaintext via an arbitrary common affine combination of its address trajectory:

    P_i = a + sum_k b_k (f^k(i) mod 29) mod 29.

This covers all polynomial orders, including arbitrarily long finite paths, because the entire 256-dimensional integer vector orbit eventually repeats. Duplicate columns can be collected into their earlier occurrences; the constant intercept is also included. It does not cover nonlinear functions of paths or independent address-specific functions. The latter are unconstrained by this model. No p55 ciphertext is used to select coefficients. If feasible, the next step would predict p57 from p56 and solve p55 only at identifiable positions; an original ciphertext replay would still need an independent cipher mechanism.

Two alignments fixed before the test: row-major terminal pages in order; or clockwise rim from top left for p55, then row-major interior for p56 and p57. Both radix59 (delete f) and radix60 are tested. p56 is decoded by consecutive prime-minus-one shifts with its verified nonconsuming F at offset 56. p57 is clear. Also test the literal printed p56+p57 runes. The pinned source blobs are corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and grid 2550eae357442912220e05dc51147523a61dd75a.

| Radix | Layout | Full feature rank | p56 rank | p57 rank | Combined rank | Result |
|---:|---|---:|---:|---:|---:|---|
| 59 | row | 38 | 36 | 34 | 36 | Both individually inconsistent; combined plaintext and printed inconsistent |
| 59 | rim | 38 | 36 | 35 | 37 | Both individually inconsistent; combined plaintext and printed inconsistent |
| 60 | row | 37 | 33 | 35 | 36 | Both individually inconsistent; combined plaintext and printed inconsistent |
| 60 | rim | 37 | 34 | 35 | 35 | Both individually inconsistent; combined plaintext and printed inconsistent |

Radix59 has 39 distinct orbit columns (transient 38, cycle 1). Radix60 has 46 (transient 24, period 22). Exact GF29 Gaussian elimination finds a contradictory equation even for either solved page independently in all four cases. This is distinct from direct graph unary folds, the red-event successor affine cipher, or contiguous byte-window predictors: the regressors here are the complete repeated-address orbit, and the target is the terminal label sequence itself.

Constructed controls use deterministic coefficients to generate complete 256-label synthetic targets. All systems accept their generated labels. The following figures distinguish actually correct predictions from those uniquely determined by the training equations; agreement at nonidentifiable positions can occur by chance. These controls test algebra, not authorial provenance or language recognition.

| Radix/layout | p57 correct /95 (fit on p56) | p57 determined /95 | p55 correct /76 (fit on both) | p55 determined /76 |
|---|---:|---:|---:|---:|
| 59/row | 95 | 95 | 73 | 73 |
| 59/rim | 93 | 93 | 75 | 75 |
| 60/row | 91 | 91 | 75 | 75 |
| 60/rim | 93 | 93 | 74 | 74 |

Retire this affine orbit readout without coefficient or degree sweeps. A genuinely different, independently sourced operation is required. This does not exclude every graph or table interpretation. Reproduce: `node sims/lp2_p50_successor_orbit_affine_readout_sft.cjs`. Raw output: [JSON](lp2-p50-successor-orbit-affine-readout.json).
