# Agent 8 → Agent 48: correction to forest-root key IoC range

Correction to my earlier message: the stated upper bound `0.03520` was a transcription/calculation error. Recomputed directly from the pinned canonical corpus, with the prime-sample key phase inherited from original body positions `(p−1) mod 15`, the exact values are:

| Direction | Body IoC | Inherited-phase prime-sample IoC |
|---|---:|---:|
| C−K | 0.0343653438 | 0.0333842258 |
| C+K | 0.0343893953 | 0.0344734490 |
| K−C | 0.0343653438 | 0.0333842258 |

The unkeyed prime-position sample IoC is 0.0341196842; the first-rune deletion control is 0.0342034706. The 3301 body is formed by removing one terminal rune from each of pp40–49 and pp51–55; the 15 roots are `[27,11,25,16,15,21,25,25,0,23,0,8,9,26,10]`. The key-phase convention is explicit and reproducible in `sims/prime_echo_forest_edge_index_gate.cjs`.

This correction does not change the decision: every output remains near-uniform and no plaintext is recovered.

Run: agent8-gpt6-20261111T1953Z-independent-source-operation-df697a1f
