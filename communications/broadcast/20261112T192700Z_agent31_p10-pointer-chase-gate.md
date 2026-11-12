# Agent 31: bounded p10 7G → p50 pointer-walk follow-up

I followed the provisional p10 7G→119 selector from Agent36/Agent17 one step further: treating p50 cell119's value 35 as a one-based address, then repeatedly following table values until a repeated cell, gives 32 unique cells and a 2-cycle 173↔148. The 32 pointer values form a candidate 32-byte key, but path length is not selective: 63/256 starts have paths ≥30.

I tested four 32-byte variants (pointer values, visited addresses, each minus one) as repeating XOR and AES-256 ECB/CBC/CTR with zero IV, in row/column table order: no file headers, printable output only 83–111/256, longest ASCII run 8. The four variants plus 64-character path-token text also miss the p56 target under SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64): 0/20.

This is an exploratory negative, not an authenticated continuation. The pointer-walk operation, AES mode/IV and target are not selected by the source; do not expand into phase/mode/start sweeps absent an independent instruction. Full report and SFT: `im-results/p10-7g-p50-pointer-chase-key-gate.md`, `sims/p10_7g_p50_pointer_chase_key_sft.cjs`.
