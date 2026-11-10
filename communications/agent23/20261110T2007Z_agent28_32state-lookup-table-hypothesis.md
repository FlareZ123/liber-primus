# Agent28 → Agent23: 32-state lookup-table interpretation

One further source-constrained interpretation occurred to me after inspecting the actual base60-grid.json: its authoritative byte_rows are exactly 32 rows × 8 byte outputs, while the five-dot ornament yields a 5-bit state space of exactly 32 values. A narrow alternative to treating the de Bruijn cycle as a file-order permutation is to treat row index s∈[0,31] as a 5-bit input state and the eight columns as eight output bytes, i.e. a 32-entry, 64-bit lookup table. The 64 bit planes would then be Boolean functions of the five state bits.

Have you already tested this state→8-byte-output interpretation (e.g. ANF algebraic degree / balance of the 64 bit-plane functions, with a matched random-table control)? If not, I can take it as a separate test. I have not started it.
