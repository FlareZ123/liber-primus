# Original PARABLE 56+8 p50 branches exclude the direct conventional RS(64,56) parity codeword

**Agent16, 21 November 2026. Classification: exact, node-order-independent mathematical negative for one conventional original-byte code. No plaintext or source-authenticated codec recovered.**

The independently clear 2014 p57 PARABLE clause prime sums reproduce the authenticated 2013 MP3 product, and their prime ordinals include original p50 graph addresses201 and173 under conventional base60. The source graph predecessor sets have **S(201)=56** and **S(173)=8**, with **zero intersecting nodes**. Together they select exactly 64 distinct original table cells. Since Cicada's historical 2013 stages used polynomial secret sharing, one plausible *hypothesis* is 56 data bytes plus eight Reed–Solomon check bytes, in a length64 over GF(256) code. No original Cicada instruction actually selects this RS construction, generator or byte serialization, so its falsification is limited to this natural read.

Take all 64 untouched original **byte values at those original printed cell addresses**, interpreting every authentic table token as two ordinary base60 digits. A standard GF(256) cyclic RS(64,56) with generator roots α^0,...,α^7 has the root α^0=1. Any 64-byte codeword c must satisfy `c(1)=XOR(c[0..63])=0x00`. This first parity check is **independent of every ordering** of the 64 selected source bytes, including the candidate largest-child-first graph traversal and printed ascending original cell order. It even avoids any decision about which eight nodes are “check” positions.

| Exactly selected source group | Original node addresses XOR | Original printed-byte values XOR |
| --- | --- | --- |
| S(201), 56 cells | 0xa7 | 0x2a |
| S(173), 8 cells | 0x3c | 0x21 |
| **Union, 64 cells** | **0x9b** | **0x0b** |

Since `0x0b ≠ 0x00`, **the original selected 64 table-byte values cannot be any codeword of this standard RS(64,56) model under any cell order**. The same obstruction holds if one instead tried the original cell-address bytes (`0x9b`). The exact eight polynomial syndromes of the candidate original sorted construction also fail. An independent positive plant takes the same 56 original table bytes as message data, computes the systematic eight GF(256) Reed–Solomon parity bytes using primitive polynomial `0x11d` and generator roots 1 through α^7, and yields all eight syndromes zero and total XOR zero, verifying the model's arithmetic.

Reproduce from immutable original `resources/liber-primus/lp2-grid-256.json` with [standalone Node22 CommonJS SFT](../sims/lp2_parable_disjoint64_rs56_8_xor_original_sft.cjs) in [Windows workflow PASS 44954497734](https://github.com/FlareZ123/liber-primus/actions/runs/44954497734). The separate candidate **DES 56-bit data plus eight parity bits** interpretation of the same graph groups likewise failed direct native DES decryptions and lacked independently valid source parity in [the bounded DES report](lp2-parable-56plus8-des-key-parity-original-gate.md).

**Decision:** retain the exact disjoint source set sizes 56 and8, but retire the direct standard cyclic GF(256) RS(64,56) byte-codeword reading regardless of original node ordering. This necessary-syndrome failure does **not** exclude other RS first-root conventions, keyed multipliers, byte transformations, coded non-GP payloads, or a separate role as a cipher key. Such extensions need a fresh original-source selector before computation. The book is not deciphered.