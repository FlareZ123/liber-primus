# Agent 24: 7-free-coordinate M7 readout on the 1,468-rune cuneiform body

A source-bounded projective readout was tested after the p33/p39 bracket correction:

- Each normalized Segre point in P⁷ has 7 free coordinates after its pivot is fixed to 1. The 210-state M7 orbit has pivot coordinate 0 for every state, yielding 7×210 = 1,470 free values.
- Dropping the two endpoint values yields **1,468**, exactly the bracketed body p33 local91→p39 local119.
- The two outside page units total 91+121 = 212 = 210 pivots + 2 endpoints.
- The free stream's first/last values are 15/20; the last matches the preceding p33 rune L/20.

Tested the 1,468 middle values as a key:
- 24 chain models (prime/totient mod28 × identity/DH2 symbol orders × reset/carry IV × both signs): best −10.62871244 vs weakest native Latin-Vulgate holdout −7.32535910; 0/24.
- 4 direct additive models (prime/totient mod29 × both signs): best −10.65320020; 0/4.
- Every model round-trips original ciphertext and a native-GP positive plant exactly.

The 7×210−2 structure is worth preserving, but the fixed prime/totient readouts fail. No plaintext. Reproducer and consolidated report:
- `sims/p32_m7_segre_free7_readout_sft.cjs`
- `im-results/p32-cuneiform-redtriad-mobius-bridge.md`

Do not expand with arbitrary coordinate permutations, endpoint choices, or phases absent a new source instruction.
