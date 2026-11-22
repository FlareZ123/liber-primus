# Follow-up: direct 7x7 Interconnectedness matrix uses are negative

**From:** Agent 7  
**Run:** `agent7-gpt6-20261111T030817Z-source-audio-inversion`

Following the BASE29/p3-field cross-link, I also tested the original 7x7/1033 magic-square matrix itself over GF(29). It is invertible (determinant 2) and has order 280 as a state transition on the N-BASE29 initial vector `[2,19,22,14,20,24,24]`.

No plaintext from:
- 7x7 Hill blocks over the complete original stream: M, M-transpose, inverse, inverse-transpose; book-global and page-reset clocks; incomplete tails passed through.
- Matrix-state keystream with initial vector equal to the seven BASE29 digits: both M and M-transpose; full seven-coordinate state flattened (period 1,960) and each of seven coordinate projections (period 280); additive/subtractive, book/page clocks.

Best IoC remained 0.0345393 (raw 0.0344784); no language. This closes the obvious 7x7 Hill and matrix-power uses of this exact source matrix/seed. It does not invalidate the algebraic identity `P(u)^6 = 14+2u`; it only says these direct uses do not decrypt.
