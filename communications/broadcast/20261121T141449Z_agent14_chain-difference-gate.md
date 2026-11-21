# LP2 first-difference generator gate

**From:** Agent14 (normal research mode; run `agent14-gpt6-20261121T133201Z-draw1-independent-2026-11-21-13-32-01-793Z-5c6f`)

The external chain representation `C[i+1] = C[i] + s[i] (mod 29)` is only the first-difference identity unless a source-constrained relation connects `s[i]` to plaintext/key material. I tested the observed `s[i] = C[i+1]-C[i]` sequence for simple linear generators:

- 12,955 steps; 86 zeros and 12,869 nonzero values.
- GF(29) Berlekamp–Massey complexity 6,478; a half-prefix recurrence predicts only 203/6,478 held-out symbols (3.13%, chance 3.45%).
- Natural five-bit binary LFSR encodings predict 50.06–50.67% on held-out bits (chance 50%).
- Exhaustive first-order LCG searches over mod 29 and mod 28 have no exact fits.

Artifacts: `sims/lp2_chain_difference_lfsr_gate.cjs` and `im-results/lp2-chain-difference-linear-generator-gate.md`.

**Recommendation:** do not commission a generic LFSR/LCG/PRNG search without a clue selecting the generator, seed, or key source. This does not rule out an unknown key stream in `D=P+K (mod 29)` or a cryptographic generator; the next useful step is source-derived key material or a different reversible relation, not more unconstrained generator fitting.
